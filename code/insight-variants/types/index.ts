// Core data types for Instagram analytics insights
export interface InstagramMetrics {
  followers: number;
  engagement_rate: number;
  posts: number;
  reach: number;
  impressions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  website_clicks: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  metric: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  type: 'performance' | 'content' | 'audience' | 'growth' | 'engagement' | 'competitive';
  priority: 'high' | 'medium' | 'low';
  impact_score: number;
  confidence_score: number;
  recommendation: string;
  metrics_before?: InstagramMetrics;
  metrics_after?: InstagramMetrics;
  time_horizon: 'immediate' | 'short_term' | 'long_term';
  category: string;
  tags: string[];
  actionable_steps: string[];
  timeframe: string;
  data_points: TimeSeriesData[];
}

export interface InsightCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  insight_count: number;
  avg_impact_score: number;
}

export interface InsightSummary {
  total_insights: number;
  high_priority_count: number;
  categories: InsightCategory[];
  overall_health_score: number;
  recommended_actions: string[];
  key_trends: string[];
}

// Layout variants
export type LayoutType = 'card' | 'list' | 'grid' | 'timeline';

// Presentation variants
export type PresentationStyle = 'summary_first' | 'detail_first' | 'visual_heavy' | 'text_focused';

// Interaction variants
export type InteractionType = 'interactive' | 'static' | 'drill_down' | 'expandable';

// Categorization variants
export type CategorizationStrategy = 'by_type' | 'by_priority' | 'by_impact' | 'by_timeframe' | 'mixed';

// Component props
export interface BaseInsightComponentProps {
  insights: Insight[];
  summary?: InsightSummary;
  layout?: LayoutType;
  presentation?: PresentationStyle;
  interaction?: InteractionType;
  categorization?: CategorizationStrategy;
  showFilters?: boolean;
  showSearch?: boolean;
  onInsightClick?: (insight: Insight) => void;
  onExport?: (format: string) => void;
  className?: string;
}

export interface InteractiveInsightProps extends BaseInsightComponentProps {
  drillDownLevel: number;
  onDrillDown?: (insight: Insight, level: number) => void;
  expandedInsights: string[];
  onToggleExpand?: (insightId: string) => void;
}

export interface VisualInsightProps extends BaseInsightComponentProps {
  chartHeight?: number;
  showAnimations?: boolean;
  colorScheme?: 'default' | 'dark' | 'colorful';
}