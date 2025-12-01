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
      's2': ['s2_presentation_data', 's3_video_production_data', 's4_assembly_data', 's5_output'],
      's3': ['s3_video_production_data', 's4_assembly_data', 's5_output'],
      's4': ['s4_assembly_data', 's5_output'],
      's5': ['s5_output'],
      's6': [],
    };

    const columnsToNull = stagesToClear[stage];
    if (columnsToNull === undefined) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    if (columnsToNull.length === 0) {
      return NextResponse.json({ success: true, cleared: [] });
    }

    const updateData: Record<string, null> = {};
    columnsToNull.forEach(col => {
      updateData[col] = null;
    });

    const { error } = await supabase
      .from('content_strategy_submissions')
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
