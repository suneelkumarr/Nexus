import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Share2, Plus, Settings, Trash2, RefreshCw, CheckCircle, AlertTriangle, Instagram, Twitter, Facebook, Youtube, Linkedin, Clock, Search, Filter } from 'lucide-react';

interface SocialPlatform {
  id: string;
  user_id: string;
  team_id: string | null;
  platform_name: string;
  platform_username: string;
  account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  connected_at: string;
  last_sync: string | null;
  sync_status: string;
  platform_data: any;
  is_active: boolean;
  team_name?: string;
}

interface Team {
  id: string;
  team_name: string;
}

interface SocialPlatformsProps {
  selectedAccount: string | null;
}

const SUPPORTED_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'from-pink-500 to-purple-600',
    description: 'Connect your Instagram Business account'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'from-blue-600 to-blue-700',
    description: 'Connect your Facebook Page'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'from-gray-800 to-gray-900',
    description: 'Connect your Twitter/X account'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'from-red-500 to-red-600',
    description: 'Connect your YouTube channel'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'from-blue-700 to-blue-800',
    description: 'Connect your LinkedIn profile'
  }
];

const SYNC_STATUS_COLORS = {
  'connected': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  'syncing': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'error': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  'disconnected': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'expired': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
};

export default function SocialPlatforms({ selectedAccount }: SocialPlatformsProps) {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [selectedPlatformType, setSelectedPlatformType] = useState('');
  const [syncing, setSyncing] = useState<string[]>([]);

  // Form state for connecting platforms
  const [connectData, setConnectData] = useState({
    platform_name: '',
    platform_username: '',
    team_id: ''
  });

  useEffect(() => {
    fetchTeams();
    fetchPlatforms();
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

  const fetchPlatforms = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('social_platforms')
        .select(`
          *,
          team_management(team_name)
        `)
        .eq('user_id', user.id)
        .order('connected_at', { ascending: false });

      if (error) throw error;

      const platformsWithTeamNames = (data || []).map(platform => ({
        ...platform,
        team_name: platform.team_management?.team_name
      }));

      setPlatforms(platformsWithTeamNames);
    } catch (error: any) {
      console.error('Error fetching platforms:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const connectPlatform = async () => {
    try {
      setError('');

      if (!user || !connectData.platform_name || !connectData.platform_username) return;

      // Check if platform already exists
      const existingPlatform = platforms.find(
        p => p.platform_name === connectData.platform_name && 
             p.platform_username === connectData.platform_username
      );

      if (existingPlatform) {
        throw new Error('This platform account is already connected');
      }

      // In a real implementation, this would initiate OAuth flow
      // For demo purposes, we'll simulate a successful connection
      const { error } = await supabase
        .from('social_platforms')
        .insert([{
          user_id: user.id,
          team_id: connectData.team_id || null,
          platform_name: connectData.platform_name,
          platform_username: connectData.platform_username,
          account_id: `${connectData.platform_name}_${connectData.platform_username}`,
          sync_status: 'connected',
          platform_data: {
            connected_via: 'manual',
            initial_sync_pending: true
          },
          is_active: true
        }]);

      if (error) throw error;

      // Send notification about successful connection
      await supabase.functions.invoke('send-notifications', {
        body: {
          recipients: [user.id],
          notificationType: 'account_connected',
          title: 'Platform Connected',
          message: `Successfully connected ${connectData.platform_name} account @${connectData.platform_username}`,
          priority: 'medium',
          teamId: connectData.team_id || null,
          actionUrl: '/collaboration/platforms'
        }
      });

      setIsConnectModalOpen(false);
      setConnectData({
        platform_name: '',
        platform_username: '',
        team_id: ''
      });
      fetchPlatforms();
    } catch (error: any) {
      console.error('Error connecting platform:', error);
      setError(error.message);
    }
  };

  const disconnectPlatform = async (platformId: string) => {
    try {
      setError('');

      const confirmed = window.confirm('Are you sure you want to disconnect this platform? This will stop data syncing.');
      if (!confirmed) return;

      const { error } = await supabase
        .from('social_platforms')
        .update({
          is_active: false,
          sync_status: 'disconnected'
        })
        .eq('id', platformId);

      if (error) throw error;

      fetchPlatforms();
    } catch (error: any) {
      console.error('Error disconnecting platform:', error);
      setError(error.message);
    }
  };

  const syncPlatform = async (platformId: string) => {
    try {
      setError('');
      setSyncing(prev => [...prev, platformId]);

      // Update sync status to syncing
      await supabase
        .from('social_platforms')
        .update({
          sync_status: 'syncing',
          last_sync: new Date().toISOString()
        })
        .eq('id', platformId);

      // Simulate sync process (in real implementation, this would call platform APIs)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update sync status to connected
      await supabase
        .from('social_platforms')
        .update({
          sync_status: 'connected',
          platform_data: {
            last_sync_result: 'success',
            posts_synced: Math.floor(Math.random() * 50) + 10,
            followers_synced: Math.floor(Math.random() * 1000) + 100
          }
        })
        .eq('id', platformId);

      fetchPlatforms();
    } catch (error: any) {
      console.error('Error syncing platform:', error);
      setError(error.message);

      // Update sync status to error
      await supabase
        .from('social_platforms')
        .update({
          sync_status: 'error'
        })
        .eq('id', platformId);
    } finally {
      setSyncing(prev => prev.filter(id => id !== platformId));
    }
  };

  const openConnectModal = (platformType: string) => {
    setSelectedPlatformType(platformType);
    setConnectData({
      ...connectData,
      platform_name: platformType
    });
    setIsConnectModalOpen(true);
  };

  const getPlatformIcon = (platformName: string) => {
    const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformName);
    return platform?.icon || Share2;
  };

  const getPlatformColor = (platformName: string) => {
    const platform = SUPPORTED_PLATFORMS.find(p => p.id === platformName);
    return platform?.color || 'from-gray-500 to-gray-600';
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return CheckCircle;
      case 'syncing':
        return RefreshCw;
      case 'error':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const getSyncStatusColor = (status: string) => {
    return SYNC_STATUS_COLORS[status as keyof typeof SYNC_STATUS_COLORS] || SYNC_STATUS_COLORS.disconnected;
  };

  const filteredPlatforms = platforms.filter(platform => {
    const matchesSearch = platform.platform_username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         platform.platform_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = platformFilter === 'all' || platform.platform_name === platformFilter;
    const matchesStatus = statusFilter === 'all' || platform.sync_status === statusFilter;
    const matchesTeam = teamFilter === 'all' || platform.team_id === teamFilter;
    
    return matchesSearch && matchesPlatform && matchesStatus && matchesTeam;
  });

  const connectedPlatformNames = platforms.map(p => p.platform_name);
  const availablePlatforms = SUPPORTED_PLATFORMS.filter(p => !connectedPlatformNames.includes(p.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Platforms to Connect */}
      {availablePlatforms.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Connect New Platform</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availablePlatforms.map((platform) => {
              const Icon = platform.icon;
              
              return (
                <button
                  key={platform.id}
                  onClick={() => openConnectModal(platform.id)}
                  className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${platform.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {platform.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Header Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search platforms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Platforms</option>
            {SUPPORTED_PLATFORMS.map(platform => (
              <option key={platform.id} value={platform.id}>{platform.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="syncing">Syncing</option>
            <option value="error">Error</option>
            <option value="disconnected">Disconnected</option>
          </select>

          <select
            value={teamFilter}
            onChange={(e) => setTeamFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Teams</option>
            <option value="">Personal</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.team_name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setIsConnectModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Connect Platform
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Connected Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlatforms.map((platform) => {
          const PlatformIcon = getPlatformIcon(platform.platform_name);
          const StatusIcon = getSyncStatusIcon(platform.sync_status);
          const isSyncing = syncing.includes(platform.id);
          
          return (
            <div key={platform.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${getPlatformColor(platform.platform_name)}`}>
                      <PlatformIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        @{platform.platform_username}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {platform.platform_name}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSyncStatusColor(platform.sync_status)}`}>
                      <div className="flex items-center gap-1">
                        <StatusIcon className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        {platform.sync_status}
                      </div>
                    </span>
                  </div>
                </div>

                {/* Sync Info */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Last Sync</p>
                      <p className="text-gray-900 dark:text-white">
                        {platform.last_sync 
                          ? new Date(platform.last_sync).toLocaleDateString()
                          : 'Never'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Team</p>
                      <p className="text-gray-900 dark:text-white">
                        {platform.team_name || 'Personal'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Platform Data */}
                {platform.platform_data && Object.keys(platform.platform_data).length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sync Results</h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {platform.platform_data.posts_synced && (
                        <p>Posts: {platform.platform_data.posts_synced}</p>
                      )}
                      {platform.platform_data.followers_synced && (
                        <p>Followers: {platform.platform_data.followers_synced}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => syncPlatform(platform.id)}
                    disabled={isSyncing || platform.sync_status === 'syncing'}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                  </button>
                  
                  <button
                    onClick={() => disconnectPlatform(platform.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlatforms.length === 0 && platforms.length > 0 && (
        <div className="text-center py-12">
          <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No platforms found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}

      {platforms.length === 0 && (
        <div className="text-center py-12">
          <Share2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No platforms connected</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Connect your social media platforms to sync data and analytics
          </p>
          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Connect Your First Platform
          </button>
        </div>
      )}

      {/* Connect Platform Modal */}
      {isConnectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Connect Social Platform</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform
                  </label>
                  <select
                    value={connectData.platform_name}
                    onChange={(e) => setConnectData({ ...connectData, platform_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select platform</option>
                    {availablePlatforms.map(platform => (
                      <option key={platform.id} value={platform.id}>{platform.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Username/Handle
                  </label>
                  <input
                    type="text"
                    value={connectData.platform_username}
                    onChange={(e) => setConnectData({ ...connectData, platform_username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Team (Optional)
                  </label>
                  <select
                    value={connectData.team_id}
                    onChange={(e) => setConnectData({ ...connectData, team_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Personal account</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.team_name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={connectPlatform}
                  disabled={!connectData.platform_name || !connectData.platform_username}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Connect Platform
                </button>
                <button
                  onClick={() => setIsConnectModalOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
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