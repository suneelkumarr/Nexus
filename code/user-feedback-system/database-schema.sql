-- User Feedback System Database Schema
-- Instagram Analytics Platform

-- User feedback table
CREATE TABLE user_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK (feedback_type IN ('general', 'nps', 'feature_specific', 'bug_report', 'improvement_suggestion')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 10),
    sentiment_score DECIMAL(3,2) CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
    category TEXT,
    subcategory TEXT,
    message TEXT NOT NULL,
    context TEXT, -- JSON string with context information
    feature_name TEXT,
    page_url TEXT,
    user_agent TEXT,
    session_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_analyzed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK (status IN ('new', 'in_progress', 'resolved', 'closed')) DEFAULT 'new',
    assigned_to UUID REFERENCES auth.users(id),
    tags TEXT[] DEFAULT '{}'
);

-- NPS responses table
CREATE TABLE nps_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 10),
    reason TEXT,
    feedback_id UUID REFERENCES user_feedback(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_segment TEXT,
    product_usage_days INTEGER
);

-- Feedback categories table
CREATE TABLE feedback_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color_code TEXT DEFAULT '#6366f1',
    parent_category_id UUID REFERENCES feedback_categories(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback trends table (for aggregated analytics)
CREATE TABLE feedback_trends (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    feedback_type TEXT NOT NULL,
    category TEXT,
    total_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    average_sentiment DECIMAL(3,2),
    nps_score INTEGER,
    promoters INTEGER DEFAULT 0,
    passives INTEGER DEFAULT 0,
    detractors INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, feedback_type, category)
);

-- Feedback sentiment analysis results
CREATE TABLE feedback_sentiment_analysis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    feedback_id UUID REFERENCES user_feedback(id) ON DELETE CASCADE,
    sentiment_score DECIMAL(3,2) NOT NULL,
    confidence DECIMAL(3,2) NOT NULL,
    emotions JSONB, -- {\"joy\": 0.7, \"anger\": 0.1, \"sadness\": 0.2}
    key_phrases TEXT[],
    language TEXT DEFAULT 'en',
    model_version TEXT,
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Feedback response templates for automated replies
CREATE TABLE feedback_response_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    sentiment_range TEXT NOT NULL, -- 'positive', 'neutral', 'negative'
    response_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User feedback widgets configuration
CREATE TABLE feedback_widget_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    widget_type TEXT NOT NULL CHECK (widget_type IN ('nps', 'feature_rating', 'bug_report', 'general_feedback')),
    trigger_condition JSONB NOT NULL, -- {\"event\": \"page_view\", \"page\": \"/dashboard\", \"delay\": 30000}
    is_active BOOLEAN DEFAULT TRUE,
    position TEXT DEFAULT 'bottom_right',
    title TEXT,
    description TEXT,
    placeholder_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_type ON user_feedback(feedback_type);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at);
CREATE INDEX idx_user_feedback_category ON user_feedback(category);
CREATE INDEX idx_nps_responses_user_id ON nps_responses(user_id);
CREATE INDEX idx_nps_responses_score ON nps_responses(score);
CREATE INDEX idx_feedback_trends_date ON feedback_trends(date);
CREATE INDEX idx_feedback_sentiment_analysis_feedback_id ON feedback_sentiment_analysis(feedback_id);

-- Insert default feedback categories
INSERT INTO feedback_categories (name, description, color_code) VALUES
    ('User Interface', 'Feedback related to UI/UX design and usability', '#3b82f6'),
    ('Performance', 'Feedback about application speed and performance', '#ef4444'),
    ('Features', 'Requests for new features or improvements to existing ones', '#10b981'),
    ('Bug Reports', 'Reports of bugs, errors, or broken functionality', '#f59e0b'),
    ('Documentation', 'Feedback about help docs, tutorials, and guides', '#8b5cf6'),
    ('Billing', 'Feedback related to pricing, payments, and subscriptions', '#ec4899'),
    ('Integration', 'Feedback about third-party integrations and APIs', '#06b6d4'),
    ('Mobile Experience', 'Feedback specific to mobile app usage', '#84cc16'),
    ('Data Accuracy', 'Feedback about data quality and accuracy', '#f97316'),
    ('General', 'General feedback and other categories', '#6b7280');

-- Insert default feedback response templates
INSERT INTO feedback_response_templates (category, sentiment_range, response_text) VALUES
    ('User Interface', 'positive', 'Thank you for the positive feedback! We''re glad you''re enjoying the interface improvements.'),
    ('User Interface', 'negative', 'We''re sorry to hear about your UI experience. We''ll prioritize these improvements in our next sprint.'),
    ('Features', 'positive', 'Great to hear you''re finding the features valuable! We''re constantly working on adding more.'),
    ('Features', 'negative', 'Thanks for the feedback on features. We''ll consider your suggestions for future development.'),
    ('Performance', 'positive', 'We''re thrilled that performance improvements are making a difference for you!'),
    ('Performance', 'negative', 'We take performance issues seriously. Our engineering team is actively working on optimizations.'),
    ('Bug Reports', 'negative', 'Thank you for reporting this bug. We''ve escalated it to our development team for immediate attention.'),
    ('General', 'neutral', 'Thank you for your feedback! We appreciate you taking the time to share your thoughts.'),
    ('General', 'positive', 'We''re delighted to hear positive feedback! Your satisfaction is our top priority.'),
    ('General', 'negative', 'We''re sorry you''re having a negative experience. Your feedback helps us improve.');

-- Enable Row Level Security
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE nps_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_sentiment_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_response_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_widget_config ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_feedback
CREATE POLICY "Users can view their own feedback" ON user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback" ON user_feedback
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for nps_responses
CREATE POLICY "Users can view their own NPS responses" ON nps_responses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own NPS responses" ON nps_responses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all feedback data
CREATE POLICY "Admins can view all feedback" ON user_feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Admins can view all NPS responses" ON nps_responses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.user_id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Public read access for categories, trends, and templates
CREATE POLICY "Anyone can view feedback categories" ON feedback_categories
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view feedback trends" ON feedback_trends
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view response templates" ON feedback_response_templates
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can view widget config" ON feedback_widget_config
    FOR SELECT USING (is_active = true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_feedback_updated_at 
    BEFORE UPDATE ON user_feedback 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_response_templates_updated_at 
    BEFORE UPDATE ON feedback_response_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_widget_config_updated_at 
    BEFORE UPDATE ON feedback_widget_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();