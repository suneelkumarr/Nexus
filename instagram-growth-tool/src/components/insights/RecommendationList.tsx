import React, { useState, useMemo } from 'react';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  TrendingUp, 
  AlertCircle, 
  Lightbulb,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react';
import { InsightData } from '@/utils/insightGenerator';
import InsightCard from './InsightCard';

interface RecommendationListProps {
  insights: InsightData[];
  onMarkAsRead?: (insightId: string) => void;
  onRefresh?: () => void;
  className?: string;
}

type FilterType = 'all' | 'urgent' | 'high' | 'medium' | 'low' | 'unread';
type SortType = 'priority' | 'confidence' | 'newest' | 'category';

export default function RecommendationList({ 
  insights, 
  onMarkAsRead, 
  onRefresh,
  className = ''
}: RecommendationListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const filteredAndSortedInsights = useMemo(() => {
    let filtered = insights;

    // Apply filter
    switch (activeFilter) {
      case 'urgent':
        filtered = insights.filter(insight => insight.severity === 'urgent');
        break;
      case 'high':
        filtered = insights.filter(insight => insight.severity === 'high');
        break;
      case 'medium':
        filtered = insights.filter(insight => insight.severity === 'medium');
        break;
      case 'low':
        filtered = insights.filter(insight => insight.severity === 'low');
        break;
      case 'unread':
        filtered = insights.filter(insight => !insight.isRead);
        break;
      default:
        filtered = insights;
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.severity] - priorityOrder[a.severity];
          if (comparison === 0) {
            comparison = b.confidence - a.confidence;
          }
          break;
        case 'confidence':
          comparison = b.confidence - a.confidence;
          break;
        case 'newest':
          comparison = b.createdAt.getTime() - a.createdAt.getTime();
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }

      return sortDirection === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }, [insights, activeFilter, sortBy, sortDirection]);

  const handleSort = (newSortBy: SortType) => {
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('desc');
    }
  };

  const toggleCardExpansion = (insightId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(insightId)) {
      newExpanded.delete(insightId);
    } else {
      newExpanded.add(insightId);
    }
    setExpandedCards(newExpanded);
  };

  const markAllAsRead = () => {
    insights.filter(insight => !insight.isRead).forEach(insight => {
      if (onMarkAsRead) {
        onMarkAsRead(insight.id);
      }
    });
  };

  const getFilterCount = (filter: FilterType) => {
    switch (filter) {
      case 'urgent':
        return insights.filter(i => i.severity === 'urgent').length;
      case 'high':
        return insights.filter(i => i.severity === 'high').length;
      case 'medium':
        return insights.filter(i => i.severity === 'medium').length;
      case 'low':
        return insights.filter(i => i.severity === 'low').length;
      case 'unread':
        return insights.filter(i => !i.isRead).length;
      default:
        return insights.length;
    }
  };

  const getSortIcon = (type: SortType) => {
    if (sortBy !== type) return null;
    return sortDirection === 'asc' ? 
      <SortAsc className="h-3 w-3" /> : 
      <SortDesc className="h-3 w-3" />;
  };

  const urgentInsights = insights.filter(i => i.severity === 'urgent' || i.severity === 'high');
  const unreadCount = insights.filter(i => !i.isRead).length;

  return (
    <div className={className}>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">AI Recommendations</h2>
            <p className="text-purple-100 mb-3">
              {insights.length} insights • {unreadCount} unread • {urgentInsights.length} urgent
            </p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" />
                <span>Personalized for your account</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated in real-time</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{insights.length}</div>
            <div className="text-purple-200 text-sm">Total Insights</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-red-600">
                {getFilterCount('urgent')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Urgent</div>
            </div>
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {getFilterCount('high')}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-cyan-600">
                {insights.filter(i => i.type === 'opportunity').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Opportunities</div>
            </div>
            <Lightbulb className="h-8 w-8 text-cyan-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {unreadCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Unread</div>
            </div>
            <Target className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'urgent', 'high', 'medium', 'low', 'unread'] as FilterType[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                {getFilterCount(filter) > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {getFilterCount(filter)}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort and Actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Sort by:</span>
              {(['priority', 'confidence', 'newest', 'category'] as SortType[]).map((sortType) => (
                <button
                  key={sortType}
                  onClick={() => handleSort(sortType)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    sortBy === sortType
                      ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="capitalize">{sortType}</span>
                  {getSortIcon(sortType)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 dark:border-gray-600 pl-3">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={onRefresh}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-medium hover:bg-gray-700 transition-colors"
              >
                <Clock className="h-3 w-3" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredAndSortedInsights.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 text-center border border-gray-200 dark:border-gray-700">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No insights found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {activeFilter === 'unread' 
                ? "You've read all your insights! Great job staying on top of things."
                : "No insights match your current filter criteria."
              }
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => setActiveFilter('all')}
                className="text-purple-600 hover:text-purple-700 font-medium"
              >
                Show all insights
              </button>
            )}
          </div>
        ) : (
          filteredAndSortedInsights.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onMarkAsRead={onMarkAsRead}
              onExpand={toggleCardExpansion}
              isExpanded={expandedCards.has(insight.id)}
              className={!insight.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
            />
          ))
        )}
      </div>

      {/* Summary Footer */}
      {filteredAndSortedInsights.length > 0 && (
        <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  High confidence insights: {filteredAndSortedInsights.filter(i => i.confidence >= 90).length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  Actionable: {filteredAndSortedInsights.filter(i => i.actionable).length}
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}