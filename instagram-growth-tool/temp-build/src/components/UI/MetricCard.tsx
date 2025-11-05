import React from 'react';
import { cn } from '@/lib/utils';
import IconWrapper, { StatusIcon, MetricIcon } from './IconWrapper';
import LoadingSpinner from './LoadingSpinner';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
    period?: string;
  };
  icon?: React.ComponentType<any>;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  loading?: boolean;
  error?: string;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'elevated' | 'minimal' | 'gradient';
  showProgress?: boolean;
  progress?: number;
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
}

const sizeClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

const colorMap = {
  primary: {
    bg: 'bg-primary-50 dark:bg-primary-900/20',
    border: 'border-primary-200 dark:border-primary-700',
    icon: 'text-primary-600 dark:text-primary-400',
    text: 'text-primary-700 dark:text-primary-300',
    accent: 'text-primary-600 dark:text-primary-400'
  },
  secondary: {
    bg: 'bg-secondary-50 dark:bg-secondary-900/20',
    border: 'border-secondary-200 dark:border-secondary-700',
    icon: 'text-secondary-600 dark:text-secondary-400',
    text: 'text-secondary-700 dark:text-secondary-300',
    accent: 'text-secondary-600 dark:text-secondary-400'
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-700',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-700 dark:text-green-300',
    accent: 'text-green-600 dark:text-green-400'
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-700',
    icon: 'text-yellow-600 dark:text-yellow-400',
    text: 'text-yellow-700 dark:text-yellow-300',
    accent: 'text-yellow-600 dark:text-yellow-400'
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-700',
    icon: 'text-red-600 dark:text-red-400',
    text: 'text-red-700 dark:text-red-300',
    accent: 'text-red-600 dark:text-red-400'
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-700',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-700 dark:text-blue-300',
    accent: 'text-blue-600 dark:text-blue-400'
  },
  neutral: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-600 dark:text-gray-400',
    text: 'text-gray-700 dark:text-gray-300',
    accent: 'text-gray-600 dark:text-gray-400'
  }
};

export default function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'neutral',
  loading = false,
  error,
  onClick,
  className,
  size = 'md',
  variant = 'default',
  showProgress = false,
  progress,
  trend,
  subtitle
}: MetricCardProps) {
  const colorClasses = colorMap[color];
  const sizeClass = sizeClasses[size];

  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendIcon = () => {
    if (!trend || trend === 'neutral') return null;
    const TrendIcon = trend === 'up' ? '↗' : '↘';
    return (
      <span className={cn(
        'text-sm font-medium',
        trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
      )}>
        {TrendIcon}
      </span>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner size="lg" text="Loading metric..." textPosition="bottom" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-32 text-red-600 dark:text-red-400">
          <div className="text-center">
            <StatusIcon status="error" size="lg" />
            <p className="mt-2 text-sm">{error}</p>
          </div>
        </div>
      );
    }

    return (
      <div className={sizeClass}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={cn(
              'p-2 rounded-lg',
              colorClasses.bg
            )}>
              <Icon className={cn('w-5 h-5', colorClasses.icon)} />
            </div>
          )}
        </div>

        {/* Value */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </span>
            {getTrendIcon()}
          </div>
        </div>

        {/* Change indicator */}
        {change && (
          <div className="flex items-center gap-2 mb-4">
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              change.type === 'increase' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
              change.type === 'decrease' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
            )}>
              {change.type === 'increase' ? '+' : change.type === 'decrease' ? '-' : ''}
              {Math.abs(change.value)}%
            </span>
            {change.period && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {change.period}
              </span>
            )}
          </div>
        )}

        {/* Progress bar */}
        {showProgress && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-500 ease-out',
                  colorClasses.icon.includes('primary') ? 'bg-primary-500' :
                  colorClasses.icon.includes('secondary') ? 'bg-secondary-500' :
                  colorClasses.icon.includes('green') ? 'bg-green-500' :
                  colorClasses.icon.includes('yellow') ? 'bg-yellow-500' :
                  colorClasses.icon.includes('red') ? 'bg-red-500' :
                  colorClasses.icon.includes('blue') ? 'bg-blue-500' :
                  'bg-gray-500'
                )}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'elevated':
        return 'shadow-lg hover:shadow-xl border border-gray-200 dark:border-gray-700';
      case 'minimal':
        return 'border-0 shadow-none bg-transparent';
      case 'gradient':
        return `bg-gradient-to-br ${colorClasses.bg} ${colorClasses.border} border`;
      default:
        return `${colorClasses.bg} ${colorClasses.border} border shadow-sm`;
    }
  };

  return (
    <div
      className={cn(
        'rounded-xl transition-all duration-300 ease-out',
        'transform hover:scale-[1.02] hover:-translate-y-1',
        'hover:shadow-lg',
        onClick && 'cursor-pointer',
        getVariantClasses(),
        className
      )}
      onClick={onClick}
    >
      {renderContent()}
    </div>
  );
}

// Specialized metric card variants
export const StatCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="default" />
);

export const ElevationCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="elevated" />
);

export const MinimalCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="minimal" />
);

export const GradientCard: React.FC<Omit<MetricCardProps, 'variant'>> = (props) => (
  <MetricCard {...props} variant="gradient" />
);

// Grid layout for metric cards
export const MetricCardGrid: React.FC<{
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}> = ({ children, columns = 3, className }) => {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={cn('grid gap-6', gridClasses[columns], className)}>
      {children}
    </div>
  );
};

// Metric card collection for common metrics
export const FollowerMetricCard: React.FC<{
  followers: number;
  growth: number;
  loading?: boolean;
}> = ({ followers, growth, loading = false }) => (
  <MetricCard
    title="Total Followers"
    value={followers}
    change={{
      value: growth,
      type: growth >= 0 ? 'increase' : 'decrease',
      period: "this month"
    }}
    icon={({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
      </svg>
    )}
    color="primary"
    loading={loading}
    trend={growth >= 0 ? 'up' : 'down'}
    subtitle="Total audience"
  />
);

export const EngagementMetricCard: React.FC<{
  engagement: number;
  change: number;
  loading?: boolean;
}> = ({ engagement, change, loading = false }) => (
  <MetricCard
    title="Engagement Rate"
    value={`${engagement}%`}
    change={{
      value: change,
      type: change >= 0 ? 'increase' : 'decrease',
      period: "this month"
    }}
    icon={Heart}
    color="success"
    loading={loading}
    trend={change >= 0 ? 'up' : 'down'}
    subtitle="Average engagement"
  />
);

export const ReachMetricCard: React.FC<{
  reach: number;
  impressions: number;
  loading?: boolean;
}> = ({ reach, impressions, loading = false }) => (
  <MetricCard
    title="Total Reach"
    value={reach}
    change={{
      value: Math.round(((reach - impressions) / impressions) * 100),
      type: 'increase',
      period: "this month"
    }}
    icon={Eye}
    color="info"
    loading={loading}
    trend="up"
    subtitle={`${impressions} impressions`}
  />
);