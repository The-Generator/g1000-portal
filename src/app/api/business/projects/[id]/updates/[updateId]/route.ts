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

    if (!user || user.role !== 'business_owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, updateId } = params;

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

    // Verify the update belongs to this project
    const { data: update, error: updateError } = await supabaseAdmin
      .from('project_updates')
      .select('id, application_id')
      .eq('id', updateId)
      .single();

    if (updateError || !update) {
      return NextResponse.json({ error: 'Update not found' }, { status: 404 });
    }

    // Verify the update is for an application on this project
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, project_id')
      .eq('id', update.application_id)
      .eq('project_id', projectId)
      .single();

    if (appError || !application) {
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