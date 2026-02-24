# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - **Name**: inventory-management
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to you
4. Click "Create new project" and wait for it to initialize

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

3. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
ANTHROPIC_API_KEY=your_claude_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3. Run Database Migrations

1. Go to **SQL Editor** in your Supabase dashboard
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run** to execute the migration

This will create:
- ✅ Database tables (inventory_items, user_profiles, activity_logs)
- ✅ Row Level Security policies
- ✅ Automatic triggers for status updates and activity logging
- ✅ Indexes for performance

## 4. Create Test Users

### Option A: Via Supabase Dashboard

1. Go to **Authentication** > **Users**
2. Click **Add user** > **Create new user**
3. Create three users:
   - **Admin**: admin@test.com / password123
   - **Manager**: manager@test.com / password123
   - **Viewer**: viewer@test.com / password123

### Option B: Via SQL

Run this SQL after creating users via the dashboard:

```sql
-- Get user IDs
SELECT id, email FROM auth.users;

-- Update roles (replace UUIDs with actual user IDs)
UPDATE user_profiles SET role = 'admin', full_name = 'Admin User'
WHERE id = 'ADMIN_USER_UUID_HERE';

UPDATE user_profiles SET role = 'manager', full_name = 'Manager User'
WHERE id = 'MANAGER_USER_UUID_HERE';

UPDATE user_profiles SET role = 'viewer', full_name = 'Viewer User'
WHERE id = 'VIEWER_USER_UUID_HERE';
```

## 5. Seed Sample Data

1. In SQL Editor, run:

```sql
SELECT id, email FROM auth.users;
```

2. Copy one of the user IDs (preferably the admin)
3. Open `supabase/seed.sql`
4. Replace all instances of `USER_ID_HERE` with the actual UUID
5. Copy the modified INSERT statements
6. Run in SQL Editor

## 6. Enable Email Authentication

1. Go to **Authentication** > **Providers**
2. Ensure **Email** is enabled
3. Configure email templates if needed (optional)

## 7. (Optional) Configure Google OAuth

1. Go to **Authentication** > **Providers**
2. Enable **Google**
3. Follow Supabase instructions to create Google OAuth credentials
4. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://your-domain.vercel.app/auth/callback`

## 8. Verify Setup

Run these queries to verify everything is set up correctly:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Check user profiles
SELECT * FROM user_profiles;

-- Check inventory items
SELECT COUNT(*) as item_count FROM inventory_items;

-- Check RLS policies are enabled
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

## 9. Test Locally

```bash
npm run dev
```

Navigate to http://localhost:3000 and test:
- ✅ Login with test users
- ✅ Different permissions for admin/manager/viewer
- ✅ CRUD operations work
- ✅ Real-time updates

## Troubleshooting

### Can't connect to Supabase
- Verify `.env.local` has correct credentials
- Check if Supabase project is running (green status in dashboard)
- Restart Next.js dev server after changing environment variables

### Login fails
- Check if user exists in Authentication > Users
- Verify email/password is correct
- Check browser console for error messages

### Permission denied errors
- Verify RLS policies are created (run verification queries)
- Check user_profiles table has the correct role assigned
- Ensure you're logged in with the right user

### Seed data not appearing
- Verify `created_by` UUID matches a real user ID
- Check for SQL errors in the SQL Editor output
- Ensure you ran the migration before seed data

## Database Schema Overview

### Tables

1. **user_profiles**
   - Extends auth.users with role and full_name
   - Roles: admin, manager, viewer

2. **inventory_items**
   - Core inventory data
   - Auto-updates status based on quantity
   - Tracks who created each item

3. **activity_logs**
   - Automatic audit trail
   - Logs all create/update/delete operations
   - Stores change history in JSONB

### Row Level Security

- **Viewers**: Can only read inventory items
- **Managers**: Can read, create, and update items
- **Admins**: Full access including delete and user management

## Next Steps

After completing this setup:
1. Start the development server: `npm run dev`
2. Navigate to http://localhost:3000
3. Log in with admin@test.com / password123
4. Test all features!
