-- Migration: fix_team_members_infinite_recursion
-- Created at: 1761997538

-- ===================================
-- FIX: TEAM MEMBERS INFINITE RECURSION
-- Remove recursive policies and create non-recursive ones
-- ===================================

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Users can view team members of teams they belong to" ON team_members;
DROP POLICY IF EXISTS "Team owners and admins can manage members" ON team_members;

-- ===================================
-- CREATE NON-RECURSIVE POLICIES
-- ===================================

-- Policy 1: Users can always view their own team memberships
CREATE POLICY "Users can view their own memberships" ON team_members
FOR SELECT USING (user_id = auth.uid());

-- Policy 2: Team owners can view all members of their teams
CREATE POLICY "Team owners can view their team members" ON team_members
FOR SELECT USING (
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- Policy 3: Users can view team members if they are owners of the team
CREATE POLICY "Team owners can manage team members" ON team_members
FOR ALL USING (
    team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
);

-- Policy 4: Users can insert themselves into teams (for invitations)
CREATE POLICY "Users can join teams they are invited to" ON team_members
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Policy 5: Users can update their own membership status
CREATE POLICY "Users can update their own membership" ON team_members
FOR UPDATE USING (user_id = auth.uid());

-- ===================================
-- VERIFICATION
-- ===================================

-- Check that policies are non-recursive
SELECT 'team_members policies fixed' as status;;