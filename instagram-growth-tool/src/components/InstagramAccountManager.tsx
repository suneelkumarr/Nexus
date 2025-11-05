// Instagram Account Manager Component
// Displays connected Instagram accounts and manages connections

import { useState, useEffect } from 'react';
import { useInstagramGraphAPI, InstagramAccount } from '@/hooks/useInstagramGraphAPI';
import ConnectInstagram from './ConnectInstagram';
import {
  Instagram,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
  ExternalLink,
  AlertTriangle,
  Loader
} from 'lucide-react';
import { format } from 'date-fns';

export default function InstagramAccountManager() {
  const {
    getConnectedAccounts,
    refreshToken,
    disconnectAccount,
    loading,
    error
  } = useInstagramGraphAPI();

  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [refreshingAccount, setRefreshingAccount] = useState<string | null>(null);
  const [deletingAccount, setDeletingAccount] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await getConnectedAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
    }
  };

  const handleRefreshToken = async (instagramUserId: string) => {
    setRefreshingAccount(instagramUserId);
    try {
      await refreshToken(instagramUserId);
      await loadAccounts();
      alert('Token refreshed successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to refresh token');
    } finally {
      setRefreshingAccount(null);
    }
  };

  const handleDisconnect = async (instagramUserId: string, username: string) => {
    if (!confirm(`Are you sure you want to disconnect @${username}?`)) {
      return;
    }

    setDeletingAccount(instagramUserId);
    try {
      await disconnectAccount(instagramUserId);
      await loadAccounts();
    } catch (err: any) {
      alert(err.message || 'Failed to disconnect account');
    } finally {
      setDeletingAccount(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Instagram Accounts</h2>
        <p className="text-gray-600 mt-1">
          Manage your connected Instagram Business and Creator accounts
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Connected Accounts */}
      {accounts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Connected Accounts ({accounts.length})</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
              >
                {/* Account Header */}
                <div className="flex items-start gap-3">
                  {account.profile_picture_url && (
                    <img
                      src={account.profile_picture_url}
                      alt={account.username}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900 truncate">
                        @{account.username}
                      </h4>
                      {account.is_verified && (
                        <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{account.name}</p>
                    <p className="text-xs text-gray-500">
                      {account.account_type} Account
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center py-2 border-t border-b border-gray-200">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {account.followers_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-600">Followers</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {account.follows_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-600">Following</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {account.media_count?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-600">Posts</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex items-center gap-2 text-sm">
                  {account.sync_status === 'active' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-green-700">Active</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">Needs Attention</span>
                    </>
                  )}
                  {account.last_synced_at && (
                    <span className="text-gray-500 text-xs ml-auto">
                      Last synced: {format(new Date(account.last_synced_at), 'MMM d, h:mm a')}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`https://instagram.com/${account.username}`, '_blank')}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">View Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleRefreshToken(account.instagram_user_id)}
                    disabled={refreshingAccount === account.instagram_user_id}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                    title="Refresh Access Token"
                  >
                    {refreshingAccount === account.instagram_user_id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDisconnect(account.instagram_user_id, account.username)}
                    disabled={deletingAccount === account.instagram_user_id}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    title="Disconnect Account"
                  >
                    {deletingAccount === account.instagram_user_id ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Biography */}
                {account.biography && (
                  <p className="text-xs text-gray-600 line-clamp-2">{account.biography}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State or Connect Button */}
      {accounts.length === 0 && !loading && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-8 text-center space-y-4">
          <Instagram className="w-16 h-16 text-purple-600 mx-auto" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">No Instagram Accounts Connected</h3>
            <p className="text-gray-600 mt-1">
              Connect your Instagram Business or Creator account to start analyzing your performance
            </p>
          </div>
          <ConnectInstagram onSuccess={loadAccounts} className="flex justify-center" />
        </div>
      )}

      {/* Add Another Account */}
      {accounts.length > 0 && (
        <div className="border-t border-gray-200 pt-6">
          <h3 className="font-semibold text-gray-900 mb-3">Add Another Account</h3>
          <ConnectInstagram onSuccess={loadAccounts} />
        </div>
      )}

      {/* Loading State */}
      {loading && accounts.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}
    </div>
  );
}
