import React, { useState } from 'react';
import { Insight, InsightSummary, BaseInsightComponentProps } from '../types';
import { 
  // Layout variants
  CardBasedInsights, 
  ListBasedInsights,
  
  // Presentation variants
  SummaryFirstInsights, 
  DetailFirstInsights, 
  VisualHeavyInsights, 
  TextFocusedInsights,
  
  // Interaction variants
  InteractiveDrillDownInsights, 
  StaticSummaryInsights,
  
  // Categorization variants
  TypeCategorizedInsights, 
  PriorityCategorizedInsights
} from './index';

import { 
  LayoutGrid, List, BarChart3, FileText, Zap, MousePointer,
  Type, Target, Filter, Settings
} from 'lucide-react';

type VariantCategory = 'layout' | 'presentation' | 'interaction' | 'categorization';

interface VariantOption {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<BaseInsightComponentProps>;
  icon: React.ReactNode;
  category: VariantCategory;
}

// Mock data generator for testing
const generateMockInsights = (): Insight[] => {
  const insightTemplates = [
    {
      title: "Increase Posting Frequency",
      description: "Your engagement rate increases by 23% when posting 5+ times per week compared to current 3x per week schedule.",
      type: "content" as const,
      priority: "high" as const,
      impact_score: 8,
      confidence_score: 87,
      recommendation: "Implement a content calendar and increase posting frequency to 5-6 times per week for optimal engagement.",
      category: "Content Strategy",
      tags: ["posting", "frequency", "engagement", "schedule"]
    },
    {
      title: "Audience Growth Stagnation",
      description: "Follower growth has plateaued at 2.1% monthly rate. Similar accounts in your niche are growing at 4.7% monthly.",
      type: "growth" as const,
      priority: "high" as const,
      impact_score: 9,
      confidence_score: 92,
      recommendation: "Implement hashtag optimization and cross-platform promotion to accelerate follower acquisition.",
      category: "Growth Strategy",
      tags: ["followers", "growth", "hashtags", "promotion"]
    },
    {
      title: "Peak Engagement Times",
      description: "Your posts perform 34% better when published between 6-8 PM on weekdays, but only 12% better on weekends.",
      type: "engagement" as const,
      priority: "medium" as const,
      impact_score: 6,
      confidence_score: 78,
      recommendation: "Schedule key content during weekday evening hours and reduce weekend posting frequency.",
      category: "Engagement",
      tags: ["timing", "schedule", "engagement", "optimization"]
    },
    {
      title: "Content Mix Imbalance",
      description: "Video content generates 2.3x more engagement than images but only represents 15% of your posts.",
      type: "content" as const,
      priority: "medium" as const,
      impact_score: 7,
      confidence_score: 84,
      recommendation: "Increase video content ratio to 40% of total posts to capitalize on higher engagement rates.",
      category: "Content Strategy",
      tags: ["video", "content mix", "engagement", "format"]
    },
    {
      title: "Competitor Content Analysis",
      description: "Top competitors use 67% more calls-to-action in captions and average 15% higher engagement rates.",
      type: "competitive" as const,
      priority: "low" as const,
      impact_score: 5,
      confidence_score: 76,
      recommendation: "Analyze competitor caption strategies and implement stronger calls-to-action in future posts.",
      category: "Competitive Analysis",
      tags: ["competitors", "captions", "cta", "analysis"]
    },
    {
      title: "Story Engagement Optimization",
      description: "Instagram Stories achieve 3.2x higher engagement when using polls and questions vs. static content.",
      type: "engagement" as const,
      priority: "low" as const,
      impact_score: 4,
      confidence_score: 71,
      recommendation: "Incorporate interactive stickers and question stickers into story strategy to boost engagement.",
      category: "Story Strategy",
      tags: ["stories", "interactive", "stickers", "engagement"]
    }
  ];

  return insightTemplates.map((template, index) => ({
    ...template,
    id: `insight-${index + 1}`,
    timeframe: index % 3 === 0 ? "immediate" : index % 3 === 1 ? "short_term" : "long_term",
    actionable_steps: [
      "Analyze current posting schedule and identify optimal times",
      "Create content calendar for increased frequency",
      "Implement hashtag strategy with mix of popular and niche tags",
      "Monitor engagement metrics and adjust strategy based on performance"
    ],
    timeframe: "2-4 weeks",
    data_points: Array.from({ length: 12 }, (_, i) => ({
      date: new Date(Date.now() - (11 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 100) + 50,
      metric: "engagement"
    }))
  }));
};

const generateMockSummary = (): InsightSummary => ({
  total_insights: 6,
  high_priority_count: 2,
  categories: [
    { id: "1", name: "Content Strategy", icon: "📝", color: "#3b82f6", insight_count: 2, avg_impact_score: 7.5 },
    { id: "2", name: "Growth Strategy", icon: "📈", color: "#10b981", insight_count: 1, avg_impact_score: 9 },
    { id: "3", name: "Engagement", icon: "💝", color: "#8b5cf6", insight_count: 2, avg_impact_score: 5 },
    { id: "4", name: "Competitive Analysis", icon: "🔍", color: "#f59e0b", insight_count: 1, avg_impact_score: 5 }
  ],
  overall_health_score: 72,
  recommended_actions: [
    "Increase posting frequency to 5-6 times per week",
    "Implement hashtag optimization strategy",
    "Focus on video content for higher engagement",
    "Analyze competitor posting strategies"
  ],
  key_trends: [
    "Video content consistently outperforms static images",
    "Weekday evening posts generate higher engagement",
    "Interactive story content drives more user interaction",
    "Hashtag strategy significantly impacts reach"
  ]
});

// Variant configuration
const variants: VariantOption[] = [
  // Layout variants
  {
    id: 'card-based',
    name: 'Card-Based Layout',
    description: 'Visual card layout with rich visual elements and structured information',
    component: CardBasedInsights,
    icon: <LayoutGrid className="w-5 h-5" />,
    category: 'layout'
  },
  {
    id: 'list-based',
    name: 'List View',
    description: 'Vertical list layout with expandable details and filtering options',
    component: ListBasedInsights,
    icon: <List className="w-5 h-5" />,
    category: 'layout'
  },

  // Presentation variants
  {
    id: 'summary-first',
    name: 'Summary-First',
    description: 'Starts with overview dashboard then shows prioritized insights',
    component: SummaryFirstInsights,
    icon: <BarChart3 className="w-5 h-5" />,
    category: 'presentation'
  },
  {
    id: 'detail-first',
    name: 'Detail-First',
    description: 'Starts with detailed view of individual insights',
    component: DetailFirstInsights,
    icon: <FileText className="w-5 h-5" />,
    category: 'presentation'
  },
  {
    id: 'visual-heavy',
    name: 'Visual-Heavy',
    description: 'Rich visual elements with charts, gauges, and interactive graphics',
    component: VisualHeavyInsights,
    icon: <Zap className="w-5 h-5" />,
    category: 'presentation'
  },
  {
    id: 'text-focused',
    name: 'Text-Focused',
    description: 'Detailed text-based analysis with minimal visual elements',
    component: TextFocusedInsights,
    icon: <Type className="w-5 h-5" />,
    category: 'presentation'
  },

  // Interaction variants
  {
    id: 'interactive-drilldown',
    name: 'Interactive Drill-Down',
    description: 'Multi-level exploration with expandable details and navigation',
    component: InteractiveDrillDownInsights,
    icon: <MousePointer className="w-5 h-5" />,
    category: 'interaction'
  },
  {
    id: 'static-summary',
    name: 'Static Summary',
    description: 'Read-only format optimized for reports and presentations',
    component: StaticSummaryInsights,
    icon: <FileText className="w-5 h-5" />,
    category: 'interaction'
  },

  // Categorization variants
  {
    id: 'type-categorized',
    name: 'By Type',
    description: 'Organized by insight categories (growth, engagement, content, etc.)',
    component: TypeCategorizedInsights,
    icon: <Filter className="w-5 h-5" />,
    category: 'categorization'
  },
  {
    id: 'priority-categorized',
    name: 'By Priority',
    description: 'Organized by urgency levels (high, medium, low priority)',
    component: PriorityCategorizedInsights,
    icon: <Target className="w-5 h-5" />,
    category: 'categorization'
  }
];

export const InsightVariantsDemo: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<string>('card-based');
  const [showFilters, setShowFilters] = useState(true);
  const [showSearch, setShowSearch] = useState(true);

  const insights = generateMockInsights();
  const summary = generateMockSummary();

  const selectedVariantData = variants.find(v => v.id === selectedVariant);
  const SelectedComponent = selectedVariantData?.component;

  const variantsByCategory = variants.reduce((acc, variant) => {
    if (!acc[variant.category]) acc[variant.category] = [];
    acc[variant.category].push(variant);
    return acc;
  }, {} as Record<VariantCategory, VariantOption[]>);

  const handleInsightClick = (insight: Insight) => {
    console.log('Insight clicked:', insight.title);
  };

  const handleExport = (format: string) => {
    console.log(`Export as ${format}`);
  };

  if (!SelectedComponent) {
    return <div>Component not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instagram Analytics Insights - Variant Testing</h1>
              <p className="text-gray-600 mt-1">Test different presentation and interaction approaches</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showFilters}
                  onChange={(e) => setShowFilters(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Filters</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showSearch}
                  onChange={(e) => setShowSearch(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Show Search</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Variant Selector Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Test Variants
              </h2>
              
              <div className="space-y-6">
                {Object.entries(variantsByCategory).map(([category, categoryVariants]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-gray-700 mb-3 capitalize">
                      {category} Variants
                    </h3>
                    <div className="space-y-2">
                      {categoryVariants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-colors ${
                            selectedVariant === variant.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={selectedVariant === variant.id ? 'text-blue-600' : 'text-gray-400'}>
                              {variant.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium text-sm ${
                                selectedVariant === variant.id ? 'text-blue-900' : 'text-gray-900'
                              }`}>
                                {variant.name}
                              </div>
                              <div className={`text-xs mt-1 ${
                                selectedVariant === variant.id ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                                {variant.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Current Variant Info */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  {selectedVariantData?.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedVariantData?.name}</h3>
                  <p className="text-sm text-gray-600">{selectedVariantData?.description}</p>
                </div>
              </div>
            </div>

            {/* Variant Component */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <SelectedComponent
                insights={insights}
                summary={summary}
                onInsightClick={handleInsightClick}
                onExport={handleExport}
                showFilters={showFilters}
                showSearch={showSearch}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};