import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Instagram, RefreshCw, Search, Clock, TrendingUp, Users, Image, Hash, Camera } from 'lucide-react';
import { useUsageTracking } from '@/hooks/useUsageTracking';
import { useUsageLimit } from '@/hooks/useUsageLimit';
import UpgradePrompt from './UpgradePrompt';
import BillingAlerts from './BillingAlerts';
import FeatureGate from './FeatureGate';

interface ProfilePictureProps {
  src: string;
  username: string;
  fallbackGradient: string;
}

// Enhanced Profile Picture Component with better error handling
function ProfilePicture({ src, username, fallbackGradient }: ProfilePictureProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setImageStatus('loading');
    setImageSrc(src);
    setRetryCount(0);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set timeout for image loading
    timeoutRef.current = setTimeout(() => {
      if (imageStatus === 'loading') {
        setImageStatus('error');
      }
    }, 5000); // 5 second timeout
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [src]);

  const handleImageLoad = () => {
    setImageStatus('loaded');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleImageError = () => {
    console.log(`Failed to load profile picture for @${username}`);
    setImageStatus('error');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleRetry = () => {
    if (retryCount < 2) { // Allow up to 2 retries
      setRetryCount(prev => prev + 1);
      setImageStatus('loading');
      
      // Add cache-busting parameter to force refresh
      const cacheBuster = `?v=${Date.now()}&retry=${retryCount}`;
      setImageSrc(`${src}${cacheBuster}`);
    }
  };

  if (imageStatus === 'loading') {
    return (
      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${fallbackGradient} flex items-center justify-center animate-pulse`}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <Instagram className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  if (imageStatus === 'error' || retryCount >= 2) {
    return (
      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${fallbackGradient} flex items-center justify-center relative group`}>
        <Instagram className="h-6 w-6 text-white" />
        {retryCount < 2 && (
          <button
            onClick={handleRetry}
            className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Retry loading @${username}'s profile picture`}
          >
            <RefreshCw className="h-4 w-4 text-white" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-12 h-12">
      <img
        src={imageSrc}
        alt={`${username} profile picture`}
        className="w-12 h-12 rounded-full object-cover"
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
      />
      {/* Loading overlay during transitions */}
      {imageStatus === 'loading' && (
        <div className="absolute inset-0 bg-gray-200/50 rounded-full animate-pulse"></div>
      )}
    </div>
  );
}

interface AccountManagementProps {
  selectedAccount: string | null;
  onSelectAccount: (accountId: string | null) => void;
}

export default function AccountManagement({ selectedAccount, onSelectAccount }: AccountManagementProps) {
  const { user } = useAuth();
  const { incrementUsage } = useUsageTracking('accounts');
  const { isAtLimit, shouldShowUpgradePrompt } = useUsageLimit();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [newAccountUsername, setNewAccountUsername] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadAccounts();
      // Auto-refresh every 30 seconds
      refreshIntervalRef.current = setInterval(() => {
        refreshAllAccounts();
      }, 30000);
    }
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [user]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  async function loadAccounts() {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setAccounts(data);
        if (data.length > 0 && !selectedAccount) {
          onSelectAccount(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
      showNotification('Failed to load accounts', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function addAccount() {
    if (!newAccountUsername.trim()) return;

    // Check usage limits before adding account
    if (isAtLimit) {
      setShowUpgradeModal(true);
      return;
    }

    setIsRefreshing(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-instagram-profile', {
        body: { username: newAccountUsername.trim() }
      });

      if (functionError) throw functionError;
      if (!functionData?.data) throw new Error('Profile not found');

      const profile = functionData.data;

      const { data: existingAccount } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user?.id)
        .eq('username', profile.username)
        .maybeSingle();

      if (existingAccount) {
        showNotification('Account already exists', 'error');
        return;
      }

      const { data: newAccount, error: insertError } = await supabase
        .from('instagram_accounts')
        .insert({
          user_id: user?.id,
          username: profile.username,
          user_instagram_id: profile.id,
          bio: profile.biography || '',
          followers_count: profile.follower_count || 0,
          following_count: profile.following_count || 0,
          posts_count: profile.media_count || 0,
          profile_picture_url: profile.hd_profile_pic_url_info?.url || profile.profile_pic_url,
          is_verified: profile.is_verified || false,
          is_active: true
        })
        .select()
        .single();

      if (insertError) throw insertError;

      if (newAccount) {
        setAccounts([newAccount, ...accounts]);
        setNewAccountUsername('');
        setShowAddForm(false);
        
        // Increment usage tracking
        await incrementUsage({ resourceType: 'accounts', increment: 1, immediate: true });
        
        showNotification(`Successfully added @${profile.username}`, 'success');
        onSelectAccount(newAccount.id);
      }
    } catch (error) {
      console.error('Error adding account:', error);
      showNotification('Failed to add account. Please check the username and try again.', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function refreshAccount(account: any) {
    setIsRefreshing(true);
    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('fetch-instagram-profile', {
        body: { username: account.username }
      });

      if (functionError) throw functionError;
      if (!functionData?.data) throw new Error('Profile not found');

      const profile = functionData.data;

      const { error: updateError } = await supabase
        .from('instagram_accounts')
        .update({
          followers_count: profile.follower_count || account.followers_count,
          following_count: profile.following_count || account.following_count,
          posts_count: profile.media_count || account.posts_count,
          profile_picture_url: profile.hd_profile_pic_url_info?.url || profile.profile_pic_url || account.profile_picture_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', account.id);

      if (updateError) throw updateError;

      await loadAccounts();
      showNotification(`Refreshed @${account.username}`, 'success');
    } catch (error) {
      console.error('Error refreshing account:', error);
      showNotification('Failed to refresh account data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  }

  async function refreshAllAccounts() {
    if (accounts.length === 0) return;
    
    setIsRefreshing(true);
    try {
      for (const account of accounts) {
        await refreshAccount(account);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error refreshing all accounts:', error);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function deleteAccount(accountId: string) {
    try {
      const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      setAccounts(accounts.filter(acc => acc.id !== accountId));
      
      if (selectedAccount === accountId) {
        onSelectAccount(accounts.length > 1 ? accounts.find(acc => acc.id !== accountId)?.id : null);
      }
      
      showNotification('Account deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting account:', error);
      showNotification('Failed to delete account', 'error');
    }
  }

  // Filter accounts based on search term
  const filteredAccounts = accounts.filter(account =>
    account.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (account.bio && account.bio.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full overflow-hidden">
      {/* Billing Alerts */}
      <BillingAlerts className="mb-6" />
      
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Instagram className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Instagram Accounts</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {accounts.length} account{accounts.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshAllAccounts()}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-all duration-200"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh All
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Add Account
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram Username
              </label>
              <input
                type="text"
                value={newAccountUsername}
                onChange={(e) => setNewAccountUsername(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addAccount()}
                placeholder="e.g., @cocacola, @nike, @instagram"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={addAccount}
                disabled={isRefreshing || !newAccountUsername.trim()}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 text-white rounded-lg transition-all duration-200 mt-6"
              >
                {isRefreshing ? 'Adding...' : 'Add'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewAccountUsername('');
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mt-6"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Last Refresh Time */}
      {lastRefresh && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock className="h-4 w-4" />
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {/* Accounts List */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-800 border-t-purple-500 rounded-full animate-spin"></div>
              <div className="mt-4 text-center">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-3 flex items-center justify-center">
                  <Instagram className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-600 dark:text-gray-400 font-medium">Loading accounts...</span>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Fetching Instagram data</p>
              </div>
            </div>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="text-center py-16">
            {/* Premium Empty State */}
            <div className="relative mx-auto max-w-md">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-blue-900/30 rounded-3xl transform -rotate-1"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
                
                {/* Animated Icon */}
                <div className="relative mx-auto w-24 h-24 mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-pulse"></div>
                  <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                    <Instagram className="w-12 h-12 text-purple-500" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {searchTerm ? 'No accounts found' : 'Ready to Track Instagram Analytics?'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  {searchTerm 
                    ? 'Try adjusting your search terms to find the accounts you\'re looking for.'
                    : 'Add Instagram accounts to start tracking analytics, engagement metrics, and performance insights.'
                  }
                </p>
                
                {!searchTerm && (
                  <div className="space-y-6">
                    {/* Premium Add Button */}
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 hover:from-purple-700 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
                    >
                      <Plus className="w-6 h-6" />
                      Add Instagram Account
                    </button>
                    
                    {/* Premium Popular Accounts */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                            Popular Accounts to Track
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['@nike', '@cocacola', '@instagram', '@nasa'].map((account) => (
                              <div 
                                key={account}
                                className="flex items-center space-x-2 px-3 py-2 bg-white/50 dark:bg-gray-800/50 rounded-lg"
                              >
                                <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">@</span>
                                </div>
                                <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
                                  {account.replace('@', '')}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          filteredAccounts.map((account, index) => (
            <div
              key={account.id}
              className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                selectedAccount === account.id
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 shadow-xl'
                  : 'border-gray-200/50 dark:border-gray-700/50 hover:border-purple-300/70 dark:hover:border-purple-600/70 bg-white dark:bg-gray-800 hover:bg-gradient-to-br hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-750'
              }`}
              onClick={() => onSelectAccount(account.id)}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: 'fadeInUp 0.5s ease-out forwards'
              }}
            >
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="relative p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <ProfilePicture 
                        src={account.profile_picture_url}
                        username={account.username}
                        fallbackGradient="from-purple-500 to-pink-500"
                      />
                      {account.is_verified && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          @{account.username}
                        </h3>
                        {account.is_verified && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                            </svg>
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm line-clamp-2">
                        {account.bio || 'No bio available - Track this account\'s performance'}
                      </p>
                    </div>
                  </div>

                  {/* Premium Metrics */}
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Followers</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(account.followers_count)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Hash className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Following</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(account.following_count)}
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-1">
                        <Camera className="w-4 h-4" />
                        <span className="text-xs font-medium uppercase tracking-wide">Posts</span>
                      </div>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(account.posts_count)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshAccount(account);
                    }}
                    disabled={isRefreshing}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-blue-500 hover:text-blue-600 disabled:opacity-50 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                    title="Refresh account"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteAccount(account.id);
                    }}
                    className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-red-500 hover:text-red-600 transition-all duration-200 rounded-lg shadow-md hover:shadow-lg"
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}