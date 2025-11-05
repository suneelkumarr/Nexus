import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  FileText, Clock, Target, CheckCircle, AlertCircle, 
  TrendingUp, BarChart3, User, Tag, Search
} from 'lucide-react';

interface TextInsightCardProps {
  insight: Insight;
  onClick?: (insight: Insight) => void;
  compact?: boolean;
}

const TextInsightCard: React.FC<TextInsightCardProps> = ({ insight, onClick, compact = false }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          border: 'border-l-red-500',
          bg: 'bg-red-50',
          badge: 'bg-red-100 text-red-800',
          accent: 'text-red-700'
        };
      case 'medium':
        return {
          border: 'border-l-yellow-500',
          bg: 'bg-yellow-50',
          badge: 'bg-yellow-100 text-yellow-800',
          accent: 'text-yellow-700'
        };
      default:
        return {
          border: 'border-l-green-500',
          bg: 'bg-green-50',
          badge: 'bg-green-100 text-green-800',
          accent: 'text-green-700'
        };
    }
  };

  const styles = getPriorityStyles(insight.priority);

  if (compact) {
    return (
      <div 
        className={`border-l-4 ${styles.border} ${styles.bg} p-4 hover:shadow-sm transition-shadow cursor-pointer`}
        onClick={() => onClick?.(insight)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold text-gray-900">{insight.title}</h4>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles.badge}`}>
                {insight.priority}
              </span>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
              {insight.description}
            </p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-600">
              <span>Impact: {insight.impact_score}/10</span>
              <span>•</span>
              <span>Confidence: {insight.confidence_score}%</span>
              <span>•</span>
              <span className="capitalize">{insight.type}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`border-l-4 ${styles.border} ${styles.bg} p-6 hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onClick?.(insight)}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">{insight.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span className="capitalize">{insight.timeframe}</span>
            </span>
            <span className="flex items-center space-x-1">
              <BarChart3 className="w-4 h-4" />
              <span className="capitalize">{insight.type}</span>
            </span>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles.badge}`}>
          {insight.priority.toUpperCase()}
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Analysis</h4>
          <p className="text-gray-700 leading-relaxed">{insight.description}</p>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Recommendation</h4>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-gray-800 leading-relaxed">{insight.recommendation}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Action Steps</h4>
          <ol className="space-y-2">
            {insight.actionable_steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className={`flex-shrink-0 w-6 h-6 ${styles.badge} rounded-full flex items-center justify-center text-xs font-bold mt-0.5`}>
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div>
                <span className="font-medium">Impact Score:</span>
                <span className={`ml-1 font-bold ${styles.accent}`}>{insight.impact_score}/10</span>
              </div>
              <div>
                <span className="font-medium">Confidence:</span>
                <span className={`ml-1 font-bold ${styles.accent}`}>{insight.confidence_score}%</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {insight.tags.slice(0, 4).map(tag => (
                <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Text-based summary component
const TextSummarySection: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-3xl font-bold text-blue-600 mb-1">{summary.total_insights}</div>
          <div className="text-sm text-gray-600">Total Insights Identified</div>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <div className="text-3xl font-bold text-red-600 mb-1">{summary.high_priority_count}</div>
          <div className="text-sm text-gray-600">Require Immediate Attention</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-3xl font-bold text-yellow-600 mb-1">{Math.round(summary.overall_health_score)}%</div>
          <div className="text-sm text-gray-600">Overall Health Score</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-3xl font-bold text-green-600 mb-1">{summary.categories.length}</div>
          <div className="text-sm text-gray-600">Analysis Categories</div>
        </div>
      </div>

      {summary.recommended_actions && summary.recommended_actions.length > 0 && (
        <div>
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Key Recommendations
          </h3>
          <div className="space-y-3">
            {summary.recommended_actions.map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-800 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {summary.key_trends && summary.key_trends.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Key Trends Identified
          </h3>
          <div className="space-y-3">
            {summary.key_trends.map((trend, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-gray-700 leading-relaxed">{trend}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Text-focused presentation component
export const TextFocusedInsights: React.FC<BaseInsightComponentProps> = ({ 
  insights, 
  summary,
  onInsightClick,
  showSearch = true,
  className = ""
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'detailed' | 'compact'>('detailed');

  const filteredInsights = insights.filter(insight => {
    if (searchTerm && !insight.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !insight.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedPriority !== 'all' && insight.priority !== selectedPriority) {
      return false;
    }
    if (selectedType !== 'all' && insight.type !== selectedType) {
      return false;
    }
    return true;
  });

  const highPriorityInsights = filteredInsights.filter(i => i.priority === 'high');
  const mediumPriorityInsights = filteredInsights.filter(i => i.priority === 'medium');
  const lowPriorityInsights = filteredInsights.filter(i => i.priority === 'low');

  return (
    <div className={`max-w-5xl mx-auto p-6 ${className}`}>
      {/* Summary Section */}
      {summary && <TextSummarySection summary={summary} />}

      {/* Filters and Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Detailed Analysis ({filteredInsights.length} insights)
          </h2>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {showSearch && (
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Priority:</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="growth">Growth</option>
                <option value="engagement">Engagement</option>
                <option value="content">Content</option>
                <option value="competitive">Competitive</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">View:</label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value as 'detailed' | 'compact')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="detailed">Detailed</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* High Priority Section */}
      {highPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Critical Issues Requiring Immediate Attention
            </h3>
            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-medium">
              {highPriorityInsights.length}
            </span>
          </div>
          <div className="space-y-6">
            {highPriorityInsights.map(insight => (
              <TextInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Medium Priority Section */}
      {mediumPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Important Improvements Recommended
            </h3>
            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
              {mediumPriorityInsights.length}
            </span>
          </div>
          <div className="space-y-4">
            {mediumPriorityInsights.map(insight => (
              <TextInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Low Priority Section */}
      {lowPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Growth Opportunities and Optimizations
            </h3>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
              {lowPriorityInsights.length}
            </span>
          </div>
          <div className="space-y-4">
            {lowPriorityInsights.map(insight => (
              <TextInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
                compact={viewMode === 'compact'}
              />
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights match your criteria</h3>
          <p className="text-gray-600">Try adjusting your search terms or filters.</p>
        </div>
      )}

      {/* Category Reference */}
      {summary?.categories && (
        <section className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Tag className="w-5 h-5 mr-2" />
            Insight Categories Reference
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {summary.categories.map(category => (
              <div key={category.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg">
                <div className="text-xl">{category.icon}</div>
                <div>
                  <h4 className="font-medium text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.insight_count} insights</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};