# 🚀 Deploy to Vercel - Step-by-Step Guide

## Prerequisites Checklist

Before deploying, ensure you have:
- ✅ GitHub repository pushed (DONE!)
- ✅ Supabase project created
- ✅ Anthropic API key
- ✅ All environment variables ready

---

## Step 1: Go to Vercel

1. Open your browser and go to: **https://vercel.com**
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Your Project

1. On Vercel dashboard, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find **"aspire-inventory-system"** (or your repo name)
4. Click **"Import"**

---

## Step 3: Configure Project Settings

### Framework Preset
- Vercel should auto-detect: **Next.js**
- Root Directory: **Leave as `.` (root)**
- Build Command: **Leave default** (`next build`)
- Output Directory: **Leave default** (`.next`)

### Click "Deploy" BUT WAIT! ⚠️

**IMPORTANT:** You need to add environment variables BEFORE deploying!

---

## Step 4: Add Environment Variables

Click **"Environment Variables"** section (expand if collapsed)

Add these 5 variables:

### 1. NEXT_PUBLIC_SUPABASE_URL
```
Value: [Your Supabase project URL]
```
Find it in: Supabase Dashboard → Settings → API → Project URL
Example: `https://xxxxxxxxxxxxx.supabase.co`

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY
```
Value: [Your Supabase anon/public key]
```
Find it in: Supabase Dashboard → Settings → API → Project API keys → `anon` `public`
Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 3. SUPABASE_SERVICE_ROLE_KEY
```
Value: [Your Supabase service role key]
```
Find it in: Supabase Dashboard → Settings → API → Project API keys → `service_role` (click "Reveal")
⚠️ **Keep this secret!**
Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 4. ANTHROPIC_API_KEY
```
Value: [Your Anthropic API key]
```
Find it in: https://console.anthropic.com/settings/keys
Example: `sk-ant-api03-xxxxxxxxxxxxx`

### 5. NEXT_PUBLIC_APP_URL
```
Value: [Leave empty for now, will update after first deploy]
```
Or use: `https://your-project-name.vercel.app` (you can guess it)

---

## Step 5: Deploy!

1. After adding all 5 environment variables
2. Click **"Deploy"**
3. Wait 2-3 minutes for build to complete
4. You'll see confetti 🎉 when it's done!

---

## Step 6: Update Supabase Redirect URLs

After deployment, you need to configure Supabase:

1. Copy your Vercel deployment URL (e.g., `https://aspire-inventory-system.vercel.app`)
2. Go to **Supabase Dashboard**
3. Navigate to: **Authentication** → **URL Configuration**
4. Add to **"Redirect URLs"**:
   ```
   https://your-vercel-url.vercel.app/auth/callback
   https://your-vercel-url.vercel.app/**
   ```
5. Add to **"Site URL"**:
   ```
   https://your-vercel-url.vercel.app
   ```
6. Click **"Save"**

---

## Step 7: Update Environment Variable

1. Go back to Vercel
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Find **NEXT_PUBLIC_APP_URL**
5. Click **"Edit"**
6. Update value to your deployment URL: `https://your-project-name.vercel.app`
7. Click **"Save"**
8. Go to **Deployments** tab
9. Click **"..."** on the latest deployment → **"Redeploy"**

---

## Step 8: Test Your Deployed App

1. Visit your Vercel URL
2. Try logging in with test accounts:
   - Admin: `admin@test.com` / `admin@123`
   - Manager: `manager@test.com` / `password123`
   - Viewer: `viewer@test.com` / `password123`
3. Test these features:
   - ✅ Login/logout
   - ✅ View dashboard
   - ✅ View analytics page
   - ✅ Create/edit/delete items (as admin)
   - ✅ AI search functionality
   - ✅ Real-time updates
   - ✅ CSV export

---

## Troubleshooting

### Issue: "Application error" or blank page
**Solution:** Check Vercel logs
1. Go to Vercel project → **Deployments**
2. Click the deployment → **"View Function Logs"**
3. Look for error messages

### Issue: "Invalid credentials" when logging in
**Solution:** Check Supabase connection
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Check browser console for errors

### Issue: AI search not working
**Solution:** Check API key
1. Verify `ANTHROPIC_API_KEY` is set correctly
2. Make sure key has credits
3. Check browser console for API errors

### Issue: "Access denied" or permissions issues
**Solution:** Check RLS policies
1. Make sure you ran `fix_rls_policies.sql`
2. Verify user role in Supabase: `SELECT * FROM user_profiles;`

### Issue: Build fails
**Solution:** Check build logs
1. Common issue: TypeScript errors
2. Solution: All files should have `// @ts-nocheck` at the top
3. Check Vercel build logs for specific errors

---

## Custom Domain (Optional)

Want a custom domain like `inventory.yourname.com`?

1. In Vercel, go to **Settings** → **Domains**
2. Click **"Add"**
3. Enter your domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (5-30 minutes)

---

## Continuous Deployment

Good news! 🎉 Vercel now auto-deploys on every push to `main`:

1. Make changes locally
2. Commit: `git commit -m "your message"`
3. Push: `git push origin main`
4. Vercel automatically deploys!
5. Check **Deployments** tab to see progress

---

## Environment Variables Reference

Here's a quick copy-paste template (fill in your values):

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Claude AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# App URL (update after first deploy)
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

---

## Success Checklist

Your deployment is successful when:
- ✅ Build completes without errors
- ✅ Can access the live URL
- ✅ Can login with test credentials
- ✅ Dashboard loads with data
- ✅ Analytics page shows charts
- ✅ AI search works
- ✅ Can create/edit items
- ✅ Real-time updates work
- ✅ No console errors in browser

---

## 🎉 You're Live!

Share your project:
- **Live URL:** `https://your-project.vercel.app`
- **GitHub:** `https://github.com/kassemshdy/aspire-inventory-system`
- **Demo Credentials:**
  - Admin: admin@test.com / admin@123
  - Manager: manager@test.com / password123
  - Viewer: viewer@test.com / password123

---

## Performance Tips

To make your app faster:

1. **Enable Edge Functions** (Settings → Functions → Edge Runtime)
2. **Add loading states** (already done!)
3. **Optimize images** (if you add image uploads later)
4. **Enable Vercel Analytics** (Settings → Analytics → Enable)

---

**Need help?** Check the Vercel docs: https://vercel.com/docs

**Last Updated:** 2026-02-24
