import { useState, useEffect } from 'react';
import { Clock, Loader2, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PostingOptimizationProps {
  selectedAccount: string | null;
}

export default function PostingOptimization({ selectedAccount }: PostingOptimizationProps) {
  const [optimization, setOptimization] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [analysisDays, setAnalysisDays] = useState(30);

  const generateOptimization = async () => {
    if (!selectedAccount) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-posting-optimization', {
        body: { 
          accountId: selectedAccount,
          analysisDays: analysisDays
        }
      });

      if (error) throw error;

      // Fetch latest optimization
      const { data: latestOptimization } = await supabase
        .from('posting_optimization_recommendations')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      setOptimization(latestOptimization);
    } catch (error: any) {
      console.error('Error generating optimization:', error);
      alert('Failed to generate posting optimization: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      const loadExisting = async () => {
        const { data } = await supabase
          .from('posting_optimization_recommendations')
          .select('*')
          .eq('account_id', selectedAccount)
          .order('created_at', { ascending: false})
          .limit(1)
          .single();

        setOptimization(data);
      };
      loadExisting();
    }
  }, [selectedAccount]);

  return (
    <div className="space-y-6">
      {/* Action Panel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Generate Posting Optimization Analysis
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Analysis Period (Days)
            </label>
            <input
              type="number"
              value={analysisDays}
              onChange={(e) => setAnalysisDays(Number(e.target.value))}
              min="7"
              max="90"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <button
            onClick={generateOptimization}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing Posting Patterns...
              </>
            ) : (
              <>
                <Clock className="w-5 h-5" />
                Analyze Posting Times
              </>
            )}
          </button>
        </div>
      </div>

      {/* Optimization Results */}
      {optimization ? (
        <div className="space-y-6">
          {/* Confidence Score */}
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Analysis Confidence</p>
                <p className="text-3xl font-bold">{optimization.confidence_score}%</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Recommended Frequency</p>
                <p className="text-3xl font-bold">{optimization.recommended_posting_frequency} posts/week</p>
              </div>
            </div>
          </div>

          {/* Optimal Posting Times */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              Optimal Posting Times by Day
            </h4>
            <div className="space-y-3">
              {optimization.optimal_posting_times?.map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{day.day}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Avg Engagement: {day.avgEngagement}%
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {day.times?.map((time: string, tIndex: number) => (
                      <span
                        key={tIndex}
                        className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content Type Recommendations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              Content Type Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(optimization.content_type_recommendations || {}).map(([type, rec]: [string, any]) => (
                <div key={type} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-gray-900 dark:text-white capitalize">{type}</h5>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      rec.recommended 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400'
                    }`}>
                      {rec.recommended ? 'Recommended' : 'Optional'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Frequency: <strong>{rec.frequency}</strong>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Avg Engagement: <strong>{rec.avgEngagement}%</strong>
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {rec.reasoning}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Audience Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Audience Activity Patterns
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(optimization.audience_activity_hours || {}).map(([period, activity]: [string, any]) => (
                <div key={period} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1 capitalize">{period}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">{activity.hours}</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {activity.activityLevel}
                  </p>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-blue-500 rounded-full h-2"
                      style={{ width: `${activity.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No optimization data available. Generate analysis to see recommendations!
          </p>
        </div>
      )}
    </div>
  );
}
