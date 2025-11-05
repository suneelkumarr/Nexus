import React, { useState } from 'react';
import { Insight, BaseInsightComponentProps } from '../types';
import { 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target,
  BarChart3, PieChart, Activity, Zap
} from 'lucide-react';

// Mock chart component
const SimpleChart: React.FC<{ data: { date: string; value: number }[], height?: number }> = ({ 
  data, 
  height = 120 
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="relative" style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1="0"
            y1={ratio * 100 + "%"}
            x2="100%"
            y2={ratio * 100 + "%"}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}
        
        {/* Data line */}
        {data.length > 1 && (
          <polyline
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            points={data.map((point, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((point.value - minValue) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
          />
        )}
        
        {/* Data points */}
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.value - minValue) / range) * 100;
          return (
            <circle
              key={index}
              cx={`${x}%`}
              cy={`${y}%`}
              r="3"
              fill="#3b82f6"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Mock gauge component
const ImpactGauge: React.FC<{ value: number; max?: number }> = ({ value, max = 10 }) => {
  const percentage = (value / max) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg width="96" height="48" className="absolute top-0 left-0">
        {/* Gauge background */}
        <path
          d="M 8 40 A 40 40 0 0 1 88 40"
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
        />
        {/* Gauge fill */}
        <path
          d="M 8 40 A 40 40 0 0 1 88 40"
          fill="none"
          stroke={percentage > 70 ? "#10b981" : percentage > 40 ? "#f59e0b" : "#ef4444"}
          strokeWidth="8"
          strokeDasharray={`${(percentage / 100) * 126} 126`}
          strokeLinecap="round"
        />
        {/* Needle */}
        <line
          x1="48"
          y1="40"
          x2={48 + 32 * Math.cos((rotation * Math.PI) / 180)}
          y2={40 + 32 * Math.sin((rotation * Math.PI) / 180)}
          stroke="#374151"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="48" cy="40" r="3" fill="#374151" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 text-center">
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-xs text-gray-600">out of {max}</div>
      </div>
    </div>
  );
};

interface VisualInsightCardProps {
  insight: Insight;
  onClick?: (insight: Insight) => void;
}

const VisualInsightCard: React.FC<VisualInsightCardProps> = ({ insight, onClick }) => {
  const getVisualTheme = (type: string, priority: string) => {
    if (priority === 'high') {
      return {
        gradient: 'from-red-500 to-red-600',
        accent: 'bg-red-500',
        light: 'bg-red-50',
        text: 'text-red-700'
      };
    } else if (priority === 'medium') {
      return {
        gradient: 'from-yellow-500 to-yellow-600',
        accent: 'bg-yellow-500',
        light: 'bg-yellow-50',
        text: 'text-yellow-700'
      };
    }
    return {
      gradient: 'from-green-500 to-green-600',
      accent: 'bg-green-500',
      light: 'bg-green-50',
      text: 'text-green-700'
    };
  };

  const theme = getVisualTheme(insight.type, insight.priority);

  return (
    <div 
      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => onClick?.(insight)}
    >
      {/* Visual Header with Icon */}
      <div className={`bg-gradient-to-r ${theme.gradient} p-6 text-white relative overflow-hidden`}>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-full">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{insight.title}</h3>
                <p className="text-white/80 text-sm capitalize">{insight.type} analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{insight.impact_score}</div>
              <div className="text-white/80 text-xs">impact</div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12" />
      </div>

      {/* Chart/Visual Content */}
      <div className="p-6">
        {insight.data_points && insight.data_points.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Trend Analysis
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <SimpleChart data={insight.data_points.slice(0, 12)} height={80} />
              <div className="flex justify-between text-xs text-gray-600 mt-2">
                <span>{insight.data_points[0]?.date}</span>
                <span>Last 30 days</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className={`${theme.light} rounded-lg p-3 text-center`}>
                <div className="text-xl font-bold ${theme.text}">
                  {insight.confidence_score}%
                </div>
                <div className="text-xs text-gray-600">Confidence</div>
              </div>
              <div className={`${theme.light} rounded-lg p-3 text-center`}>
                <div className="text-xl font-bold ${theme.text}">
                  {insight.timeframe}
                </div>
                <div className="text-xs text-gray-600">Timeline</div>
              </div>
            </div>
          </div>
        )}

        {/* Impact Gauge */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">Impact Score</h4>
          <ImpactGauge value={insight.impact_score} />
        </div>

        {/* Brief Description */}
        <div className="text-center">
          <p className="text-gray-700 text-sm leading-relaxed">{insight.description}</p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          {insight.tags.slice(0, 3).map(tag => (
            <span 
              key={tag} 
              className={`px-2 py-1 ${theme.light} ${theme.text} rounded-full text-xs font-medium`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Action */}
      <div className={`bg-gradient-to-r ${theme.gradient} text-white p-3 text-center opacity-0 group-hover:opacity-100 transition-opacity`}>
        <span className="font-medium">Click to explore details</span>
      </div>
    </div>
  );
};

// Visual metrics dashboard component
const VisualMetricsDashboard: React.FC<{ summary: any }> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Insights */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.total_insights}</div>
              <div className="text-blue-100 text-sm">Total Insights</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full" />
      </div>

      {/* High Priority */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.high_priority_count}</div>
              <div className="text-red-100 text-sm">High Priority</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${(summary.high_priority_count / summary.total_insights) * 100}%` }} 
            />
          </div>
        </div>
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
      </div>

      {/* Health Score */}
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{Math.round(summary.overall_health_score)}%</div>
              <div className="text-green-100 text-sm">Health Score</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-white h-2 rounded-full" 
              style={{ width: `${summary.overall_health_score}%` }} 
            />
          </div>
        </div>
        <div className="absolute -top-2 -right-2 w-12 h-12 bg-white/10 rounded-full" />
      </div>

      {/* Categories */}
      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <PieChart className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{summary.categories.length}</div>
              <div className="text-purple-100 text-sm">Categories</div>
            </div>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div className="bg-white h-2 rounded-full" style={{ width: '75%' }} />
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
      </div>
    </div>
  );
};

// Visual-heavy presentation component
export const VisualHeavyInsights: React.FC<BaseInsightComponentProps> = ({ 
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
      {/* Hero Visual Dashboard */}
      {summary && <VisualMetricsDashboard summary={summary} />}

      {/* Critical Insights Section */}
      {highPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-red-500 rounded-full">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Critical Issues</h2>
              <p className="text-gray-600">Immediate attention required</p>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {highPriorityInsights.map(insight => (
              <VisualInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Important Insights Section */}
      {mediumPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-yellow-500 rounded-full">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Important Improvements</h2>
              <p className="text-gray-600">Recommended optimizations</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediumPriorityInsights.map(insight => (
              <VisualInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Opportunities Section */}
      {lowPriorityInsights.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-green-500 rounded-full">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Growth Opportunities</h2>
              <p className="text-gray-600">Future enhancements</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {lowPriorityInsights.map(insight => (
              <VisualInsightCard 
                key={insight.id} 
                insight={insight} 
                onClick={onInsightClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Interactive Category Visualization */}
      {summary?.categories && (
        <section className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-blue-500 rounded-full">
              <PieChart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Category Breakdown</h2>
              <p className="text-gray-600">Insights distributed across categories</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {summary.categories.map(category => {
              const percentage = (category.insight_count / summary.total_insights) * 100;
              return (
                <div key={category.id} className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                  <div 
                    className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{category.name}</h3>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{category.insight_count}</div>
                  <div className="text-sm text-gray-600 mb-4">insights</div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: category.color 
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">{Math.round(percentage)}% of total</div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm">
                      <span className="text-gray-600">Avg Impact: </span>
                      <span className="font-semibold">{category.avg_impact_score}/10</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};