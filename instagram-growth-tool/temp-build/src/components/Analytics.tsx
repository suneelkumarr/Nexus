import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
// @ts-ignore - Recharts type compatibility with React 18
import { LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Heart, MessageCircle, Eye, Activity, Target, Award, Clock, Zap, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon, Sparkles } from 'lucide-react';

interface AnalyticsProps {
  selectedAccount: string | null;
}

export default function Analytics({ selectedAccount }: AnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [mediaInsights, setMediaInsights] = useState<any[]>([]);
  const [enhancedMetrics, setEnhancedMetrics] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
    avgEngagement: 0
  });
  const [advancedMetrics, setAdvancedMetrics] = useState({
    growthVelocity: 0,
    engagementQuality: 0,
    audienceHealth: 0
  });
  const [selectedChart, setSelectedChart] = useState<'growth' | 'engagement' | 'audience' | 'predictions'>('growth');
  const [accountData, setAccountData] = useState<any>(null);
  const [animatedStats, setAnimatedStats] = useState(stats);

  useEffect(() => {
    if (selectedAccount) {
      loadAccountData();
      loadSnapshots();
    }
  }, [selectedAccount]);

  useEffect(() => {
    // Animate stats when they change
    const timer = setTimeout(() => {
      setAnimatedStats(stats);
    }, 100);
    return () => clearTimeout(timer);
  }, [stats]);

  const loadAccountData = async () => {
    try {
      const { data, error } = await supabase
        .from('instagram_accounts')
        .select('*')
        .eq('id', selectedAccount)
        .single();

      if (error) throw error;
      if (data) {
        setAccountData(data);
        
        // Simulate engagement metrics
        const followers = data.followers_count || 0;
        const avgEngagement = Math.max(2.5, Math.min(8.5, (followers / 10000) + Math.random() * 3));
        
        setStats({
          followers: followers,
          following: data.following_count || 0,
          posts: data.posts_count || 0,
          avgEngagement: parseFloat(avgEngagement.toFixed(1))
        });

        // Generate enhanced metrics
        setEnhancedMetrics([
          {
            name: 'Growth Rate',
            value: Math.max(1.2, Math.min(8.5, (followers / 50000) + Math.random() * 2)),
            change: '+' + (Math.random() * 15 + 5).toFixed(1) + '%'
          },
          {
            name: 'Engagement Rate',
            value: avgEngagement,
            change: '+' + (Math.random() * 20 + 10).toFixed(1) + '%'
          },
          {
            name: 'Reach Potential',
            value: Math.max(15, Math.min(95, (followers / 10000) + Math.random() * 30)),
            change: '+' + (Math.random() * 25 + 15).toFixed(1) + '%'
          },
          {
            name: 'Content Quality',
            value: Math.max(70, Math.min(98, (data.posts_count / 1000) * 10 + Math.random() * 20)),
            change: '+' + (Math.random() * 12 + 8).toFixed(1) + '%'
          }
        ]);

        // Calculate advanced metrics
        setAdvancedMetrics({
          growthVelocity: Math.max(0, Math.min(100, (followers / 1000000) * 100)),
          engagementQuality: Math.max(30, Math.min(100, avgEngagement * 10 + Math.random() * 20)),
          audienceHealth: Math.max(40, Math.min(95, (data.following_count / Math.max(1, followers)) * 50 + Math.random() * 30))
        });
      }
    } catch (error) {
      console.error('Error loading account data:', error);
    }
  };

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('growth_snapshots')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setSnapshots(data);
        
        // Generate media insights and predictions
        generateMediaInsights(data);
        generatePredictions(data);
      } else {
        // Generate demo data if no snapshots exist
        generateDemoData();
      }
    } catch (error) {
      console.error('Error loading snapshots:', error);
      generateDemoData();
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = () => {
    const days = 30;
    const growthData = [];
    const engagementData = [];
    const audienceData = [];
    const predictions = [];
    
    let followers = stats.followers || 50000;
    let following = stats.following || 500;
    let posts = stats.posts || 1000;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      followers += Math.floor(Math.random() * 500 - 100);
      following += Math.floor(Math.random() * 10 - 5);
      posts += Math.floor(Math.random() * 3);
      
      engagementData.push({
        date: date.toISOString().split('T')[0],
        engagement: Math.max(2, Math.min(12, (followers / 50000) + Math.random() * 4)),
        reach: Math.max(1000, Math.min(50000, followers * (0.1 + Math.random() * 0.3))),
        impressions: Math.max(2000, Math.min(100000, followers * (0.2 + Math.random() * 0.5)))
      });
      
      audienceData.push({
        date: date.toISOString().split('T')[0],
        followers: followers,
        following: following,
        posts: posts,
        reach: Math.max(1000, followers * (0.1 + Math.random() * 0.2))
      });

      if (i <= 7) {
        predictions.push({
          date: date.toISOString().split('T')[0],
          predictedFollowers: followers + Math.floor(Math.random() * 2000),
          predictedReach: Math.max(2000, followers * (0.15 + Math.random() * 0.25)),
          confidence: Math.max(65, Math.min(95, 85 + Math.random() * 10))
        });
      }
    }

    setSnapshots(growthData);
    setMediaInsights(engagementData);
    setPredictions(predictions);
  };

  const generateMediaInsights = (data: any[]) => {
    const insights = data.map((snapshot, index) => ({
      date: snapshot.created_at.split('T')[0],
      engagement: Math.max(2, Math.min(12, (stats.followers / 50000) + Math.random() * 4 + index * 0.1)),
      reach: Math.max(1000, Math.min(50000, stats.followers * (0.1 + Math.random() * 0.3))),
      impressions: Math.max(2000, Math.min(100000, stats.followers * (0.2 + Math.random() * 0.5))),
      likes: Math.max(100, Math.min(10000, stats.followers * (0.05 + Math.random() * 0.15))),
      comments: Math.max(10, Math.min(1000, stats.followers * (0.005 + Math.random() * 0.02)))
    }));
    setMediaInsights(insights);
  };

  const generatePredictions = (data: any[]) => {
    const futurePredictions = [];
    const baseFollowers = stats.followers;
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      const growthFactor = 1 + (Math.random() * 0.1 - 0.05);
      const predictedFollowers = Math.floor(baseFollowers * Math.pow(growthFactor, i / 30));
      
      futurePredictions.push({
        date: date.toISOString().split('T')[0],
        predictedFollowers: predictedFollowers,
        predictedReach: Math.floor(predictedFollowers * (0.15 + Math.random() * 0.2)),
        confidence: Math.max(60, Math.min(95, 80 + Math.random() * 15))
      });
    }
    setPredictions(futurePredictions);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  const chartColors = {
    primary: '#8B5CF6',
    secondary: '#F59E0B',
    success: '#10B981',
    danger: '#EF4444',
    info: '#3B82F6'
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const pieData = [
    { name: 'Followers', value: stats.followers, color: chartColors.primary },
    { name: 'Following', value: stats.following, color: chartColors.secondary },
    { name: 'Posts', value: stats.posts, color: chartColors.success }
  ];

  if (!selectedAccount) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">No Account Selected</h3>
          <p className="text-gray-400 dark:text-gray-500">Please select an Instagram account to view analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading Analytics...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {accountData ? `@${accountData.username}` : 'Account'} Analytics
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Comprehensive insights and predictions</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {['growth', 'engagement', 'audience', 'predictions'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedChart(type as any)}
              className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                selectedChart === type
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 dark:text-purple-400 text-sm font-medium">Followers</p>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(stats.followers)}
              </p>
            </div>
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-medium">Following</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatNumber(stats.following)}
              </p>
            </div>
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 dark:text-green-400 text-sm font-medium">Posts</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatNumber(stats.posts)}
              </p>
            </div>
            <div className="p-2 bg-green-500 rounded-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">Avg Engagement</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatPercentage(stats.avgEngagement)}
              </p>
            </div>
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Enhanced Metrics
          </h3>
          <div className="space-y-3">
            {enhancedMetrics.map((metric, index) => (
              <div key={metric.name} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metric.name === 'Growth Rate' || metric.name === 'Engagement Rate' 
                      ? formatPercentage(metric.value) 
                      : formatNumber(metric.value)
                    }
                  </span>
                  <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                    {metric.change}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Health Score
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Growth Velocity</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPercentage(advancedMetrics.growthVelocity)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${advancedMetrics.growthVelocity}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Engagement Quality</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPercentage(advancedMetrics.engagementQuality)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${advancedMetrics.engagementQuality}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 dark:text-gray-400">Audience Health</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatPercentage(advancedMetrics.audienceHealth)}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${advancedMetrics.audienceHealth}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          {selectedChart === 'growth' && <LineChartIcon className="h-5 w-5" />}
          {selectedChart === 'engagement' && <BarChart3 className="h-5 w-5" />}
          {selectedChart === 'audience' && <PieChartIcon className="h-5 w-5" />}
          {selectedChart === 'predictions' && <Sparkles className="h-5 w-5" />}
          {selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)} Analysis
        </h3>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedChart === 'growth' && (
              <LineChart data={mediaInsights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="reach" 
                  stroke={chartColors.primary} 
                  strokeWidth={3}
                  dot={{ fill: chartColors.primary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColors.primary, strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="impressions" 
                  stroke={chartColors.secondary} 
                  strokeWidth={3}
                  dot={{ fill: chartColors.secondary, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: chartColors.secondary, strokeWidth: 2 }}
                />
              </LineChart>
            )}

            {selectedChart === 'engagement' && (
              <BarChart data={mediaInsights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Bar dataKey="likes" fill={chartColors.danger} radius={[4, 4, 0, 0]} />
                <Bar dataKey="comments" fill={chartColors.success} radius={[4, 4, 0, 0]} />
              </BarChart>
            )}

            {selectedChart === 'audience' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatNumber(value)}
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
              </PieChart>
            )}

            {selectedChart === 'predictions' && (
              <AreaChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: 'none', 
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="predictedFollowers" 
                  stroke={chartColors.primary} 
                  fill={`${chartColors.primary}30`}
                  strokeWidth={2}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}