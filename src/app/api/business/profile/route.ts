import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getUserFromRequest } from '@/lib/auth-edge';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch business owner profile
    const { data: profile, error } = await supabaseAdmin
      .from('business_owner_profiles')
      .select(`
        *,
        users (
          id,
          email,
          name
        )
      `)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist yet
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }
      throw error;
    }

    // Format the response
    const formattedProfile = {
      companyName: profile.company_name || profile.business_name,
      contactName: profile.contact_name || user.name,
      email: user.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zip_code,
      websiteUrl: profile.website_url,
      industryTags: profile.industry_tags || profile.industry || [],
      description: profile.description,
      logoUrl: profile.logo_url,
      linkedinUrl: profile.linkedin_url,
      founded: profile.founded,
      employeeCount: profile.employee_count,
    };

    return NextResponse.json({ data: formattedProfile });
  } catch (error) {
    console.error('Error fetching business profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'owner') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('business_owner_profiles')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    // Log for debugging
    console.log('Profile check:', { existingProfile, checkError });

    const profileData = {
      user_id: user.id,
      company_name: body.companyName,
      business_name: body.companyName, // Backwards compatibility
      contact_name: body.contactName,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      zip_code: body.zipCode || null,
      website_url: body.websiteUrl || null,
      industry_tags: body.industryTags || [],
      industry: body.industryTags?.[0] || null, // Backwards compatibility
      description: body.description || null,
      logo_url: body.logoUrl || null,
      linkedin_url: body.linkedinUrl || null,
      founded: body.founded || null,
      employee_count: body.employeeCount || null,
      updated_at: new Date().toISOString(),
    };

    let result;
    if (existingProfile && !checkError) {
      // Update existing profile - remove user_id from update as it's the primary key
      const { user_id, ...updateData } = profileData;

      console.log('Updating profile with data:', updateData);

      const { data, error } = await supabaseAdmin
        .from('business_owner_profiles')
        .update(updateData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      result = data;
    } else {
      // Create new profile
      console.log('Creating new profile with data:', profileData);

      const { data, error } = await supabaseAdmin
        .from('business_owner_profiles')
        .insert({
          ...profileData,
          is_approved: true, // Auto-approve for now
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      result = data;
    }

    // Also update the user's name if provided
    if (body.contactName) {
      await supabaseAdmin
        .from('users')
        .update({ name: body.contactName })
        .eq('id', user.id);
    }

    // Format the response
    const formattedProfile = {
      companyName: result.company_name,
      contactName: result.contact_name,
      email: user.email,
      phone: result.phone,
      address: result.address,
      city: result.city,
      state: result.state,
      zipCode: result.zip_code,
      websiteUrl: result.website_url,
      industryTags: result.industry_tags || [],
      description: result.description,
      logoUrl: result.logo_url,
      linkedinUrl: result.linkedin_url,
      founded: result.founded,
      employeeCount: result.employee_count,
    };

    return NextResponse.json({ data: formattedProfile });
  } catch (error) {
    console.error('Error updating business profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}