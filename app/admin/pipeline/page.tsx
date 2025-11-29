'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Play, Download, Copy, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { generateS6ComprehensivePDF, downloadPDFBlob, extractBusinessName } from '@/lib/pdfGenerator';

type PipelineStage = 'S1' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
type StageStatus = 'pending' | 'processing' | 'completed' | 'error';

interface StageState {
  status: StageStatus;
  data: any;
  error?: string;
  progress?: number;
}

const cleanMarkdownCodeFences = (text: string): string => {
  if (!text || typeof text !== 'string') return text;

  let cleaned = text.trim();

  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
};

export default function PipelinePage() {
  const [submissionId, setSubmissionId] = useState<string>('');
  const [stages, setStages] = useState<Record<PipelineStage, StageState>>({
    S1: { status: 'pending', data: null },
    S2: { status: 'pending', data: null },
    S3: { status: 'pending', data: null },
    S4: { status: 'pending', data: null },
    S5: { status: 'pending', data: null },
    S6: { status: 'pending', data: null },
  });
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

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
        S2: { status: data.s2_presentation_data ? 'completed' : 'pending', data: data.s2_presentation_data ? cleanMarkdownCodeFences(data.s2_presentation_data) : null },
        S3: { status: data.s3_video_production_data ? 'completed' : 'pending', data: data.s3_video_production_data ? cleanMarkdownCodeFences(data.s3_video_production_data) : null },
        S4: { status: data.s4_assembly_data ? 'completed' : 'pending', data: data.s4_assembly_data ? cleanMarkdownCodeFences(data.s4_assembly_data) : null },
        S5: { status: data.s5_output ? 'completed' : 'pending', data: data.s5_output },
        S6: { status: 'pending', data: null },
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

      const cleanedOutput = cleanMarkdownCodeFences(result.output);

      setStages((prev) => ({
        ...prev,
        S2: { status: 'completed', data: cleanedOutput, progress: 100 },
      }));

      await supabase
        .from('content_strategy_submissions')
        .update({ s2_presentation_data: cleanedOutput })
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

      const cleanedText = cleanMarkdownCodeFences(accumulatedText);

      setStages((prev) => ({
        ...prev,
        [stage]: { status: 'completed', data: cleanedText, progress: 100 },
      }));

      const updateField = stage === 'S3' ? 's3_video_production_data' : 's4_assembly_data';

      await supabase
        .from('content_strategy_submissions')
        .update({ [updateField]: cleanedText })
        .eq('id', submissionId);

    } catch (error: any) {
      console.error(`Error generating ${stage}:`, error);
      setStages((prev) => ({
        ...prev,
        [stage]: { ...prev[stage], status: 'error', error: error.message },
      }));
    }
  };

  const generateS5 = async () => {
    if (!submissionId) {
      alert('Please enter a submission ID first');
      return;
    }

    if (!stages.S3.data) {
      alert('S3 must be completed first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      S5: { ...prev.S5, status: 'processing', error: undefined, progress: 0 },
    }));

    try {
      const response = await fetch('/api/generate/s5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Data: stages.S3.data }),
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

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);

            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulatedText += parsed.text;
              }
            } catch (e) {
              console.error('Failed to parse chunk:', e);
            }
          }
        }

        setStages((prev) => ({
          ...prev,
          S5: {
            ...prev.S5,
            data: accumulatedText,
            progress: Math.min((prev.S5.progress || 0) + 5, 90),
          },
        }));
      }

      const cleanedText = cleanMarkdownCodeFences(accumulatedText);

      let parsedData: any;
      try {
        const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          parsedData = cleanedText;
        }
      } catch (e) {
        parsedData = cleanedText;
      }

      setStages((prev) => ({
        ...prev,
        S5: { status: 'completed', data: parsedData, progress: 100 },
      }));

      await supabase
        .from('content_strategy_submissions')
        .update({ s5_output: parsedData })
        .eq('id', submissionId);

    } catch (error: any) {
      console.error('Error generating S5:', error);
      setStages((prev) => ({
        ...prev,
        S5: { ...prev.S5, status: 'error', error: error.message },
      }));
    }
  };

  const handleGenerateS6PDF = async () => {
    if (!stages.S3.data || !stages.S4.data || !stages.S5.data) {
      alert('S3, S4, and S5 must be completed first');
      return;
    }

    setStages((prev) => ({
      ...prev,
      S6: { status: 'processing', data: null, progress: 0 },
    }));

    try {
      const businessName = extractBusinessName(stages.S3.data);

      const blob = await generateS6ComprehensivePDF(
        stages.S3.data,
        stages.S4.data,
        stages.S5.data,
        { businessName },
        (progress) => {
          setStages((prev) => ({
            ...prev,
            S6: { ...prev.S6, progress },
          }));
        }
      );

      setPdfBlob(blob);

      setStages((prev) => ({
        ...prev,
        S6: { status: 'completed', data: 'Comprehensive PDF Generated Successfully', progress: 100 },
      }));

    } catch (error: any) {
      console.error('Error generating S6 PDF:', error);
      setStages((prev) => ({
        ...prev,
        S6: { ...prev.S6, status: 'error', error: error.message },
      }));
    }
  };

  const downloadS6PDF = () => {
    if (!pdfBlob) {
      alert('PDF not generated yet');
      return;
    }

    const businessName = extractBusinessName(stages.S3.data || '');
    const filename = `${businessName.replace(/\s+/g, '_')}_Complete_Production_Bible.pdf`;
    downloadPDFBlob(pdfBlob, filename);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const openStockSearch = (platform: string, query: string) => {
    const urls: Record<string, string> = {
      adobeStock: `https://stock.adobe.com/search?k=${encodeURIComponent(query)}`,
      artlist: `https://artlist.io/stock-footage/search/${encodeURIComponent(query)}`,
      storyblocks: `https://www.storyblocks.com/search/${encodeURIComponent(query)}`,
      envatoElements: `https://elements.envato.com/stock-video/${encodeURIComponent(query)}`,
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank');
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

  const renderS5Output = (data: any) => {
    if (!data || typeof data === 'string') {
      return (
        <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-auto">
          <pre className="text-xs text-gray-700 whitespace-pre-wrap">
            {typeof data === 'string' ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <h3 className="text-lg font-semibold text-purple-900 mb-2">
            Stock Library Search Guide
          </h3>
          <p className="text-sm text-purple-700">
            {data.projectName} • {data.assets?.length || 0} Assets
          </p>
        </div>

        {data.assets && data.assets.length > 0 && (
          <div className="space-y-4">
            {data.assets.map((asset: any, idx: number) => (
              <Card key={idx} className="border-purple-200">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base font-semibold text-purple-900">
                        {asset.assetId}
                      </CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {asset.assetType?.toUpperCase()} • {asset.duration || 'N/A'}
                      </CardDescription>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">
                      {asset.assetType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    {asset.originalPrompt && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">
                          Original AI Prompt:
                        </p>
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {asset.originalPrompt}
                        </p>
                      </div>
                    )}

                    {asset.searches && (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-gray-700">
                          Platform Search Queries:
                        </p>

                        {Object.entries(asset.searches).map(([platform, queries]: [string, any]) => (
                          <div key={platform} className="bg-slate-50 rounded-lg p-3">
                            <p className="text-xs font-medium text-purple-700 mb-2 capitalize">
                              {platform.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <div className="space-y-2">
                              {(Array.isArray(queries) ? queries : [queries]).map((query: string, qIdx: number) => (
                                <div key={qIdx} className="flex items-center gap-2">
                                  <code className="flex-1 text-xs bg-white px-2 py-1 rounded border border-gray-200">
                                    {query}
                                  </code>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => copyToClipboard(query, `${platform}-${qIdx}`)}
                                  >
                                    {copiedText === `${platform}-${qIdx}` ? (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 w-7 p-0"
                                    onClick={() => openStockSearch(platform, query)}
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {asset.selectionCriteria && asset.selectionCriteria.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Selection Criteria:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {asset.selectionCriteria.map((criteria: string, cIdx: number) => (
                            <li key={cIdx} className="text-xs text-gray-600">
                              {criteria}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {asset.backupOptions && asset.backupOptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Backup Options:
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {asset.backupOptions.map((option: string, oIdx: number) => (
                            <li key={oIdx} className="text-xs text-gray-600">
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data.platformRecommendations && (
          <Card className="border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-slate-50">
              <CardTitle className="text-base text-purple-900">
                Platform Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.platformRecommendations).map(([key, value]: [string, any]) => (
                  <div key={key} className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-sm text-gray-900 capitalize mb-2">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </h4>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p><span className="font-medium">Best For:</span> {value.bestFor}</p>
                      <p><span className="font-medium">Cost:</span> {value.monthlyCost}</p>
                      <p><span className="font-medium">Feature:</span> {value.keyFeature}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
        <p className="mt-2 text-gray-600">
          S1 → S2 → S3 → S4 → S5 → S6 content generation pipeline
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
        {(['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as PipelineStage[]).map((stage) => {
          const stageInfo = stages[stage];
          const canGenerate =
            stage === 'S1' ? false :
            stage === 'S2' ? stages.S1.status === 'completed' :
            stage === 'S3' ? stages.S2.status === 'completed' :
            stage === 'S4' ? stages.S3.status === 'completed' :
            stage === 'S5' ? stages.S3.status === 'completed' :
            stages.S3.status === 'completed' && stages.S4.status === 'completed' && stages.S5.status === 'completed';

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
                        stage === 'S5' ? 'Stock Library Assets' :
                        'Complete Production Bible'
                      }</CardTitle>
                      <CardDescription className="mt-1">
                        {stage === 'S1' ? 'Client survey responses' :
                         stage === 'S2' ? 'Strategic video presentation (JSON response)' :
                         stage === 'S3' ? 'Complete asset list with AI prompts (streaming)' :
                         stage === 'S4' ? 'Step-by-step assembly guide (streaming)' :
                         stage === 'S5' ? 'Convert AI prompts to stock search keywords (JSON)' :
                         'Combined S3 + S4 + S5 as comprehensive PDF'}
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
                            stage === 'S5' ? generateS5 :
                            handleGenerateS6PDF
                          }
                          disabled={!canGenerate || stageInfo.status === 'processing'}
                          size="sm"
                        >
                          {stageInfo.status === 'processing' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          <span className="ml-2">{stage === 'S6' ? 'Generate PDF' : 'Generate'}</span>
                        </Button>
                        {stage === 'S6' && stageInfo.status === 'completed' && pdfBlob && (
                          <Button
                            onClick={downloadS6PDF}
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
                    stage === 'S5' ? renderS5Output(stageInfo.data) : (
                      <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {typeof stageInfo.data === 'string'
                            ? stageInfo.data
                            : JSON.stringify(stageInfo.data, null, 2)}
                        </pre>
                      </div>
                    )
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
