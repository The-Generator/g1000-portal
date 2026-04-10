import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;
    const body = await request.json();

    // Validate input
    const { workedOn, progressPercentage, blockers, nextSteps, links } = body;

    if (!workedOn || workedOn.trim().length === 0) {
      return NextResponse.json({ error: 'Work description is required' }, { status: 400 });
    }

    if (workedOn.length > 2000) {
      return NextResponse.json({ error: 'Work description must be less than 2000 characters' }, { status: 400 });
    }

    if (typeof progressPercentage !== 'number' || progressPercentage < 0 || progressPercentage > 100) {
      return NextResponse.json({ error: 'Progress percentage must be between 0 and 100' }, { status: 400 });
    }

    if (blockers && blockers.length > 2000) {
      return NextResponse.json({ error: 'Blockers must be less than 2000 characters' }, { status: 400 });
    }

    if (nextSteps && (!Array.isArray(nextSteps) || nextSteps.length > 3)) {
      return NextResponse.json({ error: 'Next steps must be an array with maximum 3 items' }, { status: 400 });
    }

    if (links && (!Array.isArray(links) || links.length > 3)) {
      return NextResponse.json({ error: 'Links must be an array with maximum 3 items' }, { status: 400 });
    }

    // Verify the student owns this project
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('id', applicationId)
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create the update
    const { data: update, error: updateError } = await supabaseAdmin
      .from('project_updates')
      .insert({
        application_id: applicationId,
        student_id: user.id,
        worked_on: workedOn.trim(),
        progress_percentage: progressPercentage,
        blockers: blockers?.trim() || null,
        next_steps: nextSteps || [],
        links: links?.map((link: any) => ({
          title: link.title || '',
          url: link.url || ''
        })) || []
      })
      .select()
      .single();

    if (updateError) {
      console.error('Update creation error:', updateError);
      return NextResponse.json({ error: 'Failed to create update' }, { status: 500 });
    }

    // TODO: Send notification to business owner about new update

    return NextResponse.json({
      data: update,
      message: 'Update posted successfully'
    });
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}