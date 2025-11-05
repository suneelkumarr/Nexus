CREATE TABLE dashboard_customization (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    team_id UUID,
    dashboard_name VARCHAR(255) NOT NULL,
    layout_config JSONB NOT NULL DEFAULT '{}',
    widget_settings JSONB DEFAULT '{}',
    color_scheme VARCHAR(50) DEFAULT 'default',
    theme_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_default BOOLEAN DEFAULT false,
    is_shared BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0
);