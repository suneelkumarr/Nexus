import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, TrendingUp, Lightbulb, RefreshCw } from 'lucide-react';

interface MarketInsight {
  id: string;
  insight_type: string;
  insight_category: string;
  title: string;
  description: string;
  confidence_score: number;
  priority_level: string;
  impact_score: number;
  research_date: string;
}

interface MarketResearchProps {
  selectedAccount: string | null;
}

export default function MarketResearch({ selectedAccount }: MarketResearchProps) {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      fetchInsights();
    }
  }, [selectedAccount]);

  const fetchInsights = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('market_research_insights')
        .select('*')
        .eq('instagram_account_id', selectedAccount)
        .eq('is_active', true)
        .order('impact_score', { ascending: false });

      if (error) throw error;
      setInsights(data || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    try {
      const { error } = await supabase.functions.invoke('generate-market-insights', {
        body: { accountId: selectedAccount }
      });

      if (error) throw error;
      fetchInsights();
    } catch (error) {
      console.error('Error generating insights:', error);
      alert('Failed to generate insights. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      'critical': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'medium': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'low': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    };
    return colors[priority as keyof typeof colors] || colors['medium'];
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trend':
        return TrendingUp;
      case 'insight':
        return Lightbulb;
      default:
        return Search;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Market Research Insights ({insights.length})
          </h3>
          <div className="flex gap-2">
            <button
              onClick={generateInsights}
              disabled={generating}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Lightbulb className={`w-4 h-4 ${generating ? 'animate-pulse' : ''}`} />
              {generating ? 'Generating...' : 'Generate Insights'}
            </button>
            <button
              onClick={fetchInsights}
              disabled={loading}
              className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading insights...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No market insights available yet.</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Market research insights will appear here as they become available.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getTypeIcon(insight.insight_type);
              return (
                <div
                  key={insight.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <span className={`inline-block px-2 py-1 text-xs rounded ${getPriorityColor(insight.priority_level)}`}>
                          {insight.priority_level}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {insight.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Confidence:</span>
                          {insight.confidence_score}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Impact:</span>
                          {insight.impact_score}/100
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-medium">Category:</span>
                          {insight.insight_category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
