import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get application statistics
    const { data: applications, error: applicationsError } = await supabaseAdmin
      .from('applications')
      .select('status')
      .eq('student_id', user.id);

    if (applicationsError) {
      console.error('Applications fetch error:', applicationsError);
      return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
    }

    const stats = {
      applicationsSubmitted: applications.length,
      interviewsScheduled: applications.filter(app => app.status === 'interviewScheduled').length,
      projectsCompleted: applications.filter(app => app.status === 'accepted').length
    };

    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error('Student stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 