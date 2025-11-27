'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Building, Mail, Phone, Eye } from 'lucide-react';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  industry: string;
  status: string;
  created_at: string;
  presentation_generated: boolean;
  discovery_submitted: boolean;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const { data, error } = await supabase
        .from('content_strategy_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'new':
        return 'bg-blue-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'on_hold':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-500">Loading submissions...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Strategy Submissions</h1>
        <p className="mt-2 text-gray-600">
          Review and manage all client content strategy submissions
        </p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No submissions yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Submissions will appear here when clients complete the content strategy survey
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">
                      {submission.first_name} {submission.last_name}
                    </CardTitle>
                    <CardDescription className="mt-2 space-y-1">
                      <div className="flex items-center text-sm">
                        <Building className="w-4 h-4 mr-2" />
                        {submission.company_name} - {submission.industry}
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2" />
                        {submission.email}
                      </div>
                      {submission.phone && (
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2" />
                          {submission.phone}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        {formatDate(submission.created_at)}
                      </div>
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={getStatusColor(submission.status)}>
                      {submission.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <div className="flex gap-2 text-xs">
                      {submission.presentation_generated && (
                        <Badge variant="outline" className="bg-green-50">
                          Presentation Generated
                        </Badge>
                      )}
                      {submission.discovery_submitted && (
                        <Badge variant="outline" className="bg-blue-50">
                          Discovery Complete
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/portal/submissions/${submission.id}`)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/admin/pipeline?submission=${submission.id}`)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Manage Pipeline
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
