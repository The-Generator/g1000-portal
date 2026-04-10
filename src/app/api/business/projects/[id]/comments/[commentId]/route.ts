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

    if (!user || user.role !== 'business_owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, commentId } = params;

    // Verify the business owner owns this project
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, owner_id')
      .eq('id', projectId)
      .eq('owner_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Verify the comment exists and get its details
    const { data: comment, error: commentError } = await supabaseAdmin
      .from('project_comments')
      .select(`
        id,
        update_id,
        project_updates (
          application_id,
          applications (
            project_id
          )
        )
      `)
      .eq('id', commentId)
      .single();

    if (commentError || !comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Verify the comment belongs to this project
    const applicationProjectId = comment.project_updates?.applications?.project_id;
    if (applicationProjectId !== projectId) {
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