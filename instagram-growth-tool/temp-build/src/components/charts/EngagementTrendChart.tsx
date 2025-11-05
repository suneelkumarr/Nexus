import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine,
  Brush
} from 'recharts';
import { Heart, TrendingUp, TrendingDown, Download, Target, Zap } from 'lucide-react';

interface EngagementTrendChartProps {
  timeRange: '7d' | '30d' | '3m' | '1y';
  data?: any[];
}

interface EngagementData {
  date: string;
  engagementRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  storyViews?: number;
  reelViews?: number;
  target?: number;
  trend: 'up' | 'down' | 'stable';
}

export default function EngagementTrendChart({ timeRange, data }: EngagementTrendChartProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [showIndividualMetrics, setShowIndividualMetrics] = useState(false);
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [smoothCurves, setSmoothCurves] = useState(true);

  // Generate realistic engagement data with smooth curves
  const engagementData: EngagementData[] = useMemo(() => {
    const now = new Date();
    let days = 7;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '3m': days = 90; break;
      case '1y': days = 365; break;
    }

    const data: EngagementData[] = [];
    let baseEngagement = 4.2; // Starting at 4.2% engagement
    const trendDirection = Math.random() > 0.3 ? 'up' : (Math.random() > 0.5 ? 'stable' : 'down');
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Create smooth curve with some variation
      const progress = (days - i) / days;
      let trendAdjustment = 0;
      
      if (trendDirection === 'up') {
        trendAdjustment = progress * 0.8; // Gradual upward trend
      } else if (trendDirection === 'down') {
        trendAdjustment = -progress * 0.5; // Gradual downward trend
      }
      
      // Add sine wave for natural fluctuations
      const seasonalVariation = Math.sin(progress * Math.PI * 2) * 0.3;
      
      // Add weekday patterns (better engagement on weekends and Mondays)
      const dayOfWeek = date.getDay();
      let dayPattern = 0;
      if (dayOfWeek === 0) dayPattern = -0.2; // Sunday slight dip
      else if (dayOfWeek === 1) dayPattern = 0.3; // Monday boost
      else if (dayOfWeek === 5 || dayOfWeek === 6) dayPattern = 0.1; // Weekend boost
      
      // Random variation
      const randomVariation = (Math.random() - 0.5) * 0.4;
      
      const engagementRate = Math.max(1.5, Math.min(8.5, 
        baseEngagement + trendAdjustment + seasonalVariation + dayPattern + randomVariation
      ));
      
      // Calculate related metrics
      const reach = Math.round(1200 + Math.random() * 800); // 1200-2000 reach
      const impressions = Math.round(reach * (1.8 + Math.random() * 0.4)); // 1.8-2.2x reach
      const likes = Math.round((engagementRate / 100) * reach * (0.85 + Math.random() * 0.1));
      const comments = Math.round(likes * (0.08 + Math.random() * 0.04));
      const shares = Math.round(likes * (0.03 + Math.random() * 0.02));
      const saves = Math.round(likes * (0.15 + Math.random() * 0.05));
      
      // Story and Reel views for longer time ranges
      let storyViews, reelViews;
      if (days > 30) {
        storyViews = Math.round(reach * (0.6 + Math.random() * 0.2));
        reelViews = Math.round(reach * (0.4 + Math.random() * 0.3));
      }
      
      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (i > 0) {
        const prevRate = data[data.length - 1]?.engagementRate || baseEngagement;
        const change = ((engagementRate - prevRate) / prevRate) * 100;
        if (change > 2) trend = 'up';
        else if (change < -2) trend = 'down';
      }

      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        likes,
        comments,
        shares,
        saves,
        reach,
        impressions,
        storyViews,
        reelViews,
        target: showTarget ? engagementRate * 1.15 : undefined,
        trend
      });
    }

    return data;
  }, [timeRange, showTarget]);

  const stats = useMemo(() => {
    if (engagementData.length === 0) {
      return { 
        avgEngagement: 0, 
        peakEngagement: 0, 
        lowestEngagement: 0, 
        totalLikes: 0,
        trend: 'stable' as const,
        volatility: 0
      };
    }

    const engagementRates = engagementData.map(d => d.engagementRate);
    const avgEngagement = engagementRates.reduce((sum, rate) => sum + rate, 0) / engagementRates.length;
    const peakEngagement = Math.max(...engagementRates);
    const lowestEngagement = Math.min(...engagementRates);
    const totalLikes = engagementData.reduce((sum, item) => sum + item.likes, 0);
    
    // Calculate trend
    const firstHalf = engagementRates.slice(0, Math.floor(engagementRates.length / 2));
    const secondHalf = engagementRates.slice(Math.floor(engagementRates.length / 2));
    const firstAvg = firstHalf.reduce((sum, rate) => sum + rate, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, rate) => sum + rate, 0) / secondHalf.length;
    const trendDirection = secondAvg > firstAvg * 1.05 ? 'up' : 
                          secondAvg < firstAvg * 0.95 ? 'down' : 'stable';
    
    // Calculate volatility (coefficient of variation)
    const variance = engagementRates.reduce((sum, rate) => sum + Math.pow(rate - avgEngagement, 2), 0) / engagementRates.length;
    const volatility = (Math.sqrt(variance) / avgEngagement) * 100;

    return {
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      peakEngagement,
      lowestEngagement,
      totalLikes,
      trend: trendDirection,
      volatility: parseFloat(volatility.toFixed(1))
    };
  }, [engagementData]);

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = [
        ['Date', 'Engagement Rate', 'Likes', 'Comments', 'Shares', 'Saves', 'Reach', 'Impressions'],
        ...engagementData.map(row => [
          row.date,
          row.engagementRate,
          row.likes,
          row.comments,
          row.shares,
          row.saves,
          row.reach,
          row.impressions
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `engagement-trends-${timeRange}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = engagementData.find(d => d.date === label);
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg max-w-xs">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name === 'Engagement Rate' ? `${entry.value}%` : formatNumber(entry.value)}
            </p>
          ))}
          {data && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs text-gray-300">
                <span className="text-pink-400">❤️ {formatNumber(data.likes)}</span>
                <span className="text-blue-400 ml-2">💬 {data.comments}</span>
                <span className="text-green-400 ml-2">📤 {data.shares}</span>
                <span className="text-yellow-400 ml-2">🔖 {data.saves}</span>
              </p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const curveType = smoothCurves ? "monotone" : "linear";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl flex items-center justify-center">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Engagement Rate Trends</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Audience interaction patterns</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowIndividualMetrics(!showIndividualMetrics)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showIndividualMetrics 
                ? 'bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Detailed
          </button>
          <button
            onClick={() => setSmoothCurves(!smoothCurves)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              smoothCurves 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Smooth
          </button>
          <button
            onClick={() => setShowTarget(!showTarget)}
            className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              showTarget 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Target
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/30 dark:to-pink-800/30 rounded-xl p-4 border border-pink-200/50 dark:border-pink-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-pink-700 dark:text-pink-300">Avg Engagement</span>
            {stats.trend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : stats.trend === 'down' ? (
              <TrendingDown className="w-5 h-5 text-red-600" />
            ) : (
              <Target className="w-5 h-5 text-yellow-600" />
            )}
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.avgEngagement}%
          </p>
          <p className="text-sm text-pink-600 dark:text-pink-400 mt-1">
            {stats.trend === 'up' ? 'Growing' : stats.trend === 'down' ? 'Declining' : 'Stable'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Peak Rate</span>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.peakEngagement}%
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Best performance
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-xl p-4 border border-red-200/50 dark:border-red-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-700 dark:text-red-300">Lowest Rate</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.lowestEngagement}%
          </p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Needs improvement
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Likes</span>
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalLikes)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            All time periods
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Volatility</span>
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.volatility}%
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Rate stability
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={350}>
          {chartType === 'area' ? (
            <AreaChart data={engagementData}>
              <defs>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EC4899" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {showTarget && (
                <ReferenceLine 
                  y={stats.avgEngagement * 1.15} 
                  stroke="#10B981" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "topRight" }}
                />
              )}
              <Area
                type={curveType}
                dataKey="engagementRate"
                stroke="#EC4899"
                strokeWidth={3}
                fill="url(#colorEngagement)"
                name="Engagement Rate"
                dot={{ r: 4, fill: '#EC4899', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2, fill: '#ffffff' }}
              />
              {showTarget && (
                <Area
                  type={curveType}
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorTarget)"
                  name="Target"
                  dot={false}
                />
              )}
              <Brush dataKey="date" height={30} stroke="#EC4899" />
            </AreaChart>
          ) : (
            <LineChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                domain={['dataMin - 0.5', 'dataMax + 0.5']}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              {showTarget && (
                <ReferenceLine 
                  y={stats.avgEngagement * 1.15} 
                  stroke="#10B981" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "topRight" }}
                />
              )}
              <Line
                type={curveType}
                dataKey="engagementRate"
                stroke="#EC4899"
                strokeWidth={3}
                dot={{ r: 4, fill: '#EC4899', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 6, stroke: '#EC4899', strokeWidth: 2, fill: '#ffffff' }}
                name="Engagement Rate"
              />
              {showTarget && (
                <Line
                  type={curveType}
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              )}
              <Brush dataKey="date" height={30} stroke="#EC4899" />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Detailed Metrics (optional) */}
      {showIndividualMetrics && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200/50 dark:border-pink-700/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(engagementData.reduce((sum, item) => sum + item.likes, 0) / engagementData.length)}
              </p>
              <p className="text-sm text-pink-600 dark:text-pink-400">Avg Likes/Day</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(engagementData.reduce((sum, item) => sum + item.comments, 0) / engagementData.length)}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Avg Comments/Day</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-green-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(engagementData.reduce((sum, item) => sum + item.shares, 0) / engagementData.length)}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">Avg Shares/Day</p>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200/50 dark:border-yellow-700/50">
            <div className="text-center">
              <div className="w-8 h-8 bg-yellow-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 00-2 2v6H2a2 2 0 100 4h1v2a2 2 0 102 0v-2h1a2 2 0 100-4h-1V6a2 2 0 00-2-2H5zM10 8a2 2 0 012 2v4h-1V10a2 2 0 00-2-2h-1V6a2 2 0 00-2 2v2a2 2 0 002 2h1v2a2 2 0 002 2h1a2 2 0 002-2v-2h1a2 2 0 00-2-2h-1v-2a2 2 0 012-2h1z" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {Math.round(engagementData.reduce((sum, item) => sum + item.saves, 0) / engagementData.length)}
              </p>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Avg Saves/Day</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}