import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'business_owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;
    const body = await request.json();

    // Verify the business owner owns this project
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        projects!inner(
          owner_id
        )
      `)
      .eq('id', applicationId)
      .eq('projects.owner_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check if overview exists
    const { data: existingOverview } = await supabaseAdmin
      .from('project_overviews')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    const overviewData = {
      scope: body.scope || null,
      deliverables: body.deliverables || [],
      start_date: body.startDate || null,
      target_end_date: body.targetEndDate || null,
      meeting_link: body.meetingLink || null,
      owner_contact_name: body.ownerContactName || user.name || null,
      owner_contact_email: body.ownerContactEmail || user.email || null,
      useful_links: body.usefulLinks?.map((link: any) => ({
        title: link.title || '',
        url: link.url || ''
      })) || [],
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingOverview) {
      // Update existing overview
      const { data, error } = await supabaseAdmin
        .from('project_overviews')
        .update(overviewData)
        .eq('id', existingOverview.id)
        .select()
        .single();

      result = { data, error };
    } else {
      // Create new overview
      const { data, error } = await supabaseAdmin
        .from('project_overviews')
        .insert({
          application_id: applicationId,
          ...overviewData
        })
        .select()
        .single();

      result = { data, error };
    }

    if (result.error) {
      console.error('Overview update error:', result.error);
      return NextResponse.json({ error: 'Failed to update overview' }, { status: 500 });
    }

    return NextResponse.json({
      data: result.data,
      message: 'Overview updated successfully'
    });
  } catch (error) {
    console.error('Overview update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}