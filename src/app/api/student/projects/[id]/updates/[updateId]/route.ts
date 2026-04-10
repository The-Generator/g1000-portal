import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; updateId: string } }
) {
  try {
    const user = await getUserFromRequest(request);

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId, updateId } = params;

    // Verify the student owns this update
    const { data: update, error: updateError } = await supabaseAdmin
      .from('project_updates')
      .select('id, student_id, application_id')
      .eq('id', updateId)
      .eq('student_id', user.id)
      .single();

    if (updateError || !update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    // Verify the update belongs to the correct application
    if (update.application_id !== applicationId) {
      return NextResponse.json({ error: 'Update does not belong to this project' }, { status: 400 });
    }

    // Delete the update (comments will be cascade deleted)
    const { error: deleteError } = await supabaseAdmin
      .from('project_updates')
      .delete()
      .eq('id', updateId);

    if (deleteError) {
      console.error('Update deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to delete update' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Update deleted successfully'
    });
  } catch (error) {
    console.error('Delete update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}