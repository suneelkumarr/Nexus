import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Sparkles, Clock } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  action?: () => void;
  optional?: boolean;
  estimatedTime?: number; // in seconds
}

interface TooltipTourProps {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  onDismiss: () => void;
  isVisible: boolean;
  currentStepIndex?: number;
  enableDismiss?: boolean;
  enableSkip?: boolean;
}

export default function TooltipTour({
  steps,
  onComplete,
  onSkip,
  onDismiss,
  isVisible,
  currentStepIndex: initialStepIndex = 0,
  enableDismiss = true,
  enableSkip = true
}: TooltipTourProps) {
  const [currentIndex, setCurrentIndex] = useState(initialStepIndex);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');

  const currentStep = steps[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === steps.length - 1;
  const progress = ((currentIndex + 1) / steps.length) * 100;
  
  // Calculate time estimates
  const totalEstimatedTime = steps.reduce((total, step) => total + (step.estimatedTime || 30), 0);
  const remainingTime = steps.slice(currentIndex).reduce((total, step) => total + (step.estimatedTime || 30), 0);

  useEffect(() => {
    if (!isVisible || !currentStep) return;

    const positionTooltip = () => {
      const target = document.querySelector(currentStep.targetSelector);
      if (!target) return;

      const targetRect = target.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 200;
      const spacing = 16;
      
      let top = 0;
      let left = 0;
      let position: 'top' | 'bottom' | 'left' | 'right' = 'top';

      // Auto-position logic
      const spaceAbove = targetRect.top;
      const spaceBelow = window.innerHeight - targetRect.bottom;
      const spaceLeft = targetRect.left;
      const spaceRight = window.innerWidth - targetRect.right;

      if (currentStep.position === 'auto' || !currentStep.position) {
        // Determine best position based on available space
        if (spaceBelow >= tooltipHeight + spacing) {
          position = 'bottom';
        } else if (spaceAbove >= tooltipHeight + spacing) {
          position = 'top';
        } else if (spaceRight >= tooltipWidth + spacing) {
          position = 'right';
        } else {
          position = 'left';
        }
      } else {
        position = currentStep.position;
      }

      // Calculate position based on determined placement
      switch (position) {
        case 'top':
          top = targetRect.top - tooltipHeight - spacing;
          left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
          break;
        case 'bottom':
          top = targetRect.bottom + spacing;
          left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
          left = targetRect.left - tooltipWidth - spacing;
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
          left = targetRect.right + spacing;
          break;
      }

      // Keep tooltip within viewport
      top = Math.max(spacing, Math.min(top, window.innerHeight - tooltipHeight - spacing));
      left = Math.max(spacing, Math.min(left, window.innerWidth - tooltipWidth - spacing));

      setTooltipPosition({ top, left });
      setArrowPosition(position);

      // Highlight target element
      target.classList.add('tour-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Execute optional action
      if (currentStep.action) {
        currentStep.action();
      }
    };

    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);

    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
      
      // Remove highlight from all elements
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });
    };
  }, [currentIndex, currentStep, isVisible]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleDismiss = () => {
    onDismiss();
  };

  if (!isVisible || !currentStep) return null;

  const getArrowStyle = () => {
    const baseClasses = 'absolute w-3 h-3 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 transform rotate-45';
    
    switch (arrowPosition) {
      case 'top':
        return `${baseClasses} bottom-[-6px] left-1/2 -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} top-[-6px] left-1/2 -translate-x-1/2 rotate-[225deg]`;
      case 'left':
        return `${baseClasses} right-[-6px] top-1/2 -translate-y-1/2 rotate-[135deg]`;
      case 'right':
        return `${baseClasses} left-[-6px] top-1/2 -translate-y-1/2 rotate-[-45deg]`;
      default:
        return `${baseClasses} bottom-[-6px] left-1/2 -translate-x-1/2`;
    }
  };

  return (
    <>
      {/* Minimal backdrop - barely visible */}
      <div className="fixed inset-0 bg-black/10 pointer-events-none z-40" />

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 p-6 transition-all duration-300"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
        }}
      >
        {/* Arrow */}
        <div className={getArrowStyle()} />

        {/* Close button */}
        {enableDismiss && (
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Dismiss tour"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {currentStep.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Step {currentIndex + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% • ~{Math.ceil(remainingTime / 60)} min left</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-gradient-to-r from-purple-600 to-pink-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            {currentStep.estimatedTime && (
              <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                <Clock className="w-3 h-3" />
                <span>This step: ~{currentStep.estimatedTime}s • Total tour: ~{Math.ceil(totalEstimatedTime / 60)} min</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            {enableSkip && (
              <button
                onClick={handleSkip}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip tour
              </button>
            )}
            
            <div className="flex-1" />

            <button
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous step"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md text-sm font-medium hover:shadow-lg transition-all"
            >
              {isLastStep ? (
                <>
                  <Check className="w-4 h-4" />
                  Finish
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Add tour highlight styles */}
      <style>{`
        .tour-highlight {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.3), 0 0 0 2000px rgba(0, 0, 0, 0.05);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        .tour-highlight::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid rgb(168, 85, 247);
          border-radius: 10px;
          pointer-events: none;
          animation: tour-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes tour-pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}
