import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface ContentStrategySubmission {
  id?: string;
  created_at?: string;
  
  // Contact Information
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name: string;
  website_url?: string;
  
  // Business Information
  industry: string;
  business_description: string;
  target_audience: string;
  unique_value: string;
  
  // Current Situation
  biggest_challenge: string;
  current_marketing: string[];
  current_content_frequency: string;
  monthly_marketing_budget: string;
  
  // Goals & Objectives
  primary_goal: string;
  success_metric: string;
  timeline: string;
  
  // Content Preferences
  interested_services: string[];
  preferred_content_types: string[];
  tone_preference: string;
  competitor_examples?: string;
  
  // Additional Information
  existing_assets: string[];
  additional_info?: string;
  
  // Metadata
  status: 'new' | 'reviewed' | 'presentation_sent' | 'discovery_sent' | 'converted';
  presentation_generated?: boolean;
  discovery_submitted?: boolean;
}

export interface DiscoverySubmission {
  id?: string;
  created_at?: string;
  content_strategy_id?: string;
  
  // Will add detailed fields after we build this
  [key: string]: any;
}

export interface PresentationPrompt {
  id?: string;
  created_at?: string;
  submission_id: string;
  
  // Generated Prompts
  voiceover_script: string;
  image_prompts: string[];
  video_prompts: string[];
  infographic_data: string;
  animation_specs: string;
  music_prompt: string;
  assembly_instructions: string;
  
  // Generated Assets (file paths/URLs)
  voiceover_file?: string;
  image_files?: string[];
  video_files?: string[];
  infographic_file?: string;
  music_file?: string;
  final_presentation?: string;
}
