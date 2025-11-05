import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Hash, TrendingUp, Search } from 'lucide-react';

interface HashtagResearchProps {
  selectedAccount: string | null;
}

export default function HashtagResearch({ selectedAccount }: HashtagResearchProps) {
  const [hashtags, setHashtags] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function analyzeHashtags() {
    if (!hashtags.trim() || !selectedAccount) return;

    const hashtagArray = hashtags
      .split(',')
      .map(h => h.trim().replace(/^#/, ''))
      .filter(h => h);

    if (hashtagArray.length === 0) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-hashtags', {
        body: { hashtags: hashtagArray, accountId: selectedAccount }
      });

      if (error) throw error;

      if (data?.data?.hashtags) {
        setResults(data.data.hashtags);
      }
    } catch (error) {
      console.error('Error analyzing hashtags:', error);
      alert('Failed to analyze hashtags. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const getPopularityLabel = (score: number) => {
    if (score >= 80) return { label: 'Very High', color: 'text-red-600 bg-red-100' };
    if (score >= 60) return { label: 'High', color: 'text-orange-600 bg-orange-100' };
    if (score >= 40) return { label: 'Medium', color: 'text-yellow-600 bg-yellow-100' };
    if (score >= 20) return { label: 'Low', color: 'text-green-600 bg-green-100' };
    return { label: 'Very Low', color: 'text-blue-600 bg-blue-100' };
  };

  if (!selectedAccount) {
    return (
      <div className="text-center py-12">
        <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Account Selected</h3>
        <p className="text-gray-600">Please select an Instagram account to research hashtags</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Hashtag Research</h2>

      {/* Input Section */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Hashtags (comma-separated)
        </label>
        <textarea
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="fitness, workout, gym, health, wellness"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
        <button
          onClick={analyzeHashtags}
          disabled={loading}
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50 flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>{loading ? 'Analyzing...' : 'Analyze Hashtags'}</span>
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hashtag Analysis Results</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hashtag</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popularity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recommendation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((hashtag, index) => {
                  const popularity = getPopularityLabel(hashtag.popularity_score);
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Hash className="w-4 h-4 text-purple-600 mr-2" />
                          <span className="font-medium text-gray-900">{hashtag.hashtag}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {hashtag.media_count?.toLocaleString() || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${popularity.color}`}>
                          {popularity.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {hashtag.popularity_score >= 60 
                          ? 'High competition - use with niche tags'
                          : hashtag.popularity_score >= 20
                          ? 'Good balance - recommended'
                          : 'Low competition - good for niche targeting'
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <TrendingUp className="w-6 h-6 text-purple-600 mt-1" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-2">Hashtag Best Practices</h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>Use 5-10 relevant hashtags per post</li>
              <li>Mix popular and niche hashtags for better reach</li>
              <li>Research hashtags with 10K-200K posts for optimal engagement</li>
              <li>Rotate hashtag sets to avoid being flagged as spam</li>
              <li>Track performance and adjust strategy monthly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
