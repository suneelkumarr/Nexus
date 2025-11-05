import React from 'react';
import { Unplug, Instagram, RefreshCw, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface AccountDisconnectedProps {
  onReconnect?: () => void;
  onCheckPermissions?: () => void;
  className?: string;
  reason?: string;
  lastConnected?: string;
  showSecurityInfo?: boolean;
  compact?: boolean;
}

const AccountDisconnected: React.FC<AccountDisconnectedProps> = ({
  onReconnect,
  onCheckPermissions,
  className = '',
  reason = 'connection_lost',
  lastConnected,
  showSecurityInfo = true,
  compact = false
}) => {
  const handleReconnect = () => {
    if (onReconnect) {
      onReconnect();
    } else {
      console.log('Navigate to reconnection');
    }
  };

  const handleCheckPermissions = () => {
    if (onCheckPermissions) {
      onCheckPermissions();
    } else {
      console.log('Check permissions');
    }
  };

  const getReasonMessage = (reason: string) => {
    switch (reason) {
      case 'permission_revoked':
        return {
          title: 'Permission Revoked',
          message: 'Instagram has removed access to your account. This usually happens when you change your password or update privacy settings.',
          icon: Shield,
          color: 'text-yellow-600'
        };
      case 'connection_lost':
        return {
          title: 'Connection Lost',
          message: 'The connection to your Instagram account was lost. This might be due to a temporary network issue or Instagram\'s security measures.',
          icon: Unplug,
          color: 'text-orange-600'
        };
      case 'account_suspended':
        return {
          title: 'Account Suspended',
          message: 'Your Instagram account appears to be suspended or restricted. Please check your Instagram account status.',
          icon: AlertCircle,
          color: 'text-red-600'
        };
      case 'token_expired':
        return {
          title: 'Session Expired',
          message: 'Your Instagram session has expired for security reasons. Please reconnect to continue using the analytics.',
          icon: RefreshCw,
          color: 'text-blue-600'
        };
      default:
        return {
          title: 'Account Disconnected',
          message: 'Your Instagram account has been disconnected. Please reconnect to continue viewing your analytics.',
          icon: Unplug,
          color: 'text-gray-600'
        };
    }
  };

  const reasonInfo = getReasonMessage(reason);
  const Icon = reasonInfo.icon;

  const securityTips = [
    'Your data remains secure and private',
    'We only access the information you authorize',
    'You can disconnect at any time',
    'No posts or DMs are ever accessed'
  ];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-4">
          <Icon className={`w-6 h-6 ${reasonInfo.color}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {reasonInfo.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {reasonInfo.message}
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleReconnect}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center gap-1"
          >
            <Instagram className="w-3 h-3" />
            Reconnect
          </button>
          <button
            onClick={handleCheckPermissions}
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Check Status
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl flex items-center justify-center mb-6">
          <Icon className={`w-10 h-10 ${reasonInfo.color}`} />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {reasonInfo.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          {reasonInfo.message}
        </p>

        {/* Last Connected Info */}
        {lastConnected && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Last connected: {lastConnected}
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleReconnect}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Instagram className="w-4 h-4" />
            Reconnect Account
          </button>
          
          <button
            onClick={handleCheckPermissions}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Check Status
          </button>
        </div>

        {/* Security Information */}
        {showSecurityInfo && (
          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              Your Security & Privacy
            </h3>
            <ul className="space-y-2">
              {securityTips.map((tip, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0"></div>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Troubleshooting Tips */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <p>
            💡 Tip: If reconnection fails, try logging out and back into Instagram on your device first.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountDisconnected;