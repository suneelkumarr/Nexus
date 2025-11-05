import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lightbulb, Sparkles, Copy, Check, RefreshCw, Trash2, Tag, Clock } from 'lucide-react';

interface AIIdeasGeneratorProps {
  accountId: string;
}

interface AIIdea {
  id: string;
  generated_idea: string;  // title in the database
  caption: string;  // description
  post_type: string;  // content_type
  hashtags: string[];
  idea_category: string;  // category
  visual_concept?: string;
  created_at: string;
}

export default function AIIdeasGenerator({ accountId }: AIIdeasGeneratorProps) {
  const [ideas, setIdeas] = useState<AIIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'educational', 'entertaining', 'promotional', 'inspirational', 'trending'];

  useEffect(() => {
    fetchIdeas();
  }, [accountId, selectedCategory]);

  const fetchIdeas = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('ai_content_ideas')
        .select('*')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'all') {
        query = query.eq('idea_category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      setIdeas(data || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewIdeas = async () => {
    try {
      setGenerating(true);

      // Call the edge function to generate ideas
      const { data, error } = await supabase.functions.invoke('generate-ai-ideas', {
        body: { accountId }
      });

      if (error) throw error;

      if (!data || !data.success) {
        throw new Error(data?.error || 'Failed to generate ideas');
      }

      // Refresh the ideas list
      fetchIdeas();
    } catch (error) {
      console.error('Error generating ideas:', error);
      alert('Failed to generate ideas. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const deleteIdea = async (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;

    try {
      const { error } = await supabase
        .from('ai_content_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      fetchIdeas();
    } catch (error) {
      console.error('Error deleting idea:', error);
      alert('Failed to delete idea. Please try again.');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getContentTypeColor = (type: string): string => {
    const colors: Record<string, string> = {
      post: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      story: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      reel: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      carousel: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
    };
    return colors[type] || colors.post;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading ideas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">AI Content Ideas Generator</h2>
            <p className="text-orange-100">Get intelligent content suggestions powered by AI</p>
          </div>
          <Sparkles className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by:</span>
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 capitalize ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={generateNewIdeas}
          disabled={generating}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Generating...' : 'Generate New Ideas'}</span>
        </button>
      </div>

      {/* Ideas Grid */}
      {ideas.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <Lightbulb className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">No content ideas yet</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Click "Generate New Ideas" to get AI-powered content suggestions
          </p>
          <button
            onClick={generateNewIdeas}
            disabled={generating}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
          >
            <Sparkles className="w-5 h-5" />
            <span>Get Started</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 ${getContentTypeColor(idea.post_type)}`}>
                    {idea.post_type.toUpperCase()}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {idea.generated_idea}
                  </h3>
                </div>
                <button
                  onClick={() => deleteIdea(idea.id)}
                  className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                {idea.caption}
              </p>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <Tag className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex flex-wrap gap-2">
                    {idea.hashtags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded text-xs"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {idea.visual_concept && (
                  <div className="flex items-start space-x-2">
                    <Clock className="w-4 h-4 text-blue-600 mt-1" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Visual: <span className="font-medium">{idea.visual_concept}</span>
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(
                      `${idea.generated_idea}\n\n${idea.caption}\n\nHashtags: ${idea.hashtags.map(t => '#' + t).join(' ')}`,
                      idea.id
                    )}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    {copiedId === idea.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="text-sm">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span className="text-sm">Copy</span>
                      </>
                    )}
                  </button>
                  <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <span className="text-sm">Use</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-500">
                Generated {new Date(idea.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-700">
        <div className="flex items-start space-x-4">
          <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              How AI Content Ideas Work
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Our AI analyzes your account performance, audience engagement patterns, and trending topics 
              to generate personalized content suggestions. Each idea includes optimal posting times, 
              relevant hashtags, and content format recommendations to maximize your reach and engagement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
