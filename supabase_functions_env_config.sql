-- Configure environment variables for Instagram Graph API edge functions
-- This should be done via Supabase Dashboard or API

-- Set these environment variables in Supabase Dashboard > Settings > Environment Variables:
-- FACEBOOK_APP_ID: 2631315633910412
-- FACEBOOK_APP_SECRET: 1f9eb662d8105243438f6a9e0e1c401a

-- These variables are automatically available in all edge functions
-- and can be accessed via: Deno.env.get('FACEBOOK_APP_ID')