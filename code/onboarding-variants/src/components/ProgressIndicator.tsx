import React from 'react';
import { cn } from '../lib/utils';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  variant?: 'dots' | 'bar' | 'numbers';
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
  variant = 'dots',
  className
}) => {
  const progress = (currentStep / totalSteps) * 100;

  if (variant === 'bar') {
    return (
      <div className={cn("w-full bg-gray-200 rounded-full h-2", className)}>
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  }

  if (variant === 'numbers') {
    return (
      <div className={cn("flex items-center space-x-4", className)}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <div
            key={i}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              i < currentStep
                ? "bg-blue-600 text-white"
                : i === currentStep - 1
                ? "bg-blue-100 text-blue-600 border-2 border-blue-600"
                : "bg-gray-200 text-gray-500"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    );
  }

  // Default dots variant
  return (
    <div className={cn("flex space-x-2", className)}>
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            i < currentStep
              ? "bg-blue-600"
              : "bg-gray-300"
          )}
        />
      ))}
    </div>
  );
};