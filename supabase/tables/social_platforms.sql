CREATE TABLE social_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    team_id UUID,
    platform_name VARCHAR(50) NOT NULL,
    platform_username VARCHAR(255) NOT NULL,
    account_id VARCHAR(255),
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_sync TIMESTAMP WITH TIME ZONE,
    sync_status VARCHAR(20) DEFAULT 'connected',
    platform_data JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);