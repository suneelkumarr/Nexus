// Core conversion and analytics types
export interface ConversionEvent {
  id: string;
  userId: string;
  sessionId: string;
  eventType: 'onboarding_start' | 'onboarding_complete' | 'feature_view' | 'feature_use' | 
             'upgrade_prompt_view' | 'upgrade_prompt_click' | 'upgrade_completion' | 'ab_test_exposure' |
             'checkout_start' | 'payment_complete' | 'trial_start' | 'trial_end';
  timestamp: Date;
  metadata: Record<string, any>;
  abTestVariant?: string;
  source: string;
}

export interface ConversionFunnel {
  id: string;
  name: string;
  steps: FunnelStep[];
  startDate: Date;
  endDate: Date;
  totalUsers: number;
  conversionRate: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  description: string;
  order: number;
  users: number;
  conversionRate: number;
  dropoffRate: number;
  averageTimeToComplete: number; // in minutes
}

export interface UserBehaviorMetrics {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  totalTimeSpent: number; // in minutes
  pagesVisited: string[];
  featuresUsed: string[];
  interactions: InteractionEvent[];
  onboardingCompleted: boolean;
  upgradeInitiated: boolean;
  upgradeCompleted: boolean;
  abTestVariant?: string;
}

export interface InteractionEvent {
  type: 'click' | 'hover' | 'scroll' | 'form_submit' | 'video_play';
  element: string;
  timestamp: Date;
  duration?: number;
  metadata: Record<string, any>;
}

export interface ABTestResult {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  variants: ABTestVariant[];
  startDate: Date;
  endDate?: Date;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled';
  primaryMetric: string;
  significanceLevel: number;
  requiredSampleSize: number;
  results: ABTestAnalysis[];
}

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number; // percentage
  conversions: number;
  visitors: number;
  conversionRate: number;
  revenue: number;
  metrics: Record<string, number>;
}

export interface ABTestAnalysis {
  variantId: string;
  metric: string;
  value: number;
  confidenceInterval: [number, number];
  pValue: number;
  isSignificant: boolean;
  lift: number; // percentage improvement vs control
  liftConfidence: number;
}

export interface SuccessCriteria {
  id: string;
  name: string;
  description: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  operator: '>' | '<' | '=' | '>=' | '<=';
  timeframe: number; // days
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'not_met' | 'met' | 'exceeded' | 'unknown';
  automatedCheck: boolean;
  lastChecked: Date;
}

export interface ROIMetric {
  id: string;
  name: string;
  description: string;
  value: number;
  unit: 'currency' | 'percentage' | 'number';
  calculation: string;
  timeframe: number; // days
  category: 'revenue' | 'cost' | 'conversion' | 'retention' | 'efficiency';
}

export interface ROIAnalysis {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  totalInvestment: number;
  totalRevenue: number;
  netProfit: number;
  roi: number; // percentage
  paybackPeriod: number; // days
  metrics: ROIMetric[];
  breakdown: ROIBreakdown[];
}

export interface ROIBreakdown {
  category: string;
  subcategory: string;
  amount: number;
  percentage: number;
  description: string;
}

export interface ConversionInsights {
  conversionRate: number;
  averageTimeToConvert: number; // days
  topDropOffPoints: string[];
  mostEffectiveFeatures: string[];
  abTestWinners: string[];
  recommendations: ConversionRecommendation[];
}

export interface ConversionRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  confidence: number; // 0-100%
  relatedMetrics: string[];
  implementation: string;
}

export interface DashboardConfig {
  userId: string;
  layout: DashboardWidget[];
  refreshInterval: number; // seconds
  timezone: string;
  theme: 'light' | 'dark';
}

export interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'table' | 'funnel' | 'ab_test' | 'roi';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  config: Record<string, any>;
  dataSource: string;
  refreshRate: number; // seconds
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string;
  type: 'conversion' | 'behavior' | 'ab_test' | 'roi' | 'comprehensive';
  generatedAt: Date;
  period: { start: Date; end: Date };
  data: any;
  visualizations: ReportVisualization[];
  insights: string[];
  recommendations: string[];
  exportFormats: ('pdf' | 'excel' | 'csv')[];
}

export interface ReportVisualization {
  id: string;
  type: 'line' | 'bar' | 'pie' | 'funnel' | 'heatmap' | 'scatter';
  title: string;
  data: any;
  config: Record<string, any>;
}

export interface ConversionGoal {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  unit: 'number' | 'percentage';
  deadline: Date;
  status: 'on_track' | 'at_risk' | 'missed' | 'exceeded';
  metrics: string[];
}

export interface SegmentAnalysis {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  metrics: ConversionMetrics;
  size: number;
  conversionRate: number;
  revenue: number;
}

export interface SegmentCriteria {
  demographics?: Record<string, any>;
  behavior?: Record<string, any>;
  acquisition?: Record<string, any>;
  custom?: Record<string, any>;
}

export interface ConversionMetrics {
  trialStartRate: number;
  trialToPaidRate: number;
  onboardingCompletionRate: number;
  featureAdoptionRate: number;
  churnRate: number;
  lifetimeValue: number;
  averageRevenuePerUser: number;
}

export interface EventTrackingConfig {
  enabled: boolean;
  events: string[];
  batching: boolean;
  batchSize: number;
  flushInterval: number; // seconds
  anonymizeIP: boolean;
  respectDoNotTrack: boolean;
}

export interface ExperimentConfig {
  experimentId: string;
  enabled: boolean;
  variants: string[];
  trafficAllocation: Record<string, number>;
  metrics: string[];
  objectives: string[];
  duration: number; // days
}