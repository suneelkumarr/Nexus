CREATE TABLE ai_content_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    base_content_theme VARCHAR(255) NOT NULL,
    variation_type VARCHAR(50) NOT NULL,
    variation_title VARCHAR(255) NOT NULL,
    variation_description TEXT NOT NULL,
    caption_variations JSONB,
    visual_concepts JSONB,
    target_demographics JSONB,
    expected_performance_score INTEGER,
    a_b_testing_suggestions TEXT,
    unique_angle TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);