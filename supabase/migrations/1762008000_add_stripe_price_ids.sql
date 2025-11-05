-- Migration: add_stripe_price_ids
-- Add Stripe price IDs to plans table

-- Note: These are placeholder price IDs. In production, you would:
-- 1. Create products and prices in Stripe dashboard
-- 2. Update these with actual Stripe price IDs

UPDATE plans SET 
  price_id = CASE 
    WHEN plan_type = 'pro' THEN 'price_pro_monthly' 
    WHEN plan_type = 'enterprise' THEN 'price_enterprise_monthly'
    ELSE NULL
  END,
  currency = 'usd',
  interval = 'month'
WHERE plan_type IN ('pro', 'enterprise');

-- The above would be replaced with actual Stripe price IDs like:
-- UPDATE plans SET price_id = 'price_1234567890' WHERE plan_type = 'pro';
-- UPDATE plans SET price_id = 'price_0987654321' WHERE plan_type = 'enterprise';