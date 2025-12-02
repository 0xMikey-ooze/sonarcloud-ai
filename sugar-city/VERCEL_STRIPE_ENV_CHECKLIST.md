# ✅ Stripe Environment Variables Checklist

## Both Projects Need Stripe Keys

### 📋 Booking Site (Main Website)

**Project**: `booking`  
**Vercel Project**: Your booking Vercel project

**Required Variables:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt

STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq

STRIPE_WEBHOOK_SECRET = whsec_UXwtjXQVK2TdgmQWB26lA4553wmHwC7H
```

**What it's used for:**
- Customer booking payments
- Payment intent creation
- Webhook processing for payment confirmations

---

### 📋 Admin Portal

**Project**: `admin-portal`  
**Vercel Project**: Your admin-portal Vercel project

**Required Variables:**
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_51SX6WMIsSu2DsABtjTAqp6QDz7atvEjw1foGfBza7z94kklscQG634cNHetVWzxfiYNup03kW4Cj19blXpqff8iE00rWgqYpZt

STRIPE_SECRET_KEY = sk_test_51SX6WMIsSu2DsABteVaApxUuln7TwDkSJzTFEdcU6WROF6AZ4EZYwKucUcgN697m6EfNmOL2Bw9ZxiBazgsfxgj200VSPXjWkq
```

**Note**: Admin portal does NOT need `STRIPE_WEBHOOK_SECRET` (webhooks only go to booking site)

**What it's used for:**
- POS terminal payments
- Tip payments
- Terminal connection tokens

---

## 📝 Setup Instructions

### For Booking Site:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **booking** project
3. **Settings** → **Environment Variables**
4. Add all 3 variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
5. Select: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy**

### For Admin Portal:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select **admin-portal** project
3. **Settings** → **Environment Variables**
4. Add 2 variables:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
5. Select: ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**
7. **Redeploy**

---

## ✅ Verification Checklist

### Booking Site:
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `STRIPE_SECRET_KEY` set
- [ ] `STRIPE_WEBHOOK_SECRET` set
- [ ] All environments selected (Production, Preview, Development)
- [ ] Project redeployed

### Admin Portal:
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set
- [ ] `STRIPE_SECRET_KEY` set
- [ ] All environments selected (Production, Preview, Development)
- [ ] Project redeployed

---

## 🧪 Test After Setup

### Booking Site:
1. Go to booking page
2. Complete a test booking
3. Use card: `4242 4242 4242 4242`
4. Should process successfully

### Admin Portal:
1. Go to POS page
2. Try processing a payment
3. Should connect to Stripe Terminal

---

## ⚠️ Important Notes

- **Same keys for both projects** - They use the same Stripe account
- **Webhook secret only on booking site** - Webhooks only go to booking site
- **Test keys** - These are test mode keys (safe for development)
- **Live keys** - When going to production, switch to live keys (`pk_live_...` and `sk_live_...`)

