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

    // Check if application has a scheduled interview
    if (application.status !== 'interviewScheduled') {
      return NextResponse.json({ error: 'No interview scheduled for this application' }, { status: 400 });
    }

    // Store the old meeting time for email notification
    const oldMeetingDateTime = application.meeting_date_time;

    // Update application with new meeting time
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        meeting_date_time: toISOString(meetingDateTime),
        invited_at: new Date().toISOString() // Update the invitation timestamp
      })
      .eq('id', params.appId)
      .select('*')
      .single();

    if (updateError) {
      console.error('Error updating application:', updateError);
      return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
    }

    // Get additional data for email
    const { data: student } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', application.student_id)
      .single();

    const { data: projectData } = await supabaseAdmin
      .from('projects')
      .select('title, owner_id')
      .eq('id', params.id)
      .single();

    const { data: ownerProfile } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('company_name, user_id')
      .eq('user_id', projectData?.owner_id)
      .single();

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('name')
      .eq('id', projectData?.owner_id)
      .single();

    // Email functionality has been moved to the client side with manual send button
    console.log('Interview rescheduled. Email should be sent manually from the client.');

    return NextResponse.json({ data: updatedApplication });
  } catch (error) {
    console.error('Error in POST /api/business/projects/[id]/applications/[appId]/reschedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 