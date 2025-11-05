import { useState, useEffect } from 'react';
import { 
  Check, Instagram, Users, Link, AlertCircle, 
  Plus, Search, Shield, Clock, ArrowRight, ArrowLeft,
  UserCheck, ExternalLink, CheckCircle, RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface InstagramAccount {
  id: string;
  username: string;
  profilePic?: string;
  isConnected: boolean;
  isVerified?: boolean;
  followers?: number;
  posts?: number;
  lastSync?: string;
}

interface AccountSetupProps {
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  onAccountConnect: (account: InstagramAccount) => void;
}

export default function AccountSetup({ 
  onNext, 
  onPrevious, 
  onSkip, 
  currentStep, 
  totalSteps,
  onAccountConnect 
}: AccountSetupProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [usernameToAdd, setUsernameToAdd] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [showConnectionHelp, setShowConnectionHelp] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    loadConnectedAccounts();
  }, []);

  const loadConnectedAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const formattedAccounts: InstagramAccount[] = data?.map(account => ({
        id: account.id,
        username: account.username,
        profilePic: account.profile_pic_url,
        isConnected: true,
        isVerified: account.is_verified,
        followers: account.followers_count,
        posts: account.posts_count,
        lastSync: account.last_synced_at
      })) || [];

      setAccounts(formattedAccounts);
      setConnectedAccounts(formattedAccounts.map(acc => acc.username));
    } catch (error: any) {
      console.error('Error loading accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchInstagramAccount = async () => {
    if (!usernameToAdd.trim()) {
      setSearchError('Please enter a username');
      return;
    }

    if (connectedAccounts.includes(usernameToAdd.trim())) {
      setSearchError('This account is already connected');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);

      const { data, error } = await supabase.functions.invoke('fetch-instagram-profile', {
        body: { username: usernameToAdd.trim() }
      });

      if (error) throw error;

      if (data?.data?.profile) {
        const profile = data.data.profile;
        const newAccount: InstagramAccount = {
          id: `temp_${Date.now()}`,
          username: profile.username,
          profilePic: profile.profile_pic_url,
          isConnected: false,
          isVerified: profile.is_verified,
          followers: profile.followers_count,
          posts: profile.posts_count
        };

        setAccounts(prev => [...prev, newAccount]);
        setUsernameToAdd('');
      } else {
        setSearchError('Account not found. Please check the username and try again.');
      }
    } catch (error: any) {
      console.error('Error searching account:', error);
      setSearchError(error.message || 'Failed to find account');
    } finally {
      setSearchLoading(false);
    }
  };

  const connectAccount = async (account: InstagramAccount) => {
    if (!user) return;

    try {
      setLoading(true);

      const { data, error } = await supabase.functions.invoke('manage-profile', {
        body: {
          action: 'connect_account',
          account: {
            username: account.username,
            profile_pic_url: account.profilePic,
            is_verified: account.isVerified,
            followers_count: account.followers,
            posts_count: account.posts
          }
        }
      });

      if (error) throw error;

      const updatedAccount = { ...account, isConnected: true };
      setAccounts(prev => prev.map(acc => acc.id === account.id ? updatedAccount : acc));
      setConnectedAccounts(prev => [...prev, account.username]);
      onAccountConnect(updatedAccount);

    } catch (error: any) {
      console.error('Error connecting account:', error);
      setSearchError('Failed to connect account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const removeAccount = async (accountId: string) => {
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('instagram_accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', user.id);

      if (error) throw error;

      setAccounts(prev => prev.filter(acc => acc.id !== accountId));
      const account = accounts.find(acc => acc.id === accountId);
      if (account) {
        setConnectedAccounts(prev => prev.filter(username => username !== account.username));
      }
    } catch (error: any) {
      console.error('Error removing account:', error);
    } finally {
      setLoading(false);
    }
  };

  const canProceed = connectedAccounts.length > 0;

  const connectionSteps = [
    {
      number: 1,
      title: 'Search Username',
      description: 'Enter the Instagram username (without @)',
      detail: 'We\'ll validate the account exists and is public'
    },
    {
      number: 2,
      title: 'Verify Account',
      description: 'Review account details and permissions',
      detail: 'Ensure this is your account or you have permission to analyze it'
    },
    {
      number: 3,
      title: 'Connect & Start',
      description: 'Link the account to GrowthHub',
      detail: 'Begin tracking analytics and insights immediately'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-600">Account Setup</span>
          <span className="text-sm text-gray-500">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full mb-4">
          <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Connect Your Instagram Accounts
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
          Link your Instagram accounts to start tracking analytics and insights
        </p>
        <button
          onClick={() => setShowConnectionHelp(!showConnectionHelp)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto"
        >
          <Shield className="w-4 h-4" />
          How does account connection work?
        </button>
      </div>

      {/* Connection Help */}
      {showConnectionHelp && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-700">
          <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Connection Process
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {connectionSteps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">{step.number}</span>
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-1">{step.title}</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mb-1">{step.description}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Account Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Plus className="w-6 h-6" />
          Add Instagram Account
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={usernameToAdd}
                  onChange={(e) => setUsernameToAdd(e.target.value)}
                  placeholder="Enter username (without @)"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  disabled={searchLoading || loading}
                  onKeyPress={(e) => e.key === 'Enter' && searchInstagramAccount()}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Instagram className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {searchError && (
                <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {searchError}
                </p>
              )}
            </div>
            <div className="flex items-end">
              <button
                onClick={searchInstagramAccount}
                disabled={searchLoading || loading || !usernameToAdd.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {searchLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Search
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connected Accounts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6" />
            Connected Accounts ({connectedAccounts.length})
          </h3>
          <button
            onClick={loadConnectedAccounts}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Instagram className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No accounts connected</h4>
            <p className="text-gray-500 dark:text-gray-400">Add your first Instagram account to get started with analytics</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div
                key={account.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  account.isConnected
                    ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {account.profilePic ? (
                      <img src={account.profilePic} alt={account.username} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <Instagram className="w-6 h-6 text-white" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">@{account.username}</h4>
                      {account.isVerified && (
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        account.isConnected
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                      }`}>
                        {account.isConnected ? 'Connected' : 'Available'}
                      </span>
                    </div>
                    
                    {account.followers !== undefined && (
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2">
                        <span>{account.followers?.toLocaleString()} followers</span>
                        <span>{account.posts?.toLocaleString()} posts</span>
                      </div>
                    )}
                    
                    {account.lastSync && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 mb-3">
                        <Clock className="w-3 h-3" />
                        Last sync: {new Date(account.lastSync).toLocaleDateString()}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      {!account.isConnected ? (
                        <button
                          onClick={() => connectAccount(account)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          Connect
                        </button>
                      ) : (
                        <button
                          onClick={() => window.open(`https://instagram.com/${account.username}`, '_blank')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          View Profile
                        </button>
                      )}
                      
                      {account.isConnected && (
                        <button
                          onClick={() => removeAccount(account.id)}
                          disabled={loading}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benefits of Connecting */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 mb-6 border border-purple-200 dark:border-purple-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Benefits of connecting your accounts:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Real-time Analytics</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Track followers, engagement, and growth metrics</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">AI Insights</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Get personalized recommendations and predictions</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Content Optimization</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Discover the best times to post and content types</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white text-sm">Competitor Analysis</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Compare your performance with industry benchmarks</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="text-center">
          {canProceed ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Check className="w-5 h-5" />
              <span className="font-medium">Ready to continue!</span>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connect at least one account to continue
            </p>
          )}
        </div>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}