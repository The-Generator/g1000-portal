import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-edge';
import { ProjectForm } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type');

    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If type is 'active-projects', return accepted applications (for /business/projects page)
    if (type === 'active-projects') {
      // Get accepted applications for business owner's projects
      const { data: applications, error } = await supabaseAdmin
        .from('applications')
        .select(`
          *,
          projects!inner(
            id,
            title,
            description,
            owner_id,
            estimated_duration,
            compensation_type,
            compensation_value
          ),
          users(
            id,
            name,
            email
          ),
          project_overviews(
            id,
            start_date,
            target_end_date
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
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
      }

      // Get latest updates for progress tracking
      let updatesByProject: Record<string, any> = {};
      if (applications && applications.length > 0) {
        const applicationIds = applications.map(a => a.id);
        const { data: latestUpdates } = await supabaseAdmin
          .from('project_updates')
          .select('application_id, created_at, progress_percentage')
          .in('application_id', applicationIds)
          .order('created_at', { ascending: false });

        if (latestUpdates) {
          updatesByProject = latestUpdates.reduce((acc, update) => {
            if (!acc[update.application_id] || update.created_at > acc[update.application_id].created_at) {
              acc[update.application_id] = {
                created_at: update.created_at,
                progress_percentage: update.progress_percentage
              };
            }
            return acc;
          }, {} as Record<string, any>);
        }
      }

      // Format the response for active projects
      const formattedProjects = applications?.map(app => ({
        id: app.id,
        projectId: app.project_id,
        title: app.projects?.title || 'Untitled Project',
        studentName: app.users?.name || 'Unknown Student',
        studentEmail: app.users?.email || '',
        status: app.project_reviews?.length > 0 ? 'completed' : 'active',
        projectStatus: app.project_status || 'active',
        lastUpdate: updatesByProject[app.id]?.created_at || null,
        progressPercentage: updatesByProject[app.id]?.progress_percentage,
        startDate: app.project_overviews?.[0]?.start_date || null,
        targetEndDate: app.project_overviews?.[0]?.target_end_date || null,
        hasOverview: app.project_overviews?.length > 0,
        submittedAt: app.submitted_at
      })) || [];

      return NextResponse.json({ data: formattedProjects });
    } else {
      // Default: Return ALL projects/opportunities for dashboard
      const { data: projects, error } = await supabaseAdmin
        .from('projects')
        .select(`
          *,
          applications(
            id,
            status,
            student_id,
            submitted_at
          )
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
      }

      return NextResponse.json({ data: projects || [] });
    }
  } catch (error) {
    console.error('Error in GET /api/business/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: ProjectForm = await request.json();
    const {
      title,
      description,
      type,
      isAiConsultation,
      currentSoftwareTools,
      painPoints,
      industryTags,
      estimatedDuration,
      estimatedHoursPerWeek,
      compensationType,
      compensationValue,
      budget,
      deliverables,
      location,
      onsiteLocation,
      applyWindowStart,
      applyWindowEnd,
      requiredSkills
    } = body;

    console.log('Creating project with data:', {
      title,
      type,
      isAiConsultation,
      industryTags,
      userId: user.id
    });

    // Validation
    if (!isAiConsultation) {
      if (!title || !description || !type) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    } else {
      if (!currentSoftwareTools?.trim()) {
        return NextResponse.json({ error: 'Current software and tools description is required for AI consultation' }, { status: 400 });
      }
    }

    if (!industryTags || industryTags.length === 0) {
      return NextResponse.json({ error: 'Industry is required' }, { status: 400 });
    }

    if (new Date(applyWindowStart) >= new Date(applyWindowEnd)) {
      return NextResponse.json({ error: 'Application window start must be before end date' }, { status: 400 });
    }

    // If location is onsite, validate location is provided
    if (location === 'onsite' && !onsiteLocation?.trim()) {
      return NextResponse.json({ error: 'On-site location is required when location is onsite' }, { status: 400 });
    }

    // Handle compensation fields - compensation_type cannot be null in database
    let finalCompensationType = compensationType || 'experience';
    let finalCompensationValue = compensationValue;

    // Provide a default value based on compensation type if value is empty
    if (!finalCompensationValue || finalCompensationValue === '') {
      if (finalCompensationType === 'experience') {
        finalCompensationValue = '';
      } else {
        // For paid compensation types without a value, keep it empty
        // The UI will show "Not specified"
        finalCompensationValue = '';
      }
    }

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        owner_id: user.id,
        title: isAiConsultation && !title ? 'AI Solutions Consultation' : title,
        description: isAiConsultation && !description ?
          'Looking for a student to consult on where AI solutions could provide the most value in our business operations.' :
          description,
        type: isAiConsultation ? 'consulting' : type,
        is_ai_consultation: isAiConsultation || false,
        current_software_tools: currentSoftwareTools,
        pain_points: painPoints,
        industry_tags: industryTags || [],
        estimated_duration: estimatedDuration,
        estimated_hours_per_week: estimatedHoursPerWeek,
        deliverables: deliverables || [],
        compensation_type: finalCompensationType,
        compensation_value: finalCompensationValue,
        budget: budget,
        location: location || 'remote',
        onsite_location: onsiteLocation,
        apply_window_start: applyWindowStart,
        apply_window_end: applyWindowEnd,
        required_skills: requiredSkills || [],
        status: 'open'
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error creating project:', error);
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }

    console.log('Project created successfully:', {
      id: project.id,
      title: project.title
    });

    return NextResponse.json({ data: project }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/business/projects:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 