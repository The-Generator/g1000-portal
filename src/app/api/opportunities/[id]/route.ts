import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Try to get current user (student) if logged in — optional for public viewing
    let currentUserId: string | null = null;
    try {
      const user = await getUserFromRequest(request);
      if (user && user.role === 'student') currentUserId = user.id;
    } catch { /* not authenticated */ }

    // First get the project (don't filter by status so students can view closed projects they applied to)
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (projectError) {
      if (projectError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
      }
      console.error('Project fetch error:', projectError);
      return NextResponse.json({ error: 'Failed to fetch opportunity' }, { status: 500 });
    }

    // Fetch owner profile if project has an owner
    let ownerProfile = null;
    if (project.owner_id) {
      const { data: profile } = await supabaseAdmin
        .from('business_owner_profiles')
        .select('*')
        .eq('user_id', project.owner_id)
        .single();

      if (profile) {
        // Fetch user details for the owner
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, name')
          .eq('id', project.owner_id)
          .single();

        ownerProfile = {
          ...profile,
          user: user
        };
      }
    }

    // Fetch user's application if logged in
    let userApplication = null;
    if (currentUserId) {
      const { data: application } = await supabaseAdmin
        .from('applications')
        .select('id, status')
        .eq('project_id', params.id)
        .eq('student_id', currentUserId)
        .single();

      if (application) {
        userApplication = {
          applicationId: application.id,
          status: application.status
        };
      }
    }

    // Format the owner data
    const ownerData = ownerProfile ? {
      userId: ownerProfile.user_id,
      companyName: ownerProfile.company_name,
      contactName: ownerProfile.contact_name,
      phone: ownerProfile.phone,
      address: ownerProfile.address,
      city: ownerProfile.city,
      state: ownerProfile.state,
      zipCode: ownerProfile.zip_code,
      industryTags: ownerProfile.industry_tags || [],
      websiteUrl: ownerProfile.website_url,
      description: ownerProfile.description,
      logoUrl: ownerProfile.logo_url,
      linkedinUrl: ownerProfile.linkedin_url,
      founded: ownerProfile.founded,
      employeeCount: ownerProfile.employee_count,
      isApproved: ownerProfile.is_approved,
      createdAt: ownerProfile.created_at,
      updatedAt: ownerProfile.updated_at,
      user: ownerProfile.user ? {
        id: ownerProfile.user.id,
        email: ownerProfile.user.email,
        name: ownerProfile.user.name
      } : null
    } : null;

    const formattedProject = {
      id: project.id,
      ownerId: project.owner_id,
      title: project.title,
      description: project.description,
      type: project.type,
      typeExplanation: project.type_explanation,
      isAiConsultation: project.is_ai_consultation,
      currentSoftwareTools: project.current_software_tools,
      painPoints: project.pain_points,
      industryTags: project.industry_tags || [],
      estimatedDuration: project.estimated_duration,
      estimatedHoursPerWeek: project.estimated_hours_per_week,
      duration: project.duration,
      deliverables: project.deliverables || [],
      compensationType: project.compensation_type,
      compensationValue: project.compensation_value,
      budget: project.budget,
      location: project.location,
      onsiteLocation: project.onsite_location,
      applyWindowStart: project.apply_window_start,
      applyWindowEnd: project.apply_window_end,
      requiredSkills: project.required_skills || [],
      status: project.status,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
      owner: ownerData,
      userApplication
    };

    return NextResponse.json({ data: formattedProject });
  } catch (error) {
    console.error('Opportunity fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 