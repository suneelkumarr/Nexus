import { BarChart3, AlertTriangle, TrendingUp, Crown, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { formatNumber, formatPercentage, formatDateRange } from '@/utils/dataFormatting';

interface UsageLimitsProps {
  showFullDetails?: boolean;
  className?: string;
}

export default function UsageLimits({ showFullDetails = false, className = '' }: UsageLimitsProps) {
  const { currentPlan, usage, getUsagePercentage, getRemainingUsage, loading, error, retry } = useSubscription();

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlan && !loading) {
    return (
      <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center ${className}`}>
        <BarChart3 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">No plan data available</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Using default free plan limits</p>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage('accounts');
  const remaining = getRemainingUsage('accounts');
  const isNearLimit = usagePercentage >= 70;
  const isAtLimit = usagePercentage >= 90;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {showFullDetails ? 'Usage Overview' : 'Account Usage'}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {error && (
            <button
              onClick={retry}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Retry loading data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          {currentPlan.plan_type !== 'free' && (
            <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
              <Crown className="w-3 h-3" />
              <span className="font-medium">{currentPlan.plan_name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Failed to load usage data
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-300 mt-1">
            {error}
          </p>
        </div>
      )}

      {/* Usage Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {usage.length > 0 ? usage[0].usage_count : 0} of {currentPlan.monthly_limit} accounts
          </span>
          <span className={`text-sm font-medium ${
            isAtLimit 
              ? 'text-red-600' 
              : isNearLimit 
              ? 'text-yellow-600' 
              : 'text-green-600'
          }`}>
            {Math.round(usagePercentage)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isAtLimit 
                ? 'bg-red-500' 
                : isNearLimit 
                ? 'bg-yellow-500' 
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Status Messages */}
      {isAtLimit && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Account limit reached!
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-300 mt-1">
            Upgrade your plan to add more accounts
          </p>
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              Approaching limit
            </span>
          </div>
          <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
            {remaining} accounts remaining this month
          </p>
        </div>
      )}

      {!isNearLimit && currentPlan.plan_type === 'free' && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-900/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Free Plan
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-300 mt-1">
            Upgrade to Pro for unlimited features
          </p>
        </div>
      )}

      {showFullDetails && currentPlan.plan_type !== 'free' && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Current Period</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">Next Reset</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}