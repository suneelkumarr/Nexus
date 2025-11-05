import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface UsageTrackingOptions {
  resourceType: string;
  increment?: number;
  immediate?: boolean;
}

interface UsageTracker {
  incrementUsage: (options: UsageTrackingOptions) => Promise<void>;
  getCurrentUsage: () => number;
  isLoading: boolean;
}

export function useUsageTracking(resourceType: string): UsageTracker {
  const { user } = useAuth();
  const [currentUsage, setCurrentUsage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Load current usage on mount
  useEffect(() => {
    if (user && resourceType) {
      loadCurrentUsage();
    }
  }, [user, resourceType]);

  const loadCurrentUsage = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', user?.id)
        .eq('resource_type', resourceType)
        .gte('period_start', startOfMonth.toISOString())
        .lte('period_end', endOfMonth.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading usage:', error);
        return;
      }

      setCurrentUsage(data?.usage_count || 0);
    } catch (error) {
      console.error('Error loading usage:', error);
    }
  };

  const incrementUsage = async ({ 
    resourceType: rt, 
    increment = 1, 
    immediate = false 
  }: UsageTrackingOptions) => {
    if (!user) return;

    try {
      setIsLoading(true);
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Use the function parameter resourceType if provided, otherwise use the hook parameter
      const actualResourceType = rt || resourceType;

      // First, try to get existing usage record
      const { data: existing, error: getError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('resource_type', actualResourceType)
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
        setCurrentUsage(prev => prev + increment);
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            resource_type: actualResourceType,
            usage_count: increment,
            period_start: startOfMonth.toISOString(),
            period_end: endOfMonth.toISOString()
          });

        if (insertError) throw insertError;
        setCurrentUsage(prev => prev + increment);
      }

      // If immediate is true, trigger a refresh event
      if (immediate) {
        window.dispatchEvent(new CustomEvent('usageUpdated', { 
          detail: { resourceType: actualResourceType } 
        }));
      }
    } catch (error) {
      console.error('Error incrementing usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentUsage = () => currentUsage;

  return {
    incrementUsage,
    getCurrentUsage,
    isLoading
  };
}