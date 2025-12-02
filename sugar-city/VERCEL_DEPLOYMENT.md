# 🚀 Vercel Deployment Guide

This guide covers deploying Sugar City Express to Vercel while keeping Firebase for database and storage.

## 📋 Architecture

- **Hosting**: Vercel (Next.js app with API routes)
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Authentication**: Firebase Auth (client-side)

## 🏗️ Vercel Projects

Sugar City Express uses **two separate Vercel projects**:

1. **`booking`** - Main booking website
   - Public-facing booking site
   - Customer booking flow
   - Spin wheel, referrals, and public pages
   - Root directory: `/` (root of repository)

2. **`admin-portal`** - Admin dashboard
   - Admin management interface
   - Booking management, analytics, partner management
   - Root directory: `/admin-portal` (subdirectory)

### Switching Between Projects

When deploying, make sure you're linked to the correct project:

```bash
# Link to booking project
cd /path/to/sugar-city
vercel link
# Select "booking" project

# Link to admin-portal project
cd /path/to/sugar-city/admin-portal
vercel link
# Select "admin-portal" project
```

**Note**: The `.vercel` folder in the root directory determines which project is currently linked. Each project has its own environment variables and deployment settings.

## ✅ Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (optional, for CLI deployment):
   ```bash
   npm install -g vercel
   ```

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

#### For Booking Site:

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project" (or select existing "booking" project)
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the `sugar-city` repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/` (root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables** (see below)

4. **Deploy**: Click "Deploy"

#### For Admin Portal:

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project" (or select existing "admin-portal" project)
   - Import your GitHub/GitLab/Bitbucket repository
   - Select the `sugar-city` repository

2. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `/admin-portal` (important!)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

3. **Set Environment Variables** (see below)

4. **Deploy**: Click "Deploy"

### Option 2: Deploy via CLI

1. **Login to Vercel**:
   ```bash
   vercel login
   ```

2. **Link Project**:
   ```bash
   vercel link
   ```
   - Select or create a project
   - Follow the prompts

3. **Deploy**:
   ```bash
   # Preview deployment
   vercel

   # Production deployment
   vercel --prod
   ```

## 🔐 Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables** for each project:

**Note**: Each Vercel project (`booking` and `admin-portal`) has its own set of environment variables. Make sure to configure them separately for each project.

### Critical (Required)

```env
# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Firebase Client (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=sugar-city-e900b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...

# Firebase Admin (Server-side)
FIREBASE_PROJECT_ID=sugar-city-e900b
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}  # JSON string
# OR use individual fields:
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

### Recommended

```env
# Email
RESEND_API_KEY=re_...

# SMS/WhatsApp
BIRD_API_KEY=...

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Monitoring
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
NEXT_PUBLIC_SENTRY_DSN=https://...
SENTRY_ORG=...
SENTRY_PROJECT=...

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
# For booking project: use booking domain
# For admin-portal project: use admin-portal domain
NODE_ENV=production
LOG_LEVEL=info

# Admin API (optional)
ADMIN_API_KEY=...
```

### Setting FIREBASE_SERVICE_ACCOUNT_KEY

The `FIREBASE_SERVICE_ACCOUNT_KEY` must be a **JSON string**. To set it:

1. **Get Service Account JSON**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

2. **Convert to String**:
   ```bash
   # Option 1: Copy entire JSON as one line
   cat serviceAccountKey.json | jq -c
   
   # Option 2: Use online tool to minify JSON
   # Then paste the entire JSON as the value
   ```

3. **Set in Vercel**:
   - Variable: `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Value: `{"type":"service_account","project_id":"sugar-city-e900b",...}` (entire JSON as string)

## 🔄 Firebase Configuration

### Firestore Rules

Deploy Firestore rules separately (they're not part of Vercel deployment):

```bash
firebase deploy --only firestore:rules
```

### Firestore Indexes

Deploy indexes if needed:

```bash
firebase deploy --only firestore:indexes
```

### Firebase Hosting (Optional)

If you want to keep Firebase Hosting for redirects or as a backup:

```bash
# Deploy only Firestore (not hosting)
firebase deploy --only firestore
```

## 🌐 Custom Domain Setup

Each Vercel project can have its own custom domain:

### Booking Site Domain

1. **Add Domain in Vercel**:
   - Go to **booking** project → Settings → Domains
   - Add your custom domain (e.g., `sugarcityexpress.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` in the **booking** project to your custom domain
   - Redeploy

### Admin Portal Domain

1. **Add Domain in Vercel**:
   - Go to **admin-portal** project → Settings → Domains
   - Add your custom domain (e.g., `admin.sugarcityexpress.com`)
   - Follow DNS configuration instructions

2. **Update Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` in the **admin-portal** project to your custom domain
   - Redeploy

### Firebase Auth Authorized Domains (IMPORTANT)

- Go to [Firebase Console](https://console.firebase.google.com) → Authentication → Settings → Authorized domains
- Add your Vercel domain(s):
  - `*.vercel.app` (for preview deployments)
  - Your booking custom domain (if applicable)
  - Your admin-portal custom domain (if applicable)
- **Note**: Firebase automatically allows `localhost` and your Firebase project domain, but you must manually add Vercel domains

## 🔔 Stripe Webhook Configuration

**Note**: Stripe webhooks are typically configured for the `booking` project only, as that's where payment processing happens.

1. **Get Webhook URL**:
   - Production: `https://your-booking-domain.vercel.app/api/webhooks/stripe`
   - Preview: `https://your-booking-project.vercel.app/api/webhooks/stripe`

2. **Configure in Stripe Dashboard**:
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint with your booking Vercel URL
   - Select events:
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
     - `charge.dispute.created`

3. **Get Webhook Secret**:
   - Copy the webhook signing secret
   - Add as `STRIPE_WEBHOOK_SECRET` in the **booking** project's Vercel environment variables

## 📊 Monitoring & Analytics

### Vercel Analytics
- Automatically enabled on Vercel
- View in Vercel Dashboard → Analytics

### Sentry
- Already configured in `next.config.mjs`
- Set `SENTRY_DSN` and `SENTRY_AUTH_TOKEN` environment variables
- View errors in Sentry Dashboard

## 🔧 Troubleshooting

### Build Failures

1. **Check Build Logs**:
   - Vercel Dashboard → Deployments → Click failed deployment → View logs

2. **Common Issues**:
   - Missing environment variables
   - TypeScript errors (check `tsconfig.json`)
   - Missing dependencies (check `package.json`)

### Runtime Errors

1. **Check Function Logs**:
   - Vercel Dashboard → Functions → View logs

2. **Firebase Connection Issues**:
   - Verify `NEXT_PUBLIC_FIREBASE_*` variables are set
   - Check Firebase project ID matches
   - Verify Firestore rules allow access

### API Routes Not Working

- Ensure environment variables are set for **Production** environment
- Check that API routes are in `src/app/api/` directory
- Verify CORS settings if calling from external domains

## 📝 Deployment Checklist

### Booking Site
- [ ] Linked to correct Vercel project (`booking`)
- [ ] All environment variables set in booking project
- [ ] Firebase Service Account key configured
- [ ] Stripe webhook configured
- [ ] Custom domain configured (if applicable)
- [ ] `NEXT_PUBLIC_APP_URL` updated to booking domain
- [ ] Test deployment in preview environment
- [ ] Production deployment successful
- [ ] All API routes tested
- [ ] Firebase client connection verified

### Admin Portal
- [ ] Linked to correct Vercel project (`admin-portal`)
- [ ] All environment variables set in admin-portal project
- [ ] Firebase Service Account key configured
- [ ] Custom domain configured (if applicable)
- [ ] `NEXT_PUBLIC_APP_URL` updated to admin-portal domain
- [ ] Test deployment in preview environment
- [ ] Production deployment successful
- [ ] All API routes tested
- [ ] Firebase client connection verified

### Shared Resources
- [ ] Firestore rules deployed
- [ ] Firestore indexes deployed (if needed)
- [ ] Firebase Auth authorized domains updated

## 🚀 Quick Deploy Commands

### Booking Site (Root Directory)

```bash
# Make sure you're in the root directory
cd /path/to/sugar-city

# Link to booking project (if not already linked)
vercel link
# Select "booking" project

# Deploy to Vercel (production)
npm run deploy

# Deploy Firestore rules
npm run deploy:rules

# Deploy Firestore indexes
npm run deploy:indexes

# Deploy everything (Firestore only, not hosting)
npm run deploy:firestore
```

### Admin Portal (Subdirectory)

```bash
# Navigate to admin-portal directory
cd /path/to/sugar-city/admin-portal

# Link to admin-portal project (if not already linked)
vercel link
# Select "admin-portal" project

# Deploy to Vercel (production)
vercel --prod

# Or use npm script if configured
npm run deploy
```

**Important**: Always verify which project you're linked to before deploying:
```bash
# Check current project
cat .vercel/project.json
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Firebase Client SDK](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

