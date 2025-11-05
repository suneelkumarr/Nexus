import { useState, useEffect } from 'react';
import { useSubscription } from './useSubscription';

interface UsageLimitOptions {
  resourceType?: string;
  warningThreshold?: number; // 0.7 = 70%
  criticalThreshold?: number; // 0.9 = 90%
}

interface UsageLimitState {
  isNearLimit: boolean;
  isAtLimit: boolean;
  shouldShowUpgradePrompt: boolean;
  remainingUsage: number;
  usagePercentage: number;
}

export function useUsageLimit(options: UsageLimitOptions = {}): UsageLimitState {
  const { 
    currentPlan, 
    getUsagePercentage, 
    getRemainingUsage,
    showUpgradePrompt 
  } = useSubscription();
  
  const {
    resourceType = 'accounts',
    warningThreshold = 0.7,
    criticalThreshold = 0.9
  } = options;

  const usagePercentage = getUsagePercentage(resourceType);
  const remainingUsage = getRemainingUsage(resourceType);
  
  const isNearLimit = usagePercentage >= warningThreshold;
  const isAtLimit = usagePercentage >= criticalThreshold;
  
  // For free plan users, always show upgrade prompt when they have usage
  const shouldShowUpgradePrompt = showUpgradePrompt || isAtLimit || 
    (currentPlan?.plan_type === 'free' && usagePercentage > 0);

  return {
    isNearLimit,
    isAtLimit,
    shouldShowUpgradePrompt,
    remainingUsage,
    usagePercentage
  };
}