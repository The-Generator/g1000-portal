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

    const {
      reliabilityRating,
      communicationRating,
      initiativeRating,
      qualityRating,
      impactRating,
      reviewNote,
      deliverablesCompleted
    } = body;

    // Validate ratings
    const ratings = [reliabilityRating, communicationRating, initiativeRating, qualityRating, impactRating];
    for (const rating of ratings) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'All ratings must be between 1 and 5' }, { status: 400 });
      }
    }

    if (!reviewNote || reviewNote.trim().length === 0) {
      return NextResponse.json({ error: 'Review note is required' }, { status: 400 });
    }

    if (reviewNote.length > 2000) {
      return NextResponse.json({ error: 'Review note must be less than 2000 characters' }, { status: 400 });
    }

    // Verify the business owner owns this project
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

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from('project_reviews')
      .select('id')
      .eq('application_id', applicationId)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: 'Review already submitted for this project' }, { status: 400 });
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
        review_note: reviewNote.trim(),
        deliverables_completed: deliverablesCompleted || false
      })
      .select()
      .single();

    if (reviewError) {
      console.error('Review creation error:', reviewError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    // Update application project_status to completed
    await supabaseAdmin
      .from('applications')
      .update({ project_status: 'completed' })
      .eq('id', applicationId);

    // TODO: Send notification to student about review completion
    // TODO: Generate G1000 badge/certificate

    return NextResponse.json({
      data: review,
      message: 'Review submitted successfully. The project has been marked as completed.'
    });
  } catch (error) {
    console.error('Review post error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}