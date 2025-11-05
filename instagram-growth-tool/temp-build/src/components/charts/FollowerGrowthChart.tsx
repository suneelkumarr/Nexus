import { useState, useMemo } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Download, BarChart3 } from 'lucide-react';
import HoverableCard from '@/components/UI/HoverableCard';
import LoadingSpinner, { ButtonLoader } from '@/components/UI/LoadingSpinner';
import IconWrapper from '@/components/UI/IconWrapper';
import ProgressBar from '@/components/UI/ProgressBar';
import { cn } from '@/lib/utils';

interface FollowerGrowthChartProps {
  timeRange: '7d' | '30d' | '3m' | '1y';
  data?: any[];
}

interface MockFollowerData {
  date: string;
  followers: number;
  growth: number;
  target?: number;
}

export default function FollowerGrowthChart({ timeRange, data }: FollowerGrowthChartProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showTarget, setShowTarget] = useState(false);

  // Generate realistic mock data based on time range
  const mockData: MockFollowerData[] = useMemo(() => {
    const now = new Date();
    let days = 7;
    switch (timeRange) {
      case '7d': days = 7; break;
      case '30d': days = 30; break;
      case '3m': days = 90; break;
      case '1y': days = 365; break;
    }

    const data: MockFollowerData[] = [];
    const startFollowers = 12500; // Realistic starting follower count
    let currentFollowers = startFollowers;

    // Add seasonal variations and realistic growth patterns
    const baseGrowthRate = 0.02; // 2% average growth
    const weekendDrops = [0, 6]; // Sundays and Saturdays
    const mondayBumps = [1]; // Mondays get slightly better engagement

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayOfWeek = date.getDay();
      let dailyGrowth = 0;
      
      if (weekendDrops.includes(dayOfWeek)) {
        // Weekend slight drop
        dailyGrowth = Math.floor(currentFollowers * (Math.random() * 0.001 - 0.002));
      } else if (mondayBumps.includes(dayOfWeek)) {
        // Monday bump
        dailyGrowth = Math.floor(currentFollowers * (Math.random() * 0.003 + 0.001));
      } else {
        // Regular weekday growth
        dailyGrowth = Math.floor(currentFollowers * (Math.random() * 0.001 + baseGrowthRate/7));
      }

      currentFollowers += dailyGrowth;

      // Add some random spikes and dips
      const randomFactor = Math.random();
      if (randomFactor > 0.95) {
        // Major growth day (5% chance)
        currentFollowers += Math.floor(currentFollowers * 0.01);
        dailyGrowth += Math.floor(currentFollowers * 0.01);
      } else if (randomFactor < 0.02) {
        // Major drop day (2% chance)
        currentFollowers -= Math.floor(currentFollowers * 0.005);
        dailyGrowth -= Math.floor(currentFollowers * 0.005);
      }

      data.push({
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }),
        followers: currentFollowers,
        growth: dailyGrowth,
        target: showTarget ? currentFollowers * 1.1 : undefined
      });
    }

    return data;
  }, [timeRange, showTarget]);

  const stats = useMemo(() => {
    if (mockData.length < 2) return { totalGrowth: 0, avgDailyGrowth: 0, growthRate: 0, trend: 'up' as const };
    
    const firstFollowers = mockData[0].followers;
    const lastFollowers = mockData[mockData.length - 1].followers;
    const totalGrowth = lastFollowers - firstFollowers;
    const avgDailyGrowth = Math.round(totalGrowth / mockData.length);
    const growthRate = firstFollowers > 0 ? ((totalGrowth / firstFollowers) * 100) : 0;

    return {
      totalGrowth,
      avgDailyGrowth,
      growthRate: parseFloat(growthRate.toFixed(2)),
      trend: totalGrowth >= 0 ? 'up' as const : 'down' as const,
    };
  }, [mockData]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Simulate export functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a simple CSV export
      const csvContent = [
        ['Date', 'Followers', 'Daily Growth', 'Target'],
        ...mockData.map(row => [row.date, row.followers, row.growth, row.target || ''])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `follower-growth-${timeRange}.csv`;
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
              {entry.name}: {entry.name === 'Followers' ? formatNumber(entry.value) : 
                (entry.value > 0 ? '+' : '') + formatNumber(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <HoverableCard className="transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <IconWrapper
            icon={TrendingUp}
            color="primary"
            size="lg"
            variant="filled"
            shape="rounded"
            animated
            className="shadow-lg"
          />
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Follower Growth Trend</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Audience growth over time</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <IconWrapper
            icon={showTarget ? BarChart3 : Calendar}
            color={showTarget ? "info" : "neutral"}
            variant={showTarget ? "filled" : "ghost"}
            size="sm"
            animated
            onClick={() => setShowTarget(!showTarget)}
            tooltip={showTarget ? "Hide target line" : "Show target line"}
          />
          <IconWrapper
            icon={Download}
            color="neutral"
            variant="ghost"
            size="sm"
            animated
            onClick={handleExport}
            disabled={isExporting}
            loading={isExporting}
            tooltip={isExporting ? "Exporting..." : "Export data"}
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <HoverableCard 
          hoverScale 
          subtleShadow 
          padding="md" 
          className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700"
          onHover={(hovered) => {/* Add hover analytics */}}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Growth</span>
            <IconWrapper
              icon={stats.trend === 'up' ? TrendingUp : TrendingDown}
              color={stats.trend === 'up' ? 'success' : 'error'}
              size="sm"
              animated={hovered}
              pulse={stats.trend === 'up'}
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.totalGrowth > 0 ? '+' : ''}{formatNumber(stats.totalGrowth)}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {stats.growthRate > 0 ? '+' : ''}{stats.growthRate}% change
            </span>
            <ProgressBar
              value={Math.abs(stats.growthRate)}
              max={20}
              color="primary"
              size="xs"
              showLabel={false}
              className="flex-1"
            />
          </div>
        </HoverableCard>

        <HoverableCard 
          hoverScale 
          subtleShadow 
          padding="md"
          className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-700"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Daily Growth</span>
            <IconWrapper
              icon={Calendar}
              color="secondary"
              size="sm"
              animated
              pulse
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {stats.avgDailyGrowth > 0 ? '+' : ''}{stats.avgDailyGrowth}
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400">
            Followers per day
          </p>
          <ProgressBar
            value={stats.avgDailyGrowth}
            max={200}
            color="secondary"
            size="xs"
            showLabel={false}
            className="mt-3"
          />
        </HoverableCard>

        <HoverableCard 
          hoverScale 
          subtleShadow 
          padding="md"
          className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Current Followers</span>
            <IconWrapper
              icon={BarChart3}
              color="success"
              size="sm"
              animated
              glow
            />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatNumber(mockData[mockData.length - 1]?.followers || 0)}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400">
            Total audience size
          </p>
          <ProgressBar
            value={mockData[mockData.length - 1]?.followers || 0}
            max={50000}
            color="success"
            size="xs"
            showLabel={false}
            className="mt-3"
          />
        </HoverableCard>
      </div>

      {/* Main Chart */}
      <HoverableCard 
        className="bg-gray-50 dark:bg-gray-900 border-0 shadow-none"
        hoverShadow={false}
        hoverScale={false}
        padding="lg"
        rounded="xl"
      >
        <div className="relative">
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={mockData}>
              <defs>
                <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
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
                className="hover:text-primary-600 transition-colors duration-200"
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                tickFormatter={formatNumber}
                className="hover:text-primary-600 transition-colors duration-200"
              />
              <Tooltip 
                content={<CustomTooltip />}
                contentStyle={{
                  backgroundColor: 'rgba(31, 41, 55, 0.95)',
                  border: '1px solid rgba(75, 85, 99, 0.5)',
                  borderRadius: '8px',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {value}
                  </span>
                )}
              />
              {showTarget && (
                <ReferenceLine 
                  y={mockData[mockData.length - 1]?.followers * 1.1} 
                  stroke="#10B981" 
                  strokeDasharray="5 5" 
                  label={{ value: "Target", position: "topRight" }}
                  strokeOpacity={0.8}
                />
              )}
              <Area
                type="monotone"
                dataKey="followers"
                stroke="#3B82F6"
                strokeWidth={3}
                fill="url(#colorFollowers)"
                name="Followers"
                dot={{ r: 4, fill: '#3B82F6', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ 
                  r: 8, 
                  stroke: '#3B82F6', 
                  strokeWidth: 3, 
                  fill: '#ffffff',
                  filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))'
                }}
                className="hover:stroke-primary-600 transition-all duration-300"
              />
              {showTarget && (
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke="#10B981"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorTarget)"
                  name="Target"
                  dot={false}
                  activeDot={{ 
                    r: 6, 
                    stroke: '#10B981', 
                    strokeWidth: 2, 
                    fill: '#ffffff' 
                  }}
                  className="hover:stroke-green-600 transition-all duration-300"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Chart overlay for additional info */}
          <div className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span>Live data</span>
            </div>
          </div>
        </div>
      </HoverableCard>
    </HoverableCard>
  );
}