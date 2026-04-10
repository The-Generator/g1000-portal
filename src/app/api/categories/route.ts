import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: categories, error } = await supabaseAdmin
      .from('resource_categories')
      .select('name');

    if (error && error.code === '42P01') {
      // Table doesn't exist gracefully return empty
      return NextResponse.json({ data: [] });
    }

    if (error) throw error;
    
    return NextResponse.json({ data: categories || [] });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
