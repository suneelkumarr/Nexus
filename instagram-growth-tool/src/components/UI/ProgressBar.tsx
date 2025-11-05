import React from 'react';
import { cn } from '@/lib/utils';
import LoadingSpinner from './LoadingSpinner';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  striped?: boolean;
  indeterminate?: boolean;
  rightLabel?: string;
  variant?: 'default' | 'dotted' | 'gradient' | 'segmented';
  segments?: number;
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4'
};

const colorClasses = {
  primary: 'bg-primary-500',
  secondary: 'bg-secondary-500', 
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500'
};

const progressBarVariants = {
  default: '',
  dotted: 'bg-gradient-to-r from-transparent via-white/30 to-transparent bg-repeat-x',
  gradient: 'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500',
  segmented: 'overflow-hidden'
};

export default function ProgressBar({
  value,
  max = 100,
  className,
  showLabel = false,
  label,
  color = 'primary',
  size = 'md',
  animated = false,
  striped = false,
  indeterminate = false,
  rightLabel,
  variant = 'default',
  segments
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const getProgressWidth = () => {
    if (indeterminate) return '30%';
    return `${percentage}%`;
  };

  const getProgressClasses = () => {
    const baseClasses = [
      'transition-all duration-500 ease-out',
      'transform-gpu will-change-transform'
    ];

    if (indeterminate) {
      baseClasses.push(
        'animate-pulse',
        variant === 'dotted' ? 'bg-gradient-to-r from-primary-500 via-secondary-500 to-primary-500' : colorClasses[color]
      );
      return cn(baseClasses);
    }

    baseClasses.push(colorClasses[color]);
    
    if (animated) {
      baseClasses.push('animate-pulse');
    }
    
    if (striped) {
      baseClasses.push('bg-gradient-to-r from-transparent via-white/20 to-transparent bg-repeat-x', 'bg-[length:20px_20px]');
    }
    
    if (variant === 'gradient') {
      baseClasses.push('bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500');
    }

    return cn(baseClasses);
  };

  const containerClasses = cn(
    'relative',
    'bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
    sizeClasses[size],
    className
  );

  if (indeterminate) {
    return (
      <div className="space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center">
            {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            {rightLabel && <span className="text-sm text-gray-500 dark:text-gray-400">{rightLabel}</span>}
          </div>
        )}
        <div className={containerClasses}>
          <div 
            className={cn(getProgressClasses(), 'absolute top-0 left-0 w-1/3 h-full')}
            style={{ 
              animation: 'indeterminate 2s infinite linear'
            }}
          />
        </div>
        <style jsx>{`
          @keyframes indeterminate {
            0% {
              transform: translateX(-100%);
            }
            100% {
              transform: translateX(400%);
            }
          }
        `}</style>
      </div>
    );
  }

  if (segments && segments > 0) {
    const segmentWidth = 100 / segments;
    const filledSegments = Math.floor((percentage / 100) * segments);
    
    return (
      <div className="space-y-2">
        {(showLabel || label) && (
          <div className="flex justify-between items-center">
            {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
            {rightLabel && <span className="text-sm text-gray-500 dark:text-gray-400">{rightLabel}</span>}
          </div>
        )}
        <div className={containerClasses}>
          <div className="flex h-full">
            {Array.from({ length: segments }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'border-r border-gray-200 dark:border-gray-600 last:border-r-0',
                  index < filledSegments && (colorClasses[color] || 'bg-primary-500'),
                  'transition-colors duration-300'
                )}
                style={{ width: `${segmentWidth}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {(showLabel || label) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
          {showLabel && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Math.round(percentage)}% ({value}/{max})
            </span>
          )}
          {rightLabel && <span className="text-sm text-gray-500 dark:text-gray-400">{rightLabel}</span>}
        </div>
      )}
      <div className={containerClasses}>
        <div 
          className={cn(getProgressClasses(), 'h-full')}
          style={{ width: getProgressWidth() }}
        />
      </div>
    </div>
  );
}

// Specialized progress bar components
export const CircularProgress: React.FC<{
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  color = '#3B82F6',
  className,
  showLabel = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))'
          }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-semibold text-gray-900 dark:text-white">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export const MultiStepProgress: React.FC<{
  steps: { label: string; status: 'completed' | 'current' | 'pending' | 'error' }[];
  className?: string;
}> = ({ steps, className }) => {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const statusColors = {
          completed: 'bg-green-500 border-green-500 text-white',
          current: 'bg-primary-500 border-primary-500 text-white',
          pending: 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500',
          error: 'bg-red-500 border-red-500 text-white'
        };

        return (
          <React.Fragment key={index}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold transition-all duration-300',
                  statusColors[step.status]
                )}
              >
                {step.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1 text-center">
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 transition-all duration-300',
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};