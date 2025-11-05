import React from 'react';
import { Loader2, RefreshCw, Clock } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
  variant?: 'fullscreen' | 'inline' | 'compact' | 'skeleton';
  showSpinner?: boolean;
  showProgress?: boolean;
  progress?: number;
  estimatedTime?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
  subMessage,
  variant = 'inline',
  showSpinner = true,
  showProgress = false,
  progress,
  estimatedTime,
  className = ''
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'fullscreen':
        return 'min-h-screen flex items-center justify-center p-8';
      case 'compact':
        return 'p-4';
      case 'skeleton':
        return 'p-6';
      default:
        return 'p-8';
    }
  };

  const renderSpinner = () => (
    <div className="relative">
      {showSpinner ? (
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      ) : (
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      )}
    </div>
  );

  const renderProgress = () => {
    if (!showProgress) return null;
    
    return (
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
        <div 
          className="bg-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(Math.max(progress || 0, 0), 100)}%` }}
        ></div>
      </div>
    );
  };

  if (variant === 'skeleton') {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl ${getVariantStyles()} ${className}`}>
        <div className="space-y-4">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
          </div>
          
          {/* Content skeleton */}
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        {renderSpinner()}
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {message}
          </div>
          {subMessage && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {subMessage}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${getVariantStyles()} ${className}`}>
      <div className="text-center">
        {renderSpinner()}
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {message}
        </h3>
        {subMessage && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {subMessage}
          </p>
        )}
        {renderProgress()}
        {estimatedTime && (
          <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3" />
            <span>~{estimatedTime}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Shimmer loading component for cards
export const ShimmerCard: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    </div>
  </div>
);

// Progressive loading component
interface ProgressiveLoadingProps {
  stages: {
    label: string;
    description?: string;
    completed?: boolean;
  }[];
  currentStage: number;
  className?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  currentStage,
  className = ''
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              stage.completed || index < currentStage
                ? 'bg-green-500 border-green-500 text-white'
                : index === currentStage
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'border-gray-300 dark:border-gray-600'
            }`}>
              {stage.completed || index < currentStage ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : index === currentStage ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <div className={`text-sm font-medium ${
                stage.completed || index < currentStage
                  ? 'text-green-700 dark:text-green-300'
                  : index === currentStage
                  ? 'text-purple-700 dark:text-purple-300'
                  : 'text-gray-500 dark:text-gray-400'
              }`}>
                {stage.label}
              </div>
              {stage.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {stage.description}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;