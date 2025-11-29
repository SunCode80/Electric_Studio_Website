/*
  # Add S6 Columns to Projects Table

  1. Changes
    - Add `s6_completed` (boolean) - Tracks if Stock Library Assets (S6) stage is complete
    - Add `s6_file_path` (text) - Stores path to S6 output file in storage
    - Add `s6_generated_at` (timestamptz) - Timestamp when S6 was generated

  2. Purpose
    - Supports Stock Library Assets Generator (S6) in project pipeline
    - Completes the S1→S2→S3→S4→S5→S6 workflow
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 's6_completed'
  ) THEN
    ALTER TABLE projects ADD COLUMN s6_completed BOOLEAN DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 's6_file_path'
  ) THEN
    ALTER TABLE projects ADD COLUMN s6_file_path TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 's6_generated_at'
  ) THEN
    ALTER TABLE projects ADD COLUMN s6_generated_at TIMESTAMPTZ;
  END IF;
END $$;