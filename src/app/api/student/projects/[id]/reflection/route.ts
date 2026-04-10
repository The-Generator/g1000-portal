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
    const { reflectionPoints, reflectionLinks } = body;

    // Validate input
    if (!reflectionPoints || !Array.isArray(reflectionPoints) || reflectionPoints.length === 0) {
      return NextResponse.json({ error: 'At least one reflection point is required' }, { status: 400 });
    }

    if (reflectionPoints.length > 3) {
      return NextResponse.json({ error: 'Maximum 3 reflection points allowed' }, { status: 400 });
    }

    if (reflectionLinks && (!Array.isArray(reflectionLinks) || reflectionLinks.length > 3)) {
      return NextResponse.json({ error: 'Maximum 3 links allowed' }, { status: 400 });
    }

    // Verify the project exists and is completed
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        project_reviews(id)
      `)
      .eq('id', applicationId)
      .eq('student_id', user.id)
      .eq('status', 'accepted')
      .single();

    if (appError || !application) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!application.project_reviews || application.project_reviews.length === 0) {
      return NextResponse.json({ error: 'Cannot add reflection until project is reviewed' }, { status: 400 });
    }

    // Check if reflection already exists
    const { data: existingReflection } = await supabaseAdmin
      .from('project_reflections')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    if (existingReflection) {
      // Update existing reflection
      const { data: reflection, error: reflectionError } = await supabaseAdmin
        .from('project_reflections')
        .update({
          reflection_points: reflectionPoints,
          reflection_links: reflectionLinks?.map((link: any) => ({
            title: link.title || '',
            url: link.url || ''
          })) || []
        })
        .eq('id', existingReflection.id)
        .select()
        .single();

      if (reflectionError) {
        console.error('Reflection update error:', reflectionError);
        return NextResponse.json({ error: 'Failed to update reflection' }, { status: 500 });
      }

      return NextResponse.json({
        data: reflection,
        message: 'Reflection updated successfully'
      });
    } else {
      // Create new reflection
      const { data: reflection, error: reflectionError } = await supabaseAdmin
        .from('project_reflections')
        .insert({
          application_id: applicationId,
          student_id: user.id,
          reflection_points: reflectionPoints,
          reflection_links: reflectionLinks?.map((link: any) => ({
            title: link.title || '',
            url: link.url || ''
          })) || []
        })
        .select()
        .single();

      if (reflectionError) {
        console.error('Reflection creation error:', reflectionError);
        return NextResponse.json({ error: 'Failed to create reflection' }, { status: 500 });
      }

      return NextResponse.json({
        data: reflection,
        message: 'Reflection submitted successfully'
      });
    }
  } catch (error) {
    console.error('Reflection post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}