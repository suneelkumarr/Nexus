CREATE TABLE ai_content_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    suggestion_type VARCHAR(50) NOT NULL,
    content_theme VARCHAR(255) NOT NULL,
    content_description TEXT NOT NULL,
    visual_suggestions TEXT,
    caption_template TEXT,
    target_audience VARCHAR(255),
    estimated_engagement_score INTEGER,
    confidence_score DECIMAL(5,2),
    reasoning TEXT,
    best_posting_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);