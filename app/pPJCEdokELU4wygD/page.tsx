'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Download, Sparkles, Search } from 'lucide-react';
import Link from 'next/link';

interface Submission {
  id: string;
  created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  company_name: string;
  industry: string;
  primary_goal: string;
  status: string;
  presentation_generated: boolean;
  interested_services: string[];
  monthly_marketing_budget: string;
}

export default function AdminDashboardPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    filterSubmissions();
  }, [searchTerm, statusFilter, submissions]);

  const fetchSubmissions = async () => {
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
  };

  const filterSubmissions = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.company_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((sub) => sub.status === statusFilter);
    }

    setFilteredSubmissions(filtered);
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

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Name',
      'Email',
      'Company',
      'Industry',
      'Budget',
      'Services',
      'Status',
    ];

    const rows = filteredSubmissions.map((sub) => [
      new Date(sub.created_at).toLocaleDateString(),
      `${sub.first_name} ${sub.last_name}`,
      sub.email,
      sub.company_name,
      sub.industry,
      sub.monthly_marketing_budget,
      sub.interested_services.join('; '),
      sub.status,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Survey Submissions</h1>
          <p className="text-gray-600">
            {submissions.length} total submissions • {filteredSubmissions.length} showing
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">New Submissions</p>
            <p className="text-3xl font-bold">
              {submissions.filter((s) => s.status === 'new').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Presentations Sent</p>
            <p className="text-3xl font-bold">
              {submissions.filter((s) => s.presentation_generated).length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Discovery Phase</p>
            <p className="text-3xl font-bold">
              {submissions.filter((s) => s.status === 'discovery_sent').length}
            </p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">Converted</p>
            <p className="text-3xl font-bold text-green-600">
              {submissions.filter((s) => s.status === 'converted').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg p-4 shadow mb-6 flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, email, or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="presentation_sent">Presentation Sent</SelectItem>
              <SelectItem value="discovery_sent">Discovery Sent</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Presentation</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No submissions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(submission.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {submission.first_name} {submission.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{submission.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{submission.company_name}</TableCell>
                    <TableCell className="text-sm">{submission.industry}</TableCell>
                    <TableCell className="text-sm">
                      {submission.monthly_marketing_budget}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      {submission.presentation_generated ? (
                        <Badge variant="default" className="bg-green-600">
                          Generated
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Yet</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/portal/submissions/${submission.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="mr-1 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                        {!submission.presentation_generated && (
                          <Link href={`/portal/presentations/generate/${submission.id}`}>
                            <Button size="sm">
                              <Sparkles className="mr-1 h-4 w-4" />
                              Generate
                            </Button>
                          </Link>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
