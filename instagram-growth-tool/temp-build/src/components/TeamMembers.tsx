import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Users, UserPlus, Crown, Shield, User, MoreHorizontal, Mail, Calendar, Clock, Search, Filter, Check, X, AlertTriangle } from 'lucide-react';

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  permissions: any;
  joined_at: string;
  invited_by: string | null;
  status: string;
  last_activity: string | null;
  member_settings: any;
  user_email?: string;
  team_name?: string;
}

interface Team {
  id: string;
  team_name: string;
  owner_id: string;
}

interface TeamMembersProps {
  selectedAccount: string | null;
}

export default function TeamMembers({ selectedAccount }: TeamMembersProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Form state
  const [inviteData, setInviteData] = useState({
    team_id: '',
    email: '',
    role: 'member'
  });

  const [editData, setEditData] = useState({
    role: '',
    permissions: {}
  });

  const roles = [
    { id: 'owner', name: 'Owner', description: 'Full access to everything', icon: Crown, color: 'text-yellow-600' },
    { id: 'admin', name: 'Admin', description: 'Manage team and members', icon: Shield, color: 'text-blue-600' },
    { id: 'editor', name: 'Editor', description: 'Edit content and view analytics', icon: User, color: 'text-green-600' },
    { id: 'viewer', name: 'Viewer', description: 'View analytics only', icon: User, color: 'text-gray-600' },
    { id: 'member', name: 'Member', description: 'Basic team access', icon: User, color: 'text-purple-600' }
  ];

  useEffect(() => {
    fetchTeams();
  }, [user]);

  useEffect(() => {
    if (teams.length > 0) {
      fetchMembers();
    }
  }, [selectedTeam, teams]);

  const fetchTeams = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('team_management')
        .select('id, team_name, owner_id')
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('team_name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setError(error.message);
    }
  };

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      let query = supabase
        .from('team_members')
        .select(`
          *,
          team_management!inner(team_name, owner_id)
        `)
        .order('joined_at', { ascending: false });

      if (selectedTeam !== 'all') {
        query = query.eq('team_id', selectedTeam);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get user emails for each member
      const membersWithEmails = await Promise.all(
        (data || []).map(async (member) => {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(member.user_id);
            return {
              ...member,
              user_email: userData?.user?.email || 'Unknown',
              team_name: member.team_management?.team_name
            };
          } catch {
            return {
              ...member,
              user_email: 'Unknown',
              team_name: member.team_management?.team_name
            };
          }
        })
      );

      setMembers(membersWithEmails);
    } catch (error: any) {
      console.error('Error fetching members:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async () => {
    try {
      setError('');

      if (!user || !inviteData.email || !inviteData.team_id) return;

      // Check if user already exists in team
      const { data: existingMember } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', inviteData.team_id)
        .eq('user_id', inviteData.email) // Note: This would need proper user lookup
        .single();

      if (existingMember) {
        throw new Error('User is already a member of this team');
      }

      // Create invitation notification
      const { error: notificationError } = await supabase.functions.invoke('send-notifications', {
        body: {
          recipients: [inviteData.email], // This would need proper user ID lookup
          notificationType: 'team_invite',
          title: 'Team Invitation',
          message: `You've been invited to join a team with ${inviteData.role} access.`,
          priority: 'high',
          teamId: inviteData.team_id,
          actionUrl: `/collaboration/teams`,
          actionData: {
            team_id: inviteData.team_id,
            role: inviteData.role,
            invited_by: user.id
          }
        }
      });

      if (notificationError) throw notificationError;

      setIsInviteModalOpen(false);
      setInviteData({ team_id: '', email: '', role: 'member' });
      
      // Show success message
      alert('Invitation sent successfully!');
    } catch (error: any) {
      console.error('Error inviting member:', error);
      setError(error.message);
    }
  };

  const updateMemberRole = async () => {
    try {
      setError('');

      if (!selectedMember) return;

      const { error } = await supabase
        .from('team_members')
        .update({
          role: editData.role,
          permissions: editData.permissions
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setSelectedMember(null);
      fetchMembers();
    } catch (error: any) {
      console.error('Error updating member:', error);
      setError(error.message);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to remove this member from the team?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'removed' })
        .eq('id', memberId);

      if (error) throw error;

      fetchMembers();
    } catch (error: any) {
      console.error('Error removing member:', error);
      setError(error.message);
    }
  };

  const openEditModal = (member: TeamMember) => {
    setSelectedMember(member);
    setEditData({
      role: member.role,
      permissions: member.permissions || {}
    });
    setIsEditModalOpen(true);
  };

  const getRoleIcon = (role: string) => {
    const roleConfig = roles.find(r => r.id === role);
    return roleConfig ? roleConfig.icon : User;
  };

  const getRoleColor = (role: string) => {
    const roleConfig = roles.find(r => r.id === role);
    return roleConfig ? roleConfig.color : 'text-gray-600';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'removed':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         member.team_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Team Filter */}
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.team_name}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Members List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredMembers.map((member) => {
                const RoleIcon = getRoleIcon(member.role);
                
                return (
                  <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {member.user_email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.user_email}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {member.user_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{member.team_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <RoleIcon className={`h-4 w-4 ${getRoleColor(member.role)}`} />
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {member.role}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(member.joined_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {member.last_activity 
                        ? new Date(member.last_activity).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(member)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        {member.user_id !== user?.id && (
                          <button
                            onClick={() => removeMember(member.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No members found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || roleFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No team members available'
              }
            </p>
          </div>
        )}
      </div>

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Invite Team Member</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team
                  </label>
                  <select
                    value={inviteData.team_id}
                    onChange={(e) => setInviteData({ ...inviteData, team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.filter(role => role.id !== 'owner').map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={inviteMember}
                  disabled={!inviteData.email || !inviteData.team_id}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Send Invitation
                </button>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Member Role</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Member
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {selectedMember.user_email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-white">{selectedMember.user_email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Role
                  </label>
                  <select
                    value={editData.role}
                    onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {roles.filter(role => role.id !== 'owner').map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name} - {role.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={updateMemberRole}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Update Role
                </button>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}