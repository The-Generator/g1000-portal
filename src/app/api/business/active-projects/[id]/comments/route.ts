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

    if (!user || user.role !== 'business_owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;
    const body = await request.json();
    const { updateId, comment } = body;

    if (!updateId || !comment || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Update ID and comment are required' }, { status: 400 });
    }

    if (comment.length > 2000) {
      return NextResponse.json({ error: 'Comment must be less than 2000 characters' }, { status: 400 });
    }

    // Verify the business owner owns this project
    const { data: update, error: updateError } = await supabaseAdmin
      .from('project_updates')
      .select(`
        application_id,
        applications!inner(
          id,
          projects!inner(
            owner_id
          )
        )
      `)
      .eq('id', updateId)
      .eq('application_id', applicationId)
      .eq('applications.projects.owner_id', user.id)
      .single();

    if (updateError || !update) {
      return NextResponse.json({ error: 'Update not found or unauthorized' }, { status: 404 });
    }

    // Create the comment
    const { data: newComment, error: commentError } = await supabaseAdmin
      .from('project_comments')
      .insert({
        update_id: updateId,
        user_id: user.id,
        comment: comment.trim()
      })
      .select(`
        *,
        users(name, role)
      `)
      .single();

    if (commentError) {
      console.error('Comment creation error:', commentError);
      return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }

    // TODO: Send notification to student about new comment

    return NextResponse.json({
      data: {
        id: newComment.id,
        userId: newComment.user_id,
        userName: newComment.users?.name,
        userRole: newComment.users?.role,
        comment: newComment.comment,
        createdAt: newComment.created_at
      },
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Comment post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}