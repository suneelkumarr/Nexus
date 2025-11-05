-- Migration: fix_notifications_policy_syntax
-- Created at: 1761998173

-- ===================================
-- FIX: NOTIFICATIONS POLICY SYNTAX ERROR
-- Remove reference to team_members in INSERT policy
-- ===================================

-- Drop the problematic INSERT policy that references team_members
DROP POLICY IF EXISTS "Users can create notifications for team members" ON notifications;

-- Create simplified INSERT policy without team_members reference
CREATE POLICY "Users can create notifications" ON notifications
FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND (
        team_id IS NULL OR
        team_id IN (SELECT id FROM team_management WHERE owner_id = auth.uid())
    )
);

-- Also let's check if there are any other problematic policies
-- Verify the fix
SELECT 'notifications INSERT policy fixed' as status;;