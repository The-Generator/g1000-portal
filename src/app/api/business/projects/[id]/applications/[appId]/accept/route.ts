import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    console.log('Accept endpoint called with params:', params);
    const user = await getSessionUser();

    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;
    console.log('Request body:', body);

    // Verify the project belongs to this business owner and get application details
    console.log('Fetching application:', params.appId);
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('id', params.appId)
      .eq('project_id', params.id)
      .single();

    if (applicationError) {
      console.error('Error fetching application:', applicationError);
      return NextResponse.json({ error: 'Application not found', details: applicationError }, { status: 404 });
    }

    if (!application) {
      console.error('Application not found');
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    console.log('Application found:', application);

    // Verify project ownership
    console.log('Fetching project:', params.id);
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return NextResponse.json({ error: 'Project not found', details: projectError }, { status: 404 });
    }

    if (!project) {
      console.error('Project not found');
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (project.owner_id !== user.id) {
      console.error('Unauthorized: project owner mismatch', { projectOwnerId: project.owner_id, userId: user.id });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Project found and authorized:', project);

    // Start a transaction to accept the application and close the project
    // Update the accepted application
    console.log('Updating application status to accepted...');

    // Try with updated_at first, fallback to without it if it fails
    let acceptedApplication;
    let acceptError;

    try {
      const result = await supabaseAdmin
        .from('applications')
        .update({
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.appId)
        .select('*')
        .single();

      acceptedApplication = result.data;
      acceptError = result.error;
    } catch (err) {
      console.log('Failed with updated_at field, trying without it...');
      const result = await supabaseAdmin
        .from('applications')
        .update({
          status: 'accepted'
        })
        .eq('id', params.appId)
        .select('*')
        .single();

      acceptedApplication = result.data;
      acceptError = result.error;
    }

    if (acceptError) {
      console.error('Error accepting application:', acceptError);
      return NextResponse.json({ error: 'Failed to accept application', details: acceptError }, { status: 500 });
    }

    console.log('Application accepted successfully:', acceptedApplication);

    // Update the project status to closed (with fallback if column doesn't exist)
    try {
      console.log('Attempting to update project status to closed...');

      // Try with both status and updated_at
      let projectUpdateResult = await supabaseAdmin
        .from('projects')
        .update({
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', params.id);

      if (projectUpdateResult.error) {
        console.log('Failed with status and updated_at, trying just updated_at...');
        // Try with just updated_at if status field doesn't exist
        projectUpdateResult = await supabaseAdmin
          .from('projects')
          .update({
            updated_at: new Date().toISOString()
          })
          .eq('id', params.id);

        if (projectUpdateResult.error) {
          console.warn('Warning: Could not update project at all:', projectUpdateResult.error);
          // Continue without failing
        }
      }

      console.log('Project update completed');
    } catch (error) {
      console.error('Warning: Could not update project status:', error);
      // Continue without failing
    }

    // Get all other pending applications to reject them
    const { data: otherApplications, error: otherAppsError } = await supabaseAdmin
      .from('applications')
      .select('*')
      .eq('project_id', params.id)
      .neq('id', params.appId)
      .in('status', ['submitted', 'underReview', 'interviewScheduled']);

    if (otherAppsError) {
      console.error('Error fetching other applications:', otherAppsError);
    }

    // Reject all other pending applications
    if (otherApplications && otherApplications.length > 0) {
      const { error: rejectError } = await supabaseAdmin
        .from('applications')
        .update({
          status: 'rejected',
          rejected_at: new Date().toISOString(),
          reflection_owner: 'Another candidate was selected for this opportunity.'
        })
        .eq('project_id', params.id)
        .neq('id', params.appId)
        .in('status', ['submitted', 'underReview', 'interviewScheduled']);

      if (rejectError) {
        console.error('Error rejecting other applications:', rejectError);
      }
    }

    // Get data for email notifications
    const { data: acceptedStudent } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', application.student_id)
      .single();

    const { data: ownerProfile } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('company_name, user_id')
      .eq('user_id', project.owner_id)
      .single();

    const { data: owner } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', project.owner_id)
      .single();

    // Email functionality has been moved to the client side with manual send button
    console.log('Application accepted successfully. Email should be sent manually from the client.');

    return NextResponse.json({ data: acceptedApplication });
  } catch (error: any) {
    console.error('Error in POST /api/business/projects/[id]/applications/[appId]/accept:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error?.message || error,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}