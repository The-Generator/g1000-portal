import { NextRequest, NextResponse } from 'next/server';
import { hashPassword } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, companyName, industryTags, websiteUrl, isApproved } = body;

    // Validate required fields
    if (!email || !password || !name || !companyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user record
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: email.toLowerCase(),
        name: name,
        role: 'owner',
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    // Create business owner authentication record
    const { error: authError } = await supabaseAdmin
      .from('business_owner_auth')
      .insert({
        user_id: userData.id,
        password_hash: hashedPassword,
      });

    if (authError) {
      console.error('Error creating auth record:', authError);
      // Cleanup: delete the user if auth creation fails
      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      return NextResponse.json(
        { error: 'Failed to create authentication record' },
        { status: 500 }
      );
    }

    // Create business owner profile
    const { error: profileError } = await supabaseAdmin
      .from('business_owner_profiles')
      .insert({
        user_id: userData.id,
        company_name: companyName,
        industry_tags: industryTags || [],
        website_url: websiteUrl || null,
        is_approved: isApproved !== undefined ? isApproved : false,
      });

    if (profileError) {
      console.error('Error creating business profile:', profileError);
      // Cleanup: delete the user and auth if profile creation fails
      await supabaseAdmin.from('business_owner_auth').delete().eq('user_id', userData.id);
      await supabaseAdmin.from('users').delete().eq('id', userData.id);
      return NextResponse.json(
        { error: 'Failed to create business profile' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Business owner created successfully',
        user: {
          id: userData.id,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          companyName: companyName,
          isApproved: isApproved
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 