# Admin Access Setup Guide

## Issue
Your admin login system is configured but there are no admin users in the database yet.

## Solution

Follow these steps to create your first admin user:

### Step 1: Get Your Supabase Service Role Key

1. Go to your Supabase Dashboard: https://app.supabase.com/project/fscpplnkvbyyklxiuexy
2. Click on **Settings** (gear icon in the sidebar)
3. Navigate to **API** section
4. Find the **service_role** key (not the anon key)
5. Copy this key

### Step 2: Add Service Role Key to .env

1. Open your `.env` file
2. Replace `your_service_role_key_here` with your actual service role key:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your_actual_key
   ```
3. Save the file

### Step 3: Create Admin User

1. Visit: `http://localhost:3000/setup-admin`
2. Fill in the form:
   - Full Name: Your name
   - Email: admin@electricstudio.com (or your preferred email)
   - Password: Choose a secure password (minimum 6 characters)
3. Click "Create Admin Account"

### Step 4: Login

1. After successful creation, you'll be redirected to `/admin/login`
2. Use the email and password you just created
3. You should now have full admin access

## Security Notes

- The service role key should NEVER be exposed to the client
- The `/setup-admin` endpoint should be disabled or removed after creating your first admin
- Consider adding IP restrictions or removing this endpoint in production

## Troubleshooting

If you get an error:
- Make sure your service role key is correct
- Check that the Supabase project URL is correct in your .env
- Verify that your internet connection is stable
- Check the browser console for detailed error messages
