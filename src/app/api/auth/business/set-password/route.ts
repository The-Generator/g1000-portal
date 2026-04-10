import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    console.log('Setting password for business owner:', email);

    // Get the user from Supabase Auth (they should exist after OTP verification)
    const { data: authUser, error: getUserError } = await supabaseAdmin.auth.admin.listUsers({
      filter: `email.eq.${email.toLowerCase()}`
    });

    if (getUserError || !authUser?.users?.length) {
      console.error('User not found in auth:', getUserError);

      // If user doesn't exist in auth, they need to verify email first
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.' },
        { status: 404 }
      );
    }

    const userId = authUser.users[0].id;
    console.log('Found user in auth, updating password for:', userId);

    // Update the user's password in Supabase Auth
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (updateError) {
      console.error('Failed to update password:', updateError);
      // Try alternative method if update fails
      try {
        // Alternative: Use the Auth API directly
        const { error: altError } = await supabaseAdmin.auth.admin.updateUser(
          userId,
          { password: password }
        );

        if (altError) {
          throw altError;
        }
      } catch (altErr) {
        console.error('Alternative password update also failed:', altErr);
        return NextResponse.json(
          { error: 'Failed to set password. Please try again.' },
          { status: 500 }
        );
      }
    }

    // Update the has_set_password flag in our users table
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .update({ has_set_password: true })
      .eq('email', email.toLowerCase())
      .eq('role', 'owner');

    if (dbError) {
      console.error('Failed to update password flag:', dbError);
      // Continue anyway - password is set in Auth
    }

    console.log('Password set successfully for:', email);

    return NextResponse.json({
      message: 'Password created successfully!'
    });

  } catch (error) {
    console.error('Set password error:', error);
    return NextResponse.json(
      { error: 'Failed to set password' },
      { status: 500 }
    );
  }
}