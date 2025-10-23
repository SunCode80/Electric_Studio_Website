'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Loader2,
  Sparkles,
  Copy,
  Check,
  Download,
  Video,
  Image as ImageIcon,
  Music,
  FileText,
  BarChart,
  Wand2,
} from 'lucide-react';

interface Submission {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string;
  industry: string;
  business_description: string;
  target_audience: string;
  unique_value: string;
  biggest_challenge: string;
  primary_goal: string;
  success_metric: string;
  interested_services: string[];
  preferred_content_types: string[];
  tone_preference: string;
  monthly_marketing_budget: string;
  timeline: string;
  [key: string]: any;
}

interface GeneratedPrompts {
  voiceover_script: string;
  image_prompts: string[];
  video_prompts: string[];
  infographic_data: string;
  animation_specs: string;
  music_prompt: string;
  assembly_instructions: string;
}

export default function PresentationGeneratorPage() {
  const params = useParams();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [prompts, setPrompts] = useState<GeneratedPrompts | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchSubmission();
    checkExistingPrompts();
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

  const checkExistingPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('presentation_prompts')
        .select('*')
        .eq('submission_id', submissionId)
        .single();

      if (data && !error) {
        setPrompts(data);
      }
    } catch (error) {
      // No existing prompts, that's okay
    }
  };

  const generatePrompts = async () => {
    if (!submission) return;

    setGenerating(true);

    try {
      // Call API route to generate prompts using Claude
      const response = await fetch('/api/generate-presentation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submission }),
      });

      if (!response.ok) throw new Error('Failed to generate prompts');

      const data = await response.json();
      setPrompts(data.prompts);

      // Save to database
      const { error } = await supabase.from('presentation_prompts').upsert({
        submission_id: submissionId,
        ...data.prompts,
        generation_status: 'complete',
      });

      if (error) throw error;

      // Update submission status
      await supabase
        .from('content_strategy_submissions')
        .update({ presentation_generated: true, status: 'reviewed' })
        .eq('id', submissionId);

      toast.success('Presentation prompts generated successfully!');
    } catch (error) {
      console.error('Error generating prompts:', error);
      toast.error('Failed to generate prompts');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedStates({ ...copiedStates, [key]: true });
    toast.success('Copied to clipboard!');
    setTimeout(() => {
      setCopiedStates({ ...copiedStates, [key]: false });
    }, 2000);
  };

  const downloadAllPrompts = () => {
    if (!prompts || !submission) return;

    const content = `
ELECTRIC STUDIO - PRESENTATION PROMPTS
Client: ${submission.company_name}
Generated: ${new Date().toLocaleString()}

========================================
VOICEOVER SCRIPT
========================================

${prompts.voiceover_script}

========================================
IMAGE GENERATION PROMPTS
========================================

${prompts.image_prompts.map((prompt, i) => `Image ${i + 1}:\n${prompt}`).join('\n\n')}

========================================
VIDEO GENERATION PROMPTS
========================================

${prompts.video_prompts.map((prompt, i) => `Video ${i + 1}:\n${prompt}`).join('\n\n')}

========================================
INFOGRAPHIC DATA
========================================

${prompts.infographic_data}

========================================
ANIMATION SPECIFICATIONS
========================================

${prompts.animation_specs}

========================================
MUSIC/SOUND EFFECTS PROMPT
========================================

${prompts.music_prompt}

========================================
ASSEMBLY INSTRUCTIONS
========================================

${prompts.assembly_instructions}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${submission.company_name.replace(/\s+/g, '_')}_presentation_prompts.txt`;
    a.click();
    toast.success('Prompts downloaded!');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Presentation Generator</h1>
              <p className="text-gray-600">
                {submission.company_name} • {submission.first_name} {submission.last_name}
              </p>
            </div>
            {prompts && (
              <Button onClick={downloadAllPrompts}>
                <Download className="mr-2 h-4 w-4" />
                Download All Prompts
              </Button>
            )}
          </div>
        </div>

        {/* Client Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Survey response summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="font-medium">{submission.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Primary Goal</p>
                <p className="font-medium">{submission.primary_goal}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Budget</p>
                <p className="font-medium">{submission.monthly_marketing_budget}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Timeline</p>
                <p className="font-medium">{submission.timeline}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Tone Preference</p>
                <p className="font-medium">{submission.tone_preference}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Services Interest</p>
                <p className="font-medium">{submission.interested_services.slice(0, 2).join(', ')}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Biggest Challenge</p>
              <p className="text-sm">{submission.biggest_challenge}</p>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Unique Value Proposition</p>
              <p className="text-sm">{submission.unique_value}</p>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button or Show Prompts */}
        {!prompts ? (
          <Card>
            <CardHeader>
              <CardTitle>Ready to Generate?</CardTitle>
              <CardDescription>
                This will analyze the survey responses and create customized AI prompts for all
                presentation assets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-3">What will be generated:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <FileText className="mr-2 h-4 w-4 text-blue-600" />
                    Complete voiceover script tailored to their business
                  </li>
                  <li className="flex items-center">
                    <ImageIcon className="mr-2 h-4 w-4 text-blue-600" />
                    5-8 image generation prompts for visuals
                  </li>
                  <li className="flex items-center">
                    <Video className="mr-2 h-4 w-4 text-blue-600" />
                    3-5 video generation prompts for motion content
                  </li>
                  <li className="flex items-center">
                    <BarChart className="mr-2 h-4 w-4 text-blue-600" />
                    Infographic data and specifications
                  </li>
                  <li className="flex items-center">
                    <Wand2 className="mr-2 h-4 w-4 text-blue-600" />
                    Animation specifications
                  </li>
                  <li className="flex items-center">
                    <Music className="mr-2 h-4 w-4 text-blue-600" />
                    Music and sound effects prompt
                  </li>
                  <li className="flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                    Final assembly instructions
                  </li>
                </ul>
              </div>

              <Button onClick={generatePrompts} disabled={generating} size="lg" className="w-full">
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Prompts...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate All Prompts
                  </>
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center mt-4">
                This usually takes 30-60 seconds
              </p>
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="voiceover" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="voiceover">
                <FileText className="mr-2 h-4 w-4" />
                Script
              </TabsTrigger>
              <TabsTrigger value="images">
                <ImageIcon className="mr-2 h-4 w-4" />
                Images
              </TabsTrigger>
              <TabsTrigger value="videos">
                <Video className="mr-2 h-4 w-4" />
                Videos
              </TabsTrigger>
              <TabsTrigger value="infographic">
                <BarChart className="mr-2 h-4 w-4" />
                Infographic
              </TabsTrigger>
              <TabsTrigger value="animation">
                <Wand2 className="mr-2 h-4 w-4" />
                Animation
              </TabsTrigger>
              <TabsTrigger value="music">
                <Music className="mr-2 h-4 w-4" />
                Music
              </TabsTrigger>
              <TabsTrigger value="assembly">
                <Sparkles className="mr-2 h-4 w-4" />
                Assembly
              </TabsTrigger>
            </TabsList>

            {/* Voiceover Script */}
            <TabsContent value="voiceover">
              <Card>
                <CardHeader>
                  <CardTitle>Voiceover Script</CardTitle>
                  <CardDescription>
                    Use this script with ElevenLabs or record yourself
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompts.voiceover_script}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(prompts.voiceover_script, 'voiceover')}
                      variant="outline"
                    >
                      {copiedStates['voiceover'] ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Script
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      Open in ElevenLabs →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Image Prompts */}
            <TabsContent value="images">
              <div className="space-y-4">
                {prompts.image_prompts.map((prompt, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Image {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={prompt} readOnly rows={4} className="font-mono text-sm" />
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => copyToClipboard(prompt, `image-${index}`)}
                          variant="outline"
                          size="sm"
                        >
                          {copiedStates[`image-${index}`] ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          Generate in Midjourney →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Video Prompts */}
            <TabsContent value="videos">
              <div className="space-y-4">
                {prompts.video_prompts.map((prompt, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="text-lg">Video {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Textarea value={prompt} readOnly rows={4} className="font-mono text-sm" />
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => copyToClipboard(prompt, `video-${index}`)}
                          variant="outline"
                          size="sm"
                        >
                          {copiedStates[`video-${index}`] ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          Generate in Runway →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Infographic */}
            <TabsContent value="infographic">
              <Card>
                <CardHeader>
                  <CardTitle>Infographic Data & Specifications</CardTitle>
                  <CardDescription>Use this to create data visualizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompts.infographic_data}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(prompts.infographic_data, 'infographic')}
                      variant="outline"
                    >
                      {copiedStates['infographic'] ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Data
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Animation */}
            <TabsContent value="animation">
              <Card>
                <CardHeader>
                  <CardTitle>Animation Specifications</CardTitle>
                  <CardDescription>Motion graphics and transition specs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompts.animation_specs}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(prompts.animation_specs, 'animation')}
                    variant="outline"
                    className="mt-4"
                  >
                    {copiedStates['animation'] ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Specs
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Music */}
            <TabsContent value="music">
              <Card>
                <CardHeader>
                  <CardTitle>Music & Sound Effects Prompt</CardTitle>
                  <CardDescription>Use with Suno, Udio, or other AI music tools</CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompts.music_prompt}
                    readOnly
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={() => copyToClipboard(prompts.music_prompt, 'music')}
                      variant="outline"
                    >
                      {copiedStates['music'] ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Prompt
                        </>
                      )}
                    </Button>
                    <Button variant="outline">
                      Open Suno →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Assembly */}
            <TabsContent value="assembly">
              <Card>
                <CardHeader>
                  <CardTitle>Final Assembly Instructions</CardTitle>
                  <CardDescription>
                    How to put all the pieces together into the final presentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={prompts.assembly_instructions}
                    readOnly
                    rows={20}
                    className="font-mono text-sm"
                  />
                  <Button
                    onClick={() =>
                      copyToClipboard(prompts.assembly_instructions, 'assembly')
                    }
                    variant="outline"
                    className="mt-4"
                  >
                    {copiedStates['assembly'] ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Instructions
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
