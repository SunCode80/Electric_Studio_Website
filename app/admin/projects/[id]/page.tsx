'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Lock, CheckCircle2, Play, Upload, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getProject, downloadStageFile, updateProjectStage, uploadStageFile } from '@/lib/api/projects';
import { Project } from '@/lib/types/project';
import { toast } from 'sonner';
import { generateS6ComprehensivePDF, extractBusinessName } from '@/lib/pdfGenerator';
import { supabase } from '@/lib/supabase/client';

export default function ProjectPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingStage, setGeneratingStage] = useState<number | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [stageToClear, setStageToClear] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    const data = await getProject(projectId);
    setProject(data);
    setLoading(false);
  }

  function cleanMarkdownCodeFences(text: string): string {
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
  }

  async function handleGenerate(stage: number) {
    if (!project) return;

    setGeneratingStage(stage);
    toast.info(`Generating Stage ${stage}...`);

    try {
      let payload: any = {};
      let endpoint = '';

      if (stage === 2) {
        const s1Content = await downloadStageFile(projectId, 1);
        if (!s1Content) throw new Error('S1 data not found');
        payload = { s1Data: s1Content };
        endpoint = '/api/generate/s2';
      } else if (stage === 3) {
        const s2Content = await downloadStageFile(projectId, 2);
        if (!s2Content) throw new Error('S2 data not found');
        payload = { s2Data: s2Content };
        endpoint = '/api/generate/s3';
      } else if (stage === 4) {
        const s3Content = await downloadStageFile(projectId, 3);
        if (!s3Content) throw new Error('S3 data not found');
        payload = { s3Data: s3Content };
        endpoint = '/api/generate/s4';
      } else if (stage === 5) {
        const s3Content = await downloadStageFile(projectId, 3);
        if (!s3Content) throw new Error('S3 data not found');
        payload = { s3Data: s3Content };
        endpoint = '/api/generate/s5';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Generation failed');
      }

      let output: string;

      if (stage === 2) {
        const result = await response.json();
        output = result.output;
      } else if (stage === 5) {
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
                // Ignore parse errors
              }
            }
          }
        }

        output = accumulatedText;
      } else {
        if (!response.body) {
          throw new Error('No response body');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedText = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulatedText += decoder.decode(value);
        }

        output = accumulatedText;
      }

      if ([2, 5].includes(stage)) {
        output = cleanMarkdownCodeFences(output);
      }

      const filePath = await uploadStageFile(projectId, stage, output, 'txt');
      if (!filePath) throw new Error('Failed to upload generated content');

      await updateProjectStage(projectId, stage, {
        completed: true,
        filePath,
        generatedAt: new Date().toISOString(),
      });

      toast.success(`Stage ${stage} completed successfully!`);
      await loadProject();
    } catch (error: any) {
      console.error('Generation error:', error);
      toast.error(`Failed to generate Stage ${stage}: ${error.message}`);
    } finally {
      setGeneratingStage(null);
    }
  }

  async function handleGenerateS6() {
    if (!project) return;

    setGeneratingStage(6);
    toast.info('Generating Comprehensive PDF...');

    try {
      const s3Content = await downloadStageFile(projectId, 3);
      const s4Content = await downloadStageFile(projectId, 4);
      const s5Content = await downloadStageFile(projectId, 5);

      if (!s3Content || !s4Content || !s5Content) {
        throw new Error('S3, S4, and S5 data must all be completed first');
      }

      const cleanS5Content = s5Content.trim();
      let cleanedS5 = cleanS5Content;

      if (cleanedS5.startsWith('```json')) {
        cleanedS5 = cleanedS5.slice(7);
      } else if (cleanedS5.startsWith('```')) {
        cleanedS5 = cleanedS5.slice(3);
      }

      if (cleanedS5.endsWith('```')) {
        cleanedS5 = cleanedS5.slice(0, -3);
      }

      cleanedS5 = cleanedS5.trim();

      let s5Data;
      try {
        s5Data = JSON.parse(cleanedS5);
      } catch (e) {
        console.error('Failed to parse S5 JSON:', e);
        console.log('S5 content:', cleanedS5.substring(0, 500));
        throw new Error('S5 data is not valid JSON');
      }

      const businessName = extractBusinessName(s3Content);
      const pdfBlob = await generateS6ComprehensivePDF(s3Content, s4Content, s5Data, { businessName });

      const file = new File([pdfBlob], `${project.client_name}-Complete-Production-Bible.pdf`, {
        type: 'application/pdf',
      });

      const filePath = await uploadStageFile(projectId, 6, file, 'pdf');
      if (!filePath) throw new Error('Failed to upload PDF');

      await updateProjectStage(projectId, 6, {
        completed: true,
        filePath,
        generatedAt: new Date().toISOString(),
      });

      toast.success('Comprehensive PDF generated successfully!');
      await loadProject();
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.error(`Failed to generate PDF: ${error.message}`);
    } finally {
      setGeneratingStage(null);
    }
  }

  async function handleDownload(stage: number) {
    try {
      if (stage === 6) {
        const filePath = (project as any)[`s${stage}_file_path`];
        if (!filePath) {
          toast.error('File not found');
          return;
        }

        const { data, error } = await supabase.storage
          .from('project-files')
          .download(filePath);

        if (error || !data) {
          toast.error('Failed to download PDF');
          return;
        }

        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.client_name}-Final-Presentation.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        const content = await downloadStageFile(projectId, stage);
        if (!content) {
          toast.error('File not found');
          return;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.client_name}-S${stage}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
  }

  function handleClearStageClick(stageId: number) {
    setStageToClear(stageId);
    setClearModalOpen(true);
  }

  async function handleClearConfirm() {
    if (!stageToClear) return;

    setIsClearing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/clear-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: `s${stageToClear}` }),
      });

      if (!response.ok) {
        throw new Error('Failed to clear stage');
      }

      toast.success(`Stage ${stageToClear} cleared successfully`);
      await loadProject();
      setClearModalOpen(false);
      setStageToClear(null);
    } catch (error: any) {
      console.error('Error clearing stage:', error);
      toast.error(error.message || 'Failed to clear stage');
    } finally {
      setIsClearing(false);
    }
  }

  async function handleCustomUpload(e: React.ChangeEvent<HTMLInputElement>, stageId: number) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      let cleaned = text.trim();

      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      cleaned = cleaned.trim();

      if ([2, 3, 5].includes(stageId)) {
        try {
          JSON.parse(cleaned);
        } catch {
          toast.error('Invalid JSON format. Please check your file.');
          return;
        }
      }

      const response = await fetch(`/api/projects/${projectId}/upload-stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: `s${stageId}`, content: cleaned }),
      });

      if (!response.ok) throw new Error('Upload failed');

      toast.success(`Stage ${stageId} updated successfully`);
      await loadProject();
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(error.message || 'Failed to upload file');
    }

    e.target.value = '';
  }

  function getDownstreamStages(stageId: number): { id: number; name: string }[] {
    const stageMap: Record<number, { id: number; name: string }[]> = {
      2: [
        { id: 3, name: 'Video Production Package' },
        { id: 4, name: 'Assembly Instructions' },
        { id: 5, name: 'Stock Library Assets' },
        { id: 6, name: 'Complete Production Bible' },
      ],
      3: [
        { id: 4, name: 'Assembly Instructions' },
        { id: 5, name: 'Stock Library Assets' },
        { id: 6, name: 'Complete Production Bible' },
      ],
      4: [
        { id: 5, name: 'Stock Library Assets' },
        { id: 6, name: 'Complete Production Bible' },
      ],
      5: [
        { id: 6, name: 'Complete Production Bible' },
      ],
      6: [],
    };
    return stageMap[stageId] || [];
  }

  const stages = [
    {
      id: 1,
      name: 'Survey Data (S1)',
      description: 'Initial client survey and requirements',
      canGenerate: false,
    },
    {
      id: 2,
      name: 'Presentation Outline (S2)',
      description: 'AI-generated content strategy presentation',
      canGenerate: true,
    },
    {
      id: 3,
      name: 'Video Production Package (S3)',
      description: 'Detailed video production specifications',
      canGenerate: true,
    },
    {
      id: 4,
      name: 'Assembly Instructions (S4)',
      description: 'Video editing and assembly guidelines',
      canGenerate: true,
    },
    {
      id: 5,
      name: 'Stock Library Assets (S5)',
      description: 'Convert AI prompts to stock search keywords',
      canGenerate: true,
    },
    {
      id: 6,
      name: 'Complete Production Bible (S6)',
      description: 'Comprehensive PDF combining S3, S4, and S5',
      canGenerate: true,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Project not found</AlertDescription>
      </Alert>
    );
  }

  const getStageStatus = (stageId: number) => {
    const completed = (project as any)[`s${stageId}_completed`];
    if (completed) return 'completed';
    if (stageId === 1) return 'completed';
    if (generatingStage === stageId) return 'generating';

    // S6 requires S3 to be completed (not S5)
    if (stageId === 5) {
      return project.s3_completed ? 'ready' : 'locked';
    }

    if (stageId === 6) {
      return (project.s3_completed && project.s4_completed && project.s5_completed) ? 'ready' : 'locked';
    }

    const prevCompleted = stageId === 1 || (project as any)[`s${stageId - 1}_completed`];
    return prevCompleted ? 'ready' : 'locked';
  };

  return (
    <div>
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.push('/admin')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.client_name}</h1>
            <p className="mt-2 text-gray-600">{project.project_name}</p>
          </div>
          <Badge variant={project.status === 'completed' ? 'default' : 'secondary'}>
            {project.status === 'completed' ? 'Completed' : 'In Progress'}
          </Badge>
        </div>

        <div className="mt-6 bg-gray-100 rounded-lg p-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Overall Progress</span>
            <span className="font-medium">
              {[
                project.s1_completed,
                project.s2_completed,
                project.s3_completed,
                project.s4_completed,
                project.s5_completed,
                project.s6_completed,
              ].filter(Boolean).length}
              /6 Stages
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((stage) => {
              const completed = (project as any)[`s${stage}_completed`];
              return (
                <div
                  key={stage}
                  className={`flex-1 h-3 rounded ${
                    completed ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const completed = (project as any)[`s${stage.id}_completed`];

          return (
            <Card key={stage.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl">{stage.name}</CardTitle>
                      {status === 'completed' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {status === 'locked' && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      {status === 'generating' && (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {stage.description}
                    </CardDescription>
                  </div>
                  <Badge
                    variant={
                      status === 'completed'
                        ? 'default'
                        : status === 'generating'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {status === 'completed' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(stage.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      {stage.id !== 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleClearStageClick(stage.id)}
                          className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Clear Stage
                        </Button>
                      )}
                    </>
                  )}
                  {stage.canGenerate && status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => stage.id === 6 ? handleGenerateS6() : handleGenerate(stage.id)}
                      disabled={generatingStage !== null}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {stage.id === 6 ? 'Generate PDF' : 'Generate'}
                    </Button>
                  )}
                  {status === 'generating' && (
                    <Button size="sm" disabled>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </Button>
                  )}
                  {status === 'locked' && (
                    <Button size="sm" disabled variant="outline">
                      <Lock className="w-4 h-4 mr-2" />
                      Complete previous stage first
                    </Button>
                  )}
                  {stage.id !== 1 && (status === 'ready' || status === 'completed') && (
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".txt,.json"
                        onChange={(e) => handleCustomUpload(e, stage.id)}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Custom
                        </span>
                      </Button>
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {project.s6_completed && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All stages completed! This project is ready for delivery.
          </AlertDescription>
        </Alert>
      )}

      <AlertDialog open={clearModalOpen} onOpenChange={setClearModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-orange-500" />
              Clear Stage {stageToClear} Data?
            </AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3">
                <p>
                  This will clear the data for Stage {stageToClear} and all downstream stages.
                </p>
                {stageToClear && getDownstreamStages(stageToClear).length > 0 && (
                  <div>
                    <p className="font-medium text-gray-900 mb-2">
                      The following stages will also be cleared:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {getDownstreamStages(stageToClear).map(stage => (
                        <li key={stage.id}>
                          S{stage.id}: {stage.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  You can regenerate or upload a custom file after clearing.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearConfirm}
              disabled={isClearing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Clearing...
                </>
              ) : (
                'Clear Stage'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
