/*
  # Add team moods tracking

  1. New Tables
    - `team_moods`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references auth.users)
      - `mood` (integer, 1-5)
      - `date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `team_moods` table
    - Add policies for:
      - Team members can view their team's moods
      - Users can submit their own moods
      - Team admins can view all team moods
*/

CREATE TABLE team_moods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  mood integer NOT NULL CHECK (mood >= 1 AND mood <= 5),
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id, date)
);

-- Enable RLS
ALTER TABLE team_moods ENABLE ROW LEVEL SECURITY;

-- Team members can view their team's moods
CREATE POLICY "Team members can view team moods"
  ON team_moods
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_moods.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can submit their own moods
CREATE POLICY "Users can submit their own moods"
  ON team_moods
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_members.team_id = team_moods.team_id
      AND team_members.user_id = auth.uid()
    )
  );

-- Users can update their own moods for today
CREATE POLICY "Users can update their own moods for today"
  ON team_moods
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id AND
    date = CURRENT_DATE
  )
  WITH CHECK (
    auth.uid() = user_id AND
    date = CURRENT_DATE
  );

-- Create indexes for better query performance
CREATE INDEX team_moods_team_id_date_idx ON team_moods(team_id, date);
CREATE INDEX team_moods_user_id_date_idx ON team_moods(user_id, date);