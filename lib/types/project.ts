export interface Project {
  id: string;
  project_name: string;
  client_name: string;
  project_slug: string;
  current_stage: number;
  status: 'in_progress' | 'completed' | 'on_hold';
  s1_completed: boolean;
  s1_file_path?: string;
  s2_completed: boolean;
  s2_file_path?: string;
  s2_generated_at?: string;
  s3_completed: boolean;
  s3_file_path?: string;
  s3_generated_at?: string;
  s4_completed: boolean;
  s4_file_path?: string;
  s4_generated_at?: string;
  s5_completed: boolean;
  s5_file_path?: string;
  s5_generated_at?: string;
  s6_completed: boolean;
  s6_file_path?: string;
  s6_generated_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  name: string;
  description: string;
  status: 'locked' | 'ready' | 'generating' | 'completed' | 'error';
  fileType: string;
  estimatedTime: string;
  outputSize: string;
}

export interface S1SurveyData {
  companyName: string;
  industry: string;
  website?: string;
  targetAudience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
  };
  businessGoals: {
    primary: string;
    secondary: string[];
    timeline: string;
  };
  brandVoice: {
    tone: string[];
    values: string[];
    personality: string;
  };
  contentPreferences: {
    topics: string[];
    formats: string[];
    frequency: string;
  };
  competitors: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  }[];
  additionalNotes?: string;
}

export interface GenerationRequest {
  projectId: string;
  stage: number;
  inputData: any;
}

export interface GenerationResponse {
  success: boolean;
  stage: number;
  output: string;
  filePath?: string;
  generationTime: number;
  error?: string;
}
