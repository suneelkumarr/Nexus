import { supabase } from './supabase';

/**
 * Utility functions for real-time usage tracking
 */
export class UsageTracker {
  /**
   * Increment usage for a specific resource type
   * @param userId - User ID
   * @param resourceType - Type of resource (e.g., 'accounts', 'posts', 'reports')
   * @param increment - Amount to increment (default: 1)
   */
  static async increment(userId: string, resourceType: string, increment: number = 1): Promise<void> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      // Get existing usage record
      const { data: existing, error: getError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
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
            user_id: userId,
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

    } catch (error) {
      console.error('Error incrementing usage:', error);
      throw error;
    }
  }

  /**
   * Track usage for adding an Instagram account
   * @param userId - User ID
   */
  static async trackAccountAddition(userId: string): Promise<void> {
    await this.increment(userId, 'accounts', 1);
  }

  /**
   * Track usage for generating content
   * @param userId - User ID
   * @param count - Number of content pieces generated
   */
  static async trackContentGeneration(userId: string, count: number = 1): Promise<void> {
    await this.increment(userId, 'content_generation', count);
  }

  /**
   * Track usage for analytics reports
   * @param userId - User ID
   * @param count - Number of reports generated
   */
  static async trackAnalyticsReports(userId: string, count: number = 1): Promise<void> {
    await this.increment(userId, 'analytics_reports', count);
  }

  /**
   * Track usage for competitor analysis
   * @param userId - User ID
   * @param count - Number of competitor analyses
   */
  static async trackCompetitorAnalysis(userId: string, count: number = 1): Promise<void> {
    await this.increment(userId, 'competitor_analysis', count);
  }

  /**
   * Check if user is near their usage limit
   * @param userId - User ID
   * @param resourceType - Type of resource
   * @param limit - Usage limit for the resource
   * @param threshold - Warning threshold (default: 0.7 for 70%)
   */
  static async checkUsageThreshold(
    userId: string, 
    resourceType: string, 
    limit: number, 
    threshold: number = 0.7
  ): Promise<{ isNearLimit: boolean; isAtLimit: boolean; percentage: number; remaining: number }> {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('usage_count')
        .eq('user_id', userId)
        .eq('resource_type', resourceType)
        .gte('period_start', startOfMonth.toISOString())
        .lte('period_end', endOfMonth.toISOString())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const currentUsage = data?.usage_count || 0;
      const percentage = Math.min((currentUsage / limit) * 100, 100);
      const remaining = Math.max(limit - currentUsage, 0);
      
      return {
        isNearLimit: percentage >= threshold * 100,
        isAtLimit: percentage >= 90,
        percentage,
        remaining
      };
    } catch (error) {
      console.error('Error checking usage threshold:', error);
      return {
        isNearLimit: false,
        isAtLimit: false,
        percentage: 0,
        remaining: limit
      };
    }
  }
}

/**
 * React hook for usage tracking
 */
export function useRealtimeUsage() {
  const trackUsage = async (resourceType: string, increment: number = 1) => {
    // This will be replaced with actual user context
    const userId = 'current-user-id'; // Should be replaced with actual user ID from context
    
    if (userId && userId !== 'current-user-id') {
      await UsageTracker.increment(userId, resourceType, increment);
    }
  };

  return { trackUsage };
}