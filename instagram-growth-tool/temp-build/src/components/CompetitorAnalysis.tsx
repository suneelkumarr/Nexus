import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, RefreshCw, TrendingUp, Users, Heart, MessageCircle } from 'lucide-react';

interface Competitor {
  id: string;
  competitor_username: string;
  display_name: string;
  followers_count: number;
  following_count: number;
  posts_count: number;
  engagement_rate: number;
  avg_likes: number;
  avg_comments: number;
  is_verified: boolean;
  added_at: string;
}

interface CompetitorAnalysisProps {
  selectedAccount: string | null;
}

export default function CompetitorAnalysis({ selectedAccount }: CompetitorAnalysisProps) {
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCompetitorUsername, setNewCompetitorUsername] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchCompetitors();
    }
  }, [selectedAccount]);

  const fetchCompetitors = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('competitor_accounts')
        .select('*')
        .eq('instagram_account_id', selectedAccount)
        .eq('tracking_enabled', true)
        .order('added_at', { ascending: false });

      if (error) throw error;
      setCompetitors(data || []);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCompetitor = async () => {
    if (!newCompetitorUsername.trim() || !selectedAccount) return;

    setAdding(true);
    try {
      const { data, error } = await supabase.functions.invoke('add-competitor', {
        body: { 
          username: newCompetitorUsername.trim().replace('@', ''),
          accountId: selectedAccount
        }
      });

      if (error) throw error;

      setNewCompetitorUsername('');
      fetchCompetitors();
    } catch (error) {
      console.error('Error adding competitor:', error);
      alert('Failed to add competitor. Please try again.');
    } finally {
      setAdding(false);
    }
  };

  const removeCompetitor = async (competitorId: string) => {
    if (!confirm('Are you sure you want to remove this competitor?')) return;

    try {
      const { error } = await supabase
        .from('competitor_accounts')
        .update({ tracking_enabled: false })
        .eq('id', competitorId);

      if (error) throw error;
      fetchCompetitors();
    } catch (error) {
      console.error('Error removing competitor:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Competitor */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Competitor
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCompetitorUsername}
            onChange={(e) => setNewCompetitorUsername(e.target.value)}
            placeholder="Enter Instagram username..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && addCompetitor()}
          />
          <button
            onClick={addCompetitor}
            disabled={adding || !newCompetitorUsername.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            {adding ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Competitors List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tracked Competitors ({competitors.length})
          </h3>
          <button
            onClick={fetchCompetitors}
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
            <p className="text-gray-600 dark:text-gray-400">Loading competitors...</p>
          </div>
        ) : competitors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No competitors tracked yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Add competitors above to start analyzing their performance.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {competitors.map((competitor) => (
              <div
                key={competitor.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      @{competitor.competitor_username}
                      {competitor.is_verified && (
                        <span className="text-blue-500">✓</span>
                      )}
                    </h4>
                    {competitor.display_name && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {competitor.display_name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => removeCompetitor(competitor.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Followers
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {competitor.followers_count?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Posts
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {competitor.posts_count?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Avg. Likes
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {competitor.avg_likes?.toLocaleString() || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Engagement
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {competitor.engagement_rate ? `${competitor.engagement_rate}%` : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Added {new Date(competitor.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
