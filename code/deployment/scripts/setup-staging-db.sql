-- =============================================================================
-- STAGING DATABASE SETUP SCRIPT
-- =============================================================================
-- This script sets up the staging database with all necessary tables,
-- indexes, and policies for the Instagram Growth Tool
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- CORE USER TABLES
-- =============================================================================

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Instagram accounts table
CREATE TABLE IF NOT EXISTS instagram_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  user_instagram_id TEXT,
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  profile_picture_url TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  api_key TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ANALYTICS TABLES
-- =============================================================================

-- Analytics snapshots
CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  followers_count INTEGER,
  following_count INTEGER,
  posts_count INTEGER,
  engagement_rate DECIMAL(5,2),
  average_likes INTEGER,
  average_comments INTEGER,
  reach INTEGER,
  impressions INTEGER,
  profile_views INTEGER,
  website_clicks INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, snapshot_date)
);

-- Media insights
CREATE TABLE IF NOT EXISTS media_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  media_id TEXT NOT NULL,
  media_type TEXT,
  shortcode TEXT,
  caption TEXT,
  thumbnail_url TEXT,
  permalink TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  posted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- CONTENT MANAGEMENT TABLES
-- =============================================================================

-- Hashtag performance
CREATE TABLE IF NOT EXISTS hashtag_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  hashtag TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_reach INTEGER DEFAULT 0,
  total_impressions INTEGER DEFAULT 0,
  average_engagement_rate DECIMAL(5,2),
  last_used_at TIMESTAMP WITH TIME ZONE,
  popularity_score DECIMAL(3,2),
  related_hashtags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content discoveries
CREATE TABLE IF NOT EXISTS content_discoveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  discovery_type TEXT NOT NULL,
  content_data JSONB DEFAULT '{}',
  hashtags TEXT[],
  location TEXT,
  engagement_score INTEGER DEFAULT 0,
  is_saved BOOLEAN DEFAULT false,
  notes TEXT,
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- COMPETITOR ANALYSIS TABLES
-- =============================================================================

-- Competitors table
CREATE TABLE IF NOT EXISTS competitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  competitor_username TEXT NOT NULL,
  competitor_user_id TEXT,
  followers_count INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2),
  posts_count INTEGER DEFAULT 0,
  last_analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Growth recommendations
CREATE TABLE IF NOT EXISTS growth_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'pending',
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- SUBSCRIPTION & BILLING TABLES
-- =============================================================================

-- Plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- A/B TESTING & CONVERSION TRACKING
-- =============================================================================

-- Conversion events
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  account_id UUID REFERENCES instagram_accounts(id),
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  ab_variant VARCHAR(10),
  session_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- A/B test variants
CREATE TABLE IF NOT EXISTS ab_test_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  test_name TEXT NOT NULL,
  variant_name TEXT NOT NULL,
  traffic_percentage INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences for personalization
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User context for A/B testing
CREATE TABLE IF NOT EXISTS user_context (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- User personalization state
CREATE TABLE IF NOT EXISTS user_personalization_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  state JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =============================================================================
-- NOTIFICATIONS & ALERTS
-- =============================================================================

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE hashtag_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_discoveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE growth_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_personalization_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- CREATE RLS POLICIES
-- =============================================================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Instagram accounts policies
CREATE POLICY "Users can manage own accounts" ON instagram_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view own analytics" ON analytics_snapshots
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM instagram_accounts WHERE id = account_id)
  );

CREATE POLICY "Users can view own media insights" ON media_insights
  FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM instagram_accounts WHERE id = account_id)
  );

-- Conversion events policies
CREATE POLICY "Users can view own conversion events" ON conversion_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert conversion events" ON conversion_events
  FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own context" ON user_context
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own personalization state" ON user_personalization_state
  FOR ALL USING (auth.uid() = user_id);

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_user_id ON instagram_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_account_id ON analytics_snapshots(account_id);
CREATE INDEX IF NOT EXISTS idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_media_insights_account_id ON media_insights(account_id);
CREATE INDEX IF NOT EXISTS idx_hashtag_performance_account_id ON hashtag_performance(account_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user_id ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created_at ON conversion_events(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- =============================================================================
-- INSERT DEFAULT DATA
-- =============================================================================

-- Insert default plans
INSERT INTO plans (name, description, price_monthly, price_yearly, features, limits) VALUES
('Free', 'Basic analytics for getting started', 0.00, 0.00, 
 '["Basic Analytics", "Instagram Connection", "1 Account"]', 
 '{"accounts": 1, "posts": 50, "analytics_days": 30}'),
('Pro', 'Advanced analytics and growth tools', 29.99, 299.99,
 '["Advanced Analytics", "Competitor Analysis", "Hashtag Optimization", "Growth Recommendations", "Unlimited Posts"]',
 '{"accounts": 5, "posts": -1, "analytics_days": -1}'),
('Enterprise', 'Complete growth platform for agencies', 99.99, 999.99,
 '["Everything in Pro", "Team Management", "White Label", "API Access", "Priority Support"]',
 '{"accounts": -1, "posts": -1, "analytics_days": -1}')
ON CONFLICT DO NOTHING;

-- Insert default A/B test variants
INSERT INTO ab_test_variants (test_name, variant_name, traffic_percentage, is_active) VALUES
('conversion_center', 'A', 34, true),
('conversion_center', 'B', 33, true),
('conversion_center', 'C', 33, true),
('feature_comparison', 'A', 34, true),
('feature_comparison', 'B', 33, true),
('feature_comparison', 'C', 33, true),
('social_proof', 'A', 50, true),
('social_proof', 'B', 50, true)
ON CONFLICT DO NOTHING;

-- =============================================================================
-- CREATE FUNCTIONS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_accounts_updated_at BEFORE UPDATE ON instagram_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SETUP COMPLETE
-- =============================================================================

-- Verify setup
DO $$
BEGIN
    RAISE NOTICE 'Staging database setup completed successfully!';
    RAISE NOTICE 'Tables created: %', (
        SELECT COUNT(*) 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    );
    RAISE NOTICE 'Policies created: %', (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'public'
    );
    RAISE NOTICE 'Indexes created: %', (
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE schemaname = 'public'
    );
END
$$;