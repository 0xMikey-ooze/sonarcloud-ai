# 🔐 Stripe Environment Variables Setup

## Required Stripe Variables for Vercel

Add these to your **booking** project in Vercel:

### 1. Publishable Key (Client-side)
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt
```

### 2. Secret Key (Server-side)
```
STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq
```

### 3. Webhook Secret (Webhook verification)
```
STRIPE_WEBHOOK_SECRET = whsec_UXwtjXQVK2TdgmQWB26lA4553wmHwC7H
```

## 📋 Step-by-Step Instructions

### Add to Vercel:

1. **Go to Vercel Dashboard**:
   - [vercel.com/dashboard](https://vercel.com/dashboard)
   - Select your **booking** project

2. **Navigate to Environment Variables**:
   - Click **Settings** → **Environment Variables**

3. **Add Each Variable**:
   - Click **"Add New"**
   - Enter variable name (e.g., `STRIPE_SECRET_KEY`)
   - Enter variable value (paste the key)
   - Select environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

4. **Repeat for all 3 variables**

5. **Verify All Are Set**:
   - You should see all 3 variables listed:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`

6. **Redeploy**:
   - Go to **Deployments**
   - Click **"..."** on latest deployment → **Redeploy**
   - Or push a new commit to trigger deployment

## ✅ After Setup

Once all variables are set and deployed:

1. **Test Payment**:
   - Go to booking page
   - Use test card: `4242 4242 4242 4242`
   - Payment should work without connection errors

2. **Test Webhook**:
   - In Stripe Dashboard → Webhooks
   - Click "Send test webhook"
   - Should receive ✅ success

## ⚠️ Important

- **Never commit these keys to git** - They're sensitive
- **Test keys** are safe for development
- **Live keys** should only be used in production
- All keys must be from the **same Stripe account**
- Keys must match environment (test for test mode, live for live mode)

