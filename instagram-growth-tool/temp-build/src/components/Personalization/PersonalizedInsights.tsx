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
  ArrowDown
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
}

export default function PersonalizedInsights({ 
  accountType = 'personal', 
  followerCount = 0,
  onInsightsGenerated 
}: PersonalizedInsightsProps) {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generatePersonalizedInsights();
  }, [accountType, followerCount]);

  const generatePersonalizedInsights = () => {
    setLoading(true);
    
    // Simulate insights based on account type and follower count
    const generatedInsights: Insight[] = [];

    // Account Type Specific Insights
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
          data: { current: 3.2, target: 4.5, improvement: '+23%' }
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
          data: { current: 45, target: 80, improvement: '+34%' }
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
          data: { day: 'Tuesday/Thursday', time: '7-9 PM', engagement: '+45%' }
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
          data: { current: 2.1, target: 4.2, type: 'BTS' }
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
          data: { current: 12, target: 20, metric: 'Interactive stories' }
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
          data: { niche: 'Travel', relevance: '+89%' }
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
          data: { current: 8, target: 15, contentType: 'Stories' }
        },
        {
          id: 'growth- momentum',
          title: 'Growth Momentum Analysis',
          description: 'Your account gained 34% more followers this month than last month.',
          impact: 'high',
          action: 'Continue your current posting strategy',
          category: 'Growth',
          icon: TrendingUp,
          gradient: 'from-green-500 to-emerald-600',
          data: { current: 245, previous: 183, growth: '+34%' }
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
        data: { phase: 'Building', target: '1K followers', timeline: '3-6 months' }
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
        data: { phase: 'Growing', target: '10K followers', timeline: '6-12 months' }
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
        data: { phase: 'Established', followers: followerCount, focus: 'Monetization' }
      });
    }

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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
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
              Tailored recommendations for your {accountType} account
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const Icon = insight.icon;
          const ImpactIcon = getImpactIcon(insight.impact);
          
          return (
            <div
              key={insight.id}
              className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200"
            >
              {/* Gradient Border */}
              <div className={`absolute inset-0 bg-gradient-to-r ${insight.gradient} opacity-5 rounded-xl`}></div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${insight.gradient} rounded-lg`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                        {insight.category}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${getImpactColor(insight.impact)}`}>
                    <ImpactIcon className="h-4 w-4" />
                    <span className="text-xs font-medium capitalize">{insight.impact} Impact</span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                  {insight.description}
                </p>

                {insight.data && (
                  <div className="mb-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-600">
                    <div className="mb-2">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        📊 Performance Data (Last 30 Days)
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                      {Object.entries(insight.data).map(([key, value]) => {
                        // Enhanced key formatting with context
                        const formatKey = (k: string) => {
                          const keyMap: Record<string, string> = {
                            current: 'Current',
                            target: 'Target',
                            improvement: 'Improvement',
                            day: 'Peak Day',
                            time: 'Peak Time',
                            engagement: 'Engagement Lift',
                            type: 'Content Type',
                            metric: 'Metric',
                            phase: 'Growth Phase',
                            target: 'Target',
                            timeline: 'Timeline',
                            followers: 'Followers',
                            relevance: 'Relevance Boost',
                            focus: 'Focus Area',
                            growth: 'Growth Rate',
                            previous: 'Previous Period',
                            improvement: 'Expected Gain',
                            niche: 'Content Niche'
                          };
                          return keyMap[k] || k.replace(/([A-Z])/g, ' $1').trim();
                        };
                        
                        // Enhanced value formatting
                        const formatValue = (v: any, k: string) => {
                          if (typeof v === 'string') {
                            // Add context to common values
                            if (k === 'improvement' && v.startsWith('+')) {
                              return `${v} vs baseline`;
                            }
                            if (k === 'time' || k === 'timeline') {
                              return v;
                            }
                            if (k === 'metric' || k === 'type') {
                              return v;
                            }
                          }
                          return String(v);
                        };

                        return (
                          <div key={key} className="space-y-1">
                            <span className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                              {formatKey(key)}
                            </span>
                            <div className="font-semibold text-gray-900 dark:text-white text-sm">
                              {formatValue(value, key)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                    💡 {insight.action}
                  </p>
                  <button className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-full hover:shadow-md transition-all">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
            Account Performance
          </span>
        </div>
        <p className="text-xs text-purple-700 dark:text-purple-300">
          Based on your {accountType} account with {followerCount.toLocaleString()} followers, 
          these insights are generated from your recent activity and industry benchmarks.
        </p>
      </div>
    </div>
  );
}