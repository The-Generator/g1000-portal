import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if business owner exists and has password
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select(`
        email,
        has_set_password,
        business_owner_profiles (
          is_approved
        )
      `)
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (error || !user) {
      // User doesn't exist in our database, but might be a valid business owner
      // Return exists: false so the frontend knows this is a potential new user
      return NextResponse.json(
        { exists: false, hasPassword: false, isApproved: false },
        { status: 200 }
      );
    }

    const profile = Array.isArray(user.business_owner_profiles)
      ? user.business_owner_profiles[0]
      : user.business_owner_profiles;

    return NextResponse.json({
      exists: true,
      hasPassword: user.has_set_password || false,
      isApproved: profile?.is_approved || false
    });

  } catch (error) {
    console.error('Check business user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    );
  }
}