import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-edge';
import { supabaseAdmin } from '@/lib/supabase';

console.log('Student profile route file loaded');

export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('=== Student Profile API Called ===');
  console.log('Student ID:', params.id);
  console.log('URL:', request.url);
  
  try {
    const user = await getUserFromRequest(request);
    
    // Debug logging
    console.log('Student Profile API - Auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
      userEmail: user?.email,
      studentId: params.id,
      cookieNames: request.cookies.getAll().map(c => c.name),
      authHeader: request.headers.get('authorization')
    });
    
    if (!user) {
      console.log('No user found from request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'owner') {
      console.log('User is not an owner:', user.role);
      return NextResponse.json({ error: 'Unauthorized - Not an owner' }, { status: 401 });
    }
    
    console.log('Auth passed, fetching student data...');

    // First, get all projects owned by this business owner
    const { data: ownerProjects, error: projectsError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('owner_id', user.id);

    if (projectsError) {
      console.error('Projects fetch error:', projectsError);
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }

    if (!ownerProjects || ownerProjects.length === 0) {
      return NextResponse.json({ error: 'No projects found' }, { status: 403 });
    }

    const projectIds = ownerProjects.map(p => p.id);
    // Verify that this business owner has a legitimate reason to view this student profile
    // (i.e., the student has applied to one of their projects)
    const { data: hasApplication, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('student_id', params.id)
      .in('project_id', projectIds)
      .limit(1);

    if (applicationError) {
      console.error('Application check error:', applicationError);
      return NextResponse.json({ error: 'Failed to verify access' }, { status: 500 });
    }

    if (!hasApplication || hasApplication.length === 0) {
      return NextResponse.json({ error: 'No access to this student profile' }, { status: 403 });
    }

    // Get student user data
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, name, email, created_at')
      .eq('id', params.id)
      .eq('role', 'student')
      .single();

    if (studentError) {
      if (studentError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 });
      }
      console.error('Student fetch error:', studentError);
      return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 });
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', params.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Student exists but no profile yet
        return NextResponse.json({
          data: {
            user: {
              id: student.id,
              name: student.name,
              email: student.email,
              role: 'student',
              createdAt: student.created_at
            },
            profile: null
          }
        });
      }
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        user: {
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          createdAt: student.created_at
        },
        profile: {
          userId: profile.user_id,
          bio: profile.bio,
          major: profile.major,
          year: profile.year,
          linkedinUrl: profile.linkedin_url,
          githubUrl: profile.github_url,
          personalWebsiteUrl: profile.personal_website_url,
          resumeUrl: profile.resume_url,
          profilePhotoUrl: profile.profile_photo_url,
          skills: profile.skills || [],
          proofOfWorkUrls: profile.proof_of_work_urls || [],
          availableDays: profile.available_days || [],
          availableStartTime: profile.available_start_time,
          availableEndTime: profile.available_end_time,
          timezone: profile.timezone || 'America/New_York',
          availabilitySlots: profile.availability_slots || [],
          updatedAt: profile.updated_at
        }
      }
    });
  } catch (error) {
    console.error('Student profile view error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
