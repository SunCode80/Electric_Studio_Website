'use client';

/**
 * Admin Dashboard - /app/admin/page.tsx
 * 
 * Central hub for Electric Studio administrative tools.
 */

import Link from 'next/link';
import { 
  Video, 
  FileText, 
  Users, 
  Settings,
  ChevronRight,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ADMIN_TOOLS = [
  {
    id: 'pipeline',
    name: 'Production Pipeline',
    description: 'S1 → S2 → S3 → S4 → S5 video production workflow',
    icon: Video,
    href: '/admin/pipeline',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  {
    id: 'projects',
    name: 'Projects',
    description: 'View and manage client projects',
    icon: FileText,
    href: '/admin/projects',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    comingSoon: true,
  },
  {
    id: 'clients',
    name: 'Clients',
    description: 'Client management and survey responses',
    icon: Users,
    href: '/admin/clients',
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    comingSoon: true,
  },
  {
    id: 'settings',
    name: 'Settings',
    description: 'Configure portal settings and integrations',
    icon: Settings,
    href: '/admin/settings',
    color: 'text-gray-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    comingSoon: true,
  },
];

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
          </div>
          <p className="text-gray-500">Electric Studio Administrative Tools</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-600">Pipeline</div>
              <p className="text-sm text-gray-500">Video Production</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">5</div>
              <p className="text-sm text-gray-500">Stages Complete</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">AI</div>
              <p className="text-sm text-gray-500">Powered Automation</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-orange-600">PDF</div>
              <p className="text-sm text-gray-500">Client-Side Gen</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ADMIN_TOOLS.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <Card 
                key={tool.id} 
                className={`${tool.borderColor} border-2 hover:shadow-lg transition-shadow ${
                  tool.comingSoon ? 'opacity-60' : ''
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                      <ToolIcon className={`h-6 w-6 ${tool.color}`} />
                    </div>
                    {tool.comingSoon && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <CardTitle className="mt-4">{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {tool.comingSoon ? (
                    <Button variant="outline" disabled className="w-full">
                      Coming Soon
                    </Button>
                  ) : (
                    <Link href={tool.href}>
                      <Button className="w-full">
                        Open {tool.name}
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Link href="/admin/pipeline">
                <Button>
                  <Video className="h-4 w-4 mr-2" />
                  Start New Pipeline
                </Button>
              </Link>
              <Link href="/content-strategy-survey">
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  View Survey
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  View Website
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
