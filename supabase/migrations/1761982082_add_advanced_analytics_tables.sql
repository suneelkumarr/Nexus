-- Migration: add_advanced_analytics_tables
-- Created at: 1761982082

-- Create stories_analytics table for Instagram Stories and Reels metrics
CREATE TABLE IF NOT EXISTS stories_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    story_id TEXT NOT NULL,
    story_type TEXT, -- 'story' or 'reel'
    thumbnail_url TEXT,
    views_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    exits_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    engagement_rate DECIMAL(5,2),
    posted_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audience_demographics table for user audience insights
CREATE TABLE IF NOT EXISTS audience_demographics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Age distribution (stored as JSON for flexibility)
    age_distribution JSONB, -- {"13-17": 5, "18-24": 35, "25-34": 40, "35-44": 15, "45+": 5}
    
    -- Gender distribution
    gender_distribution JSONB, -- {"male": 45, "female": 53, "other": 2}
    
    -- Geographic distribution (top countries/cities)
    top_countries JSONB, -- [{"country": "USA", "percentage": 40}, ...]
    top_cities JSONB, -- [{"city": "New York", "percentage": 15}, ...]
    
    -- Active hours analysis
    active_hours JSONB, -- {"0": 2, "1": 1, "2": 1, ..., "23": 5} (percentage per hour)
    active_days JSONB, -- {"monday": 12, "tuesday": 15, ...} (percentage per day)
    
    -- Additional insights
    language_distribution JSONB, -- [{"language": "English", "percentage": 75}, ...]
    device_types JSONB, -- {"mobile": 85, "desktop": 10, "tablet": 5}
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, snapshot_date)
);

-- Create post_performance_history for tracking individual post metrics over time
CREATE TABLE IF NOT EXISTS post_performance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID REFERENCES media_insights(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Metrics at this snapshot
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    shares_count INTEGER DEFAULT 0,
    saves_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2),
    
    -- Video-specific metrics
    video_views INTEGER,
    video_completion_rate DECIMAL(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create follower_growth_tracking table for detailed follower analytics
CREATE TABLE IF NOT EXISTS follower_growth_tracking (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL,
    
    -- Daily metrics
    followers_count INTEGER NOT NULL,
    following_count INTEGER NOT NULL,
    posts_count INTEGER NOT NULL,
    
    -- Growth calculations
    followers_gained INTEGER DEFAULT 0,
    followers_lost INTEGER DEFAULT 0,
    net_growth INTEGER DEFAULT 0,
    growth_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Engagement metrics
    average_likes INTEGER DEFAULT 0,
    average_comments INTEGER DEFAULT 0,
    engagement_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(account_id, tracking_date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_stories_analytics_account_id ON stories_analytics(account_id);
CREATE INDEX IF NOT EXISTS idx_stories_analytics_posted_at ON stories_analytics(posted_at);
CREATE INDEX IF NOT EXISTS idx_audience_demographics_account_id ON audience_demographics(account_id);
CREATE INDEX IF NOT EXISTS idx_audience_demographics_snapshot_date ON audience_demographics(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_post_performance_history_media_id ON post_performance_history(media_id);
CREATE INDEX IF NOT EXISTS idx_post_performance_history_snapshot_date ON post_performance_history(snapshot_date);
CREATE INDEX IF NOT EXISTS idx_follower_growth_tracking_account_id ON follower_growth_tracking(account_id);
CREATE INDEX IF NOT EXISTS idx_follower_growth_tracking_date ON follower_growth_tracking(tracking_date);

-- Enable Row Level Security
ALTER TABLE stories_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audience_demographics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_performance_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE follower_growth_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for stories_analytics
CREATE POLICY "Users can view their own stories analytics"
    ON stories_analytics FOR SELECT
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own stories analytics"
    ON stories_analytics FOR INSERT
    WITH CHECK (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own stories analytics"
    ON stories_analytics FOR UPDATE
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

-- Create RLS policies for audience_demographics
CREATE POLICY "Users can view their own audience demographics"
    ON audience_demographics FOR SELECT
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own audience demographics"
    ON audience_demographics FOR INSERT
    WITH CHECK (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own audience demographics"
    ON audience_demographics FOR UPDATE
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

-- Create RLS policies for post_performance_history
CREATE POLICY "Users can view their own post performance history"
    ON post_performance_history FOR SELECT
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own post performance history"
    ON post_performance_history FOR INSERT
    WITH CHECK (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

-- Create RLS policies for follower_growth_tracking
CREATE POLICY "Users can view their own follower growth tracking"
    ON follower_growth_tracking FOR SELECT
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can insert their own follower growth tracking"
    ON follower_growth_tracking FOR INSERT
    WITH CHECK (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));

CREATE POLICY "Users can update their own follower growth tracking"
    ON follower_growth_tracking FOR UPDATE
    USING (account_id IN (
        SELECT id FROM instagram_accounts WHERE user_id = auth.uid()
    ));;