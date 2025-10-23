'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Building2, Mail, Phone, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface ClientSubmission {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  company_name: string;
  company_website: string;
  industry: string;
  primary_goal: string;
  target_audience: string;
  interested_services: string[];
  monthly_marketing_budget: string;
  timeline_to_start: string;
  current_marketing_efforts: string;
  biggest_challenge: string;
  success_metric: string;
  additional_info: string;
  status: string;
  presentation_generated: boolean;
}

export default function ClientDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      const { data, error } = await supabase
        .from('content_strategy_submissions')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;
      setClient(data);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load client data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!client) return;

    setUpdatingStatus(true);
    try {
      const { error } = await supabase
        .from('content_strategy_submissions')
        .update({ status: newStatus })
        .eq('id', clientId);

      if (error) throw error;

      setClient({ ...client, status: newStatus });
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: { [key: string]: any } = {
      new: 'default',
      reviewed: 'secondary',
      presentation_sent: 'outline',
      discovery_sent: 'outline',
      converted: 'default',
    };

    const labels: { [key: string]: string } = {
      new: 'New',
      reviewed: 'Reviewed',
      presentation_sent: 'Presentation Sent',
      discovery_sent: 'Discovery Sent',
      converted: 'Converted',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client not found</h1>
          <Link href="/portal">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/portal">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {client.first_name} {client.last_name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <Building2 className="h-5 w-5" />
                <span className="text-xl">{client.company_name}</span>
              </div>
              {getStatusBadge(client.status)}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-2">Status</p>
              <Select
                value={client.status}
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="presentation_sent">Presentation Sent</SelectItem>
                  <SelectItem value="discovery_sent">Discovery Sent</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="files">Files</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>How to reach this client</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <a href={`mailto:${client.email}`} className="text-blue-600 hover:underline">
                        {client.email}
                      </a>
                    </div>
                  </div>
                  {client.phone_number && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <a href={`tel:${client.phone_number}`} className="text-blue-600 hover:underline">
                          {client.phone_number}
                        </a>
                      </div>
                    </div>
                  )}
                  {client.company_website && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a
                          href={client.company_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {client.company_website}
                        </a>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>Company and industry information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Industry</p>
                    <p className="font-medium">{client.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target Audience</p>
                    <p className="font-medium">{client.target_audience}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Marketing Budget</p>
                      <p className="font-medium">{client.monthly_marketing_budget}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Timeline to Start</p>
                      <p className="font-medium">{client.timeline_to_start}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Survey Submission Summary</CardTitle>
                <CardDescription>
                  Submitted on {new Date(client.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Primary Goal</p>
                  <p className="text-gray-900">{client.primary_goal}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Interested Services</p>
                  <div className="flex flex-wrap gap-2">
                    {client.interested_services.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Current Marketing Efforts</p>
                  <p className="text-gray-900">{client.current_marketing_efforts || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Biggest Challenge</p>
                  <p className="text-gray-900">{client.biggest_challenge || 'Not specified'}</p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Success Metric</p>
                  <p className="text-gray-900">{client.success_metric || 'Not specified'}</p>
                </div>

                {client.additional_info && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">Additional Information</p>
                    <p className="text-gray-900">{client.additional_info}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Presentation Status</p>
                  {client.presentation_generated ? (
                    <Badge className="bg-green-600">Generated</Badge>
                  ) : (
                    <Badge variant="secondary">Not Generated</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
                <CardDescription>Communication history with this client</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-sm">Message functionality will be added in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files">
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
                <CardDescription>Documents and assets shared with this client</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-sm">File management will be added in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Active and completed projects for this client</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-sm">Project tracking will be added in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle>Meetings</CardTitle>
                <CardDescription>Scheduled and past meetings with this client</CardDescription>
              </CardHeader>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <p className="text-lg font-medium mb-2">Coming Soon</p>
                  <p className="text-sm">Meeting schedule will be added in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
