import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

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

    console.log('Business password login attempt for:', email);

    // Try to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase(),
      password: password
    });

    if (authError || !authData.user) {
      console.error('Password authentication failed:', authError);
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get business owner details from our database
    console.log('Looking for business owner in database:', email.toLowerCase());

    // First get the user
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (userError) {
      console.error('Database error finding business owner:', {
        error: userError,
        email: email.toLowerCase(),
        code: userError.code,
        message: userError.message
      });

      // If user not found in our DB but exists in Auth, there's a sync issue
      if (userError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Account sync error. Please contact support.' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Database error. Please try again.' },
        { status: 500 }
      );
    }

    if (!user) {
      console.error('Business owner not found in database');
      return NextResponse.json(
        { error: 'Business account not found' },
        { status: 404 }
      );
    }

    console.log('Found business owner:', { id: user.id, email: user.email });

    // Get the business profile separately
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Continue anyway, we'll check if profile exists
    }

    const ownerProfile = profileData;

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

    console.log('Business owner logged in successfully:', user.email);

    // Create response with auth cookie
    const response = NextResponse.json({
      message: 'Login successful',
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
    console.error('Business password login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}