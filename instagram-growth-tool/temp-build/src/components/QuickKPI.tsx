import React from 'react';
import { TrendingUp, TrendingDown, Users, Heart, MessageCircle, Eye, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { KPIMetric } from '@/types/analytics';

interface QuickKPIProps {
  data: {
    totalFollowers: KPIMetric;
    engagementRate: KPIMetric;
    postReach: KPIMetric;
    totalLikes: KPIMetric;
    totalComments: KPIMetric;
  };
  loading?: boolean;
}

const QuickKPI: React.FC<QuickKPIProps> = ({ data, loading = false }) => {
  const formatValue = (value: number | string, format?: string): string => {
    if (typeof value === 'string') return value;
    
    switch (format) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'compact':
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value);
      default:
        return new Intl.NumberFormat('en-US').format(value);
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const KPIItem: React.FC<{ metric: KPIMetric }> = ({ metric }) => {
    const Icon = metric.icon;
    
    if (loading) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${metric.color} group-hover:scale-110 transition-transform duration-200`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{metric.title}</span>
          </div>
          
          {metric.trendPercentage && (
            <div className={`flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
              {getTrendIcon(metric.trend)}
              <span className="text-xs font-medium">
                {Math.abs(metric.trendPercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatValue(metric.value, metric.format)}
              </h3>
              {metric.isPercentage && (
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
                    style={{ width: `${Math.min(Number(metric.value), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {metric.previousValue && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Previous: {formatValue(metric.previousValue, metric.format)}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
                </div>
                <div className="w-16 h-6 bg-gray-300 dark:bg-gray-600 rounded"></div>
              </div>
              <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <KPIItem metric={data.totalFollowers} />
      <KPIItem metric={data.engagementRate} />
      <KPIItem metric={data.postReach} />
      <KPIItem metric={data.totalLikes} />
      <KPIItem metric={data.totalComments} />
    </div>
  );
};

export default QuickKPI;