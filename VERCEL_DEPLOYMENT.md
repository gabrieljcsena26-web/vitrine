# Vercel Deployment Guide - Fixing 404 Errors

This guide helps you fix 404 errors when deploying the Vitrine project to Vercel.

## ✅ Quick Diagnosis

Your Next.js app **builds successfully locally** with all routes working:
- `/` - Homepage
- `/demo` - Demo page  
- `/dashboard` - Dashboard page

## 🔧 Common Solutions for Vercel 404 Errors

### 1. Check Your Vercel Project Settings

Go to your Vercel dashboard:
1. Select your `vitrine` project
2. Go to **Settings** → **General**
3. Verify these settings:
   - **Framework Preset**: Should be **Next.js** (auto-detected)
   - **Root Directory**: Should be `./` (leave blank or set to root)
   - **Build Command**: Should be `npm run build` (default)
   - **Output Directory**: Should be `.next` (default)
   - **Install Command**: Should be `npm install` (default)

### 2. Trigger a Manual Redeploy

Often, redeploying fixes issues:
1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. Make sure to check **"Use existing Build Cache"** is OFF for a clean build

### 3. Check Environment Variables

Set these variables in **Settings → Environment Variables** for Production and Preview:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SUPABASE_STORAGE_BUCKET=business-photos
```

After adding/changing variables:
1. Go to **Settings** → **Environment Variables**
2. Make sure all required variables are set for **Production**
3. Redeploy after adding/changing variables

### 3.1 Supabase Checklist

Before deploying public traffic:

1. Run `supabase-schema.sql` in Supabase SQL Editor.
2. Create a public Storage bucket named `business-photos`.
3. Confirm these tables exist:
   - `businesses`
   - `page_views`
   - `leads`
   - `channels`
4. Confirm the recommended indexes were created for scale.

### 4. Verify Git Branch

Make sure you're deploying from the correct branch:
1. Go to **Settings** → **Git**
2. Check **Production Branch** (should be `main` or your default branch)
3. If you want to deploy from `copilot/fix-404-error-in-vitrine`, change it there

### 5. Check Build Logs

If the deployment fails:
1. Go to **Deployments** tab
2. Click on the failed deployment
3. Click **View Build Logs**
4. Look for any errors during:
   - `npm install`
   - `npm run build`
   - File generation

### 6. Domain Configuration

If using a custom domain:
1. Go to **Settings** → **Domains**
2. Make sure DNS is properly configured
3. Wait for propagation (can take 24-48 hours)
4. Try accessing via the default `.vercel.app` URL first

## 🚀 Deploy from Scratch (If Needed)

If nothing works, create a fresh deployment:

1. Delete the existing Vercel project (if any)
2. Push your latest code to GitHub
3. Go to [vercel.com/new](https://vercel.com/new)
4. Import your `gabrieljcsena26-web/vitrine` repository
5. Click **Deploy** (don't change any settings)

## 📝 Important Notes

- **Next.js 15** is fully supported by Vercel
- The app uses static pages plus dynamic API routes
- Supabase environment variables are required for dashboard/data routes
- All public routes should work immediately after deployment

## 🐛 Still Getting 404?

If you still see 404 errors after trying the above:

1. **Check the exact URL**: 
   - `https://your-project.vercel.app/` ← Should work
   - `https://your-project.vercel.app/demo` ← Should work
   - `https://your-project.vercel.app/dashboard` ← Should work

2. **Check browser console** (F12): Look for JavaScript errors

3. **Try incognito mode**: Clear cache and cookies

4. **Contact Vercel Support**: If all else fails, their support is very responsive

## ✨ Testing Your Deployment

After deploying, test all these URLs:
- Homepage: `/`
- Demo: `/demo`
- Dashboard: `/dashboard`

All should return status **200 OK** and display the correct page.
