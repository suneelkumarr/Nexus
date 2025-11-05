import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  FileText, Download, Share2, Print, Eye, BarChart3,
  TrendingUp, AlertCircle, CheckCircle, Clock, Target,
  Mail, ExternalLink, Copy, BookOpen
} from 'lucide-react';

// Static insight summary card component
const StaticInsightSummary: React.FC<{
  insight: Insight;
  showFullContent?: boolean;
}> = ({ insight, showFullContent = false }) => {
  const getPriorityBadge = (priority: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (priority) {
      case 'high':
        return `${baseClasses} bg-red-100 text-red-800 border border-red-200`;
      case 'medium':
        return `${baseClasses} bg-yellow-100 text-yellow-800 border border-yellow-200`;
      default:
        return `${baseClasses} bg-green-100 text-green-800 border border-green-200`;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'growth': return <TrendingUp className="w-5 h-5" />;
      case 'engagement': return <Target className="w-5 h-5" />;
      case 'content': return <CheckCircle className="w-5 h-5" />;
      case 'competitive': return <AlertCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getTypeIcon(insight.type)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{insight.title}</h3>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <span className="capitalize">{insight.type}</span>
                <span>•</span>
                <span>{insight.timeframe}</span>
                <span>•</span>
                <span>Level {insight.priority}</span>
              </div>
            </div>
          </div>
          <span className={getPriorityBadge(insight.priority)}>
            {insight.priority.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{insight.impact_score}</div>
            <div className="text-xs text-gray-600">Impact Score</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-xl font-bold text-green-600">{insight.confidence_score}%</div>
            <div className="text-xs text-gray-600">Confidence</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{insight.actionable_steps.length}</div>
            <div className="text-xs text-gray-600">Actions</div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analysis Summary
          </h4>
          <p className="text-gray-700 leading-relaxed">{insight.description}</p>
        </div>

        {/* Recommendation */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Primary Recommendation</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 font-medium">{insight.recommendation}</p>
          </div>
        </div>

        {/* Action Steps Preview */}
        {showFullContent && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Action Steps</h4>
            <ol className="space-y-2">
              {insight.actionable_steps.map((step, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 text-sm leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Expected Impact */}
        {insight.metrics_before && insight.metrics_after && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Expected Impact</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h5 className="font-medium text-red-900 mb-2">Current</h5>
                <div className="text-sm text-red-800 space-y-1">
                  <div>Followers: {insight.metrics_before.followers?.toLocaleString()}</div>
                  <div>Engagement: {insight.metrics_before.engagement_rate}%</div>
                  <div>Reach: {insight.metrics_before.reach?.toLocaleString()}</div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h5 className="font-medium text-green-900 mb-2">Projected</h5>
                <div className="text-sm text-green-800 space-y-1">
                  <div>Followers: {insight.metrics_after.followers?.toLocaleString()}</div>
                  <div>Engagement: {insight.metrics_after.engagement_rate}%</div>
                  <div>Reach: {insight.metrics_after.reach?.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {insight.tags.slice(0, showFullContent ? undefined : 4).map(tag => (
            <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Bar (Non-functional for static view) */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Eye className="w-4 h-4" />
            <span>Static View - Click not enabled</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" disabled>
              <Download className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" disabled>
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Executive summary component
const ExecutiveSummary: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold mb-2 flex items-center">
            <FileText className="w-8 h-8 mr-3" />
            Executive Summary
          </h2>
          <p className="text-gray-300 text-lg">Instagram Analytics Insights Report</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400 mb-1">Generated</div>
          <div className="text-lg font-medium">{new Date().toLocaleDateString()}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold">Total Insights</h3>
          </div>
          <div className="text-3xl font-bold">{summary.total_insights}</div>
          <p className="text-gray-300 text-sm">Analysis points identified</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="font-semibold">High Priority</h3>
          </div>
          <div className="text-3xl font-bold text-red-400">{summary.high_priority_count}</div>
          <p className="text-gray-300 text-sm">Immediate attention required</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <h3 className="font-semibold">Health Score</h3>
          </div>
          <div className="text-3xl font-bold text-green-400">{Math.round(summary.overall_health_score)}%</div>
          <p className="text-gray-300 text-sm">Overall performance rating</p>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Categories</h3>
          </div>
          <div className="text-3xl font-bold text-purple-400">{summary.categories.length}</div>
          <p className="text-gray-300 text-sm">Areas analyzed</p>
        </div>
      </div>

      {/* Key Recommendations Preview */}
      {summary.recommended_actions && summary.recommended_actions.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-xl font-bold mb-4">Key Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.recommended_actions.slice(0, 4).map((action, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-200 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Category overview component
const CategoryOverview: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <BookOpen className="w-6 h-6 mr-2" />
        Category Distribution
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.categories.map(category => {
          const percentage = (category.insight_count / summary.total_insights) * 100;
          return (
            <div key={category.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{category.name}</h4>
                  <p className="text-sm text-gray-600">{category.insight_count} insights</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{ 
                    width: `${percentage}%`,
                    backgroundColor: category.color 
                  }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{Math.round(percentage)}% of total</span>
                <span className="text-gray-600">Impact: {category.avg_impact_score}/10</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Static summary insights component
export const StaticSummaryInsights: React.FC<BaseInsightComponentProps> = ({
  insights,
  summary,
  className = "",
  onInsightClick
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed'>('summary');
  const [exportMode, setExportMode] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filteredInsights = insights.filter(insight => {
    if (filterPriority !== 'all' && insight.priority !== filterPriority) {
      return false;
    return true;
  });

  const handleExport = (format: string) => {
    setExportMode(format);
    // Simulate export process
    setTimeout(() => setExportMode(null), 2000);
  };

  const highPriorityInsights = filteredInsights.filter(i => i.priority === 'high');
  const mediumPriorityInsights = filteredInsights.filter(i => i.priority === 'medium');
  const lowPriorityInsights = filteredInsights.filter(i => i.priority === 'low');

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Static Insights Report</h1>
            <p className="text-gray-600">Comprehensive analysis - Read-only format</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={exportMode === 'pdf'}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{exportMode === 'pdf' ? 'Exporting...' : 'Export PDF'}</span>
              </button>
              <button
                onClick={() => handleExport('email')}
                disabled={exportMode === 'email'}
                className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{exportMode === 'email' ? 'Sending...' : 'Email Report'}</span>
              </button>
              <button
                onClick={() => handleExport('print')}
                disabled={exportMode === 'print'}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <Print className="w-4 h-4" />
                <span>{exportMode === 'print' ? 'Preparing...' : 'Print'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">View Mode:</span>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as 'summary' | 'detailed')}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="summary">Summary View</option>
              <option value="detailed">Detailed View</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Priority Filter:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority Only</option>
              <option value="medium">Medium Priority Only</option>
              <option value="low">Low Priority Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Executive Summary */}
      {summary && <ExecutiveSummary summary={summary} />}

      {/* Category Overview */}
      {summary && <CategoryOverview summary={summary} />}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">{highPriorityInsights.length}</div>
          <div className="text-red-800 font-medium">Critical Issues</div>
          <div className="text-red-600 text-sm mt-1">Require immediate action</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-yellow-600 mb-2">{mediumPriorityInsights.length}</div>
          <div className="text-yellow-800 font-medium">Important Items</div>
          <div className="text-yellow-600 text-sm mt-1">Recommended improvements</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{lowPriorityInsights.length}</div>
          <div className="text-green-800 font-medium">Growth Opportunities</div>
          <div className="text-green-600 text-sm mt-1">Future enhancements</div>
        </div>
      </div>

      {/* Critical Issues Section */}
      {highPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Critical Issues</h2>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              {highPriorityInsights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {highPriorityInsights.map(insight => (
              <StaticInsightSummary 
                key={insight.id} 
                insight={insight} 
                showFullContent={viewMode === 'detailed'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Important Improvements Section */}
      {mediumPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-yellow-600" />
            <h2 className="text-2xl font-bold text-gray-900">Important Improvements</h2>
            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              {mediumPriorityInsights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mediumPriorityInsights.map(insight => (
              <StaticInsightSummary 
                key={insight.id} 
                insight={insight} 
                showFullContent={viewMode === 'detailed'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Growth Opportunities Section */}
      {lowPriorityInsights.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Growth Opportunities</h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {lowPriorityInsights.length}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {lowPriorityInsights.map(insight => (
              <StaticInsightSummary 
                key={insight.id} 
                insight={insight} 
                showFullContent={viewMode === 'detailed'}
              />
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600 mb-2">This is a static report view. Interactive features are disabled.</p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
          <span>Report generated on {new Date().toLocaleDateString()}</span>
          <span>•</span>
          <span>Total insights: {filteredInsights.length}</span>
          <span>•</span>
          <span>View mode: {viewMode}</span>
        </div>
      </div>
    </div>
  );
};