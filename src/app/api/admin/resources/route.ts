import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: resources, error } = await supabaseAdmin
      .from('resources')
      .select('*, support_documents(*)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching resources:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: resources });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'tool', 'category', 'duration'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Insert new resource
    const { data: resource, error } = await supabaseAdmin
      .from('resources')
      .insert([
        {
          title: body.title,
          description: body.description,
          tool: body.tool,
          category: body.category,
          duration: body.duration,
          video_url: body.video_url || null,
          creator: body.creator || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating resource:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: resource });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
