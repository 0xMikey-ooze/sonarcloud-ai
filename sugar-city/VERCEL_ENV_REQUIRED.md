# 🔴 REQUIRED Environment Variables for Vercel

## ⚠️ Build is Failing - Missing Required Variables

The build is failing because these **required** environment variables are missing in Vercel.

## 📋 Booking Site - Required Variables

Go to: **Vercel Dashboard → booking project → Settings → Environment Variables**

### Authentication (Clerk)
```
CLERK_SECRET_KEY = sk_test_... (your Clerk secret key)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_... (your Clerk publishable key)
```

### Payment (Stripe)
```
STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt
STRIPE_WEBHOOK_SECRET = whsec_UXwtjXQVK2TdgmQWB26lA4553wmHwC7H
```

### Database (Firebase)
```
FIREBASE_PROJECT_ID = sugar-city-e900b
FIREBASE_SERVICE_ACCOUNT_KEY = {"type":"service_account",...} (your Firebase service account JSON)
NEXT_PUBLIC_FIREBASE_API_KEY = (your Firebase API key)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (your Firebase auth domain)
NEXT_PUBLIC_FIREBASE_PROJECT_ID = sugar-city-e900b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = (your Firebase storage bucket)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (your Firebase messaging sender ID)
NEXT_PUBLIC_FIREBASE_APP_ID = (your Firebase app ID)
```

## 📋 Admin Portal - Required Variables

Go to: **Vercel Dashboard → admin-portal project → Settings → Environment Variables**

### Authentication (Clerk)
```
CLERK_SECRET_KEY = sk_test_... (same as booking site)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_... (same as booking site)
```

### Payment (Stripe)
```
STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt
```

### Database (Firebase)
```
FIREBASE_PROJECT_ID = sugar-city-e900b
FIREBASE_SERVICE_ACCOUNT_KEY = {"type":"service_account",...} (same as booking site)
NEXT_PUBLIC_FIREBASE_API_KEY = (same as booking site)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = (same as booking site)
NEXT_PUBLIC_FIREBASE_PROJECT_ID = sugar-city-e900b
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = (same as booking site)
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = (same as booking site)
NEXT_PUBLIC_FIREBASE_APP_ID = (same as booking site)
```

## 🔍 How to Find Missing Values

### Firebase Values:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `sugar-city-e900b`
3. Go to **Project Settings** (gear icon)
4. Scroll to **Your apps** section
5. Click on your web app
6. Copy the config values:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID` and `FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`

### Firebase Service Account:
1. Go to Firebase Console → Project Settings
2. Go to **Service accounts** tab
3. Click **Generate new private key**
4. Copy the entire JSON → `FIREBASE_SERVICE_ACCOUNT_KEY` (paste as single line or JSON string)

### Clerk Keys:
1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Go to **API Keys**
4. Copy:
   - **Publishable key** → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - **Secret key** → `CLERK_SECRET_KEY`

## ✅ Quick Setup Checklist

### Booking Site:
- [ ] `CLERK_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] `FIREBASE_PROJECT_ID` set
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] All selected for Production, Preview, Development
- [ ] Project redeployed

### Admin Portal:
- [ ] `CLERK_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` set
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `FIREBASE_PROJECT_ID` set
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] All selected for Production, Preview, Development
- [ ] Project redeployed

## 🚨 Important Notes

1. **All variables are REQUIRED** - Build will fail if any are missing
2. **Select all environments** - Production, Preview, Development
3. **Redeploy after adding** - Variables are loaded at build time
4. **No spaces** - Make sure values don't have leading/trailing spaces
5. **JSON for Service Account** - `FIREBASE_SERVICE_ACCOUNT_KEY` should be the entire JSON as a string

## 🔧 If You Don't Have Some Values

If you're missing Clerk or Firebase values:
1. **Clerk**: Sign up at [clerk.com](https://clerk.com) and create an application
2. **Firebase**: The project should already exist at `sugar-city-e900b`
3. Check your local `.env.local` file - it might have the values you need

