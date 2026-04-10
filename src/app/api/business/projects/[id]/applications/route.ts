import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-edge';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify the project belongs to this business owner
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('id', params.id)
      .eq('owner_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Get applications for this project with student details
    const { data: applications, error } = await supabaseAdmin
      .from('applications')
      .select(`
        *,
        users(
          id,
          name,
          email
        )
      `)
      .eq('project_id', params.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching applications:', error);
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }

    // Get student details for each application
    const applicationsWithStudents = await Promise.all(
      applications.map(async (app) => {
        // Get student user data
        const { data: studentUser } = await supabaseAdmin
          .from('users')
          .select('id, name, email')
          .eq('id', app.student_id)
          .single();

        // Get student profile data
        const { data: studentProfile } = await supabaseAdmin
          .from('student_profiles')
          .select('*')
          .eq('user_id', app.student_id)
          .single();

        return {
          id: app.id,
          projectId: app.project_id,
          studentId: app.student_id,
          coverNote: app.cover_note,
          proofOfWorkUrl: app.proof_of_work_url,
          status: app.status,
          submittedAt: app.submitted_at,
          invitedAt: app.invited_at,
          rejectedAt: app.rejected_at,
          meetingDateTime: app.meeting_date_time,
          meetingLink: app.meeting_link,
          reflectionOwner: app.reflection_owner,
          reflectionStudent: app.reflection_student,
          student: studentUser ? {
            id: studentUser.id,
            user: {
              id: studentUser.id,
              name: studentUser.name,
              email: studentUser.email
            },
            // Include profile data if available
            skills: studentProfile?.skills || [],
            resumeUrl: studentProfile?.resume_url,
            linkedinUrl: studentProfile?.linkedin_url,
            githubUrl: studentProfile?.github_url,
            major: studentProfile?.major,
            year: studentProfile?.year,
            profilePhotoUrl: studentProfile?.profile_photo_url
          } : null
        };
      })
    );

    const formattedApplications = applicationsWithStudents;

    return NextResponse.json({ data: formattedApplications });
  } catch (error) {
    console.error('Error in GET /api/business/projects/[id]/applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 