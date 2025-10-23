/*
  # Create presentation_prompts table

  1. New Tables
    - `presentation_prompts`
      - `id` (uuid, primary key)
      - `submission_id` (uuid, foreign key to content_strategy_submissions)
      - `voiceover_script` (text) - Complete voiceover script for presentation
      - `image_prompts` (jsonb array) - Array of AI image generation prompts
      - `video_prompts` (jsonb array) - Array of AI video generation prompts
      - `infographic_data` (text) - Data and specs for infographics
      - `animation_specs` (text) - Animation and motion graphics specifications
      - `music_prompt` (text) - AI music generation prompt
      - `assembly_instructions` (text) - Final assembly guide
      - `generation_status` (text) - Status: pending, in_progress, complete, failed
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `presentation_prompts` table
    - Add policy for authenticated users (admin) to manage presentation prompts
*/

CREATE TABLE IF NOT EXISTS presentation_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES content_strategy_submissions(id) ON DELETE CASCADE,
  voiceover_script text NOT NULL DEFAULT '',
  image_prompts jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_prompts jsonb NOT NULL DEFAULT '[]'::jsonb,
  infographic_data text NOT NULL DEFAULT '',
  animation_specs text NOT NULL DEFAULT '',
  music_prompt text NOT NULL DEFAULT '',
  assembly_instructions text NOT NULL DEFAULT '',
  generation_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE presentation_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presentation prompts"
  ON presentation_prompts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert presentation prompts"
  ON presentation_prompts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update presentation prompts"
  ON presentation_prompts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete presentation prompts"
  ON presentation_prompts FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_presentation_prompts_submission_id 
  ON presentation_prompts(submission_id);
