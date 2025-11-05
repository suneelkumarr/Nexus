CREATE TABLE pwa_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    app_name VARCHAR(255) DEFAULT 'Instagram Analytics Pro',
    theme_color VARCHAR(7) DEFAULT '#0891b2',
    background_color VARCHAR(7) DEFAULT '#ffffff',
    icon_urls JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    offline_settings JSONB DEFAULT '{}',
    install_prompt_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_enabled BOOLEAN DEFAULT true
);