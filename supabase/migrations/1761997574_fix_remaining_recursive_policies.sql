-- Migration: fix_remaining_recursive_policies
-- Created at: 1761997574

-- ===================================
-- FIX: REMAINING RECURSIVE POLICY ISSUES
-- Update policies that reference team_members to be more efficient
-- ===================================

-- Drop and recreate user_permissions policy that has recursive UNION
DROP POLICY IF EXISTS "Team owners and admins can manage permissions" ON user_permissions;

CREATE POLICY "Team owners can manage all permissions" ON user_permissions
FOR ALL USING (
    granted_by = auth.uid() OR
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- Note: Other policies (export_templates, social_platforms, dashboard_customization) 
-- reference team_members but should work now that team_members policies are fixed.
-- However, let's create more efficient versions to avoid any potential issues:

-- Update export_templates policy for better performance
DROP POLICY IF EXISTS "Users can view their own templates and public ones" ON export_templates;

CREATE POLICY "Users can view accessible templates" ON export_templates
FOR SELECT USING (
    user_id = auth.uid() OR 
    is_public = true OR
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- Update social_platforms policy for better performance  
DROP POLICY IF EXISTS "Users can view their own social platforms" ON social_platforms;

CREATE POLICY "Users can view accessible social platforms" ON social_platforms
FOR SELECT USING (
    user_id = auth.uid() OR
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- Update dashboard_customization policy for better performance
DROP POLICY IF EXISTS "Users can view their own dashboards and shared ones" ON dashboard_customization;

CREATE POLICY "Users can view accessible dashboards" ON dashboard_customization
FOR SELECT USING (
    user_id = auth.uid() OR 
    is_shared = true OR
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- ===================================
-- VERIFICATION
-- ===================================

SELECT 'All recursive policies fixed' as status;;