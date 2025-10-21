'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  Upload,
  File,
  Image as ImageIcon,
  Video,
  Download,
  Trash
} from 'lucide-react';

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadFiles();
  }, []);

  async function loadProjects() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', user.id);
    setProjects(data || []);
    if (data && data.length > 0) {
      setSelectedProject(data[0].id);
    }
  }

  async function loadFiles() {
    const { data } = await supabase
      .from('files')
      .select('*, projects(title)')
      .order('created_at', { ascending: false });
    setFiles(data || []);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${selectedProject}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const fileType = file.type.startsWith('image/') ? 'image' :
                      file.type.startsWith('video/') ? 'video' :
                      file.type.startsWith('application/') ? 'document' : 'other';

      const { error: dbError } = await supabase
        .from('files')
        .insert({
          project_id: selectedProject,
          uploader_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: fileType,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) throw dbError;

      await loadFiles();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Error uploading file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function downloadFile(file: any) {
    const { data, error } = await supabase.storage
      .from('project-files')
      .download(file.file_path);

    if (error) {
      console.error('Download error:', error);
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function deleteFile(file: any) {
    if (!confirm('Are you sure you want to delete this file?')) return;

    await supabase.storage
      .from('project-files')
      .remove([file.file_path]);

    await supabase
      .from('files')
      .delete()
      .eq('id', file.id);

    await loadFiles();
  }

  function getFileIcon(fileType: string) {
    switch (fileType) {
      case 'image': return <ImageIcon className="w-8 h-8 text-blue-600" />;
      case 'video': return <Video className="w-8 h-8 text-purple-600" />;
      default: return <File className="w-8 h-8 text-slate-600" />;
    }
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Files & Documents</h1>
        <p className="text-slate-600">Upload and access all your project files</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Files</h2>
            <p className="text-sm text-slate-600">Upload documents, images, videos, or graphics</p>
          </div>
          {projects.length > 0 && (
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          )}
        </div>

        <label className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 transition-colors">
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || !selectedProject}
          />
          <Upload className="w-12 h-12 text-slate-400 mb-4" />
          <p className="text-slate-700 font-medium mb-2">
            {uploading ? 'Uploading...' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-slate-500">
            Support for documents, images, videos (max 50MB)
          </p>
        </label>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Your Files</h2>

        {files.length === 0 ? (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No files uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map(file => (
              <div key={file.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  {getFileIcon(file.file_type)}
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadFile(file)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => deleteFile(file)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 truncate" title={file.file_name}>
                  {file.file_name}
                </h3>
                <p className="text-xs text-slate-500 mb-2">{file.projects?.title}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{formatFileSize(file.file_size)}</span>
                  <span>{new Date(file.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
