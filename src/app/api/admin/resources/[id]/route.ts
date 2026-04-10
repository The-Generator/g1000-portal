import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data: resource, error } = await supabaseAdmin
      .from('resources')
      .select('*, support_documents(*)')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ data: resource });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data: resource, error } = await supabaseAdmin
      .from('resources')
      .update({
        title: body.title,
        description: body.description,
        tool: body.tool,
        category: body.category,
        duration: body.duration,
        video_url: body.video_url || null,
        creator: body.creator || null
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data: resource });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Delete all files in the bucket for this resource
    // The bucket folder is named after the resource ID
    const { data: files } = await supabaseAdmin.storage
      .from('resources')
      .list(`support_documents/${params.id}`);

    if (files && files.length > 0) {
      const filePaths = files.map(f => `support_documents/${params.id}/${f.name}`);
      await supabaseAdmin.storage.from('resources').remove(filePaths);
    }

    // 2. Delete the resource row (cascade deletes database docs automatically)
    const { error } = await supabaseAdmin
      .from('resources')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
