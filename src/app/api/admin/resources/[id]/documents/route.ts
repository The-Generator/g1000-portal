import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;

    if (!file || !title || !type) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Convert file size to readable format
    const formatBytes = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };
    const fileSize = formatBytes(file.size);

    // Ensure path is clean (remove spaces from filename if needed)
    const rawFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const uploadPath = `support_documents/${params.id}/${rawFileName}`;

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('resources')
      .upload(uploadPath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('resources')
      .getPublicUrl(uploadPath);

    // 2. Insert into database
    const { data: docRecord, error: dbError } = await supabaseAdmin
      .from('support_documents')
      .insert([
        {
          resource_id: parseInt(params.id),
          title: title,
          file_type: type,
          file_size: fileSize,
          file_url: publicUrlData.publicUrl,
        }
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ data: docRecord });
  } catch (error) {
    console.error('Upload Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'docId is required' }, { status: 400 });
    }

    // 1. Get document details to know the file url/path
    const { data: doc } = await supabaseAdmin
      .from('support_documents')
      .select('file_url')
      .eq('id', docId)
      .single();

    if (doc?.file_url) {
      // Extract the filename from the URL
      const urlParts = doc.file_url.split(`support_documents/${params.id}/`);
      if (urlParts.length > 1) {
        const filePath = `support_documents/${params.id}/${urlParts[1]}`;
        // Remove from storage
        await supabaseAdmin.storage.from('resources').remove([filePath]);
      }
    }

    // 2. Delete the record
    const { error: deleteError } = await supabaseAdmin
      .from('support_documents')
      .delete()
      .eq('id', docId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
