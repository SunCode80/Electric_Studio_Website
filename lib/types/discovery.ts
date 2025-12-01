// lib/types/discovery.ts
// Discovery Survey types for Electric Studio

export interface DiscoverySurvey {
  id: string;
  client_id?: string;
  content_strategy_id?: string; // Links to ContentStrategySubmission
  project_id?: string; // Links to Project once created

  // Access control
  access_token: string;
  password_hash?: string;

  // Status tracking
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
  current_section?: string;

  // Pre-filled data from Content Strategy Survey
  prefilled_data?: {
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    industry: string;
    business_description: string;
    target_audience: string;
    unique_value: string;
  };

  // Discovery Survey Responses (all sections)
  responses?: DiscoverySurveyResponses;

  // Timestamps
  created_at: string;
  started_at?: string;
  completed_at?: string;
  last_saved_at?: string;
}

export interface DiscoverySurveyResponses {
  // Section 1: Business Basics (mostly pre-filled)
  business_basics: {
    business_name: string;
    owner_name: string;
    industry: string;
    location: string;
    business_description: string;
  };

  // Section 2: Contact & Communication
  contact_info: {
    email: string;
    phone: string;
    communication_preference: 'email' | 'phone' | 'text' | 'video';
    best_contact_time?: 'morning' | 'afternoon' | 'evening' | 'flexible';
  };

  // Section 3: Current Digital Presence
  digital_presence: {
    has_domain: 'yes' | 'no' | 'unsure';
    domain_name?: string;
    domain_access?: 'yes' | 'partial' | 'no';
    has_website: 'no' | 'outdated' | 'rebuild' | 'diy';
    current_website_url?: string;
    email_setup: 'personal' | 'professional' | 'none';
    social_platforms: string[];
    social_handles?: string;
  };

  // Section 4: Brand Assets
  brand_assets: {
    has_logo: 'yes_professional' | 'yes_needs_update' | 'no';
    existing_assets: string[]; // colors, fonts, photos, videos, guidelines, none
    brand_colors?: string;
  };

  // Section 5: Services & Offerings
  services_offerings: {
    services_list: string;
    unique_value: string;
    pricing_display: 'show_all' | 'show_starting' | 'hide' | 'mixed';
  };

  // Section 6: Target Audience
  target_audience: {
    description: string;
    pain_points: string;
    transformation: string;
    platforms: string[]; // instagram, facebook, linkedin, tiktok, youtube, google
  };

  // Section 7: Website Requirements
  website_requirements: {
    pages: string[]; // home, about, services, contact, testimonials, gallery, blog, faq, booking
    features: string[]; // contact_form, booking, social_integration, newsletter, maps, ecommerce, live_chat
    needs_crm: 'yes' | 'maybe' | 'have_one' | 'no';
    current_crm?: string;
  };

  // Section 8: Brand Style & Preferences
  brand_preferences: {
    design_style: 'modern_minimal' | 'bold_energetic' | 'warm_friendly' | 'professional_corporate' | 'creative_artistic' | 'luxury_elegant' | 'let_me_decide';
    brand_tone: string[]; // professional, friendly, expert, inspirational, witty, warm, direct
    websites_like?: string;
    websites_avoid?: string;
  };

  // Section 9: Content & Photography
  content_needs: {
    photography_status: 'have_professional' | 'have_some' | 'need_photography' | 'stock_ok';
    photo_needs?: string[]; // headshots, team, products, location, action
    content_status: 'have_all' | 'have_some' | 'need_all';
    has_testimonials: 'yes_collected' | 'yes_reviews' | 'can_get' | 'no';
  };

  // Section 10: Budget & Timeline
  budget_timeline: {
    initial_budget: 'under_2k' | '2k_5k' | '5k_10k' | '10k_20k' | '20k_plus' | 'flexible';
    monthly_budget?: 'under_500' | '500_1k' | '1k_2k' | '2k_5k' | '5k_plus' | 'none';
    timeline: 'asap' | '1_month' | '2_months' | '3_months' | 'flexible';
    deadline_reason?: string;
  };

  // Section 11: Final Questions
  additional_info: {
    primary_goal: string;
    previous_obstacles?: string;
    questions_concerns?: string;
    additional_notes?: string;
  };
}

// For admin dashboard list view
export interface DiscoverySurveyListItem {
  id: string;
  access_token: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  last_saved_at?: string;

  // From prefilled/responses
  business_name: string;
  owner_name: string;
  email: string;

  // Related records
  content_strategy_id?: string;
  project_id?: string;
}

// For creating a new discovery survey
export interface CreateDiscoverySurveyInput {
  content_strategy_id: string;
  prefilled_data: {
    business_name: string;
    owner_name: string;
    email: string;
    phone: string;
    industry: string;
    business_description: string;
    target_audience: string;
    unique_value: string;
  };
}

// For the client-facing survey page
export interface DiscoverySurveyClientData {
  id: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress_percentage: number;
  prefilled_data: DiscoverySurvey['prefilled_data'];
  responses?: DiscoverySurveyResponses;
  has_password: boolean;
}

// Combined data for S2 generation (merges Content Strategy + Discovery)
export interface CombinedSurveyData {
  // Identifiers
  content_strategy_id: string;
  discovery_id: string;
  project_id?: string;

  // Business Info
  business_name: string;
  owner_name: string;
  email: string;
  phone: string;
  industry: string;
  location: string;
  business_description: string;

  // From Content Strategy Survey
  content_strategy: {
    biggest_challenge: string;
    current_marketing: string[];
    primary_goal: string;
    success_metric: string;
    interested_services: string[];
    preferred_content_types: string[];
    tone_preference: string;
    competitor_examples?: string;
    existing_assets: string[];
    monthly_marketing_budget: string;
  };

  // From Discovery Survey
  discovery: DiscoverySurveyResponses;

  // Metadata
  combined_at: string;
}
