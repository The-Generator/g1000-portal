import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { signToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validate input
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!code || !/^\d{6}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    console.log('Verifying OTP for business owner:', { email: email.toLowerCase(), code });

    // Create a regular Supabase client for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the OTP code using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: code,
      type: 'email'
    });

    console.log('OTP verification result:', {
      success: !!authData?.user,
      error: authError,
      userId: authData?.user?.id
    });

    if (authError || !authData.user) {
      console.error('OTP verification failed:', authError);
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Check if user exists in our users table
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        business_owner_profiles (*)
      `)
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    let user = existingUser;

    if (fetchError && fetchError.code === 'PGRST116') {
      const emailPrefix = email.split('@')[0];
      const defaultName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          name: defaultName,
          role: 'owner',
        })
        .select()
        .single();

      if (createError) {
        console.error('User creation error:', createError);
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        );
      }

      user = newUser;

      // Create owner profile with pending state
      const { error: profileError } = await supabaseAdmin
        .from('business_owner_profiles')
        .insert({
          user_id: user.id,
          company_name: defaultName,
          business_name: defaultName,
          contact_name: defaultName,
          industry_tags: [],
          is_approved: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      user.business_owner_profiles = [{ is_approved: false, company_name: defaultName, business_name: defaultName }];
    } else if (fetchError) {
      console.error('Business owner fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Check if business is approved
    const ownerProfile = Array.isArray(user.business_owner_profiles)
      ? user.business_owner_profiles[0]
      : user.business_owner_profiles;

    if (!ownerProfile?.is_approved) {
      return NextResponse.json(
        { error: 'Your business account is awaiting approval. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate JWT token for our app
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Check if user has set a password
    const hasPassword = user.has_set_password || false;

    // Create response with auth cookie
    const response = NextResponse.json({
      message: 'Verification successful',
      hasPassword,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        profile: ownerProfile
      }
    });

    // Set auth cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Also set Supabase Auth cookies if we have a session
    if (authData.session) {
      response.cookies.set('sb-access-token', authData.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Business verify code error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}