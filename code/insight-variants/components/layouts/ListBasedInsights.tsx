import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target,
  ChevronDown, ChevronUp, Filter, Search
} from 'lucide-react';

interface ListItemProps {
  insight: Insight;
  onClick?: (insight: Insight) => void;
  expanded: boolean;
  onToggleExpand: () => void;
}

const InsightListItem: React.FC<ListItemProps> = ({ 
  insight, 
  onClick, 
  expanded, 
  onToggleExpand 
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-green-500 bg-green-50';
      default: return 'border-l-gray-300 bg-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'engagement': return <Target className="w-4 h-4 text-blue-600" />;
      case 'content': return <CheckCircle className="w-4 h-4 text-purple-600" />;
      case 'competitive': return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div 
      className={`border-l-4 ${getPriorityColor(insight.priority)} transition-all hover:shadow-md`}
      onClick={() => onClick?.(insight)}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getTypeIcon(insight.type)}
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{insight.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span className="capitalize">{insight.type}</span>
                <span>•</span>
                <span>Impact: {insight.impact_score}/10</span>
                <span>•</span>
                <span>Confidence: {insight.confidence_score}%</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {insight.priority.toUpperCase()}
            </span>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1 hover:bg-gray-100 rounded"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-md">{insight.recommendation}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Action Steps</h4>
                <ul className="space-y-1">
                  {insight.actionable_steps.map((step, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700">
                      <span className="flex-shrink-0 w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-600">Timeframe: {insight.timeframe}</span>
              <div className="flex flex-wrap gap-1">
                {insight.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// List-based layout component
export const ListBasedInsights: React.FC<BaseInsightComponentProps> = ({ 
  insights, 
  summary,
  onInsightClick,
  showFilters = true,
  showSearch = true,
  className = "",
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'priority' | 'impact' | 'confidence'>('priority');
  const [filterType, setFilterType] = useState<string>('all');

  const toggleExpand = (insightId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredAndSortedInsights = insights
    .filter(insight => {
      if (searchTerm && !insight.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !insight.description.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filterType !== 'all' && insight.type !== filterType) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'impact':
          return b.impact_score - a.impact_score;
        case 'confidence':
          return b.confidence_score - a.confidence_score;
        default:
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
    });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Header */}
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Insights Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{summary.total_insights}</div>
              <div className="text-sm text-gray-600">Total Insights</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{summary.high_priority_count}</div>
              <div className="text-sm text-gray-600">High Priority</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{Math.round(summary.overall_health_score)}%</div>
              <div className="text-sm text-gray-600">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{summary.categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
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
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="growth">Growth</option>
                  <option value="engagement">Engagement</option>
                  <option value="content">Content</option>
                  <option value="competitive">Competitive</option>
                </select>
              </div>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'priority' | 'impact' | 'confidence')}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="priority">Sort by Priority</option>
                <option value="impact">Sort by Impact</option>
                <option value="confidence">Sort by Confidence</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-2">
        {filteredAndSortedInsights.map(insight => (
          <InsightListItem
            key={insight.id}
            insight={insight}
            onClick={onInsightClick}
            expanded={expandedItems.has(insight.id)}
            onToggleExpand={() => toggleExpand(insight.id)}
          />
        ))}
      </div>

      {filteredAndSortedInsights.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};