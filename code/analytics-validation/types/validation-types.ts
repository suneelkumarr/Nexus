// Analytics Validation System Types

export interface ValidationConfig {
  eventTracking: EventValidationConfig;
  abTesting: ABTestValidationConfig;
  conversionFunnels: FunnelValidationConfig;
  performanceMetrics: PerformanceValidationConfig;
  realtimeDashboards: DashboardValidationConfig;
}

export interface EventValidationConfig {
  enabled: boolean;
  sampleSize: number;
  requiredEvents: string[];
  validationInterval: number; // seconds
  errorThreshold: number; // percentage
  duplicateDetection: boolean;
  timestampTolerance: number; // milliseconds
}

export interface ABTestValidationConfig {
  enabled: boolean;
  minimumSampleSize: number;
  confidenceLevel: number;
  statisticalPower: number;
  maxPValue: number;
  sampleRatioMismatch: {
    enabled: boolean;
    threshold: number; // percentage deviation
  };
  effectSize: {
    minimum: number;
    maximum: number;
  };
  validationInterval: number; // seconds
}

export interface FunnelValidationConfig {
  enabled: boolean;
  minimumUsersPerStep: number;
  maxDropOffRate: number; // percentage
  validationInterval: number; // seconds
  segmentBreakdown: boolean;
  timeWindow: number; // hours
  requiredSteps: string[];
}

export interface PerformanceValidationConfig {
  enabled: boolean;
  alertThresholds: {
    pageLoadTime: number; // milliseconds
    apiResponseTime: number; // milliseconds
    errorRate: number; // percentage
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
  };
  validationInterval: number; // seconds
  slackNotifications: boolean;
  emailNotifications: boolean;
}

export interface DashboardValidationConfig {
  enabled: boolean;
  refreshInterval: number; // seconds
  dataConsistencyChecks: boolean;
  cacheValidation: boolean;
  alertOnStaleData: boolean;
  staleDataThreshold: number; // minutes
}

// Validation Result Types
export interface ValidationResult {
  id: string;
  type: 'event_tracking' | 'ab_testing' | 'conversion_funnel' | 'performance' | 'dashboard';
  status: 'passed' | 'warning' | 'failed';
  timestamp: number;
  duration: number; // milliseconds
  message: string;
  details: Record<string, any>;
  recommendations?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface EventTrackingValidationResult extends ValidationResult {
  type: 'event_tracking';
  details: {
    totalEventsValidated: number;
    invalidEvents: number;
    duplicateEvents: number;
    missingEvents: string[];
    eventValidation: {
      [eventName: string]: {
        expected: number;
        actual: number;
        status: 'passed' | 'failed';
        issues: string[];
      };
    };
  };
}

export interface ABTestValidationResult extends ValidationResult {
  type: 'ab_testing';
  details: {
    testsValidated: number;
    failedTests: string[];
    statisticalIssues: {
      testId: string;
      issues: string[];
      pValue?: number;
      sampleSize?: number;
      power?: number;
    }[];
    sampleRatioMismatches: {
      testId: string;
      expectedRatio: string;
      actualRatio: string;
      deviation: number;
    }[];
  };
}

export interface ConversionFunnelValidationResult extends ValidationResult {
  type: 'conversion_funnel';
  details: {
    funnelsValidated: number;
    problematicFunnels: {
      funnelId: string;
      issue: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      dropOffRate: number;
      stepIssues: {
        stepName: string;
        issue: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
      }[];
    }[];
  };
}

export interface PerformanceValidationResult extends ValidationResult {
  type: 'performance';
  details: {
    metricsValidated: number;
    thresholdViolations: {
      metric: string;
      value: number;
      threshold: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }[];
    performanceScore: number; // 0-100
    recommendations: string[];
  };
}

export interface DashboardValidationResult extends ValidationResult {
  type: 'dashboard';
  details: {
    dashboardsValidated: number;
    staleDataIssues: {
      dashboardId: string;
      lastUpdate: number;
      staleness: number; // minutes
    }[];
    consistencyIssues: {
      dashboardId: string;
      metric: string;
      issue: string;
    }[];
  };
}

// Validation Statistics
export interface ValidationStatistics {
  totalValidations: number;
  passed: number;
  failed: number;
  warnings: number;
  averageDuration: number; // milliseconds
  lastRun: number;
  uptime: number; // percentage
}

export interface ValidationReport {
  id: string;
  generatedAt: number;
  period: {
    start: number;
    end: number;
  };
  summary: ValidationStatistics;
  results: ValidationResult[];
  trends: {
    accuracyTrend: number; // percentage
    performanceTrend: number; // percentage
    issuesTrend: number; // count
  };
  recommendations: string[];
}

// Validation Alert
export interface ValidationAlert {
  id: string;
  timestamp: number;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  source: 'event_tracking' | 'ab_testing' | 'conversion_funnel' | 'performance' | 'dashboard';
  validationResultId: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolved: boolean;
  resolvedAt?: number;
  actions: AlertAction[];
}

export interface AlertAction {
  id: string;
  type: 'email' | 'slack' | 'webhook' | 'dashboard';
  timestamp: number;
  status: 'sent' | 'failed' | 'pending';
  response?: string;
}

// Validation Scheduler
export interface ValidationSchedule {
  id: string;
  name: string;
  type: 'event_tracking' | 'ab_testing' | 'conversion_funnel' | 'performance' | 'dashboard';
  cronExpression: string;
  enabled: boolean;
  config: any;
  lastRun?: number;
  nextRun?: number;
  runCount: number;
  failureCount: number;
}

// Mock Data for Testing
export interface MockEventData {
  id: string;
  userId: string;
  eventType: string;
  timestamp: number;
  properties: Record<string, any>;
  sessionId: string;
}

export interface MockABTestData {
  id: string;
  name: string;
  variants: {
    id: string;
    visitors: number;
    conversions: number;
    conversionRate: number;
  }[];
  startDate: number;
  status: 'running' | 'completed' | 'draft';
}

export interface MockFunnelData {
  funnelId: string;
  steps: {
    name: string;
    users: number;
    dropoffRate: number;
  }[];
  totalUsers: number;
  completedUsers: number;
  conversionRate: number;
}

export interface MockPerformanceData {
  pageLoadTimes: Record<string, number>;
  apiResponseTimes: Record<string, { average: number; p95: number }>;
  errorRates: Record<string, number>;
  systemMetrics: {
    memoryUsage: number;
    cpuUsage: number;
    activeUsers: number;
  };
}
