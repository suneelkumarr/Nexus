// Layout variants
export { CardBasedInsights } from './layouts/CardBasedInsights';
export { ListBasedInsights } from './layouts/ListBasedInsights';

// Presentation variants
export { SummaryFirstInsights } from './presentation/SummaryFirstInsights';
export { DetailFirstInsights } from './presentation/DetailFirstInsights';
export { VisualHeavyInsights } from './presentation/VisualHeavyInsights';
export { TextFocusedInsights } from './presentation/TextFocusedInsights';

// Interaction variants
export { InteractiveDrillDownInsights } from './interactions/InteractiveDrillDownInsights';
export { StaticSummaryInsights } from './interactions/StaticSummaryInsights';

// Categorization variants
export { TypeCategorizedInsights } from './categorization/TypeCategorizedInsights';
export { PriorityCategorizedInsights } from './categorization/PriorityCategorizedInsights';

// Re-export types
export type {
  InstagramMetrics,
  TimeSeriesData,
  Insight,
  InsightCategory,
  InsightSummary,
  LayoutType,
  PresentationStyle,
  InteractionType,
  CategorizationStrategy,
  BaseInsightComponentProps,
  InteractiveInsightProps,
  VisualInsightProps
} from '../types';

// Variant selector component
export { InsightVariantsDemo } from './InsightVariantsDemo';