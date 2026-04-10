import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AvailabilitySlot } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Helper function to ensure all availability slots have stable UUIDs  
function ensureSlotsHaveIds(slots: any[]): AvailabilitySlot[] {
  return slots.map(slot => ({
    ...slot,
    id: slot.id || uuidv4()
  }));
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    console.log('User from request:', user);
    
    if (!user || user.role !== 'student') {
      console.log('Auth failed - user:', user);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { bio, linkedinUrl, githubUrl, personalWebsiteUrl, profilePhotoUrl, skills, proofOfWorkUrls, availableDays, availableStartTime, availableEndTime, availabilitySlots, timezone } = body;

    // Validate URLs
    const urlFields = { linkedinUrl, githubUrl, personalWebsiteUrl };
    for (const [field, url] of Object.entries(urlFields)) {
      if (url && url.trim()) {
        try {
          new URL(url);
        } catch (error) {
          return NextResponse.json(
            { error: `Invalid ${field.replace('Url', '')} URL format` },
            { status: 400 }
          );
        }
      }
    }

    // Validate proof of work URLs
    if (proofOfWorkUrls && Array.isArray(proofOfWorkUrls)) {
      for (const url of proofOfWorkUrls) {
        if (url && url.trim()) {
          try {
            new URL(url);
          } catch (error) {
            return NextResponse.json(
              { error: 'Invalid proof of work URL format' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('student_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    const profileData = {
      user_id: user.id,
      bio: bio || null,
      linkedin_url: linkedinUrl || null,
      github_url: githubUrl || null,
      personal_website_url: personalWebsiteUrl || null,
      profile_photo_url: profilePhotoUrl || null,
      skills: skills || [],
      proof_of_work_urls: proofOfWorkUrls || [],
      // Legacy availability fields (kept for backward compatibility)
      available_days: availableDays || [],
      available_start_time: availableStartTime || null,
      available_end_time: availableEndTime || null,
      // New flexible availability - ensure all slots have IDs
      availability_slots: availabilitySlots ? ensureSlotsHaveIds(availabilitySlots) : [],
      timezone: timezone || 'America/New_York',
      updated_at: new Date().toISOString()
    };

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabaseAdmin
        .from('student_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();
      
      result = { data, error };
    } else {
      // Create new profile - we need major and year, which should come from G1000 verification
      // For now, set defaults that can be updated later
      const { data, error } = await supabaseAdmin
        .from('student_profiles')
        .insert({
          ...profileData,
          major: 'Not specified',
          year: 'Not specified'
        })
        .select()
        .single();
      
      result = { data, error };
    }

    if (result.error) {
      console.error('Profile update error:', result.error);
      console.error('Profile data being saved:', profileData);
      return NextResponse.json({ 
        error: 'Failed to update profile', 
        details: process.env.NODE_ENV === 'development' ? result.error.message : undefined 
      }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        userId: result.data.user_id,
        bio: result.data.bio,
        major: result.data.major,
        year: result.data.year,
        linkedinUrl: result.data.linkedin_url,
        githubUrl: result.data.github_url,
        personalWebsiteUrl: result.data.personal_website_url,
        resumeUrl: result.data.resume_url,
        profilePhotoUrl: result.data.profile_photo_url,
        skills: result.data.skills || [],
        proofOfWorkUrls: result.data.proof_of_work_urls || [],
        // Legacy availability fields
        availableDays: result.data.available_days || [],
        availableStartTime: result.data.available_start_time,
        availableEndTime: result.data.available_end_time,
        // New flexible availability
        availabilitySlots: result.data.availability_slots || [],
        timezone: result.data.timezone || 'America/New_York',
        updatedAt: result.data.updated_at
      }
    });
  } catch (error) {
    console.error('Student profile update error:', error);
    console.error('Request body:', await request.clone().json().catch(() => 'Could not parse body'));
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
    }, { status: 500 });
  }
} 