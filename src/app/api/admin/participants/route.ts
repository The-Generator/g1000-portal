import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET — list all participants
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabaseAdmin
      .from('g1000_participants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Participants fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST — add a participant
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, name, major, year } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('g1000_participants')
      .insert([{ email: email.toLowerCase().trim(), name: name || null, major: major || null, year: year || null }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'This email is already on the student whitelist.' }, { status: 409 });
      }
      throw error;
    }

    return NextResponse.json({ data, message: `${email} added to student whitelist.` }, { status: 201 });
  } catch (error) {
    console.error('Add participant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE — remove a participant by email
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'email query param is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('g1000_participants')
      .delete()
      .eq('email', email.toLowerCase());

    if (error) throw error;

    return NextResponse.json({ message: `${email} removed from student whitelist.` });
  } catch (error) {
    console.error('Delete participant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
