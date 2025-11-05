import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  AlertCircle, Clock, CheckCircle, TrendingUp, Target, 
  BarChart3, Timer, Zap, Shield, ArrowUp, ArrowDown
} from 'lucide-react';

// Priority-based insight card
const PriorityInsightCard: React.FC<{
  insight: Insight;
  priority: string;
  onClick?: (insight: Insight) => void;
  showUrgencyIndicator?: boolean;
}> = ({ insight, priority, onClick, showUrgencyIndicator = false }) => {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-gradient-to-br from-red-50 to-red-100',
          border: 'border-l-red-500',
          accent: 'text-red-700',
          badge: 'bg-red-500 text-white',
          card: 'hover:shadow-lg',
          icon: <AlertCircle className="w-5 h-5" />
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
          border: 'border-l-yellow-500',
          accent: 'text-yellow-700',
          badge: 'bg-yellow-500 text-white',
          card: 'hover:shadow-md',
          icon: <Clock className="w-5 h-5" />
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-green-50 to-green-100',
          border: 'border-l-green-500',
          accent: 'text-green-700',
          badge: 'bg-green-500 text-white',
          card: 'hover:shadow-md',
          icon: <CheckCircle className="w-5 h-5" />
        };
    }
  };

  const styles = getPriorityStyles(priority);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-4 h-4" />;
      case 'engagement': return <Target className="w-4 h-4" />;
      case 'content': return <BarChart3 className="w-4 h-4" />;
      case 'competitive': return <Shield className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const urgencyScore = (insight.impact_score * 0.4) + (insight.confidence_score * 0.6 / 10);

  return (
    <div 
      className={`${styles.bg} border-l-4 ${styles.border} rounded-lg p-6 transition-all ${styles.card} cursor-pointer`}
      onClick={() => onClick?.(insight)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${styles.badge} rounded-lg text-white`}>
            {styles.icon}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">{insight.title}</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
              <span className="flex items-center space-x-1">
                {getTypeIcon(insight.type)}
                <span className="capitalize">{insight.type}</span>
              </span>
              <span>•</span>
              <span>{insight.timeframe}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {showUrgencyIndicator && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Urgency</div>
              <div className={`text-sm font-bold ${styles.accent}`}>
                {Math.round(urgencyScore * 10)}/10
              </div>
            </div>
          )}
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles.badge} uppercase tracking-wide`}>
            {priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-700 mb-4 leading-relaxed">{insight.description}</p>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className={`text-xl font-bold ${styles.accent}`}>{insight.impact_score}</div>
          <div className="text-xs text-gray-600">Impact</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className={`text-xl font-bold ${styles.accent}`}>{insight.confidence_score}%</div>
          <div className="text-xs text-gray-600">Confidence</div>
        </div>
        <div className="text-center p-3 bg-white rounded-lg border border-gray-200">
          <div className={`text-xl font-bold ${styles.accent}`}>{insight.actionable_steps.length}</div>
          <div className="text-xs text-gray-600">Actions</div>
        </div>
      </div>

      {/* Recommendation Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
        <h4 className="font-medium text-gray-900 mb-2">Recommendation</h4>
        <p className="text-gray-700 text-sm leading-relaxed">
          {insight.recommendation.length > 120 
            ? insight.recommendation.substring(0, 120) + '...'
            : insight.recommendation}
        </p>
      </div>

      {/* Tags and Timeline */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {insight.tags.slice(0, 3).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-500">
          {insight.data_points?.length || 0} data points
        </div>
      </div>
    </div>
  );
};

// Priority timeline component
const PriorityTimeline: React.FC<{ insights: Insight[] }> = ({ insights }) => {
  const priorityOrder = { high: 3, medium: 2, low: 1 };
  
  const sortedInsights = [...insights].sort((a, b) => {
    // Sort by priority first
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Then by impact score
    return b.impact_score - a.impact_score;
  });

  const getTimelineDot = (insight: Insight) => {
    switch (insight.priority) {
      case 'high':
        return 'bg-red-500 border-red-600';
      case 'medium':
        return 'bg-yellow-500 border-yellow-600';
      default:
        return 'bg-green-500 border-green-600';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Timer className="w-6 h-6 mr-2" />
        Priority Timeline
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-300"></div>
        
        <div className="space-y-6">
          {sortedInsights.map((insight, index) => (
            <div key={insight.id} className="relative flex items-start space-x-6">
              {/* Timeline dot */}
              <div className={`relative z-10 w-3 h-3 rounded-full border-2 ${getTimelineDot(insight)} mt-2`}></div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {insight.description.length > 100 
                    ? insight.description.substring(0, 100) + '...'
                    : insight.description}
                </p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>Impact: {insight.impact_score}/10</span>
                  <span>•</span>
                  <span className="capitalize">{insight.type}</span>
                  <span>•</span>
                  <span>{insight.timeframe}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Priority statistics component
const PriorityStatistics: React.FC<{ insights: Insight[] }> = ({ insights }) => {
  const highPriority = insights.filter(i => i.priority === 'high');
  const mediumPriority = insights.filter(i => i.priority === 'medium');
  const lowPriority = insights.filter(i => i.priority === 'low');

  const totalImpact = insights.reduce((sum, i) => sum + i.impact_score, 0);
  const avgImpact = Math.round(totalImpact / insights.length * 10) / 10;

  const urgentInsights = insights
    .filter(i => (i.impact_score * 0.4) + (i.confidence_score * 0.6 / 10) >= 7)
    .sort((a, b) => (b.impact_score * 0.4) + (b.confidence_score * 0.6 / 10) - ((a.impact_score * 0.4) + (a.confidence_score * 0.6 / 10)))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {/* High Priority */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <AlertCircle className="w-8 h-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{highPriority.length}</div>
            <div className="text-red-100 text-sm">High Priority</div>
          </div>
        </div>
        <p className="text-red-100 text-sm mb-2">Critical issues requiring immediate attention</p>
        <div className="text-xs text-red-200">
          {highPriority.length > 0 && `${highPriority.length} insights need action`}
        </div>
      </div>

      {/* Medium Priority */}
      <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Clock className="w-8 h-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{mediumPriority.length}</div>
            <div className="text-yellow-100 text-sm">Medium Priority</div>
          </div>
        </div>
        <p className="text-yellow-100 text-sm mb-2">Important improvements for optimization</p>
        <div className="text-xs text-yellow-200">
          {mediumPriority.length > 0 && `Consider implementing soon`}
        </div>
      </div>

      {/* Low Priority */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <CheckCircle className="w-8 h-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{lowPriority.length}</div>
            <div className="text-green-100 text-sm">Low Priority</div>
          </div>
        </div>
        <p className="text-green-100 text-sm mb-2">Growth opportunities and enhancements</p>
        <div className="text-xs text-green-200">
          {lowPriority.length > 0 && `Future optimization potential`}
        </div>
      </div>

      {/* Average Impact */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <BarChart3 className="w-8 h-8" />
          <div className="text-right">
            <div className="text-3xl font-bold">{avgImpact}</div>
            <div className="text-blue-100 text-sm">Avg Impact</div>
          </div>
        </div>
        <p className="text-blue-100 text-sm mb-2">Overall potential impact across all insights</p>
        <div className="text-xs text-blue-200">
          {insights.length} insights analyzed
        </div>
      </div>
    </div>
  );
};

// Priority-categorized insights component
export const PriorityCategorizedInsights: React.FC<BaseInsightComponentProps> = ({
  insights,
  onInsightClick,
  className = ""
}) => {
  const [activePriority, setActivePriority] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');

  const filteredInsights = activePriority 
    ? insights.filter(insight => insight.priority === activePriority)
    : insights;

  const highPriorityInsights = filteredInsights.filter(i => i.priority === 'high');
  const mediumPriorityInsights = filteredInsights.filter(i => i.priority === 'medium');
  const lowPriorityInsights = filteredInsights.filter(i => i.priority === 'low');

  const priorityLabels = {
    high: 'Critical Issues',
    medium: 'Important Improvements',
    low: 'Growth Opportunities'
  };

  const priorityDescriptions = {
    high: 'Immediate action required - high impact on account performance',
    medium: 'Recommended optimizations - moderate impact on growth',
    low: 'Future enhancements - opportunity for incremental improvements'
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Insights by Priority</h1>
        <p className="text-gray-600 text-lg mb-6">Organized by urgency and potential impact</p>
        
        {/* View Mode Toggle */}
        <div className="inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Card View
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'timeline' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline View
          </button>
        </div>

        {/* Active Filter */}
        {activePriority && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <span>Filtered by:</span>
            <span className="font-semibold">{priorityLabels[activePriority as keyof typeof priorityLabels]}</span>
            <button 
              onClick={() => setActivePriority(null)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Statistics */}
      <PriorityStatistics insights={insights} />

      {/* Timeline View */}
      {viewMode === 'timeline' && (
        <PriorityTimeline insights={filteredInsights} />
      )}

      {/* Priority Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Priority Categories</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['high', 'medium', 'low'].map(priority => {
            const priorityCount = insights.filter(i => i.priority === priority).length;
            const colors = priority === 'high' ? 'red' : priority === 'medium' ? 'yellow' : 'green';
            
            return (
              <button
                key={priority}
                onClick={() => setActivePriority(activePriority === priority ? null : priority)}
                className={`p-6 rounded-lg border-2 transition-all text-left ${
                  activePriority === priority
                    ? `border-${colors}-500 bg-${colors}-50`
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-10 h-10 bg-${colors}-500 rounded-full flex items-center justify-center text-white`}>
                    {priority === 'high' && <AlertCircle className="w-5 h-5" />}
                    {priority === 'medium' && <Clock className="w-5 h-5" />}
                    {priority === 'low' && <CheckCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{priorityLabels[priority as keyof typeof priorityLabels]}</h4>
                    <p className="text-sm text-gray-600">{priorityCount} insights</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-4">{priorityDescriptions[priority as keyof typeof priorityDescriptions]}</p>
                
                {priorityCount > 0 && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Avg Impact: {Math.round(
                        insights
                          .filter(i => i.priority === priority)
                          .reduce((sum, i) => sum + i.impact_score, 0) / priorityCount * 10
                      ) / 10}
                    </span>
                    <span className={`text-${colors}-600 font-medium`}>
                      {activePriority === priority ? 'Active' : 'View All'}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Insights Display */}
      {viewMode === 'cards' && (
        <div className="space-y-12">
          {/* High Priority */}
          {highPriorityInsights.length > 0 && (
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Critical Issues ({highPriorityInsights.length})
                </h2>
                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                  Immediate Action Required
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {highPriorityInsights.map(insight => (
                  <PriorityInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    priority="high"
                    onClick={onInsightClick}
                    showUrgencyIndicator={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Medium Priority */}
          {mediumPriorityInsights.length > 0 && (
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Important Improvements ({mediumPriorityInsights.length})
                </h2>
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Recommended
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {mediumPriorityInsights.map(insight => (
                  <PriorityInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    priority="medium"
                    onClick={onInsightClick}
                    showUrgencyIndicator={true}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Low Priority */}
          {lowPriorityInsights.length > 0 && (
            <section>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-green-500 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Growth Opportunities ({lowPriorityInsights.length})
                </h2>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Future Enhancement
                </span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {lowPriorityInsights.map(insight => (
                  <PriorityInsightCard 
                    key={insight.id} 
                    insight={insight} 
                    priority="low"
                    onClick={onInsightClick}
                    showUrgencyIndicator={false}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <ArrowUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600 mb-4">
            {activePriority 
              ? `No ${priorityLabels[activePriority as keyof typeof priorityLabels]} found.` 
              : 'No insights available to display.'}
          </p>
          {activePriority && (
            <button
              onClick={() => setActivePriority(null)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Show All Priorities
            </button>
          )}
        </div>
      )}
    </div>
  );
};