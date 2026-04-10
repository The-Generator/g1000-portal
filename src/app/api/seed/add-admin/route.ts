import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Create in Supabase Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        role: 'admin',
        name,
      }
    });

    if (authError || !authUser?.user) {
      console.error('Failed to create auth user:', authError);
      return NextResponse.json({ error: 'Failed to create auth user' }, { status: 500 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 2. Create in users table
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authUser.user.id,
        email: email.toLowerCase(),
        name,
        role: 'admin',
        password_hash: passwordHash,
        has_set_password: true
      })
      .select()
      .single();

    if (userError) {
      // Cleanup
      await supabaseAdmin.auth.admin.deleteUser(authUser.user.id);
      console.error('Failed to create user record:', userError);
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Admin account created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Add admin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
