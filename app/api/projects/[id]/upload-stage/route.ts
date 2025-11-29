import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const { stage, content } = await request.json();

    console.log('[POST /api/projects/[id]/upload-stage] Project ID:', id, 'Stage:', stage);

    if (!id || !stage || content === undefined) {
      return NextResponse.json(
        { error: 'Project ID, stage, and content are required' },
        { status: 400 }
      );
    }

    const stageColumnMap: Record<string, string> = {
      's2': 's2_presentation_data',
      's3': 's3_video_production_data',
      's4': 's4_assembly_data',
      's5': 's5_output',
      's6': 's6_pdf_path',
    };

    const columnName = stageColumnMap[stage];
    if (!columnName) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }

    const { error } = await supabase
      .from('content_strategy_submissions')
      .update({ [columnName]: content })
      .eq('id', id);

    if (error) {
      console.error('[POST /api/projects/[id]/upload-stage] Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[POST /api/projects/[id]/upload-stage] Success');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[POST /api/projects/[id]/upload-stage] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload stage' },
      { status: 500 }
    );
  }
}
