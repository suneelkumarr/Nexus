-- Migration: subscription_and_profile_management
-- Created at: 1762007222


-- Subscription Plans Table
CREATE TABLE IF NOT EXISTS plans (
  id SERIAL PRIMARY KEY,
  price_id VARCHAR(255) UNIQUE,
  plan_type VARCHAR(50) NOT NULL UNIQUE,
  plan_name VARCHAR(100) NOT NULL,
  price INTEGER NOT NULL,
  currency VARCHAR(10) DEFAULT 'usd',
  interval VARCHAR(20) DEFAULT 'month',
  monthly_limit INTEGER NOT NULL,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  price_id VARCHAR(255) REFERENCES plans(price_id),
  plan_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User Profiles Extension (additional profile fields)
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

-- Insert default plans
INSERT INTO plans (plan_type, plan_name, price, monthly_limit, features) VALUES
('free', 'Free Plan', 0, 3, '["Up to 3 Instagram accounts", "Basic analytics", "Content discovery", "Weekly reports"]'),
('pro', 'Pro Plan', 2999, 25, '["Up to 25 Instagram accounts", "Advanced analytics", "AI content suggestions", "Competitor analysis", "Daily reports", "Priority support"]'),
('enterprise', 'Enterprise Plan', 9999, 100, '["Up to 100 Instagram accounts", "Enterprise analytics", "Advanced AI features", "Team collaboration", "Custom reports", "Dedicated support", "API access"]')
ON CONFLICT (plan_type) DO UPDATE SET
  price = EXCLUDED.price,
  monthly_limit = EXCLUDED.monthly_limit,
  features = EXCLUDED.features,
  updated_at = NOW();

-- Enable RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profile_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plans (public read)
CREATE POLICY "Plans are viewable by everyone" ON plans FOR SELECT USING (true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for user_profile_extended
CREATE POLICY "Users can view own profile" ON user_profile_extended FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profile_extended FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profile_extended FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own profile" ON user_profile_extended FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for billing_history
CREATE POLICY "Users can view own billing history" ON billing_history FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own usage" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for onboarding_progress
CREATE POLICY "Users can view own onboarding" ON onboarding_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON onboarding_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON onboarding_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
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
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profile_extended_updated_at ON user_profile_extended;
CREATE TRIGGER update_user_profile_extended_updated_at BEFORE UPDATE ON user_profile_extended FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_tracking_updated_at ON usage_tracking;
CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON usage_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_progress_updated_at ON onboarding_progress;
CREATE TRIGGER update_onboarding_progress_updated_at BEFORE UPDATE ON onboarding_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
;