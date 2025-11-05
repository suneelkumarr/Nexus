CREATE TABLE ai_performance_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
    prediction_type VARCHAR(50) NOT NULL,
    predicted_metric VARCHAR(100) NOT NULL,
    current_value DECIMAL(12,2),
    predicted_value DECIMAL(12,2),
    prediction_date DATE NOT NULL,
    confidence_level DECIMAL(5,2),
    growth_trajectory VARCHAR(50),
    contributing_factors JSONB,
    recommendations JSONB,
    model_accuracy DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT NOW()
);