/*
  # Add Admin Role Support

  1. Changes
    - Add `is_admin` column to auth.users metadata via function
    - Create `admin_users` table to track admin status
    - Add RLS policies for admin access control
  
  2. Security
    - Enable RLS on admin_users table
    - Only admins can read admin_users table
    - System/service role can insert/update admin status
*/

-- Create admin_users table to track admin privileges
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  notes text DEFAULT ''
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can check if they are admin
CREATE POLICY "Users can check their own admin status"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy: Only existing admins can grant admin access to others
CREATE POLICY "Admins can view all admin users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Only existing admins can grant admin access
CREATE POLICY "Admins can insert new admins"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Policy: Admins can remove admin access
CREATE POLICY "Admins can delete admin users"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
    )
  );

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert first admin user (replace with your user ID after creating account)
-- You'll need to run this manually with your actual user ID:
-- INSERT INTO admin_users (id, notes) VALUES ('your-user-id-here', 'Initial admin user');
