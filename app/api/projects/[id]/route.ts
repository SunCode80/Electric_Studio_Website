import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('DELETE request received for project:', params.id);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const projectId = params.id;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();

    if (fetchError) {
      console.error('Error fetching project:', fetchError);
      return NextResponse.json(
        { error: `Failed to fetch project: ${fetchError.message}` },
        { status: 500 }
      );
    }

    if (!project) {
      console.log('Project not found:', projectId);
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('Project found, attempting to delete files...');

    const filePaths = [
      project.s1_file_path,
      project.s2_file_path,
      project.s3_file_path,
      project.s4_file_path,
      project.s5_file_path,
      project.s6_file_path,
    ].filter(Boolean);

    if (filePaths.length > 0) {
      console.log('Deleting files:', filePaths);
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove(filePaths);

      if (storageError) {
        console.error('Error deleting files from storage:', storageError);
      }
    }

    console.log('Attempting to delete project record...');
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (deleteError) {
      console.error('Error deleting project:', deleteError);
      return NextResponse.json(
        { error: `Failed to delete project: ${deleteError.message}` },
        { status: 500 }
      );
    }

    console.log('Project deleted successfully:', projectId);
    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete project exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete project' },
      { status: 500 }
    );
  }
}
