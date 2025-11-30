import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { stage } = await request.json();

    console.log('[POST /api/projects/[id]/clear-stage] Project ID:', id, 'Stage:', stage);

    if (!id || !stage) {
      return NextResponse.json(
        { error: 'Project ID and stage are required' },
        { status: 400 }
      );
    }

    const stagesToClear: Record<string, string[]> = {
      's2': ['s2_completed', 's2_file_path', 's2_generated_at', 's3_completed', 's3_file_path', 's3_generated_at', 's4_completed', 's4_file_path', 's4_generated_at', 's5_completed', 's5_file_path', 's5_generated_at', 's6_completed', 's6_file_path', 's6_generated_at'],
      's3': ['s3_completed', 's3_file_path', 's3_generated_at', 's4_completed', 's4_file_path', 's4_generated_at', 's5_completed', 's5_file_path', 's5_generated_at', 's6_completed', 's6_file_path', 's6_generated_at'],
      's4': ['s4_completed', 's4_file_path', 's4_generated_at', 's5_completed', 's5_file_path', 's5_generated_at', 's6_completed', 's6_file_path', 's6_generated_at'],
      's5': ['s5_completed', 's5_file_path', 's5_generated_at', 's6_completed', 's6_file_path', 's6_generated_at'],
      's6': ['s6_completed', 's6_file_path', 's6_generated_at'],
    };

    const columnsToNull = stagesToClear[stage];
    if (!columnsToNull) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const updateData: Record<string, null | boolean> = {};
    columnsToNull.forEach(col => {
      if (col.endsWith('_completed')) {
        updateData[col] = false;
      } else {
        updateData[col] = null;
      }
    });

    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('[POST /api/projects/[id]/clear-stage] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[POST /api/projects/[id]/clear-stage] Success - Cleared:', columnsToNull);
    return NextResponse.json({ success: true, cleared: columnsToNull });

  } catch (error: any) {
    console.error('[POST /api/projects/[id]/clear-stage] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear stage' },
      { status: 500 }
    );
  }
}
