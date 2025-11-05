import { useState } from 'react';
import { Lightbulb, Loader2, Plus, Target, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AIContentSuggestionsProps {
  selectedAccount: string | null;
}

export default function AIContentSuggestions({ selectedAccount }: AIContentSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contentThemes, setContentThemes] = useState('');

  const generateSuggestions = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-content-suggestions', {
        body: { 
          accountId: selectedAccount,
          contentThemes: contentThemes ? contentThemes.split(',').map(t => t.trim()) : []
        }
      });

      if (error) throw error;

      // Fetch latest suggestions from database
      const { data: latestSuggestions } = await supabase
        .from('ai_content_suggestions')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(10);

      setSuggestions(latestSuggestions || []);
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate content suggestions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingSuggestions = async () => {
    if (!selectedAccount) return;

    try {
      const { data } = await supabase
        .from('ai_content_suggestions')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(10);

      setSuggestions(data || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  useState(() => {
    loadExistingSuggestions();
  });

  return (
    <div className="space-y-6">
      {/* Action Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Generate AI Content Suggestions
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content Themes (Optional)
            </label>
            <input
              type="text"
              value={contentThemes}
              onChange={(e) => setContentThemes(e.target.value)}
              placeholder="e.g., Social Media Marketing, Instagram Tips, Business Growth"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Comma-separated themes for personalized suggestions
            </p>
          </div>

          <button
            onClick={generateSuggestions}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating AI Suggestions...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Generate Content Suggestions
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      {suggestions.length > 0 ? (
        <div className="grid gap-6">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-yellow-500 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                      {suggestion.suggestion_type}
                    </span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                      {suggestion.confidence_score}% Confidence
                    </span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {suggestion.content_theme}
                  </h4>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {suggestion.content_description}
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Visual Concept
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {suggestion.visual_suggestions}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Caption Template
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                    {suggestion.caption_template}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Target Audience</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {suggestion.target_audience}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Est. Engagement</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {suggestion.estimated_engagement_score}%
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="text-gray-500 dark:text-gray-400 text-xs">Best Time</div>
                      <div className="text-gray-900 dark:text-white font-medium">
                        {new Date(suggestion.best_posting_time).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>AI Reasoning:</strong> {suggestion.reasoning}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <Lightbulb className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No content suggestions yet. Generate AI-powered ideas to get started!
          </p>
        </div>
      )}
    </div>
  );
}
