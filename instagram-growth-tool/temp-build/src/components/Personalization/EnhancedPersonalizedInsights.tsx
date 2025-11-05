import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Share,
  Eye,
  Calendar,
  Target,
  Lightbulb,
  Award,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface PersonalizedInsightsProps {
  accountType?: 'business' | 'personal' | 'creator';
  followerCount?: number;
  onInsightsGenerated?: (insights: any[]) => void;
}

interface Insight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
  category: string;
  icon: React.ComponentType<any>;
  gradient: string;
  data?: any;
  priorityScore: number; // 1-100
  estimatedROI?: {
    timeframe: string;
    expectedImprovement: string;
    confidence: number;
  };
}

export default function PersonalizedInsights({ 
  accountType = 'personal', 
  followerCount = 0,
  onInsightsGenerated 
}: PersonalizedInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  useEffect(() => {
    generatePersonalizedInsights();
  }, [accountType, followerCount]);

  const generatePersonalizedInsights = () => {
    setLoading(true);
    
    // Simulate insights based on account type and follower count
    const generatedInsights: Insight[] = [];

    // Account Type Specific Insights with Enhanced Context
    if (accountType === 'business') {
      generatedInsights.push(
        {
          id: 'engagement-rate',
          title: 'Business Engagement Optimization',
          description: 'Your business content gets 23% more engagement during weekday mornings.',
          impact: 'high',
          action: 'Schedule more posts between 9-11 AM on weekdays',
          category: 'Timing',
          icon: TrendingUp,
          gradient: 'from-green-500 to-emerald-600',
          data: { 
            current: '3.2%', 
            target: '4.5%', 
            improvement: '+23% vs current',
            timeframe: '30 days',
            benchmark: 'Top 25% of business accounts'
          },
          priorityScore: 95,
          estimatedROI: {
            timeframe: '2-4 weeks',
            expectedImprovement: '+40% engagement rate',
            confidence: 85
          }
        },
        {
          id: 'brand-consistency',
          title: 'Brand Voice Consistency',
          description: 'Posts with your brand colors get 34% more saves and shares.',
          impact: 'high',
          action: 'Use brand colors in 80% of your posts',
          category: 'Branding',
          icon: Target,
          gradient: 'from-blue-500 to-cyan-600',
          data: { 
            current: '45%', 
            target: '80%', 
            improvement: '+34% saves',
            timeframe: 'Based on last 90 posts',
            context: 'Brand-consistent posts perform better'
          },
          priorityScore: 88,
          estimatedROI: {
            timeframe: '1-2 weeks',
            expectedImprovement: '+30% saves and shares',
            confidence: 78
          }
        },
        {
          id: 'customer-insights',
          title: 'Customer Behavior Analysis',
          description: 'Your audience is most active on Tuesday and Thursday evenings.',
          impact: 'medium',
          action: 'Launch campaigns on Tuesday/Thursday evenings',
          category: 'Audience',
          icon: Users,
          gradient: 'from-purple-500 to-pink-600',
          data: { 
            day: 'Tuesday & Thursday', 
            time: '7-9 PM', 
            engagement: '+45% higher activity',
            timeframe: 'Last 30 days',
            context: 'Peak engagement window'
          },
          priorityScore: 75,
          estimatedROI: {
            timeframe: 'Immediate',
            expectedImprovement: '+25% campaign reach',
            confidence: 92
          }
        }
      );
    } else if (accountType === 'creator') {
      generatedInsights.push(
        {
          id: 'content-variety',
          title: 'Content Performance Patterns',
          description: 'Your behind-the-scenes content has 3x higher engagement than product posts.',
          impact: 'high',
          action: 'Increase behind-the-scenes content by 50%',
          category: 'Content',
          icon: Lightbulb,
          gradient: 'from-orange-500 to-red-600',
          data: { 
            current: '2.1%', 
            target: '4.2%', 
            type: 'Behind-the-scenes',
            timeframe: 'Last 50 posts',
            context: 'BTS content drives authentic connection'
          },
          priorityScore: 92,
          estimatedROI: {
            timeframe: '2-3 weeks',
            expectedImprovement: '+50% overall engagement',
            confidence: 81
          }
        },
        {
          id: 'community-building',
          title: 'Community Engagement Strategy',
          description: 'Interactive stories increase your follower growth by 67%.',
          impact: 'high',
          action: 'Add polls/questions to 3 stories per week',
          category: 'Growth',
          icon: Users,
          gradient: 'from-teal-500 to-blue-600',
          data: { 
            current: '12', 
            target: '20', 
            metric: 'Interactive stories per week',
            timeframe: 'Weekly average',
            impact: '+67% follower growth'
          },
          priorityScore: 89,
          estimatedROI: {
            timeframe: '4-6 weeks',
            expectedImprovement: '+60% follower growth rate',
            confidence: 76
          }
        },
        {
          id: 'niche-authority',
          title: 'Niche Content Optimization',
          description: 'Posts in your niche get 89% more relevant followers.',
          impact: 'medium',
          action: 'Focus 70% content on your core niche',
          category: 'Content',
          icon: Award,
          gradient: 'from-pink-500 to-rose-600',
          data: { 
            niche: 'Travel/Lifestyle', 
            relevance: '+89% relevant followers',
            timeframe: 'Last 3 months',
            current: '40% niche content'
          },
          priorityScore: 72,
          estimatedROI: {
            timeframe: '6-8 weeks',
            expectedImprovement: '+45% relevant audience growth',
            confidence: 68
          }
        }
      );
    } else {
      generatedInsights.push(
        {
          id: 'authentic-connection',
          title: 'Personal Connection Metrics',
          description: 'Your authentic stories get 56% more comments than posed photos.',
          impact: 'medium',
          action: 'Share 2 personal stories per week',
          category: 'Engagement',
          icon: Heart,
          gradient: 'from-pink-500 to-rose-600',
          data: { 
            current: '8 comments', 
            target: '15 comments', 
            contentType: 'Stories vs Photos',
            timeframe: 'Per post average',
            improvement: '+56% engagement'
          },
          priorityScore: 78,
          estimatedROI: {
            timeframe: '1-2 weeks',
            expectedImprovement: '+40% comment engagement',
            confidence: 83
          }
        },
        {
          id: 'growth-momentum',
          title: 'Growth Momentum Analysis',
          description: 'Your account gained 34% more followers this month than last month.',
          impact: 'high',
          action: 'Continue your current posting strategy',
          category: 'Growth',
          icon: TrendingUp,
          gradient: 'from-green-500 to-emerald-600',
          data: { 
            current: '245 followers', 
            previous: '183 followers', 
            growth: '+34% month-over-month',
            timeframe: 'October vs September',
            trend: 'Accelerating growth'
          },
          priorityScore: 94,
          estimatedROI: {
            timeframe: 'Sustained growth',
            expectedImprovement: 'Continue 30%+ monthly growth',
            confidence: 91
          }
        },
        {
          id: 'content-timing',
          title: 'Optimal Posting Schedule',
          description: 'Your posts perform 28% better when published between 6-8 PM.',
          impact: 'medium',
          action: 'Schedule posts for 6-8 PM window',
          category: 'Timing',
          icon: Calendar,
          gradient: 'from-indigo-500 to-purple-600',
          data: { 
            optimal: '6-8 PM', 
            improvement: '+28% engagement',
            timeframe: 'Based on last 100 posts',
            current: 'Random timing'
          },
          priorityScore: 71,
          estimatedROI: {
            timeframe: '1-2 weeks',
            expectedImprovement: '+25% post performance',
            confidence: 79
          }
        }
      );
    }

    // Follower count based insights
    if (followerCount < 1000) {
      generatedInsights.push({
        id: 'foundation-building',
        title: 'Foundation Building Phase',
        description: 'Focus on consistent posting and authentic engagement to build your core community.',
        impact: 'high',
        action: 'Post daily and engage with 10 accounts in your niche',
        category: 'Strategy',
        icon: Activity,
        gradient: 'from-indigo-500 to-purple-600',
        data: { 
          phase: 'Building', 
          target: '1K followers', 
          timeline: '3-6 months',
          current: `${followerCount} followers`,
          action: 'Consistency is key'
        },
        priorityScore: 96,
        estimatedROI: {
          timeframe: '3-6 months',
          expectedImprovement: 'Reach 1K+ engaged followers',
          confidence: 88
        }
      });
    } else if (followerCount < 10000) {
      generatedInsights.push({
        id: 'momentum-acceleration',
        title: 'Growth Momentum',
        description: 'You\'re in the growth phase. Focus on content variety and community building.',
        impact: 'high',
        action: 'Experiment with different content formats',
        category: 'Growth',
        icon: Zap,
        gradient: 'from-yellow-500 to-orange-600',
        data: { 
          phase: 'Growing', 
          target: '10K followers', 
          timeline: '6-12 months',
          current: `${followerCount} followers`,
          focus: 'Variety and engagement'
        },
        priorityScore: 87,
        estimatedROI: {
          timeframe: '6-12 months',
          expectedImprovement: '10x follower growth potential',
          confidence: 75
        }
      });
    } else {
      generatedInsights.push({
        id: 'influence-optimization',
        title: 'Influence Optimization',
        description: 'As an established account, focus on monetization and thought leadership.',
        impact: 'medium',
        action: 'Develop partnerships and premium content',
        category: 'Monetization',
        icon: Target,
        gradient: 'from-purple-500 to-pink-600',
        data: { 
          phase: 'Established', 
          followers: followerCount, 
          focus: 'Monetization & Authority',
          opportunity: 'High-value partnerships'
        },
        priorityScore: 69,
        estimatedROI: {
          timeframe: 'Ongoing',
          expectedImprovement: 'Revenue opportunities',
          confidence: 82
        }
      });
    }

    // Sort by priority score (highest first)
    generatedInsights.sort((a, b) => b.priorityScore - a.priorityScore);
    
    setInsights(generatedInsights);
    setLoading(false);
    onInsightsGenerated?.(generatedInsights);
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high': return ArrowUp;
      case 'medium': return Activity;
      case 'low': return CheckCircle;
      default: return ArrowUp;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-100 dark:bg-green-900/30';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30';
  };

  // Show top 3 insights by default, with option to expand
  const displayedInsights = showAllInsights ? insights : insights.slice(0, 3);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Lightbulb className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Personalized Insights
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Top recommendations for your {accountType} account • Priority ranked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="space-y-4">
        {displayedInsights.map((insight, index) => {
          const Icon = insight.icon;
          const ImpactIcon = getImpactIcon(insight.impact);
          const isExpanded = expandedInsight === insight.id;
          
          return (
            <div
              key={insight.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
                index === 0 
                  ? 'border-purple-200 dark:border-purple-700 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50'
              } ${isExpanded ? 'ring-2 ring-purple-500/30' : ''}`}
            >
              {/* Priority Badge */}
              {index === 0 && (
                <div className="absolute top-3 right-3 z-10">
                  <div className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    #1 Priority
                  </div>
                </div>
              )}
              
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      index === 0 
                        ? `bg-gradient-to-r ${insight.gradient}` 
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {insight.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          Priority: {insight.priorityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getImpactColor(insight.impact)}`}>
                    <ImpactIcon className="h-4 w-4" />
                    <span className="text-xs font-medium capitalize">{insight.impact} Impact</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  {insight.description}
                </p>

                {/* ROI Context */}
                {insight.estimatedROI && (
                  <div className="mb-4 p-3 bg-white/70 dark:bg-gray-800/70 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        💰 Expected Outcome
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(insight.estimatedROI.confidence)}`}>
                        {insight.estimatedROI.confidence}% confidence
                      </span>
                    </div>
                    <div className="text-sm text-gray-900 dark:text-white font-medium">
                      {insight.estimatedROI.expectedImprovement}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Timeframe: {insight.estimatedROI.timeframe}
                    </div>
                  </div>
                )}

                {/* Detailed Data */}
                {insight.data && (
                  <div className="mb-4">
                    <button
                      onClick={() => setExpandedInsight(isExpanded ? null : insight.id)}
                      className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      View Details
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                        <div className="mb-2">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            📊 Performance Data (Last 30 Days)
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          {Object.entries(insight.data).map(([key, value]) => {
                            const formatKey = (k: string) => {
                              const keyMap: Record<string, string> = {
                                current: 'Current Performance',
                                target: 'Target Goal',
                                improvement: 'Expected Improvement',
                                day: 'Best Day',
                                time: 'Optimal Time',
                                engagement: 'Engagement Boost',
                                type: 'Content Type',
                                metric: 'Key Metric',
                                phase: 'Growth Stage',
                                timeline: 'Timeframe',
                                followers: 'Follower Count',
                                relevance: 'Relevance Gain',
                                focus: 'Focus Area',
                                growth: 'Growth Rate',
                                previous: 'Previous Period',
                                niche: 'Content Niche',
                                context: 'Context',
                                benchmark: 'Industry Benchmark',
                                current: 'Current State',
                                impact: 'Impact Level',
                                optimal: 'Optimal Schedule',
                                opportunity: 'Opportunity'
                              };
                              return keyMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                            };

                            const formatValue = (v: any) => String(v);

                            return (
                              <div key={key} className="space-y-1">
                                <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                                  {formatKey(key)}
                                </span>
                                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {formatValue(value)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    💡 {insight.action}
                  </p>
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium rounded-full hover:shadow-md transition-all">
                    Apply Recommendation
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {insights.length > 3 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAllInsights(!showAllInsights)}
            className="flex items-center gap-2 mx-auto px-4 py-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors"
          >
            {showAllInsights ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Top 3 Insights
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                View All {insights.length} Insights
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Account Performance Summary
          </span>
        </div>
        <p className="text-xs text-purple-700 dark:text-purple-300">
          Based on your {accountType} account with {followerCount.toLocaleString()} followers, 
          these insights are generated from your recent activity, industry benchmarks, and AI analysis.
        </p>
        <div className="mt-2 text-xs text-purple-600 dark:text-purple-400">
          💡 Pro tip: Start with high-impact insights for fastest results
        </div>
      </div>
    </div>
  );
}
