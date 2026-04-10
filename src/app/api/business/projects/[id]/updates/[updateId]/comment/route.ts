import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; updateId: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, updateId } = params;
    const body = await request.json();

    // Validate input
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Comment is required' }, { status: 400 });
    }

    if (comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be less than 2000 characters' }, { status: 400 });
    }

    // Verify the business owner owns this project and the update exists
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        projects!inner(
          owner_id
        )
      `)
      .eq('id', applicationId)
      .eq('projects.owner_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify the update exists and belongs to this application
    const { data: update, error: updateError } = await supabaseAdmin
      .from('project_updates')
      .select('id')
      .eq('id', updateId)
      .eq('application_id', applicationId)
      .single();

    if (updateError || !update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    // Create the comment
    const { data: newComment, error: commentError } = await supabaseAdmin
      .from('project_comments')
      .insert({
        update_id: updateId,
        user_id: user.id,
        comment: comment.trim()
      })
      .select()
      .single();

    if (commentError) {
      console.error('Comment creation error:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // TODO: Send notification to student about new comment

    return NextResponse.json({
      data: newComment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Comment post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}