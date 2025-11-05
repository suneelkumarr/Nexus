import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { Camera, Calendar, TrendingUp, Download, Target } from 'lucide-react';

interface PostFrequencyChartProps {
  timeRange: '7d' | '30d' | '3m' | '1y';
  data?: any[];
}

interface MockPostData {
  period: string;
  posts: number;
  stories: number;
  reels: number;
  avgLikes: number;
  target?: number;
}

export default function PostFrequencyChart({ timeRange, data }: PostFrequencyChartProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [showStories, setShowStories] = useState(true);
  const [showReels, setShowReels] = useState(true);

  // Generate realistic mock data for post frequency
  const mockData: MockPostData[] = useMemo(() => {
    const periods = [];
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        // Weekly data - last 7 weeks
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          periods.push({
            period: `Week ${7-i}`,
            date: date
          });
        }
        break;
      case '30d':
        // Weekly data for last month - 4 weeks
        for (let i = 3; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          periods.push({
            period: `Week ${4-i}`,
            date: date
          });
        }
        break;
      case '3m':
        // Weekly data for 3 months - 12 weeks
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          periods.push({
            period: `Week ${12-i}`,
            date: date
          });
        }
        break;
      case '1y':
        // Monthly data for 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - i);
          periods.push({
            period: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
            date: date
          });
        }
        break;
    }

    return periods.map((period, index) => {
      // Base posting consistency with some variation
      const basePosts = timeRange === '1y' ? 18 : 4; // ~4 posts/week or 18/month
      const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
      
      // Weekend patterns - fewer posts on weekends
      const weekendPenalty = period.date.getDay() === 0 || period.date.getDay() === 6 ? -1 : 0;
      
      // Consistency streak bonus/penalty
      const consistencyBonus = index > 0 ? (Math.random() - 0.5) * 0.1 : 0;
      
      let posts = Math.max(1, Math.round(basePosts * (1 + variation + consistencyBonus) + weekendPenalty));
      
      // Stories and Reels proportional to posts
      const stories = Math.round(posts * (1.5 + Math.random())); // 1.5-2.5x posts
      const reels = Math.round(posts * (0.3 + Math.random() * 0.2)); // 30-50% of posts
      
      // Engagement metrics
      const avgLikes = Math.round(posts * (120 + Math.random() * 80)); // 120-200 likes per post avg
      
      return {
        period: period.period,
        posts,
        stories,
        reels,
        avgLikes,
        target: showTarget ? Math.round(posts * 1.2) : undefined
      };
    });
  }, [timeRange, showTarget]);

  const stats = useMemo(() => {
    if (mockData.length === 0) return { 
      totalPosts: 0, 
      avgPerWeek: 0, 
      consistency: 0, 
      topWeek: { period: '', posts: 0 }
    };

    const totalPosts = mockData.reduce((sum, item) => sum + item.posts, 0);
    const avgPerWeek = Math.round(totalPosts / mockData.length);
    
    // Calculate consistency (lower standard deviation = higher consistency)
    const mean = avgPerWeek;
    const variance = mockData.reduce((sum, item) => sum + Math.pow(item.posts - mean, 2), 0) / mockData.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, Math.round(100 - (standardDeviation / mean * 100)));
    
    // Find best week/month
    const topWeek = mockData.reduce((max, item) => 
      item.posts > max.posts ? { period: item.period, posts: item.posts } : max,
      { period: '', posts: 0 }
    );

    return {
      totalPosts,
      avgPerWeek,
      consistency,
      topWeek
    };
  }, [mockData]);

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
        ['Period', 'Posts', 'Stories', 'Reels', 'Avg Likes'],
        ...mockData.map(row => [row.period, row.posts, row.stories, row.reels, row.avgLikes])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `post-frequency-${timeRange}.csv`;
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
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
          {payload[0] && (
            <p className="text-xs text-gray-300 mt-1">
              Avg Likes: {formatNumber(mockData.find(d => d.period === label)?.avgLikes || 0)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Post Frequency Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Content publishing patterns</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setShowStories(!showStories)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                showStories 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Stories
            </button>
            <button
              onClick={() => setShowReels(!showReels)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                showReels 
                  ? 'bg-pink-500 text-white' 
                  : 'bg-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              Reels
            </button>
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Posts</span>
            <Camera className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.totalPosts)}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            All time periods
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-4 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Per Period</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatNumber(stats.avgPerWeek)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {timeRange === '1y' ? 'Per month' : 'Per week'}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Consistency</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.consistency}%
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Posting regularity
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Best Period</span>
            <Target className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {stats.topWeek.period}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            {stats.topWeek.posts} posts
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="period" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="rect"
            />
            <Bar
              dataKey="posts"
              fill="#8B5CF6"
              name="Posts"
              radius={[4, 4, 0, 0]}
            />
            {showStories && (
              <Bar
                dataKey="stories"
                fill="#F97316"
                name="Stories"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showReels && (
              <Bar
                dataKey="reels"
                fill="#EC4899"
                name="Reels"
                radius={[4, 4, 0, 0]}
              />
            )}
            {showTarget && (
              <ReferenceLine 
                y={stats.avgPerWeek * 1.2} 
                stroke="#10B981" 
                strokeDasharray="5 5" 
                label={{ value: "Target", position: "topRight" }}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Content Type Breakdown */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(mockData.reduce((sum, item) => sum + item.posts, 0) / mockData.length)}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400">Avg Posts/Week</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
          <div className="text-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(mockData.reduce((sum, item) => sum + item.stories, 0) / mockData.length)}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400">Avg Stories/Week</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-xl p-4 border border-pink-200/50 dark:border-pink-700/50">
          <div className="text-center">
            <div className="w-8 h-8 bg-pink-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              {Math.round(mockData.reduce((sum, item) => sum + item.reels, 0) / mockData.length)}
            </p>
            <p className="text-sm text-pink-600 dark:text-pink-400">Avg Reels/Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}