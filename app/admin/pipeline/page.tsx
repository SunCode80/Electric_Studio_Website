'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Play, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { generateS5PDF, downloadPDFBlob, extractBusinessName } from '@/lib/pdfGenerator';

type PipelineStage = 'S1' | 'S2' | 'S3' | 'S4' | 'S5';
type StageStatus = 'pending' | 'processing' | 'completed' | 'error';

interface StageState {
  status: StageStatus;
  data: any;
  error?: string;
  progress?: number;
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
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

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
        S5: { status: 'pending', data: null },
      });
    } catch (error) {
      console.error('Error loading submission:', error);
      alert('Failed to load submission');
    }
  };

  const generateS2 = async () => {
    if (!submissionId) {
      alert('Please enter a submission ID first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      S2: { ...prev.S2, status: 'processing', error: undefined, progress: 0 },
    }));

    try {
      const response = await fetch('/api/generate/s2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s1Data: stages.S1.data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('S2 API Error Response:', errorData);
        throw new Error(errorData.details || errorData.error || 'Generation failed');
      }

      const result = await response.json();
      console.log('S2 API Success Response:', result);

      if (!result.success || !result.output) {
        throw new Error('Invalid response from API');
      }

      setStages((prev) => ({
        ...prev,
        S2: { status: 'completed', data: result.output, progress: 100 },
      }));

      await supabase
        .from('content_strategy_submissions')
        .update({ s2_presentation_data: result.output })
        .eq('id', submissionId);

    } catch (error: any) {
      console.error('Error generating S2 (Full):', error);
      setStages((prev) => ({
        ...prev,
        S2: { ...prev.S2, status: 'error', error: error.message },
      }));
    }
  };

  const generateStreamingStage = async (stage: 'S3' | 'S4') => {
    if (!submissionId) {
      alert('Please enter a submission ID first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      [stage]: { ...prev[stage], status: 'processing', error: undefined, progress: 0 },
    }));

    try {
      const payload = stage === 'S3' ? { s2Data: stages.S2.data } : { s3Data: stages.S3.data };

      const response = await fetch(`/api/generate/${stage.toLowerCase()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;

        setStages((prev) => ({
          ...prev,
          [stage]: {
            ...prev[stage],
            data: accumulatedText,
            progress: Math.min((prev[stage].progress || 0) + 5, 90),
          },
        }));
      }

      setStages((prev) => ({
        ...prev,
        [stage]: { status: 'completed', data: accumulatedText, progress: 100 },
      }));

      const updateField = stage === 'S3' ? 's3_video_production_data' : 's4_assembly_data';

      await supabase
        .from('content_strategy_submissions')
        .update({ [updateField]: accumulatedText })
        .eq('id', submissionId);

    } catch (error: any) {
      console.error(`Error generating ${stage}:`, error);
      setStages((prev) => ({
        ...prev,
        [stage]: { ...prev[stage], status: 'error', error: error.message },
      }));
    }
  };

  const handleGenerateS5PDF = async () => {
    if (!stages.S3.data || !stages.S4.data) {
      alert('S3 and S4 must be completed first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      S5: { status: 'processing', data: null, progress: 0 },
    }));

    try {
      const businessName = extractBusinessName(stages.S3.data);

      const blob = await generateS5PDF(
        stages.S3.data,
        stages.S4.data,
        { businessName },
        (progress) => {
          setStages((prev) => ({
            ...prev,
            S5: { ...prev.S5, progress },
          }));
        }
      );

      setPdfBlob(blob);

      setStages((prev) => ({
        ...prev,
        S5: { status: 'completed', data: 'PDF Generated Successfully', progress: 100 },
      }));

    } catch (error: any) {
      console.error('Error generating S5 PDF:', error);
      setStages((prev) => ({
        ...prev,
        S5: { ...prev.S5, status: 'error', error: error.message },
      }));
    }
  };

  const downloadS5PDF = () => {
    if (!pdfBlob) {
      alert('PDF not generated yet');
      return;
    }

    const businessName = extractBusinessName(stages.S3.data || '');
    const filename = `${businessName.replace(/\s+/g, '_')}_Production_Guide.pdf`;
    downloadPDFBlob(pdfBlob, filename);
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
          S1 → S2 → S3 → S4 → S5 content generation pipeline
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
          const canGenerate =
            stage === 'S1' ? false :
            stage === 'S2' ? stages.S1.status === 'completed' :
            stage === 'S3' ? stages.S2.status === 'completed' :
            stage === 'S4' ? stages.S3.status === 'completed' :
            stages.S4.status === 'completed' && stages.S3.status === 'completed';

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
                        stage === 'S3' ? 'Video Production Package' :
                        stage === 'S4' ? 'Assembly Instructions' :
                        'Master PDF Guide'
                      }</CardTitle>
                      <CardDescription className="mt-1">
                        {stage === 'S1' ? 'Client survey responses' :
                         stage === 'S2' ? 'Strategic video presentation (JSON response)' :
                         stage === 'S3' ? 'Complete asset list with AI prompts (streaming)' :
                         stage === 'S4' ? 'Step-by-step assembly guide (streaming)' :
                         'Combined S3 + S4 as PDF (client-side)'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusBadge(stageInfo.status)}
                    {stage !== 'S1' && (
                      <>
                        <Button
                          onClick={
                            stage === 'S2' ? generateS2 :
                            stage === 'S3' ? () => generateStreamingStage('S3') :
                            stage === 'S4' ? () => generateStreamingStage('S4') :
                            handleGenerateS5PDF
                          }
                          disabled={!canGenerate || stageInfo.status === 'processing'}
                          size="sm"
                        >
                          {stageInfo.status === 'processing' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span className="ml-2">{stage === 'S5' ? 'Generate PDF' : 'Generate'}</span>
                        </Button>
                        {stage === 'S5' && stageInfo.status === 'completed' && pdfBlob && (
                          <Button
                            onClick={downloadS5PDF}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="w-4 h-4" />
                            <span className="ml-2">Download</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {stageInfo.status === 'processing' && stageInfo.progress !== undefined && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${stageInfo.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{stageInfo.progress}%</p>
                  </div>
                )}
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
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {typeof stageInfo.data === 'string'
                          ? stageInfo.data
                          : JSON.stringify(stageInfo.data, null, 2)}
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
