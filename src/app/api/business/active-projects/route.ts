import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all accepted applications for this business owner's projects
    const { data: projects, error } = await supabaseAdmin
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
          profile_photo_url
        ),
        project_overviews(
          scope,
          start_date,
          target_end_date,
          meeting_link
        ),
        project_reviews(
          id,
          created_at
        )
      `)
      .eq('projects.owner_id', user.id)
      .eq('status', 'accepted')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Projects fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    // Get latest updates for each project
    const applicationIds = projects.map(p => p.id);
    let updatesByProject: Record<string, string> = {};

    if (applicationIds.length > 0) {
      const { data: latestUpdates } = await supabaseAdmin
        .from('project_updates')
        .select('application_id, created_at')
        .in('application_id', applicationIds)
        .order('created_at', { ascending: false });

      updatesByProject = latestUpdates?.reduce((acc, update) => {
        if (!acc[update.application_id] || update.created_at > acc[update.application_id]) {
          acc[update.application_id] = update.created_at;
        }
        return acc;
      }, {} as Record<string, string>) || {};
    }

    // Format the response
    const formattedProjects = projects.map(project => {
      const isCompleted = project.project_reviews?.length > 0;
      const lastUpdate = updatesByProject[project.id];
      let nextDue = null;

      if (!isCompleted && lastUpdate) {
        const lastUpdateDate = new Date(lastUpdate);
        const nextDueDate = new Date(lastUpdateDate);
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        nextDue = nextDueDate.toISOString();
      } else if (!isCompleted && !lastUpdate) {
        const acceptedDate = new Date(project.invited_at || project.submitted_at);
        const nextDueDate = new Date(acceptedDate);
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        nextDue = nextDueDate.toISOString();
      }

      return {
        id: project.id,
        title: project.projects?.title || 'Untitled Project',
        studentName: project.users?.name || 'Unknown Student',
        studentEmail: project.users?.email,
        studentPhotoUrl: project.student_profiles?.[0]?.profile_photo_url || null,
        status: isCompleted ? 'completed' : 'active',
        projectStatus: project.project_status || 'active',
        nextDue,
        lastUpdate: lastUpdate || null,
        startDate: project.project_overviews?.[0]?.start_date,
        targetEndDate: project.project_overviews?.[0]?.target_end_date,
        scope: project.project_overviews?.[0]?.scope,
        meetingLink: project.project_overviews?.[0]?.meeting_link,
        projectId: project.project_id,
        studentId: project.student_id
      };
    });

    return NextResponse.json({ data: formattedProjects });
  } catch (error) {
    console.error('Business projects fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}