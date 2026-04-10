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

    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: applicationId } = params;
    const body = await request.json();

    // Validate input
    const {
      reliabilityRating,
      communicationRating,
      initiativeRating,
      qualityRating,
      impactRating,
      reviewNote,
      deliverablesCompleted
    } = body;

    // Validate ratings are between 1-5
    const ratings = [reliabilityRating, communicationRating, initiativeRating, qualityRating, impactRating];
    if (ratings.some(rating => typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'All ratings must be between 1 and 5' }, { status: 400 });
    }

    if (reviewNote && reviewNote.length > 2000) {
      return NextResponse.json({ error: 'Review note must be less than 2000 characters' }, { status: 400 });
    }

    // Verify the business owner owns this project
    const { data: application, error: appError } = await supabaseAdmin
      .from('applications')
      .select(`
        id,
        student_id,
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

    // Check if a review already exists
    const { data: existingReview } = await supabaseAdmin
      .from('project_reviews')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'A review has already been submitted for this project' }, { status: 400 });
    }

    // Create the review
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('project_reviews')
      .insert({
        application_id: applicationId,
        reliability_rating: reliabilityRating,
        communication_rating: communicationRating,
        initiative_rating: initiativeRating,
        quality_rating: qualityRating,
        impact_rating: impactRating,
        review_note: reviewNote?.trim() || null,
        deliverables_completed: deliverablesCompleted || false
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review creation error:', reviewError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Update application status to completed
    const { error: statusError } = await supabaseAdmin
      .from('applications')
      .update({
        project_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId);

    if (statusError) {
      console.error('Status update error:', statusError);
      // Don't fail the whole request, review was created successfully
    }

    // TODO: Send notification to student about project completion
    // TODO: Generate G1000 badge for student

    return NextResponse.json({
      data: review,
      message: 'Project review submitted successfully. The project has been marked as completed.'
    });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}