-- Migration: instagram_graph_api_core_schema
-- Created at: 1762271246

-- Instagram Graph API Core Schema Migration
-- Created: 2025-11-02
-- Purpose: Add infrastructure for Instagram Graph API OAuth 2.0 integration

-- OAuth tokens storage with automatic refresh tracking
CREATE TABLE IF NOT EXISTS instagram_graph_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT NOT NULL,
  access_token TEXT NOT NULL,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMP NOT NULL,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, instagram_user_id)
);

-- Instagram Business/Creator account metadata
CREATE TABLE IF NOT EXISTS instagram_business_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_user_id TEXT UNIQUE NOT NULL,
  username TEXT NOT NULL,
  name TEXT,
  profile_picture_url TEXT,
  followers_count INTEGER DEFAULT 0,
  follows_count INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  biography TEXT,
  website TEXT,
  is_verified BOOLEAN DEFAULT false,
  account_type TEXT DEFAULT 'BUSINESS',
  connected_at TIMESTAMP DEFAULT NOW(),
  last_synced_at TIMESTAMP,
  sync_status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- API rate limiting tracker (200 requests/hour limit)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  endpoint_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 0,
  window_start TIMESTAMP NOT NULL,
  window_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, instagram_account_id, endpoint_type, window_start)
);

-- Data caching layer to minimize API calls
CREATE TABLE IF NOT EXISTS instagram_data_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  instagram_account_id TEXT NOT NULL,
  cache_key TEXT NOT NULL,
  data_type TEXT NOT NULL,
  data JSONB NOT NULL,
  fetched_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(cache_key)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_graph_tokens_user_id ON instagram_graph_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_graph_tokens_instagram_user_id ON instagram_graph_tokens(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_user_id ON instagram_business_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_business_accounts_instagram_user_id ON instagram_business_accounts(instagram_user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_account ON api_rate_limits(user_id, instagram_account_id);
CREATE INDEX IF NOT EXISTS idx_data_cache_key ON instagram_data_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_data_cache_expires ON instagram_data_cache(expires_at);

-- Enable RLS
ALTER TABLE instagram_graph_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_business_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_data_cache ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tokens" ON instagram_graph_tokens;
DROP POLICY IF EXISTS "Users can insert own tokens" ON instagram_graph_tokens;
DROP POLICY IF EXISTS "Users can update own tokens" ON instagram_graph_tokens;
DROP POLICY IF EXISTS "Users can delete own tokens" ON instagram_graph_tokens;

DROP POLICY IF EXISTS "Users can view own business accounts" ON instagram_business_accounts;
DROP POLICY IF EXISTS "Users can insert own business accounts" ON instagram_business_accounts;
DROP POLICY IF EXISTS "Users can update own business accounts" ON instagram_business_accounts;
DROP POLICY IF EXISTS "Users can delete own business accounts" ON instagram_business_accounts;

DROP POLICY IF EXISTS "Users can view own rate limits" ON api_rate_limits;
DROP POLICY IF EXISTS "Users can insert own rate limits" ON api_rate_limits;
DROP POLICY IF EXISTS "Users can update own rate limits" ON api_rate_limits;

DROP POLICY IF EXISTS "Users can view own cache" ON instagram_data_cache;
DROP POLICY IF EXISTS "Users can insert own cache" ON instagram_data_cache;
DROP POLICY IF EXISTS "Users can update own cache" ON instagram_data_cache;
DROP POLICY IF EXISTS "Users can delete own cache" ON instagram_data_cache;

-- Create RLS policies (allow both anon and service_role for Edge Functions)
CREATE POLICY "Users can view own tokens" ON instagram_graph_tokens
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own tokens" ON instagram_graph_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own tokens" ON instagram_graph_tokens
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can delete own tokens" ON instagram_graph_tokens
  FOR DELETE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can view own business accounts" ON instagram_business_accounts
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own business accounts" ON instagram_business_accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own business accounts" ON instagram_business_accounts
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can delete own business accounts" ON instagram_business_accounts
  FOR DELETE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can view own rate limits" ON api_rate_limits
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own rate limits" ON api_rate_limits
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own rate limits" ON api_rate_limits
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can view own cache" ON instagram_data_cache
  FOR SELECT USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can insert own cache" ON instagram_data_cache
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can update own cache" ON instagram_data_cache
  FOR UPDATE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

CREATE POLICY "Users can delete own cache" ON instagram_data_cache
  FOR DELETE USING (auth.uid() = user_id OR auth.role() IN ('anon', 'service_role'));

-- Auto-update timestamps trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_instagram_graph_tokens_updated_at ON instagram_graph_tokens;
CREATE TRIGGER update_instagram_graph_tokens_updated_at
  BEFORE UPDATE ON instagram_graph_tokens
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_instagram_business_accounts_updated_at ON instagram_business_accounts;
CREATE TRIGGER update_instagram_business_accounts_updated_at
  BEFORE UPDATE ON instagram_business_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();;