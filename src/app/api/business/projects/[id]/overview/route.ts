import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;
    const body = await request.json();

    // Validate the business owner owns this project
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

    let overviewData;
    let overviewError;

    const overviewFields = {
      scope: body.scope || '',
      deliverables: body.deliverables || [],
      start_date: body.startDate || null,
      target_end_date: body.targetEndDate || null,
      meeting_link: body.meetingLink || '',
      owner_contact_name: body.ownerContactName || '',
      owner_contact_email: body.ownerContactEmail || '',
      useful_links: body.usefulLinks?.map((link: any) => ({
        title: link.title || '',
        url: link.url || ''
      })) || [],
      updated_at: new Date().toISOString()
    };

    if (existingOverview) {
      // Update existing overview
      const result = await supabaseAdmin
        .from('project_overviews')
        .update(overviewFields)
        .eq('id', existingOverview.id)
        .select()
        .single();

      overviewData = result.data;
      overviewError = result.error;
    } else {
      // Create new overview
      const result = await supabaseAdmin
        .from('project_overviews')
        .insert({
          application_id: applicationId,
          ...overviewFields
        })
        .select()
        .single();

      overviewData = result.data;
      overviewError = result.error;
    }

    if (overviewError) {
      console.error('Overview save error:', overviewError);
      return NextResponse.json({ error: 'Failed to save overview' }, { status: 500 });
    }

    return NextResponse.json({
      data: overviewData,
      message: 'Overview saved successfully'
    });
  } catch (error) {
    console.error('Overview update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}