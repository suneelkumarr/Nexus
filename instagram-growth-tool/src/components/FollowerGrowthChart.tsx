import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, RefreshCw, BarChart3 } from 'lucide-react';
import { format, subDays } from 'date-fns';

interface FollowerGrowthChartProps {
  accountId: string;
}

export default function FollowerGrowthChart({ accountId }: FollowerGrowthChartProps) {
  const [loading, setLoading] = useState(false);
  const [growthData, setGrowthData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState({
    totalGrowth: 0,
    avgDailyGrowth: 0,
    growthRate: 0,
    trend: 'up' as 'up' | 'down',
  });

  useEffect(() => {
    if (accountId) {
      loadGrowthData();
    }
  }, [accountId, timeRange]);

  const loadGrowthData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = subDays(new Date(), days);

      // Fetch follower growth tracking data
      const { data: trackingData, error: trackingError } = await supabase
        .from('follower_growth_tracking')
        .select('*')
        .eq('account_id', accountId)
        .gte('tracking_date', startDate.toISOString())
        .order('tracking_date', { ascending: true });

      if (trackingError) throw trackingError;

      // If no tracking data, fetch analytics snapshots
      if (!trackingData || trackingData.length === 0) {
        const { data: snapshotData, error: snapshotError } = await supabase
          .from('analytics_snapshots')
          .select('*')
          .eq('account_id', accountId)
          .gte('snapshot_date', startDate.toISOString())
          .order('snapshot_date', { ascending: true });

        if (snapshotError) throw snapshotError;

        if (snapshotData && snapshotData.length > 0) {
          const formattedData = snapshotData.map((item, index) => ({
            date: format(new Date(item.snapshot_date), 'MMM dd'),
            followers: item.followers_count || 0,
            growth: index > 0 ? (item.followers_count || 0) - (snapshotData[index - 1].followers_count || 0) : 0,
            engagement: item.engagement_rate || 0,
          }));
          setGrowthData(formattedData);
          calculateStats(formattedData);
        } else {
          // No data available
          setGrowthData([]);
          setStats({
            totalGrowth: 0,
            avgDailyGrowth: 0,
            growthRate: 0,
            trend: 'up',
          });
        }
      } else {
        const formattedData = trackingData.map((item) => ({
          date: format(new Date(item.tracking_date), 'MMM dd'),
          followers: item.followers_count || 0,
          growth: item.net_growth || 0,
          engagement: item.engagement_rate || 0,
        }));
        setGrowthData(formattedData);
        calculateStats(formattedData);
      }
    } catch (error) {
      console.error('Error loading growth data:', error);
      setGrowthData([]);
      setStats({
        totalGrowth: 0,
        avgDailyGrowth: 0,
        growthRate: 0,
        trend: 'up',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data: any[]) => {
    if (data.length === 0) return;

    const firstValue = data[0].followers;
    const lastValue = data[data.length - 1].followers;
    const totalGrowth = lastValue - firstValue;
    const avgDailyGrowth = Math.round(totalGrowth / data.length);
    const growthRate = firstValue > 0 ? ((totalGrowth / firstValue) * 100) : 0;

    setStats({
      totalGrowth,
      avgDailyGrowth,
      growthRate: parseFloat(growthRate.toFixed(2)),
      trend: totalGrowth >= 0 ? 'up' : 'down',
    });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Empty state - no growth data yet
  if (growthData.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-16">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-cyan-50 to-purple-100 dark:from-blue-900/30 dark:via-cyan-900/20 dark:to-purple-900/30 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
              
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Growth Data Available
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Follower growth tracking data will appear here once analytics snapshots are captured over time. Data is typically collected daily.
              </p>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      How Growth Tracking Works
                    </h4>
                    <div className="space-y-2">
                      <p className="text-blue-800 dark:text-blue-200 text-sm">
                        The system automatically captures daily snapshots of your follower count, allowing you to track growth trends over time.
                      </p>
                      <p className="text-blue-800 dark:text-blue-200 text-sm mt-4">
                        Check back in 24-48 hours to see your first growth data points and trends.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Follower Growth</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Track your audience growth over time</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadGrowthData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
          
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Growth</span>
            {stats.trend === 'up' ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.totalGrowth > 0 ? '+' : ''}{formatNumber(stats.totalGrowth)}
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
            {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}% change
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Daily Growth</span>
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.avgDailyGrowth > 0 ? '+' : ''}{stats.avgDailyGrowth}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Followers per day
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Current Followers</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {growthData.length > 0 ? formatNumber(growthData[growthData.length - 1].followers) : '0'}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Total audience size
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={growthData}>
            <defs>
              <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '12px' }}
              tickFormatter={(value) => formatNumber(value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
              labelStyle={{ color: '#F9FAFB', fontWeight: 'bold' }}
              itemStyle={{ color: '#3B82F6' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="followers"
              stroke="#3B82F6"
              strokeWidth={3}
              fill="url(#colorFollowers)"
              name="Followers"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Growth Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6 mt-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Daily Net Growth</h4>
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={growthData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
            <XAxis 
              dataKey="date" 
              stroke="#6B7280"
              style={{ fontSize: '10px' }}
            />
            <YAxis 
              stroke="#6B7280"
              style={{ fontSize: '10px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Net Growth"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
