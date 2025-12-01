'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Building, Mail, Phone, Eye, Link2, Copy, Check, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createDiscoverySurvey } from '@/lib/api/discovery';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  company_name: string;
  industry: string;
  business_description: string;
  target_audience: string;
  unique_value: string;
  status: string;
  created_at: string;
  presentation_generated: boolean;
  discovery_submitted: boolean;
}

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingLink, setGeneratingLink] = useState<string | null>(null);
  const [discoveryLinkDialog, setDiscoveryLinkDialog] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const router = useRouter();

  async function generateDiscoveryLink(submission: Submission) {
    setGeneratingLink(submission.id);
    try {
      const result = await createDiscoverySurvey({
        content_strategy_id: submission.id,
        prefilled_data: {
          business_name: submission.company_name,
          owner_name: `${submission.first_name} ${submission.last_name}`,
          email: submission.email,
          phone: submission.phone || '',
          industry: submission.industry,
          business_description: submission.business_description || '',
          target_audience: submission.target_audience || '',
          unique_value: submission.unique_value || '',
        },
      });

      if (result) {
        setGeneratedLink(result.surveyUrl);
        setDiscoveryLinkDialog(true);
        toast.success('Discovery survey link generated!');
        fetchSubmissions();
      } else {
        toast.error('Failed to generate discovery link');
      }
    } catch (error) {
      console.error('Error generating discovery link:', error);
      toast.error('Failed to generate discovery link');
    } finally {
      setGeneratingLink(null);
    }
  }

  async function copyDiscoveryLink() {
    await navigator.clipboard.writeText(generatedLink);
    setLinkCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setLinkCopied(false), 2000);
  }

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
      case 'converted':
        return 'bg-green-600';
      case 'discovery_sent':
        return 'bg-sky-500';
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
                  {!submission.discovery_submitted && submission.status !== 'discovery_sent' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateDiscoveryLink(submission)}
                      disabled={generatingLink === submission.id}
                      className="border-sky-300 text-sky-700 hover:bg-sky-50"
                    >
                      {generatingLink === submission.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Link2 className="w-4 h-4 mr-2" />
                      )}
                      Generate Discovery Link
                    </Button>
                  )}
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

      <Dialog open={discoveryLinkDialog} onOpenChange={setDiscoveryLinkDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Discovery Survey Link Generated</DialogTitle>
            <DialogDescription>
              Share this link with your client to have them complete the Discovery Survey.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={generatedLink}
                className="flex-1 px-3 py-2 text-sm border rounded-md bg-gray-50"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={copyDiscoveryLink}
              >
                {linkCopied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              The client will create a password on first access and can save their progress.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDiscoveryLinkDialog(false)}
              >
                Close
              </Button>
              <Button
                onClick={() => router.push('/admin/discovery')}
              >
                View All Discovery Surveys
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
