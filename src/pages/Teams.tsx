import React from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, UserPlus, Settings, BarChart3, Trash2, Copy, Check, Shield, Users, UserCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { supabase, createTeam, addTeamMember, updateMemberRole, removeTeamMember } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Team = Database['public']['Tables']['teams']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

function Dialog({ isOpen, onClose, children }: DialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}

export function Teams() {
  const { t } = useTranslation();
  const [teams, setTeams] = React.useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showNewTeamDialog, setShowNewTeamDialog] = React.useState(false);
  const [showAddMemberDialog, setShowAddMemberDialog] = React.useState(false);
  const [newTeamName, setNewTeamName] = React.useState('');
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberRole, setNewMemberRole] = React.useState('Member');
  const [copiedInviteCode, setCopiedInviteCode] = React.useState(false);

  React.useEffect(() => {
    fetchTeams();
  }, []);

  React.useEffect(() => {
    if (selectedTeam) {
      fetchTeamMembers(selectedTeam.id);
    }
  }, [selectedTeam]);

  async function fetchTeams() {
    try {
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select('*');

      if (error) throw error;
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTeamMembers(teamId: string) {
    try {
      const { data: membersData, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId);

      if (error) throw error;
      setTeamMembers(membersData || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  }

  async function handleCreateTeam() {
    try {
      const newTeam = await createTeam(newTeamName);
      setTeams([...teams, newTeam]);
      setNewTeamName('');
      setShowNewTeamDialog(false);
      setSelectedTeam(newTeam);
    } catch (error) {
      console.error('Error creating team:', error);
    }
  }

  async function handleAddMember() {
    if (!selectedTeam) return;

    try {
      await addTeamMember(selectedTeam.id, newMemberEmail, newMemberRole);
      await fetchTeamMembers(selectedTeam.id);
      setNewMemberEmail('');
      setNewMemberRole('Member');
      setShowAddMemberDialog(false);
    } catch (error) {
      console.error('Error adding team member:', error);
    }
  }

  async function handleUpdateRole(memberId: string, newRole: string) {
    try {
      await updateMemberRole(memberId, newRole);
      if (selectedTeam) {
        await fetchTeamMembers(selectedTeam.id);
      }
    } catch (error) {
      console.error('Error updating member role:', error);
    }
  }

  async function handleRemoveMember(memberId: string) {
    try {
      await removeTeamMember(memberId);
      if (selectedTeam) {
        await fetchTeamMembers(selectedTeam.id);
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    }
  }

  function handleCopyInviteCode() {
    if (!selectedTeam) return;
    navigator.clipboard.writeText(selectedTeam.invite_code);
    setCopiedInviteCode(true);
    setTimeout(() => setCopiedInviteCode(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <div className="flex justify-center">
            <UserCircle className="w-20 h-20 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Welcome to Team Management</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Get started by creating your first team. You'll be able to invite members,
              assign roles, and track team mood together.
            </p>
          </div>
          <button
            onClick={() => setShowNewTeamDialog(true)}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Your First Team
          </button>
        </div>

        <Dialog
          isOpen={showNewTeamDialog}
          onClose={() => setShowNewTeamDialog(false)}
        >
          <h2 className="text-xl font-bold mb-4">Create New Team</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Name
              </label>
              <input
                type="text"
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                placeholder="Enter team name"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewTeamDialog(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTeam}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                disabled={!newTeamName.trim()}
              >
                Create Team
              </button>
            </div>
          </div>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t('nav.teams')}</h1>
        <button
          onClick={() => setShowNewTeamDialog(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teams List */}
        <div className="lg:col-span-1 space-y-4">
          {teams.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={cn(
                'w-full p-4 rounded-lg text-left transition-colors',
                'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
                selectedTeam?.id === team.id && 'ring-2 ring-indigo-500 dark:ring-indigo-400'
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{team.name}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {teamMembers.length} members
                </span>
              </div>
              <div className="flex -space-x-2">
                {teamMembers.slice(0, 3).map((member) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800"
                  >
                    {member.user_id.charAt(0)}
                  </div>
                ))}
                {teamMembers.length > 3 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center border-2 border-white dark:border-gray-800">
                    <span className="text-xs">+{teamMembers.length - 3}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2">
          {selectedTeam ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedTeam.name}</h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Invite Code: {selectedTeam.invite_code}
                    </p>
                    <button
                      onClick={handleCopyInviteCode}
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      {copiedInviteCode ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowAddMemberDialog(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Team Members</h3>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="py-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          {member.user_id.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{member.user_id}</p>
                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                            className="mt-1 text-sm bg-transparent border-none p-0 pr-6 text-gray-600 dark:text-gray-400"
                          >
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                            <option value="Owner">Owner</option>
                          </select>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                Select a team to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Member Dialog */}
      <Dialog
        isOpen={showAddMemberDialog}
        onClose={() => setShowAddMemberDialog(false)}
      >
        <h2 className="text-xl font-bold mb-4">Add Team Member</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="memberEmail"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Role
            </label>
            <select
              id="memberRole"
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddMemberDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleAddMember}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={!newMemberEmail.trim()}
            >
              Add Member
            </button>
          </div>
        </div>
      </Dialog>

      {/* New Team Dialog */}
      <Dialog
        isOpen={showNewTeamDialog}
        onClose={() => setShowNewTeamDialog(false)}
      >
        <h2 className="text-xl font-bold mb-4">Create New Team</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Team Name
            </label>
            <input
              type="text"
              id="teamName"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
              placeholder="Enter team name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowNewTeamDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateTeam}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={!newTeamName.trim()}
            >
              Create Team
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}