import Link from 'next/link';
import { FileText, Users, Settings, BarChart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  const tools = [
    {
      title: 'Production Pipeline',
      description: 'Manage S1-S5 content generation pipeline',
      href: '/admin/pipeline',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: 'Client Management',
      description: 'View and manage all clients',
      href: '/portal/clients',
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Submissions',
      description: 'Review content strategy submissions',
      href: '/admin/submissions',
      icon: BarChart,
      color: 'bg-purple-500',
    },
    {
      title: 'Settings',
      description: 'Configure system settings and prompts',
      href: '/admin/settings',
      icon: Settings,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Manage your content production pipeline and client projects
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className={`${tool.color} p-3 rounded-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle>{tool.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {tool.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500">
              No recent activity to display
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
