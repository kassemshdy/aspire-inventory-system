# Deployment Guide

This guide will help you deploy the Inventory Management System to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Completed Supabase setup (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Anthropic API key

## Step 1: Push to GitHub

If you haven't already pushed your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Inventory Management System"

# Create a new repository on GitHub, then:
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Vercel will auto-detect it's a Next.js project
4. Configure your project:
   - **Framework Preset:** Next.js
   - **Root Directory:** ./
   - **Build Command:** `npm run build`
   - **Output Directory:** Leave as default

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings** > **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development**:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### How to get these values:

**Supabase credentials:**
1. Go to your Supabase project
2. Navigate to **Settings** > **API**
3. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

**Anthropic API Key:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Navigate to **API Keys**
3. Create or copy your API key → `ANTHROPIC_API_KEY`

**App URL:**
- Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)

## Step 4: Update Supabase Configuration

After deploying, you need to update Supabase to allow your Vercel domain:

1. Go to your Supabase project
2. Navigate to **Authentication** > **URL Configuration**
3. Add your Vercel URL to:
   - **Site URL:** `https://your-app.vercel.app`
   - **Redirect URLs:** `https://your-app.vercel.app/auth/callback`

## Step 5: Redeploy

After adding environment variables:

1. Go to your Vercel project dashboard
2. Navigate to **Deployments**
3. Click the **...** menu on the latest deployment
4. Select **Redeploy**

Or via CLI:

```bash
vercel --prod
```

## Step 6: Verify Deployment

Visit your Vercel URL and test:

1. **Authentication:**
   - Login with test accounts
   - Check redirect behavior

2. **Inventory Management:**
   - View items
   - Create/edit/delete (based on role)
   - Check real-time updates

3. **AI Search:**
   - Test natural language queries
   - Verify Claude API integration

4. **Features:**
   - CSV export/import
   - Dashboard analytics
   - User management (admin only)

## Troubleshooting

### Build Fails

**Issue:** Build fails with TypeScript errors

**Solution:**
- Check that all @ts-nocheck comments are in place
- Ensure `strict: false` is set in `tsconfig.json`
- Review build logs for specific errors

### Authentication Not Working

**Issue:** Can't log in or redirects fail

**Solution:**
1. Verify environment variables are set correctly in Vercel
2. Check Supabase redirect URLs include your Vercel domain
3. Clear browser cache and cookies
4. Check Vercel logs for errors

### AI Search Not Working

**Issue:** Smart search returns errors

**Solution:**
1. Verify `ANTHROPIC_API_KEY` is set in Vercel
2. Check API key has sufficient credits at console.anthropic.com
3. Review browser console for errors
4. Check Vercel function logs

### Real-time Updates Not Working

**Issue:** Changes don't appear across users

**Solution:**
1. Verify Supabase real-time is enabled
2. Check browser console for WebSocket errors
3. Ensure Supabase project is active (not paused)

### Database Connection Issues

**Issue:** "Failed to fetch" or connection errors

**Solution:**
1. Verify all Supabase environment variables are correct
2. Check Supabase project status
3. Ensure RLS policies are properly configured
4. Review Vercel serverless function logs

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL | `https://abc123.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | `eyJhbGci...` |
| `ANTHROPIC_API_KEY` | Yes | Claude API key | `sk-ant-api...` |
| `NEXT_PUBLIC_APP_URL` | Yes | Your app URL | `https://your-app.vercel.app` |

## Custom Domain (Optional)

To use a custom domain:

1. Go to Vercel project **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_APP_URL` to your custom domain
5. Add custom domain to Supabase redirect URLs

## Monitoring

### Vercel Analytics

Enable analytics in Vercel dashboard:
1. Go to **Analytics** tab
2. Click **Enable Analytics**
3. View real-time traffic and performance metrics

### Error Tracking

View errors in Vercel:
1. Go to **Deployments** tab
2. Click on a deployment
3. View **Functions** logs
4. Check **Build Logs** for build errors

### Supabase Monitoring

Monitor database in Supabase:
1. Go to **Database** > **Logs**
2. View query performance
3. Check for errors

## Continuous Deployment

Vercel automatically deploys:
- **Production:** Commits to `main` branch
- **Preview:** Pull requests and other branches

To disable automatic deployments:
1. Go to **Settings** > **Git**
2. Configure deployment branches

## Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore` by default
2. **Rotate API keys regularly** - Update in Vercel when changed
3. **Use environment-specific keys** - Different keys for dev/staging/prod
4. **Monitor usage** - Check Anthropic and Supabase usage regularly
5. **Review RLS policies** - Ensure database security is correct

## Performance Optimization

### Vercel Edge Network

Your app is automatically deployed to Vercel's global CDN for fast loading worldwide.

### Database Optimization

1. Enable Supabase connection pooling
2. Use indexes (already configured in migrations)
3. Monitor slow queries in Supabase dashboard

### Function Optimization

- Serverless functions have 10s timeout by default
- Upgrade Vercel plan for longer timeouts if needed
- Use edge functions for faster response times

## Cost Monitoring

### Vercel

- **Free Tier:** 100GB bandwidth, 100GB-hours compute
- **Pro Tier:** $20/month for more resources
- Monitor usage in dashboard

### Supabase

- **Free Tier:** 500MB database, 2GB bandwidth
- **Pro Tier:** $25/month for more resources
- Monitor usage in dashboard

### Anthropic

- **Pay-as-you-go** pricing
- Monitor usage at console.anthropic.com
- Set spending limits to avoid surprises

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Review Supabase logs
3. Check browser console errors
4. Review this guide and README.md
5. Open an issue on GitHub

## Next Steps

After successful deployment:

1. **Test thoroughly** - All features and roles
2. **Invite users** - Create accounts in Supabase
3. **Import data** - Use CSV import for initial inventory
4. **Monitor** - Check analytics and logs regularly
5. **Iterate** - Gather feedback and improve

---

**Deployed successfully?** Share your deployed URL and celebrate! 🎉
