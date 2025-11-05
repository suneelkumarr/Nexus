import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Users, Settings, Trash2, Edit, Crown, Shield, Check, X, Search, Filter } from 'lucide-react';

interface Team {
  id: string;
  team_name: string;
  team_description: string;
  team_logo_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  max_members: number;
  subscription_tier: string;
  team_settings: any;
  owner_id: string;
  member_count?: number;
}

interface TeamManagementProps {
  selectedAccount: string | null;
}

export default function TeamManagement({ selectedAccount }: TeamManagementProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    team_name: '',
    team_description: '',
    max_members: 50,
    subscription_tier: 'basic'
  });

  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      // Fetch teams where user is owner (RLS policies will handle access control)
      const { data: teamData, error: teamError } = await supabase
        .from('team_management')
        .select(`
          *
        `)
        .eq('owner_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (teamError) throw teamError;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        (teamData || []).map(async (team) => {
          const { count } = await supabase
            .from('team_members')
            .select('*', { count: 'exact' })
            .eq('team_id', team.id)
            .eq('status', 'active');

          return {
            ...team,
            member_count: count || 0
          };
        })
      );

      setTeams(teamsWithCounts);
    } catch (error: any) {
      console.error('Error fetching teams:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createTeam = async () => {
    try {
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('team_management')
        .insert([{
          owner_id: user.id,
          team_name: formData.team_name,
          team_description: formData.team_description,
          max_members: formData.max_members,
          subscription_tier: formData.subscription_tier,
          team_settings: {}
        }])
        .select()
        .single();

      if (error) throw error;

      // Add creator as team owner
      await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id,
          role: 'owner',
          status: 'active',
          permissions: {
            manage_team: true,
            manage_members: true,
            manage_permissions: true,
            view_analytics: true,
            export_data: true
          }
        }]);

      setIsCreateModalOpen(false);
      setFormData({
        team_name: '',
        team_description: '',
        max_members: 50,
        subscription_tier: 'basic'
      });
      fetchTeams();
    } catch (error: any) {
      console.error('Error creating team:', error);
      setError(error.message);
    }
  };

  const updateTeam = async () => {
    try {
      setError('');

      if (!selectedTeam) return;

      const { error } = await supabase
        .from('team_management')
        .update({
          team_name: formData.team_name,
          team_description: formData.team_description,
          max_members: formData.max_members,
          subscription_tier: formData.subscription_tier,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTeam.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setSelectedTeam(null);
      fetchTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      setError(error.message);
    }
  };

  const deleteTeam = async (teamId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to delete this team? This action cannot be undone.');
      if (!confirmed) return;

      const { error } = await supabase
        .from('team_management')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) throw error;

      fetchTeams();
    } catch (error: any) {
      console.error('Error deleting team:', error);
      setError(error.message);
    }
  };

  const openEditModal = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      team_name: team.team_name,
      team_description: team.team_description || '',
      max_members: team.max_members,
      subscription_tier: team.subscription_tier
    });
    setIsEditModalOpen(true);
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         team.team_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === 'all' || team.subscription_tier === filterTier;
    return matchesSearch && matchesTier;
  });

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'premium':
        return 'bg-gold-100 text-gold-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'basic':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter */}
          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tiers</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Create Team
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{team.team_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getTierBadgeColor(team.subscription_tier)}`}>
                        {team.subscription_tier}
                      </span>
                      {team.owner_id === user?.id && (
                        <Crown className="h-4 w-4 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(team)}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {team.owner_id === user?.id && (
                    <button
                      onClick={() => deleteTeam(team.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Description */}
              {team.team_description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {team.team_description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.member_count}/{team.max_members}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {new Date(team.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No teams found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || filterTier !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first team to start collaborating'
            }
          </p>
          {!searchQuery && filterTier === 'all' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Team
            </button>
          )}
        </div>
      )}

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Create New Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.team_description}
                    onChange={(e) => setFormData({ ...formData, team_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter team description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subscription Tier
                    </label>
                    <select
                      value={formData.subscription_tier}
                      onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={createTeam}
                  disabled={!formData.team_name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Create Team
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
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

      {/* Edit Team Modal */}
      {isEditModalOpen && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Team</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={formData.team_name}
                    onChange={(e) => setFormData({ ...formData, team_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.team_description}
                    onChange={(e) => setFormData({ ...formData, team_description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Members
                    </label>
                    <input
                      type="number"
                      value={formData.max_members}
                      onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subscription Tier
                    </label>
                    <select
                      value={formData.subscription_tier}
                      onChange={(e) => setFormData({ ...formData, subscription_tier: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={updateTeam}
                  disabled={!formData.team_name.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Update Team
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