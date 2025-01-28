/*
  # Fix Team Creation Policies

  1. Changes
    - Drop conflicting policies
    - Add new simplified policies for team creation
    - Fix team member management policies
  
  2. Security
    - Maintain RLS security
    - Ensure proper access control
*/

-- Drop conflicting policies
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Anyone can view teams by invite code" ON teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;

-- Create simplified team policies
CREATE POLICY "Enable team creation"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable team viewing"
  ON teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
    OR
    created_by = auth.uid()
  );

CREATE POLICY "Enable team updates"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Admin', 'Owner')
    )
  );

CREATE POLICY "Enable team deletion"
  ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'Owner'
    )
  );

-- Drop and recreate team member policies
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

CREATE POLICY "Enable member viewing"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Enable member management"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Admin', 'Owner')
    )
  );