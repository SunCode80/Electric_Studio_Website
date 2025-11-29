/*
  # Restructure S5 and S6 Pipeline Stages

  1. Changes to content_strategy_submissions table
    - Add s5_output (JSONB) - Will store Stock Library Assets data
    - Keep s6_output (JSONB) - Will store PDF generation metadata
    - s6_output was already created for stock search, now repurposed for PDF

  2. Changes to projects table
    - s5 columns will now represent Stock Library Assets
    - s6 columns will now represent Final PDF
    - No data migration needed as this is new functionality

  3. Purpose
    - Stock Library Assets Generator becomes S5
    - Comprehensive PDF Generator (S3+S4+S5 combined) becomes S6
*/

-- Add s5_output column to content_strategy_submissions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_strategy_submissions' AND column_name = 's5_output'
  ) THEN
    ALTER TABLE content_strategy_submissions ADD COLUMN s5_output JSONB;
  END IF;
END $$;

-- Note: s6_output already exists and will be repurposed for PDF metadata
-- Note: projects table s5_* and s6_* columns already exist with correct structure