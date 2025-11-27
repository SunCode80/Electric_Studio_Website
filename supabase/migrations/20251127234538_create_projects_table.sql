/*
  # Create Projects Table for Admin Portal

  1. New Tables
    - `projects`
      - `id` (text, primary key) - Unique project identifier
      - `project_name` (text) - Name of the project
      - `client_name` (text) - Client/company name
      - `project_slug` (text) - URL-friendly slug
      - `current_stage` (integer) - Current stage (1-5)
      - `status` (text) - Project status
      - `s1_completed` (boolean) - Stage 1 completion
      - `s1_file_path` (text) - S1 file storage path
      - `s2_completed` (boolean) - Stage 2 completion
      - `s2_file_path` (text) - S2 file storage path
      - `s2_generated_at` (timestamptz) - S2 generation timestamp
      - `s3_completed` (boolean) - Stage 3 completion
      - `s3_file_path` (text) - S3 file storage path
      - `s3_generated_at` (timestamptz) - S3 generation timestamp
      - `s4_completed` (boolean) - Stage 4 completion
      - `s4_file_path` (text) - S4 file storage path
      - `s4_generated_at` (timestamptz) - S4 generation timestamp
      - `s5_completed` (boolean) - Stage 5 completion
      - `s5_file_path` (text) - S5 file storage path
      - `s5_generated_at` (timestamptz) - S5 generation timestamp
      - `notes` (text) - Optional project notes
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS on `projects` table
    - Add policy for authenticated users to manage projects
*/

CREATE TABLE IF NOT EXISTS projects (
  id text PRIMARY KEY,
  project_name text NOT NULL,
  client_name text NOT NULL,
  project_slug text NOT NULL,
  current_stage integer DEFAULT 1,
  status text DEFAULT 'in_progress',
  s1_completed boolean DEFAULT true,
  s1_file_path text,
  s2_completed boolean DEFAULT false,
  s2_file_path text,
  s2_generated_at timestamptz,
  s3_completed boolean DEFAULT false,
  s3_file_path text,
  s3_generated_at timestamptz,
  s4_completed boolean DEFAULT false,
  s4_file_path text,
  s4_generated_at timestamptz,
  s5_completed boolean DEFAULT false,
  s5_file_path text,
  s5_generated_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);