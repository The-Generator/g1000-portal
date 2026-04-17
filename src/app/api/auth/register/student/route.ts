import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Enforce @babson.edu only
    if (!normalizedEmail.endsWith('@babson.edu')) {
      return NextResponse.json(
        { error: 'Only @babson.edu email addresses are allowed' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check if user exists in our users table (fast path)
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth with auto-confirmed email
    const { data: newAuthUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          role: 'student',
        },
      });

    if (createAuthError || !newAuthUser.user) {
      console.error('Error creating auth user:', createAuthError);
      // Detect duplicate email error from Supabase Auth and return 409
      const errMsg = (createAuthError?.message || '').toLowerCase();
      const errCode = (createAuthError as { code?: string } | null)?.code || '';
      const errStatus = (createAuthError as { status?: number } | null)?.status;
      const isDuplicate =
        errCode === 'email_exists' ||
        errStatus === 422 ||
        errMsg.includes('already been registered') ||
        errMsg.includes('already registered') ||
        errMsg.includes('already exists') ||
        errMsg.includes('duplicate');
      if (isDuplicate) {
        return NextResponse.json(
          { error: 'A user with this email already exists' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to create authentication account' },
        { status: 500 }
      );
    }

    // Create user record in our users table with the same ID as auth user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthUser.user.id,
        email: normalizedEmail,
        name,
        role: 'student',
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('Error creating user:', userError);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create student profile with empty defaults
    const { error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .insert({
        user_id: userData.id,
        major: '',
        year: '',
        skills: [],
        proof_of_work_urls: [],
      });

    if (profileError) {
      console.error('Error creating student profile:', profileError);
      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create student profile' },
        { status: 500 }
      );
    }

    // Sign JWT and set auth cookie
    const token = await signToken({
      userId: userData.id,
      email: userData.email,
      role: 'student',
    });

    const response = NextResponse.json(
      {
        message: 'Student account created successfully.',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Student registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
