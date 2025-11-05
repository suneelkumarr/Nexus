// Core Types for Metrics Tracking System

export interface EventData {
  id: string;
  userId: string;
  eventType: EventType;
  timestamp: number;
  properties: Record<string, any>;
  sessionId: string;
  page?: string;
  userAgent?: string;
}

export type EventType = 
  | 'page_view'
  | 'user_signup'
  | 'user_login'
  | 'onboarding_start'
  | 'onboarding_complete'
  | 'onboarding_step'
  | 'feature_use'
  | 'feature_engagement'
  | 'upgrade_attempt'
  | 'upgrade_success'
  | 'upgrade_failure'
  | 'subscription_cancel'
  | 'feature_limit_reached'
  | 'search_query'
  | 'content_export'
  | 'dashboard_interaction'
  | 'help_view'
  | 'error_occurred';

export interface FunnelStep {
  stepName: string;
  eventType: EventType;
  description: string;
  required: boolean;
  timeLimit?: number; // seconds
}

export interface FunnelDefinition {
  id: string;
  name: string;
  description: string;
  steps: FunnelStep[];
  conversionGoal: EventType;
  segments?: string[];
}

export interface ConversionFunnel {
  funnelId: string;
  totalUsers: number;
  completedUsers: number;
  conversionRate: number;
  stepAnalytics: StepAnalytics[];
  segmentBreakdown?: Record<string, FunnelSegment>;
  timeToComplete?: number;
}

export interface StepAnalytics {
  stepName: string;
  totalUsers: number;
  completionRate: number;
  dropoffRate: number;
  averageTime: number; // milliseconds
  nextStepCorrelations: Record<string, number>;
}

export interface FunnelSegment {
  users: number;
  conversionRate: number;
  stepAnalytics: StepAnalytics[];
}

export interface PerformanceMetrics {
  pageLoadTime: Record<string, number>; // page -> load time
  apiResponseTime: Record<string, { count: number; average: number; p95: number }>;
  errorRates: Record<string, { count: number; rate: number }>;
  userEngagement: {
    sessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
    returnUserRate: number;
  };
  systemMetrics: {
    memoryUsage: number;
    cpuUsage: number;
    activeUsers: number;
    throughput: number; // requests per second
  };
}

export interface ABTestVariant {
  id: string;
  name: string;
  trafficPercentage: number;
  conversionRate?: number;
  sampleSize: number;
  confidence: number;
  statisticalSignificance: boolean;
  results: TestResults;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  startDate: number;
  endDate?: number;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variants: ABTestVariant[];
  primaryMetric: string;
  segments?: string[];
  winner?: string;
}

export interface TestResults {
  conversions: number;
  visitors: number;
  conversionRate: number;
  revenue?: number;
  confidenceInterval: [number, number];
  pValue: number;
  uplift: number; // percentage improvement over control
}

export interface MetricAggregation {
  metricName: string;
  value: number;
  timestamp: number;
  userId?: string;
  segment?: string;
  properties?: Record<string, any>;
}

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  schedule: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  metrics: string[];
  segments?: string[];
  filters?: Record<string, any>;
  format: 'pdf' | 'excel' | 'csv' | 'json';
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'funnel' | 'ab_test' | 'table';
  title: string;
  description?: string;
  metrics: string[];
  timeframe: string;
  refreshInterval: number;
  config: Record<string, any>;
  position: { x: number; y: number; width: number; height: number };
}

export interface UserSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  userCount: number;
}

export interface SegmentCriteria {
  planType?: 'free' | 'pro' | 'enterprise';
  registrationDate?: { start: number; end: number };
  lastActivity?: { start: number; end: number };
  featureUsage?: Record<string, { min: number; max: number }>;
  country?: string[];
  customProperties?: Record<string, any>;
}

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

// Specialized Instagram Analytics Types
export interface InstagramMetrics {
  accountId: string;
  followers: number;
  posts: number;
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
  };
  reach: {
    impressions: number;
    reach: number;
    impressionsPerDay: Record<string, number>;
  };
  stories: {
    views: number;
    completionRate: number;
  };
  demographics: {
    age: Record<string, number>;
    gender: Record<string, number>;
    country: Record<string, number>;
  };
}