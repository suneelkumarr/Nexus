CREATE TABLE hashtag_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    hashtag TEXT NOT NULL,
    usage_count INTEGER DEFAULT 0,
    total_reach INTEGER DEFAULT 0,
    total_impressions INTEGER DEFAULT 0,
    average_engagement_rate DECIMAL(5,2) DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    popularity_score INTEGER DEFAULT 0,
    related_hashtags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);