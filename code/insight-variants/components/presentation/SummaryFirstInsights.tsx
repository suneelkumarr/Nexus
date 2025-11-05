import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target,
  ChevronRight, Lightbulb, BarChart3
} from 'lucide-react';

interface SummaryCardProps {
  summary: any;
  onInsightClick?: (insight: Insight) => void;
}

const InsightsSummaryCard: React.FC<SummaryCardProps> = ({ summary, onInsightClick }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Your Instagram Health</h2>
          <p className="text-blue-100 text-lg">Comprehensive insights and recommendations</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-bold">{Math.round(summary.overall_health_score)}%</div>
          <div className="text-blue-200">Overall Score</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-300" />
            </div>
            <h3 className="font-semibold">High Priority</h3>
          </div>
          <div className="text-2xl font-bold">{summary.high_priority_count}</div>
          <p className="text-blue-200 text-sm">Issues requiring immediate attention</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-300" />
            </div>
            <h3 className="font-semibold">Total Insights</h3>
          </div>
          <div className="text-2xl font-bold">{summary.total_insights}</div>
          <p className="text-blue-200 text-sm">Analysis points discovered</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-300" />
            </div>
            <h3 className="font-semibold">Categories</h3>
          </div>
          <div className="text-2xl font-bold">{summary.categories.length}</div>
          <p className="text-blue-200 text-sm">Areas analyzed</p>
        </div>
      </div>

      {summary.recommended_actions && summary.recommended_actions.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Lightbulb className="w-5 h-5 text-yellow-300" />
            <h3 className="font-semibold">Key Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {summary.recommended_actions.slice(0, 3).map((action, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="flex-shrink-0 w-5 h-5 bg-yellow-500/20 text-yellow-300 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                  {index + 1}
                </span>
                <span className="text-blue-50">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface PriorityInsightCardProps {
  insight: Insight;
  onClick?: (insight: Insight) => void;
}

const PriorityInsightCard: React.FC<PriorityInsightCardProps> = ({ insight, onClick }) => {
  const getPriorityGradient = (priority: string) => {
    switch (priority) {
      case 'high': return 'from-red-500 to-red-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-green-500 to-green-600';
      default: return 'from-gray-500 to-gray-600';
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
    <div 
      className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all cursor-pointer overflow-hidden"
      onClick={() => onClick?.(insight)}
    >
      <div className={`h-2 bg-gradient-to-r ${getPriorityGradient(insight.priority)}`} />
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 bg-gradient-to-r ${getPriorityGradient(insight.priority)} rounded-lg text-white`}>
              {getTypeIcon(insight.type)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{insight.title}</h3>
              <p className="text-sm text-gray-600 capitalize">{insight.type} • {insight.timeframe}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            insight.priority === 'high' ? 'bg-red-100 text-red-800' :
            insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {insight.priority.toUpperCase()}
          </span>
        </div>

        <p className="text-gray-700 mb-4 leading-relaxed">{insight.description}</p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Lightbulb className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-blue-900">Quick Recommendation</span>
          </div>
          <p className="text-blue-800 text-sm">{insight.recommendation}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <span>Impact:</span>
              <span className="font-medium">{insight.impact_score}/10</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>Confidence:</span>
              <span className="font-medium">{insight.confidence_score}%</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1 text-blue-600">
            <span className="text-sm font-medium">View Details</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Summary-first presentation component
export const SummaryFirstInsights: React.FC<BaseInsightComponentProps> = ({ 
  insights, 
  summary,
  onInsightClick,
  className = ""
}) => {
  const highPriorityInsights = insights.filter(i => i.priority === 'high');
  const mediumPriorityInsights = insights.filter(i => i.priority === 'medium');
  const lowPriorityInsights = insights.filter(i => i.priority === 'low');

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Hero Summary Section */}
      <InsightsSummaryCard summary={summary} onInsightClick={onInsightClick} />

      {/* High Priority Insights */}
      {highPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Critical Issues</h2>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {highPriorityInsights.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {highPriorityInsights.map(insight => (
              <PriorityInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Medium Priority Insights */}
      {mediumPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Important Improvements</h2>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
              {mediumPriorityInsights.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mediumPriorityInsights.map(insight => (
              <PriorityInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Low Priority Insights */}
      {lowPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Optimization Opportunities</h2>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {lowPriorityInsights.length} items
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {lowPriorityInsights.map(insight => (
              <PriorityInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Key Trends Section */}
      {summary?.key_trends && summary.key_trends.length > 0 && (
        <section className="bg-gray-50 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Key Trends</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.key_trends.map((trend, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700">{trend}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};