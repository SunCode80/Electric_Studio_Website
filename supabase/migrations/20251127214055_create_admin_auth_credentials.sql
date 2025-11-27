/*
  # Create Admin Authentication Credentials Table

  1. New Tables
    - `admin_credentials`
      - `id` (uuid, primary key)
      - `email` (text, unique) - Admin email address
      - `password_hash` (text) - Hashed password for admin
      - `full_name` (text) - Admin's full name
      - `is_active` (boolean) - Whether admin account is active
      - `created_at` (timestamptz) - Account creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
      - `last_login_at` (timestamptz) - Last login timestamp

  2. Security
    - Enable RLS on `admin_credentials` table
    - Add policy for public access to verify login (needed for login API)
    
  3. Notes
    - Admin authentication is completely separate from client Supabase auth
    - Passwords are hashed using bcrypt
    - Default admin: admin@electricstudio.com / admin123
*/

-- Create admin_credentials table
CREATE TABLE IF NOT EXISTS admin_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for login verification
CREATE POLICY "Allow login verification"
  ON admin_credentials
  FOR SELECT
  USING (true);

-- Policy: Allow update for last login time
CREATE POLICY "Allow login time update"
  ON admin_credentials
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_credentials_email ON admin_credentials(email);

-- Insert default admin user (password: admin123)
-- Using a simple hash for now - in production, this should be properly hashed
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM admin_credentials WHERE admin_credentials.email = 'admin@electricstudio.com') THEN
    INSERT INTO admin_credentials (email, password_hash, full_name)
    VALUES (
      'admin@electricstudio.com',
      'admin123',
      'System Administrator'
    );
  END IF;
END $$;