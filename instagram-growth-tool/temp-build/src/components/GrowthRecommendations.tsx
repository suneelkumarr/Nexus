import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Target, TrendingUp, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface GrowthRecommendationsProps {
  selectedAccount: string | null;
}

export default function GrowthRecommendations({ selectedAccount }: GrowthRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedAccount) {
      loadRecommendations();
    }
  }, [selectedAccount]);

  async function loadRecommendations() {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('growth_recommendations')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function generateRecommendations() {
    if (!selectedAccount) return;

    setLoading(true);
    try {
      // Get latest analytics
      const { data: latestSnapshot } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: {
          accountId: selectedAccount,
          analyticsData: latestSnapshot || {}
        }
      });

      if (error) throw error;

      // Reload recommendations
      await loadRecommendations();
      alert('Recommendations generated successfully!');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'medium':
        return <TrendingUp className="w-5 h-5 text-yellow-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
    }
  };

  if (!selectedAccount) {
    return (
      <div className="text-center py-12">
        <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Account Selected</h3>
        <p className="text-gray-600">Please select an Instagram account to view growth recommendations</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Growth Recommendations</h2>
        <button
          onClick={generateRecommendations}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Generate New</span>
        </button>
      </div>

      {loading && recommendations.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recommendations...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 mb-4">Click "Generate New" to get AI-powered growth recommendations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={`bg-white rounded-lg border-2 p-6 ${getPriorityColor(rec.priority)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">{getPriorityIcon(rec.priority)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{rec.title}</h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full capitalize bg-white border">
                      {rec.recommendation_type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{rec.description}</p>
                  
                  {rec.data && rec.data.actions && (
                    <div className="bg-white bg-opacity-50 rounded-md p-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Action Steps:</p>
                      <ul className="space-y-1">
                        {rec.data.actions.map((action: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rec.data && rec.data.tips && (
                    <div className="bg-white bg-opacity-50 rounded-md p-4 mt-3">
                      <p className="text-sm font-medium text-gray-900 mb-2">Tips:</p>
                      <ul className="space-y-1">
                        {rec.data.tips.map((tip: string, idx: number) => (
                          <li key={idx} className="text-sm text-gray-700 flex items-start">
                            <span className="text-purple-600 mr-2">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
