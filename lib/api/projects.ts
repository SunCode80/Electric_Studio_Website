import { supabase } from '@/lib/supabase/client';
import { Project } from '@/lib/types/project';

export async function createProject(
  projectName: string,
  clientName: string,
  surveyData: any
): Promise<{ project: Project | null; error: string | null }> {
  try {
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const projectSlug = `${clientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const s1FileName = `${projectId}/s1-survey.json`;
    const { error: uploadError } = await supabase.storage
      .from('project-files')
      .upload(s1FileName, JSON.stringify(surveyData, null, 2), {
        contentType: 'application/json',
      });

    if (uploadError) {
      throw new Error(`Failed to upload survey: ${uploadError.message}`);
    }

    const projectData = {
      id: projectId,
      project_name: projectName,
      client_name: clientName,
      project_slug: projectSlug,
      current_stage: 1,
      status: 'in_progress',
      s1_completed: true,
      s1_file_path: s1FileName,
      s2_completed: false,
      s3_completed: false,
      s4_completed: false,
      s5_completed: false,
    };

    const { data: project, error: dbError } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (dbError) {
      throw new Error(`Failed to create project: ${dbError.message}`);
    }

    return { project, error: null };
  } catch (error: any) {
    return { project: null, error: error.message };
  }
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
}

export async function getProject(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
}

export async function updateProjectStage(
  projectId: string,
  stage: number,
  data: {
    completed: boolean;
    filePath?: string;
    generatedAt?: string;
  }
): Promise<boolean> {
  const updateData: any = {
    [`s${stage}_completed`]: data.completed,
    updated_at: new Date().toISOString(),
  };

  if (data.filePath) {
    updateData[`s${stage}_file_path`] = data.filePath;
  }

  if (data.generatedAt) {
    updateData[`s${stage}_generated_at`] = data.generatedAt;
  }

  if (data.completed && stage < 5) {
    updateData.current_stage = stage + 1;
  }

  if (data.completed && stage === 5) {
    updateData.status = 'completed';
  }

  const { error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project:', error);
    return false;
  }

  return true;
}

export async function deleteProject(projectId: string): Promise<boolean> {
  try {
    const { data: files } = await supabase.storage
      .from('project-files')
      .list(projectId);

    if (files && files.length > 0) {
      const filePaths = files.map((file) => `${projectId}/${file.name}`);
      await supabase.storage.from('project-files').remove(filePaths);
    }

    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (error) {
      throw new Error(`Failed to delete project: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

export async function uploadStageFile(
  projectId: string,
  stage: number,
  content: string | File,
  fileType: 'json' | 'txt' | 'pdf'
): Promise<string | null> {
  try {
    const fileName = `${projectId}/s${stage}-output.${fileType}`;
    const contentType =
      fileType === 'json'
        ? 'application/json'
        : fileType === 'pdf'
        ? 'application/pdf'
        : 'text/plain';

    const { error } = await supabase.storage
      .from('project-files')
      .upload(fileName, content, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    return fileName;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
}

export async function downloadStageFile(
  projectId: string,
  stage: number
): Promise<string | null> {
  try {
    const project = await getProject(projectId);
    if (!project) return null;

    const filePath = (project as any)[`s${stage}_file_path`];
    if (!filePath) return null;

    const { data, error } = await supabase.storage
      .from('project-files')
      .download(filePath);

    if (error) {
      throw new Error(`Failed to download file: ${error.message}`);
    }

    return await data.text();
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
}
