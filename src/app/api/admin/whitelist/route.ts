import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: whitelist, error } = await supabaseAdmin
      .from('approved_business_emails')
      .select('*')
      .order('email', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ data: whitelist });
  } catch (error) {
    console.error('Fetch whitelist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('approved_business_emails')
      .upsert({ email: email.toLowerCase(), is_active: true }, { onConflict: 'email' })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data, message: 'Email added to whitelist' });
  } catch (error) {
    console.error('Add to whitelist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('approved_business_emails')
      .delete()
      .eq('email', email.toLowerCase());

    if (error) throw error;

    return NextResponse.json({ message: 'Email removed from whitelist' });
  } catch (error) {
    console.error('Delete from whitelist error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
