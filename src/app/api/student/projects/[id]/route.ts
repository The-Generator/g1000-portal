import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;

    // Get project details with all new tables
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        projects(
          id,
          title,
          description,
          owner_id,
          industry_tags,
          estimated_duration,
          compensation_type,
          compensation_value
        ),
        project_overviews(
          id,
          scope,
          deliverables,
          start_date,
          target_end_date,
          meeting_link,
          owner_contact_name,
          owner_contact_email,
          useful_links,
          updated_at
        ),
        project_reviews(
          id,
          reliability_rating,
          communication_rating,
          initiative_rating,
          quality_rating,
          impact_rating,
          review_note,
          deliverables_completed,
          created_at
        ),
        project_reflections(
          id,
          reflection_points,
          reflection_links,
          created_at
        )
      `)
      .eq('id', applicationId)
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get business owner info
    const { data: ownerProfile } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('user_id, company_name, logo_url')
      .eq('user_id', application.projects?.owner_id)
      .single();

    // Get business owner user info
    const { data: ownerUser } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', application.projects?.owner_id)
      .single();

    // Get all updates with comments
    const { data: updates } = await supabaseAdmin
      .from('project_updates')
      .select(`
        *,
        project_comments(
          id,
          user_id,
          comment,
          created_at,
          users(name, role)
        )
      `)
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    // Get student info
    const { data: studentUser } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', user.id)
      .single();

    const formattedProject = {
      id: application.id,
      title: application.projects?.title || 'Untitled Project',
      description: application.projects?.description,
      companyName: ownerProfile?.company_name || 'Unknown Company',
      companyLogoUrl: ownerProfile?.logo_url || null,
      status: application.project_reviews?.length > 0 ? 'completed' : 'active',

      // Overview section
      overview: {
        id: application.project_overviews?.[0]?.id,
        scope: application.project_overviews?.[0]?.scope || '',
        deliverables: application.project_overviews?.[0]?.deliverables || [],
        startDate: application.project_overviews?.[0]?.start_date,
        targetEndDate: application.project_overviews?.[0]?.target_end_date,
        meetingLink: application.project_overviews?.[0]?.meeting_link || '',
        ownerContactName: application.project_overviews?.[0]?.owner_contact_name || ownerUser?.name || '',
        ownerContactEmail: application.project_overviews?.[0]?.owner_contact_email || ownerUser?.email || '',
        usefulLinks: application.project_overviews?.[0]?.useful_links || [],
        updatedAt: application.project_overviews?.[0]?.updated_at
      },

      // Updates section
      updates: updates?.map(update => ({
        id: update.id,
        workedOn: update.worked_on,
        progressPercentage: update.progress_percentage,
        blockers: update.blockers,
        nextSteps: update.next_steps || [],
        links: update.links || [],
        createdAt: update.created_at,
        comments: update.project_comments?.map((comment: any) => ({
          id: comment.id,
          userId: comment.user_id,
          userName: comment.users?.name,
          userRole: comment.users?.role,
          comment: comment.comment,
          createdAt: comment.created_at
        })) || []
      })) || [],

      // Review section (if completed)
      review: application.project_reviews?.[0] ? {
        id: application.project_reviews[0].id,
        reliabilityRating: application.project_reviews[0].reliability_rating,
        communicationRating: application.project_reviews[0].communication_rating,
        initiativeRating: application.project_reviews[0].initiative_rating,
        qualityRating: application.project_reviews[0].quality_rating,
        impactRating: application.project_reviews[0].impact_rating,
        reviewNote: application.project_reviews[0].review_note,
        deliverablesCompleted: application.project_reviews[0].deliverables_completed,
        createdAt: application.project_reviews[0].created_at
      } : null,

      // Reflection section
      reflection: application.project_reflections?.[0] ? {
        id: application.project_reflections[0].id,
        reflectionPoints: application.project_reflections[0].reflection_points || [],
        reflectionLinks: application.project_reflections[0].reflection_links || [],
        createdAt: application.project_reflections[0].created_at
      } : null,

      // Additional info
      studentName: studentUser?.name,
      studentEmail: studentUser?.email,
      ownerId: application.projects?.owner_id,
      projectId: application.project_id
    };

    return NextResponse.json({ data: formattedProject });
  } catch (error) {
    console.error('Project detail fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}