-- Migration: phase5_database_optimization
-- Created at: 1761994088

-- ===================================
-- PHASE 5: DATABASE OPTIMIZATION
-- RLS Policies, Foreign Keys, Indexes
-- ===================================

-- Enable RLS on all Phase 5 tables
ALTER TABLE team_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_settings ENABLE ROW LEVEL SECURITY;

-- ===================================
-- FOREIGN KEY CONSTRAINTS
-- ===================================

-- Team Members References
ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

ALTER TABLE team_members 
ADD CONSTRAINT fk_team_members_invited_by 
FOREIGN KEY (invited_by) REFERENCES auth.users(id) ON DELETE SET NULL;

-- User Permissions References
ALTER TABLE user_permissions 
ADD CONSTRAINT fk_user_permissions_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

ALTER TABLE user_permissions 
ADD CONSTRAINT fk_user_permissions_granted_by 
FOREIGN KEY (granted_by) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Export Templates References
ALTER TABLE export_templates 
ADD CONSTRAINT fk_export_templates_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

-- Notifications References
ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

ALTER TABLE notifications 
ADD CONSTRAINT fk_notifications_sender_id 
FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Social Platforms References
ALTER TABLE social_platforms 
ADD CONSTRAINT fk_social_platforms_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

-- Dashboard Customization References
ALTER TABLE dashboard_customization 
ADD CONSTRAINT fk_dashboard_customization_team_id 
FOREIGN KEY (team_id) REFERENCES team_management(id) ON DELETE CASCADE;

-- ===================================
-- PERFORMANCE INDEXES
-- ===================================

-- Team Management Indexes
CREATE INDEX idx_team_management_owner_id ON team_management(owner_id);
CREATE INDEX idx_team_management_active ON team_management(is_active) WHERE is_active = true;
CREATE INDEX idx_team_management_subscription ON team_management(subscription_tier);

-- Team Members Indexes
CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_role ON team_members(role);
CREATE INDEX idx_team_members_status ON team_members(status) WHERE status = 'active';
CREATE INDEX idx_team_members_activity ON team_members(last_activity DESC);
CREATE UNIQUE INDEX idx_team_members_unique ON team_members(team_id, user_id);

-- User Permissions Indexes
CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_team_id ON user_permissions(team_id);
CREATE INDEX idx_user_permissions_type ON user_permissions(permission_type);
CREATE INDEX idx_user_permissions_active ON user_permissions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_permissions_expires ON user_permissions(expires_at) WHERE expires_at IS NOT NULL;

-- Export Templates Indexes
CREATE INDEX idx_export_templates_user_id ON export_templates(user_id);
CREATE INDEX idx_export_templates_team_id ON export_templates(team_id);
CREATE INDEX idx_export_templates_type ON export_templates(template_type);
CREATE INDEX idx_export_templates_format ON export_templates(export_format);
CREATE INDEX idx_export_templates_public ON export_templates(is_public) WHERE is_public = true;
CREATE INDEX idx_export_templates_usage ON export_templates(usage_count DESC);

-- Notifications Indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_team_id ON notifications(team_id);
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, status) WHERE status = 'unread';

-- Social Platforms Indexes
CREATE INDEX idx_social_platforms_user_id ON social_platforms(user_id);
CREATE INDEX idx_social_platforms_team_id ON social_platforms(team_id);
CREATE INDEX idx_social_platforms_name ON social_platforms(platform_name);
CREATE INDEX idx_social_platforms_active ON social_platforms(is_active) WHERE is_active = true;
CREATE INDEX idx_social_platforms_sync ON social_platforms(sync_status);
CREATE INDEX idx_social_platforms_last_sync ON social_platforms(last_sync DESC);
CREATE UNIQUE INDEX idx_social_platforms_unique ON social_platforms(user_id, platform_name, platform_username);

-- Dashboard Customization Indexes
CREATE INDEX idx_dashboard_customization_user_id ON dashboard_customization(user_id);
CREATE INDEX idx_dashboard_customization_team_id ON dashboard_customization(team_id);
CREATE INDEX idx_dashboard_customization_default ON dashboard_customization(is_default) WHERE is_default = true;
CREATE INDEX idx_dashboard_customization_shared ON dashboard_customization(is_shared) WHERE is_shared = true;
CREATE INDEX idx_dashboard_customization_views ON dashboard_customization(view_count DESC);

-- PWA Settings Indexes
CREATE INDEX idx_pwa_settings_user_id ON pwa_settings(user_id);
CREATE INDEX idx_pwa_settings_enabled ON pwa_settings(is_enabled) WHERE is_enabled = true;
CREATE UNIQUE INDEX idx_pwa_settings_unique_user ON pwa_settings(user_id);

-- ===================================
-- ROW LEVEL SECURITY POLICIES
-- ===================================

-- Team Management Policies
CREATE POLICY "Users can view teams they own or are members of" ON team_management
FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can create teams" ON team_management
FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Team owners can update their teams" ON team_management
FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Team owners can delete their teams" ON team_management
FOR DELETE USING (owner_id = auth.uid());

-- Team Members Policies
CREATE POLICY "Users can view team members of teams they belong to" ON team_members
FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Team owners and admins can manage members" ON team_members
FOR ALL USING (
    team_id IN (
        SELECT id FROM team_management WHERE owner_id = auth.uid()
        UNION
        SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
);

-- User Permissions Policies
CREATE POLICY "Users can view their own permissions" ON user_permissions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team owners and admins can manage permissions" ON user_permissions
FOR ALL USING (
    granted_by = auth.uid() OR
    team_id IN (
        SELECT id FROM team_management WHERE owner_id = auth.uid()
        UNION
        SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
);

-- Export Templates Policies
CREATE POLICY "Users can view their own templates and public ones" ON export_templates
FOR SELECT USING (
    user_id = auth.uid() OR 
    is_public = true OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can create export templates" ON export_templates
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates" ON export_templates
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates" ON export_templates
FOR DELETE USING (user_id = auth.uid());

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create notifications for team members" ON notifications
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
        team_id IS NULL OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
    )
);

CREATE POLICY "Users can update their own notifications" ON notifications
FOR UPDATE USING (user_id = auth.uid());

-- Social Platforms Policies
CREATE POLICY "Users can view their own social platforms" ON social_platforms
FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can manage their own social platforms" ON social_platforms
FOR ALL USING (user_id = auth.uid());

-- Dashboard Customization Policies
CREATE POLICY "Users can view their own dashboards and shared ones" ON dashboard_customization
FOR SELECT USING (
    user_id = auth.uid() OR 
    is_shared = true OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid() AND status = 'active')
);

CREATE POLICY "Users can manage their own dashboard customizations" ON dashboard_customization
FOR ALL USING (user_id = auth.uid());

-- PWA Settings Policies
CREATE POLICY "Users can view their own PWA settings" ON pwa_settings
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own PWA settings" ON pwa_settings
FOR ALL USING (user_id = auth.uid());

-- ===================================
-- UPDATED_AT TRIGGERS
-- ===================================

-- Function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at columns
CREATE TRIGGER update_team_management_updated_at BEFORE UPDATE ON team_management 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_export_templates_updated_at BEFORE UPDATE ON export_templates 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_customization_updated_at BEFORE UPDATE ON dashboard_customization 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pwa_settings_updated_at BEFORE UPDATE ON pwa_settings 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();;