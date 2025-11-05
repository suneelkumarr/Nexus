import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// @ts-ignore - Recharts type compatibility with React 18
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, 
  PieChart, Pie, Cell, ComposedChart, ScatterChart, Scatter 
} from 'recharts';
import { 
  TrendingUp, Users, Heart, MessageCircle, Eye, Activity, Target, Award, Clock, Zap, 
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Sparkles, 
  Calendar, Hash, Clock4, Brain, TrendingDown, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

interface EnhancedAnalyticsProps {
  selectedAccount: string | null;
}

interface MetricData {
  date: string;
  followers: number;
  following: number;
  posts: number;
  engagement: number;
  reach: number;
  impressions: number;
  profileViews: number;
  websiteClicks: number;
}

interface HashtagData {
  hashtag: string;
  usage: number;
  avgEngagement: number;
  trend: 'up' | 'down' | 'stable';
}

interface ContentPerformance {
  type: 'photo' | 'video' | 'reel' | 'carousel';
  avgLikes: number;
  avgComments: number;
  avgEngagement: number;
  frequency: number;
  bestTime: string;
}

export default function EnhancedAnalytics({ selectedAccount }: EnhancedAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState<any>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'growth' | 'engagement' | 'audience' | 'content' | 'competitors'>('overview');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Analytics data states
  const [metricData, setMetricData] = useState<MetricData[]>([]);
  const [hashtagData, setHashtagData] = useState<HashtagData[]>([]);
  const [contentPerformance, setContentPerformance] = useState<ContentPerformance[]>([]);
  const [audienceInsights, setAudienceInsights] = useState<any>({});
  const [growthPredictions, setGrowthPredictions] = useState<any[]>([]);

  const [animatedMetrics, setAnimatedMetrics] = useState({
    totalFollowers: 0,
    growthRate: 0,
    engagementRate: 0,
    avgReach: 0,
    profileViews: 0,
    bestTime: '2:00 PM'
  });

  useEffect(() => {
    if (selectedAccount) {
      loadAccountData();
    }
  }, [selectedAccount, timeRange]);

  useEffect(() => {
    // Animate metrics when data changes
    const timer = setTimeout(() => {
      setAnimatedMetrics({
        totalFollowers: accountData?.followers_count || 0,
        growthRate: Math.random() * 15 + 2, // Simulate realistic growth rate
        engagementRate: (accountData?.followers_count || 100000) > 50000 ? 2.5 : 4.2,
        avgReach: Math.floor((accountData?.followers_count || 100000) * 0.12),
        profileViews: Math.floor((accountData?.followers_count || 100000) * 0.08),
        bestTime: ['2:00 PM', '6:00 PM', '9:00 PM', '12:00 PM'][Math.floor(Math.random() * 4)]
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [accountData]);

  const loadAccountData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('id', selectedAccount)
        .single();

      if (error) throw error;
      if (data) {
        setAccountData(data);
        generateComprehensiveAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateComprehensiveAnalytics = (account: any) => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const metrics: MetricData[] = [];
    const hashtags: HashtagData[] = [];
    const content: ContentPerformance[] = [];

    // Generate historical data
    let currentFollowers = account.followers_count || 50000;
    let currentFollowing = account.following_count || 500;
    let currentPosts = account.posts_count || 1000;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate realistic growth patterns
      const growthVariation = (Math.random() - 0.5) * 0.1;
      currentFollowers += Math.floor(currentFollowers * growthVariation * 0.001);
      currentFollowing += Math.floor((Math.random() - 0.5) * 5);
      currentPosts += Math.floor(Math.random() * 2);
      
      const reach = Math.floor(currentFollowers * (0.08 + Math.random() * 0.12));
      const impressions = Math.floor(reach * (1.5 + Math.random() * 2));
      const engagement = Math.max(1.5, Math.min(12, (reach / 1000) + Math.random() * 3));
      
      metrics.push({
        date: date.toISOString().split('T')[0],
        followers: currentFollowers,
        following: currentFollowing,
        posts: currentPosts,
        engagement: parseFloat(engagement.toFixed(2)),
        reach: reach,
        impressions: impressions,
        profileViews: Math.floor(reach * 0.3),
        websiteClicks: Math.floor(reach * 0.05)
      });
    }

    // Generate hashtag performance data
    const popularHashtags = [
      'instagood', 'photooftheday', 'love', 'beautiful', 'fashion', 'tbt', 'followme',
      'picoftheday', 'follow', 'nature', 'like4like', 'travel', 'instagram', 'style',
      'repost', 'summer', 'art', 'instadaily', 'friends', 'music', 'fitness'
    ];

    popularHashtags.slice(0, 15).forEach(tag => {
      hashtags.push({
        hashtag: tag,
        usage: Math.floor(Math.random() * 50) + 10,
        avgEngagement: Math.random() * 8 + 2,
        trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable'
      });
    });

    // Generate content performance data
    const contentTypes: ContentPerformance[] = [
      {
        type: 'photo',
        avgLikes: Math.floor(currentFollowers * 0.04),
        avgComments: Math.floor(currentFollowers * 0.008),
        avgEngagement: 4.8,
        frequency: 45,
        bestTime: '2:00 PM'
      },
      {
        type: 'video',
        avgLikes: Math.floor(currentFollowers * 0.06),
        avgComments: Math.floor(currentFollowers * 0.012),
        avgEngagement: 7.2,
        frequency: 20,
        bestTime: '6:00 PM'
      },
      {
        type: 'reel',
        avgLikes: Math.floor(currentFollowers * 0.08),
        avgComments: Math.floor(currentFollowers * 0.015),
        avgEngagement: 9.5,
        frequency: 25,
        bestTime: '7:00 PM'
      },
      {
        type: 'carousel',
        avgLikes: Math.floor(currentFollowers * 0.05),
        avgComments: Math.floor(currentFollowers * 0.010),
        avgEngagement: 6.0,
        frequency: 10,
        bestTime: '9:00 AM'
      }
    ];

    setMetricData(metrics);
    setHashtagData(hashtags.sort((a, b) => b.usage - a.usage));
    setContentPerformance(contentTypes);

    // Generate audience insights
    setAudienceInsights({
      demographics: [
        { segment: '18-24', percentage: 35, growth: '+2.3%' },
        { segment: '25-34', percentage: 42, growth: '+1.8%' },
        { segment: '35-44', percentage: 18, growth: '+0.5%' },
        { segment: '45+', percentage: 5, growth: '-0.2%' }
      ],
      locations: [
        { country: 'United States', percentage: 28, growth: '+3.1%' },
        { country: 'United Kingdom', percentage: 15, growth: '+2.1%' },
        { country: 'Canada', percentage: 12, growth: '+1.8%' },
        { country: 'Australia', percentage: 8, growth: '+2.5%' },
        { country: 'Germany', percentage: 7, growth: '+1.2%' }
      ],
      activity: {
        peakHours: ['2-3 PM', '6-7 PM', '9-10 PM'],
        peakDays: ['Tuesday', 'Wednesday', 'Thursday'],
        weeklyPattern: Array.from({ length: 7 }, (_, i) => ({
          day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
          activity: Math.floor(Math.random() * 40) + 60
        }))
      }
    });

    // Generate growth predictions
    const predictions = [];
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      predictions.push({
        date: date.toISOString().split('T')[0],
        predictedFollowers: Math.floor(currentFollowers * (1 + (i * 0.001))),
        confidence: Math.max(70, 95 - (i * 0.8))
      });
    }
    setGrowthPredictions(predictions);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`;

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const chartColors = {
    primary: '#8B5CF6',
    secondary: '#F59E0B',
    success: '#10B981',
    danger: '#EF4444',
    info: '#3B82F6',
    warning: '#F59E0B'
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Total Followers</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(animatedMetrics.totalFollowers)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Growth Rate</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatPercentage(animatedMetrics.growthRate)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Engagement</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatPercentage(animatedMetrics.engagementRate)}
              </p>
            </div>
            <Heart className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Avg Reach</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatNumber(animatedMetrics.avgReach)}
              </p>
            </div>
            <Eye className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 p-4 rounded-lg border border-pink-200 dark:border-pink-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-600 dark:text-pink-400 text-sm font-medium">Profile Views</p>
              <p className="text-2xl font-bold text-pink-900 dark:text-pink-100">
                {formatNumber(animatedMetrics.profileViews)}
              </p>
            </div>
            <Activity className="h-8 w-8 text-pink-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 p-4 rounded-lg border border-indigo-200 dark:border-indigo-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">Best Time</p>
              <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">
                {animatedMetrics.bestTime}
              </p>
            </div>
            <Clock4 className="h-8 w-8 text-indigo-500" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Follower Growth Chart */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Follower Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="followers" 
                  stroke={chartColors.primary} 
                  fill={`${chartColors.primary}30`}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement Trends */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Engagement Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metricData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                <YAxis yAxisId="left" stroke={chartColors.info} />
                <YAxis yAxisId="right" orientation="right" stroke={chartColors.success} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar yAxisId="right" dataKey="reach" fill={chartColors.success} />
                <Line yAxisId="left" type="monotone" dataKey="engagement" stroke={chartColors.info} strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Content Performance & Hashtags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Performance */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Content Performance</h3>
          <div className="space-y-3">
            {contentPerformance.map((content) => (
              <div key={content.type} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{content.type.toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{content.type}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Best: {content.bestTime} • {content.frequency} posts
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatPercentage(content.avgEngagement)}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg Engagement</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hashtags */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Hashtags</h3>
          <div className="space-y-2">
            {hashtagData.slice(0, 8).map((hashtag) => (
              <div key={hashtag.hashtag} className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-purple-500" />
                  <span className="font-medium text-gray-900 dark:text-white">#{hashtag.hashtag}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{hashtag.usage} uses</span>
                  {getTrendIcon(hashtag.trend)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!selectedAccount) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">No Account Selected</h3>
          <p className="text-gray-400 dark:text-gray-500">Please select an Instagram account to view comprehensive analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Advanced Analytics...</h3>
          <p className="text-gray-500 dark:text-gray-400">Analyzing profile performance and generating insights</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {accountData ? `@${accountData.username}` : 'Account'} Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive insights and AI-powered recommendations</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>

          {/* View Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'growth', name: 'Growth', icon: TrendingUp },
              { id: 'engagement', name: 'Engagement', icon: Heart },
              { id: 'audience', name: 'Audience', icon: Users },
              { id: 'content', name: 'Content', icon: Sparkles },
              { id: 'competitors', name: 'Competitors', icon: Target }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-all duration-200 ${
                    selectedView === tab.id
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Analytics Content */}
      {renderOverview()}
    </div>
  );
}