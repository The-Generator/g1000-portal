import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { tool_name, color_hex } = await request.json();

    if (!tool_name || !color_hex) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('tool_colors')
      .upsert([{ tool_name, color_hex }], { onConflict: 'tool_name' })
      .select()
      .single();

    if (error) {
      console.error('Error saving tool color:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
