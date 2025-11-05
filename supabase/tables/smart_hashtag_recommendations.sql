CREATE TABLE smart_hashtag_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    content_theme VARCHAR(255) NOT NULL,
    recommended_hashtags JSONB NOT NULL,
    hashtag_scores JSONB,
    competition_level VARCHAR(50),
    estimated_reach INTEGER,
    relevance_score DECIMAL(5,2),
    trending_score DECIMAL(5,2),
    mix_strategy TEXT,
    reasoning TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);