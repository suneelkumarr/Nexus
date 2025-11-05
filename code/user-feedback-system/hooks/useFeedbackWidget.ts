// Custom React Hook for Feedback Widget Management
// Instagram Analytics Platform

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  FeedbackWidgetConfig, 
  WidgetTriggerCondition, 
  UserFeedback, 
  FeedbackContext 
} from '../types';
import { feedbackService } from '../services/feedbackService';

interface UseFeedbackWidgetReturn {
  // Widget state
  showWidget: boolean;
  widgetConfig: FeedbackWidgetConfig | null;
  currentFeedback: Partial<UserFeedback> | null;
  
  // Actions
  showWidgetManually: (type: FeedbackWidgetConfig['widget_type']) => void;
  hideWidget: () => void;
  submitFeedback: (feedback: Partial<UserFeedback>) => Promise<void>;
  
  // Utility functions
  trackUserAction: (action: string, context?: any) => void;
  isFeatureUsed: (featureName: string) => boolean;
  getUserJourneyStage: () => string;
  
  // Configuration
  updateWidgetConfig: (config: Partial<FeedbackWidgetConfig>) => Promise<void>;
  getAvailableWidgets: () => FeedbackWidgetConfig[];
}

interface WidgetTrigger {
  id: string;
  type: FeedbackWidgetConfig['widget_type'];
  condition: WidgetTriggerCondition;
  config: FeedbackWidgetConfig;
  triggered: boolean;
  triggeredAt?: number;
}

export function useFeedbackWidget(): UseFeedbackWidgetReturn {
  const [showWidget, setShowWidget] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState<FeedbackWidgetConfig | null>(null);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<UserFeedback> | null>(null);
  const [activeWidgets, setActiveWidgets] = useState<WidgetTrigger[]>([]);
  
  const sessionStartTime = useRef<number>(Date.now());
  const userActions = useRef<Map<string, number>>(new Map());
  const featureUsageCount = useRef<Map<string, number>>(new Map());

  // Initialize widget system
  useEffect(() => {
    initializeWidgetSystem();
    setupEventListeners();
    
    return () => {
      cleanupEventListeners();
    };
  }, []);

  // Check for trigger conditions
  useEffect(() => {
    if (!showWidget && activeWidgets.length > 0) {
      checkTriggerConditions();
    }
  }, [activeWidgets, showWidget, userActions.current, featureUsageCount.current]);

  const initializeWidgetSystem = async () => {
    try {
      const configs = await feedbackService.getWidgetConfigs();
      const activeConfigs = configs.filter(config => config.is_active);
      
      const triggers: WidgetTrigger[] = activeConfigs.map(config => ({
        id: config.id,
        type: config.widget_type,
        condition: config.trigger_condition,
        config,
        triggered: false
      }));
      
      setActiveWidgets(triggers);
    } catch (error) {
      console.error('Failed to initialize widget system:', error);
    }
  };

  const setupEventListeners = () => {
    // Track page views
    const handlePageView = () => {
      trackUserAction('page_view', {
        url: window.location.pathname,
        title: document.title
      });
    };

    // Track feature usage
    const handleFeatureUse = (event: CustomEvent) => {
      const { featureName } = event.detail;
      trackUserAction('feature_use', { feature: featureName });
      incrementFeatureUsage(featureName);
    };

    // Track time-based events
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sessionStartTime.current = Date.now();
      }
    };

    // Add listeners
    window.addEventListener('popstate', handlePageView);
    window.addEventListener('feedback:feature-used', handleFeatureUse as EventListener);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial page view
    handlePageView();

    // Store cleanup function
    (window as any).__feedbackCleanup = () => {
      window.removeEventListener('popstate', handlePageView);
      window.removeEventListener('feedback:feature-used', handleFeatureUse as EventListener);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  };

  const cleanupEventListeners = () => {
    if ((window as any).__feedbackCleanup) {
      (window as any).__feedbackCleanup();
    }
  };

  const checkTriggerConditions = () => {
    activeWidgets.forEach(widget => {
      if (widget.triggered) return;

      const shouldTrigger = evaluateTriggerCondition(widget.condition);
      
      if (shouldTrigger) {
        triggerWidget(widget);
      }
    });
  };

  const evaluateTriggerCondition = (condition: WidgetTriggerCondition): boolean => {
    const currentTime = Date.now();
    const sessionDuration = (currentTime - sessionStartTime.current) / 1000; // seconds

    switch (condition.event) {
      case 'page_view':
        return condition.page ? window.location.pathname === condition.page : true;

      case 'feature_use':
        if (!condition.feature) return true;
        return getFeatureUsageCount(condition.feature) >= 1;

      case 'time_spent':
        const minDuration = condition.min_session_duration || 30;
        const delay = condition.delay || 60000; // 1 minute default
        return sessionDuration >= (delay / 1000) && sessionDuration >= minDuration;

      case 'action_completed':
        return checkCustomConditions(condition.conditions || {});

      case 'manual':
        return false; // Never auto-trigger manual widgets

      default:
        return false;
    }
  };

  const checkTriggerCondition = (condition: WidgetTriggerCondition): boolean => {
    return evaluateTriggerCondition(condition);
  };

  const checkCustomConditions = (conditions: Record<string, any>): boolean => {
    // Check custom conditions based on user context
    Object.entries(conditions).forEach(([key, value]) => {
      switch (key) {
        case 'user_segment':
          const currentSegment = getUserSegment();
          return value.includes(currentSegment);
        
        case 'feedback_count':
          return getUserFeedbackCount() <= value;
        
        case 'session_count':
          return getSessionCount() === value;
        
        default:
          return true;
      }
    });
    return true;
  };

  const triggerWidget = (widget: WidgetTrigger) => {
    setShowWidget(true);
    setWidgetConfig(widget.config);
    setCurrentFeedback(null);

    // Mark as triggered
    setActiveWidgets(prev => prev.map(w => 
      w.id === widget.id 
        ? { ...w, triggered: true, triggeredAt: Date.now() }
        : w
    ));

    // Track trigger event
    trackUserAction('widget_triggered', {
      widget_type: widget.type,
      trigger_condition: widget.condition,
      session_duration: (Date.now() - sessionStartTime.current) / 1000
    });
  };

  const showWidgetManually = useCallback((type: FeedbackWidgetConfig['widget_type']) => {
    const widget = activeWidgets.find(w => w.type === type);
    if (widget) {
      triggerWidget(widget);
    }
  }, [activeWidgets]);

  const hideWidget = useCallback(() => {
    setShowWidget(false);
    setWidgetConfig(null);
    setCurrentFeedback(null);
  }, []);

  const submitFeedback = useCallback(async (feedback: Partial<UserFeedback>) => {
    try {
      setCurrentFeedback(feedback);
      
      const enrichedFeedback: Partial<UserFeedback> = {
        ...feedback,
        context: {
          ...feedback.context,
          user_journey_stage: getUserJourneyStage(),
          session_duration: (Date.now() - sessionStartTime.current) / 1000,
          feature_usage_count: Object.fromEntries(featureUsageCount.current),
          user_agent: navigator.userAgent,
          page_url: window.location.href,
          custom_context: {
            widget_triggered_at: widgetConfig ? widgetConfig.id : undefined
          }
        }
      };

      if (feedback.feedback_type === 'nps' && 'score' in feedback) {
        // Handle NPS submission
        await feedbackService.submitNPSResponse(
          feedback.score!,
          feedback.message,
          getUserSegment()
        );
      } else {
        // Handle general feedback submission
        await feedbackService.submitFeedback(enrichedFeedback);
      }

      // Reset widget state
      hideWidget();

      // Track submission
      trackUserAction('feedback_submitted', {
        feedback_type: feedback.feedback_type,
        category: feedback.category,
        has_rating: !!feedback.rating,
        message_length: feedback.message?.length || 0
      });

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  }, [widgetConfig, hideWidget]);

  // User tracking utilities
  const trackUserAction = useCallback((action: string, context?: any) => {
    const timestamp = Date.now();
    userActions.current.set(action, timestamp);

    // Log to analytics (integrate with your existing analytics)
    if ((window as any).analytics) {
      (window as any).analytics.track('user_action', {
        action,
        context,
        timestamp,
        session_duration: (timestamp - sessionStartTime.current) / 1000
      });
    }

    // Check if this action should trigger any widgets
    activeWidgets.forEach(widget => {
      if (!widget.triggered && widget.condition.event === 'action_completed') {
        if (evaluateActionCondition(widget.condition, action, context)) {
          triggerWidget(widget);
        }
      }
    });
  }, [activeWidgets]);

  const evaluateActionCondition = (
    condition: WidgetTriggerCondition, 
    action: string, 
    context?: any
  ): boolean => {
    // Check if the action matches the condition
    if (condition.conditions?.action === action) {
      return checkCustomConditions(condition.conditions);
    }
    return false;
  };

  const incrementFeatureUsage = useCallback((featureName: string) => {
    const currentCount = featureUsageCount.current.get(featureName) || 0;
    featureUsageCount.current.set(featureName, currentCount + 1);

    // Trigger feature-specific widgets
    activeWidgets.forEach(widget => {
      if (!widget.triggered && 
          widget.condition.event === 'feature_use' && 
          widget.condition.feature === featureName) {
        triggerWidget(widget);
      }
    });
  }, [activeWidgets]);

  const isFeatureUsed = useCallback((featureName: string): boolean => {
    return getFeatureUsageCount(featureName) > 0;
  }, []);

  const getFeatureUsageCount = useCallback((featureName: string): number => {
    return featureUsageCount.current.get(featureName) || 0;
  }, []);

  // Context utilities
  const getUserJourneyStage = useCallback((): string => {
    const sessionDuration = (Date.now() - sessionStartTime.current) / 1000;
    const totalActions = userActions.current.size;
    
    if (sessionDuration < 300) { // 5 minutes
      return 'onboarding';
    } else if (totalActions > 20) {
      return 'active_use';
    } else if (Math.random() > 0.7) {
      return 'churn_risk';
    }
    return 'returning_user';
  }, []);

  const getUserSegment = useCallback((): string => {
    // Get from user profile or analytics
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.plan || 'free';
  }, []);

  const getUserFeedbackCount = useCallback((): number => {
    // Get from local storage or API
    return parseInt(localStorage.getItem('feedback_count') || '0');
  }, []);

  const getSessionCount = useCallback((): number => {
    // Track sessions in localStorage
    const sessionKey = `session_${new Date().toDateString()}`;
    const count = parseInt(localStorage.getItem(sessionKey) || '0');
    localStorage.setItem(sessionKey, (count + 1).toString());
    return count;
  }, []);

  const updateWidgetConfig = useCallback(async (config: Partial<FeedbackWidgetConfig>) => {
    try {
      await feedbackService.saveWidgetConfig(config);
      
      // Update local state
      setActiveWidgets(prev => prev.map(widget => 
        widget.config.id === config.id 
          ? { ...widget, config: { ...widget.config, ...config } }
          : widget
      ));
    } catch (error) {
      console.error('Failed to update widget config:', error);
      throw error;
    }
  }, []);

  const getAvailableWidgets = useCallback((): FeedbackWidgetConfig[] => {
    return activeWidgets.map(widget => widget.config);
  }, [activeWidgets]);

  return {
    // State
    showWidget,
    widgetConfig,
    currentFeedback,
    
    // Actions
    showWidgetManually,
    hideWidget,
    submitFeedback,
    
    // Utilities
    trackUserAction,
    isFeatureUsed,
    getUserJourneyStage,
    
    // Configuration
    updateWidgetConfig,
    getAvailableWidgets
  };
}

// Convenience hook for specific widget types
export function useNPSWidget() {
  const { showWidgetManually, submitFeedback, hideWidget, showWidget } = useFeedbackWidget();
  const [npsData, setNpsData] = useState<{ score: number; reason?: string } | null>(null);

  const showNPSWidget = useCallback(() => {
    setNpsData(null);
    showWidgetManually('nps');
  }, [showWidgetManually]);

  const submitNPS = useCallback(async (score: number, reason?: string) => {
    setNpsData({ score, reason });
    await submitFeedback({
      feedback_type: 'nps',
      rating: score,
      message: reason || `NPS Score: ${score}`,
      category: 'nps'
    });
  }, [submitFeedback]);

  return {
    showNPSWidget,
    submitNPS,
    hideNPSWidget: hideWidget,
    isNPSWidgetVisible: showWidget,
    npsData
  };
}

// Hook for feature rating widgets
export function useFeatureRatingWidget() {
  const { showWidgetManually, submitFeedback, hideWidget, showWidget } = useFeedbackWidget();
  const [featureRatingData, setFeatureRatingData] = useState<{ 
    feature: string; 
    rating: number; 
    feedback?: string 
  } | null>(null);

  const showFeatureRatingWidget = useCallback((feature: string) => {
    setFeatureRatingData(null);
    showWidgetManually('feature_rating');
    
    // Store feature name for context
    localStorage.setItem('current_feature_rating', feature);
  }, [showWidgetManually]);

  const submitFeatureRating = useCallback(async (rating: number, feedback?: string) => {
    const feature = localStorage.getItem('current_feature_rating') || 'unknown';
    setFeatureRatingData({ feature, rating, feedback });
    
    await submitFeedback({
      feedback_type: 'feature_specific',
      rating,
      message: feedback || `Rating for ${feature}: ${rating}/5`,
      category: 'feature_rating',
      feature_name: feature
    });
    
    localStorage.removeItem('current_feature_rating');
  }, [submitFeedback]);

  return {
    showFeatureRatingWidget,
    submitFeatureRating,
    hideFeatureRatingWidget: hideWidget,
    isFeatureRatingWidgetVisible: showWidget,
    featureRatingData
  };
}

// Hook for bug report widget
export function useBugReportWidget() {
  const { showWidgetManually, submitFeedback, hideWidget, showWidget } = useFeedbackWidget();
  const [bugReportData, setBugReportData] = useState<any>(null);

  const showBugReportWidget = useCallback(() => {
    setBugReportData(null);
    showWidgetManually('bug_report');
  }, [showWidgetManually]);

  const submitBugReport = useCallback(async (bugData: any) => {
    setBugReportData(bugData);
    
    await submitFeedback({
      feedback_type: 'bug_report',
      message: bugData.description,
      category: 'bug_report',
      priority: determineBugPriority(bugData.severity),
      context: {
        ...bugData,
        reported_via: 'widget'
      }
    });
  }, [submitFeedback]);

  return {
    showBugReportWidget,
    submitBugReport,
    hideBugReportWidget: hideWidget,
    isBugReportWidgetVisible: showWidget,
    bugReportData
  };
}

// Helper function to determine bug priority
const determineBugPriority = (severity: string): 'low' | 'medium' | 'high' | 'critical' => {
  switch (severity) {
    case 'critical': return 'critical';
    case 'high': return 'high';
    case 'medium': return 'medium';
    default: return 'low';
  }
};

// Hook for monitoring feedback triggers
export function useFeedbackTriggers() {
  const [triggerStats, setTriggerStats] = useState({
    totalTriggers: 0,
    successfulSubmissions: 0,
    widgetTypeBreakdown: {} as Record<string, number>,
    timeToTrigger: [] as number[]
  });

  const trackTrigger = useCallback((widgetType: string, triggerTime: number) => {
    setTriggerStats(prev => ({
      ...prev,
      totalTriggers: prev.totalTriggers + 1,
      widgetTypeBreakdown: {
        ...prev.widgetTypeBreakdown,
        [widgetType]: (prev.widgetTypeBreakdown[widgetType] || 0) + 1
      },
      timeToTrigger: [...prev.timeToTrigger, triggerTime]
    }));
  }, []);

  const trackSubmission = useCallback(() => {
    setTriggerStats(prev => ({
      ...prev,
      successfulSubmissions: prev.successfulSubmissions + 1
    }));
  }, []);

  const getSubmissionRate = useCallback((): number => {
    if (triggerStats.totalTriggers === 0) return 0;
    return (triggerStats.successfulSubmissions / triggerStats.totalTriggers) * 100;
  }, [triggerStats]);

  const getAverageTimeToTrigger = useCallback((): number => {
    if (triggerStats.timeToTrigger.length === 0) return 0;
    return triggerStats.timeToTrigger.reduce((sum, time) => sum + time, 0) / triggerStats.timeToTrigger.length;
  }, [triggerStats]);

  return {
    triggerStats,
    trackTrigger,
    trackSubmission,
    getSubmissionRate,
    getAverageTimeToTrigger
  };
}

export default useFeedbackWidget;