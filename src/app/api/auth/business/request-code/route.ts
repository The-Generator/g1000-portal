import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    console.log('🔍 Business owner request code for email:', email);

    // Validate email format
    if (!email || !email.includes('@')) {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Check if email exists in business_owner_profiles via users table
    console.log('🔍 Checking for business owner:', email.toLowerCase());
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        business_owner_profiles (
          user_id,
          company_name,
          business_name,
          is_approved
        )
      `)
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (userError || !user) {
      console.log('❌ Business owner not found:', email);
      return NextResponse.json(
        { error: 'Email not found. Please make sure you are registered as a business owner.' },
        { status: 404 }
      );
    }

    // Check if business is approved
    const ownerProfile = Array.isArray(user.business_owner_profiles)
      ? user.business_owner_profiles[0]
      : user.business_owner_profiles;

    if (!ownerProfile?.is_approved) {
      console.log('❌ Business not approved:', email);
      return NextResponse.json(
        { error: 'Your business account is awaiting approval. Please contact support.' },
        { status: 403 }
      );
    }

    console.log('✅ Found approved business owner:', user.name);

    // Check if user exists in Supabase Auth
    let authUserExists = false;
    try {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserByEmail(email.toLowerCase());
      if (authUser?.user) {
        authUserExists = true;
        console.log('👤 User already exists in auth:', authUser.user.id);
      }
    } catch (error) {
      console.log('👤 User does not exist yet in auth');
    }

    // If user doesn't exist in Auth, create them with auto-confirmed email
    if (!authUserExists) {
      console.log('🔨 Creating new user in Supabase Auth with auto-confirmed email...');
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email.toLowerCase(),
        email_confirm: true, // Auto-confirm to skip confirmation email
        user_metadata: {
          name: user.name,
          role: 'owner',
          company_name: ownerProfile.company_name || ownerProfile.business_name,
          user_id: user.id
        }
      });

      if (createError && !createError.message?.includes('already been registered')) {
        console.error('❌ Failed to create auth user:', createError);
        return NextResponse.json(
          { error: 'Failed to create authentication account. Please try again.' },
          { status: 500 }
        );
      }

      if (newUser?.user) {
        console.log('✅ Auth user created successfully:', newUser.user.id);
        authUserExists = true;
      }
    }

    // Send OTP email - user exists and is confirmed
    console.log('📧 Sending OTP code to business owner...');
    const { data, error } = await supabaseAdmin.auth.signInWithOtp({
      email: email.toLowerCase(),
      options: {
        shouldCreateUser: false, // User already exists
      }
    });

    if (error) {
      console.error('❌ Supabase OTP error:', error);
      return NextResponse.json(
        { error: 'Failed to send verification code. Please try again.' },
        { status: 500 }
      );
    }

    console.log('📧 OTP email sent successfully to business owner');

    return NextResponse.json(
      {
        message: 'Verification code sent to your email!',
        hasPassword: false // Business owners won't need to set a password
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('💥 Business request code error:', error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}