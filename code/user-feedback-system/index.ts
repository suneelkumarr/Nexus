// Main index file for User Feedback System
// Instagram Analytics Platform

// Components
export { default as FeedbackWidget } from './components/FeedbackWidget';
export { default as FeedbackDashboard } from './components/FeedbackDashboard';

// Hooks
export { 
  useFeedbackWidget, 
  useNPSWidget, 
  useFeatureRatingWidget, 
  useBugReportWidget,
  useFeedbackTriggers 
} from './hooks/useFeedbackWidget';

// Services
export { feedbackService } from './services/feedbackService';

// Utils
export { sentimentAnalyzer } from './utils/sentimentAnalyzer';

// Types
export type {
  UserFeedback,
  FeedbackContext,
  NPSResponse,
  FeedbackCategory,
  FeedbackTrend,
  SentimentAnalysis,
  EmotionScores,
  FeedbackResponseTemplate,
  FeedbackWidgetConfig,
  WidgetTriggerCondition,
  FeedbackDashboard,
  DashboardOverview,
  CategoryAnalytics,
  SentimentAnalytics,
  NPSMetrics,
  ActionItem,
  FeedbackWidgetProps,
  NPSWidgetProps,
  FeatureRatingWidgetProps,
  BugReportWidgetProps,
  BugReportData,
  FeedbackAnalytics,
  FeedbackSummary,
  TrendAnalysis,
  CategoryAnalysis,
  SegmentAnalysis,
  ExportData,
  APIResponse,
  FeedbackFilter,
  PaginatedResponse
} from './types';

// Constants
export const FEEDBACK_CATEGORIES = {
  USER_INTERFACE: 'user_interface',
  PERFORMANCE: 'performance',
  FEATURES: 'features',
  BUG_REPORTS: 'bug_reports',
  DOCUMENTATION: 'documentation',
  BILLING: 'billing',
  INTEGRATION: 'integration',
  MOBILE_EXPERIENCE: 'mobile_experience',
  DATA_ACCURACY: 'data_accuracy',
  GENERAL: 'general'
} as const;

export const FEEDBACK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
} as const;

export const FEEDBACK_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
} as const;

export const WIDGET_POSITIONS = {
  BOTTOM_LEFT: 'bottom_left',
  BOTTOM_RIGHT: 'bottom_right',
  TOP_LEFT: 'top_left',
  TOP_RIGHT: 'top_right',
  CENTER: 'center'
} as const;

export const WIDGET_TYPES = {
  NPS: 'nps',
  FEATURE_RATING: 'feature_rating',
  BUG_REPORT: 'bug_report',
  GENERAL_FEEDBACK: 'general_feedback'
} as const;

// Utility functions
export const feedbackUtils = {
  /**
   * Get sentiment label from score
   */
  getSentimentLabel: (score: number): 'positive' | 'neutral' | 'negative' => {
    if (score > 0.1) return 'positive';
    if (score < -0.1) return 'negative';
    return 'neutral';
  },

  /**
   * Get sentiment color class
   */
  getSentimentColor: (score: number): string => {
    if (score > 0.1) return 'text-green-600';
    if (score < -0.1) return 'text-red-600';
    return 'text-gray-600';
  },

  /**
   * Format NPS score
   */
  formatNPSScore: (score: number): string => {
    if (score >= 50) return 'Excellent';
    if (score >= 0) return 'Good';
    if (score >= -50) return 'Needs Improvement';
    return 'Critical';
  },

  /**
   * Get priority color
   */
  getPriorityColor: (priority: string): string => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  },

  /**
   * Calculate response rate
   */
  calculateResponseRate: (totalShown: number, totalSubmitted: number): number => {
    if (totalShown === 0) return 0;
    return Math.round((totalSubmitted / totalShown) * 100);
  },

  /**
   * Calculate NPS from scores
   */
  calculateNPS: (promoters: number, passives: number, detractors: number): number => {
    const total = promoters + passives + detractors;
    if (total === 0) return 0;
    return Math.round(((promoters - detractors) / total) * 100);
  },

  /**
   * Get feedback type display name
   */
  getFeedbackTypeDisplayName: (type: string): string => {
    switch (type) {
      case 'nps': return 'Net Promoter Score';
      case 'feature_specific': return 'Feature Feedback';
      case 'bug_report': return 'Bug Report';
      case 'improvement_suggestion': return 'Improvement Suggestion';
      default: return 'General Feedback';
    }
  },

  /**
   * Validate feedback data
   */
  validateFeedback: (feedback: Partial<UserFeedback>): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!feedback.message || feedback.message.trim().length === 0) {
      errors.push('Message is required');
    }
    
    if (!feedback.feedback_type) {
      errors.push('Feedback type is required');
    }
    
    if (feedback.rating && (feedback.rating < 1 || feedback.rating > 10)) {
      errors.push('Rating must be between 1 and 10');
    }
    
    if (feedback.sentiment_score && (feedback.sentiment_score < -1 || feedback.sentiment_score > 1)) {
      errors.push('Sentiment score must be between -1 and 1');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Generate feedback summary
   */
  generateFeedbackSummary: (feedbackList: UserFeedback[]): {
    totalCount: number;
    averageRating: number;
    averageSentiment: number;
    npsScore: number;
    categoryBreakdown: Record<string, number>;
    sentimentBreakdown: { positive: number; neutral: number; negative: number };
  } => {
    const totalCount = feedbackList.length;
    
    const ratings = feedbackList.filter(f => f.rating).map(f => f.rating!);
    const averageRating = ratings.length > 0 
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
      : 0;
    
    const sentiments = feedbackList.filter(f => f.sentiment_score !== null).map(f => f.sentiment_score!);
    const averageSentiment = sentiments.length > 0
      ? sentiments.reduce((sum, sentiment) => sum + sentiment, 0) / sentiments.length
      : 0;
    
    // Calculate NPS from ratings (assuming ratings 9-10 are promoters, 7-8 are passives, 0-6 are detractors)
    const promoters = ratings.filter(r => r >= 9).length;
    const passives = ratings.filter(r => r >= 7 && r <= 8).length;
    const detractors = ratings.filter(r => r <= 6).length;
    const npsScore = totalCount > 0 ? ((promoters - detractors) / totalCount) * 100 : 0;
    
    const categoryBreakdown: Record<string, number> = {};
    feedbackList.forEach(f => {
      const category = f.category || 'general';
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + 1;
    });
    
    const sentimentBreakdown = {
      positive: sentiments.filter(s => s > 0.1).length,
      neutral: sentiments.filter(s => s >= -0.1 && s <= 0.1).length,
      negative: sentiments.filter(s => s < -0.1).length
    };
    
    return {
      totalCount,
      averageRating: Math.round(averageRating * 10) / 10,
      averageSentiment: Math.round(averageSentiment * 100) / 100,
      npsScore: Math.round(npsScore),
      categoryBreakdown,
      sentimentBreakdown
    };
  },

  /**
   * Create default widget configuration
   */
  createDefaultWidgetConfig: (type: string): Partial<FeedbackWidgetConfig> => {
    const baseConfig = {
      widget_type: type as any,
      is_active: true,
      position: 'bottom_right' as const,
      trigger_condition: {
        event: 'manual' as const,
        delay: 30000
      }
    };
    
    switch (type) {
      case 'nps':
        return {
          ...baseConfig,
          title: 'How likely are you to recommend us?',
          description: 'Your feedback helps us improve',
          trigger_condition: {
            event: 'time_spent',
            delay: 60000,
            min_session_duration: 30
          }
        };
      
      case 'feature_rating':
        return {
          ...baseConfig,
          title: 'Rate your experience',
          description: 'How was your experience with this feature?',
          trigger_condition: {
            event: 'feature_use',
            delay: 5000
          }
        };
      
      case 'bug_report':
        return {
          ...baseConfig,
          title: 'Found a bug?',
          description: 'Help us fix issues by reporting them',
          position: 'top_right' as const
        };
      
      default:
        return {
          ...baseConfig,
          title: 'We value your feedback',
          description: 'Share your thoughts with us'
        };
    }
  },

  /**
   * Format feedback for export
   */
  formatForExport: (feedback: UserFeedback): Record<string, any> => {
    return {
      id: feedback.id,
      created_at: feedback.created_at,
      feedback_type: feedback.feedback_type,
      category: feedback.category || 'N/A',
      rating: feedback.rating || 'N/A',
      sentiment_score: feedback.sentiment_score || 'N/A',
      priority: feedback.priority,
      status: feedback.status,
      message: feedback.message,
      feature_name: feedback.feature_name || 'N/A',
      page_url: feedback.page_url || 'N/A',
      user_agent: feedback.user_agent || 'N/A'
    };
  }
};

// Quick setup function for new implementations
export const setupFeedbackSystem = async () => {
  try {
    // Initialize default widget configurations
    const defaultConfigs = [
      feedbackUtils.createDefaultWidgetConfig('nps'),
      feedbackUtils.createDefaultWidgetConfig('feature_rating'),
      feedbackUtils.createDefaultWidgetConfig('bug_report'),
      feedbackUtils.createDefaultWidgetConfig('general_feedback')
    ];
    
    for (const config of defaultConfigs) {
      await feedbackService.saveWidgetConfig(config);
    }
    
    console.log('Feedback system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize feedback system:', error);
    throw error;
  }
};

// Default export with all exports
export default {
  // Components
  FeedbackWidget,
  FeedbackDashboard,
  
  // Hooks
  useFeedbackWidget,
  useNPSWidget,
  useFeatureRatingWidget,
  useBugReportWidget,
  useFeedbackTriggers,
  
  // Services
  feedbackService,
  
  // Utils
  sentimentAnalyzer,
  feedbackUtils,
  
  // Constants
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUS,
  WIDGET_POSITIONS,
  WIDGET_TYPES,
  
  // Setup
  setupFeedbackSystem
};