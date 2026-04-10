import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If business owner, get their profile
    let businessProfile = null;
    if (user.role === 'owner') {
      const { data: profile } = await supabaseAdmin
        .from('business_owner_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      // Transform snake_case to camelCase for frontend
      if (profile) {
        businessProfile = {
          companyName: profile.company_name,
          isApproved: profile.is_approved,
          industryTags: profile.industry_tags,
          websiteUrl: profile.website_url,
          companyDescription: profile.company_description,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at
        };
      }
    }

    return NextResponse.json({
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
        businessProfile
      }
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 