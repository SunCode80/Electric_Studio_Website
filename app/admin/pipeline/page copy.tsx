'use client';

/**
 * Admin Pipeline Page - /app/admin/pipeline/page.tsx
 * 
 * Production-ready interface for the S1 → S2 → S3 → S4 → S5 pipeline.
 * Features:
 * - Streaming API calls for S3/S4 (prevents timeouts)
 * - Client-side PDF generation for S5 (100% content fidelity)
 * - Progress tracking with visual feedback
 * - Download buttons for each stage output
 */

import { useState, useCallback } from 'react';
import { 
  Upload, 
  FileJson, 
  Presentation, 
  Video, 
  ListChecks, 
  FileText,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Clock,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { STAGE_METADATA } from '@/lib/prompts';
import { generateS5PDF, downloadPDFBlob, extractBusinessName } from '@/lib/pdfGenerator';

// Types
type StageStatus = 'pending' | 'generating' | 'completed' | 'error';

interface StageState {
  status: StageStatus;
  data: string | null;
  error: string | null;
  generationTime: number | null;
  progress: number;
}

// Stage configuration
const STAGES = [
  { id: 's1', name: 'S1: Survey Data', icon: FileJson, color: 'text-blue-500', bgColor: 'bg-blue-500' },
  { id: 's2', name: 'S2: Presentation', icon: Presentation, color: 'text-purple-500', bgColor: 'bg-purple-500' },
  { id: 's3', name: 'S3: Production Package', icon: Video, color: 'text-green-500', bgColor: 'bg-green-500' },
  { id: 's4', name: 'S4: Assembly Instructions', icon: ListChecks, color: 'text-orange-500', bgColor: 'bg-orange-500' },
  { id: 's5', name: 'S5: Master PDF', icon: FileText, color: 'text-red-500', bgColor: 'bg-red-500' },
];

const initialStageState: StageState = {
  status: 'pending',
  data: null,
  error: null,
  generationTime: null,
  progress: 0
};

export default function PipelinePage() {
  // Stage states
  const [s1, setS1] = useState<StageState>(initialStageState);
  const [s2, setS2] = useState<StageState>(initialStageState);
  const [s3, setS3] = useState<StageState>(initialStageState);
  const [s4, setS4] = useState<StageState>(initialStageState);
  const [s5, setS5] = useState<StageState & { pdfBlob?: Blob }>(initialStageState);
  
  const [activeTab, setActiveTab] = useState('s1');
  const [businessName, setBusinessName] = useState('Client');

  // Get state for a stage
  const getStageState = (stageId: string): StageState => {
    switch (stageId) {
      case 's1': return s1;
      case 's2': return s2;
      case 's3': return s3;
      case 's4': return s4;
      case 's5': return s5;
      default: return initialStageState;
    }
  };

  // Handle S1 file upload
  const handleS1Upload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setS1({ ...initialStageState, status: 'generating', progress: 50 });

    try {
      const content = await file.text();
      
      // Validate JSON
      const parsed = JSON.parse(content);
      
      // Extract business name for later use
      const name = parsed.businessName || parsed.business_name || parsed.companyName || 'Client';
      setBusinessName(name);
      
      setS1({
        status: 'completed',
        data: content,
        error: null,
        generationTime: 0,
        progress: 100
      });
      
      // Auto-advance to S2 tab
      setActiveTab('s2');
    } catch (error) {
      setS1({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'Invalid JSON file',
        generationTime: null,
        progress: 0
      });
    }
  }, []);

  // Generate S2 from S1
  const generateS2 = useCallback(async () => {
    if (!s1.data) return;

    setS2({ ...initialStageState, status: 'generating', progress: 10 });
    const startTime = Date.now();

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setS2(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 5, 90)
        }));
      }, 2000);

      const response = await fetch('/api/generate/s2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s1Data: s1.data }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'S2 generation failed');
      }

      const data = await response.json();
      const generationTime = (Date.now() - startTime) / 1000;

      setS2({
        status: 'completed',
        data: data.output,
        error: null,
        generationTime,
        progress: 100
      });

      setActiveTab('s3');
    } catch (error) {
      setS2({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'S2 generation failed',
        generationTime: null,
        progress: 0
      });
    }
  }, [s1.data]);

  // Generate S3 from S2 (streaming)
  const generateS3 = useCallback(async () => {
    if (!s2.data) return;

    setS3({ ...initialStageState, status: 'generating', progress: 10 });
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate/s3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s2Data: s2.data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'S3 generation failed');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;
        chunkCount++;

        // Update progress based on content length
        const progress = Math.min(10 + (fullContent.length / 500), 95);
        setS3(prev => ({ ...prev, progress, data: fullContent }));
      }

      const generationTime = (Date.now() - startTime) / 1000;

      setS3({
        status: 'completed',
        data: fullContent,
        error: null,
        generationTime,
        progress: 100
      });

      setActiveTab('s4');
    } catch (error) {
      setS3({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'S3 generation failed',
        generationTime: null,
        progress: 0
      });
    }
  }, [s2.data]);

  // Generate S4 from S3 (streaming)
  const generateS4 = useCallback(async () => {
    if (!s3.data) return;

    setS4({ ...initialStageState, status: 'generating', progress: 10 });
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate/s4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3Data: s3.data }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'S4 generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        const progress = Math.min(10 + (fullContent.length / 300), 95);
        setS4(prev => ({ ...prev, progress, data: fullContent }));
      }

      const generationTime = (Date.now() - startTime) / 1000;

      setS4({
        status: 'completed',
        data: fullContent,
        error: null,
        generationTime,
        progress: 100
      });

      setActiveTab('s5');
    } catch (error) {
      setS4({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'S4 generation failed',
        generationTime: null,
        progress: 0
      });
    }
  }, [s3.data]);

  // Generate S5 PDF (client-side)
  const generateS5 = useCallback(async () => {
    if (!s3.data || !s4.data) return;

    setS5({ ...initialStageState, status: 'generating', progress: 10 });
    const startTime = Date.now();

    try {
      // Extract business name from S3 content
      const extractedName = extractBusinessName(s3.data);
      setBusinessName(extractedName || businessName);

      const pdfBlob = await generateS5PDF(
        s3.data,
        s4.data,
        { businessName: extractedName || businessName },
        (progress) => setS5(prev => ({ ...prev, progress }))
      );

      const generationTime = (Date.now() - startTime) / 1000;

      setS5({
        status: 'completed',
        data: 'PDF Generated Successfully',
        error: null,
        generationTime,
        progress: 100,
        pdfBlob
      });
    } catch (error) {
      setS5({
        status: 'error',
        data: null,
        error: error instanceof Error ? error.message : 'PDF generation failed',
        generationTime: null,
        progress: 0
      });
    }
  }, [s3.data, s4.data, businessName]);

  // Download handlers
  const downloadS1 = () => {
    if (!s1.data) return;
    const blob = new Blob([s1.data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName}_S1_Survey.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadS2 = () => {
    if (!s2.data) return;
    const blob = new Blob([s2.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName}_S2_Presentation.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadS3 = () => {
    if (!s3.data) return;
    const blob = new Blob([s3.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName}_S3_ProductionPackage.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadS4 = () => {
    if (!s4.data) return;
    const blob = new Blob([s4.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${businessName}_S4_AssemblyInstructions.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadS5 = () => {
    if (!s5.pdfBlob) return;
    downloadPDFBlob(s5.pdfBlob, `${businessName}_S5_MasterGuide.pdf`);
  };

  // Reset pipeline
  const resetPipeline = () => {
    setS1(initialStageState);
    setS2(initialStageState);
    setS3(initialStageState);
    setS4(initialStageState);
    setS5(initialStageState);
    setActiveTab('s1');
    setBusinessName('Client');
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: StageStatus }) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'generating':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Production Pipeline</h1>
              <p className="text-gray-500 mt-1">S1 → S2 → S3 → S4 → S5 Video Production Workflow</p>
            </div>
            <Button variant="outline" onClick={resetPipeline}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Pipeline
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-2">
              {STAGES.map((stage, index) => {
                const state = getStageState(stage.id);
                const StageIcon = stage.icon;
                return (
                  <div key={stage.id} className="flex items-center">
                    <div 
                      className={`flex flex-col items-center cursor-pointer transition-all ${
                        activeTab === stage.id ? 'scale-110' : ''
                      }`}
                      onClick={() => setActiveTab(stage.id)}
                    >
                      <div className={`p-3 rounded-full ${
                        state.status === 'completed' ? stage.bgColor : 'bg-gray-100'
                      } ${state.status === 'completed' ? 'text-white' : stage.color}`}>
                        <StageIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs mt-2 font-medium">{stage.id.toUpperCase()}</span>
                      <StatusBadge status={state.status} />
                    </div>
                    {index < STAGES.length - 1 && (
                      <ChevronRight className="h-5 w-5 text-gray-300 mx-2" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            {STAGES.map(stage => (
              <TabsTrigger key={stage.id} value={stage.id} className="flex items-center gap-2">
                <stage.icon className={`h-4 w-4 ${stage.color}`} />
                {stage.id.toUpperCase()}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* S1 Tab */}
          <TabsContent value="s1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-blue-500" />
                  {STAGE_METADATA.s1.name}
                </CardTitle>
                <CardDescription>{STAGE_METADATA.s1.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {s1.status === 'pending' && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center hover:border-blue-400 transition-colors">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">Upload your S1 survey JSON file</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleS1Upload}
                      className="hidden"
                      id="s1-upload"
                    />
                    <label htmlFor="s1-upload">
                      <Button asChild>
                        <span>Select JSON File</span>
                      </Button>
                    </label>
                  </div>
                )}

                {s1.status === 'generating' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p>Loading file...</p>
                    <Progress value={s1.progress} className="mt-4 max-w-xs mx-auto" />
                  </div>
                )}

                {s1.status === 'completed' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span>S1 data loaded successfully</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {s1.data?.substring(0, 2000)}
                        {s1.data && s1.data.length > 2000 && '...\n\n[Content truncated]'}
                      </pre>
                    </div>
                    <Button onClick={downloadS1} variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download S1 JSON
                    </Button>
                  </div>
                )}

                {s1.status === 'error' && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{s1.error}</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleS1Upload}
                      className="hidden"
                      id="s1-upload-retry"
                    />
                    <label htmlFor="s1-upload-retry">
                      <Button variant="outline" asChild>
                        <span>Try Again</span>
                      </Button>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* S2 Tab */}
          <TabsContent value="s2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Presentation className="h-5 w-5 text-purple-500" />
                  {STAGE_METADATA.s2.name}
                </CardTitle>
                <CardDescription>{STAGE_METADATA.s2.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {s1.status !== 'completed' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Complete S1 first to generate S2</p>
                  </div>
                )}

                {s1.status === 'completed' && s2.status === 'pending' && (
                  <div className="text-center py-8">
                    <Button onClick={generateS2} size="lg">
                      <Presentation className="h-5 w-5 mr-2" />
                      Generate S2 Presentation
                    </Button>
                    <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      {STAGE_METADATA.s2.estimatedTime}
                    </p>
                  </div>
                )}

                {s2.status === 'generating' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-500" />
                    <p>Generating presentation...</p>
                    <Progress value={s2.progress} className="mt-4 max-w-xs mx-auto" />
                  </div>
                )}

                {s2.status === 'completed' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Generated in {s2.generationTime?.toFixed(1)}s</span>
                      </div>
                      <Button onClick={downloadS2} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download S2
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {s2.data?.substring(0, 3000)}
                        {s2.data && s2.data.length > 3000 && '...\n\n[Content truncated]'}
                      </pre>
                    </div>
                  </div>
                )}

                {s2.status === 'error' && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{s2.error}</p>
                    <Button onClick={generateS2} variant="outline">
                      Retry Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* S3 Tab */}
          <TabsContent value="s3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-green-500" />
                  {STAGE_METADATA.s3.name}
                </CardTitle>
                <CardDescription>{STAGE_METADATA.s3.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {s2.status !== 'completed' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Complete S2 first to generate S3</p>
                  </div>
                )}

                {s2.status === 'completed' && s3.status === 'pending' && (
                  <div className="text-center py-8">
                    <Button onClick={generateS3} size="lg">
                      <Video className="h-5 w-5 mr-2" />
                      Generate S3 Production Package
                    </Button>
                    <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      {STAGE_METADATA.s3.estimatedTime}
                    </p>
                  </div>
                )}

                {s3.status === 'generating' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-500" />
                      <p>Generating production package (streaming)...</p>
                      <Progress value={s3.progress} className="mt-4 max-w-xs mx-auto" />
                    </div>
                    {s3.data && (
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-auto">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {s3.data.slice(-1000)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {s3.status === 'completed' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Generated in {s3.generationTime?.toFixed(1)}s</span>
                      </div>
                      <Button onClick={downloadS3} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download S3
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {s3.data?.substring(0, 3000)}
                        {s3.data && s3.data.length > 3000 && '...\n\n[Content truncated]'}
                      </pre>
                    </div>
                  </div>
                )}

                {s3.status === 'error' && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{s3.error}</p>
                    <Button onClick={generateS3} variant="outline">
                      Retry Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* S4 Tab */}
          <TabsContent value="s4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListChecks className="h-5 w-5 text-orange-500" />
                  {STAGE_METADATA.s4.name}
                </CardTitle>
                <CardDescription>{STAGE_METADATA.s4.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {s3.status !== 'completed' && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Complete S3 first to generate S4</p>
                  </div>
                )}

                {s3.status === 'completed' && s4.status === 'pending' && (
                  <div className="text-center py-8">
                    <Button onClick={generateS4} size="lg">
                      <ListChecks className="h-5 w-5 mr-2" />
                      Generate S4 Assembly Instructions
                    </Button>
                    <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      {STAGE_METADATA.s4.estimatedTime}
                    </p>
                  </div>
                )}

                {s4.status === 'generating' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
                      <p>Generating assembly instructions (streaming)...</p>
                      <Progress value={s4.progress} className="mt-4 max-w-xs mx-auto" />
                    </div>
                    {s4.data && (
                      <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-auto">
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                          {s4.data.slice(-1000)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}

                {s4.status === 'completed' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle2 className="h-5 w-5" />
                        <span>Generated in {s4.generationTime?.toFixed(1)}s</span>
                      </div>
                      <Button onClick={downloadS4} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download S4
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                      <pre className="text-sm text-gray-600 whitespace-pre-wrap">
                        {s4.data?.substring(0, 3000)}
                        {s4.data && s4.data.length > 3000 && '...\n\n[Content truncated]'}
                      </pre>
                    </div>
                  </div>
                )}

                {s4.status === 'error' && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{s4.error}</p>
                    <Button onClick={generateS4} variant="outline">
                      Retry Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* S5 Tab */}
          <TabsContent value="s5">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-500" />
                  {STAGE_METADATA.s5.name}
                </CardTitle>
                <CardDescription>{STAGE_METADATA.s5.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {(s3.status !== 'completed' || s4.status !== 'completed') && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Complete S3 and S4 first to generate S5 PDF</p>
                  </div>
                )}

                {s3.status === 'completed' && s4.status === 'completed' && s5.status === 'pending' && (
                  <div className="text-center py-8">
                    <Button onClick={generateS5} size="lg">
                      <FileText className="h-5 w-5 mr-2" />
                      Generate S5 Master PDF
                    </Button>
                    <p className="text-sm text-gray-500 mt-4 flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4" />
                      {STAGE_METADATA.s5.estimatedTime}
                    </p>
                  </div>
                )}

                {s5.status === 'generating' && (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-red-500" />
                    <p>Generating PDF (client-side)...</p>
                    <Progress value={s5.progress} className="mt-4 max-w-xs mx-auto" />
                  </div>
                )}

                {s5.status === 'completed' && (
                  <div className="text-center py-8 space-y-6">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <span className="text-lg">PDF Generated in {s5.generationTime?.toFixed(1)}s</span>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-lg p-8">
                      <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">{businessName}_S5_MasterGuide.pdf</p>
                      <Button onClick={downloadS5} size="lg">
                        <Download className="h-5 w-5 mr-2" />
                        Download Master PDF
                      </Button>
                    </div>
                  </div>
                )}

                {s5.status === 'error' && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 mb-4">{s5.error}</p>
                    <Button onClick={generateS5} variant="outline">
                      Retry Generation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
