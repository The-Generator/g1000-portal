import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select('*, support_documents(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ data: resources });
  } catch (error) {
    console.error('Fetch resources error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
