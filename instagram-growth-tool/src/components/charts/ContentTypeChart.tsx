import { useState, useMemo } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Camera, Play, Instagram, Download, TrendingUp, Users } from 'lucide-react';

interface ContentTypeChartProps {
  timeRange: '7d' | '30d' | '3m' | '1y';
  data?: any[];
}

interface ContentTypeData {
  name: string;
  value: number;
  percentage: number;
  engagement: number;
  avgLikes: number;
  color: string;
  icon: string;
}

export default function ContentTypeChart({ timeRange, data }: ContentTypeChartProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');

  // Realistic content type distribution based on Instagram analytics
  const contentData: ContentTypeData[] = useMemo(() => {
    // Base distribution percentages (realistic for most accounts)
    const baseDistribution = {
      posts: 60,      // 60% - Regular posts are most common
      stories: 25,    // 25% - Stories for daily updates
      reels: 15       // 15% - Reels for viral content
    };

    // Add some variation based on account type and time range
    let adjustedDistribution = { ...baseDistribution };
    
    if (timeRange === '7d') {
      // Recent week might have more reels due to trends
      adjustedDistribution.reels += 5;
      adjustedDistribution.posts -= 5;
    } else if (timeRange === '1y') {
      // Yearly view shows more stable patterns
      adjustedDistribution.stories += 3;
      adjustedDistribution.posts -= 3;
    }

    // Normalize to 100%
    const total = adjustedDistribution.posts + adjustedDistribution.stories + adjustedDistribution.reels;
    adjustedDistribution.posts = (adjustedDistribution.posts / total) * 100;
    adjustedDistribution.stories = (adjustedDistribution.stories / total) * 100;
    adjustedDistribution.reels = (adjustedDistribution.reels / total) * 100;

    // Calculate absolute values based on time range
    const timeMultipliers = {
      '7d': 1,
      '30d': 4.3,
      '3m': 13,
      '1y': 52
    };
    
    const totalContent = Math.round(28 * timeMultipliers[timeRange]); // Base 28 posts per week
    
    const contentTypes = [
      {
        name: 'Posts',
        value: Math.round((adjustedDistribution.posts / 100) * totalContent),
        percentage: adjustedDistribution.posts,
        engagement: 4.2, // Higher engagement for regular posts
        avgLikes: 145,
        color: '#8B5CF6',
        icon: 'Camera'
      },
      {
        name: 'Stories',
        value: Math.round((adjustedDistribution.stories / 100) * totalContent),
        percentage: adjustedDistribution.stories,
        engagement: 2.8, // Lower engagement but higher reach
        avgLikes: 89,
        color: '#F97316',
        icon: 'Circle'
      },
      {
        name: 'Reels',
        value: Math.round((adjustedDistribution.reels / 100) * totalContent),
        percentage: adjustedDistribution.reels,
        engagement: 7.1, // Highest engagement for viral content
        avgLikes: 220,
        color: '#EC4899',
        icon: 'Play'
      }
    ];

    return contentTypes;
  }, [timeRange]);

  const stats = useMemo(() => {
    const totalContent = contentData.reduce((sum, item) => sum + item.value, 0);
    const weightedEngagement = contentData.reduce((sum, item) => 
      sum + (item.engagement * item.percentage / 100), 0
    );
    const avgLikes = Math.round(contentData.reduce((sum, item) => 
      sum + (item.avgLikes * item.percentage / 100), 0
    ));

    const topContent = contentData.reduce((max, item) => 
      item.engagement > max.engagement ? item : max
    );

    return {
      totalContent,
      weightedEngagement: parseFloat(weightedEngagement.toFixed(1)),
      avgLikes,
      topContent: topContent.name
    };
  }, [contentData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const csvContent = [
        ['Content Type', 'Count', 'Percentage', 'Engagement Rate', 'Avg Likes'],
        ...contentData.map(row => [
          row.name, 
          row.value, 
          `${row.percentage.toFixed(1)}%`,
          `${row.engagement}%`,
          row.avgLikes
        ])
      ].map(row => row.join(',')).join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-type-distribution-${timeRange}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-semibold mb-2">{data.name}</p>
          <p className="text-sm text-gray-300">
            Count: <span className="text-white">{data.value}</span>
          </p>
          <p className="text-sm text-gray-300">
            Percentage: <span className="text-white">{data.percentage.toFixed(1)}%</span>
          </p>
          <p className="text-sm text-gray-300">
            Engagement: <span className="text-white">{data.engagement}%</span>
          </p>
          <p className="text-sm text-gray-300">
            Avg Likes: <span className="text-white">{data.avgLikes}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percentage < 5) return null; // Don't show labels for small slices

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
        {`${percentage.toFixed(0)}%`}
      </text>
    );
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Camera': return Camera;
      case 'Circle': return Instagram;
      case 'Play': return Play;
      default: return Camera;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Instagram className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Content Type Distribution</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Posts vs Stories vs Reels breakdown</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pie')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'pie'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Pie
            </button>
            <button
              onClick={() => setViewMode('bar')}
              className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                viewMode === 'bar'
                  ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Bar
            </button>
          </div>
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
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-xl p-4 border border-indigo-200/50 dark:border-indigo-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total Content</span>
            <Camera className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalContent}
          </p>
          <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-1">
            All content types
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-4 border border-purple-200/50 dark:border-purple-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg Engagement</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.weightedEngagement}%
          </p>
          <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
            Weighted average
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-4 border border-green-200/50 dark:border-green-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">Avg Likes</span>
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.avgLikes}
          </p>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Per content piece
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-4 border border-orange-200/50 dark:border-orange-700/50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Top Performer</span>
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.topContent}
          </p>
          <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
            Highest engagement
          </p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        <ResponsiveContainer width="100%" height={400}>
          {viewMode === 'pie' ? (
            <PieChart>
              <Pie
                data={contentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={120}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={800}
              >
                {contentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
                formatter={(value, entry) => (
                  <span style={{ color: entry.color }}>{value}</span>
                )}
              />
            </PieChart>
          ) : (
            <BarChart data={contentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
                animationBegin={0}
                animationDuration={800}
              >
                {contentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Content Type Details */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {contentData.map((content, index) => {
          const IconComponent = getIcon(content.icon);
          return (
            <div 
              key={content.name}
              className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200/50 dark:border-gray-600/50"
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${content.color}20`, border: `1px solid ${content.color}40` }}
                >
                  <IconComponent 
                    className="w-5 h-5" 
                    style={{ color: content.color }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{content.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {content.percentage.toFixed(1)}% of content
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Count</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{content.value}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Engagement</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{content.engagement}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg Likes</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{content.avgLikes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}