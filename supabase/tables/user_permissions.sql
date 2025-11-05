CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    team_id UUID,
    permission_type VARCHAR(100) NOT NULL,
    permission_level VARCHAR(50) NOT NULL,
    resource_id UUID,
    granted_by UUID NOT NULL,
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    permission_metadata JSONB DEFAULT '{}'
);