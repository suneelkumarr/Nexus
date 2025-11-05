import { Crown, AlertTriangle, CheckCircle, CreditCard, Bell } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useState, useEffect } from 'react';
import { formatNumber, formatRelativeTime } from '@/utils/dataFormatting';

interface SubscriptionStatusProps {
  onUpgradeClick: () => void;
}

export default function SubscriptionStatus({ onUpgradeClick }: SubscriptionStatusProps) {
  const { currentPlan, currentSubscription, usage, getUsagePercentage, loading } = useSubscription();
  const [showDropdown, setShowDropdown] = useState(false);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    // Check for various subscription alerts
    const newAlerts: string[] = [];
    
    if (currentSubscription?.cancel_at_period_end) {
      newAlerts.push('Your subscription will end soon');
    }
    
    const usagePercentage = getUsagePercentage('accounts');
    if (usagePercentage >= 90) {
      newAlerts.push('Account limit reached');
    } else if (usagePercentage >= 70) {
      newAlerts.push('Approaching account limit');
    }
    
    setAlerts(newAlerts);
  }, [currentSubscription, usage, getUsagePercentage]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        <div className="w-16 h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
      </div>
    );
  }

  if (!currentPlan && !loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-gray-500" />
        <span className="text-xs text-gray-500">No plan data</span>
      </div>
    );
  }

  const usagePercentage = getUsagePercentage('accounts');
  const isNearLimit = usagePercentage >= 70;
  const isAtLimit = usagePercentage >= 90;

  return (
    <div className="relative">
      {/* Subscription Status Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
          currentPlan.plan_type !== 'free'
            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
            : isAtLimit
            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            : isNearLimit
            ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
        } hover:shadow-md`}
      >
        {/* Status Icon */}
        <div className="relative">
          {currentPlan.plan_type !== 'free' ? (
            <Crown className="w-4 h-4" />
          ) : isAtLimit ? (
            <AlertTriangle className="w-4 h-4" />
          ) : isNearLimit ? (
            <AlertTriangle className="w-4 h-4" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          
          {/* Alert Badge */}
          {alerts.length > 0 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white dark:border-gray-800">
              <Bell className="w-2 h-2 text-white m-0.5" />
            </div>
          )}
        </div>

        {/* Plan Name */}
        <span className="hidden md:block text-sm font-medium">
          {currentPlan.plan_type === 'free' ? 'Free' : currentPlan.plan_name}
        </span>

        {/* Usage Indicator */}
        {currentPlan.plan_type === 'free' && usage.length > 0 && (
          <div className="hidden lg:flex items-center gap-1">
            <div className="w-12 h-1 bg-gray-200 dark:bg-gray-600 rounded-full">
              <div 
                className={`h-1 rounded-full transition-all ${
                  isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {usage[0]?.usage_count || 0}/{currentPlan.monthly_limit}
            </span>
          </div>
        )}

        {/* Dropdown Arrow */}
        <svg 
          className={`w-3 h-3 transition-transform ${showDropdown ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                currentPlan.plan_type !== 'free' 
                  ? 'bg-purple-100 dark:bg-purple-900/30' 
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}>
                {currentPlan.plan_type !== 'free' ? (
                  <Crown className="w-5 h-5 text-purple-600" />
                ) : (
                  <CreditCard className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {currentPlan.plan_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {currentPlan.plan_type === 'free' ? 'Free Plan' : 'Paid Subscription'}
                </p>
              </div>
            </div>
          </div>

          {/* Usage Info */}
          <div className="p-4">
            {currentPlan.plan_type === 'free' && usage.length > 0 && (
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Account Usage</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {usage[0]?.usage_count || 0} / {currentPlan.monthly_limit}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-2 mb-4">
                {alerts.map((alert, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <span className="text-sm text-yellow-800 dark:text-yellow-200">{alert}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Billing Info */}
            {currentSubscription && (
              <div className="space-y-2 mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Next billing:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`capitalize ${
                    currentSubscription.status === 'active' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {currentSubscription.status}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onUpgradeClick();
                  setShowDropdown(false);
                }}
                className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
              >
                {currentPlan.plan_type === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
              </button>
              <button
                onClick={() => setShowDropdown(false)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}