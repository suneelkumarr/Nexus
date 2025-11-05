import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target,
  BarChart3, PieChart, Calendar, User, Tag
} from 'lucide-react';

interface DetailedInsightViewProps {
  insight: Insight;
  onBack?: () => void;
}

const DetailedInsightView: React.FC<DetailedInsightViewProps> = ({ insight, onBack }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-6 h-6" />;
      case 'engagement': return <Target className="w-6 h-6" />;
      case 'content': return <CheckCircle className="w-6 h-6" />;
      case 'competitive': return <AlertCircle className="w-6 h-6" />;
      default: return <Clock className="w-6 h-6" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        {onBack && (
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Insights
          </button>
        )}
      </div>

      {/* Main Insight Display */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Priority Header */}
        <div className={`p-6 border-l-4 ${getPriorityColor(insight.priority)} border-l-4`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-lg ${getPriorityColor(insight.priority)}`}>
                {getTypeIcon(insight.type)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{insight.title}</h1>
                <p className="text-gray-600 capitalize">{insight.type} • {insight.timeframe}</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${
              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {insight.priority.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>

        {/* Detailed Content */}
        <div className="p-8">
          {/* Description */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis</h2>
            <p className="text-gray-700 leading-relaxed text-lg">{insight.description}</p>
          </section>

          {/* Metrics Comparison */}
          {insight.metrics_before && insight.metrics_after && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Impact Analysis</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-900 mb-4 flex items-center">
                    <TrendingDown className="w-5 h-5 mr-2" />
                    Current State
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-red-700">Followers:</span>
                      <span className="font-medium">{insight.metrics_before.followers?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Engagement Rate:</span>
                      <span className="font-medium">{insight.metrics_before.engagement_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Reach:</span>
                      <span className="font-medium">{insight.metrics_before.reach?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-700">Likes:</span>
                      <span className="font-medium">{insight.metrics_before.likes?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Projected State
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-green-700">Followers:</span>
                      <span className="font-medium">{insight.metrics_after.followers?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Engagement Rate:</span>
                      <span className="font-medium">{insight.metrics_after.engagement_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Reach:</span>
                      <span className="font-medium">{insight.metrics_after.reach?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Likes:</span>
                      <span className="font-medium">{insight.metrics_after.likes?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Recommendation */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recommendation</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <p className="text-blue-900 text-lg leading-relaxed">{insight.recommendation}</p>
              </div>
            </div>
          </section>

          {/* Action Steps */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Action Steps</h2>
            <div className="space-y-4">
              {insight.actionable_steps.map((step, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <p className="text-gray-800 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Visualization Placeholder */}
          {insight.data_points && insight.data_points.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Trend Analysis</h2>
              <div className="bg-gray-50 rounded-lg p-6 h-64 flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Interactive chart would be rendered here</p>
                  <p className="text-sm text-gray-500 mt-2">Showing {insight.data_points.length} data points over time</p>
                </div>
              </div>
            </section>
          )}

          {/* Metadata */}
          <section className="border-t border-gray-200 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{insight.impact_score}</div>
                <div className="text-sm text-gray-600">Impact Score (1-10)</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{insight.confidence_score}%</div>
                <div className="text-sm text-gray-600">Confidence Level</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{insight.timeframe}</span>
                </div>
                <div className="text-sm text-gray-600">Implementation Timeline</div>
              </div>
            </div>

            {/* Tags */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-3">
                <Tag className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Tags</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {insight.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

interface InsightListProps {
  insights: Insight[];
  onInsightSelect: (insight: Insight) => void;
  selectedInsight?: Insight;
}

const InsightList: React.FC<InsightListProps> = ({ insights, onInsightSelect, selectedInsight }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-300';
    }
  };

  return (
    <div className="space-y-2">
      {insights.map(insight => (
        <div
          key={insight.id}
          className={`p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
            getPriorityColor(insight.priority)
          } ${
            selectedInsight?.id === insight.id 
              ? 'bg-blue-50 border-l-blue-500' 
              : 'bg-white hover:bg-gray-50'
          }`}
          onClick={() => onInsightSelect(insight)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{insight.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span className="capitalize">{insight.type}</span>
                <span>•</span>
                <span>Impact: {insight.impact_score}/10</span>
                <span>•</span>
                <span>{insight.confidence_score}% confidence</span>
              </div>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ml-4 ${
              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {insight.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Detail-first presentation component
export const DetailFirstInsights: React.FC<BaseInsightComponentProps> = ({ 
  insights,
  className = "",
  onInsightClick
}) => {
  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);

  const handleInsightSelect = (insight: Insight) => {
    setSelectedInsight(insight);
    onInsightClick?.(insight);
  };

  const handleBackToList = () => {
    setSelectedInsight(null);
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {selectedInsight ? (
        <DetailedInsightView 
          insight={selectedInsight} 
          onBack={handleBackToList}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Insights List */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">All Insights</h2>
              <InsightList
                insights={insights}
                onInsightSelect={handleInsightSelect}
                selectedInsight={selectedInsight || undefined}
              />
            </div>
          </div>

          {/* Empty State / Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-xl p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Select an Insight to View Details</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Choose any insight from the list to see detailed analysis, metrics, and actionable recommendations.
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">{insights.length}</div>
                  <div className="text-sm text-gray-600">Total Insights</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-red-600">
                    {insights.filter(i => i.priority === 'high').length}
                  </div>
                  <div className="text-sm text-gray-600">High Priority</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(insights.reduce((sum, i) => sum + i.impact_score, 0) / insights.length * 10)}%
                  </div>
                  <div className="text-sm text-gray-600">Avg Impact</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};