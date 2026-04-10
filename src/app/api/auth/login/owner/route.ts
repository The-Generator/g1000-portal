import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyPassword, signToken, createAuthResponse } from '@/lib/auth';
import { validateEmail } from '@/lib/utils';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        business_owner_profiles (*)
      `)
      .eq('email', email.toLowerCase())
      .eq('role', 'owner')
      .single();

    if (userError || !user) {
      console.log('User not found:', { email, userError });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Found user:', { id: user.id, email: user.email });

    // Get the hashed password from the business owner profile
    const { data: ownerAuth, error: authError } = await supabaseAdmin
      .from('business_owner_auth')
      .select('password_hash')
      .eq('user_id', user.id)
      .single();

    if (authError || !ownerAuth) {
      console.log('Auth record not found:', { userId: user.id, authError });
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    console.log('Found auth record:', { 
      userId: user.id, 
      hashLength: ownerAuth.password_hash?.length,
      hashStart: ownerAuth.password_hash?.substring(0, 20),
      providedPassword: password
    });

    // Verify password
    const isValidPassword = await verifyPassword(password, ownerAuth.password_hash);
    console.log('Password verification result:', { isValidPassword });
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is approved
    // Handle both array and object format from Supabase
    const ownerProfile = Array.isArray(user.business_owner_profiles) 
      ? user.business_owner_profiles[0] 
      : user.business_owner_profiles;
    
    console.log('Owner profile check:', { 
      profileExists: !!ownerProfile, 
      isApproved: ownerProfile?.is_approved,
      profileType: Array.isArray(user.business_owner_profiles) ? 'array' : 'object'
    });
    
    if (!ownerProfile?.is_approved) {
      return NextResponse.json(
        { error: 'Your account is awaiting approval. Please contact support.' },
        { status: 403 }
      );
    }

    // Generate JWT token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with auth cookie
    return createAuthResponse(token, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: ownerProfile,
    });
  } catch (error) {
    console.error('Owner login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 