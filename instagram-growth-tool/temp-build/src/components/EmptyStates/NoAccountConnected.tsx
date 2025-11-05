import React from 'react';
import { UserPlus, Instagram, ArrowRight, Zap, TrendingUp } from 'lucide-react';

interface NoAccountConnectedProps {
  onConnectAccount?: () => void;
  className?: string;
  showFeatures?: boolean;
  compact?: boolean;
}

const NoAccountConnected: React.FC<NoAccountConnectedProps> = ({
  onConnectAccount,
  className = '',
  showFeatures = true,
  compact = false
}) => {
  const handleConnect = () => {
    if (onConnectAccount) {
      onConnectAccount();
    } else {
      // Default action - could navigate to connect page
      console.log('Navigate to account connection');
    }
  };

  const features = [
    {
      icon: TrendingUp,
      title: 'Track Growth',
      description: 'Monitor follower growth and engagement trends'
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'Get personalized recommendations for content strategy'
    }
  ];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg mx-auto mb-4">
          <Instagram className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Connect Instagram Account
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Link your Instagram account to start analyzing your growth
        </p>
        <button
          onClick={handleConnect}
          className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Connect Account
        </button>
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center mb-6">
          <Instagram className="w-10 h-10 text-purple-600 dark:text-purple-400" />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Connect your Instagram account
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Link your Instagram account to see comprehensive analytics, track growth, and get personalized insights for your content strategy.
        </p>

        {/* Features List */}
        {showFeatures && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Button */}
        <button
          onClick={handleConnect}
          className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
        >
          <UserPlus className="w-5 h-5" />
          Connect Instagram Account
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Additional Info */}
        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
          <p>Secure connection • Your data stays private • No spam or ads</p>
        </div>
      </div>
    </div>
  );
};

export default NoAccountConnected;