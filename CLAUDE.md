# Inventory Management System - Claude Code Instructions

## 📌 Workflow Orchestration & Core Principles

### 1. Plan Mode Default
- Enter plan mode for any non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately
- Use plan mode for verification steps, not just building
- Write detailed specs before coding to reduce ambiguity

### 2. Subagent Strategy
- Use subagents (separate workflows) to keep main context clean
- Offload research, exploration, and external analysis into subagents
- For complex problems, assign one task per subagent for focused execution

### 3. Self-Improvement Loop
- After any correction from the user, update your lessons
- Write rules to prevent the same mistake
- Iteratively reduce your mistake rate
- Review lessons at session start for ongoing improvement

### 4. Verification Before Done
- Don't mark a task complete without proving it works
- Diff behavior between main and changes
- Ask: "Would a staff engineer approve this?"
- Run tests, check logs, and demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "Is there a more elegant way?"
- If a fix feels hacky: implement a clean version if possible
- Skip elegant approach for simple fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- Given a bug report: just fix it, don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching from the user
- Go fix CI failures without being told how

---

## 📌 Task Management Checklist

1. **Plan First**: write plan with checkable items
2. **Verify Plan**: check before implementing
3. **Track Progress**: mark items complete as you go
4. **Explain Changes**: high-level summary for each step
5. **Document Results**: add review section
6. **Capture Lessons**: update lessons after corrections

---

## 📌 Core Principles

- **Simplicity First**: every change should be as simple as possible
- **No Laziness**: find root causes, no temporary hacks
- **Minimal Impact**: only change what's necessary; avoid bugs

---

## 🏗️ Project Context

### Tech Stack

**Frontend & Backend:**
- Next.js 14+ (App Router)
- TypeScript (with `@ts-nocheck` on problematic files)
- Tailwind CSS + shadcn/ui components
- React hooks for state management

**Database & Auth:**
- Supabase (PostgreSQL)
- Row-Level Security (RLS) for permissions
- Real-time subscriptions for live updates
- Built-in authentication (email/password)

**AI Integration:**
- Claude API (Anthropic) - Model: `claude-sonnet-4-5-20250929`
- Natural language inventory search

**Deployment:**
- Vercel (production-ready)

### Architecture Overview

```
Next.js App Router (SSR + Client Components)
├── Server Components: Fetch data, handle auth
├── Client Components: Interactive UI, real-time updates
└── API Routes: AI search, future endpoints

Supabase Backend
├── PostgreSQL Database
├── Row-Level Security (RLS)
├── Database Triggers (auto-status, activity logging)
└── Real-time Subscriptions

Authentication Flow
├── Supabase Auth (email/password)
├── Protected routes via middleware
└── Role-based access (admin/manager/viewer)
```

### Database Schema

**Tables:**
1. `inventory_items` - Core inventory data
2. `user_profiles` - User roles and info
3. `activity_logs` - Audit trail

**Key Features:**
- Auto-status updates via trigger (in_stock/low_stock/ordered/discontinued)
- Activity logging trigger (captures all changes)
- RLS policies for role-based access

### User Roles & Permissions

| Role | View | Create | Update | Delete | Manage Users |
|------|------|--------|--------|--------|--------------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manager | ✅ | ✅ | ✅ | ❌ | ❌ |
| Viewer | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🔧 Common Development Tasks

### Local Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run locally after build
npm start
```

### Database Operations

**Run migrations in Supabase SQL Editor:**
- Primary migration: `supabase/migrations/001_initial_schema.sql`
- Fix RLS issues: `supabase/fix_rls_policies.sql`
- Seed data: `supabase/seed_fixed.sql`

**Test credentials:**
- Admin: `admin@test.com` / `admin@123`
- Manager: `manager@test.com` / `admin@123`
- Viewer: `viewer@test.com` / `admin@123`

### Git Workflow

```bash
# Standard commit
git add -A
git commit -m "descriptive message"

# Deploy to Vercel (automatic on push to main)
git push origin main
```

---

## ⚠️ Known Issues & Solutions

### Issue 1: Infinite Recursion in RLS Policies

**Symptom:** Error `"infinite recursion detected in policy for relation user_profiles"`

**Cause:** RLS policies checking `user_profiles` table to determine permissions creates a loop

**Fix:** Use simplified policies that don't reference the same table
```sql
-- Run: supabase/fix_rls_policies.sql
```

### Issue 2: TypeScript Strict Mode Errors

**Symptom:** Build fails with Supabase type errors

**Solution:** Files with `@ts-nocheck` at the top:
- `app/(dashboard)/layout.tsx`
- `app/(dashboard)/inventory/page.tsx`
- `app/(dashboard)/dashboard/page.tsx`
- `components/inventory-form.tsx`
- `lib/auth/helpers.ts`

**Why:** Supabase generated types are overly strict and cause false positives

### Issue 3: AI Search JSON Parsing

**Symptom:** Error `"Unexpected token '```'"`

**Cause:** Claude API returns JSON wrapped in markdown code blocks

**Fix:** Already implemented - strips markdown before parsing (see `lib/ai/claude-client.ts`)

### Issue 4: Activity Logs Not Showing

**Symptom:** Logs created in DB but not showing on dashboard

**Error Message:**
```
Could not find a relationship between 'activity_logs' and 'user_profiles' in the schema cache
```

**Cause:**
- `activity_logs.user_id` references `auth.users(id)`, not `user_profiles(id)`
- Supabase automatic join syntax only works with direct foreign keys
- No direct foreign key relationship between activity_logs and user_profiles

**Fix:**
1. Updated dashboard query to fetch data separately (already implemented)
2. Manual join logic in application code:
   - Fetch activity_logs
   - Fetch related user_profiles and inventory_items
   - Combine data using array map/find
3. Update RLS policies to allow authenticated users to view profiles

### Issue 5: Buttons Not Showing for Admin/Manager

**Symptom:** "Add Item" and "Edit" buttons not visible

**Causes:**
1. User role not fetched correctly
2. RLS infinite recursion
3. User not logged in as admin/manager

**Fix:**
1. Run `supabase/fix_rls_policies.sql`
2. Verify role in database: `SELECT * FROM user_profiles;`
3. Hard refresh browser after login

### Issue 6: Delete Item Foreign Key Constraint Error

**Symptom:** Error when deleting items: "insert or update on table 'activity_logs' violates foreign key constraint 'activity_logs_item_id_fkey'"

**Cause:**
- Activity logging trigger was using AFTER DELETE
- Tried to insert log entry after item was already deleted
- Foreign key constraint prevents referencing deleted item_id

**Fix:**
1. Run `supabase/fix_delete_trigger.sql`
2. Uses separate triggers:
   - BEFORE DELETE for delete operations (item still exists)
   - AFTER INSERT/UPDATE for create/update operations
3. Ensures deletion is logged before item is removed

**Verification:**
```sql
-- Check triggers are correctly set up
SELECT trigger_name, event_manipulation, event_object_table, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'inventory_items'
ORDER BY trigger_name;
```

---

## 📁 File Structure & Key Files

### Critical Files

**Configuration:**
- `.env.local` - Environment variables (NEVER commit)
- `middleware.ts` - Route protection
- `tsconfig.json` - TypeScript config (strict: false)

**Database:**
- `supabase/migrations/001_initial_schema.sql` - Complete schema
- `supabase/fix_rls_policies.sql` - RLS policy fixes (infinite recursion)
- `supabase/fix_delete_trigger.sql` - Delete trigger fix (foreign key)
- `supabase/seed_fixed.sql` - Sample data

**Auth & Security:**
- `lib/auth/helpers.ts` - Auth utility functions
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client

**AI Integration:**
- `lib/ai/claude-client.ts` - Claude API wrapper
- `app/api/search/ai/route.ts` - AI search endpoint
- `components/smart-search.tsx` - AI search UI

**Core Features:**
- `app/(dashboard)/inventory/page.tsx` - Main inventory list
- `components/inventory-table.tsx` - Sortable table
- `components/inventory-form.tsx` - Add/Edit form
- `app/(dashboard)/dashboard/page.tsx` - Analytics dashboard

### Directory Structure

```
aspire/
├── app/
│   ├── (auth)/                 # Auth pages (login)
│   ├── (dashboard)/            # Protected pages
│   │   ├── dashboard/          # Analytics
│   │   ├── inventory/          # CRUD operations
│   │   └── admin/              # User management
│   └── api/                    # API routes
├── components/                 # React components
├── lib/                        # Utilities
│   ├── ai/                     # Claude integration
│   ├── auth/                   # Auth helpers
│   ├── supabase/               # DB clients
│   └── utils/                  # General utilities
├── supabase/                   # DB migrations & seeds
└── public/                     # Static assets
```

---

## 🚀 Deployment

### Vercel Deployment

1. Push to GitHub
2. Import on Vercel
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   ANTHROPIC_API_KEY
   NEXT_PUBLIC_APP_URL
   ```
4. Deploy automatically

### Post-Deployment

1. Update Supabase redirect URLs
2. Test authentication
3. Verify AI search works
4. Check real-time updates

---

## 🎯 Development Guidelines

### When Adding New Features

1. **Database Changes:**
   - Create new migration file in `supabase/migrations/`
   - Test locally in Supabase SQL Editor first
   - Consider RLS policies (avoid recursion!)
   - Add indexes for frequently queried columns

2. **API Routes:**
   - Use Next.js API routes in `app/api/`
   - Always check authentication first
   - Handle errors gracefully
   - Return consistent JSON format

3. **UI Components:**
   - Use Tailwind CSS for styling
   - Follow existing component patterns
   - Make mobile responsive
   - Add loading states

4. **TypeScript:**
   - Add `@ts-nocheck` only if absolutely necessary
   - Update `lib/types/database.types.ts` for new tables
   - Prefer type safety when possible

### Code Style

- **File naming:** kebab-case for files, PascalCase for components
- **Function naming:** camelCase
- **Comments:** Only for complex logic, not obvious code
- **Imports:** Group by external, internal, types
- **Error handling:** Always catch and log errors

### Testing Checklist

Before marking any feature complete:

- [ ] Test as Admin
- [ ] Test as Manager
- [ ] Test as Viewer (read-only)
- [ ] Test on mobile screen size
- [ ] Check browser console for errors
- [ ] Verify real-time updates work
- [ ] Test with empty state (no data)
- [ ] Check activity logging

---

## 🔍 Debugging Tips

### Check Logs

**Browser Console (F12):**
- Component rendering issues
- Client-side errors
- Network requests

**Terminal (npm run dev):**
- Server-side errors
- Database queries
- API route logs

**Supabase Dashboard:**
- Database logs
- Auth logs
- Real-time connections

### Common Debug Queries

```sql
-- Check user roles
SELECT u.email, up.role
FROM auth.users u
JOIN user_profiles up ON u.id = up.id;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Check activity logs
SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 10;

-- Check inventory items
SELECT * FROM inventory_items ORDER BY created_at DESC LIMIT 10;
```

---

## 📚 Additional Resources

- **Supabase Setup:** `SUPABASE_SETUP.md`
- **Deployment Guide:** `DEPLOYMENT.md`
- **Main README:** `README.md`
- **Claude API Docs:** https://docs.anthropic.com/

---

## 🧠 Lessons Learned

### Database

1. **RLS Recursion:** Never reference the same table in RLS policies
2. **Triggers:** Use SECURITY DEFINER for triggers that need elevated permissions
3. **Indexes:** Add indexes on foreign keys and frequently filtered columns

### Next.js

1. **Server vs Client:** Use server components for data fetching, client for interactivity
2. **Middleware:** Perfect for auth checks and redirects
3. **@ts-nocheck:** Sometimes necessary for Supabase types, use sparingly

### Supabase

1. **Real-time:** Requires proper RLS policies to work
2. **Auth:** Built-in auth is powerful but needs careful RLS configuration
3. **Joins:** Use simplified foreign key syntax for better compatibility

### AI Integration

1. **Model IDs:** Always use latest model ID (check regularly)
2. **Response Format:** Claude may wrap JSON in markdown, handle both cases
3. **Error Handling:** AI can fail, always have fallback to traditional search

---

## 💡 Quick Reference

### Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-api...

# Optional
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Useful Commands

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm start                      # Run production build

# Git
git status                     # Check changes
git add -A                     # Stage all
git commit -m "message"        # Commit
git push                       # Deploy to Vercel

# Database (via Supabase Dashboard)
# SQL Editor → Run migrations
# Authentication → Manage users
```

---

**Last Updated:** 2026-02-24
**Version:** 1.0.0
**Status:** Production Ready ✅
