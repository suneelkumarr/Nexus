import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Target, Users, Zap, Eye, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface PerformancePredictionsProps {
  selectedAccount: string | null;
}

interface PerformancePrediction {
  id: string;
  prediction_type: 'optimal_posting_times' | 'best_content_type' | 'growth_projection' | 'engagement_trend' | 'viral_potential' | 'audience_retention';
  predicted_value: number;
  confidence_score: number;
  time_horizon: string;
  parameters: any;
  created_at: string;
}

const PerformancePredictions: React.FC<PerformancePredictionsProps> = ({ selectedAccount }) => {
  const [predictions, setPredictions] = useState<PerformancePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedAccount) {
      fetchPredictions();
    }
  }, [selectedAccount]);

  const fetchPredictions = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ai_performance_predictions')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPredictions(data || []);
    } catch (err) {
      console.error('Error fetching predictions:', err);
      setError('Failed to load performance predictions');
    } finally {
      setLoading(false);
    }
  };

  const generatePredictions = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-performance-predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ accountId: selectedAccount }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate predictions');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh predictions after generation
      await fetchPredictions();
    } catch (err) {
      console.error('Error generating predictions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate predictions');
    } finally {
      setGenerating(false);
    }
  };

  const getPredictionIcon = (type: string) => {
    switch (type) {
      case 'optimal_posting_times':
        return <Clock className="w-5 h-5" />;
      case 'best_content_type':
        return <Target className="w-5 h-5" />;
      case 'growth_projection':
        return <TrendingUp className="w-5 h-5" />;
      case 'engagement_trend':
        return <Users className="w-5 h-5" />;
      case 'viral_potential':
        return <Zap className="w-5 h-5" />;
      case 'audience_retention':
        return <Eye className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getPredictionColor = (type: string) => {
    switch (type) {
      case 'optimal_posting_times':
        return 'from-blue-500 to-blue-600';
      case 'best_content_type':
        return 'from-green-500 to-green-600';
      case 'growth_projection':
        return 'from-purple-500 to-purple-600';
      case 'engagement_trend':
        return 'from-orange-500 to-orange-600';
      case 'viral_potential':
        return 'from-red-500 to-red-600';
      case 'audience_retention':
        return 'from-teal-500 to-teal-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const formatPredictionValue = (type: string, value: number, parameters: any) => {
    switch (type) {
      case 'optimal_posting_times':
        const hours = Math.floor(value);
        const minutes = Math.round((value - hours) * 60);
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      case 'growth_projection':
        return `+${value.toLocaleString()} followers`;
      case 'engagement_trend':
        return `${value.toFixed(1)}% avg engagement`;
      case 'viral_potential':
        return `${value}% viral chance`;
      case 'audience_retention':
        return `${value.toFixed(1)}% retention`;
      case 'best_content_type':
        const contentTypes = ['Photos', 'Reels', 'Carousels', 'Videos', 'Stories'];
        return contentTypes[Math.floor(value)] || 'Mixed Content';
      default:
        return value.toString();
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 55) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatPredictionTitle = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Generate chart data for growth projections
  const getGrowthChartData = () => {
    const growthPredictions = predictions.filter(p => p.prediction_type === 'growth_projection');
    if (growthPredictions.length === 0) return [];

    return growthPredictions.slice(0, 7).map((prediction, index) => ({
      day: `Day ${index + 1}`,
      value: prediction.predicted_value,
      confidence: prediction.confidence_score
    }));
  };

  const groupedPredictions = predictions.reduce((acc, prediction) => {
    if (!acc[prediction.prediction_type]) {
      acc[prediction.prediction_type] = [];
    }
    acc[prediction.prediction_type].push(prediction);
    return acc;
  }, {} as Record<string, PerformancePrediction[]>);

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Account Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select an Instagram account to view performance predictions.
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
          <h2 className="text-2xl font-bold text-gray-900">Performance Predictions</h2>
          <p className="text-sm text-gray-600 mt-1">
            AI-powered forecasts for optimal performance and growth opportunities
          </p>
        </div>
        <button
          onClick={generatePredictions}
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
              <BarChart3 className="w-4 h-4" />
              <span>Generate Predictions</span>
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
            <span className="text-gray-600">Loading performance predictions...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Predictions Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click "Generate Predictions" to get AI-powered performance forecasts.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Growth Chart */}
              {getGrowthChartData().length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Projection Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getGrowthChartData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value, name) => [
                            `+${value} followers`,
                            'Predicted Growth'
                          ]}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#0891b2" 
                          fill="url(#colorGradient)" 
                          strokeWidth={2}
                        />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0891b2" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Prediction Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedPredictions).map(([type, typePredictions]) => {
                  const latest = typePredictions[0];
                  return (
                    <div
                      key={type}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getPredictionColor(type)} text-white`}>
                          {getPredictionIcon(type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {formatPredictionTitle(type)}
                          </h3>
                          <p className="text-sm text-gray-500">{latest.time_horizon}</p>
                        </div>
                      </div>

                      {/* Prediction Value */}
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-gray-900">
                          {formatPredictionValue(type, latest.predicted_value, latest.parameters)}
                        </p>
                      </div>

                      {/* Confidence Score */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Confidence</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(latest.confidence_score)}`}>
                          {latest.confidence_score}%
                        </span>
                      </div>

                      {/* Additional Info */}
                      {latest.parameters && Object.keys(latest.parameters).length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            Based on {latest.parameters.analysis_period || '30 days'} of data
                          </p>
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">
                          Updated {new Date(latest.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PerformancePredictions;