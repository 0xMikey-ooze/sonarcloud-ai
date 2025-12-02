# 🔗 Stripe Webhook Setup

## Webhook URL

Your Stripe webhook endpoint is located at:

```
https://www.sugarcityexpress.com/api/webhooks/stripe
```

**Or if using Vercel domain:**
```
https://sugar-city-[your-project-id].vercel.app/api/webhooks/stripe
```

## 📋 Setup Instructions

### Step 1: Add Webhook in Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks) (Test Mode)
2. Click **"Add endpoint"** or **"Add webhook endpoint"**
3. Enter your webhook URL:
   ```
   https://www.sugarcityexpress.com/api/webhooks/stripe
   ```
4. Click **"Add endpoint"**

### Step 2: Select Events to Listen To

Select these events:
- ✅ `payment_intent.succeeded`
- ✅ `payment_intent.payment_failed`
- ✅ `charge.refunded`
- ✅ `charge.dispute.created`

### Step 3: Get Webhook Secret

1. After creating the webhook, click on it
2. Find **"Signing secret"** section
3. Click **"Reveal"** or **"Click to reveal"**
4. Copy the webhook secret (starts with `whsec_...`)

### Step 4: Add Webhook Secret to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your **booking** project
3. Go to **Settings** → **Environment Variables**
4. Add/Update:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_...
   ```
5. Make sure to select **Production**, **Preview**, and **Development**
6. Click **Save**
7. **Redeploy** your project

## ✅ Verify Webhook is Working

### Test Webhook Delivery

1. In Stripe Dashboard → Webhooks → Your endpoint
2. Click **"Send test webhook"**
3. Select event: `payment_intent.succeeded`
4. Click **"Send test webhook"**
5. Check **"Recent deliveries"** - should show ✅ success

### Test with Real Payment

1. Go to booking page
2. Complete a test booking with card: `4242 4242 4242 4242`
3. Check Stripe Dashboard → Webhooks → Recent deliveries
4. Should see `payment_intent.succeeded` event delivered

## 🔍 Troubleshooting

### Webhook Not Receiving Events

1. **Check Vercel Logs**:
   - Go to Vercel Dashboard → Deployments → Latest → View Function Logs
   - Look for webhook-related errors

2. **Check Webhook Secret**:
   - Make sure `STRIPE_WEBHOOK_SECRET` is set in Vercel
   - Secret should start with `whsec_`
   - No extra spaces or newlines

3. **Check Webhook URL**:
   - Must be HTTPS (not HTTP)
   - Must be publicly accessible
   - Must match exactly (no trailing slashes)

4. **Check Stripe Dashboard**:
   - Go to Webhooks → Your endpoint → Recent deliveries
   - Check for error messages
   - Red X means delivery failed

### Common Errors

**"Webhook signature verification failed"**
- Webhook secret doesn't match
- Check `STRIPE_WEBHOOK_SECRET` in Vercel

**"Webhook not configured"**
- `STRIPE_WEBHOOK_SECRET` is missing
- Add it to Vercel environment variables

**"404 Not Found"**
- Webhook URL is incorrect
- Check the endpoint path: `/api/webhooks/stripe`

## 📝 Webhook Events Handled

Your webhook handles these events:

1. **`payment_intent.succeeded`**
   - Updates booking status to `paid` and `confirmed`
   - Marks payment as successful

2. **`payment_intent.payment_failed`**
   - Logs failed payment
   - Updates booking status if needed

3. **`charge.refunded`**
   - Handles refund processing
   - Updates booking status

4. **`charge.dispute.created`**
   - Logs dispute creation
   - Alerts for manual review

## 🔒 Security Features

- ✅ Signature verification (prevents fake webhooks)
- ✅ Idempotency (prevents duplicate processing)
- ✅ Replay protection (tracks processed events)
- ✅ Rate limiting (protects against abuse)

## 🧪 Testing Locally

If you want to test webhooks locally:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will give you a local webhook secret starting with `whsec_` that you can use in your `.env.local`.

