import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if application exists and belongs to the student
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('applications')
      .select('id, status, student_id')
      .eq('id', params.id)
      .eq('student_id', user.id)
      .single();

    if (applicationError) {
      if (applicationError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
      }
      console.error('Application check error:', applicationError);
      return NextResponse.json({ error: 'Failed to verify application' }, { status: 500 });
    }

    // Check if application can be withdrawn
    if (!['submitted', 'underReview'].includes(application.status)) {
      return NextResponse.json({ 
        error: 'Cannot withdraw application in current status' 
      }, { status: 400 });
    }

    // Delete the application
    const { error: deleteError } = await supabaseAdmin
      .from('applications')
      .delete()
      .eq('id', params.id)
      .eq('student_id', user.id);

    if (deleteError) {
      console.error('Application deletion error:', deleteError);
      return NextResponse.json({ error: 'Failed to withdraw application' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Application withdrawn successfully' });
  } catch (error) {
    console.error('Application withdrawal error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 