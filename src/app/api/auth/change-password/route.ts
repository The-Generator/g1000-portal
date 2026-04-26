import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

/**
 * POST /api/auth/change-password
 *
 * Changes the authenticated user's password via Supabase Auth.
 *
 * Body: { currentPassword: string, newPassword: string }
 *
 * Behaviour:
 *   1. Verify a Supabase session exists via `auth.getUser()` (network-verified).
 *   2. Re-authenticate using `signInWithPassword` against the user's current
 *      email + provided `currentPassword` to confirm the user knows their
 *      existing password before allowing a change. This protects against
 *      session hijacking scenarios where an attacker has cookies but doesn't
 *      know the password.
 *   3. Update the password with `supabase.auth.updateUser({ password })`.
 *
 * Returns 200 with `{ success: true }` on success, 401 if unauthenticated,
 * 400 for validation errors, and propagates Supabase error messages otherwise.
 */
export async function POST(request: NextRequest) {
  let body: ChangePasswordBody;
  try {
    body = (await request.json()) as ChangePasswordBody;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = body;

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'currentPassword and newPassword are required' },
      { status: 400 }
    );
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: 'New password must be at least 8 characters' },
      { status: 400 }
    );
  }

  if (currentPassword === newPassword) {
    return NextResponse.json(
      { error: 'New password must be different from current password' },
      { status: 400 }
    );
  }

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Re-verify the current password by attempting a sign-in. This refreshes
  // the session cookies but does not change identity (same user).
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) {
    return NextResponse.json(
      { error: 'Current password is incorrect' },
      { status: 400 }
    );
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message || 'Failed to change password' },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
