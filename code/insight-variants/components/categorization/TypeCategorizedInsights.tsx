import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  TrendingUp, Target, CheckCircle, AlertCircle, Clock,
  BarChart3, Zap, Shield, Users, Activity, Lightbulb
} from 'lucide-react';

// Type categorization icons
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'growth': return <TrendingUp className="w-6 h-6" />;
    case 'engagement': return <Target className="w-6 h-6" />;
    case 'content': return <CheckCircle className="w-6 h-6" />;
    case 'competitive': return <Shield className="w-6 h-6" />;
    case 'audience': return <Users className="w-6 h-6" />;
    case 'performance': return <BarChart3 className="w-6 h-6" />;
    default: return <Lightbulb className="w-6 h-6" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'growth': return {
      bg: 'bg-green-50',
      border: 'border-green-200',
      accent: 'text-green-700',
      badge: 'bg-green-100 text-green-800',
      gradient: 'from-green-500 to-green-600'
    };
    case 'engagement': return {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      accent: 'text-blue-700',
      badge: 'bg-blue-100 text-blue-800',
      gradient: 'from-blue-500 to-blue-600'
    };
    case 'content': return {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      accent: 'text-purple-700',
      badge: 'bg-purple-100 text-purple-800',
      gradient: 'from-purple-500 to-purple-600'
    };
    case 'competitive': return {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      accent: 'text-orange-700',
      badge: 'bg-orange-100 text-orange-800',
      gradient: 'from-orange-500 to-orange-600'
    };
    case 'audience': return {
      bg: 'bg-pink-50',
      border: 'border-pink-200',
      accent: 'text-pink-700',
      badge: 'bg-pink-100 text-pink-800',
      gradient: 'from-pink-500 to-pink-600'
    };
    case 'performance': return {
      bg: 'bg-indigo-50',
      border: 'border-indigo-200',
      accent: 'text-indigo-700',
      badge: 'bg-indigo-100 text-indigo-800',
      gradient: 'from-indigo-500 to-indigo-600'
    };
    default:
      return {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        accent: 'text-gray-700',
        badge: 'bg-gray-100 text-gray-800',
        gradient: 'from-gray-500 to-gray-600'
      };
  }
};

// Insight card for type categorization
const TypeCategorizedInsightCard: React.FC<{
  insight: Insight;
  onClick?: (insight: Insight) => void;
}> = ({ insight, onClick }) => {
  const colors = getTypeColor(insight.type);

  return (
    <div 
      className={`${colors.bg} ${colors.border} border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer`}
      onClick={() => onClick?.(insight)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 bg-white rounded-lg ${colors.accent}`}>
            {getTypeIcon(insight.type)}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            <p className="text-xs text-gray-600 capitalize">{insight.timeframe}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          {insight.priority}
        </span>
      </div>

      <p className="text-gray-700 text-sm mb-3 leading-relaxed">{insight.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 text-xs text-gray-600">
          <span>Impact: {insight.impact_score}/10</span>
          <span>•</span>
          <span>Confidence: {insight.confidence_score}%</span>
        </div>
        <div className="flex space-x-1">
          {insight.tags.slice(0, 2).map(tag => (
            <span key={tag} className="px-1.5 py-0.5 bg-white text-gray-600 rounded text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Type category overview
const TypeCategoryOverview: React.FC<{ 
  insights: Insight[];
  activeType: string | null;
  onTypeSelect: (type: string | null) => void;
}> = ({ insights, activeType, onTypeSelect }) => {
  const typeStats = insights.reduce((acc, insight) => {
    if (!acc[insight.type]) {
      acc[insight.type] = { count: 0, highPriority: 0, avgImpact: 0, totalImpact: 0 };
    }
    acc[insight.type].count++;
    acc[insight.type].totalImpact += insight.impact_score;
    if (insight.priority === 'high') acc[insight.type].highPriority++;
    return acc;
  }, {} as Record<string, { count: number; highPriority: number; avgImpact: number; totalImpact: number }>);

  Object.keys(typeStats).forEach(type => {
    typeStats[type].avgImpact = Math.round(typeStats[type].totalImpact / typeStats[type].count * 10) / 10;
  });

  const typeNames: Record<string, string> = {
    growth: 'Growth Strategies',
    engagement: 'Engagement Optimization',
    content: 'Content Improvement',
    competitive: 'Competitive Analysis',
    audience: 'Audience Insights',
    performance: 'Performance Metrics'
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Insights by Category</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => onTypeSelect(null)}
          className={`p-4 rounded-lg border-2 transition-all text-left ${
            activeType === null 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center space-x-3 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">All Categories</h4>
          </div>
          <div className="text-sm text-gray-600 mb-2">{insights.length} total insights</div>
          <div className="text-xs text-gray-500">Show all insights</div>
        </button>

        {Object.entries(typeStats).map(([type, stats]) => {
          const colors = getTypeColor(type);
          const isActive = activeType === type;
          
          return (
            <button
              key={type}
              onClick={() => onTypeSelect(type)}
              className={`p-4 rounded-lg border-2 transition-all text-left ${isActive ? `${colors.border} ${colors.bg}` : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className={isActive ? colors.accent : 'text-gray-600'}>
                  {getTypeIcon(type)}
                </div>
                <h4 className="font-semibold text-gray-900">{typeNames[type] || type}</h4>
              </div>
              <div className="text-sm text-gray-600 mb-1">{stats.count} insights</div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{stats.highPriority} high priority</span>
                <span>Avg Impact: {stats.avgImpact}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Type-categorized insights component
export const TypeCategorizedInsights: React.FC<BaseInsightComponentProps> = ({
  insights,
  onInsightClick,
  className = ""
}) => {
  const [activeType, setActiveType] = useState<string | null>(null);

  const filteredInsights = activeType 
    ? insights.filter(insight => insight.type === activeType)
    : insights;

  const typeNames: Record<string, string> = {
    growth: 'Growth Strategies',
    engagement: 'Engagement Optimization',
    content: 'Content Improvement',
    competitive: 'Competitive Analysis',
    audience: 'Audience Insights',
    performance: 'Performance Metrics'
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Insights by Category</h1>
        <p className="text-gray-600 text-lg">Organized by insight type and focus area</p>
        {activeType && (
          <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
            <span>Showing:</span>
            <span className="font-semibold">{typeNames[activeType] || activeType}</span>
            <button 
              onClick={() => setActiveType(null)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Category Overview */}
      <TypeCategoryOverview 
        insights={insights}
        activeType={activeType}
        onTypeSelect={setActiveType}
      />

      {/* Filtered Insights */}
      <div className="space-y-8">
        {activeType ? (
          // Single category view
          <section>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-white rounded-lg border">
                {getTypeIcon(activeType)}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {typeNames[activeType] || activeType}
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(activeType).badge}`}>
                {filteredInsights.length} insights
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInsights.map(insight => (
                <TypeCategorizedInsightCard 
                  key={insight.id} 
                  insight={insight} 
                  onClick={onInsightClick}
                />
              ))}
            </div>
          </section>
        ) : (
          // All categories view
          Object.entries(
            filteredInsights.reduce((acc, insight) => {
              if (!acc[insight.type]) acc[insight.type] = [];
              acc[insight.type].push(insight);
              return acc;
            }, {} as Record<string, Insight[]>)
          ).map(([type, typeInsights]) => {
            const colors = getTypeColor(type);
            const highPriorityInsights = typeInsights.filter(i => i.priority === 'high');
            const mediumPriorityInsights = typeInsights.filter(i => i.priority === 'medium');
            const lowPriorityInsights = typeInsights.filter(i => i.priority === 'low');

            return (
              <section key={type} className="mb-12">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 bg-gradient-to-r ${colors.gradient} text-white rounded-lg`}>
                    {getTypeIcon(type)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {typeNames[type] || type}
                    </h2>
                    <p className="text-gray-600">{typeInsights.length} insights found</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.badge}`}>
                    {typeInsights.length} total
                  </span>
                </div>

                {/* Priority Breakdown */}
                {highPriorityInsights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-900 mb-3 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Critical Issues ({highPriorityInsights.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {highPriorityInsights.map(insight => (
                        <TypeCategorizedInsightCard 
                          key={insight.id} 
                          insight={insight} 
                          onClick={onInsightClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {mediumPriorityInsights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Important Items ({mediumPriorityInsights.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {mediumPriorityInsights.map(insight => (
                        <TypeCategorizedInsightCard 
                          key={insight.id} 
                          insight={insight} 
                          onClick={onInsightClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {lowPriorityInsights.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Opportunities ({lowPriorityInsights.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {lowPriorityInsights.map(insight => (
                        <TypeCategorizedInsightCard 
                          key={insight.id} 
                          insight={insight} 
                          onClick={onInsightClick}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Category Summary */}
                <div className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{typeInsights.length}</div>
                      <div className="text-sm text-gray-600">Total Insights</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{highPriorityInsights.length}</div>
                      <div className="text-sm text-gray-600">High Priority</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(typeInsights.reduce((sum, i) => sum + i.impact_score, 0) / typeInsights.length * 10) / 10}
                      </div>
                      <div className="text-sm text-gray-600">Avg Impact</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {Math.round(typeInsights.reduce((sum, i) => sum + i.confidence_score, 0) / typeInsights.length)}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Confidence</div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights found</h3>
          <p className="text-gray-600 mb-4">
            {activeType 
              ? `No insights found for ${typeNames[activeType] || activeType}.` 
              : 'No insights available to display.'}
          </p>
          {activeType && (
            <button
              onClick={() => setActiveType(null)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Show All Categories
            </button>
          )}
        </div>
      )}
    </div>
  );
};