import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest, verifyPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from cookie/session
    const authUser = await getUserFromRequest(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in first.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All password fields are required' },
        { status: 400 }
      );
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Don't allow same password
    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: 'New password must be different from current password' },
        { status: 400 }
      );
    }

    // Handle business owners
    if (authUser.role === 'owner') {
      // Get current password hash from business_owner_auth
      const { data: ownerAuth, error: authError } = await supabaseAdmin
        .from('business_owner_auth')
        .select('password_hash')
        .eq('user_id', authUser.id)
        .single();

      if (authError || !ownerAuth) {
        console.error('Failed to get auth record:', authError);
        return NextResponse.json(
          { error: 'Failed to verify current password' },
          { status: 500 }
        );
      }

      // Verify current password
      const isValidPassword = await verifyPassword(currentPassword, ownerAuth.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash the new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password in business_owner_auth table
      const { error: updateError } = await supabaseAdmin
        .from('business_owner_auth')
        .update({
          password_hash: newPasswordHash,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authUser.id);

      if (updateError) {
        console.error('Failed to update password:', updateError);
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        );
      }

      // Update has_set_password flag in users table
      await supabaseAdmin
        .from('users')
        .update({
          has_set_password: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

    } else if (authUser.role === 'student') {
      // Handle students (they use password_hash in users table)
      const { data: user, error: userError } = await supabaseAdmin
        .from('users')
        .select('password_hash')
        .eq('id', authUser.id)
        .single();

      if (userError || !user || !user.password_hash) {
        return NextResponse.json(
          { error: 'Failed to verify current password' },
          { status: 500 }
        );
      }

      // Verify current password
      const isValidPassword = await verifyPassword(currentPassword, user.password_hash);

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 401 }
        );
      }

      // Hash the new password
      const newPasswordHash = await bcrypt.hash(newPassword, 10);

      // Update password in users table
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          password_hash: newPasswordHash,
          has_set_password: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id);

      if (updateError) {
        console.error('Failed to update password:', updateError);
        return NextResponse.json(
          { error: 'Failed to update password' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid user role' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}