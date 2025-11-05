# Stripe Payment Integration Guide

This guide outlines how to set up and configure Stripe payments for the Instagram Growth Tool subscription system.

## Overview

The Stripe integration provides:
- Secure payment processing via Stripe Checkout
- Automatic subscription management
- Real-time webhook handling for payment events
- Billing history with invoice access
- Support for multiple subscription tiers

## Architecture

### Database Schema
- `plans` - Subscription plans with Stripe price IDs
- `subscriptions` - User subscriptions linked to Stripe
- `billing_history` - Invoice and payment history

### Edge Functions
- `manage-subscription` - Main subscription management with Stripe integration
- `stripe-webhook` - Handles Stripe webhook events

### Frontend Components
- `SubscriptionManagement.tsx` - Updated to use Stripe Checkout

## Setup Instructions

### 1. Stripe Account Setup

1. Create a Stripe account at https://stripe.com
2. Get your API keys from the Stripe Dashboard:
   - Secret Key (starts with `sk_`)
   - Publishable Key (starts with `pk_`)
   - Webhook Secret (starts with `whsec_`)

### 2. Create Products and Prices in Stripe

1. Go to Stripe Dashboard → Products
2. Create products for each plan:
   - **Pro Plan**: $29.99/month
   - **Enterprise Plan**: $99.99/month
   - **Free Plan**: $0 (no Stripe product needed)

3. For each paid plan, create a recurring price:
   - Product: [Plan Name]
   - Price: [Amount] USD
   - Billing period: Monthly
   - Currency: USD

### 3. Update Environment Variables

Set the following environment variables in your Supabase project:

```bash
# Stripe API Keys
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for redirect URLs
APP_URL=https://your-domain.com
```

### 4. Update Price IDs in Database

Update the `plans` table with actual Stripe price IDs:

```sql
UPDATE plans SET price_id = 'price_your_actual_price_id' WHERE plan_type = 'pro';
UPDATE plans SET price_id = 'price_your_actual_price_id' WHERE plan_type = 'enterprise';
```

Or run the migration with updated price IDs:

```sql
UPDATE plans SET 
  price_id = CASE 
    WHEN plan_type = 'pro' THEN 'price_pro_1234567890'
    WHEN plan_type = 'enterprise' THEN 'price_enterprise_0987654321'
    ELSE NULL
  END
WHERE plan_type IN ('pro', 'enterprise');
```

### 5. Configure Stripe Webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://zkqpimisftlwehwixgev.supabase.co/functions/v1/stripe-webhook`
3. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

4. Copy the webhook secret and add it to environment variables

### 6. Deploy Edge Functions

Deploy the updated edge functions:

```bash
# Deploy manage-subscription function
supabase functions deploy manage-subscription

# Deploy stripe-webhook function
supabase functions deploy stripe-webhook
```

## Features

### Payment Flow
1. User selects a plan
2. Frontend calls `manage-subscription` with `create-checkout-session` action
3. Edge function creates Stripe Checkout Session
4. User is redirected to Stripe's secure checkout page
5. On successful payment, Stripe redirects back with success URL
6. Webhook updates subscription in database

### Subscription Management
- **Upgrade/Downgrade**: Creates new checkout session for plan changes
- **Cancellation**: Cancels at period end (no prorations)
- **Billing History**: Shows all invoices with PDF links
- **Real-time Updates**: Webhooks keep database in sync

### Security
- All payment processing handled by Stripe
- Webhook signature verification
- No card details stored in application
- Server-side price validation

## Testing

### Test Mode
1. Use Stripe test keys for development
2. Test with Stripe test card numbers:
   - Success: 4242 4242 4242 4242
   - Decline: 4000 0000 0000 0002
   - 3D Secure: 4000 0025 0000 3155

### Test Scenarios
1. Create new subscription
2. Upgrade subscription
3. Cancel subscription
4. Payment failure handling
5. Webhook delivery testing

## Troubleshooting

### Common Issues

**Webhook Not Receiving Events**
- Check webhook endpoint URL is correct
- Verify webhook secret in environment variables
- Check Supabase function logs

**Price IDs Not Found**
- Ensure plans table has correct price_id values
- Check Stripe price IDs exist and are active

**Checkout Session Errors**
- Verify STRIPE_SECRET_KEY is set correctly
- Check return URLs are accessible
- Ensure price data format is correct

### Logs
Check edge function logs for detailed error messages:
```bash
supabase functions logs stripe-webhook
supabase functions logs manage-subscription
```

## Security Considerations

1. **Never expose Stripe secret keys in frontend code**
2. **Verify webhook signatures in production**
3. **Use HTTPS for all payment flows**
4. **Validate all amounts server-side**
5. **Log all payment events for audit trail**

## Production Checklist

- [ ] Stripe account fully configured
- [ ] Webhooks configured and tested
- [ ] Environment variables set
- [ ] Price IDs updated in database
- [ ] Edge functions deployed
- [ ] Test payments working
- [ ] Error handling tested
- [ ] Security review completed

## Support

For Stripe integration issues:
1. Check Stripe documentation: https://stripe.com/docs
2. Review Supabase Edge Functions logs
3. Verify webhook events in Stripe Dashboard
4. Test payment flow end-to-end