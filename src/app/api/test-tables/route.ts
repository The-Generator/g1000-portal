import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Test if tables exist
    const tables = [
      'project_overviews',
      'project_updates',
      'project_comments',
      'project_reviews',
      'project_reflections'
    ];

    const results: any = {};

    for (const tableName of tables) {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select('id')
        .limit(1);

      if (error) {
        results[tableName] = {
          exists: false,
          error: error.message
        };
      } else {
        results[tableName] = {
          exists: true,
          message: 'Table exists'
        };
      }
    }

    // Also check if project_status column exists in applications
    const { data: appData, error: appError } = await supabaseAdmin
      .from('applications')
      .select('id, project_status')
      .limit(1);

    if (appError) {
      results['applications.project_status'] = {
        exists: false,
        error: appError.message
      };
    } else {
      results['applications.project_status'] = {
        exists: true,
        message: 'Column exists'
      };
    }

    return NextResponse.json({
      message: 'Table check complete',
      results
    });
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      error: 'Failed to test tables',
      details: (error as Error).message
    }, { status: 500 });
  }
}