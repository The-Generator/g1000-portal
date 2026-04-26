import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase';
import OnboardingClient from './OnboardingClient';

/**
 * /onboarding
 *
 * Shown to authenticated Supabase users who do not yet have a row in the
 * `users` table (no role). Server-side guards:
 *   - No session → /login
 *   - Already onboarded (users.role exists) → role-based dashboard
 * The client component renders the role-selection UI and posts to
 * /api/auth/onboarding.
 */
export const dynamic = 'force-dynamic';

export default async function OnboardingPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // If the user already has a role, send them to their dashboard.
  const { data: profile } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle();

  if (profile?.role === 'student') redirect('/student/dashboard');
  if (profile?.role === 'owner') redirect('/business/dashboard');
  if (profile?.role === 'admin') redirect('/admin');

  return (
    <OnboardingClient
      email={user.email ?? ''}
      defaultName={
        ((user.user_metadata?.name as string | undefined) ??
          (user.user_metadata?.full_name as string | undefined) ??
          '').trim()
      }
    />
  );
}
