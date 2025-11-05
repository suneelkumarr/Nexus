import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Plan {
  id: number;
  plan_type: string;
  plan_name: string;
  price: number;
  monthly_limit: number;
  features: string[];
  is_active: boolean;
}

interface Subscription {
  id: number;
  plan_type: string;
  status: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
}

interface UsageData {
  resource_type: string;
  usage_count: number;
  limit: number;
  period_start: string;
  period_end: string;
}

interface SubscriptionState {
  currentPlan: Plan | null;
  currentSubscription: Subscription | null;
  usage: UsageData[];
  loading: boolean;
  error: string | null;
  errorType?: 'network' | 'api' | 'permission' | 'rate_limit' | 'unknown';
  // Computed values
  isLimitReached: boolean;
  getUsagePercentage: (resourceType: string) => number;
  getRemainingUsage: (resourceType: string) => number;
  refreshUsage: () => Promise<void>;
  showUpgradePrompt: boolean;
  trackUsage: (resourceType: string, increment?: number) => Promise<void>;
  retry: () => Promise<void>;
  canRetry: boolean;
  lastRetryTime: number;
}

export function useSubscription(): SubscriptionState {
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<string | undefined>();
  const [lastRetryTime, setLastRetryTime] = useState(0);

  const classifyError = (err: any): { type: string; message: string } => {
    const message = err.message || err.toString();
    
    if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
      return { type: 'network', message: 'Network connection failed. Please check your internet connection.' };
    }
    
    if (message.includes('401') || message.includes('unauthorized') || message.includes('permission')) {
      return { type: 'permission', message: 'Authentication required. Please log in again.' };
    }
    
    if (message.includes('429') || message.includes('rate limit') || message.includes('too many requests')) {
      return { type: 'rate_limit', message: 'Too many requests. Please wait before trying again.' };
    }
    
    if (message.includes('500') || message.includes('server error') || message.includes('internal error')) {
      return { type: 'api', message: 'Server error occurred. Please try again later.' };
    }
    
    return { type: 'unknown', message: message || 'An unexpected error occurred.' };
  };

  const canRetry = lastRetryTime === 0 || Date.now() - lastRetryTime > 5000; // 5 second cooldown

  const loadSubscriptionData = async () => {
    if (!user) {
      setLoading(false);
      setCurrentPlan({
        id: 1,
        plan_type: 'free',
        plan_name: 'Free Plan',
        price: 0,
        monthly_limit: 5,
        features: ['Basic Analytics', 'Up to 5 accounts'],
        is_active: true
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setErrorType(undefined);
      setLastRetryTime(Date.now());

      // Load subscription data with timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      const subscriptionPromise = supabase.functions.invoke('manage-subscription', {
        body: { action: 'get' }
      });

      const { data, error: subError } = await Promise.race([
        subscriptionPromise,
        timeoutPromise
      ]) as any;

      if (subError) {
        const errorInfo = classifyError(subError);
        console.warn('Subscription API error (gracefully degrading):', subError);
        // Don't show error to user - silently fall back
        setError(null); // Clear error for graceful degradation
        setErrorType(undefined);
        
        // Set default free plan when API fails
        setCurrentPlan({
          id: 1,
          plan_type: 'free',
          plan_name: 'Free Plan',
          price: 0,
          monthly_limit: 5,
          features: ['Basic Analytics', 'Up to 5 accounts'],
          is_active: true
        });
      } else if (data?.data) {
        setCurrentSubscription(data.data.subscription || null);
        setCurrentPlan(data.data.plan || {
          id: 1,
          plan_type: 'free',
          plan_name: 'Free Plan',
          price: 0,
          monthly_limit: 5,
          features: ['Basic Analytics', 'Up to 5 accounts'],
          is_active: true
        });
      } else {
        // No data returned, use default
        setCurrentPlan({
          id: 1,
          plan_type: 'free',
          plan_name: 'Free Plan',
          price: 0,
          monthly_limit: 5,
          features: ['Basic Analytics', 'Up to 5 accounts'],
          is_active: true
        });
      }

      // Load usage data with error handling
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_end', new Date().toISOString());

      if (usageError) {
        console.warn('Failed to load usage data (non-critical):', usageError);
        setUsage([]);
      } else {
        setUsage(usageData || []);
      }
    } catch (err: any) {
      console.error('Error loading subscription data (gracefully degrading):', err);
      // Don't set error for user-facing display - just log it
      setError(null);
      setErrorType(undefined);
      
      // Set fallback data on error
      setCurrentPlan({
        id: 1,
        plan_type: 'free',
        plan_name: 'Free Plan',
        price: 0,
        monthly_limit: 5,
        features: ['Basic Analytics', 'Up to 5 accounts'],
        is_active: true
      });
      setUsage([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsage = async () => {
    await loadSubscriptionData();
  };

  const getUsagePercentage = (resourceType: string): number => {
    const resource = usage.find(u => u.resource_type === resourceType);
    if (!resource || !currentPlan) return 0;
    
    const percentage = (resource.usage_count / currentPlan.monthly_limit) * 100;
    return Math.min(percentage, 100);
  };

  const getRemainingUsage = (resourceType: string): number => {
    const resource = usage.find(u => u.resource_type === resourceType);
    if (!resource || !currentPlan) return 0;
    
    return Math.max(currentPlan.monthly_limit - resource.usage_count, 0);
  };

  const isLimitReached = usage.some(u => {
    const resourceUsage = getUsagePercentage(u.resource_type);
    return resourceUsage >= 90; // Show upgrade prompt when at 90% capacity
  });

  const showUpgradePrompt = isLimitReached || 
    (currentPlan?.plan_type === 'free' && usage.length > 0);

  const trackUsage = async (resourceType: string, increment: number = 1) => {
    if (!user || !currentPlan) return;

    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get existing usage record
      const { data: existing, error: getError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_type', resourceType)
        .gte('period_start', startOfMonth.toISOString())
        .lte('period_end', endOfMonth.toISOString())
        .single();

      if (getError && getError.code !== 'PGRST116') {
        throw getError;
      }

      if (existing) {
        // Update existing record
        const { error: updateError } = await supabase
          .from('usage_tracking')
          .update({ 
            usage_count: existing.usage_count + increment,
            updated_at: now.toISOString()
          })
          .eq('id', existing.id);

        if (updateError) throw updateError;
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            resource_type: resourceType,
            usage_count: increment,
            period_start: startOfMonth.toISOString(),
            period_end: endOfMonth.toISOString()
          });

        if (insertError) throw insertError;
      }

      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('usageUpdated', { 
        detail: { resourceType } 
      }));

      // Refresh data
      await loadSubscriptionData();
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  useEffect(() => {
    loadSubscriptionData();

    // Set up real-time subscription for usage changes
    if (user) {
      const subscription = supabase
        .channel('subscription_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'usage_tracking',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh usage data when changes occur
            loadSubscriptionData();
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'subscriptions',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh subscription data when changes occur
            loadSubscriptionData();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user]);

  const retry = async () => {
    if (!canRetry) {
      console.warn('Retry rate limited');
      return;
    }
    
    setError(null);
    setLastRetryTime(Date.now());
    await loadSubscriptionData();
  };

  return {
    currentPlan,
    currentSubscription,
    usage,
    loading,
    error,
    errorType,
    isLimitReached,
    getUsagePercentage,
    getRemainingUsage,
    refreshUsage,
    showUpgradePrompt,
    trackUsage,
    retry,
    canRetry,
    lastRetryTime
  };
}