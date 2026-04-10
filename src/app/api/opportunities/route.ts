import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Try to get current user (student) if logged in - optional for public viewing
    let currentUserId: string | null = null;

    try {
      const user = await getUserFromRequest(request);
      if (user && user.role === 'student') {
        currentUserId = user.id;
      }
    } catch {
      // User not authenticated — public view
    }

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const industry = url.searchParams.get('industry');
    const skills = url.searchParams.get('skills');
    const compensationType = url.searchParams.get('compensationType');
    const duration = url.searchParams.get('duration');
    const page = parseInt(url.searchParams.get('page') || '1');
    const perPage = parseInt(url.searchParams.get('perPage') || '10');

    let query = supabaseAdmin
      .from('projects')
      .select('*');

    // Try to filter by status if the column exists
    // Remove this try-catch once the status column is added to the database
    try {
      query = query.eq('status', 'open');
    } catch (error) {
      console.warn('Status column may not exist yet, fetching all projects');
    }

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (industry) {
      const industries = industry.split(',');
      query = query.overlaps('industry_tags', industries);
    }

    if (skills) {
      const skillsList = skills.split(',');
      query = query.overlaps('required_skills', skillsList);
    }

    if (compensationType) {
      const types = compensationType.split(',');
      query = query.in('compensation_type', types);
    }

    if (duration) {
      const durations = duration.split(',');
      query = query.in('duration', durations);
    }

    // Apply pagination
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;
    
    const { data: projects, error: projectsError, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false });

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
    }

    // Fetch user's applications if logged in
    let userApplications: any = {};
    if (currentUserId) {
      const { data: applications } = await supabaseAdmin
        .from('applications')
        .select('project_id, status, id')
        .eq('student_id', currentUserId);

      if (applications) {
        applications.forEach(app => {
          userApplications[app.project_id] = {
            applicationId: app.id,
            status: app.status
          };
        });
      }
    }

    // Fetch business owner profiles for all projects
    const ownerIds = [...new Set(projects.map(p => p.owner_id).filter(Boolean))];
    let businessProfiles: any = {};

    if (ownerIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('business_owner_profiles')
        .select(`
          user_id,
          company_name,
          contact_name,
          phone,
          address,
          city,
          state,
          zip_code,
          industry_tags,
          website_url,
          description,
          logo_url,
          linkedin_url,
          founded,
          employee_count,
          is_approved
        `)
        .in('user_id', ownerIds);

      if (profiles) {
        profiles.forEach(profile => {
          businessProfiles[profile.user_id] = profile;
        });
      }

      // Fetch user information
      const { data: users } = await supabaseAdmin
        .from('users')
        .select('id, name, email')
        .in('id', ownerIds);

      if (users) {
        users.forEach(user => {
          if (businessProfiles[user.id]) {
            businessProfiles[user.id].user = {
              name: user.name,
              email: user.email
            };
          }
        });
      }
    }

    const formattedProjects = projects.map(project => ({
      id: project.id,
      ownerId: project.owner_id,
      title: project.title,
      description: project.description,
      type: project.type,
      typeExplanation: project.type_explanation,
      industryTags: project.industry_tags || [],
      duration: project.estimated_duration || project.duration,
      estimatedDuration: project.estimated_duration,
      estimatedHoursPerWeek: project.estimated_hours_per_week,
      deliverables: project.deliverables || [],
      compensationType: project.compensation_type,
      compensationValue: project.compensation_value,
      budget: project.budget,
      location: project.location,
      onsiteLocation: project.onsite_location,
      isAiConsultation: project.is_ai_consultation,
      currentSoftwareTools: project.current_software_tools,
      painPoints: project.pain_points,
      applyWindowStart: project.apply_window_start,
      applyWindowEnd: project.apply_window_end,
      requiredSkills: project.required_skills || [],
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      owner: businessProfiles[project.owner_id] ? {
        userId: businessProfiles[project.owner_id].user_id,
        companyName: businessProfiles[project.owner_id].company_name,
        contactName: businessProfiles[project.owner_id].contact_name,
        phone: businessProfiles[project.owner_id].phone,
        address: businessProfiles[project.owner_id].address,
        city: businessProfiles[project.owner_id].city,
        state: businessProfiles[project.owner_id].state,
        zipCode: businessProfiles[project.owner_id].zip_code,
        industryTags: businessProfiles[project.owner_id].industry_tags || [],
        websiteUrl: businessProfiles[project.owner_id].website_url,
        description: businessProfiles[project.owner_id].description,
        logoUrl: businessProfiles[project.owner_id].logo_url,
        linkedinUrl: businessProfiles[project.owner_id].linkedin_url,
        founded: businessProfiles[project.owner_id].founded,
        employeeCount: businessProfiles[project.owner_id].employee_count,
        isApproved: businessProfiles[project.owner_id].is_approved,
        user: businessProfiles[project.owner_id].user || null
      } : null,
      userApplication: userApplications[project.id] || null
    }));

    return NextResponse.json({
      data: formattedProjects,
      meta: {
        page,
        perPage,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / perPage)
      }
    });
  } catch (error) {
    console.error('Opportunities fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 