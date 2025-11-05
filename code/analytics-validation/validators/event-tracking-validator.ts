// Event Tracking Validation System
import { EventTrackingValidationResult, MockEventData, EventValidationConfig } from '../types/validation-types';
import { ValidationConfigManager } from '../config/validation-config';

export class EventTrackingValidator {
  private config: EventValidationConfig;
  private configManager: ValidationConfigManager;

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.config = this.configManager.getEventTrackingConfig();
  }

  /**
   * Validate event tracking system
   */
  async validateEventTracking(mockData?: MockEventData[]): Promise<EventTrackingValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get or generate test data
      const events = mockData || this.generateMockEventData();
      
      const validation = {
        totalEventsValidated: 0,
        invalidEvents: 0,
        duplicateEvents: 0,
        missingEvents: [] as string[],
        eventValidation: {} as Record<string, any>
      };

      // Validate event structure
      const structureValidation = this.validateEventStructure(events);
      validation.totalEventsValidated = events.length;
      validation.invalidEvents = structureValidation.invalidCount;

      // Detect duplicates
      if (this.config.duplicateDetection) {
        validation.duplicateEvents = this.detectDuplicateEvents(events);
      }

      // Check required events
      validation.missingEvents = this.checkRequiredEvents(events);

      // Validate individual event types
      for (const eventName of this.config.requiredEvents) {
        const eventData = events.filter(e => e.eventType === eventName);
        validation.eventValidation[eventName] = this.validateEventType(eventName, eventData);
      }

      // Check timestamp consistency
      const timestampIssues = this.validateTimestamps(events);

      // Calculate overall status
      const issues = validation.invalidEvents + validation.duplicateEvents;
      const issuePercentage = (issues / validation.totalEventsValidated) * 100;
      
      let status: 'passed' | 'warning' | 'failed' = 'passed';
      let message = 'Event tracking validation passed successfully';
      
      if (issuePercentage > this.config.errorThreshold) {
        status = 'failed';
        message = `Critical issues found in event tracking: ${issuePercentage.toFixed(1)}% error rate`;
      } else if (issues > 0) {
        status = 'warning';
        message = `Minor issues found in event tracking: ${issuePercentage.toFixed(1)}% error rate`;
      }

      const result: EventTrackingValidationResult = {
        id: `event-tracking-${Date.now()}`,
        type: 'event_tracking',
        status,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message,
        details: {
          ...validation,
          timestampIssues
        },
        recommendations: this.generateEventTrackingRecommendations(validation),
        severity: status === 'failed' ? 'critical' : status === 'warning' ? 'medium' : 'low'
      };

      return result;

    } catch (error) {
      return {
        id: `event-tracking-error-${Date.now()}`,
        type: 'event_tracking',
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `Event tracking validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          totalEventsValidated: 0,
          invalidEvents: 0,
          duplicateEvents: 0,
          missingEvents: [],
          eventValidation: {},
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        recommendations: ['Check event tracking implementation', 'Verify data collection endpoints'],
        severity: 'critical'
      };
    }
  }

  /**
   * Validate individual event structure
   */
  private validateEventStructure(events: MockEventData[]): { invalidCount: number; errors: string[] } {
    const errors: string[] = [];
    let invalidCount = 0;

    for (const event of events) {
      const eventErrors: string[] = [];

      // Check required fields
      if (!event.id || typeof event.id !== 'string') {
        eventErrors.push('Missing or invalid event ID');
      }
      if (!event.userId || typeof event.userId !== 'string') {
        eventErrors.push('Missing or invalid user ID');
      }
      if (!event.eventType || typeof event.eventType !== 'string') {
        eventErrors.push('Missing or invalid event type');
      }
      if (!event.timestamp || typeof event.timestamp !== 'number') {
        eventErrors.push('Missing or invalid timestamp');
      }
      if (!event.sessionId || typeof event.sessionId !== 'string') {
        eventErrors.push('Missing or invalid session ID');
      }

      // Check timestamp is reasonable (not too old/future)
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (event.timestamp < now - maxAge || event.timestamp > now + 60000) {
        eventErrors.push('Timestamp outside acceptable range');
      }

      if (eventErrors.length > 0) {
        invalidCount++;
        errors.push(`Event ${event.id}: ${eventErrors.join(', ')}`);
      }
    }

    return { invalidCount, errors };
  }

  /**
   * Detect duplicate events
   */
  private detectDuplicateEvents(events: MockEventData[]): number {
    const eventMap = new Map<string, MockEventData[]>();

    // Group events by signature (excluding ID and timestamp)
    for (const event of events) {
      const signature = `${event.userId}-${event.eventType}-${JSON.stringify(event.properties)}`;
      if (!eventMap.has(signature)) {
        eventMap.set(signature, []);
      }
      eventMap.get(signature)!.push(event);
    }

    let duplicateCount = 0;
    for (const eventGroup of eventMap.values()) {
      if (eventGroup.length > 1) {
        // Count additional occurrences as duplicates
        duplicateCount += eventGroup.length - 1;
      }
    }

    return duplicateCount;
  }

  /**
   * Check for required events
   */
  private checkRequiredEvents(events: MockEventData[]): string[] {
    const missingEvents: string[] = [];
    const eventTypes = new Set(events.map(e => e.eventType));

    for (const requiredEvent of this.config.requiredEvents) {
      if (!eventTypes.has(requiredEvent)) {
        missingEvents.push(requiredEvent);
      }
    }

    return missingEvents;
  }

  /**
   * Validate specific event types
   */
  private validateEventType(eventName: string, events: MockEventData[]): {
    expected: number;
    actual: number;
    status: 'passed' | 'failed';
    issues: string[];
  } {
    const expectedCount = this.getExpectedEventCount(eventName);
    const actualCount = events.length;
    const issues: string[] = [];

    if (actualCount < expectedCount * 0.1) {
      issues.push(`Very low volume: expected at least ${expectedCount * 0.1}, got ${actualCount}`);
    }

    if (actualCount > expectedCount * 10) {
      issues.push(`Unusually high volume: expected around ${expectedCount}, got ${actualCount}`);
    }

    return {
      expected: expectedCount,
      actual: actualCount,
      status: issues.length > 0 ? 'failed' : 'passed',
      issues
    };
  }

  /**
   * Get expected event count for a given event type
   */
  private getExpectedEventCount(eventType: string): number {
    // This would typically come from historical data or business rules
    const expectedCounts: Record<string, number> = {
      'page_view': 1000,
      'user_signup': 50,
      'user_login': 200,
      'onboarding_start': 45,
      'onboarding_complete': 40,
      'feature_use': 300,
      'feature_engagement': 150,
      'upgrade_attempt': 20,
      'upgrade_success': 10,
      'upgrade_failure': 5
    };

    return expectedCounts[eventType] || 50;
  }

  /**
   * Validate timestamp consistency
   */
  private validateTimestamps(events: MockEventData[]): string[] {
    const issues: string[] = [];
    const timestamps = events.map(e => e.timestamp).sort((a, b) => a - b);

    // Check for events with identical timestamps (potential issue)
    const timestampGroups = new Map<number, number>();
    for (const timestamp of timestamps) {
      const key = Math.floor(timestamp / 1000) * 1000; // Round to nearest second
      timestampGroups.set(key, (timestampGroups.get(key) || 0) + 1);
    }

    for (const [timestamp, count] of timestampGroups.entries()) {
      if (count > 100) {
        issues.push(`Suspicious number of events (${count}) with identical timestamps`);
      }
    }

    // Check for events far in the future
    const now = Date.now();
    const futureEvents = timestamps.filter(t => t > now + 60000);
    if (futureEvents.length > 0) {
      issues.push(`${futureEvents.length} events have timestamps in the future`);
    }

    return issues;
  }

  /**
   * Generate mock event data for testing
   */
  private generateMockEventData(): MockEventData[] {
    const events: MockEventData[] = [];
    const users = Array.from({ length: 100 }, (_, i) => `user-${i}`);
    const sessions = Array.from({ length: 200 }, (_, i) => `session-${i}`);

    for (let i = 0; i < this.config.sampleSize; i++) {
      const userId = users[Math.floor(Math.random() * users.length)];
      const sessionId = sessions[Math.floor(Math.random() * sessions.length)];
      const eventType = this.config.requiredEvents[Math.floor(Math.random() * this.config.requiredEvents.length)];
      
      events.push({
        id: `event-${i}`,
        userId,
        eventType,
        timestamp: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random time in last 24 hours
        properties: {
          page: `/page-${Math.floor(Math.random() * 10)}`,
          feature: `feature-${Math.floor(Math.random() * 5)}`,
          plan: Math.random() > 0.8 ? 'pro' : 'free'
        },
        sessionId
      });
    }

    return events;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateEventTrackingRecommendations(validation: any): string[] {
    const recommendations: string[] = [];

    if (validation.invalidEvents > 0) {
      recommendations.push('Review event data structure validation');
      recommendations.push('Implement stricter event creation validation');
    }

    if (validation.duplicateEvents > 0) {
      recommendations.push('Implement duplicate event detection on client-side');
      recommendations.push('Add event deduplication on server-side');
    }

    if (validation.missingEvents.length > 0) {
      recommendations.push('Verify all required events are being tracked');
      recommendations.push(`Implement tracking for: ${validation.missingEvents.join(', ')}`);
    }

    if (Object.keys(validation.eventValidation).length > 0) {
      const failedValidations = Object.entries(validation.eventValidation)
        .filter(([_, data]: [string, any]) => data.status === 'failed');
      
      if (failedValidations.length > 0) {
        recommendations.push('Review event volume expectations for failed validations');
      }
    }

    if (recommendations.length === 0) {
      recommendations.push('Event tracking system is functioning optimally');
    }

    return recommendations;
  }

  /**
   * Get event tracking health score
   */
  public getEventTrackingHealth(events: MockEventData[]): number {
    const structureValidation = this.validateEventStructure(events);
    const invalidPercentage = (structureValidation.invalidCount / events.length) * 100;
    const duplicatePercentage = (this.detectDuplicateEvents(events) / events.length) * 100;
    
    // Health score: 100% - penalty percentages
    return Math.max(0, 100 - invalidPercentage - duplicatePercentage);
  }
}

export default EventTrackingValidator;
