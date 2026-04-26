import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

type OnboardingBody =
  | {
      role: 'student';
    }
  | {
      role: 'owner';
      companyName: string;
      contactName?: string;
    };

/**
 * POST /api/auth/onboarding
 *
 * Creates the `users` row (and matching profile row) for a freshly-authenticated
 * Supabase user who has not yet picked a role. Uses `supabaseAdmin` (service
 * role) to bypass RLS while remaining safe — the auth check uses the
 * server-side Supabase SSR client (network-verified `getUser()`), and we
 * refuse to overwrite an existing `users` row (idempotent / dup-safe).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify the Supabase Auth session (network-verified, never trust cookies alone).
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Reject duplicate onboarding — if a `users` row already exists, the
    //    user has already been onboarded and must use their existing role.
    const { data: existing } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'Onboarding already complete', role: existing.role },
        { status: 409 }
      );
    }

    // 3. Parse request body.
    let body: OnboardingBody;
    try {
      body = (await request.json()) as OnboardingBody;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    if (!body || (body.role !== 'student' && body.role !== 'owner')) {
      return NextResponse.json(
        { error: 'role must be "student" or "owner"' },
        { status: 400 }
      );
    }

    // Derive a usable display name. Supabase user_metadata.name is set during
    // email/password registration; full_name is set by Google OAuth. Fall
    // back to the local-part of the email so we never insert empty strings.
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const metaName =
      (typeof meta.name === 'string' && meta.name.trim()) ||
      (typeof meta.full_name === 'string' && meta.full_name.trim()) ||
      '';

    const email = user.email ?? '';
    if (!email) {
      return NextResponse.json(
        { error: 'Auth user is missing an email address' },
        { status: 400 }
      );
    }

    if (body.role === 'student') {
      // 4a. Student onboarding — enforce @babson.edu policy.
      if (!email.toLowerCase().endsWith('@babson.edu')) {
        return NextResponse.json(
          {
            error:
              'Only @babson.edu email addresses can register as students',
          },
          { status: 403 }
        );
      }

      const studentName = metaName || email.split('@')[0];

      const { error: userInsertError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user.id,
          email,
          name: studentName,
          role: 'student',
        });

      if (userInsertError) {
        console.error('Failed to insert student users row:', userInsertError);
        return NextResponse.json(
          { error: 'Failed to create user record' },
          { status: 500 }
        );
      }

      const { error: profileError } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          user_id: user.id,
          major: '',
          year: '',
          skills: [],
          proof_of_work_urls: [],
          available_days: [],
          availability_slots: [],
          timezone: 'America/New_York',
        });

      if (profileError) {
        // Roll back the users row so onboarding can be retried.
        await supabaseAdmin.from('users').delete().eq('id', user.id);
        console.error('Failed to insert student_profiles row:', profileError);
        return NextResponse.json(
          { error: 'Failed to create student profile' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        data: { role: 'student', redirect: '/student/dashboard' },
      });
    }

    // 4b. Business owner onboarding.
    const companyName = (body.companyName ?? '').trim();
    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    const ownerName =
      (body.contactName ?? '').trim() || metaName || email.split('@')[0];

    const { error: userInsertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: user.id,
        email,
        name: ownerName,
        role: 'owner',
      });

    if (userInsertError) {
      console.error('Failed to insert owner users row:', userInsertError);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    const { error: profileError } = await supabaseAdmin
      .from('business_owner_profiles')
      .insert({
        user_id: user.id,
        company_name: companyName,
        industry_tags: [],
        is_approved: true,
      });

    if (profileError) {
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      console.error('Failed to insert business_owner_profiles row:', profileError);
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data: { role: 'owner', redirect: '/business/dashboard' },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
