import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { toISOString } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { meetingDateTime, meetingLink, message } = await request.json();

    if (!meetingDateTime) {
      return NextResponse.json({ error: 'Meeting date and time are required' }, { status: 400 });
    }

    // Verify the project belongs to this business owner and get application details
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', params.appId)
      .eq('project_id', params.id)
      .single();

    if (applicationError || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify project ownership
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('owner_id')
      .eq('id', params.id)
      .single();

    if (projectError || !project || project.owner_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update application status and meeting details
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'interviewScheduled',
        meeting_date_time: toISOString(meetingDateTime),
        meeting_link: meetingLink || null,
        invited_at: new Date().toISOString()
      })
      .eq('id', params.appId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    // Email functionality has been moved to the client side with manual send button
    console.log('Interview scheduled successfully. Email should be sent manually from the client.');

    return NextResponse.json({ data: updatedApplication });
  } catch (error) {
    console.error('Error in POST /api/business/projects/[id]/applications/[appId]/invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 