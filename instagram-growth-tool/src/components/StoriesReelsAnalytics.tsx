import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Video, Eye, Share2, MessageCircle, TrendingUp, RefreshCw } from 'lucide-react';

interface StoriesReelsAnalyticsProps {
  accountId: string;
}

export default function StoriesReelsAnalytics({ accountId }: StoriesReelsAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStories: 0,
    avgViews: 0,
    avgCompletion: 0,
    totalReach: 0,
  });

  useEffect(() => {
    if (accountId) {
      loadStoriesData();
    }
  }, [accountId]);

  const loadStoriesData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stories_analytics')
        .select('*')
        .eq('account_id', accountId)
        .order('posted_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      if (data && data.length > 0) {
        setStories(data);
        
        // Calculate stats
        const totalViews = data.reduce((sum, s) => sum + (s.views_count || 0), 0);
        const totalReach = data.reduce((sum, s) => sum + (s.reach || 0), 0);
        const totalCompletion = data.reduce((sum, s) => sum + (parseFloat(s.completion_rate) || 0), 0);

        setStats({
          totalStories: data.length,
          avgViews: Math.round(totalViews / data.length),
          avgCompletion: parseFloat((totalCompletion / data.length).toFixed(2)),
          totalReach: totalReach,
        });
      } else {
        setStories([]);
        setStats({
          totalStories: 0,
          avgViews: 0,
          avgCompletion: 0,
          totalReach: 0,
        });
      }
    } catch (error) {
      console.error('Error loading stories data:', error);
      setStories([]);
      setStats({
        totalStories: 0,
        avgViews: 0,
        avgCompletion: 0,
        totalReach: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getStoriesChartData = () => {
    return stories.slice(0, 15).reverse().map((story, index) => ({
      name: `Story ${index + 1}`,
      views: story.views_count || 0,
      reach: story.reach || 0,
      completion: parseFloat(story.completion_rate) || 0,
      engagement: parseFloat(story.engagement_rate) || 0,
    }));
  };

  const getTypeDistribution = () => {
    const typeCount = stories.reduce((acc, story) => {
      const type = story.story_type || 'story';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCount).map(([type, count]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count,
    }));
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Empty state - no stories/reels data yet
  if (stories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-16">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-orange-900/30 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
              
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Video className="w-10 h-10 text-purple-500" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Stories or Reels Data Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Stories and Reels analytics will appear here once you start posting ephemeral content and the data is fetched via the Instagram API.
              </p>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-3">
                      What You'll See Here
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                        <span className="text-purple-800 dark:text-purple-200 text-sm">Story views, reach, and completion rates</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                        <span className="text-purple-800 dark:text-purple-200 text-sm">Reels performance metrics and engagement</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                        <span className="text-purple-800 dark:text-purple-200 text-sm">Interactive charts showing performance over time</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-0.5">4</div>
                        <span className="text-purple-800 dark:text-purple-200 text-sm">Engagement analytics (replies, shares, exits)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Note: Stories and Reels data requires API integration. Contact support to enable this feature.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Stories & Reels Analytics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track ephemeral content performance</p>
            </div>
          </div>

          <button
            onClick={loadStoriesData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Total Stories</span>
              <Video className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalStories}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Posted
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Views</span>
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.avgViews)}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Per story
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Completion Rate</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.avgCompletion}%
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Average
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border border-orange-200/50 dark:border-orange-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Reach</span>
              <Share2 className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.totalReach)}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Unique users
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views and Reach Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Views & Reach Performance</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getStoriesChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar dataKey="views" fill="#3B82F6" name="Views" radius={[8, 8, 0, 0]} />
              <Bar dataKey="reach" fill="#8B5CF6" name="Reach" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion & Engagement Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Completion & Engagement Rates</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getStoriesChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                style={{ fontSize: '10px' }}
              />
              <YAxis
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                label={{ value: 'Rate %', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="completion" stroke="#10B981" strokeWidth={3} name="Completion %" />
              <Line type="monotone" dataKey="engagement" stroke="#EC4899" strokeWidth={3} name="Engagement %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Content Type Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Content Type Distribution</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {getTypeDistribution().map((item) => (
            <div key={item.type} className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50 text-center">
              <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">{item.type}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Stories List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Recent Stories & Reels</h4>
        <div className="space-y-3">
          {stories.slice(0, 10).map((story, index) => (
            <div
              key={story.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {story.story_type === 'reel' ? 'Reel' : 'Story'} #{index + 1}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {story.posted_at ? new Date(story.posted_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Views</p>
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(story.views_count || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Completion</p>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">
                    {story.completion_rate || 0}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Replies</p>
                  <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                    {story.replies_count || 0}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Shares</p>
                  <p className="text-sm font-bold text-pink-600 dark:text-pink-400">
                    {story.shares_count || 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
