'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { ArrowLeft, Calendar, File } from 'lucide-react';
import Link from 'next/link';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [files, setFiles] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    if (params.id) {
      loadProject();
    }
  }, [params.id]);

  async function loadProject() {
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .single();

    if (!projectData) {
      router.push('/portal/projects');
      return;
    }

    setProject(projectData);

    const { data: filesData } = await supabase
      .from('files')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false });
    setFiles(filesData || []);

    const { data: meetingsData } = await supabase
      .from('meetings')
      .select('*')
      .eq('project_id', params.id)
      .order('scheduled_at', { ascending: true });
    setMeetings(meetingsData || []);
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
  };

  const statusColor = statusColors[project.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700';

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        href="/portal/projects"
        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Projects
      </Link>

      <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.title}</h1>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
              {project.status}
            </span>
          </div>
        </div>

        <p className="text-slate-600 mb-6">{project.description}</p>

        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-700">Project Progress</span>
            <span className="font-bold text-slate-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-600">Created</p>
            <p className="font-semibold text-slate-900">
              {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-slate-600">Last Updated</p>
            <p className="font-semibold text-slate-900">
              {new Date(project.updated_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <File className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Project Files</h2>
          </div>
          {files.length === 0 ? (
            <p className="text-slate-600 text-sm">No files uploaded yet</p>
          ) : (
            <ul className="space-y-2">
              {files.slice(0, 5).map(file => (
                <li key={file.id} className="text-sm text-slate-700 truncate">
                  • {file.file_name}
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/portal/files"
            className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            View All Files →
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-slate-900">Upcoming Meetings</h2>
          </div>
          {meetings.length === 0 ? (
            <p className="text-slate-600 text-sm">No upcoming meetings</p>
          ) : (
            <ul className="space-y-3">
              {meetings.slice(0, 3).map(meeting => (
                <li key={meeting.id} className="text-sm">
                  <p className="font-semibold text-slate-900">{meeting.title}</p>
                  <p className="text-slate-600">
                    {new Date(meeting.scheduled_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/portal/meetings"
            className="inline-block mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm"
          >
            View All Meetings →
          </Link>
        </div>
      </div>
    </div>
  );
}
