'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Folder, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProjects } from '@/lib/api/projects';
import { Project } from '@/lib/types/project';

export default function AdminDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadProjects();
  }, []);

  async function loadProjects() {
    const data = await getProjects();
    setProjects(data);
    setLoading(false);
  }

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'in_progress').length,
    completed: projects.filter((p) => p.s5_completed).length,
  };

  const getStageProgress = (project: Project) => {
    const stages = [
      project.s1_completed,
      project.s2_completed,
      project.s3_completed,
      project.s4_completed,
      project.s5_completed,
    ];
    const completed = stages.filter((s) => s).length;
    return (completed / 5) * 100;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
          <p className="mt-2 text-gray-600">
            Manage your content production projects
          </p>
        </div>
        <Link href="/admin/projects/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Folder className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Folder className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No projects yet</p>
            <Link href="/admin/projects/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/admin/projects/${project.id}`)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{project.client_name}</CardTitle>
                <CardDescription>{project.project_name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{Math.round(getStageProgress(project))}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${getStageProgress(project)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((stage) => {
                      const isCompleted = (project as any)[`s${stage}_completed`];
                      return (
                        <div
                          key={stage}
                          className={`flex-1 h-2 rounded ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">
                      Stage {project.current_stage}/5
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        project.s5_completed
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {project.s5_completed ? 'Complete' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
