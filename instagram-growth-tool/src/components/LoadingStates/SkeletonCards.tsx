import React from 'react';

interface SkeletonCardProps {
  title?: string;
  value?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  showChange?: boolean;
  compact?: boolean;
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  icon: Icon,
  className = '',
  showChange = true,
  compact = false
}) => {
  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            {Icon && (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            )}
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24 mb-2"></div>
          {showChange && (
            <div className="flex items-center gap-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface SkeletonCardsProps {
  count?: number;
  variant?: 'compact' | 'default' | 'detailed';
  showTrends?: boolean;
  columns?: number;
  className?: string;
}

const SkeletonCards: React.FC<SkeletonCardsProps> = ({
  count = 4,
  variant = 'default',
  showTrends = true,
  columns = 4,
  className = ''
}) => {
  const getGridClasses = () => {
    if (variant === 'compact') {
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4';
    }
    return `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(columns, 4)} gap-6`;
  };

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard
          key={index}
          variant={variant}
          showChange={showTrends}
          compact={variant === 'compact'}
        />
      ))}
    </div>
  );
};

export default SkeletonCards;