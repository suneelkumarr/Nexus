import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Heart, 
  MessageCircle, 
  Eye, 
  BarChart3,
  Calendar,
  Download,
  Share2,
  Zap,
  Target,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface DashboardSummaryProps {
  data: {
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
  };
  timeRange: string;
  className?: string;
}

interface SummaryInsight {
  type: 'achievement' | 'opportunity' | 'warning' | 'trend';
  title: string;
  description: string;
  value?: string;
  impact: 'high' | 'medium' | 'low';
  action?: string;
}

interface GrowthStory {
  narrative: string;
  keyMoments: Array<{
    date: string;
    event: string;
    impact: string;
  }>;
  milestones: string[];
  futureProjections: string;
}

export default function DashboardSummary({ data, timeRange, className = '' }: DashboardSummaryProps) {
  const [activeView, setActiveView] = useState<'summary' | 'story' | 'comparison'>('summary');
  const [insights, setInsights] = useState<SummaryInsight[]>([]);
  const [growthStory, setGrowthStory] = useState<GrowthStory | null>(null);
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    generateInsights();
    generateGrowthStory();
    generateComparison();
  }, [data, timeRange]);

  const generateInsights = () => {
    const newInsights: SummaryInsight[] = [];

    // Follower Growth Analysis
    if (data.growth.followers > 0) {
      newInsights.push({
        type: 'achievement',
        title: 'Follower Growth Success',
        description: `Your account gained ${data.growth.followers.toFixed(1)}% new followers this ${timeRange}`,
        value: `+${data.growth.followers.toFixed(1)}%`,
        impact: 'high',
        action: 'Continue posting engaging content'
      });
    } else {
      newInsights.push({
        type: 'warning',
        title: 'Follower Growth Decline',
        description: `You lost ${Math.abs(data.growth.followers).toFixed(1)}% of your followers this ${timeRange}`,
        value: `${data.growth.followers.toFixed(1)}%`,
        impact: 'high',
        action: 'Review your content strategy and posting schedule'
      });
    }

    // Engagement Analysis
    if (data.growth.engagement > 0) {
      newInsights.push({
        type: 'achievement',
        title: 'Engagement Improvement',
        description: `Your engagement rate increased by ${data.growth.engagement.toFixed(1)}%`,
        value: `+${data.growth.engagement.toFixed(1)}%`,
        impact: 'medium',
        action: 'Analyze which content performs best'
      });
    } else {
      newInsights.push({
        type: 'opportunity',
        title: 'Engagement Opportunity',
        description: `Engagement decreased by ${Math.abs(data.growth.engagement).toFixed(1)}% - there's room for improvement`,
        impact: 'medium',
        action: 'Experiment with different content types and posting times'
      });
    }

    // Industry Benchmark Comparison
    const engagementRate = data.engagementRate;
    if (engagementRate >= 3) {
      newInsights.push({
        type: 'achievement',
        title: 'Above Industry Average',
        description: `Your ${engagementRate.toFixed(2)}% engagement rate exceeds industry standards`,
        impact: 'medium'
      });
    } else if (engagementRate < 1) {
      newInsights.push({
        type: 'warning',
        title: 'Below Industry Average',
        description: `Your ${engagementRate.toFixed(2)}% engagement rate is below the 1-3% industry benchmark`,
        impact: 'high',
        action: 'Focus on creating more engaging, interactive content'
      });
    }

    // Reach Growth
    if (data.growth.reach > 0) {
      newInsights.push({
        type: 'trend',
        title: 'Expanding Reach',
        description: `Your content reached ${data.growth.reach.toFixed(1)}% more people`,
        impact: 'medium'
      });
    }

    setInsights(newInsights);
  };

  const generateGrowthStory = () => {
    const narrative = generateNarrative();
    const keyMoments = generateKeyMoments();
    const milestones = generateMilestones();
    const futureProjections = generateFutureProjections();

    setGrowthStory({
      narrative,
      keyMoments,
      milestones,
      futureProjections
    });
  };

  const generateNarrative = (): string => {
    const followerTrend = data.growth.followers > 0 ? 'growth' : 'decline';
    const engagementTrend = data.growth.engagement > 0 ? 'improvement' : 'decline';
    const reachTrend = data.growth.reach > 0 ? 'expansion' : 'decline';

    let narrative = `Your Instagram journey over the past ${timeRange} shows a compelling story of ${followerTrend} with your follower count ${data.growth.followers > 0 ? 'growing' : 'declining'} by ${Math.abs(data.growth.followers).toFixed(1)}%. `;

    narrative += `During this period, your engagement ${engagementTrend === 'improvement' ? 'significantly improved' : 'faced challenges'}, with your engagement rate ${engagementTrend === 'improvement' ? 'rising to' : 'dropping to'} ${data.engagementRate.toFixed(2)}%. `;

    narrative += `Your reach ${reachTrend === 'expansion' ? 'expanded dramatically' : 'contracted'}, indicating ${reachTrend === 'expansion' ? 'strong content performance' : 'potential content strategy adjustments needed'}. `;

    if (data.growth.followers > 0 && data.growth.engagement > 0) {
      narrative += `This represents a remarkable period of growth where both audience size and engagement quality improved simultaneously, suggesting your content strategy resonates well with your target audience.`;
    } else if (data.growth.followers < 0 && data.growth.engagement < 0) {
      narrative += `This challenging period suggests it may be time to reassess your content strategy, posting schedule, and audience targeting to reverse these trends.`;
    } else {
      narrative += `Mixed signals in your metrics indicate a transitional period where some aspects of your strategy are working well while others may need refinement.`;
    }

    return narrative;
  };

  const generateKeyMoments = () => {
    const moments = [];
    
    if (data.growth.followers > 5) {
      moments.push({
        date: 'Recent',
        event: 'Follower Milestone Achievement',
        impact: 'Crossed significant follower threshold'
      });
    }

    if (data.growth.engagement > 10) {
      moments.push({
        date: 'Peak Period',
        event: 'Engagement Surge',
        impact: 'Highest engagement rate achieved'
      });
    }

    if (data.growth.reach > 20) {
      moments.push({
        date: 'Viral Moment',
        event: 'Content Went Viral',
        impact: 'Massive reach expansion'
      });
    }

    return moments;
  };

  const generateMilestones = () => {
    const milestones = [];
    
    if (data.followers >= 10000) {
      milestones.push('Reached 10K+ followers milestone');
    }
    if (data.engagementRate >= 5) {
      milestones.push('Achieved 5%+ engagement rate');
    }
    if (data.reach >= 100000) {
      milestones.push('100K+ reach milestone');
    }
    if (data.growth.followers > 15) {
      milestones.push('15%+ follower growth achieved');
    }

    return milestones;
  };

  const generateFutureProjections = () => {
    const avgGrowth = (data.growth.followers + data.growth.engagement + data.growth.reach) / 3;
    
    if (avgGrowth > 10) {
      return `Based on current trends, you're on track for exceptional growth. If this pace continues, you could see 25%+ growth in the next period. Focus on maintaining consistency and scaling successful content types.`;
    } else if (avgGrowth > 0) {
      return `Your growth trajectory shows steady improvement. With optimized content strategy and posting schedule, you could achieve 15-20% growth in the next period.`;
    } else {
      return `Current trends suggest a strategic reset may be beneficial. Focus on audience research, content experimentation, and engagement tactics to reverse negative growth patterns.`;
    }
  };

  const generateComparison = () => {
    // Mock comparison data
    setComparisonData({
      previousPeriod: {
        followers: data.followers / (1 + data.growth.followers / 100),
        engagementRate: data.engagementRate / (1 + data.growth.engagement / 100),
        reach: data.reach / (1 + data.growth.reach / 100)
      },
      industryAverage: {
        followers: data.followers * 0.8, // Mock industry average
        engagementRate: 2.5,
        reach: data.reach * 0.7
      },
      yearAgo: {
        followers: data.followers * 0.7,
        engagementRate: data.engagementRate * 0.9,
        reach: data.reach * 0.6
      }
    });
  };

  const getInsightIcon = (type: SummaryInsight['type']) => {
    switch (type) {
      case 'achievement': return Award;
      case 'opportunity': return Target;
      case 'warning': return TrendingDown;
      case 'trend': return TrendingUp;
      default: return BarChart3;
    }
  };

  const getInsightColor = (type: SummaryInsight['type']) => {
    switch (type) {
      case 'achievement': return 'text-green-600 bg-green-100';
      case 'opportunity': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-red-600 bg-red-100';
      case 'trend': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getImpactIcon = (impact: 'high' | 'medium' | 'low') => {
    switch (impact) {
      case 'high': return ArrowUpRight;
      case 'medium': return ArrowUpRight;
      case 'low': return ArrowDownRight;
      default: return ArrowUpRight;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
          <p className="text-gray-600">Your Instagram performance overview for {timeRange}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex border border-gray-200 rounded-lg">
            {[
              { id: 'summary', name: 'Summary', icon: BarChart3 },
              { id: 'story', name: 'Growth Story', icon: TrendingUp },
              { id: 'comparison', name: 'Comparison', icon: Users }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveView(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === tab.id
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content based on active view */}
      {activeView === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Key Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-gray-700">Followers</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{data.followers.toLocaleString()}</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    data.growth.followers >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.growth.followers >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(data.growth.followers).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-pink-600" />
                  <span className="text-gray-700">Engagement Rate</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{data.engagementRate.toFixed(2)}%</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    data.growth.engagement >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.growth.engagement >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(data.growth.engagement).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span className="text-gray-700">Reach</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{data.reach.toLocaleString()}</div>
                  <div className={`text-sm flex items-center gap-1 ${
                    data.growth.reach >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {data.growth.reach >= 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {Math.abs(data.growth.reach).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
            <div className="space-y-4">
              {insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type);
                const ImpactIcon = getImpactIcon(insight.impact);
                return (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${getInsightColor(insight.type)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">{insight.title}</h4>
                        <ImpactIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      {insight.action && (
                        <p className="text-sm text-purple-600 mt-2 font-medium">{insight.action}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'story' && growthStory && (
        <div className="space-y-6">
          {/* Growth Narrative */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Growth Story</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed">{growthStory.narrative}</p>
            </div>
          </div>

          {/* Key Milestones */}
          {growthStory.milestones.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Milestones</h3>
              <div className="space-y-3">
                {growthStory.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Award className="h-5 w-5 text-yellow-500" />
                    <span className="text-gray-700">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Future Projections */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900">Future Projections</h3>
            </div>
            <p className="text-purple-800">{growthStory.futureProjections}</p>
          </div>
        </div>
      )}

      {activeView === 'comparison' && comparisonData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Period Comparison */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Comparison</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Followers</div>
                <div className="text-xl font-bold text-gray-900">
                  {((data.followers / comparisonData.previousPeriod.followers - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  vs previous period
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
                <div className="text-xl font-bold text-gray-900">
                  {((data.engagementRate / comparisonData.previousPeriod.engagementRate - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  vs previous period
                </div>
              </div>
            </div>
          </div>

          {/* Industry Average */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Benchmark</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Engagement Rate</div>
                <div className="text-xl font-bold text-gray-900">
                  {((data.engagementRate / comparisonData.industryAverage.engagementRate - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  vs industry avg (2.5%)
                </div>
              </div>
            </div>
          </div>

          {/* Year over Year */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Year over Year</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Followers</div>
                <div className="text-xl font-bold text-gray-900">
                  {((data.followers / comparisonData.yearAgo.followers - 1) * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  growth
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download className="h-4 w-4" />
          Export Summary
        </button>
        
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Share2 className="h-4 w-4" />
          Share Insights
        </button>
      </div>
    </div>
  );
}