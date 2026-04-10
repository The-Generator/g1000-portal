import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, name, major, year } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('g1000_participants')
      .upsert(
        {
          email: email.toLowerCase(),
          name,
          major: major || 'Undeclared',
          year: year || '2025',
        },
        { onConflict: 'email' }
      )
      .select()
      .single();

    if (error) {
      console.error('Failed to add participant:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `✅ Successfully added ${name} (${email}) to g1000_participants`,
      participant: data,
    });
  } catch (error: any) {
    console.error('Add participant error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
