import React, { useState } from 'react';
import { Insight, InteractiveInsightProps } from '../types';
import { 
  ChevronDown, ChevronRight, ChevronUp, Maximize2, 
  BarChart3, TrendingUp, AlertCircle, Target,
  Eye, EyeOff, ExternalLink, RotateCcw
} from 'lucide-react';

// Drill down level indicators
const DrillDownLevelIndicator: React.FC<{ 
  currentLevel: number; 
  maxLevel: number;
  onLevelChange: (level: number) => void;
}> = ({ currentLevel, maxLevel, onLevelChange }) => {
  return (
    <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
      <span className="text-sm font-medium text-gray-700">Drill Down Level:</span>
      {[0, 1, 2].map(level => (
        <button
          key={level}
          onClick={() => onLevelChange(level)}
          className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
            currentLevel === level
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {level}
        </button>
      ))}
      <span className="text-xs text-gray-500 ml-2">
        {currentLevel === 0 ? 'Overview' : 
         currentLevel === 1 ? 'Analysis' : 'Deep Dive'}
      </span>
    </div>
  );
};

// Expandable insight card with drill-down capability
const ExpandableInsightCard: React.FC<{
  insight: Insight;
  level: number;
  expanded: boolean;
  onToggleExpand: () => void;
  onDrillDown?: (insight: Insight, level: number) => void;
}> = ({ insight, level, expanded, onToggleExpand, onDrillDown }) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const getLevelContent = () => {
    switch (level) {
      case 0:
        return {
          title: insight.title,
          description: insight.description.substring(0, 150) + (insight.description.length > 150 ? '...' : ''),
          actions: ['View Details', 'Drill Down'],
          icon: <BarChart3 className="w-5 h-5" />
        };
      case 1:
        return {
          title: `${insight.title} - Analysis`,
          description: insight.recommendation,
          actions: ['Back to Overview', 'Deep Dive'],
          icon: <TrendingUp className="w-5 h-5" />
        };
      case 2:
        return {
          title: `${insight.title} - Deep Analysis`,
          description: `Full breakdown with ${insight.actionable_steps.length} detailed action steps`,
          actions: ['Back to Analysis', 'Export Report'],
          icon: <Target className="w-5 h-5" />
        };
      default:
        return {
          title: insight.title,
          description: insight.description,
          actions: ['View Details'],
          icon: <BarChart3 className="w-5 h-5" />
        };
    }
  };

  const content = getLevelContent();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-white';
    }
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${getPriorityColor(insight.priority)}`}>
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {content.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{content.title}</h3>
              <p className="text-sm text-gray-600">{content.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              insight.priority === 'high' ? 'bg-red-100 text-red-800' :
              insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {insight.priority.toUpperCase()}
            </span>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 p-6 bg-white">
          {/* Action Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              {content.actions.map((action, index) => {
                if (action === 'View Details' && level > 0) return null;
                if (action === 'Drill Down' && level >= 2) return null;
                if (action === 'Back to Overview' && level === 0) return null;
                if (action === 'Back to Analysis' && level === 0) return null;
                
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (action === 'Drill Down') {
                        onDrillDown?.(insight, level + 1);
                      } else if (action === 'Back to Overview') {
                        onDrillDown?.(insight, 0);
                      } else if (action === 'Back to Analysis') {
                        onDrillDown?.(insight, 1);
                      }
                    }}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                  >
                    {action}
                  </button>
                );
              })}
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <ExternalLink className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Level 0 Content */}
          {level === 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">{insight.impact_score}</div>
                  <div className="text-sm text-gray-600">Impact Score</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">{insight.confidence_score}%</div>
                  <div className="text-sm text-gray-600">Confidence</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">{insight.actionable_steps.length}</div>
                  <div className="text-sm text-gray-600">Action Items</div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Quick Summary</h4>
                <p className="text-gray-700 text-sm">{insight.description}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {insight.tags.slice(0, 5).map(tag => (
                  <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Level 1 Content */}
          {level === 1 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Detailed Analysis</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-900">{insight.recommendation}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Implementation Timeline</h4>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span>Timeframe: {insight.timeframe}</span>
                  <span>•</span>
                  <span>Type: {insight.type}</span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Initial Action Steps</h4>
                <ul className="space-y-2">
                  {insight.actionable_steps.slice(0, 3).map((step, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Level 2 Content */}
          {level === 2 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h4 className="font-bold text-gray-900 mb-4">Complete Action Plan</h4>
                <div className="space-y-4">
                  {insight.actionable_steps.map((step, index) => (
                    <div 
                      key={index}
                      className={`p-3 rounded-lg border transition-colors ${
                        hoveredSection === `step-${index}` 
                          ? 'border-blue-300 bg-blue-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                      onMouseEnter={() => setHoveredSection(`step-${index}`)}
                      onMouseLeave={() => setHoveredSection(null)}
                    >
                      <div className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-gray-800 font-medium">{step}</p>
                          <div className="mt-2 text-xs text-gray-600">
                            Priority: {index < 2 ? 'High' : index < 4 ? 'Medium' : 'Low'} • 
                            Est. Time: {index < 2 ? '30-60 min' : '15-30 min'} • 
                            Difficulty: {index < 2 ? 'Medium' : 'Easy'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metrics Comparison */}
              {insight.metrics_before && insight.metrics_after && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Expected Impact</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-900 mb-2">Current State</h5>
                      <div className="space-y-1 text-sm">
                        <div>Followers: {insight.metrics_before.followers?.toLocaleString()}</div>
                        <div>Engagement: {insight.metrics_before.engagement_rate}%</div>
                        <div>Reach: {insight.metrics_before.reach?.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-medium text-green-900 mb-2">Projected State</h5>
                      <div className="space-y-1 text-sm">
                        <div>Followers: {insight.metrics_after.followers?.toLocaleString()}</div>
                        <div>Engagement: {insight.metrics_after.engagement_rate}%</div>
                        <div>Reach: {insight.metrics_after.reach?.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Success Metrics</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Expected ROI:</span>
                      <span className="ml-2 text-green-600 font-bold">+{insight.impact_score * 10}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Confidence Level:</span>
                      <span className="ml-2 text-blue-600 font-bold">{insight.confidence_score}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Implementation:</span>
                      <span className="ml-2 text-purple-600 font-bold">{insight.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Interactive drill-down insights component
export const InteractiveDrillDownInsights: React.FC<InteractiveInsightProps> = ({
  insights,
  summary,
  drillDownLevel = 0,
  expandedInsights = [],
  onInsightClick,
  onDrillDown,
  onToggleExpand,
  className = ""
}) => {
  const [currentLevel, setCurrentLevel] = useState(drillDownLevel);
  const [viewFilter, setViewFilter] = useState<'all' | 'expanded' | 'high_priority'>('all');

  const filteredInsights = insights.filter(insight => {
    switch (viewFilter) {
      case 'expanded':
        return expandedInsights.includes(insight.id);
      case 'high_priority':
        return insight.priority === 'high';
      default:
        return true;
    }
  });

  const handleLevelChange = (level: number) => {
    setCurrentLevel(level);
    // Optionally apply level filter or refresh insights
  };

  const handleDrillDown = (insight: Insight, level: number) => {
    setCurrentLevel(level);
    onDrillDown?.(insight, level);
    onInsightClick?.(insight);
  };

  const handleToggleExpand = (insightId: string) => {
    onToggleExpand?.(insightId);
  };

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header with Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Interactive Insights Explorer</h2>
            <p className="text-gray-600">Click on any insight to drill down and explore in detail</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <DrillDownLevelIndicator
              currentLevel={currentLevel}
              maxLevel={2}
              onLevelChange={handleLevelChange}
            />
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">View:</span>
              <select
                value={viewFilter}
                onChange={(e) => setViewFilter(e.target.value as any)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Insights</option>
                <option value="expanded">Expanded Only</option>
                <option value="high_priority">High Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Level Description */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Maximize2 className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                Level {currentLevel}: {currentLevel === 0 ? 'Overview' : currentLevel === 1 ? 'Analysis' : 'Deep Dive'}
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                {currentLevel === 0 ? 'Quick overview with key metrics and summary' :
                 currentLevel === 1 ? 'Detailed analysis with recommendations and timeline' :
                 'Complete breakdown with action steps and success metrics'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{filteredInsights.length}</div>
            <div className="text-sm text-gray-600">Insights Shown</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {filteredInsights.filter(i => i.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Priority</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {expandedInsights.length}
            </div>
            <div className="text-sm text-gray-600">Currently Expanded</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{currentLevel}</div>
            <div className="text-sm text-gray-600">Drill Level</div>
          </div>
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map(insight => (
          <ExpandableInsightCard
            key={insight.id}
            insight={insight}
            level={currentLevel}
            expanded={expandedInsights.includes(insight.id)}
            onToggleExpand={() => handleToggleExpand(insight.id)}
            onDrillDown={handleDrillDown}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredInsights.length === 0 && (
        <div className="text-center py-12">
          <EyeOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No insights match your filter</h3>
          <p className="text-gray-600 mb-4">Try adjusting your view filter or drill-down level.</p>
          <button
            onClick={() => setViewFilter('all')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            Show All Insights
          </button>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <Eye className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-yellow-900 mb-2">How to Use Interactive Exploration</h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Click any insight card to expand it</li>
              <li>• Use the level selector to change detail depth</li>
              <li>• Click "Drill Down" to explore specific insights further</li>
              <li>• Filter views to focus on specific insight types</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};