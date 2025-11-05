export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  avatar?: string;
  permissions: string[];
}

export interface Variant {
  id: string;
  name: string;
  description: string;
  trafficAllocation: number;
  conversionRate: number;
  visitors: number;
  conversions: number;
  revenue: number;
  isControl: boolean;
  config: Record<string, any>;
  color: string;
  icon?: string;
}

export interface TargetAudience {
  demographic?: {
    ageRange?: [number, number];
    gender?: string[];
    income?: string;
    education?: string[];
  };
  geographic?: {
    countries?: string[];
    regions?: string[];
    cities?: string[];
  };
  device?: {
    desktop?: boolean;
    mobile?: boolean;
    tablet?: boolean;
  };
  behavior?: {
    newUsers?: boolean;
    returningUsers?: boolean;
    highValue?: boolean;
    specificPages?: string[];
    referrerType?: string[];
  };
  percentage: number; // Percentage of eligible users to include
  includeRules?: string[];
  excludeRules?: string[];
}

export interface Metric {
  id: string;
  name: string;
  type: 'conversion' | 'revenue' | 'engagement' | 'retention' | 'custom';
  eventName: string;
  aggregation: 'sum' | 'average' | 'percentage' | 'count';
  isPrimary: boolean;
  targetValue?: number;
  unit?: string;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed' | 'cancelled' | 'scheduled';
  hypothesis: string;
  variants: Variant[];
  targetAudience: TargetAudience;
  metrics: Metric[];
  startDate: string;
  endDate?: string;
  duration: number;
  minimumSampleSize: number;
  statisticalSignificance: number;
  confidenceLevel: number;
  statisticalPower: number;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  schedule?: {
    startAt?: string;
    endAt?: string;
    timezone: string;
    autoStart?: boolean;
    autoStop?: boolean;
  };
  tags: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  owner: string;
  collaborators: string[];
  category: string;
  templateId?: string;
  parentTestId?: string; // For cloned tests
  isArchived: boolean;
  statisticalSettings?: {
    testType: 'two-tailed' | 'one-tailed';
    minDetectableEffect: number;
    nullHypothesis: string;
    alternativeHypothesis: string;
    controlGroup: string;
    baselineConversionRate?: number;
  };
  clonedFrom?: string;
  archivedAt?: string;
  notes?: string;
}

export interface StatisticalResult {
  variants: {
    [variantId: string]: {
      conversions: number;
      visitors: number;
      conversionRate: number;
      revenue: number;
      avgRevenuePerUser: number;
      confidenceInterval: [number, number];
    };
  };
  comparisons: {
    [comparisonId: string]: {
      controlId: string;
      variantId: string;
      improvement: number;
      significanceLevel: number;
      pValue: number;
      zScore: number;
      confidenceInterval: [number, number];
      power: number;
      isSignificant: boolean;
      testType: 'two-tailed' | 'one-tailed';
      effectSize: {
        cohen: number;
        relative: number;
        absolute: number;
      };
    };
  };
  overall: {
    requiredSampleSize: {
      perVariant: number;
      total: number;
    };
    currentSampleSize: {
      perVariant: number;
      total: number;
    };
    daysRunning: number;
    estimatedDaysToSignificance: number;
    isConclusive: boolean;
    recommendation: 'run_longer' | 'declare_winner' | 'declare_loser' | 'stop_poor_performer' | 'inconclusive';
    confidence: number;
    winner?: string;
    loser?: string;
  };
  assumptions: {
    minDetectableEffect: number;
    baselineRate: number;
    alphaLevel: number;
    statisticalPower: number;
    areAssumptionsMet: boolean;
  };
}

export interface DashboardMetrics {
  totalTests: number;
  activeTests: number;
  completedTests: number;
  avgConversionLift: number;
  totalRevenue: number;
  winningTests: number;
  runningTests: number;
  scheduledTests: number;
  pausedTests: number;
  cancelledTests: number;
  draftsCount: number;
  topPerformingTest?: ABTest;
  recentActivity: ActivityLog[];
  performanceSummary: {
    thisWeek: {
      testsStarted: number;
      testsCompleted: number;
      avgLift: number;
      revenueGenerated: number;
    };
    thisMonth: {
      testsStarted: number;
      testsCompleted: number;
      avgLift: number;
      revenueGenerated: number;
    };
  };
}

export interface ActivityLog {
  id: string;
  testId: string;
  testName: string;
  userId: string;
  userName: string;
  action: 'created' | 'started' | 'paused' | 'resumed' | 'stopped' | 'completed' | 'cloned' | 'archived' | 'updated';
  timestamp: string;
  details?: string;
  metadata?: Record<string, any>;
}

export interface TestResult {
  testId: string;
  timestamp: string;
  variants: {
    [variantId: string]: {
      visitors: number;
      conversions: number;
      revenue: number;
      bounceRate: number;
      timeOnPage: number;
      conversionRate: number;
      revenuePerUser: number;
      cumulativeData: {
        visitors: number;
        conversions: number;
        revenue: number;
      };
    };
  };
  overall: {
    totalVisitors: number;
    totalConversions: number;
    totalRevenue: number;
    overallConversionRate: number;
    statisticalSignificance: number;
    isSignificant: boolean;
  };
}

export interface ExportConfig {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  testIds: string[];
  includeRawData: boolean;
  includeStatisticalAnalysis: boolean;
  includeVisualizations: boolean;
  groupBy?: 'hour' | 'day' | 'week' | 'month';
  includeActivityLog: boolean;
  includeRecommendations: boolean;
  customFields?: string[];
}

export interface ExportJob {
  id: string;
  testIds: string[];
  format: ExportConfig['format'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  downloadUrl?: string;
  fileSize?: number;
  recordCount?: number;
  createdBy: string;
  config: ExportConfig;
}

export interface ScheduledAction {
  id: string;
  testId: string;
  action: 'start' | 'stop' | 'pause' | 'resume' | 'archive' | 'clone';
  scheduledAt: string;
  timezone: string;
  status: 'scheduled' | 'executing' | 'completed' | 'failed' | 'cancelled';
  createdBy: string;
  reason?: string;
  metadata?: Record<string, any>;
  executionLog?: {
    executedAt?: string;
    duration?: number;
    result?: string;
    error?: string;
  };
}

export interface TestTemplate {
  id: string;
  name: string;
  description: string;
  template: Partial<ABTest>;
  category: string;
  usageCount: number;
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  createdBy: string;
}

export interface NotificationConfig {
  id: string;
  testId: string;
  type: 'significance_reached' | 'sample_size_achieved' | 'test_completed' | 'anomaly_detected';
  channels: ('email' | 'slack' | 'webhook')[];
  recipients: string[];
  isEnabled: boolean;
  conditions?: Record<string, any>;
}

export interface UserSegment {
  id: string;
  name: string;
  description: string;
  criteria: TargetAudience;
  userCount: number;
  createdAt: string;
  createdBy: string;
}

export interface RealTimeUpdate {
  type: 'metric_update' | 'test_status_change' | 'new_conversion' | 'alert';
  testId: string;
  variantId?: string;
  timestamp: string;
  data: Record<string, any>;
}

export interface BulkOperation {
  id: string;
  type: 'start' | 'stop' | 'pause' | 'resume' | 'archive' | 'delete' | 'export';
  testIds: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  createdBy: string;
  results?: {
    successful: string[];
    failed: { testId: string; error: string }[];
  };
}

export interface DashboardConfig {
  refreshInterval: number; // seconds
  defaultTimeRange: string;
  showSampleSizeWarnings: boolean;
  showStatisticalSignificanceBadges: boolean;
  autoRefresh: boolean;
  chartType: 'line' | 'bar' | 'area';
  theme: 'light' | 'dark';
  notifications: {
    enabled: boolean;
    sound: boolean;
    desktop: boolean;
  };
}