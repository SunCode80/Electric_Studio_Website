/*
  # Add Pipeline Data Columns to Content Strategy Submissions
  
  1. New Columns
    - `survey_data` (jsonb) - Stores S1 survey responses
    - `s2_presentation_data` (text) - Stores S2 presentation output
    - `s3_video_production_data` (text) - Stores S3 production package output
    - `s4_assembly_data` (text) - Stores S4 assembly instructions output
  
  2. Purpose
    - Enable full S1→S2→S3→S4→S5 pipeline functionality
    - Store generated content at each stage
    - Allow pipeline to progress through stages sequentially
  
  3. Notes
    - survey_data uses JSONB for structured query capabilities
    - Other stages use TEXT for large generated content (can exceed 100KB)
    - All columns are nullable (populated as pipeline progresses)
*/

-- Add survey_data column to store S1 data
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 'survey_data'
  ) THEN
    ALTER TABLE content_strategy_submissions 
    ADD COLUMN survey_data jsonb DEFAULT NULL;
  END IF;
END $$;

-- Add s2_presentation_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 's2_presentation_data'
  ) THEN
    ALTER TABLE content_strategy_submissions 
    ADD COLUMN s2_presentation_data text DEFAULT NULL;
  END IF;
END $$;

-- Add s3_video_production_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 's3_video_production_data'
  ) THEN
    ALTER TABLE content_strategy_submissions 
    ADD COLUMN s3_video_production_data text DEFAULT NULL;
  END IF;
END $$;

-- Add s4_assembly_data column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 's4_assembly_data'
  ) THEN
    ALTER TABLE content_strategy_submissions 
    ADD COLUMN s4_assembly_data text DEFAULT NULL;
  END IF;
END $$;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_submissions_s2_status 
  ON content_strategy_submissions(id) 
  WHERE s2_presentation_data IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_s3_status 
  ON content_strategy_submissions(id) 
  WHERE s3_video_production_data IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_submissions_s4_status 
  ON content_strategy_submissions(id) 
  WHERE s4_assembly_data IS NOT NULL;