/*
  # Update Team Policies

  1. Changes
    - Drop existing policies before recreating them
    - Update team access policies for better security
    - Add policies for team member management
  
  2. Security
    - Ensure proper access control for teams and members
    - Maintain RLS security
*/

-- Drop all existing team policies first
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Team members can view their teams" ON teams;
DROP POLICY IF EXISTS "Team admins can update teams" ON teams;
DROP POLICY IF EXISTS "Team owners can delete teams" ON teams;
DROP POLICY IF EXISTS "Anyone can view teams by invite code" ON teams;

-- Recreate team policies
CREATE POLICY "Users can create teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Anyone can view teams by invite code"
  ON teams
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team admins can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role IN ('Admin', 'Owner')
    )
  );

CREATE POLICY "Team owners can delete teams"
  ON teams
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = teams.id
      AND team_members.user_id = auth.uid()
      AND team_members.role = 'Owner'
    )
  );

-- Drop existing team member policies
DROP POLICY IF EXISTS "Team members can view team members" ON team_members;
DROP POLICY IF EXISTS "Team creator can manage team members" ON team_members;
DROP POLICY IF EXISTS "Anyone can view team members" ON team_members;
DROP POLICY IF EXISTS "Team admins can manage members" ON team_members;

-- Create new team member policies
CREATE POLICY "Anyone can view team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team admins can manage members"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members admin_check
      WHERE admin_check.team_id = team_members.team_id
      AND admin_check.user_id = auth.uid()
      AND admin_check.role IN ('Admin', 'Owner')
    )
  );