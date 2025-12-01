'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Copy,
  Mail,
  ExternalLink,
  RefreshCw,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { getDiscoverySurveys, getCombinedSurveyData } from '@/lib/api/discovery';
import { DiscoverySurveyListItem, CombinedSurveyData } from '@/lib/types/discovery';

export default function DiscoveryDashboard() {
  const [surveys, setSurveys] = useState<DiscoverySurveyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState<DiscoverySurveyListItem | null>(null);
  const [combinedData, setCombinedData] = useState<CombinedSurveyData | null>(null);
  const [viewDataOpen, setViewDataOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadSurveys();
  }, []);

  async function loadSurveys() {
    setLoading(true);
    const data = await getDiscoverySurveys();
    setSurveys(data);
    setLoading(false);
  }

  const pendingSurveys = surveys.filter(s => s.status === 'pending');
  const inProgressSurveys = surveys.filter(s => s.status === 'in_progress');
  const completedSurveys = surveys.filter(s => s.status === 'completed');

  const stats = {
    total: surveys.length,
    pending: pendingSurveys.length,
    inProgress: inProgressSurveys.length,
    completed: completedSurveys.length,
  };

  function getSurveyUrl(token: string) {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    return `${baseUrl}/discovery/${token}`;
  }

  async function copyLink(token: string) {
    const url = getSurveyUrl(token);
    await navigator.clipboard.writeText(url);
    toast.success('Survey link copied to clipboard!');
  }

  function emailClient(survey: DiscoverySurveyListItem) {
    const url = getSurveyUrl(survey.access_token);
    const subject = encodeURIComponent('Complete Your Discovery Survey - Electric Studio');
    const body = encodeURIComponent(
      `Hi ${survey.owner_name},\n\n` +
      `Please complete your Discovery Survey to help us gather the technical details needed to build your solution:\n\n` +
      `${url}\n\n` +
      `This survey takes about 12-15 minutes. Your information from the initial survey has been pre-filled to save you time.\n\n` +
      `Once completed, we'll have everything needed to start building within 24-48 hours.\n\n` +
      `Best,\nElectric Studio`
    );
    window.open(`mailto:${survey.email}?subject=${subject}&body=${body}`);
  }

  async function viewCombinedData(survey: DiscoverySurveyListItem) {
    setSelectedSurvey(survey);
    const data = await getCombinedSurveyData(survey.id);
    setCombinedData(data);
    setViewDataOpen(true);
  }

  async function copyJSON() {
    if (combinedData) {
      await navigator.clipboard.writeText(JSON.stringify(combinedData, null, 2));
      toast.success('Combined survey data copied to clipboard!');
    }
  }

  function startProduction(survey: DiscoverySurveyListItem) {
    router.push(`/admin/projects/create?discovery=${survey.id}`);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading surveys...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Discovery Surveys</h1>
        <p className="mt-2 text-gray-400">
          Manage client discovery surveys and prepare for production
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total Surveys</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Pending</CardTitle>
            <Send className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-electric-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.completed}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-gray-700">
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="data-[state=active]:bg-gray-700">
            In Progress ({stats.inProgress})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-gray-700">
            Completed ({stats.completed})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingSurveys.length === 0 ? (
            <EmptyState
              icon={<Send className="w-16 h-16 text-gray-600" />}
              title="No pending surveys"
              description="Create discovery surveys from the Submissions page to send to clients."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {pendingSurveys.map(survey => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onCopyLink={() => copyLink(survey.access_token)}
                  onEmail={() => emailClient(survey)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          {inProgressSurveys.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-16 h-16 text-gray-600" />}
              title="No surveys in progress"
              description="Clients who have started their survey will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {inProgressSurveys.map(survey => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onCopyLink={() => copyLink(survey.access_token)}
                  onEmail={() => emailClient(survey)}
                  showProgress
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedSurveys.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-16 h-16 text-gray-600" />}
              title="No completed surveys"
              description="Completed surveys ready for production will appear here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {completedSurveys.map(survey => (
                <SurveyCard
                  key={survey.id}
                  survey={survey}
                  onViewData={() => viewCombinedData(survey)}
                  onStartProduction={() => startProduction(survey)}
                  showCompleted
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={viewDataOpen} onOpenChange={setViewDataOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Combined Survey Data</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedSurvey?.business_name} - Ready for S2 generation
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-auto">
            <pre className="bg-gray-900 p-4 rounded-lg text-sm text-gray-300 overflow-auto max-h-[50vh]">
              {combinedData ? JSON.stringify(combinedData, null, 2) : 'Loading...'}
            </pre>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={copyJSON} className="border-gray-600">
              <Copy className="w-4 h-4 mr-2" />
              Copy JSON
            </Button>
            <Button
              className="bg-electric-blue hover:bg-blue-600"
              onClick={() => {
                setViewDataOpen(false);
                if (selectedSurvey) startProduction(selectedSurvey);
              }}
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Start Production
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface SurveyCardProps {
  survey: DiscoverySurveyListItem;
  onCopyLink?: () => void;
  onEmail?: () => void;
  onViewData?: () => void;
  onStartProduction?: () => void;
  showProgress?: boolean;
  showCompleted?: boolean;
}

function SurveyCard({
  survey,
  onCopyLink,
  onEmail,
  onViewData,
  onStartProduction,
  showProgress,
  showCompleted
}: SurveyCardProps) {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-white">{survey.business_name}</CardTitle>
            <CardDescription className="text-gray-400">{survey.owner_name}</CardDescription>
          </div>
          <StatusBadge status={survey.status} progress={survey.progress_percentage} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="text-gray-300">{survey.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Created</span>
            <span className="text-gray-300">
              {new Date(survey.created_at).toLocaleDateString()}
            </span>
          </div>
          {showProgress && survey.last_saved_at && (
            <div className="flex justify-between">
              <span className="text-gray-400">Last Activity</span>
              <span className="text-gray-300">
                {new Date(survey.last_saved_at).toLocaleDateString()}
              </span>
            </div>
          )}
          {showCompleted && survey.completed_at && (
            <div className="flex justify-between">
              <span className="text-gray-400">Completed</span>
              <span className="text-gray-300">
                {new Date(survey.completed_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {showProgress && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{survey.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-electric-blue h-2 rounded-full transition-all"
                style={{ width: `${survey.progress_percentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {(onCopyLink || onEmail) && (
            <>
              {onCopyLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCopyLink}
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                >
                  <Copy className="w-4 h-4 mr-1" />
                  Copy Link
                </Button>
              )}
              {onEmail && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEmail}
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Email
                </Button>
              )}
            </>
          )}
          {showCompleted && (
            <>
              {onViewData && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewData}
                  className="flex-1 border-gray-600 hover:bg-gray-700"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Data
                </Button>
              )}
              {onStartProduction && (
                <Button
                  size="sm"
                  onClick={onStartProduction}
                  className="flex-1 bg-electric-blue hover:bg-blue-600"
                >
                  <ArrowRight className="w-4 h-4 mr-1" />
                  Start Production
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status, progress }: { status: string; progress: number }) {
  switch (status) {
    case 'pending':
      return (
        <Badge variant="outline" className="bg-yellow-900/50 text-yellow-300 border-yellow-700">
          Pending
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-blue-900/50 text-electric-blue border-blue-700">
          {progress}% Complete
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="bg-green-900/50 text-green-300 border-green-700">
          Completed
        </Badge>
      );
    default:
      return null;
  }
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="flex flex-col items-center justify-center py-16">
        {icon}
        <h3 className="mt-4 text-lg font-medium text-white">{title}</h3>
        <p className="mt-2 text-gray-400 text-center max-w-md">{description}</p>
      </CardContent>
    </Card>
  );
}
