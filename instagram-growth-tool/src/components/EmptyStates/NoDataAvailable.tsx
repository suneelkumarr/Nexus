import React from 'react';
import { BarChart3, Calendar, RefreshCw, Filter, TrendingUp } from 'lucide-react';

interface NoDataAvailableProps {
  onRefresh?: () => void;
  onChangeTimeRange?: () => void;
  onChangeFilter?: () => void;
  className?: string;
  timeRange?: string;
  filterType?: string;
  showActions?: boolean;
  compact?: boolean;
}

const NoDataAvailable: React.FC<NoDataAvailableProps> = ({
  onRefresh,
  onChangeTimeRange,
  onChangeFilter,
  className = '',
  timeRange = 'last 30 days',
  filterType = 'all content',
  showActions = true,
  compact = false
}) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      // Default refresh action
      console.log('Refreshing data...');
    }
  };

  const handleChangeTimeRange = () => {
    if (onChangeTimeRange) {
      onChangeTimeRange();
    } else {
      console.log('Changing time range');
    }
  };

  const handleChangeFilter = () => {
    if (onChangeFilter) {
      onChangeFilter();
    } else {
      console.log('Changing filter');
    }
  };

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg mx-auto mb-4">
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No data available
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Try adjusting your time range or filters
        </p>
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={handleChangeTimeRange}
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
            >
              Time Range
            </button>
            <button
              onClick={handleRefresh}
              className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center justify-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mb-6">
          <BarChart3 className="w-10 h-10 text-gray-400" />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          No data available
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          We couldn't find any data for <span className="font-medium">{timeRange}</span> 
          {filterType && filterType !== 'all content' && (
            <> filtered by <span className="font-medium">{filterType}</span></>
          )}. This might be because:
        </p>

        {/* Reasons List */}
        <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>No activity during this time period</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Your account was newly connected</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Content hasn't been published yet</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
              <span>Data is still being processed</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh Data
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={handleChangeTimeRange}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Calendar className="w-4 h-4" />
                Change Time
              </button>
              
              <button
                onClick={handleChangeFilter}
                className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 text-left bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                💡 Pro Tip
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Try looking at a longer time period or different date range to see if you have data available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoDataAvailable;