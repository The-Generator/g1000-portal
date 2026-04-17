import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken } from '@/lib/auth';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, businessName, contactName, industry, website } = body;

    // Validate required fields
    if (!email || !password || !businessName || !contactName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists in Supabase Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingAuthUser = authUsers?.users?.find(
      (u) => u.email?.toLowerCase() === normalizedEmail
    );
    if (existingAuthUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Check if user exists in our users table
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Supabase Auth with auto-confirmed email
    const { data: newAuthUser, error: createAuthError } =
      await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: {
          name: contactName,
          role: 'owner',
          company_name: businessName,
        },
      });

    if (createAuthError || !newAuthUser.user) {
      console.error('Error creating auth user:', createAuthError);
      return NextResponse.json(
        { error: 'Failed to create authentication account' },
        { status: 500 }
      );
    }

    // Create user record in our users table with the same ID as auth user
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newAuthUser.user.id,
        email: normalizedEmail,
        name: contactName,
        role: 'owner',
      })
      .select()
      .single();

    if (userError || !userData) {
      console.error('Error creating user:', userError);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create business owner profile (auto-approved)
    const { error: profileError } = await supabaseAdmin
      .from('business_owner_profiles')
      .insert({
        user_id: userData.id,
        company_name: businessName,
        business_name: businessName,
        contact_name: contactName,
        industry: industry || null,
        industry_tags: industry ? [industry] : [],
        website_url: website || null,
        is_approved: true,
      });

    if (profileError) {
      console.error('Error creating business profile:', profileError);
      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      await supabaseAdmin.auth.admin.deleteUser(newAuthUser.user.id);
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      );
    }

    // Sign JWT and set auth cookie
    const token = await signToken({
      userId: userData.id,
      email: userData.email,
      role: 'owner',
    });

    const response = NextResponse.json(
      {
        message: 'Business account created successfully.',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          is_approved: true,
        },
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
