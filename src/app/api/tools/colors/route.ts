import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: colors, error } = await supabaseAdmin
      .from('tool_colors')
      .select('*');

    if (error && error.code === '42P01') {
      // Table doesn't exist yet, return empty gracefully
      return NextResponse.json({ data: [] });
    }

    if (error) throw error;
    
    return NextResponse.json({ data: colors || [] });
  } catch (error) {
    console.error('Fetch tool colors error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
