import React from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';

interface InsightCardProps {
  insight: Insight;
  onClick?: (insight: Insight) => void;
  showFullDetails?: boolean;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight, onClick, showFullDetails = false }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'engagement': return <Target className="w-5 h-5 text-blue-600" />;
      case 'content': return <CheckCircle className="w-5 h-5 text-purple-600" />;
      case 'competitive': return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default: return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div 
      className={`p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${getPriorityColor(insight.priority)}`}
      onClick={() => onClick?.(insight)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getTypeIcon(insight.type)}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{insight.title}</h3>
            <p className="text-sm text-gray-600 capitalize">{insight.type} insight</p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {insight.priority.toUpperCase()}
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <span>Impact: {insight.impact_score}/10</span>
            <span>•</span>
            <span>Confidence: {insight.confidence_score}%</span>
          </div>
        </div>
      </div>

      <p className="text-gray-700 mb-4 leading-relaxed">{insight.description}</p>

      {showFullDetails && (
        <>
          <div className="mb-4 p-3 bg-blue-50 rounded-md border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">Recommendation</h4>
            <p className="text-blue-800 text-sm">{insight.recommendation}</p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Action Steps</h4>
            <ul className="space-y-1">
              {insight.actionable_steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Timeframe: {insight.timeframe}</span>
              <div className="flex flex-wrap gap-1">
                {insight.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Card-based layout component
export const CardBasedInsights: React.FC<BaseInsightComponentProps> = ({ 
  insights, 
  summary,
  onInsightClick,
  className = "",
  showFullDetails = false
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Header */}
      {summary && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{summary.total_insights}</div>
              <div className="text-blue-100">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-300">{summary.high_priority_count}</div>
              <div className="text-blue-100">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">{Math.round(summary.overall_health_score)}%</div>
              <div className="text-blue-100">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">{summary.categories.length}</div>
              <div className="text-blue-100">Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* Category Overview */}
      {summary?.categories && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {summary.categories.map(category => (
            <div key={category.id} className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{category.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                  <p className="text-xs text-gray-600">{category.insight_count} insights</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map(insight => (
          <InsightCard 
            key={insight.id} 
            insight={insight} 
            onClick={onInsightClick}
            showFullDetails={showFullDetails}
          />
        ))}
      </div>
    </div>
  );
};