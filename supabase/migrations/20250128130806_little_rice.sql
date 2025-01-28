/*
  # Fix Team Creation and Member Policies

  1. Changes
    - Drop existing problematic policies
    - Create new simplified policies for teams and members
    - Fix infinite recursion issues
  
  2. Security
    - Maintain RLS security while fixing access issues
    - Ensure proper team member management
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team creator can manage team members" ON team_members;

-- Create new simplified team policies
CREATE POLICY "teams_insert_policy"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "teams_select_policy"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = id
      AND team_members.user_id = auth.uid()
    )
    OR created_by = auth.uid()
  );

CREATE POLICY "teams_update_policy"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "teams_delete_policy"
  ON teams
  FOR DELETE
  TO authenticated
  USING (created_by = auth.uid());

-- Create new simplified team member policies
CREATE POLICY "team_members_select_policy"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "team_members_insert_policy"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "team_members_update_policy"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "team_members_delete_policy"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT id FROM teams
      WHERE created_by = auth.uid()
    )
  );