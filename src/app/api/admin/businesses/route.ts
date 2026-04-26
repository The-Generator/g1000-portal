import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionUser } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Join business_owner_profiles with users table
    const { data: businesses, error } = await supabaseAdmin
      .from('business_owner_profiles')
      .select(`
        *,
        users!inner(email, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching businesses:', error);
      return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }

    return NextResponse.json({ data: businesses });
  } catch (error) {
    console.error('Businesses API logic error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, isApproved } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('business_owner_profiles')
      .update({ is_approved: isApproved })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return NextResponse.json({ error: 'Failed to update business approval' }, { status: 500 });
    }

    return NextResponse.json({ data, message: 'Business status updated' });
  } catch (error) {
    console.error('Business update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Delete auth user first if possible (this cascades in Supabase to local users table usually, but we will explicitly delete users too)
    await supabaseAdmin.auth.admin.deleteUser(userId);

    // Explicitly delete from custom users table (cascades to business_owner_profiles)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error rejecting business:', error);
      return NextResponse.json({ error: 'Failed to reject business' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Business application rejected securely' });
  } catch (error) {
    console.error('Business deletion error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
