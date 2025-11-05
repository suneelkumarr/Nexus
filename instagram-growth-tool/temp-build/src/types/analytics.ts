// Analytics and KPI Types
export interface KPIMetric {
  id: string;
  title: string;
  value: number | string;
  previousValue?: number | string;
  trend?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  isPercentage?: boolean;
  format?: 'number' | 'percentage' | 'currency' | 'compact';
}

export interface KPIOverview {
  totalFollowers: KPIMetric;
  engagementRate: KPIMetric;
  postReach: KPIMetric;
  totalLikes: KPIMetric;
  totalComments: KPIMetric;
}

export interface DateRange {
  start: Date;
  end: Date;
  label: string;
  value: string;
}

export interface DashboardFilters {
  dateRange: DateRange;
  selectedAccount: string | null;
  isRefreshing: boolean;
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'excel' | 'json' | 'chart';
  dateRange: DateRange;
  includeCharts: boolean;
  includeAnalytics: boolean;
  selectedMetrics: string[];
  template?: 'executive' | 'detailed' | 'custom';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
}

export interface InstagramAccount {
  id: string;
  username: string;
  display_name: string;
  profile_picture_url?: string;
  follower_count: number;
  following_count: number;
  media_count: number;
  is_business: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  followers: number;
  engagementRate: number;
  reach: number;
  likes: number;
  comments: number;
  growth: {
    followers: number;
    engagement: number;
    reach: number;
    likes: number;
    comments: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

export interface ShareData {
  type: 'email' | 'social' | 'link' | 'qr';
  platform?: string;
  url?: string;
  timestamp: Date;
  recipient?: string;
}

export interface ScheduledReport {
  id: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  formats: string[];
  recipients?: string[];
  active: boolean;
  createdAt: Date;
}

export interface PresentationData {
  mode: 'dashboard' | 'report' | 'comparison';
  fullscreen: boolean;
  autoAdvance: boolean;
  duration: number;
}