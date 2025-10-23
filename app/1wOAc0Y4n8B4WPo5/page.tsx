'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Sparkles, Mail, Phone, Globe, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  website_url: string;
  industry: string;
  business_description: string;
  target_audience: string;
  unique_value: string;
  biggest_challenge: string;
  current_marketing: string[];
  current_content_frequency: string;
  monthly_marketing_budget: string;
  primary_goal: string;
  success_metric: string;
  timeline: string;
  interested_services: string[];
  preferred_content_types: string[];
  tone_preference: string;
  competitor_examples: string;
  existing_assets: string[];
  additional_info: string;
  status: string;
  presentation_generated: boolean;
  discovery_submitted: boolean;
}

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const { data, error } = await supabase
        .from('content_strategy_submissions')
        .select('*')
        .eq('id', submissionId)
        .single();

      if (error) throw error;
      setSubmission(data);
    } catch (error) {
      console.error('Error fetching submission:', error);
      toast.error('Failed to load submission');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('content_strategy_submissions')
        .update({ status: newStatus })
        .eq('id', submissionId);

      if (error) throw error;

      setSubmission((prev) => (prev ? { ...prev, status: newStatus } : null));
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Submission not found</p>
          <Button onClick={() => router.push('/portal')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{submission.company_name}</h1>
              <p className="text-xl text-gray-600">
                {submission.first_name} {submission.last_name}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex gap-3">
              <Link href={`/portal/presentations/generate/${submission.id}`}>
                <Button>
                  <Sparkles className="mr-2 h-4 w-4" />
                  {submission.presentation_generated ? 'View Presentation' : 'Generate Presentation'}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contact & Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Contact & Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <a href={`mailto:${submission.email}`} className="text-blue-600 hover:underline">
                    {submission.email}
                  </a>
                </div>
                {submission.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <a href={`tel:${submission.phone}`} className="text-blue-600 hover:underline">
                      {submission.phone}
                    </a>
                  </div>
                )}
                {submission.website_url && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-400" />
                    <a
                      href={submission.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {submission.website_url}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Timeline: {submission.timeline}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current Status</p>
                  <Select
                    value={submission.status}
                    onValueChange={updateStatus}
                    disabled={updatingStatus}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="presentation_sent">Presentation Sent</SelectItem>
                      <SelectItem value="discovery_sent">Discovery Survey Sent</SelectItem>
                      <SelectItem value="converted">Converted to Client</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  {submission.presentation_generated && (
                    <Badge variant="default" className="bg-green-600">
                      Presentation Generated
                    </Badge>
                  )}
                  {submission.discovery_submitted && (
                    <Badge variant="default" className="bg-purple-600">
                      Discovery Submitted
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Industry</p>
              <p>{submission.industry}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Business Description</p>
              <p className="text-gray-700">{submission.business_description}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Target Audience</p>
              <p className="text-gray-700">{submission.target_audience}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Unique Value Proposition</p>
              <p className="text-gray-700">{submission.unique_value}</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Situation & Goals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Situation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Biggest Challenge</p>
                <p className="text-gray-700">{submission.biggest_challenge}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Current Marketing</p>
                <div className="flex flex-wrap gap-2">
                  {submission.current_marketing.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Content Frequency</p>
                <p className="text-gray-700">{submission.current_content_frequency}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Monthly Budget</p>
                <p className="text-gray-700 font-semibold">{submission.monthly_marketing_budget}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Goals & Objectives</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Primary Goal</p>
                <p className="text-gray-700">{submission.primary_goal}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Success Metric</p>
                <p className="text-gray-700">{submission.success_metric}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Timeline</p>
                <Badge>{submission.timeline}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Content Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Interested Services</p>
              <div className="flex flex-wrap gap-2">
                {submission.interested_services.map((service) => (
                  <Badge key={service} variant="default">
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Preferred Content Types</p>
              <div className="flex flex-wrap gap-2">
                {submission.preferred_content_types.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tone Preference</p>
              <p className="text-gray-700">{submission.tone_preference}</p>
            </div>

            {submission.competitor_examples && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Competitor Examples</p>
                <p className="text-gray-700">{submission.competitor_examples}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Existing Assets & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Existing Assets</p>
              <div className="flex flex-wrap gap-2">
                {submission.existing_assets.map((asset) => (
                  <Badge key={asset} variant="outline">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>

            {submission.additional_info && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Additional Notes</p>
                <p className="text-gray-700">{submission.additional_info}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
