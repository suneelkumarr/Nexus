CREATE TABLE content_discoveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL,
    discovery_type TEXT NOT NULL,
    content_data JSONB,
    hashtags TEXT[],
    location TEXT,
    engagement_score INTEGER DEFAULT 0,
    is_saved BOOLEAN DEFAULT false,
    notes TEXT,
    discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);