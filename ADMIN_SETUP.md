# Admin Authentication Setup

This project now has secure admin authentication implemented using Supabase.

## How It Works

1. **Database Layer**: An `admin_users` table tracks which users have admin privileges
2. **Middleware Protection**: All `/admin/*` routes are protected by Next.js middleware
3. **Client-Side UI**: The Admin link in the navigation only shows for authenticated admin users
4. **Helper Function**: A PostgreSQL function `is_admin()` checks admin status efficiently

## Setting Up Your First Admin User

After you create a user account, you need to manually grant admin privileges:

### Option 1: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run this query (replace with your user's email):

```sql
-- First, find your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then grant admin access using that ID
INSERT INTO admin_users (id, notes)
VALUES ('your-user-id-here', 'Initial admin user');
```

### Option 2: Using the Supabase Client

You can also use the API route or create a one-time setup script:

```typescript
import { supabase } from '@/lib/supabase/client';

// Get your user ID after signing in
const { data: { user } } = await supabase.auth.getUser();

// Insert into admin_users (requires service role key)
await supabase
  .from('admin_users')
  .insert({ id: user.id, notes: 'Initial admin' });
```

## Security Features

- **Server-Side Validation**: Middleware checks admin status before allowing access
- **Row Level Security**: Admin table has RLS policies to prevent unauthorized access
- **No Client-Side Bypass**: Even if someone modifies the UI, they can't access admin routes
- **Session-Based**: Uses Supabase's built-in authentication sessions

## Admin Routes

Once authenticated as an admin, you can access:

- `/admin` - Admin dashboard with links to all tools
- `/admin/pipeline` - S1-S5 content generation pipeline

## Granting Admin Access to Others

Once you're an admin, you can grant admin access to other users:

```sql
INSERT INTO admin_users (id, created_by, notes)
VALUES ('other-user-id', 'your-user-id', 'Admin approved by [your name]');
```

## Security Notes

- The `ANTHROPIC_API_KEY` is only used server-side in API routes
- Never expose API keys in client-side code
- All admin operations require authentication
- RLS policies ensure data isolation between clients
