import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('logo') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
    }

    // Validate file size (max 2MB for base64 storage)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Maximum size is 2MB.' }, { status: 400 });
    }

    // Convert file to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Update existing profile with logo
      const { error: updateError } = await supabaseAdmin
        .from('business_owner_profiles')
        .update({
          logo_url: dataUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating profile with logo:', updateError);
        throw updateError;
      }
    } else {
      // Create new profile with logo
      const { error: insertError } = await supabaseAdmin
        .from('business_owner_profiles')
        .insert({
          user_id: user.id,
          logo_url: dataUrl,
          company_name: '',
          industry_tags: [],
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating profile with logo:', insertError);
        throw insertError;
      }
    }

    return NextResponse.json({ logoUrl: dataUrl });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return NextResponse.json(
      { error: 'Failed to upload logo. Please try again.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update profile to remove logo URL
    const { error } = await supabaseAdmin
      .from('business_owner_profiles')
      .update({
        logo_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) {
      console.error('Error removing logo:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
}