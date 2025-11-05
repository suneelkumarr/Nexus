import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Hash, TrendingUp, Search, RefreshCw, AlertCircle } from 'lucide-react';

interface HashtagAnalyticsProps {
  accountId: string;
}

export default function HashtagAnalytics({ accountId }: HashtagAnalyticsProps) {
  const [loading, setLoading] = useState(false);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalHashtags: 0,
    avgEngagement: 0,
    topPerformer: '',
    totalReach: 0,
  });

  useEffect(() => {
    if (accountId) {
      loadHashtagData();
    }
  }, [accountId]);

  const loadHashtagData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hashtag_performance')
        .select('*')
        .eq('account_id', accountId)
        .order('average_engagement_rate', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data && data.length > 0) {
        setHashtags(data);
        
        // Calculate stats
        const totalReach = data.reduce((sum, h) => sum + (h.total_reach || 0), 0);
        const totalEngagement = data.reduce((sum, h) => sum + (parseFloat(h.average_engagement_rate) || 0), 0);
        const topHashtag = data[0];

        setStats({
          totalHashtags: data.length,
          avgEngagement: parseFloat((totalEngagement / data.length).toFixed(2)),
          topPerformer: topHashtag?.hashtag || 'N/A',
          totalReach: totalReach,
        });
      } else {
        setHashtags([]);
        setStats({
          totalHashtags: 0,
          avgEngagement: 0,
          topPerformer: 'N/A',
          totalReach: 0,
        });
      }
    } catch (error) {
      console.error('Error loading hashtag data:', error);
      setHashtags([]);
      setStats({
        totalHashtags: 0,
        avgEngagement: 0,
        topPerformer: 'N/A',
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

  const getTopHashtags = () => {
    return hashtags.slice(0, 10).map(h => ({
      name: h.hashtag.replace('#', ''),
      engagement: parseFloat(h.average_engagement_rate) || 0,
      reach: h.total_reach || 0,
      usage: h.usage_count || 0,
      impressions: h.total_impressions || 0,
    }));
  };

  const getHashtagRadarData = () => {
    return hashtags.slice(0, 6).map(h => ({
      hashtag: h.hashtag.replace('#', '').slice(0, 15),
      engagement: parseFloat(h.average_engagement_rate) || 0,
      reach: (h.total_reach || 0) / 1000,
      impressions: (h.total_impressions || 0) / 1000,
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

  // Empty state - no hashtags tracked yet
  if (hashtags.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center py-16">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-100 dark:from-green-900/30 dark:via-emerald-900/20 dark:to-teal-900/30 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
              
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Hash className="w-10 h-10 text-green-500" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No Hashtag Data Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Start tracking hashtag performance by analyzing hashtags from the Hashtag Research tab or by fetching media insights for your posts.
              </p>
              
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200/50 dark:border-green-700/50">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Search className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-3">
                      How to Start Tracking
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                        <span className="text-green-800 dark:text-green-200 text-sm">Go to the Hashtag Research tab</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                        <span className="text-green-800 dark:text-green-200 text-sm">Analyze hashtags you use in your posts</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                        <span className="text-green-800 dark:text-green-200 text-sm">Return here to view performance analytics</span>
                      </div>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Hash className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Hashtag Performance</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Optimize your hashtag strategy</p>
            </div>
          </div>

          <button
            onClick={loadHashtagData}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-xl p-6 border border-green-200/50 dark:border-green-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Total Hashtags</span>
              <Hash className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.totalHashtags}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              Tracked
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl p-6 border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Engagement</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {stats.avgEngagement}%
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              Average rate
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl p-6 border border-purple-200/50 dark:border-purple-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Top Performer</span>
              <Hash className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white truncate">
              {stats.topPerformer}
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
              Best hashtag
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl p-6 border border-orange-200/50 dark:border-orange-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Reach</span>
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(stats.totalReach)}
            </p>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              Combined reach
            </p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Hashtags Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top Hashtags by Engagement</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getTopHashtags()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                style={{ fontSize: '10px' }}
                angle={-45}
                textAnchor="end"
                height={80}
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
              <Bar dataKey="engagement" fill="#10B981" name="Engagement %" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hashtag Performance Radar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Performance Comparison</h4>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={getHashtagRadarData()}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="hashtag" stroke="#6B7280" style={{ fontSize: '10px' }} />
              <PolarRadiusAxis stroke="#6B7280" />
              <Radar name="Engagement %" dataKey="engagement" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                }}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hashtag List */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">All Tracked Hashtags</h4>
        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <div
              key={hashtag.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">#{index + 1}</span>
                </div>
                <div>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {hashtag.hashtag}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Used {hashtag.usage_count} times
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {hashtag.average_engagement_rate}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reach</p>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                    {formatNumber(hashtag.total_reach || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Impressions</p>
                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    {formatNumber(hashtag.total_impressions || 0)}
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
