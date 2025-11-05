import { EventData, EventType, AnalyticsEvent } from '../types/index.js';

/**
 * Core Event Tracking System
 * Handles event collection, storage, and analytics
 */
export class EventTracker {
  private eventBuffer: EventData[] = [];
  private flushInterval: number = 5000; // 5 seconds
  private maxBufferSize: number = 100;
  private sessionId: string;
  private userId: string | null = null;

  constructor(userId?: string) {
    this.sessionId = this.generateSessionId();
    if (userId) this.userId = userId;
    
    // Auto-flush buffer periodically
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Track a single event
   */
  track(eventType: EventType, properties: Record<string, any> = {}): void {
    const event: EventData = {
      id: this.generateEventId(),
      userId: this.userId || this.getAnonymousUserId(),
      eventType,
      timestamp: Date.now(),
      properties: {
        ...properties,
        sessionId: this.sessionId,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      },
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    };

    this.addToBuffer(event);
  }

  /**
   * Track multiple events in batch
   */
  trackBatch(events: Array<{ type: EventType; properties?: Record<string, any> }>): void {
    const eventBatch: EventData[] = events.map(({ type, properties }) => ({
      id: this.generateEventId(),
      userId: this.userId || this.getAnonymousUserId(),
      eventType: type,
      timestamp: Date.now(),
      properties: {
        ...properties,
        sessionId: this.sessionId,
        page: window.location.pathname,
        userAgent: navigator.userAgent,
      },
      sessionId: this.sessionId,
      page: window.location.pathname,
      userAgent: navigator.userAgent,
    }));

    this.eventBuffer.push(...eventBatch);
    this.checkBufferSize();
  }

  /**
   * Set user ID for consistent tracking
   */
  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Get current session information
   */
  getSessionInfo(): { sessionId: string; userId: string | null; startTime: number } {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: parseInt(this.sessionId.split('-')[0]),
    };
  }

  /**
   * Manually flush the event buffer
   */
  flush(): void {
    if (this.eventBuffer.length === 0) return;

    const eventsToSend = [...this.eventBuffer];
    this.eventBuffer = [];

    // Send to analytics endpoint
    this.sendEvents(eventsToSend).catch(error => {
      console.error('Failed to send events:', error);
      // Re-add failed events to buffer
      this.eventBuffer.unshift(...eventsToSend);
    });
  }

  /**
   * Private helper methods
   */
  private addToBuffer(event: EventData): void {
    this.eventBuffer.push(event);
    this.checkBufferSize();
  }

  private checkBufferSize(): void {
    if (this.eventBuffer.length >= this.maxBufferSize) {
      this.flush();
    }
  }

  private async sendEvents(events: EventData[]): Promise<void> {
    try {
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error sending events:', error);
      throw error;
    }
  }

  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    const startTime = Date.now();
    return `${startTime}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getAnonymousUserId(): string {
    // Generate or retrieve anonymous user ID
    let anonId = localStorage.getItem('anonymousUserId');
    if (!anonId) {
      anonId = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('anonymousUserId', anonId);
    }
    return anonId;
  }
}

/**
 * Pre-configured event tracking functions for common user actions
 */
export const eventTracking = {
  // User lifecycle events
  trackSignup: (properties?: Record<string, any>) => {
    EventTracker.getInstance().track('user_signup', properties);
  },

  trackLogin: (properties?: Record<string, any>) => {
    EventTracker.getInstance().track('user_login', properties);
  },

  // Onboarding events
  trackOnboardingStart: (properties?: Record<string, any>) => {
    EventTracker.getInstance().track('onboarding_start', properties);
  },

  trackOnboardingStep: (step: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('onboarding_step', {
      ...properties,
      step,
    });
  },

  trackOnboardingComplete: (properties?: Record<string, any>) => {
    EventTracker.getInstance().track('onboarding_complete', properties);
  },

  // Feature engagement
  trackFeatureUse: (featureName: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('feature_use', {
      ...properties,
      featureName,
    });
  },

  trackFeatureEngagement: (featureName: string, duration: number, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('feature_engagement', {
      ...properties,
      featureName,
      duration,
    });
  },

  // Conversion events
  trackUpgradeAttempt: (planType: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('upgrade_attempt', {
      ...properties,
      planType,
    });
  },

  trackUpgradeSuccess: (planType: string, revenue: number, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('upgrade_success', {
      ...properties,
      planType,
      revenue,
    });
  },

  trackUpgradeFailure: (planType: string, reason: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('upgrade_failure', {
      ...properties,
      planType,
      reason,
    });
  },

  // Content and interactions
  trackPageView: (pageName: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('page_view', {
      ...properties,
      pageName,
    });
  },

  trackSearchQuery: (query: string, resultCount: number, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('search_query', {
      ...properties,
      query,
      resultCount,
    });
  },

  trackContentExport: (exportType: string, properties?: Record<string, any>) => {
    EventTracker.getInstance().track('content_export', {
      ...properties,
      exportType,
    });
  },

  // Error tracking
  trackError: (error: Error, context?: Record<string, any>) => {
    EventTracker.getInstance().track('error_occurred', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      context,
    });
  },
};

// Singleton instance management
let trackerInstance: EventTracker | null = null;

export const EventTracker = {
  getInstance: (userId?: string): EventTracker => {
    if (!trackerInstance) {
      trackerInstance = new EventTracker(userId);
    } else if (userId) {
      trackerInstance.setUserId(userId);
    }
    return trackerInstance;
  },
};

// Initialize event tracking
const initEventTracking = () => {
  const tracker = EventTracker.getInstance();
  
  // Track page views
  window.addEventListener('load', () => {
    eventTracking.trackPageView(window.location.pathname);
  });

  // Track navigation
  window.addEventListener('popstate', () => {
    eventTracking.trackPageView(window.location.pathname);
  });

  // Track unhandled errors
  window.addEventListener('error', (event) => {
    eventTracking.trackError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Flush events before page unload
  window.addEventListener('beforeunload', () => {
    tracker.flush();
  });
};

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  initEventTracking();
}