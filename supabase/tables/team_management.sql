CREATE TABLE team_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    team_name VARCHAR(255) NOT NULL,
    team_description TEXT,
    team_logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true,
    max_members INTEGER DEFAULT 50,
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    team_settings JSONB DEFAULT '{}'
);