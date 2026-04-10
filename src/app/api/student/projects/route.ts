import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get accepted applications with project details
    // First try with new tables, fallback if they don't exist
    let projects;
    let error;

    // Get accepted applications with project details including new tables
    const result = await supabaseAdmin
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
          scope,
          deliverables,
          start_date,
          target_end_date,
          meeting_link,
          owner_contact_name,
          owner_contact_email,
          useful_links
        ),
        project_reviews(
          id,
          created_at
        )
      `)
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .order('submitted_at', { ascending: false });

    projects = result.data;
    error = result.error;

    if (error) {
      console.error('Projects fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    if (!projects) {
      projects = [];
    }

    // Get business owner info for each project
    const ownerIds = [...new Set(projects
      .filter(p => p.projects?.owner_id)
      .map(p => p.projects.owner_id))];

    let ownerProfiles: Record<string, any> = {};
    if (ownerIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('business_owner_profiles')
        .select('user_id, company_name, logo_url')
        .in('user_id', ownerIds);

      if (profiles) {
        ownerProfiles = profiles.reduce((acc, profile) => {
          acc[profile.user_id] = {
            companyName: profile.company_name,
            logoUrl: profile.logo_url
          };
          return acc;
        }, {} as Record<string, any>);
      }
    }

    // Get latest update for each project to determine "next due" date
    let updatesByProject: Record<string, string> = {};

    if (projects.length > 0) {
      const applicationIds = projects.map(p => p.id);
      const { data: latestUpdates } = await supabaseAdmin
        .from('project_updates')
        .select('application_id, created_at')
        .in('application_id', applicationIds)
        .order('created_at', { ascending: false });

      if (latestUpdates) {
        updatesByProject = latestUpdates.reduce((acc, update) => {
          if (!acc[update.application_id] || update.created_at > acc[update.application_id]) {
            acc[update.application_id] = update.created_at;
          }
          return acc;
        }, {} as Record<string, string>);
      }
    }

    // Format the response
    const formattedProjects = projects.map(project => {
      const isCompleted = project.project_status === 'completed';
      const lastUpdate = updatesByProject[project.id];
      let nextDue = null;

      if (!isCompleted && lastUpdate) {
        // If last update was more than 7 days ago, it's due
        const lastUpdateDate = new Date(lastUpdate);
        const nextDueDate = new Date(lastUpdateDate);
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        nextDue = nextDueDate.toISOString();
      } else if (!isCompleted && !lastUpdate) {
        // No updates yet, due in 7 days from acceptance
        const acceptedDate = new Date(project.invited_at || project.submitted_at);
        const nextDueDate = new Date(acceptedDate);
        nextDueDate.setDate(nextDueDate.getDate() + 7);
        nextDue = nextDueDate.toISOString();
      }

      return {
        id: project.id,
        title: project.projects?.title || 'Untitled Project',
        companyName: ownerProfiles[project.projects?.owner_id]?.companyName || 'Unknown Company',
        companyLogoUrl: ownerProfiles[project.projects?.owner_id]?.logoUrl || null,
        status: isCompleted ? 'completed' : 'active',
        projectStatus: project.project_status || 'active',
        nextDue,
        startDate: project.project_overviews?.[0]?.start_date || null,
        targetEndDate: project.project_overviews?.[0]?.target_end_date || null,
        scope: project.project_overviews?.[0]?.scope || null,
        meetingLink: project.project_overviews?.[0]?.meeting_link || null,
        projectId: project.project_id
      };
    });

    return NextResponse.json({ data: formattedProjects });
  } catch (error) {
    console.error('Projects fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}