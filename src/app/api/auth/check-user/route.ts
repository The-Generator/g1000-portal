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
    
    // Check if user exists and has password
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('email, has_set_password')
      .eq('email', email.toLowerCase())
      .eq('role', 'student')
      .single();

    if (error || !user) {
      return NextResponse.json(
        { exists: false, hasPassword: false },
        { status: 200 }
      );
    }

    return NextResponse.json({
      exists: true,
      hasPassword: user.has_set_password || false
    });

  } catch (error) {
    console.error('Check user error:', error);
    return NextResponse.json(
      { error: 'Failed to check user status' },
      { status: 500 }
    );
  }
}