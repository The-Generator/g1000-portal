import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';
import { sendEmail } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; appId: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    // Check if application is actually rejected
    if (application.status !== 'rejected') {
      return NextResponse.json({ error: 'Application is not rejected' }, { status: 400 });
    }

    // Update application status back to underReview and clear rejection fields
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'underReview',
        rejected_at: null,
        reflection_owner: null
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

    // Send email notification to student
    if (student && projectData && owner && ownerProfile) {
      try {
        await sendEmail({
          to: student.email,
          subject: `Application Update - ${projectData.title}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #006744;">Great News! Your Application is Back Under Review</h2>
              
              <p>Hi ${student.name},</p>
              
              <p>We have some exciting news! ${owner.name} from ${ownerProfile.company_name} has decided to reconsider your application for the project: <strong>${projectData.title}</strong>.</p>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
                <h3 style="margin-top: 0; color: #0369a1;">Application Status: Under Review</h3>
                <p style="margin-bottom: 0; color: #075985;">Your application is now being reviewed again. You may be contacted for an interview soon!</p>
              </div>
              
              <p>This is a great opportunity, so please keep an eye on your email for further updates. We'll notify you of any status changes or interview invitations.</p>
              
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/student/applications" style="background: #006744; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">View Application Status</a>
              
              <p>Best of luck!</p>
              
              <p>The G1000 Portal Team</p>
            </div>
          `
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ data: updatedApplication });
  } catch (error) {
    console.error('Error in POST /api/business/projects/[id]/applications/[appId]/undo-reject:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 