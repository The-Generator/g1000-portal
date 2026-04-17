import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, commentId } = params;

    // First check if the comment exists and belongs to the user
    type CommentRow = {
      id: string;
      user_id: string;
      update_id: string;
      project_updates: { application_id: string; student_id: string } | null;
    };
    const { data: commentRaw, error: commentError } = await supabaseAdmin
      .from('project_comments')
      .select(`
        id,
        user_id,
        update_id,
        project_updates (
          application_id,
          student_id
        )
      `)
      .eq('id', commentId)
      .single();

    if (commentError || !commentRaw) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const projectUpdateRaw = (commentRaw as unknown as { project_updates: unknown }).project_updates;
    const projectUpdate = (Array.isArray(projectUpdateRaw) ? projectUpdateRaw[0] : projectUpdateRaw) as
      | { application_id: string; student_id: string }
      | null;
    const rawTyped = commentRaw as unknown as Omit<CommentRow, 'project_updates'>;
    const comment: CommentRow = {
      id: rawTyped.id,
      user_id: rawTyped.user_id,
      update_id: rawTyped.update_id,
      project_updates: projectUpdate,
    };

    // Check if user can delete this comment
    // User can delete if they:
    // 1. Are the comment author OR
    // 2. Own the project (are the student on the accepted application)
    const isCommentAuthor = comment.user_id === user.id;
    const isProjectOwner = comment.project_updates?.student_id === user.id;

    if (!isCommentAuthor && !isProjectOwner) {
      return NextResponse.json({ error: 'You can only delete your own comments or comments on your project' }, { status: 403 });
    }

    // Verify the comment belongs to the correct application
    if (comment.project_updates?.application_id !== applicationId) {
      return NextResponse.json({ error: 'Comment does not belong to this project' }, { status: 400 });
    }

    // Delete the comment
    const { error: deleteError } = await supabaseAdmin
      .from('project_comments')
      .delete()
      .eq('id', commentId);

    if (deleteError) {
      console.error('Comment deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}