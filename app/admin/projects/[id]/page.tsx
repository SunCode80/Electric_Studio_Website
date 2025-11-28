'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Loader2, Lock, CheckCircle2, Play } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getProject, downloadStageFile, updateProjectStage, uploadStageFile } from '@/lib/api/projects';
import { Project } from '@/lib/types/project';
import { toast } from 'sonner';

export default function ProjectPipelinePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingStage, setGeneratingStage] = useState<number | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  async function loadProject() {
    const data = await getProject(projectId);
    setProject(data);
    setLoading(false);
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

  async function handleDownload(stage: number) {
    try {
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

      toast.success('File downloaded');
    } catch (error) {
      toast.error('Failed to download file');
    }
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
      name: 'Final PDF (S5)',
      description: 'Complete presentation PDF document',
      canGenerate: false,
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
              ].filter(Boolean).length}
              /5 Stages
            </span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((stage) => {
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
                <div className="flex gap-2">
                  {status === 'completed' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(stage.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  )}
                  {stage.canGenerate && status === 'ready' && (
                    <Button
                      size="sm"
                      onClick={() => handleGenerate(stage.id)}
                      disabled={generatingStage !== null}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Generate
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
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {project.s5_completed && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            All stages completed! This project is ready for delivery.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
