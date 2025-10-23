/*
  # Add status tracking columns to content_strategy_submissions

  1. Changes
    - Add `status` column to track submission lifecycle (new, reviewed, presentation_sent, discovery_sent, converted)
    - Add `presentation_generated` boolean flag
    - Add `discovery_submitted` boolean flag

  2. Notes
    - Uses IF NOT EXISTS pattern to safely add columns
    - Sets sensible defaults for new columns
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 'status'
  ) THEN
    ALTER TABLE content_strategy_submissions ADD COLUMN status text NOT NULL DEFAULT 'new';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 'presentation_generated'
  ) THEN
    ALTER TABLE content_strategy_submissions ADD COLUMN presentation_generated boolean NOT NULL DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 'discovery_submitted'
  ) THEN
    ALTER TABLE content_strategy_submissions ADD COLUMN discovery_submitted boolean NOT NULL DEFAULT false;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_submissions_status 
  ON content_strategy_submissions(status);

CREATE INDEX IF NOT EXISTS idx_submissions_created_at 
  ON content_strategy_submissions(created_at DESC);
