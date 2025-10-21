import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  progress: number;
}

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    active: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    'on-hold': 'bg-yellow-100 text-yellow-700',
  };

  const statusColor = statusColors[project.status as keyof typeof statusColors] || 'bg-slate-100 text-slate-700';

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-slate-900">{project.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
          {project.status}
        </span>
      </div>

      <p className="text-slate-600 mb-4 line-clamp-2">{project.description}</p>

      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-600">Progress</span>
          <span className="font-semibold text-slate-900">{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${project.progress}%` }}
          />
        </div>
      </div>

      <Link
        href={`/portal/projects/${project.id}`}
        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold transition-colors"
      >
        View Details
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
