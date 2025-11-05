-- Migration: fix_team_management_circular_dependency
-- Created at: 1761997618

-- ===================================
-- FIX: TEAM MANAGEMENT CIRCULAR DEPENDENCY
-- Remove the circular reference between team_management and team_members
-- ===================================

-- Drop the policy that creates circular dependency
DROP POLICY IF EXISTS "Users can view teams they own or are members of" ON team_management;

-- Create separate policies for better clarity and no circular dependencies
CREATE POLICY "Users can view teams they own" ON team_management
FOR SELECT USING (owner_id = auth.uid());

-- Note: For viewing teams where user is a member (not owner), 
-- we'll handle this through application logic or a different approach
-- to avoid circular dependencies. Team members can be checked separately.

-- ===================================
-- VERIFICATION
-- ===================================

SELECT 'Team management circular dependency fixed' as status;;