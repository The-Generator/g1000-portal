import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase';

export function createClient() {
  // In Next.js 14, `cookies()` is synchronous — do NOT await it.
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'owner' | 'admin';
  created_at: string;
  updated_at: string;
};

/**
 * Returns the currently authenticated user joined with their `users` table
 * row, or `null` if the request has no session OR the user has not yet
 * completed onboarding (no `users` row exists).
 *
 * Replacement for the legacy `getUserFromRequest()` helper. Uses
 * `supabase.auth.getUser()` (network-verified) — never `getSession()`.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !profile) return null;

  return profile as SessionUser;
}
