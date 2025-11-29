import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    console.log('[DELETE /api/projects/[id]] Project ID:', id);

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[DELETE /api/projects/[id]] Supabase error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[DELETE /api/projects/[id]] Success');
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[DELETE /api/projects/[id]] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
