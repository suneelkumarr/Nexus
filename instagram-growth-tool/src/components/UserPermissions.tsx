import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Shield, Key, Users, Calendar, Check, X, Plus, Search, Filter, Clock, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';

interface Permission {
  id: string;
  user_id: string;
  team_id: string | null;
  permission_type: string;
  permission_level: string;
  resource_id: string | null;
  granted_by: string;
  granted_at: string;
  expires_at: string | null;
  is_active: boolean;
  permission_metadata: any;
  user_email?: string;
  team_name?: string;
  granted_by_email?: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface UserPermissionsProps {
  selectedAccount: string | null;
}

const PERMISSION_TYPES = [
  { id: 'view_analytics', name: 'View Analytics', description: 'Access to view analytics data' },
  { id: 'manage_content', name: 'Manage Content', description: 'Create and edit content' },
  { id: 'export_data', name: 'Export Data', description: 'Download reports and data exports' },
  { id: 'manage_team', name: 'Manage Team', description: 'Add/remove team members' },
  { id: 'manage_permissions', name: 'Manage Permissions', description: 'Grant and revoke permissions' },
  { id: 'view_reports', name: 'View Reports', description: 'Access generated reports' },
  { id: 'manage_integrations', name: 'Manage Integrations', description: 'Connect social platforms' },
  { id: 'admin_access', name: 'Admin Access', description: 'Full administrative access' }
];

const PERMISSION_LEVELS = [
  { id: 'read', name: 'Read Only', description: 'View only access' },
  { id: 'write', name: 'Read & Write', description: 'View and modify access' },
  { id: 'admin', name: 'Administrative', description: 'Full control access' },
  { id: 'owner', name: 'Owner', description: 'Ownership level access' }
];

export default function UserPermissions({ selectedAccount }: UserPermissionsProps) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);

  // Form state
  const [grantData, setGrantData] = useState({
    user_email: '',
    team_id: '',
    permission_type: '',
    permission_level: '',
    expires_at: '',
    resource_id: ''
  });

  const [editData, setEditData] = useState({
    permission_level: '',
    expires_at: '',
    is_active: true
  });

  useEffect(() => {
    fetchTeams();
    fetchPermissions();
  }, [user]);

  const fetchTeams = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('team_management')
        .select('id, team_name')
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

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('user_permissions')
        .select(`
          *,
          team_management(team_name)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;

      // Get user emails for permissions
      const permissionsWithEmails = await Promise.all(
        (data || []).map(async (permission) => {
          const userEmail = await getUserEmail(permission.user_id);
          const grantedByEmail = await getUserEmail(permission.granted_by);
          
          return {
            ...permission,
            user_email: userEmail,
            granted_by_email: grantedByEmail,
            team_name: permission.team_management?.team_name
          };
        })
      );

      setPermissions(permissionsWithEmails);
    } catch (error: any) {
      console.error('Error fetching permissions:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserEmail = async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      return data?.user?.email || 'Unknown';
    } catch {
      return 'Unknown';
    }
  };

  const grantPermission = async () => {
    try {
      setError('');

      if (!user) return;

      // TODO: Look up user ID by email
      const userId = grantData.user_email; // This would need proper user lookup

      const { error } = await supabase
        .from('user_permissions')
        .insert([{
          user_id: userId,
          team_id: grantData.team_id || null,
          permission_type: grantData.permission_type,
          permission_level: grantData.permission_level,
          resource_id: grantData.resource_id || null,
          granted_by: user.id,
          expires_at: grantData.expires_at || null,
          is_active: true,
          permission_metadata: {}
        }]);

      if (error) throw error;

      // Send notification to user
      await supabase.functions.invoke('send-notifications', {
        body: {
          recipients: [userId],
          notificationType: 'permission_granted',
          title: 'Permission Granted',
          message: `You have been granted ${grantData.permission_type} permission with ${grantData.permission_level} level access.`,
          priority: 'medium',
          teamId: grantData.team_id || null,
          actionUrl: '/collaboration/permissions'
        }
      });

      setIsGrantModalOpen(false);
      setGrantData({
        user_email: '',
        team_id: '',
        permission_type: '',
        permission_level: '',
        expires_at: '',
        resource_id: ''
      });
      fetchPermissions();
    } catch (error: any) {
      console.error('Error granting permission:', error);
      setError(error.message);
    }
  };

  const updatePermission = async () => {
    try {
      setError('');

      if (!selectedPermission) return;

      const { error } = await supabase
        .from('user_permissions')
        .update({
          permission_level: editData.permission_level,
          expires_at: editData.expires_at || null,
          is_active: editData.is_active
        })
        .eq('id', selectedPermission.id);

      if (error) throw error;

      setIsEditModalOpen(false);
      setSelectedPermission(null);
      fetchPermissions();
    } catch (error: any) {
      console.error('Error updating permission:', error);
      setError(error.message);
    }
  };

  const revokePermission = async (permissionId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to revoke this permission?');
      if (!confirmed) return;

      const { error } = await supabase
        .from('user_permissions')
        .update({ is_active: false })
        .eq('id', permissionId);

      if (error) throw error;

      fetchPermissions();
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      setError(error.message);
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setEditData({
      permission_level: permission.permission_level,
      expires_at: permission.expires_at ? permission.expires_at.split('T')[0] : '',
      is_active: permission.is_active
    });
    setIsEditModalOpen(true);
  };

  const getPermissionTypeInfo = (type: string) => {
    return PERMISSION_TYPES.find(pt => pt.id === type) || { name: type, description: '' };
  };

  const getPermissionLevelInfo = (level: string) => {
    return PERMISSION_LEVELS.find(pl => pl.id === level) || { name: level, description: '' };
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level) {
      case 'owner':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'write':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'read':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (permission: Permission) => {
    if (!permission.is_active) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    }
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) {
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getStatusText = (permission: Permission) => {
    if (!permission.is_active) return 'Revoked';
    if (permission.expires_at && new Date(permission.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.permission_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         permission.team_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || permission.permission_type === typeFilter;
    const matchesLevel = levelFilter === 'all' || permission.permission_level === levelFilter;
    const matchesTeam = teamFilter === 'all' || permission.team_id === teamFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'active') {
      matchesStatus = permission.is_active && (!permission.expires_at || new Date(permission.expires_at) >= new Date());
    } else if (statusFilter === 'expired') {
      matchesStatus = permission.expires_at && new Date(permission.expires_at) < new Date();
    } else if (statusFilter === 'revoked') {
      matchesStatus = !permission.is_active;
    }

    return matchesSearch && matchesType && matchesLevel && matchesTeam && matchesStatus;
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search permissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {PERMISSION_TYPES.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Levels</option>
            {PERMISSION_LEVELS.map(level => (
              <option key={level.id} value={level.id}>{level.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        <button
          onClick={() => setIsGrantModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Grant Permission
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Permissions List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Team/Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Granted By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredPermissions.map((permission) => {
                const typeInfo = getPermissionTypeInfo(permission.permission_type);
                const levelInfo = getPermissionLevelInfo(permission.permission_level);
                
                return (
                  <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-xs">
                            {permission.user_email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.user_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{typeInfo.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{typeInfo.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadgeColor(permission.permission_level)}`}>
                        {levelInfo.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {permission.team_name || 'Global'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeColor(permission)}`}>
                        {getStatusText(permission)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {permission.expires_at 
                        ? new Date(permission.expires_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {permission.granted_by_email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(permission)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => revokePermission(permission.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPermissions.length === 0 && (
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No permissions found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || typeFilter !== 'all' || levelFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No permissions have been granted yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Grant Permission Modal */}
      {isGrantModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Grant Permission</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User Email
                  </label>
                  <input
                    type="email"
                    value={grantData.user_email}
                    onChange={(e) => setGrantData({ ...grantData, user_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter user email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team (Optional)
                  </label>
                  <select
                    value={grantData.team_id}
                    onChange={(e) => setGrantData({ ...grantData, team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Global Permission</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permission Type
                  </label>
                  <select
                    value={grantData.permission_type}
                    onChange={(e) => setGrantData({ ...grantData, permission_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select permission type</option>
                    {PERMISSION_TYPES.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permission Level
                  </label>
                  <select
                    value={grantData.permission_level}
                    onChange={(e) => setGrantData({ ...grantData, permission_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select permission level</option>
                    {PERMISSION_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expires On (Optional)
                  </label>
                  <input
                    type="date"
                    value={grantData.expires_at}
                    onChange={(e) => setGrantData({ ...grantData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={grantPermission}
                  disabled={!grantData.user_email || !grantData.permission_type || !grantData.permission_level}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Grant Permission
                </button>
                <button
                  onClick={() => setIsGrantModalOpen(false)}
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

      {/* Edit Permission Modal */}
      {isEditModalOpen && selectedPermission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Edit Permission</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xs">
                        {selectedPermission.user_email?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-gray-900 dark:text-white">{selectedPermission.user_email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permission Level
                  </label>
                  <select
                    value={editData.permission_level}
                    onChange={(e) => setEditData({ ...editData, permission_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PERMISSION_LEVELS.map(level => (
                      <option key={level.id} value={level.id}>
                        {level.name} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expires On
                  </label>
                  <input
                    type="date"
                    value={editData.expires_at}
                    onChange={(e) => setEditData({ ...editData, expires_at: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editData.is_active}
                      onChange={(e) => setEditData({ ...editData, is_active: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={updatePermission}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Check className="h-4 w-4" />
                  Update Permission
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