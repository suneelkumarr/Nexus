import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Star, Users, Heart, Award, RefreshCw } from 'lucide-react';

interface Influencer {
  id: string;
  username: string;
  display_name: string;
  followers_count: number;
  engagement_rate: number;
  influencer_score: number;
  relevance_score: number;
  quality_score: number;
  niche: string;
  is_verified: boolean;
  collaboration_status: string;
}

interface InfluencerDiscoveryProps {
  selectedAccount: string | null;
}

export default function InfluencerDiscovery({ selectedAccount }: InfluencerDiscoveryProps) {
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchSavedInfluencers();
    }
  }, [selectedAccount]);

  const fetchSavedInfluencers = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('influencer_database')
        .select('*')
        .eq('instagram_account_id', selectedAccount)
        .order('influencer_score', { ascending: false });

      if (error) throw error;
      setInfluencers(data || []);
    } catch (error) {
      console.error('Error fetching influencers:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchInfluencers = async () => {
    if (!searchKeyword.trim() || !selectedAccount) return;

    setSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('discover-influencers', {
        body: { 
          keyword: searchKeyword.trim(),
          accountId: selectedAccount
        }
      });

      if (error) throw error;
      setSearchResults(data.influencers || []);
    } catch (error) {
      console.error('Error searching influencers:', error);
      alert('Failed to search influencers. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  const saveInfluencer = async (influencer: any) => {
    try {
      const { error } = await supabase
        .from('influencer_database')
        .insert([influencer]);

      if (error) throw error;
      
      setSearchResults(searchResults.filter(i => i.username !== influencer.username));
      fetchSavedInfluencers();
    } catch (error) {
      console.error('Error saving influencer:', error);
      alert('Failed to save influencer. They may already be in your database.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'discovered': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'contacted': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'in-progress': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[status as keyof typeof colors] || colors['discovered'];
  };

  const InfluencerCard = ({ influencer, onSave }: { influencer: any, onSave?: () => void }) => (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            @{influencer.username}
            {influencer.is_verified && (
              <span className="text-blue-500">✓</span>
            )}
          </h4>
          {influencer.display_name && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {influencer.display_name}
            </p>
          )}
        </div>
        {onSave && (
          <button
            onClick={onSave}
            className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Followers
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {influencer.followers_count?.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Engagement
          </span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {influencer.engagement_rate}%
          </span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <div className={`text-lg font-bold ${getScoreColor(influencer.influencer_score)}`}>
            {influencer.influencer_score}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Overall</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <div className={`text-lg font-bold ${getScoreColor(influencer.relevance_score)}`}>
            {influencer.relevance_score}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Relevance</div>
        </div>
        <div className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
          <div className={`text-lg font-bold ${getScoreColor(influencer.quality_score)}`}>
            {influencer.quality_score}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Quality</div>
        </div>
      </div>

      {influencer.niche && (
        <div className="mb-2">
          <span className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded">
            {influencer.niche}
          </span>
        </div>
      )}

      {influencer.collaboration_status && (
        <div>
          <span className={`inline-block px-2 py-1 text-xs rounded ${getStatusBadge(influencer.collaboration_status)}`}>
            {influencer.collaboration_status}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Discover Influencers
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Search by niche, category, or keyword..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onKeyPress={(e) => e.key === 'Enter' && searchInfluencers()}
          />
          <button
            onClick={searchInfluencers}
            disabled={searching || !searchKeyword.trim()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Search className="w-5 h-5" />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Results ({searchResults.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((influencer, index) => (
              <InfluencerCard
                key={index}
                influencer={influencer}
                onSave={() => saveInfluencer(influencer)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Saved Influencers */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Saved Influencers ({influencers.length})
          </h3>
          <button
            onClick={fetchSavedInfluencers}
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
            <p className="text-gray-600 dark:text-gray-400">Loading influencers...</p>
          </div>
        ) : influencers.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No influencers saved yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Search and save influencers to track them here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {influencers.map((influencer) => (
              <InfluencerCard key={influencer.id} influencer={influencer} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
