// TypeScript types for User Feedback System
// Instagram Analytics Platform

export interface UserFeedback {
  id: string;
  user_id: string;
  feedback_type: 'general' | 'nps' | 'feature_specific' | 'bug_report' | 'improvement_suggestion';
  rating?: number; // 1-10 scale
  sentiment_score?: number; // -1 to 1
  category?: string;
  subcategory?: string;
  message: string;
  context?: FeedbackContext;
  feature_name?: string;
  page_url?: string;
  user_agent?: string;
  session_id?: string;
  created_at: string;
  updated_at: string;
  is_analyzed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  assigned_to?: string;
  tags: string[];
  // Relations
  nps_response?: NPSResponse;
  sentiment_analysis?: SentimentAnalysis;
}

export interface FeedbackContext {
  user_journey_stage?: 'onboarding' | 'active_use' | 'returning_user' | 'churn_risk';
  feature_usage_count?: number;
  session_duration?: number;
  previous_feedback_count?: number;
  account_age_days?: number;
  plan_type?: string;
  device_type?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  referrer?: string;
  custom_context?: Record<string, any>;
}

export interface NPSResponse {
  id: string;
  user_id: string;
  score: number; // 0-10 scale
  reason?: string;
  feedback_id?: string;
  created_at: string;
  user_segment?: string;
  product_usage_days?: number;
}

export interface FeedbackCategory {
  id: string;
  name: string;
  description?: string;
  color_code: string;
  parent_category_id?: string;
  created_at: string;
  // Computed fields
  feedback_count?: number;
  average_rating?: number;
  trend_percentage?: number;
}

export interface FeedbackTrend {
  id: string;
  date: string;
  feedback_type: string;
  category?: string;
  total_count: number;
  average_rating?: number;
  average_sentiment?: number;
  nps_score?: number;
  promoters: number;
  passives: number;
  detractors: number;
  created_at: string;
}

export interface SentimentAnalysis {
  id: string;
  feedback_id: string;
  sentiment_score: number; // -1 to 1
  confidence: number; // 0 to 1
  emotions?: EmotionScores;
  key_phrases?: string[];
  language: string;
  model_version?: string;
  analyzed_at: string;
}

export interface EmotionScores {
  joy?: number;
  anger?: number;
  sadness?: number;
  fear?: number;
  disgust?: number;
  surprise?: number;
  [key: string]: number | undefined;
}

export interface FeedbackResponseTemplate {
  id: string;
  category: string;
  sentiment_range: 'positive' | 'neutral' | 'negative';
  response_text: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeedbackWidgetConfig {
  id: string;
  widget_type: 'nps' | 'feature_rating' | 'bug_report' | 'general_feedback';
  trigger_condition: WidgetTriggerCondition;
  is_active: boolean;
  position: 'bottom_left' | 'bottom_right' | 'top_left' | 'top_right' | 'center';
  title?: string;
  description?: string;
  placeholder_text?: string;
  created_at: string;
  updated_at: string;
}

export interface WidgetTriggerCondition {
  event: 'page_view' | 'feature_use' | 'time_spent' | 'action_completed' | 'manual';
  page?: string;
  pages?: string[];
  feature?: string;
  delay?: number; // milliseconds
  min_session_duration?: number; // seconds
  user_segment?: string[];
  conditions?: Record<string, any>;
}

// Feedback Dashboard Types
export interface FeedbackDashboard {
  overview: DashboardOverview;
  trends: FeedbackTrend[];
  categories: CategoryAnalytics[];
  sentiment_analysis: SentimentAnalytics;
  nps_metrics: NPSMetrics;
  recent_feedback: UserFeedback[];
  action_items: ActionItem[];
}

export interface DashboardOverview {
  total_feedback_count: number;
  average_rating: number;
  average_sentiment: number;
  nps_score: number;
  response_rate: number;
  resolution_rate: number;
  period_change: {
    feedback_count_change: number;
    rating_change: number;
    sentiment_change: number;
    nps_change: number;
  };
}

export interface CategoryAnalytics {
  category: string;
  feedback_count: number;
  average_rating: number;
  average_sentiment: number;
  top_sentiments: Array<{
    sentiment: string;
    count: number;
    percentage: number;
  }>;
  trend_data: Array<{
    date: string;
    count: number;
    sentiment: number;
  }>;
}

export interface SentimentAnalytics {
  overall_sentiment: number;
  sentiment_distribution: {
    positive: number;
    neutral: number;
    negative: number;
  };
  emotional_trends: Array<{
    emotion: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  key_themes: Array<{
    theme: string;
    mentions: number;
    sentiment: number;
  }>;
}

export interface NPSMetrics {
  current_score: number;
  previous_score: number;
  distribution: {
    promoters: number;
    passives: number;
    detractors: number;
  };
  response_rate: number;
  trend_data: Array<{
    date: string;
    score: number;
    responses: number;
  }>;
  segment_scores: Array<{
    segment: string;
    score: number;
    responses: number;
  }>;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  feedback_count: number;
  avg_sentiment: number;
  suggested_actions: string[];
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'dismissed';
}

// Widget Component Props
export interface FeedbackWidgetProps {
  type: 'nps' | 'feature_rating' | 'bug_report' | 'general_feedback';
  trigger?: 'manual' | 'automatic';
  config?: Partial<FeedbackWidgetConfig>;
  onSubmit?: (feedback: Partial<UserFeedback>) => void;
  onClose?: () => void;
  className?: string;
}

export interface NPSWidgetProps {
  onSubmit: (score: number, reason?: string) => void;
  onClose: () => void;
  userSegment?: string;
  showReasonPrompt?: boolean;
  className?: string;
}

export interface FeatureRatingWidgetProps {
  feature: string;
  onSubmit: (rating: number, feedback?: string) => void;
  onClose: () => void;
  ratingLabel?: string;
  showFeedbackInput?: boolean;
  className?: string;
}

export interface BugReportWidgetProps {
  onSubmit: (bugReport: BugReportData) => void;
  onClose: () => void;
  context?: FeedbackContext;
  className?: string;
}

export interface BugReportData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps_to_reproduce: string;
  expected_behavior: string;
  actual_behavior: string;
  browser?: string;
  device_type?: string;
  screenshot_url?: string;
}

// Analytics and Reporting Types
export interface FeedbackAnalytics {
  summary: FeedbackSummary;
  trends: TrendAnalysis;
  categories: CategoryAnalysis[];
  segments: SegmentAnalysis;
  export_data?: ExportData;
}

export interface FeedbackSummary {
  total_responses: number;
  average_rating: number;
  satisfaction_score: number;
  nps_score: number;
  response_rate: number;
  time_period: {
    start: string;
    end: string;
  };
}

export interface TrendAnalysis {
  daily_trends: Array<{
    date: string;
    count: number;
    avg_rating: number;
    avg_sentiment: number;
  }>;
  weekly_trends: Array<{
    week: string;
    count: number;
    avg_rating: number;
    avg_sentiment: number;
  }>;
  monthly_trends: Array<{
    month: string;
    count: number;
    avg_rating: number;
    avg_sentiment: number;
  }>;
}

export interface CategoryAnalysis {
  category: string;
  feedback_count: number;
  avg_rating: number;
  avg_sentiment: number;
  common_themes: string[];
  improvement_suggestions: string[];
}

export interface SegmentAnalysis {
  user_segments: Array<{
    segment: string;
    feedback_count: number;
    avg_rating: number;
    avg_sentiment: number;
    nps_score: number;
  }>;
  feature_segments: Array<{
    feature: string;
    feedback_count: number;
    avg_rating: number;
    satisfaction: number;
  }>;
}

export interface ExportData {
  format: 'csv' | 'pdf' | 'json' | 'xlsx';
  date_range: {
    start: string;
    end: string;
  };
  include_raw_data: boolean;
  include_sentiment_analysis: boolean;
  include_trends: boolean;
}

// API Response Types
export interface APIResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    total_count?: number;
    page?: number;
    limit?: number;
  };
}

export interface FeedbackFilter {
  feedback_type?: string[];
  categories?: string[];
  date_range?: {
    start: string;
    end: string;
  };
  rating_range?: {
    min: number;
    max: number;
  };
  sentiment_range?: {
    min: number;
    max: number;
  };
  status?: string[];
  priority?: string[];
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_previous: boolean;
}