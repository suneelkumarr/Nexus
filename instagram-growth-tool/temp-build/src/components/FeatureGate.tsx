import { Lock, Crown, ArrowRight, AlertTriangle } from 'lucide-react';
import UpgradePrompt from './UpgradePrompt';
import { useState, useEffect } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { UsageTracker } from '@/lib/usageTracker';
import { useAuth } from '@/contexts/AuthContext';

interface FeatureGateProps {
  feature: string;
  requiredPlan?: 'free' | 'pro' | 'enterprise';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  trackUsage?: boolean;
  resourceType?: string;
  usageLimit?: number;
}

export default function FeatureGate({ 
  feature, 
  requiredPlan = 'pro',
  children, 
  fallback,
  showUpgradePrompt = false,
  trackUsage = false,
  resourceType = 'accounts',
  usageLimit
}: FeatureGateProps) {
  const { user } = useAuth();
  const { currentPlan, getUsagePercentage } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(false);
  const [usageStatus, setUsageStatus] = useState<{
    isNearLimit: boolean;
    isAtLimit: boolean;
    percentage: number;
    remaining: number;
  }>({ isNearLimit: false, isAtLimit: false, percentage: 0, remaining: 0 });

  useEffect(() => {
    if (trackUsage && user && currentPlan) {
      checkUsageStatus();
    }
  }, [user, currentPlan, trackUsage]);

  const checkUsageStatus = async () => {
    if (!user || !currentPlan) return;

    const limit = usageLimit || currentPlan.monthly_limit;
    const status = await UsageTracker.checkUsageThreshold(user.id, resourceType, limit);
    setUsageStatus(status);
  };

  // Check plan access
  const hasPlanAccess = currentPlan ? 
    (requiredPlan === 'free' || 
     (requiredPlan === 'pro' && currentPlan.plan_type !== 'free') ||
     (requiredPlan === 'enterprise' && currentPlan.plan_type === 'enterprise')) : false;

  // Check usage limits
  const hasUsageAccess = !trackUsage || 
    !usageStatus.isAtLimit;

  const hasAccess = hasPlanAccess && hasUsageAccess;

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="relative">
        {/* Blurred content */}
        <div className="blur-sm pointer-events-none select-none">
          {children}
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-purple-900/20 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-w-sm text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {!hasPlanAccess ? (
                <Lock className="w-6 h-6 text-white" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-white" />
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {!hasPlanAccess ? 'Premium Feature' : 'Usage Limit Reached'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {!hasPlanAccess ? 
                `"${feature}" is available on ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} and Enterprise plans.` :
                `You've reached the ${resourceType} limit for your current plan. ${usageStatus.remaining} remaining this month.`
              }
            </p>
            
            {trackUsage && usageStatus.isAtLimit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-red-700 dark:text-red-300">Usage Progress</span>
                  <span className="text-red-700 dark:text-red-300 font-medium">
                    {usageStatus.percentage.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-red-200 dark:bg-red-800 rounded-full mt-2">
                  <div 
                    className="h-2 bg-red-500 rounded-full transition-all"
                    style={{ width: `${Math.min(usageStatus.percentage, 100)}%` }}
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={() => setShowPrompt(true)}
              className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              <Crown className="w-4 h-4" />
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <UpgradePrompt
          isVisible={showPrompt}
          onClose={() => setShowPrompt(false)}
          onUpgrade={() => {
            window.location.hash = '#profile';
            setShowPrompt(false);
          }}
          reason={!hasPlanAccess ? 'feature_locked' : 'limit_reached'}
          currentPlan={currentPlan?.plan_type}
        />
      </div>
    );
  }

  return <>{children}</>;
}