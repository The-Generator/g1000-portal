import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { signToken, createAuthResponse } from '@/lib/auth';
import { validateBabsonEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    // Validate input
    if (!email || !validateBabsonEmail(email)) {
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

    console.log('Verifying OTP:', { email: email.toLowerCase(), code, type: 'email' });

    // Create a regular Supabase client for auth operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Verify the OTP code using Supabase Auth with regular client
    const verifyResult = await supabase.auth.verifyOtp({
      email: email.toLowerCase(),
      token: code,
      type: 'email'
    });
    
    const authData = verifyResult.data;
    const authError = verifyResult.error;

    console.log('OTP verification result:', { 
      success: !!authData?.user, 
      error: authError,
      userId: authData?.user?.id 
    });

    if (authError || !authData.user) {
      console.error('OTP verification failed:', {
        error: authError,
        message: authError?.message,
        status: authError?.status,
        code: authError?.code
      });
      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Get participant details
    const { data: participant, error: participantError } = await supabaseAdmin
      .from('g1000_participants')
      .select('email, name, major, year')
      .eq('email', email.toLowerCase())
      .single();

    if (participantError || !participant) {
      return NextResponse.json(
        { error: 'Participant not found' },
        { status: 404 }
      );
    }

    // Check if user already exists in our users table
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    let user = existingUser;

    // Create user if doesn't exist
    if (fetchError && fetchError.code === 'PGRST116') {
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: authData.user.id,
          email: email.toLowerCase(),
          name: participant.name,
          role: 'student',
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

      // Create student profile
      const { error: profileError } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          user_id: user.id,
          major: participant.major,
          year: participant.year,
          skills: [],
          proof_of_work_urls: [],
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    } else if (fetchError) {
      console.error('User fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    // Generate JWT token for our app
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Check if user has a password
    const hasPassword = user.has_set_password || false;

    // Create response with auth cookie
    const response = NextResponse.json({
      message: 'Verification successful',
      hasPassword,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
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
    console.error('Verify code error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 