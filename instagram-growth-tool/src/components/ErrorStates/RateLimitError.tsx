import React from 'react';
import { Clock, Zap, TrendingUp, Crown, RefreshCw, Calendar } from 'lucide-react';

interface RateLimitErrorProps {
  onUpgrade?: () => void;
  onWait?: () => void;
  onViewPlans?: () => void;
  className?: string;
  limitType?: 'api' | 'requests' | 'data' | 'features';
  currentUsage?: number;
  limit?: number;
  resetTime?: string;
  showUpgradeOptions?: boolean;
  compact?: boolean;
}

const RateLimitError: React.FC<RateLimitErrorProps> = ({
  onUpgrade,
  onWait,
  onViewPlans,
  className = '',
  limitType = 'api',
  currentUsage = 0,
  limit = 0,
  resetTime,
  showUpgradeOptions = true,
  compact = false
}) => {
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      console.log('Navigating to upgrade...');
    }
  };

  const handleWait = () => {
    if (onWait) {
      onWait();
    } else {
      console.log('Waiting for rate limit reset...');
    }
  };

  const handleViewPlans = () => {
    if (onViewPlans) {
      onViewPlans();
    } else {
      console.log('Viewing plans...');
    }
  };

  const getLimitConfig = (type: string) => {
    switch (type) {
      case 'api':
        return {
          icon: Zap,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          title: 'API Rate Limit Reached',
          message: 'You\'ve exceeded the maximum number of API requests for your current plan.',
          color: 'yellow',
          unit: 'requests'
        };
      case 'requests':
        return {
          icon: RefreshCw,
          bgColor: 'bg-orange-50 dark:bg-orange-900/20',
          borderColor: 'border-orange-200 dark:border-orange-800',
          iconColor: 'text-orange-600 dark:text-orange-400',
          title: 'Request Limit Exceeded',
          message: 'Too many requests in a short time. Please wait before trying again.',
          color: 'orange',
          unit: 'requests'
        };
      case 'data':
        return {
          icon: TrendingUp,
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          borderColor: 'border-purple-200 dark:border-purple-800',
          iconColor: 'text-purple-600 dark:text-purple-400',
          title: 'Data Limit Reached',
          message: 'You\'ve reached your monthly data limit. Upgrade to continue analyzing.',
          color: 'purple',
          unit: 'data points'
        };
      case 'features':
        return {
          icon: Crown,
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          title: 'Feature Access Limited',
          message: 'This feature requires a higher plan. Upgrade to unlock advanced analytics.',
          color: 'blue',
          unit: 'features'
        };
      default:
        return {
          icon: Clock,
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          iconColor: 'text-gray-600 dark:text-gray-400',
          title: 'Limit Reached',
          message: 'You\'ve reached the limit for this action.',
          color: 'gray',
          unit: 'items'
        };
    }
  };

  const config = getLimitConfig(limitType);
  const Icon = config.icon;

  const usagePercentage = limit > 0 ? (currentUsage / limit) * 100 : 100;
  const isNearLimit = usagePercentage >= 90;
  const isOverLimit = usagePercentage >= 100;

  const planFeatures = {
    free: ['Basic analytics', 'Up to 5 accounts', 'Standard support'],
    pro: ['Advanced analytics', 'Unlimited accounts', 'Priority support', 'Export data'],
    enterprise: ['All features', 'Custom integrations', 'Dedicated support', 'White-label options']
  };

  if (compact) {
    return (
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${config.iconColor} mt-0.5 flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              {config.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
              {currentUsage}/{limit} {config.unit} used
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpgrade}
                className={`px-3 py-1 bg-${config.color}-600 hover:bg-${config.color}-700 text-white rounded text-xs font-medium transition-colors`}
              >
                Upgrade
              </button>
              <button
                onClick={handleWait}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Wait
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className={`mx-auto w-20 h-20 ${config.bgColor} ${config.borderColor} border rounded-2xl flex items-center justify-center mb-6`}>
          <Icon className={`w-10 h-10 ${config.iconColor}`} />
        </div>

        {/* Title and Message */}
        <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {config.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
          {config.message}
        </p>

        {/* Usage Meter */}
        <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Current Usage
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {currentUsage.toLocaleString()} / {limit.toLocaleString()} {config.unit}
            </span>
          </div>
          <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-300 ${
                isOverLimit 
                  ? 'bg-red-500' 
                  : isNearLimit 
                    ? 'bg-yellow-500' 
                    : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          {resetTime && (
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              Resets {resetTime}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button
            onClick={handleUpgrade}
            className={`inline-flex items-center gap-2 px-6 py-3 bg-${config.color}-600 text-white rounded-lg font-medium hover:bg-${config.color}-700 transition-colors`}
          >
            <Crown className="w-4 h-4" />
            Upgrade Now
          </button>
          
          <button
            onClick={handleWait}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Wait & Retry
          </button>

          <button
            onClick={handleViewPlans}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            View Plans
          </button>
        </div>

        {/* Upgrade Benefits */}
        {showUpgradeOptions && (
          <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Upgrade Benefits:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Higher Limits</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Up to 10x more requests</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Crown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Premium Features</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Advanced analytics & insights</p>
              </div>
              
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Priority Support</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400">Faster response times</p>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>
            💡 Upgrade to unlock higher limits and premium features for your growing account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RateLimitError;