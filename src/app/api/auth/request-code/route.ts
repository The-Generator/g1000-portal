import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateBabsonEmail } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('🔍 Request code for email:', email);

    // Validate email format
    if (!email || !validateBabsonEmail(email)) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Please use your @babson.edu email address' },
        { status: 400 }
      );
    }

    const emailPrefix = email.split('@')[0];
    const defaultName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1);

    // Simply use signInWithOtp with shouldCreateUser: true
    // This will create the user if they don't exist and send OTP in one step
    console.log('📧 Sending OTP code via Supabase Auth...');

    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        shouldCreateUser: true, // Let Supabase handle user creation
        data: {
          name: defaultName,
          major: '',
          year: '',
          role: 'student'
        }
      }
    });

    if (error) {
      console.error('❌ Supabase OTP error:', error);

      // Check if it's a rate limit error
      if (error.message?.includes('rate limit') || error.message?.includes('too many') || error.message?.includes('Email rate limit exceeded')) {
        return NextResponse.json(
          { error: 'Too many attempts. Please wait 60 seconds and try again.' },
          { status: 429 }
        );
      }

      // Check if it's a confirmation email being sent instead
      if (error.message?.includes('confirmation') || error.message?.includes('confirm')) {
        return NextResponse.json(
          { error: 'Please check your email for a verification link. If you need a code instead, please wait a moment and try again.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message || 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    console.log('📧 OTP email sent successfully via Supabase Auth');

    return NextResponse.json(
      { message: 'Verification code sent to your email!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 Request code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
} 