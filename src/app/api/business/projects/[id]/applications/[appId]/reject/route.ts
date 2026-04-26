import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

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

    // Update application status
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'rejected',
        rejected_at: new Date().toISOString(),
        reflection_owner: reason || null
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
    console.log('Application rejected. Email should be sent manually from the client.');

    return NextResponse.json({ data: updatedApplication });
  } catch (error) {
    console.error('Error in POST /api/business/projects/[id]/applications/[appId]/reject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 