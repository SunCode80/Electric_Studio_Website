/*
  # Add S6 Output Column

  1. Changes
    - Add `s6_output` column to `content_strategy_submissions` table
    - Column type: JSONB to store stock library search results
    - Nullable: true (not all submissions will have S6 generated yet)

  2. Purpose
    - Stores Stock Library Assets Generator (S6) output
    - Contains search keywords, platform-specific queries, selection criteria
    - Part of the S1→S2→S3→S4→S5→S6 pipeline workflow
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 's6_output'
  ) THEN
    ALTER TABLE content_strategy_submissions ADD COLUMN s6_output JSONB;
  END IF;
END $$;