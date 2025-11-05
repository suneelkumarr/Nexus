import { 
  FunnelDefinition, 
  ConversionFunnel, 
  StepAnalytics, 
  EventData, 
  EventType,
  FunnelStep
} from '../types/index.js';

/**
 * Conversion Funnel Analyzer
 * Analyzes user journeys and calculates conversion metrics
 */
export class FunnelAnalyzer {
  private funnels: Map<string, FunnelDefinition> = new Map();
  private userJourneys: Map<string, EventData[]> = new Map();
  private eventData: EventData[] = [];

  /**
   * Register a new funnel definition
   */
  registerFunnel(funnel: FunnelDefinition): void {
    this.funnels.set(funnel.id, funnel);
  }

  /**
   * Process user events for funnel analysis
   */
  processEvents(events: EventData[]): void {
    this.eventData.push(...events);
    
    // Group events by user
    const userEvents = this.groupEventsByUser(events);
    
    // Update user journeys
    Object.entries(userEvents).forEach(([userId, events]) => {
      const existingJourney = this.userJourneys.get(userId) || [];
      this.userJourneys.set(userId, [...existingJourney, ...events].sort((a, b) => a.timestamp - b.timestamp));
    });
  }

  /**
   * Analyze a specific funnel
   */
  analyzeFunnel(funnelId: string, timeframe?: { start: number; end: number }): ConversionFunnel {
    const funnel = this.funnels.get(funnelId);
    if (!funnel) {
      throw new Error(`Funnel ${funnelId} not found`);
    }

    const filteredEvents = this.filterEventsByTimeframe(timeframe);
    const userJourneys = this.groupEventsByUser(filteredEvents);

    const funnelResults = this.analyzeFunnelJourney(funnel, userJourneys);

    return {
      funnelId,
      totalUsers: funnelResults.totalUsers,
      completedUsers: funnelResults.completedUsers,
      conversionRate: funnelResults.conversionRate,
      stepAnalytics: funnelResults.stepAnalytics,
      segmentBreakdown: funnelResults.segmentBreakdown,
      timeToComplete: funnelResults.timeToComplete,
    };
  }

  /**
   * Analyze funnel with segment breakdown
   */
  analyzeFunnelWithSegments(
    funnelId: string, 
    segments: Record<string, (event: EventData) => boolean>,
    timeframe?: { start: number; end: number }
  ): ConversionFunnel {
    const baseAnalysis = this.analyzeFunnel(funnelId, timeframe);
    
    const segmentedResults: Record<string, any> = {};
    
    Object.entries(segments).forEach(([segmentName, filter]) => {
      const segmentEvents = this.eventData
        .filter(filter)
        .filter(event => {
          if (!timeframe) return true;
          return event.timestamp >= timeframe.start && event.timestamp <= timeframe.end;
        });
      
      const segmentUserEvents = this.groupEventsByUser(segmentEvents);
      const segmentAnalysis = this.analyzeFunnelJourney(this.funnels.get(funnelId)!, segmentUserEvents);
      
      segmentedResults[segmentName] = {
        users: segmentAnalysis.totalUsers,
        conversionRate: segmentAnalysis.conversionRate,
        stepAnalytics: segmentAnalysis.stepAnalytics,
      };
    });

    return {
      ...baseAnalysis,
      segmentBreakdown: segmentedResults,
    };
  }

  /**
   * Compare multiple funnels side by side
   */
  compareFunnels(funnelIds: string[], timeframe?: { start: number; end: number }): Record<string, ConversionFunnel> {
    const results: Record<string, ConversionFunnel> = {};
    
    funnelIds.forEach(funnelId => {
      results[funnelId] = this.analyzeFunnel(funnelId, timeframe);
    });

    return results;
  }

  /**
   * Calculate step-by-step drop-off rates
   */
  calculateDropOffRates(funnelId: string): Array<{
    fromStep: string;
    toStep: string;
    dropoffRate: number;
    users: number;
  }> {
    const funnel = this.funnels.get(funnelId);
    if (!funnel) throw new Error(`Funnel ${funnelId} not found`);

    const userJourneys = this.groupEventsByUser(this.eventData);
    const dropoffAnalysis: Array<{
      fromStep: string;
      toStep: string;
      dropoffRate: number;
      users: number;
    }> = [];

    for (let i = 0; i < funnel.steps.length - 1; i++) {
      const currentStep = funnel.steps[i];
      const nextStep = funnel.steps[i + 1];
      
      let usersAtStep = 0;
      let usersProceeded = 0;

      Object.values(userJourneys).forEach(events => {
        const stepEvent = events.find(event => event.eventType === currentStep.eventType);
        if (stepEvent) {
          usersAtStep++;
          const nextEvent = events.find(event => 
            event.timestamp > stepEvent.timestamp && 
            event.eventType === nextStep.eventType
          );
          if (nextEvent) {
            usersProceeded++;
          }
        }
      });

      dropoffAnalysis.push({
        fromStep: currentStep.stepName,
        toStep: nextStep.stepName,
        dropoffRate: usersAtStep > 0 ? (usersAtStep - usersProceeded) / usersAtStep : 0,
        users: usersAtStep,
      });
    }

    return dropoffAnalysis;
  }

  /**
   * Private helper methods
   */
  private groupEventsByUser(events: EventData[]): Record<string, EventData[]> {
    return events.reduce((acc, event) => {
      if (!acc[event.userId]) {
        acc[event.userId] = [];
      }
      acc[event.userId].push(event);
      return acc;
    }, {} as Record<string, EventData[]>);
  }

  private filterEventsByTimeframe(timeframe?: { start: number; end: number }): EventData[] {
    if (!timeframe) return this.eventData;
    
    return this.eventData.filter(event => 
      event.timestamp >= timeframe.start && event.timestamp <= timeframe.end
    );
  }

  private analyzeFunnelJourney(
    funnel: FunnelDefinition, 
    userJourneys: Record<string, EventData[]>
  ): {
    totalUsers: number;
    completedUsers: number;
    conversionRate: number;
    stepAnalytics: StepAnalytics[];
    segmentBreakdown?: Record<string, any>;
    timeToComplete?: number;
  } {
    const totalUsers = Object.keys(userJourneys).length;
    let completedUsers = 0;
    const stepAnalytics: StepAnalytics[] = [];
    
    // Analyze each step
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      let usersAtStep = 0;
      let totalTime = 0;
      const stepEventMap: Map<string, EventData> = new Map();
      
      // Find users who completed this step
      Object.entries(userJourneys).forEach(([userId, events]) => {
        const stepEvent = events.find(event => event.eventType === step.eventType);
        if (stepEvent) {
          usersAtStep++;
          stepEventMap.set(userId, stepEvent);
          
          // Calculate time from previous step
          if (i > 0) {
            const previousStep = funnel.steps[i - 1];
            const previousEvent = events.find(event => event.eventType === previousStep.eventType);
            if (previousEvent) {
              totalTime += stepEvent.timestamp - previousEvent.timestamp;
            }
          }
        }
      });

      // Check if user completed entire funnel
      if (i === funnel.steps.length - 1) {
        completedUsers = usersAtStep;
      }

      // Calculate correlations with next step
      const nextStepCorrelations: Record<string, number> = {};
      if (i < funnel.steps.length - 1) {
        const nextStep = funnel.steps[i + 1];
        let correlatedUsers = 0;
        
        stepEventMap.forEach((event, userId) => {
          const userEvents = userJourneys[userId];
          const nextEvent = userEvents.find(e => 
            e.timestamp > event.timestamp && e.eventType === nextStep.eventType
          );
          if (nextEvent) correlatedUsers++;
        });
        
        nextStepCorrelations[nextStep.stepName] = usersAtStep > 0 ? 
          correlatedUsers / usersAtStep : 0;
      }

      stepAnalytics.push({
        stepName: step.stepName,
        totalUsers: usersAtStep,
        completionRate: totalUsers > 0 ? usersAtStep / totalUsers : 0,
        dropoffRate: i > 0 ? 1 - (usersAtStep / stepAnalytics[i - 1].totalUsers) : 0,
        averageTime: totalTime / usersAtStep || 0,
        nextStepCorrelations,
      });
    }

    // Calculate overall conversion rate
    const conversionRate = totalUsers > 0 ? completedUsers / totalUsers : 0;

    // Calculate time to complete funnel
    let totalCompletionTime = 0;
    let usersWhoCompleted = 0;
    
    if (funnel.steps.length > 0) {
      const finalStep = funnel.steps[funnel.steps.length - 1];
      const firstStep = funnel.steps[0];
      
      Object.entries(userJourneys).forEach(([userId, events]) => {
        const firstEvent = events.find(event => event.eventType === firstStep.eventType);
        const finalEvent = events.find(event => event.eventType === finalStep.eventType);
        
        if (firstEvent && finalEvent) {
          totalCompletionTime += finalEvent.timestamp - firstEvent.timestamp;
          usersWhoCompleted++;
        }
      });
    }

    return {
      totalUsers,
      completedUsers,
      conversionRate,
      stepAnalytics,
      timeToComplete: usersWhoCompleted > 0 ? totalCompletionTime / usersWhoCompleted : undefined,
    };
  }
}

/**
 * Pre-configured funnels for common use cases
 */
export const predefinedFunnels = {
  freeToProConversion: {
    id: 'free-to-pro-conversion',
    name: 'Free to Pro Conversion',
    description: 'Track users converting from free to pro plan',
    steps: [
      {
        stepName: 'Sign Up',
        eventType: 'user_signup',
        description: 'User completes registration',
        required: true,
      },
      {
        stepName: 'Onboarding Start',
        eventType: 'onboarding_start',
        description: 'User begins onboarding process',
        required: true,
      },
      {
        stepName: 'Onboarding Complete',
        eventType: 'onboarding_complete',
        description: 'User completes onboarding',
        required: true,
      },
      {
        stepName: 'Feature Discovery',
        eventType: 'feature_use',
        description: 'User uses core features',
        required: true,
      },
      {
        stepName: 'Upgrade Attempt',
        eventType: 'upgrade_attempt',
        description: 'User initiates upgrade process',
        required: true,
      },
      {
        stepName: 'Upgrade Success',
        eventType: 'upgrade_success',
        description: 'User successfully upgrades to pro',
        required: true,
      },
    ],
    conversionGoal: 'upgrade_success',
  },

  onboardingCompletion: {
    id: 'onboarding-completion',
    name: 'Onboarding Completion',
    description: 'Track onboarding process completion rates',
    steps: [
      {
        stepName: 'Onboarding Start',
        eventType: 'onboarding_start',
        description: 'User begins onboarding',
        required: true,
      },
      {
        stepName: 'Account Setup',
        eventType: 'onboarding_step',
        description: 'User completes account setup',
        required: true,
        timeLimit: 300, // 5 minutes
      },
      {
        stepName: 'Profile Configuration',
        eventType: 'onboarding_step',
        description: 'User configures profile',
        required: true,
        timeLimit: 600, // 10 minutes
      },
      {
        stepName: 'Feature Tutorial',
        eventType: 'onboarding_step',
        description: 'User completes feature tutorial',
        required: true,
        timeLimit: 900, // 15 minutes
      },
      {
        stepName: 'Onboarding Complete',
        eventType: 'onboarding_complete',
        description: 'User completes onboarding',
        required: true,
      },
    ],
    conversionGoal: 'onboarding_complete',
  },

  featureAdoption: {
    id: 'feature-adoption',
    name: 'Feature Adoption',
    description: 'Track adoption of key features',
    steps: [
      {
        stepName: 'User Login',
        eventType: 'user_login',
        description: 'User logs in',
        required: true,
      },
      {
        stepName: 'Dashboard View',
        eventType: 'page_view',
        description: 'User views dashboard',
        required: true,
      },
      {
        stepName: 'Feature Use',
        eventType: 'feature_use',
        description: 'User uses a feature',
        required: true,
      },
      {
        stepName: 'Feature Engagement',
        eventType: 'feature_engagement',
        description: 'User engages with feature',
        required: true,
      },
    ],
    conversionGoal: 'feature_engagement',
  },
};