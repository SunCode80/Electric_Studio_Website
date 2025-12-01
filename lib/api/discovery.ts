// lib/api/discovery.ts
// Discovery Survey API functions for Electric Studio

import { supabase } from '@/lib/supabase/client';
import {
  DiscoverySurvey,
  DiscoverySurveyListItem,
  CreateDiscoverySurveyInput,
  DiscoverySurveyClientData,
  DiscoverySurveyResponses,
  CombinedSurveyData
} from '@/lib/types/discovery';

// Generate a secure access token
function generateAccessToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Simple hash function for passwords (use bcrypt in production)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'electric_studio_discovery_salt');
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('');
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computed = await hashPassword(password);
  return computed === hash;
}

// ============================================
// ADMIN FUNCTIONS
// ============================================

/**
 * Get all discovery surveys for admin dashboard
 */
export async function getDiscoverySurveys(): Promise<DiscoverySurveyListItem[]> {
  const { data, error } = await supabase
    .from('discovery_surveys')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching discovery surveys:', error);
    return [];
  }

  return (data || []).map(survey => ({
    id: survey.id,
    access_token: survey.access_token,
    status: survey.status,
    progress_percentage: survey.progress_percentage || 0,
    created_at: survey.created_at,
    started_at: survey.started_at,
    completed_at: survey.completed_at,
    last_saved_at: survey.last_saved_at,
    business_name: survey.prefilled_data?.business_name || survey.responses?.business_basics?.business_name || 'Unknown',
    owner_name: survey.prefilled_data?.owner_name || survey.responses?.business_basics?.owner_name || 'Unknown',
    email: survey.prefilled_data?.email || survey.responses?.contact_info?.email || '',
    content_strategy_id: survey.content_strategy_id,
    project_id: survey.project_id,
  }));
}

/**
 * Get a single discovery survey by ID (admin)
 */
export async function getDiscoverySurveyById(id: string): Promise<DiscoverySurvey | null> {
  const { data, error } = await supabase
    .from('discovery_surveys')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching discovery survey:', error);
    return null;
  }

  return data;
}

/**
 * Create a new discovery survey (generates link for client)
 */
export async function createDiscoverySurvey(
  input: CreateDiscoverySurveyInput
): Promise<{ survey: DiscoverySurvey; surveyUrl: string } | null> {
  const accessToken = generateAccessToken();

  const { data, error } = await supabase
    .from('discovery_surveys')
    .insert({
      content_strategy_id: input.content_strategy_id,
      access_token: accessToken,
      prefilled_data: input.prefilled_data,
      status: 'pending',
      progress_percentage: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating discovery survey:', error);
    return null;
  }

  // Update the content strategy submission status
  await supabase
    .from('content_strategy_submissions')
    .update({ status: 'discovery_sent' })
    .eq('id', input.content_strategy_id);

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://electricstudio.com');
  const surveyUrl = `${baseUrl}/discovery/${accessToken}`;

  return {
    survey: data,
    surveyUrl,
  };
}

/**
 * Get combined data for S2 generation (merges Content Strategy + Discovery)
 */
export async function getCombinedSurveyData(discoveryId: string): Promise<CombinedSurveyData | null> {
  // Get discovery survey
  const { data: discovery, error: discoveryError } = await supabase
    .from('discovery_surveys')
    .select('*')
    .eq('id', discoveryId)
    .single();

  if (discoveryError || !discovery) {
    console.error('Error fetching discovery survey:', discoveryError);
    return null;
  }

  // Get content strategy submission
  const { data: contentStrategy, error: csError } = await supabase
    .from('content_strategy_submissions')
    .select('*')
    .eq('id', discovery.content_strategy_id)
    .single();

  if (csError || !contentStrategy) {
    console.error('Error fetching content strategy:', csError);
    return null;
  }

  const responses = discovery.responses as DiscoverySurveyResponses;

  return {
    content_strategy_id: contentStrategy.id,
    discovery_id: discovery.id,
    project_id: discovery.project_id,

    // Business Info (prefer discovery data, fallback to content strategy)
    business_name: responses?.business_basics?.business_name || contentStrategy.company_name,
    owner_name: responses?.business_basics?.owner_name || `${contentStrategy.first_name} ${contentStrategy.last_name}`,
    email: responses?.contact_info?.email || contentStrategy.email,
    phone: responses?.contact_info?.phone || contentStrategy.phone,
    industry: responses?.business_basics?.industry || contentStrategy.industry,
    location: responses?.business_basics?.location || '',
    business_description: responses?.business_basics?.business_description || contentStrategy.business_description,

    // Content Strategy data
    content_strategy: {
      biggest_challenge: contentStrategy.biggest_challenge,
      current_marketing: contentStrategy.current_marketing || [],
      primary_goal: contentStrategy.primary_goal,
      success_metric: contentStrategy.success_metric,
      interested_services: contentStrategy.interested_services || [],
      preferred_content_types: contentStrategy.preferred_content_types || [],
      tone_preference: contentStrategy.tone_preference,
      competitor_examples: contentStrategy.competitor_examples,
      existing_assets: contentStrategy.existing_assets || [],
      monthly_marketing_budget: contentStrategy.monthly_marketing_budget,
    },

    // Discovery data
    discovery: responses,

    combined_at: new Date().toISOString(),
  };
}

/**
 * Link discovery survey to a project
 */
export async function linkDiscoveryToProject(discoveryId: string, projectId: string): Promise<boolean> {
  const { error } = await supabase
    .from('discovery_surveys')
    .update({ project_id: projectId })
    .eq('id', discoveryId);

  if (error) {
    console.error('Error linking discovery to project:', error);
    return false;
  }

  return true;
}

// ============================================
// CLIENT FUNCTIONS (for public survey page)
// ============================================

/**
 * Get discovery survey by access token (client-facing)
 */
export async function getDiscoverySurveyByToken(token: string): Promise<DiscoverySurveyClientData | null> {
  const { data, error } = await supabase
    .from('discovery_surveys')
    .select('id, status, progress_percentage, prefilled_data, responses, password_hash')
    .eq('access_token', token)
    .single();

  if (error) {
    console.error('Error fetching discovery survey by token:', error);
    return null;
  }

  return {
    id: data.id,
    status: data.status,
    progress_percentage: data.progress_percentage || 0,
    prefilled_data: data.prefilled_data,
    responses: data.responses,
    has_password: !!data.password_hash,
  };
}

/**
 * Set password for discovery survey (first-time access)
 */
export async function setDiscoverySurveyPassword(token: string, password: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);

  const { error } = await supabase
    .from('discovery_surveys')
    .update({
      password_hash: passwordHash,
      started_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .eq('access_token', token);

  if (error) {
    console.error('Error setting password:', error);
    return false;
  }

  return true;
}

/**
 * Verify discovery survey password
 */
export async function verifyDiscoverySurveyPassword(token: string, password: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('discovery_surveys')
    .select('password_hash')
    .eq('access_token', token)
    .single();

  if (error || !data?.password_hash) {
    return false;
  }

  return verifyPassword(password, data.password_hash);
}

/**
 * Save discovery survey progress (auto-save)
 */
export async function saveDiscoverySurveyProgress(
  token: string,
  responses: Partial<DiscoverySurveyResponses>,
  progressPercentage: number
): Promise<boolean> {
  const { error } = await supabase
    .from('discovery_surveys')
    .update({
      responses,
      progress_percentage: progressPercentage,
      last_saved_at: new Date().toISOString(),
      status: 'in_progress',
    })
    .eq('access_token', token);

  if (error) {
    console.error('Error saving progress:', error);
    return false;
  }

  return true;
}

/**
 * Submit completed discovery survey
 */
export async function submitDiscoverySurvey(
  token: string,
  responses: DiscoverySurveyResponses
): Promise<boolean> {
  const { error } = await supabase
    .from('discovery_surveys')
    .update({
      responses,
      progress_percentage: 100,
      status: 'completed',
      completed_at: new Date().toISOString(),
      last_saved_at: new Date().toISOString(),
    })
    .eq('access_token', token);

  if (error) {
    console.error('Error submitting survey:', error);
    return false;
  }

  // Update content strategy submission status
  const { data: survey } = await supabase
    .from('discovery_surveys')
    .select('content_strategy_id')
    .eq('access_token', token)
    .single();

  if (survey?.content_strategy_id) {
    await supabase
      .from('content_strategy_submissions')
      .update({
        status: 'converted',
        discovery_submitted: true,
      })
      .eq('id', survey.content_strategy_id);
  }

  return true;
}
