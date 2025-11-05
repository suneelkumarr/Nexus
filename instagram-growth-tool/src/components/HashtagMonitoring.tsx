import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Hash, TrendingUp, RefreshCw, Plus } from 'lucide-react';

interface Hashtag {
  id: string;
  hashtag: string;
  posts_count: number;
  trend_score: number;
  volume_tier: string;
  competition_level: string;
  is_trending: boolean;
  recommendation_score: number;
}

interface HashtagMonitoringProps {
  selectedAccount: string | null;
}

export default function HashtagMonitoring({ selectedAccount }: HashtagMonitoringProps) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(false);
  const [newHashtags, setNewHashtags] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchHashtags();
    }
  }, [selectedAccount]);

  const fetchHashtags = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('hashtag_monitoring')
        .select('*')
        .eq('instagram_account_id', selectedAccount)
        .eq('tracking_enabled', true)
        .order('recommendation_score', { ascending: false });

      if (error) throw error;
      setHashtags(data || []);
    } catch (error) {
      console.error('Error fetching hashtags:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHashtagData = async () => {
    if (!newHashtags.trim() || !selectedAccount) return;

    setUpdating(true);
    try {
      const hashtagArray = newHashtags.split(',').map(h => h.trim().replace('#', '')).filter(h => h);
      
      const { error } = await supabase.functions.invoke('update-hashtag-data', {
        body: { 
          accountId: selectedAccount,
          hashtags: hashtagArray
        }
      });

      if (error) throw error;

      setNewHashtags('');
      fetchHashtags();
    } catch (error) {
      console.error('Error updating hashtag data:', error);
      alert('Failed to update hashtag data. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getTierColor = (tier: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[tier as keyof typeof colors] || colors['medium'];
  };

  const getCompetitionColor = (level: string) => {
    const colors = {
      'high': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[level as keyof typeof colors] || colors['medium'];
  };

  return (
    <div className="space-y-6">
      {/* Add Hashtags */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Hashtags to Monitor
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newHashtags}
            onChange={(e) => setNewHashtags(e.target.value)}
            placeholder="Enter hashtags separated by commas (e.g., travel, photography, fitness)"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && updateHashtagData()}
          />
          <button
            onClick={updateHashtagData}
            disabled={updating || !newHashtags.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {updating ? 'Adding...' : 'Add & Fetch Data'}
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Enter hashtags without the # symbol. Data will be fetched from Instagram API.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Monitored Hashtags ({hashtags.length})
          </h3>
          <button
            onClick={fetchHashtags}
            disabled={loading}
            className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading hashtags...</p>
          </div>
        ) : hashtags.length === 0 ? (
          <div className="text-center py-12">
            <Hash className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No hashtags monitored yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Start tracking hashtags to monitor their performance and trends.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Hashtag
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Posts
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Trend Score
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Volume
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Competition
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {hashtags.map((hashtag) => (
                  <tr key={hashtag.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 dark:text-white">
                        #{hashtag.hashtag}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {hashtag.posts_count?.toLocaleString() || 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${hashtag.trend_score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {hashtag.trend_score}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getTierColor(hashtag.volume_tier)}`}>
                        {hashtag.volume_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getCompetitionColor(hashtag.competition_level)}`}>
                        {hashtag.competition_level}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {hashtag.is_trending && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                          <TrendingUp className="w-4 h-4" />
                          Trending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
