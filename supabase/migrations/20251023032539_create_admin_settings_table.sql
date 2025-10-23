/*
  # Create admin settings table

  1. New Tables
    - `admin_settings`
      - `id` (uuid, primary key) - Unique identifier
      - `admin_password_hash` (text) - Hashed admin password
      - `notification_email` (text) - Email for notifications
      - `notifications_enabled` (boolean) - Toggle for email notifications
      - `items_per_page` (integer) - Number of items to display per page
      - `default_sort_order` (text) - Default sorting preference
      - `created_at` (timestamptz) - Timestamp of creation
      - `updated_at` (timestamptz) - Timestamp of last update

  2. Security
    - Enable RLS on `admin_settings` table
    - Add policy for public access (simple password auth, no user system)

  3. Notes
    - Single row table for admin settings
    - Password will be stored in environment variable, hash here is for future use
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_password_hash text,
  notification_email text,
  notifications_enabled boolean DEFAULT false,
  items_per_page integer DEFAULT 10,
  default_sort_order text DEFAULT 'date_desc',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to admin settings"
  ON admin_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public updates to admin settings"
  ON admin_settings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public inserts to admin settings"
  ON admin_settings
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Insert default settings row
INSERT INTO admin_settings (
  notification_email,
  notifications_enabled,
  items_per_page,
  default_sort_order
) VALUES (
  'admin@electricstudio.com',
  true,
  10,
  'date_desc'
) ON CONFLICT DO NOTHING;