import React, { useState, useEffect } from 'react';
import { Hash, TrendingUp, Target, Star, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SmartHashtagRecommendationsProps {
  selectedAccount: string | null;
}

interface HashtagRecommendation {
  hashtag: string;
  category: string;
  trendingScore: number;
  estimatedReach: number;
  relevanceScore: number;
  competitionLevel: string;
}

interface RecommendationData {
  id: string;
  content_theme: string;
  recommended_hashtags: string[];
  hashtag_scores: HashtagRecommendation[];
  competition_level: string;
  estimated_reach: number;
  relevance_score: number;
  trending_score: number;
  mix_strategy: string;
  reasoning: string;
  created_at: string;
}

const SmartHashtagRecommendations: React.FC<SmartHashtagRecommendationsProps> = ({ selectedAccount }) => {
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAccount) {
      fetchRecommendations();
    }
  }, [selectedAccount]);

  const fetchRecommendations = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('smart_hashtag_recommendations')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;
      setRecommendationData(data && data.length > 0 ? data[0] : null);
    } catch (err) {
      console.error('Error fetching hashtag recommendations:', err);
      setError('Failed to load hashtag recommendations');
    } finally {
      setLoading(false);
    }
  };

  const generateRecommendations = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-smart-hashtags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          accountId: selectedAccount,
          contentTheme: "social media growth", // Default theme for generation
          targetAudience: "general" // Default audience
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate hashtag recommendations');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh recommendations after generation
      await fetchRecommendations();
    } catch (err) {
      console.error('Error generating hashtag recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'mega':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'large':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'niche':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trending':
        return <TrendingUp className="w-4 h-4" />;
      case 'niche_specific':
        return <Target className="w-4 h-4" />;
      case 'evergreen':
        return <Star className="w-4 h-4" />;
      case 'branded':
        return <Zap className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trending':
        return 'text-orange-600 bg-orange-50';
      case 'niche_specific':
        return 'text-blue-600 bg-blue-50';
      case 'evergreen':
        return 'text-green-600 bg-green-50';
      case 'branded':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Hash className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Account Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select an Instagram account to view hashtag recommendations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Smart Hashtag Recommendations</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered hashtag suggestions with relevance scores and reach predictions
          </p>
        </div>
        <button
          onClick={generateRecommendations}
          disabled={generating}
          className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Hash className="w-4 h-4" />
              <span>Generate Recommendations</span>
            </>
          )}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
            <span className="text-gray-600">Loading hashtag recommendations...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {!recommendationData ? (
            <div className="text-center py-12">
              <Hash className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Recommendations Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click "Generate Recommendations" to get AI-powered hashtag suggestions.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Total Hashtags</p>
                  <p className="text-2xl font-bold text-blue-900">{recommendationData.hashtag_scores?.length || 0}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Estimated Reach</p>
                  <p className="text-2xl font-bold text-green-900">{formatReach(recommendationData.estimated_reach)}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">Relevance Score</p>
                  <p className="text-2xl font-bold text-purple-900">{recommendationData.relevance_score?.toFixed(1)}%</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <p className="text-sm text-orange-600">Competition</p>
                  <p className="text-2xl font-bold text-orange-900">{recommendationData.competition_level}</p>
                </div>
              </div>

              {/* Strategy Overview */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hashtag Strategy</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {recommendationData.mix_strategy}
                </p>
              </div>

              {/* Individual Hashtags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Hashtags</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendationData.hashtag_scores?.map((hashtag, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      {/* Hashtag Header */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-900">
                          {hashtag.hashtag}
                        </span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(hashtag.category)}`}>
                          {hashtag.category}
                        </div>
                      </div>

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Relevance</span>
                          <span className={`font-medium ${getRelevanceColor(hashtag.relevanceScore)}`}>
                            {hashtag.relevanceScore}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Reach</span>
                          <span className="font-medium text-gray-900">
                            {formatReach(hashtag.estimatedReach)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Competition</span>
                          <span className="font-medium text-gray-700">
                            {hashtag.competitionLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  )) || []}
                </div>
              </div>

              {/* Strategy Reasoning */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Strategy Reasoning</h3>
                <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                  {recommendationData.reasoning}
                </p>
              </div>

              {/* Generation Info */}
              <div className="text-center py-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Generated on {new Date(recommendationData.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SmartHashtagRecommendations;