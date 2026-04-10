import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Add new empty category
export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('resource_categories')
      .insert([{ name: name.trim() }]);

    if (error) throw error;
    
    return NextResponse.json({ success: true, name });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Rename Category Globally
export async function PUT(request: Request) {
  try {
    const { oldName, newName } = await request.json();

    if (!oldName || !newName || newName.trim() === '') {
      return NextResponse.json({ error: 'Missing names' }, { status: 400 });
    }

    const cleanedNewName = newName.trim();

    // 1. Insert new category (so it exists)
    const { error: insertErr } = await supabaseAdmin
      .from('resource_categories')
      .upsert([{ name: cleanedNewName }], { onConflict: 'name' });
      
    if (insertErr) throw insertErr;

    // 2. Update all resources utilizing the old category
    const { error: updateResErr } = await supabaseAdmin
      .from('resources')
      .update({ category: cleanedNewName })
      .eq('category', oldName);
      
    if (updateResErr) throw updateResErr;

    // 3. Delete the old category from master list
    const { error: deleteErr } = await supabaseAdmin
      .from('resource_categories')
      .delete()
      .eq('name', oldName);
      
    // Ignore delete error if it wasn't there originally anyway
    
    return NextResponse.json({ success: true, oldName, newName: cleanedNewName });
  } catch (error: any) {
    console.error('Error renaming category:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
