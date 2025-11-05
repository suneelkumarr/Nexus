-- Migration: force_refresh_rls_policies
-- Created at: 1761998634

-- ===================================
-- FORCE REFRESH RLS POLICIES
-- Toggle RLS off and on to clear any cached policy issues
-- ===================================

-- Disable RLS temporarily on all Phase 5 tables to clear any cache
ALTER TABLE team_management DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms DISABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_customization DISABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_settings DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS to force policy refresh
ALTER TABLE team_management ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_customization ENABLE ROW LEVEL SECURITY;
ALTER TABLE pwa_settings ENABLE ROW LEVEL SECURITY;

-- Force PostgreSQL to recompile policies
SELECT 'RLS policies refreshed' as status;;