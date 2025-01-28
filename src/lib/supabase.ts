import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export async function createTeam(name: string) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('Not authenticated');

  const inviteCode = generateInviteCode();
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      invite_code: inviteCode,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Add the creator as a team member with Owner role
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: data.id,
      user_id: user.id,
      role: 'Owner',
    });

  if (memberError) throw memberError;
  return data;
}

export async function addTeamMember(teamId: string, email: string, role: string) {
  // First, get the user ID from the email
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (userError) throw userError;

  // Then add the team member
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userData.id,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateMemberRole(teamMemberId: string, role: string) {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role })
    .eq('id', teamMemberId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeTeamMember(teamMemberId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', teamMemberId);

  if (error) throw error;
}

export async function getTeamByInviteCode(inviteCode: string) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('invite_code', inviteCode)
    .single();

  if (error) throw error;
  return data;
}

export async function joinTeam(teamId: string, role: string = 'Member') {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: user.id,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const codeLength = 8;
  let code = '';
  
  for (let i = 0; i < codeLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    code += chars[randomIndex];
  }
  
  return code;
}