# 🧪 Stripe Testing Guide

## Test Mode Setup

Stripe has two modes:
- **Test Mode**: For development and testing (uses test API keys)
- **Live Mode**: For real payments (uses live API keys)

## Test API Keys

Make sure you're using **Test Mode** keys in your development environment:

```env
# Test Mode Keys (for development)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

You can find your test keys in the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).

## Test Card Numbers

Use these test card numbers to simulate different payment scenarios:

### ✅ Successful Payments

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Visa - Always succeeds |
| `5555 5555 5555 4444` | Mastercard - Always succeeds |
| `3782 822463 10005` | American Express - Always succeeds |

### ❌ Declined Payments

| Card Number | Description |
|------------|-------------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0069` | Expired card |

### 🔄 3D Secure (Authentication Required)

| Card Number | Description |
|------------|-------------|
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0027 6000 3184` | Authentication fails |

### 💳 Other Test Scenarios

| Card Number | Description |
|------------|-------------|
| `4000 0000 0000 3220` | Requires ZIP code |
| `4000 0000 0000 3055` | Requires CVC |

## Test Card Details

For all test cards, use:
- **Expiry Date**: Any future date (e.g., `12/34`)
- **CVC**: Any 3 digits (e.g., `123`)
- **ZIP Code**: Any 5 digits (e.g., `12345`)

## Testing Payment Flow

### 1. Test Successful Payment

1. Go to booking page
2. Fill out booking form
3. Use card: `4242 4242 4242 4242`
4. Expiry: `12/34`
5. CVC: `123`
6. ZIP: `12345`
7. Submit payment
8. Should see success message and booking confirmation

### 2. Test Declined Payment

1. Use card: `4000 0000 0000 0002`
2. Should see error: "Your card was declined"

### 3. Test 3D Secure

1. Use card: `4000 0025 0000 3155`
2. Should see authentication popup
3. Click "Complete authentication"
4. Payment should succeed

### 4. Test Free Ride (Coupon)

1. Apply a "free_ride" coupon code
2. Should skip payment and go directly to booking confirmation

## Stripe Dashboard Testing

### View Test Payments

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/payments)
2. Switch to **Test Mode** (toggle in top right)
3. View all test payments and their status

### Test Webhooks

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Use Stripe CLI to forward webhooks locally:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Test webhook events:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

## Stripe CLI Testing

Install Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or
npm install -g stripe-cli
```

Login:
```bash
stripe login
```

Test webhook locally:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Trigger test events:
```bash
# Test successful payment
stripe trigger payment_intent.succeeded

# Test failed payment
stripe trigger payment_intent.payment_failed
```

## Environment Variables

Make sure these are set for testing:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # From Stripe CLI or Dashboard

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Issues

### "No such payment_intent"

- Make sure you're using test keys in test mode
- Check that payment intent was created successfully
- Verify client secret is being passed correctly

### "Invalid API Key"

- Check that keys start with `sk_test_` and `pk_test_`
- Verify keys are from the same Stripe account
- Make sure keys are set in environment variables

### Webhook Not Working

- Use Stripe CLI to forward webhooks locally
- Check webhook endpoint URL is correct
- Verify webhook secret matches

## Production Checklist

Before going live:

- [ ] Switch to **Live Mode** keys (`sk_live_...` and `pk_live_...`)
- [ ] Update webhook endpoint to production URL
- [ ] Test with real small amount first
- [ ] Verify webhook signature validation
- [ ] Set up monitoring and alerts
- [ ] Test refund process
- [ ] Test dispute handling

## Resources

- [Stripe Test Cards](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com/test)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)

