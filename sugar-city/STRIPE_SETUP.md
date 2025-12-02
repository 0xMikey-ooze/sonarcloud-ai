# 🔑 Stripe Setup Guide

## Required Stripe Keys

You need **TWO** Stripe keys:

### 1. Publishable Key (Client-side)
- **Variable Name**: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value**: `pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt`
- **Used in**: Client-side code (booking page, payment forms)
- **Location**: Vercel Environment Variables → Booking Project

### 2. Secret Key (Server-side)
- **Variable Name**: `STRIPE_SECRET_KEY`
- **Value**: `sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq`
- **Used in**: Server-side API routes (payment intent creation, webhooks)
- **Location**: Vercel Environment Variables → Booking Project

## ✅ How to Set in Vercel

### For Booking Site:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **booking** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update these variables:

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt

STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq
```

5. Make sure to select **Production**, **Preview**, and **Development** environments
6. Click **Save**
7. **Redeploy** your project for changes to take effect

## 🔍 Verify Keys Are Set

After setting the variables, you can verify:

1. **Check Vercel Dashboard**: Settings → Environment Variables
2. **Check Deployment Logs**: Look for any Stripe initialization errors
3. **Test Payment**: Try creating a payment intent - should work now

## ⚠️ Important Notes

- **Never commit these keys to git** - They're already in environment variables
- **Test keys** (starting with `pk_test_` and `sk_test_`) are safe to use in development
- **Live keys** (starting with `pk_live_` and `sk_live_`) should only be used in production
- Both keys must be from the **same Stripe account**
- Keys must match the environment (test keys for test mode, live keys for live mode)

## 🧪 Testing After Setup

1. Go to booking page
2. Fill out booking form
3. Use test card: `4242 4242 4242 4242`
4. Payment should process successfully

## 🔄 If Still Getting Errors

If you still get connection errors after setting the keys:

1. **Check Vercel Logs**: 
   - Go to Deployments → Latest → View Function Logs
   - Look for Stripe-related errors

2. **Verify Key Format**:
   - Secret key should start with `sk_test_` or `sk_live_`
   - Publishable key should start with `pk_test_` or `pk_live_`
   - No extra spaces or newlines

3. **Redeploy**:
   - After setting environment variables, trigger a new deployment
   - Environment variables are only loaded at build time

4. **Check Stripe Dashboard**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
   - Verify keys are active and not revoked

