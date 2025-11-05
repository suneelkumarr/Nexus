import { useState, useEffect } from 'react';
import { 
  Sparkles, Star, Zap, Target, TrendingUp, BarChart3, 
  Calendar, Search, Users, Award, CheckCircle, 
  ArrowRight, Play, Info, Clock, Eye, Heart,
  MessageCircle, Share, Bookmark, Instagram, 
  Plus, Settings, Lightbulb, Trophy, Medal
} from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  category: 'analytics' | 'content' | 'growth' | 'ai' | 'collaboration' | 'tools';
  importance: 'high' | 'medium' | 'low';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  userLevel: 'new' | 'active' | 'expert';
  prerequisites?: string[];
  benefits: string[];
  useCases: string[];
  isLocked?: boolean;
  isDiscovered?: boolean;
  discoveryDate?: string;
  icon: any;
  color: string;
  featured?: boolean;
  trending?: boolean;
}

interface FeatureDiscoveryProps {
  userLevel: 'new' | 'active' | 'expert';
  discoveredFeatures: string[];
  onFeatureDiscover: (featureId: string) => void;
  onFeatureExplore: (featureId: string) => void;
  className?: string;
  maxFeatures?: number;
}

const featureIcons = {
  analytics: BarChart3,
  content: Calendar,
  growth: TrendingUp,
  ai: Sparkles,
  collaboration: Users,
  tools: Settings
};

const categoryColors = {
  analytics: 'from-blue-500 to-cyan-500',
  content: 'from-green-500 to-emerald-500',
  growth: 'from-purple-500 to-pink-500',
  ai: 'from-indigo-500 to-purple-500',
  collaboration: 'from-orange-500 to-red-500',
  tools: 'from-gray-500 to-slate-500'
};

const importanceColors = {
  high: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
  medium: 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
};

const availableFeatures: Feature[] = [
  {
    id: 'ai_insights',
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations based on your performance data and industry trends',
    category: 'ai',
    importance: 'high',
    difficulty: 'intermediate',
    estimatedTime: 10,
    userLevel: 'active',
    benefits: [
      'Personalized content recommendations',
      'Optimal posting time predictions',
      'Growth opportunity identification',
      'Performance forecasting'
    ],
    useCases: [
      'Plan next month\'s content strategy',
      'Identify best performing content types',
      'Optimize posting schedule',
      'Discover trending topics in your niche'
    ],
    icon: Sparkles,
    color: categoryColors.ai,
    featured: true
  },
  {
    id: 'competitor_analysis',
    title: 'Competitor Analysis',
    description: 'Analyze competitor strategies, performance, and discover opportunities',
    category: 'analytics',
    importance: 'high',
    difficulty: 'intermediate',
    estimatedTime: 15,
    userLevel: 'active',
    benefits: [
      'Track competitor growth rates',
      'Analyze successful content strategies',
      'Identify content gaps',
      'Benchmark against industry leaders'
    ],
    useCases: [
      'Research what works for competitors',
      'Find content inspiration',
      'Benchmark performance metrics',
      'Identify trending hashtags'
    ],
    icon: Search,
    color: categoryColors.analytics,
    featured: true,
    trending: true
  },
  {
    id: 'content_calendar',
    title: 'Content Calendar',
    description: 'Plan, schedule, and organize your Instagram content with advanced calendar tools',
    category: 'content',
    importance: 'high',
    difficulty: 'beginner',
    estimatedTime: 20,
    userLevel: 'new',
    prerequisites: ['account_connection'],
    benefits: [
      'Visual content planning',
      'Automated scheduling',
      'Content performance tracking',
      'Team collaboration features'
    ],
    useCases: [
      'Plan weekly/monthly content',
      'Schedule posts in advance',
      'Track content performance',
      'Coordinate team content creation'
    ],
    icon: Calendar,
    color: categoryColors.content,
    featured: true
  },
  {
    id: 'hashtag_research',
    title: 'Hashtag Research & Optimization',
    description: 'Discover trending hashtags, analyze performance, and optimize for maximum reach',
    category: 'analytics',
    importance: 'medium',
    difficulty: 'beginner',
    estimatedTime: 10,
    userLevel: 'new',
    benefits: [
      'Find trending hashtags in your niche',
      'Analyze hashtag performance',
      'Get hashtag suggestions',
      'Track hashtag reach and engagement'
    ],
    useCases: [
      'Research hashtags for new posts',
      'Find niche-specific tags',
      'Analyze competitor hashtag strategies',
      'Track hashtag performance'
    ],
    icon: TrendingUp,
    color: categoryColors.analytics
  },
  {
    id: 'audience_analytics',
    title: 'Audience Analytics & Demographics',
    description: 'Deep dive into your audience demographics, behavior patterns, and engagement preferences',
    category: 'analytics',
    importance: 'high',
    difficulty: 'intermediate',
    estimatedTime: 12,
    userLevel: 'active',
    benefits: [
      'Understand audience demographics',
      'Identify peak engagement times',
      'Analyze follower behavior',
      'Segment audience by interests'
    ],
    useCases: [
      'Target content to specific demographics',
      'Optimize posting times',
      'Understand audience preferences',
      'Plan targeted campaigns'
    ],
    icon: Users,
    color: categoryColors.analytics
  },
  {
    id: 'content_variations',
    title: 'AI Content Variations',
    description: 'Generate multiple content variations using AI to test and optimize performance',
    category: 'ai',
    importance: 'medium',
    difficulty: 'intermediate',
    estimatedTime: 15,
    userLevel: 'active',
    benefits: [
      'Generate content variations',
      'A/B test different approaches',
      'Maintain brand voice',
      'Save time on content creation'
    ],
    useCases: [
      'Create multiple post variations',
      'Test different content styles',
      'Maintain consistent messaging',
      'Optimize for different audiences'
    ],
    icon: Zap,
    color: categoryColors.ai
  },
  {
    id: 'team_collaboration',
    title: 'Team Collaboration Tools',
    description: 'Work with team members, assign roles, and manage content approval workflows',
    category: 'collaboration',
    importance: 'medium',
    difficulty: 'intermediate',
    estimatedTime: 10,
    userLevel: 'active',
    benefits: [
      'Team member management',
      'Content approval workflows',
      'Shared content libraries',
      'Role-based permissions'
    ],
    useCases: [
      'Manage content creation teams',
      'Set up approval processes',
      'Share content resources',
      'Coordinate campaigns'
    ],
    icon: Users,
    color: categoryColors.collaboration
  },
  {
    id: 'performance_predictions',
    title: 'AI Performance Predictions',
    description: 'Get AI-powered predictions for your content performance and growth trajectory',
    category: 'ai',
    importance: 'high',
    difficulty: 'advanced',
    estimatedTime: 8,
    userLevel: 'expert',
    benefits: [
      'Predict content performance',
      'Forecast follower growth',
      'Optimize content timing',
      'Plan long-term strategy'
    ],
    useCases: [
      'Plan content strategy',
      'Set realistic growth goals',
      'Optimize posting schedule',
      'Track prediction accuracy'
    ],
    icon: Target,
    color: categoryColors.ai,
    featured: true
  },
  {
    id: 'content_scheduling',
    title: 'Advanced Content Scheduling',
    description: 'Schedule content across multiple platforms with advanced timing and optimization',
    category: 'content',
    importance: 'medium',
    difficulty: 'beginner',
    estimatedTime: 5,
    userLevel: 'new',
    benefits: [
      'Multi-platform scheduling',
      'Optimal timing suggestions',
      'Bulk scheduling options',
      'Performance-based optimization'
    ],
    useCases: [
      'Schedule posts automatically',
      'Optimize timing for engagement',
      'Manage multiple accounts',
      'Plan content campaigns'
    ],
    icon: Clock,
    color: categoryColors.content
  },
  {
    id: 'export_reports',
    title: 'Advanced Reporting & Exports',
    description: 'Create detailed reports and export data for external analysis and stakeholder updates',
    category: 'tools',
    importance: 'medium',
    difficulty: 'intermediate',
    estimatedTime: 8,
    userLevel: 'active',
    benefits: [
      'Custom report generation',
      'Multiple export formats',
      'Automated report delivery',
      'Stakeholder-friendly visualizations'
    ],
    useCases: [
      'Create client reports',
      'Export data for analysis',
      'Share performance updates',
      'Track long-term trends'
    ],
    icon: BarChart3,
    color: categoryColors.tools
  }
];

export default function FeatureDiscovery({ 
  userLevel, 
  discoveredFeatures, 
  onFeatureDiscover, 
  onFeatureExplore, 
  className = '',
  maxFeatures = 8 
}: FeatureDiscoveryProps) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImportance, setSelectedImportance] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'difficulty' | 'time'>('relevance');
  const [showDiscovered, setShowDiscovered] = useState(false);

  useEffect(() => {
    // Initialize features with discovery status
    const initializedFeatures = availableFeatures.map(feature => ({
      ...feature,
      isDiscovered: discoveredFeatures.includes(feature.id),
      discoveryDate: discoveredFeatures.includes(feature.id) ? new Date().toISOString() : undefined
    }));

    setFeatures(initializedFeatures);
  }, [discoveredFeatures]);

  const getFilteredFeatures = () => {
    let filtered = features;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(feature => feature.category === selectedCategory);
    }

    // Filter by importance
    if (selectedImportance !== 'all') {
      filtered = filtered.filter(feature => feature.importance === selectedImportance);
    }

    // Filter by discovery status
    if (!showDiscovered) {
      filtered = filtered.filter(feature => !feature.isDiscovered);
    }

    // Filter by user level suitability
    const userLevelPriority = { new: 0, active: 1, expert: 2 };
    filtered = filtered.filter(feature => {
      const featureLevelPriority = userLevelPriority[feature.userLevel];
      const currentUserPriority = userLevelPriority[userLevel];
      return featureLevelPriority <= currentUserPriority + 1; // Show current level and next level
    });

    // Sort features
    switch (sortBy) {
      case 'difficulty':
        const difficultyOrder = { beginner: 0, intermediate: 1, advanced: 2 };
        filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
        break;
      case 'time':
        filtered.sort((a, b) => a.estimatedTime - b.estimatedTime);
        break;
      case 'relevance':
      default:
        // Sort by importance, featured status, and trending
        filtered.sort((a, b) => {
          const importanceOrder = { high: 0, medium: 1, low: 2 };
          let scoreA = importanceOrder[a.importance];
          let scoreB = importanceOrder[b.importance];
          
          if (a.featured) scoreA -= 0.5;
          if (b.featured) scoreB -= 0.5;
          
          if (a.trending) scoreA -= 0.25;
          if (b.trending) scoreB -= 0.25;
          
          return scoreA - scoreB;
        });
        break;
    }

    return filtered.slice(0, maxFeatures);
  };

  const handleFeatureDiscover = (featureId: string) => {
    onFeatureDiscover(featureId);
    setFeatures(prev => prev.map(feature => 
      feature.id === featureId 
        ? { ...feature, isDiscovered: true, discoveryDate: new Date().toISOString() }
        : feature
    ));
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return Star;
      case 'intermediate': return Award;
      case 'advanced': return Trophy;
      default: return Info;
    }
  };

  const filteredFeatures = getFilteredFeatures();
  const categories = [
    { id: 'all', name: 'All Features', count: features.length },
    { id: 'analytics', name: 'Analytics', count: features.filter(f => f.category === 'analytics').length },
    { id: 'ai', name: 'AI Tools', count: features.filter(f => f.category === 'ai').length },
    { id: 'content', name: 'Content', count: features.filter(f => f.category === 'content').length },
    { id: 'growth', name: 'Growth', count: features.filter(f => f.category === 'growth').length },
    { id: 'collaboration', name: 'Collaboration', count: features.filter(f => f.category === 'collaboration').length },
    { id: 'tools', name: 'Tools', count: features.filter(f => f.category === 'tools').length }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-purple-600" />
              Feature Discovery
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Explore powerful features to grow your Instagram presence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-sm text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-3 py-1 rounded-full">
              <Sparkles className="w-4 h-4" />
              {discoveredFeatures.length}/{features.length} Discovered
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.count})
                </option>
              ))}
            </select>
          </div>

          {/* Importance Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</span>
            <select
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="relevance">Relevance</option>
              <option value="difficulty">Difficulty</option>
              <option value="time">Time Required</option>
            </select>
          </div>

          {/* Discovery Toggle */}
          <button
            onClick={() => setShowDiscovered(!showDiscovered)}
            className={`px-3 py-1 text-sm rounded-lg font-medium transition-colors ${
              showDiscovered
                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            Show Discovered ({discoveredFeatures.length})
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFeatures.map((feature) => {
          const FeatureIcon = feature.icon;
          const DifficultyIcon = getDifficultyIcon(feature.difficulty);
          
          return (
            <div
              key={feature.id}
              className={`p-5 rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                feature.isDiscovered
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : importanceColors[feature.importance]
              } ${
                feature.isLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:scale-[1.02]'
              }`}
              onClick={() => {
                if (!feature.isLocked) {
                  if (feature.isDiscovered) {
                    onFeatureExplore(feature.id);
                  } else {
                    handleFeatureDiscover(feature.id);
                  }
                }
              }}
            >
              {/* Feature Header */}
              <div className="flex items-start gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  feature.isDiscovered
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : `bg-gradient-to-r ${feature.color}`
                }`}>
                  {feature.isDiscovered ? (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <FeatureIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-semibold ${
                      feature.isDiscovered 
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {feature.title}
                    </h4>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                      {feature.featured && (
                        <div className="flex items-center gap-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded-full">
                          <Star className="w-3 h-3" />
                          Featured
                        </div>
                      )}
                      {feature.trending && (
                        <div className="flex items-center gap-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-full">
                          <TrendingUp className="w-3 h-3" />
                          Trending
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-2 ${
                    feature.isDiscovered
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {feature.description}
                  </p>
                </div>
              </div>

              {/* Feature Metadata */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" />
                    {feature.estimatedTime}min
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <DifficultyIcon className="w-3 h-3" />
                    {feature.difficulty}
                  </div>
                  <div className="flex items-center gap-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full">
                    {feature.category}
                  </div>
                </div>
                
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  feature.importance === 'high'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : feature.importance === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                }`}>
                  {feature.importance} priority
                </div>
              </div>

              {/* Benefits Preview */}
              {!feature.isDiscovered && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Key benefits:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {feature.benefits.slice(0, 2).map((benefit, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full"
                      >
                        {benefit}
                      </span>
                    ))}
                    {feature.benefits.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        +{feature.benefits.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {feature.prerequisites && feature.prerequisites.length > 0 && (
                    <div className="text-xs text-orange-600 dark:text-orange-400">
                      Requires: {feature.prerequisites.join(', ')}
                    </div>
                  )}
                  {feature.isDiscovered && feature.discoveryDate && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Discovered {new Date(feature.discoveryDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                
                <button
                  className={`flex items-center gap-1 text-sm font-medium ${
                    feature.isDiscovered
                      ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300'
                      : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (feature.isDiscovered) {
                      onFeatureExplore(feature.id);
                    } else {
                      handleFeatureDiscover(feature.id);
                    }
                  }}
                >
                  {feature.isDiscovered ? (
                    <>
                      Explore
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Discover
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {showDiscovered ? 'No features found' : 'All features discovered!'}
          </h4>
          <p className="text-gray-500 dark:text-gray-400">
            {showDiscovered 
              ? 'Try adjusting your filters to see more features.'
              : 'Great job! You\'ve discovered all available features. Check back later for new updates.'
            }
          </p>
        </div>
      )}
    </div>
  );
}