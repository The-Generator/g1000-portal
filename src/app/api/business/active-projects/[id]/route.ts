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

    if (!user || user.role !== 'business_owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;

    // Get project details
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        projects!inner(
          id,
          title,
          description,
          owner_id,
          industry_tags,
          estimated_duration,
          compensation_type,
          compensation_value
        ),
        users!applications_student_id_fkey(
          id,
          name,
          email
        ),
        student_profiles(
          profile_photo_url,
          major,
          year,
          skills,
          linkedin_url
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
      .eq('projects.owner_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

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

    // Get business owner profile
    const { data: ownerProfile } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('company_name, logo_url')
      .eq('user_id', user.id)
      .single();

    const formattedProject = {
      id: application.id,
      title: application.projects?.title || 'Untitled Project',
      description: application.projects?.description,
      companyName: ownerProfile?.company_name || 'Unknown Company',
      companyLogoUrl: ownerProfile?.logo_url || null,
      status: application.project_reviews?.length > 0 ? 'completed' : 'active',

      // Student info
      student: {
        id: application.student_id,
        name: application.users?.name,
        email: application.users?.email,
        photoUrl: application.student_profiles?.[0]?.profile_photo_url,
        major: application.student_profiles?.[0]?.major,
        year: application.student_profiles?.[0]?.year,
        skills: application.student_profiles?.[0]?.skills || [],
        linkedinUrl: application.student_profiles?.[0]?.linkedin_url
      },

      // Overview section
      overview: {
        id: application.project_overviews?.[0]?.id,
        scope: application.project_overviews?.[0]?.scope || '',
        deliverables: application.project_overviews?.[0]?.deliverables || [],
        startDate: application.project_overviews?.[0]?.start_date,
        targetEndDate: application.project_overviews?.[0]?.target_end_date,
        meetingLink: application.project_overviews?.[0]?.meeting_link || '',
        ownerContactName: application.project_overviews?.[0]?.owner_contact_name || user.name || '',
        ownerContactEmail: application.project_overviews?.[0]?.owner_contact_email || user.email || '',
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
      projectId: application.project_id,
      ownerId: application.projects?.owner_id
    };

    return NextResponse.json({ data: formattedProject });
  } catch (error) {
    console.error('Project detail fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}