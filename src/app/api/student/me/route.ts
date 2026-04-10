import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AvailabilitySlot } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure all availability slots have stable UUIDs
function ensureSlotsHaveIds(slots: any[]): AvailabilitySlot[] {
  if (!slots || !Array.isArray(slots)) return [];
  return slots.map(slot => ({
    ...slot,
    id: slot.id || uuidv4()
  }));
}

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get student profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('student_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Profile fetch error:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        profile: profile ? {
          userId: profile.user_id,
          bio: profile.bio,
          major: profile.major,
          year: profile.year,
          linkedinUrl: profile.linkedin_url,
          githubUrl: profile.github_url,
          personalWebsiteUrl: profile.personal_website_url,
          resumeUrl: profile.resume_url,
          profilePhotoUrl: profile.profile_photo_url,
          skills: profile.skills || [],
          proofOfWorkUrls: profile.proof_of_work_urls || [],
          // Legacy availability fields
          availableDays: profile.available_days || [],
          availableStartTime: profile.available_start_time,
          availableEndTime: profile.available_end_time,
          // New flexible availability - ensure all slots have IDs
          availabilitySlots: ensureSlotsHaveIds(profile.availability_slots || []),
          timezone: profile.timezone || 'America/New_York',
          updatedAt: profile.updated_at
        } : null
      }
    });
  } catch (error) {
    console.error('Student profile fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 