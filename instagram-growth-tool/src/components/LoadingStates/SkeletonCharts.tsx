import React from 'react';

interface SkeletonChartProps {
  type?: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  width?: string;
  showLegend?: boolean;
  showAxes?: boolean;
  className?: string;
  variant?: 'compact' | 'default' | 'detailed';
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({
  type = 'line',
  height = 200,
  width = '100%',
  showLegend = true,
  showAxes = true,
  className = '',
  variant = 'default'
}) => {
  const renderLineChart = () => (
    <div className="relative">
      {/* Chart Area */}
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden"
        style={{ height, width }}
      >
        {/* Grid Lines */}
        {variant !== 'compact' && showAxes && (
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="border-t border-gray-200 dark:border-gray-700"></div>
            ))}
          </div>
        )}
        
        {/* Animated Line */}
        <div className="absolute inset-0 flex items-end p-4">
          <div className="w-full h-full relative">
            <div className="absolute bottom-0 left-0 w-full h-2/3 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-t-lg animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-3/4 bg-gradient-to-r from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800 rounded-t-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBarChart = () => (
    <div 
      className="bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden"
      style={{ height, width }}
    >
      {/* Bars */}
      <div className="absolute inset-0 flex items-end gap-2 p-4">
        {[...Array(variant === 'compact' ? 4 : 8)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-t animate-pulse"
            style={{ 
              height: `${Math.random() * 60 + 20}%`,
              animationDelay: `${i * 0.1}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );

  const renderPieChart = () => (
    <div className="flex items-center justify-center" style={{ height, width }}>
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse relative">
          {/* Pie segments */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-60 animate-pulse"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-60 animate-pulse" style={{ animationDelay: '0.3s' }}></div>
        </div>
      </div>
    </div>
  );

  const renderAreaChart = () => (
    <div className="relative">
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden"
        style={{ height, width }}
      >
        {/* Filled Area */}
        <div className="absolute bottom-0 left-0 w-full h-3/4">
          <div className="w-full h-full bg-gradient-to-t from-purple-200 via-pink-200 to-transparent dark:from-purple-800 dark:via-pink-800 dark:to-transparent animate-pulse"></div>
        </div>
        
        {/* Line */}
        <div className="absolute bottom-0 left-0 w-full h-3/4 flex items-end">
          <svg className="w-full h-full">
            <path
              d="M 0 100 L 50 80 L 100 60 L 150 40 L 200 30 L 250 20 L 300 10 L 350 5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-purple-500 dark:text-purple-400"
            />
          </svg>
        </div>
      </div>
    </div>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return renderLineChart();
    }
  };

  if (variant === 'compact') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3 w-24"></div>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
      </div>

      {/* Chart */}
      <div className="mb-4">
        {renderChart()}
      </div>

      {/* Legend */}
      {showLegend && variant !== 'compact' && (
        <div className="flex items-center gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface SkeletonChartsProps {
  count?: number;
  chartTypes?: ('line' | 'bar' | 'pie' | 'area')[];
  variant?: 'compact' | 'default' | 'detailed';
  showLegends?: boolean;
  className?: string;
}

const SkeletonCharts: React.FC<SkeletonChartsProps> = ({
  count = 3,
  chartTypes = ['line', 'bar', 'pie'],
  variant = 'default',
  showLegends = true,
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonChart
          key={index}
          type={chartTypes[index % chartTypes.length]}
          variant={variant}
          showLegend={showLegends}
          height={variant === 'compact' ? 150 : 250}
        />
      ))}
    </div>
  );
};

export default SkeletonCharts;