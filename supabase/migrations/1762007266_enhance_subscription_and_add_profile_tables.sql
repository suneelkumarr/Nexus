-- Migration: enhance_subscription_and_add_profile_tables
-- Created at: 1762007266


-- Enhance plans table with additional columns
ALTER TABLE plans ADD COLUMN IF NOT EXISTS plan_name VARCHAR(100);
ALTER TABLE plans ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'usd';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS interval VARCHAR(20) DEFAULT 'month';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE plans ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Enhance subscriptions table with additional columns
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plan_type VARCHAR(50);
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Update existing plans with names and features
UPDATE plans SET plan_name = 'Free Plan', features = '["Up to 3 Instagram accounts", "Basic analytics", "Content discovery", "Weekly reports"]'::jsonb WHERE plan_type = 'free';
UPDATE plans SET plan_name = 'Pro Plan', features = '["Up to 25 Instagram accounts", "Advanced analytics", "AI content suggestions", "Competitor analysis", "Daily reports", "Priority support"]'::jsonb WHERE plan_type = 'pro';
UPDATE plans SET plan_name = 'Enterprise Plan', features = '["Up to 100 Instagram accounts", "Enterprise analytics", "Advanced AI features", "Team collaboration", "Custom reports", "Dedicated support", "API access"]'::jsonb WHERE plan_type = 'enterprise';

-- User Profiles Extension
CREATE TABLE IF NOT EXISTS user_profile_extended (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  full_name VARCHAR(255),
  company VARCHAR(255),
  phone VARCHAR(50),
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  timezone VARCHAR(100) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing History Table
CREATE TABLE IF NOT EXISTS billing_history (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id INTEGER REFERENCES subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  status VARCHAR(50) NOT NULL,
  invoice_pdf TEXT,
  billing_reason VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Tracking Table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resource_type VARCHAR(100) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_type, period_start)
);

-- Onboarding Progress Table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  current_step INTEGER DEFAULT 1,
  completed_steps JSONB DEFAULT '[]',
  is_completed BOOLEAN DEFAULT false,
  skipped BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE user_profile_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profile_extended
DROP POLICY IF EXISTS "Users can view own profile" ON user_profile_extended;
CREATE POLICY "Users can view own profile" ON user_profile_extended FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profile_extended;
CREATE POLICY "Users can insert own profile" ON user_profile_extended FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profile_extended;
CREATE POLICY "Users can update own profile" ON user_profile_extended FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own profile" ON user_profile_extended;
CREATE POLICY "Users can delete own profile" ON user_profile_extended FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for billing_history
DROP POLICY IF EXISTS "Users can view own billing history" ON billing_history;
CREATE POLICY "Users can view own billing history" ON billing_history FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON usage_tracking;
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON usage_tracking;
CREATE POLICY "Users can update own usage" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for onboarding_progress
DROP POLICY IF EXISTS "Users can view own onboarding" ON onboarding_progress;
CREATE POLICY "Users can view own onboarding" ON onboarding_progress FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own onboarding" ON onboarding_progress;
CREATE POLICY "Users can insert own onboarding" ON onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own onboarding" ON onboarding_progress;
CREATE POLICY "Users can update own onboarding" ON onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_onboarding_progress_user_id ON onboarding_progress(user_id);

-- Updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_user_profile_extended_updated_at ON user_profile_extended;
CREATE TRIGGER update_user_profile_extended_updated_at BEFORE UPDATE ON user_profile_extended FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
;