/**
 * A/B Testing Framework Types and Interfaces
 * Comprehensive TypeScript definitions for A/B testing infrastructure
 */

export interface User {
  id: string;
  email?: string;
  properties?: Record<string, any>;
  createdAt: Date;
}

export interface ExperimentVariant {
  id: string;
  name: string;
  description?: string;
  weight: number; // Traffic allocation percentage (0-100)
  config?: Record<string, any>;
  isControl?: boolean;
}

export interface Experiment {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'archived';
  targetAudience?: TargetAudience;
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  tags?: string[];
  priority?: number; // 1-10, higher numbers = higher priority
}

export interface TargetAudience {
  userProperties?: Record<string, any>;
  includeRules?: string[];
  excludeRules?: string[];
  percentage?: number; // What percentage of eligible users to include
}

export interface ExperimentMetric {
  id: string;
  name: string;
  description?: string;
  type: 'conversion' | 'retention' | 'engagement' | 'revenue' | 'custom';
  eventName: string; // Analytics event name
  aggregation: 'sum' | 'count' | 'average' | 'median' | 'percentage';
  successThreshold?: number;
  isPrimary: boolean;
}

export interface UserAssignment {
  userId: string;
  experimentId: string;
  variantId: string;
  assignedAt: Date;
  trafficBucket: number;
  shouldReassign: boolean; // For cookie/localStorage clearing
}

export interface ExperimentEvent {
  id: string;
  experimentId: string;
  variantId: string;
  userId: string;
  eventName: string;
  eventValue?: number;
  eventData?: Record<string, any>;
  timestamp: Date;
  sessionId?: string;
}

export interface StatisticalResult {
  variantId: string;
  sampleSize: number;
  conversionRate: number;
  confidenceLevel: number;
  pValue: number;
  isSignificant: boolean;
  effectSize: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  power: number;
}

export interface ExperimentResults {
  experimentId: string;
  totalUsers: number;
  variants: StatisticalResult[];
  overallResult: {
    winner?: string;
    isConclusive: boolean;
    recommendedAction: 'continue' | 'ship' | 'rollback';
    reasoning: string[];
  };
  analysisDate: Date;
  confidenceLevel: number;
  minimumDetectableEffect?: number;
}

export interface ABTestConfig {
  experimentId: string;
  variants: Array<{
    name: string;
    trafficPercentage: number;
    config?: Record<string, any>;
  }>;
  targetMetrics: string[];
  testDuration: number; // in days
  minimumSampleSize: number;
  significanceLevel: number; // alpha value (typically 0.05)
  power: number; // statistical power (typically 0.8)
}

export interface ExperimentContext {
  user: User | null;
  activeExperiments: Experiment[];
  userAssignments: UserAssignment[];
  isLoading: boolean;
  error: string | null;
}

export interface ExperimentOverride {
  userId?: string;
  experimentId?: string;
  variantId?: string;
  reason?: string;
  expiresAt?: Date;
}

export interface FunnelStep {
  name: string;
  eventName: string;
  description?: string;
  isRequired: boolean;
}

export interface FunnelExperiment extends Experiment {
  funnelSteps: FunnelStep[];
  targetStep?: string;
}

export interface CohortDefinition {
  name: string;
  description?: string;
  criteria: {
    dateRange?: {
      start: Date;
      end: Date;
    };
    userProperties?: Record<string, any>;
    events?: Array<{
      eventName: string;
      operator: 'occurred' | 'not_occurred';
      withinDays?: number;
    }>;
  };
}

export interface ExperimentCohort {
  cohortId: string;
  experimentId: string;
  cohortDefinition: CohortDefinition;
  participants: string[]; // User IDs
  createdAt: Date;
}

export interface ExperimentFilter {
  status?: Experiment['status'][];
  createdBy?: string[];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  priority?: {
    min?: number;
    max?: number;
  };
}

export interface ExperimentSorting {
  field: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'priority';
  direction: 'asc' | 'desc';
}

export interface ExperimentPagination {
  page: number;
  limit: number;
  total: number;
}

export interface ExperimentListResponse {
  experiments: Experiment[];
  total: number;
  page: number;
  limit: number;
}

export interface ExperimentProgress {
  experimentId: string;
  status: 'running' | 'paused' | 'completed';
  totalUsers: number;
  usersPerVariant: Record<string, number>;
  eventsPerMetric: Record<string, Record<string, number>>;
  estimatedCompletionDate?: Date;
  statisticalPower: number;
  confidenceInterval: Record<string, { lower: number; upper: number }>;
}

export interface ExperimentAlert {
  id: string;
  experimentId: string;
  type: 'statistical_significance' | 'sample_size_reached' | 'test_failure' | 'data_quality';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  actionRequired?: boolean;
}

export interface ExperimentSegment {
  id: string;
  name: string;
  description?: string;
  criteria: Record<string, any>;
  experiments: string[]; // Experiment IDs
  createdAt: Date;
  isActive: boolean;
}

export interface ExperimentInsight {
  id: string;
  experimentId: string;
  type: 'performance' | 'anomaly' | 'recommendation' | 'warning';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface ExperimentExport {
  experimentId: string;
  format: 'csv' | 'json' | 'xlsx';
  data: {
    userAssignments: UserAssignment[];
    events: ExperimentEvent[];
    results: ExperimentResults;
  };
  generatedAt: Date;
}