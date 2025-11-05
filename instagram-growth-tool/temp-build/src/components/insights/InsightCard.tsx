import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Target, 
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Star,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
import { InsightData } from '@/utils/insightGenerator';
import AlertBadge from './AlertBadge';

interface InsightCardProps {
  insight: InsightData;
  onMarkAsRead?: (insightId: string) => void;
  onExpand?: (insightId: string) => void;
  isExpanded?: boolean;
  className?: string;
}

export default function InsightCard({ 
  insight, 
  onMarkAsRead, 
  onExpand,
  isExpanded = false,
  className = ''
}: InsightCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);

  const handleMarkAsRead = () => {
    if (onMarkAsRead) {
      onMarkAsRead(insight.id);
    }
  };

  const handleExpand = () => {
    if (onExpand) {
      onExpand(insight.id);
    }
  };

  const getSeverityGradient = () => {
    switch (insight.severity) {
      case 'urgent':
        return 'from-red-500 to-pink-500';
      case 'high':
        return 'from-orange-500 to-red-500';
      case 'medium':
        return 'from-yellow-500 to-orange-500';
      case 'low':
        return 'from-blue-500 to-cyan-500';
    }
  };

  const getImpactIcon = () => {
    switch (insight.impact) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'negative':
        return <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDifficultyColor = () => {
    switch (insight.difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = () => {
    switch (insight.type) {
      case 'recommendation':
        return <Lightbulb className="h-5 w-5 text-cyan-600" />;
      case 'opportunity':
        return <Zap className="h-5 w-5 text-green-600" />;
      case 'performance':
        return <BarChart3 className="h-5 w-5 text-purple-600" />;
      case 'timing':
        return <Clock className="h-5 w-5 text-indigo-600" />;
      default:
        return <Target className="h-5 w-5 text-orange-600" />;
    }
  };

  const shouldTruncate = insight.description.length > 120;

  return (
    <div className={`
      bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 
      shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden
      ${!insight.isRead ? 'ring-2 ring-blue-200 dark:ring-blue-800' : ''}
      ${className}
    `}>
      {/* Header */}
      <div className={`bg-gradient-to-r ${getSeverityGradient()} p-4 text-white`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-white/20 rounded-lg">
              {getTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm line-clamp-2">
                  {insight.title}
                </h3>
                {insight.confidence >= 90 && (
                  <Star className="h-4 w-4 text-yellow-300 fill-current" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs opacity-90">
                <AlertBadge 
                  severity={insight.severity} 
                  type={insight.type}
                  size="sm"
                  showIcon={false}
                />
                <span className="capitalize">
                  {insight.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-75">
              {insight.confidence}%
            </span>
            {getImpactIcon()}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 leading-relaxed">
          {showFullDescription || !shouldTruncate 
            ? insight.description
            : `${insight.description.substring(0, 120)}...`
          }
          {shouldTruncate && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 hover:text-blue-700 ml-1 font-medium"
            >
              {showFullDescription ? 'Show less' : 'Read more'}
            </button>
          )}
        </p>

        {/* Metrics */}
        {insight.metrics && (
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Current:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {insight.metrics.current.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">Change:</span>
                <span className={`font-semibold ${
                  insight.metrics!.change > 0 ? 'text-green-600' : 
                  insight.metrics!.change < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {insight.metrics!.change > 0 ? '+' : ''}{insight.metrics!.change.toFixed(1)}
                  ({insight.metrics!.changePercentage > 0 ? '+' : ''}{insight.metrics!.changePercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            {insight.metrics.benchmark && (
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-gray-600 dark:text-gray-400">Industry Average:</span>
                <span className="font-semibold text-gray-600 dark:text-gray-300">
                  {insight.metrics.benchmark.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Items Preview */}
        {insight.actionItems && insight.actionItems.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Key Actions
              </span>
              <button
                onClick={handleExpand}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
                    Expand
                  </>
                )}
              </button>
            </div>
            <ul className="space-y-1">
              {insight.actionItems.slice(0, isExpanded ? undefined : 2).map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">{action}</span>
                </li>
              ))}
              {!isExpanded && insight.actionItems.length > 2 && (
                <li className="text-xs text-gray-500 dark:text-gray-400 ml-5">
                  +{insight.actionItems.length - 2} more actions...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {insight.estimatedValue && (
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  {insight.estimatedValue}
                </span>
              </div>
            )}
            {insight.implementationTime && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-500">
                  {insight.implementationTime}
                </span>
              </div>
            )}
            {insight.difficulty && (
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor()}`}>
                {insight.difficulty}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!insight.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mark as Read
              </button>
            )}
            {insight.actionable && (
              <button className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">
                <span>Take Action</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}