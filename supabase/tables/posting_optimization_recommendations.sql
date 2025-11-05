CREATE TABLE posting_optimization_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    optimal_posting_times JSONB NOT NULL,
    day_of_week_performance JSONB,
    content_type_recommendations JSONB,
    engagement_patterns JSONB,
    audience_activity_hours JSONB,
    recommended_posting_frequency INTEGER,
    confidence_score DECIMAL(5,2),
    analysis_period_days INTEGER DEFAULT 30,
    created_at TIMESTAMP DEFAULT NOW()
);