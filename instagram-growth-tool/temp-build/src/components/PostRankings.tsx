import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TrendingUp, TrendingDown, BarChart3, Heart, MessageCircle, Eye, Share2, ArrowUpDown } from 'lucide-react';

interface PostRankingsProps {
  accountId: string;
}

interface PostMetrics {
  id: string;
  media_id: string;
  media_type: string;
  caption: string;
  likes: number;
  comments: number;
  views: number;
  shares: number;
  engagement_rate: number;
  created_at: string;
  thumbnail_url?: string;
}

type SortField = 'likes' | 'comments' | 'views' | 'shares' | 'engagement_rate';
type SortOrder = 'asc' | 'desc';

export default function PostRankings({ accountId }: PostRankingsProps) {
  const [posts, setPosts] = useState<PostMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('engagement_rate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    fetchPostRankings();
  }, [accountId, sortField, sortOrder, timeRange]);

  const fetchPostRankings = async () => {
    try {
      setLoading(true);

      // Calculate date threshold based on time range
      let dateThreshold = new Date();
      if (timeRange === '7d') dateThreshold.setDate(dateThreshold.getDate() - 7);
      else if (timeRange === '30d') dateThreshold.setDate(dateThreshold.getDate() - 30);
      else if (timeRange === '90d') dateThreshold.setDate(dateThreshold.getDate() - 90);

      let query = supabase
        .from('media_insights')
        .select('*')
        .eq('account_id', accountId);

      if (timeRange !== 'all') {
        query = query.gte('created_at', dateThreshold.toISOString());
      }

      const { data, error } = await query.order(sortField, { ascending: sortOrder === 'asc' });

      if (error) throw error;

      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching post rankings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const getPerformanceTier = (engagementRate: number): { label: string; color: string; bgColor: string } => {
    if (engagementRate >= 10) return { label: 'Excellent', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30' };
    if (engagementRate >= 5) return { label: 'Good', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30' };
    if (engagementRate >= 2) return { label: 'Average', color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { label: 'Poor', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30' };
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const topPerformers = posts.slice(0, 3);
  const avgEngagement = posts.length > 0 
    ? posts.reduce((sum, post) => sum + post.engagement_rate, 0) / posts.length 
    : 0;
  const totalLikes = posts.reduce((sum, post) => sum + post.likes, 0);
  const totalComments = posts.reduce((sum, post) => sum + post.comments, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading rankings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Post Performance Rankings</h2>
            <p className="text-green-100">Analyze and compare your content performance</p>
          </div>
          <TrendingUp className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Posts</span>
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{posts.length}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{avgEngagement.toFixed(2)}%</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Likes</span>
            <Heart className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(totalLikes)}</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Comments</span>
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(totalComments)}</div>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Range:</span>
        <div className="flex space-x-2">
          {['7d', '30d', '90d', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range as typeof timeRange)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-green-600" />
            Top 3 Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPerformers.map((post, index) => {
              const tier = getPerformanceTier(post.engagement_rate);
              return (
                <div key={post.id} className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <div className="absolute top-4 right-4 w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    #{index + 1}
                  </div>
                  <div className="mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                      {tier.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {post.caption || 'No caption'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(post.likes)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(post.comments)}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600 dark:text-gray-400">Engagement Rate</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {post.engagement_rate.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full Rankings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <BarChart3 className="w-6 h-6 mr-3 text-green-600" />
            All Posts
          </h3>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-12">
            <TrendingDown className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No posts found</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Posts will appear here once you have content with metrics
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Caption
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => handleSort('likes')}>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>Likes</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => handleSort('comments')}>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>Comments</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => handleSort('views')}>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>Views</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                      onClick={() => handleSort('engagement_rate')}>
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>Engagement</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Performance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post, index) => {
                  const tier = getPerformanceTier(post.engagement_rate);
                  return (
                    <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {post.caption || 'No caption'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatNumber(post.likes)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatNumber(post.comments)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatNumber(post.views)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                        {post.engagement_rate.toFixed(2)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${tier.bgColor} ${tier.color}`}>
                          {tier.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
