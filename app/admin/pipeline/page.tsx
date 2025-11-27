'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, AlertCircle, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

type PipelineStage = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
type StageStatus = 'pending' | 'processing' | 'completed' | 'error';

interface StageState {
  status: StageStatus;
  data: any;
  error?: string;
}

export default function PipelinePage() {
  const [submissionId, setSubmissionId] = useState<string>('');
  const [stages, setStages] = useState<Record<PipelineStage, StageState>>({
    S1: { status: 'pending', data: null },
    S2: { status: 'pending', data: null },
    S3: { status: 'pending', data: null },
    S4: { status: 'pending', data: null },
    S5: { status: 'pending', data: null },
  });

  const loadSubmission = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('content_strategy_submissions')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Submission not found');

      setStages({
        S1: { status: 'completed', data: data.survey_data },
        S2: { status: data.s2_presentation_data ? 'completed' : 'pending', data: data.s2_presentation_data },
        S3: { status: data.s3_video_production_data ? 'completed' : 'pending', data: data.s3_video_production_data },
        S4: { status: data.s4_assembly_data ? 'completed' : 'pending', data: data.s4_assembly_data },
        S5: { status: data.s5_master_guide ? 'completed' : 'pending', data: data.s5_master_guide },
      });
    } catch (error) {
      console.error('Error loading submission:', error);
      alert('Failed to load submission');
    }
  };

  const generateStage = async (stage: 'S2' | 'S3' | 'S4' | 'S5') => {
    if (!submissionId) {
      alert('Please enter a submission ID first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], status: 'processing', error: undefined },
    }));

    try {
      const payload: any = { submissionId };

      if (stage === 'S2') {
        payload.s1Data = stages.S1.data;
      } else if (stage === 'S3') {
        payload.s1Data = stages.S1.data;
        payload.s2Data = stages.S2.data;
      } else if (stage === 'S4') {
        payload.s1Data = stages.S1.data;
        payload.s2Data = stages.S2.data;
        payload.s3Data = stages.S3.data;
      } else if (stage === 'S5') {
        payload.s1Data = stages.S1.data;
        payload.s2Data = stages.S2.data;
        payload.s3Data = stages.S3.data;
        payload.s4Data = stages.S4.data;
      }

      const response = await fetch(`/api/generate/${stage.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Generation failed');
      }

      const result = await response.json();
      const dataKey = `${stage.toLowerCase()}Data`;

      setStages((prev) => ({
        ...prev,
        [stage]: { status: 'completed', data: result[dataKey] },
      }));

      const updateField = `${stage.toLowerCase()}_${stage === 'S2' ? 'presentation' : stage === 'S3' ? 'video_production' : stage === 'S4' ? 'assembly' : 'master_guide'}_data`;
      await supabase
        .from('content_strategy_submissions')
        .update({ [updateField]: result[dataKey] })
        .eq('id', submissionId);

    } catch (error: any) {
      console.error(`Error generating ${stage}:`, error);
      setStages((prev) => ({
        ...prev,
        [stage]: { ...prev[stage], status: 'error', error: error.message },
      }));
    }
  };

  const getStatusIcon = (status: StageStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: StageStatus) => {
    const variants: Record<StageStatus, any> = {
      pending: 'secondary',
      processing: 'default',
      completed: 'default',
      error: 'destructive',
    };

    const colors: Record<StageStatus, string> = {
      pending: 'bg-gray-100 text-gray-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
    };

    return (
      <Badge className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
        <p className="mt-2 text-gray-600">
          Manage the S1-S5 content generation pipeline
        </p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Load Submission</CardTitle>
          <CardDescription>
            Enter a submission ID to load and process through the pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <input
              type="text"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              placeholder="Enter submission ID"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button onClick={() => loadSubmission(submissionId)}>
              Load Submission
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6">
        {(['S1', 'S2', 'S3', 'S4', 'S5'] as PipelineStage[]).map((stage) => {
          const stageInfo = stages[stage];
          const canGenerate = stage === 'S1' ? false :
            stage === 'S2' ? stages.S1.status === 'completed' :
            stage === 'S3' ? stages.S2.status === 'completed' :
            stage === 'S4' ? stages.S3.status === 'completed' :
            stages.S4.status === 'completed';

          return (
            <Card key={stage}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(stageInfo.status)}
                    <div>
                      <CardTitle>{stage} - {
                        stage === 'S1' ? 'Survey Data' :
                        stage === 'S2' ? 'Presentation' :
                        stage === 'S3' ? 'Video Production' :
                        stage === 'S4' ? 'Assembly' :
                        'Master Guide'
                      }</CardTitle>
                      <CardDescription className="mt-1">
                        {stage === 'S1' ? 'Client survey responses' :
                         stage === 'S2' ? 'Strategic presentation' :
                         stage === 'S3' ? 'Video production plans' :
                         stage === 'S4' ? 'Assembly instructions' :
                         'Comprehensive master guide'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(stageInfo.status)}
                    {stage !== 'S1' && (
                      <Button
                        onClick={() => generateStage(stage as any)}
                        disabled={!canGenerate || stageInfo.status === 'processing'}
                        size="sm"
                      >
                        {stageInfo.status === 'processing' ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                        <span className="ml-2">Generate</span>
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              {(stageInfo.data || stageInfo.error) && (
                <CardContent>
                  {stageInfo.error && (
                    <div className="text-red-600 text-sm mb-4">
                      Error: {stageInfo.error}
                    </div>
                  )}
                  {stageInfo.data && (
                    <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-auto">
                      <pre className="text-xs text-gray-700">
                        {JSON.stringify(stageInfo.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
