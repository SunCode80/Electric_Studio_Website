/*
  # Create Content Strategy Submissions Table

  1. New Tables
    - `content_strategy_submissions`
      - `id` (uuid, primary key) - Unique identifier for each submission
      - `first_name` (text) - Contact first name
      - `last_name` (text) - Contact last name
      - `email` (text) - Contact email address
      - `phone` (text, nullable) - Contact phone number
      - `company_name` (text) - Company name
      - `website_url` (text, nullable) - Company website URL
      - `industry` (text) - Business industry category
      - `business_description` (text) - Description of the business
      - `target_audience` (text) - Description of ideal customer
      - `unique_value` (text) - Unique selling proposition
      - `biggest_challenge` (text) - Current marketing challenge
      - `current_marketing` (jsonb) - Array of current marketing activities
      - `current_content_frequency` (text) - How often they post content
      - `monthly_marketing_budget` (text) - Budget range
      - `primary_goal` (text) - Main business goal
      - `success_metric` (text) - How they measure success
      - `timeline` (text) - When they want to start
      - `interested_services` (jsonb) - Array of services they're interested in
      - `preferred_content_types` (jsonb) - Array of preferred content types
      - `tone_preference` (text) - Brand voice preference
      - `competitor_examples` (text, nullable) - Examples of brands they admire
      - `existing_assets` (jsonb) - Array of existing marketing assets
      - `additional_info` (text, nullable) - Any additional information
      - `created_at` (timestamptz) - Submission timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `content_strategy_submissions` table
    - Add policy for anonymous users to insert submissions (public form)
    - Add policy for authenticated admin users to read all submissions
    
  3. Important Notes
    - This table stores survey submissions from potential clients
    - JSONB columns are used for array data (checkboxes)
    - No RLS restrictions on INSERT to allow public submissions
    - Only authenticated users can read submissions (admin access)
*/

CREATE TABLE IF NOT EXISTS content_strategy_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  company_name text NOT NULL,
  website_url text,
  industry text NOT NULL,
  business_description text NOT NULL,
  target_audience text NOT NULL,
  unique_value text NOT NULL,
  biggest_challenge text NOT NULL,
  current_marketing jsonb NOT NULL DEFAULT '[]'::jsonb,
  current_content_frequency text NOT NULL,
  monthly_marketing_budget text NOT NULL,
  primary_goal text NOT NULL,
  success_metric text NOT NULL,
  timeline text NOT NULL,
  interested_services jsonb NOT NULL DEFAULT '[]'::jsonb,
  preferred_content_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  tone_preference text NOT NULL,
  competitor_examples text,
  existing_assets jsonb NOT NULL DEFAULT '[]'::jsonb,
  additional_info text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE content_strategy_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit the survey"
  ON content_strategy_submissions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all submissions"
  ON content_strategy_submissions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_content_strategy_submissions_created_at 
  ON content_strategy_submissions(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_content_strategy_submissions_email 
  ON content_strategy_submissions(email);
