import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, MessageCircle, Users, Zap, Heart, Minimize, AlertCircle, Loader2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ContentVariationsProps {
  selectedAccount: string | null;
}

interface ContentVariation {
  id: string;
  original_content: string;
  variation_type: 'casual' | 'professional' | 'emoji_rich' | 'storytelling' | 'question' | 'cta' | 'minimal';
  modified_content: string;
  estimated_performance: number;
  parameters: any;
  created_at: string;
}

const ContentVariations: React.FC<ContentVariationsProps> = ({ selectedAccount }) => {
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ContentVariation | null>(null);

  useEffect(() => {
    if (selectedAccount) {
      fetchVariations();
    }
  }, [selectedAccount]);

  const fetchVariations = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ai_content_variations')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setVariations(data || []);
    } catch (err) {
      console.error('Error fetching content variations:', err);
      setError('Failed to load content variations');
    } finally {
      setLoading(false);
    }
  };

  const generateVariations = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-content-variations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          accountId: selectedAccount,
          baseTheme: "social media content", // Default theme for variations
          variationCount: 5 // Standard variation count
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content variations');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh variations after generation
      await fetchVariations();
    } catch (err) {
      console.error('Error generating content variations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate variations');
    } finally {
      setGenerating(false);
    }
  };

  const getVariationIcon = (type: string) => {
    switch (type) {
      case 'casual':
        return <MessageCircle className="w-4 h-4" />;
      case 'professional':
        return <Users className="w-4 h-4" />;
      case 'emoji_rich':
        return <Heart className="w-4 h-4" />;
      case 'storytelling':
        return <FileText className="w-4 h-4" />;
      case 'question':
        return <MessageCircle className="w-4 h-4" />;
      case 'cta':
        return <Zap className="w-4 h-4" />;
      case 'minimal':
        return <Minimize className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getVariationColor = (type: string) => {
    switch (type) {
      case 'casual':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'professional':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'emoji_rich':
        return 'text-pink-600 bg-pink-50 border-pink-200';
      case 'storytelling':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'question':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'cta':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'minimal':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatVariationType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Group variations by original content
  const groupedVariations = variations.reduce((acc, variation) => {
    const key = variation.original_content.slice(0, 50) + '...';
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(variation);
    return acc;
  }, {} as Record<string, ContentVariation[]>);

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Account Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select an Instagram account to view content variations.
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
          <h2 className="text-2xl font-bold text-gray-900">Content Variations</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-generated variations of your content with different tones and styles
          </p>
        </div>
        <button
          onClick={generateVariations}
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
              <Sparkles className="w-4 h-4" />
              <span>Generate Variations</span>
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
            <span className="text-gray-600">Loading content variations...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {variations.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Variations Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click "Generate Variations" to get AI-powered content variations.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedVariations).map(([originalKey, groupVariations]) => {
                const original = groupVariations[0].original_content;
                return (
                  <div key={originalKey} className="bg-white border border-gray-200 rounded-lg p-6">
                    {/* Original Content */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Original Content</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700 text-sm leading-relaxed">{original}</p>
                        <button
                          onClick={() => copyToClipboard(original)}
                          className="mt-2 flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>

                    {/* Variations Grid */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">
                        Variations ({groupVariations.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groupVariations.map((variation) => (
                          <div
                            key={variation.id}
                            className={`border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer ${getVariationColor(variation.variation_type)}`}
                            onClick={() => setSelectedVariation(variation)}
                          >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                {getVariationIcon(variation.variation_type)}
                                <span className="font-medium text-sm">
                                  {formatVariationType(variation.variation_type)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`text-sm font-medium ${getPerformanceColor(variation.estimated_performance)}`}>
                                  {variation.estimated_performance}%
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyToClipboard(variation.modified_content);
                                  }}
                                  className="p-1 rounded hover:bg-white/50 transition-colors"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Content Preview */}
                            <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                              {variation.modified_content}
                            </p>

                            {/* Footer */}
                            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                              <p className="text-xs opacity-70">
                                Click to view full content
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal for Selected Variation */}
      {selectedVariation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${getVariationColor(selectedVariation.variation_type)}`}>
                    {getVariationIcon(selectedVariation.variation_type)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatVariationType(selectedVariation.variation_type)} Variation
                    </h3>
                    <p className="text-sm text-gray-500">
                      Estimated Performance: {selectedVariation.estimated_performance}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVariation(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Content</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {selectedVariation.modified_content}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => copyToClipboard(selectedVariation.modified_content)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Content</span>
                  </button>
                  <p className="text-xs text-gray-500">
                    Generated {new Date(selectedVariation.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentVariations;