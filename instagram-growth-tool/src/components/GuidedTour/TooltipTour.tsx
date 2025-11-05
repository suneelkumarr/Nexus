import { useState, useEffect, useRef } from 'react';
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
  const [targetFound, setTargetFound] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const positionTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;

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
      // Clear any existing timeout
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }

      // Remove existing highlights first
      document.querySelectorAll('.tour-highlight').forEach(el => {
        el.classList.remove('tour-highlight');
      });

      const findAndPositionTarget = () => {
        try {
          // Multiple selector attempts for better compatibility
          const selectors = [
            currentStep.targetSelector,
            `[data-tour="${currentStep.id}"]`,
            `#${currentStep.id}`,
            `.${currentStep.id}`
          ];

          let target = null;
          for (const selector of selectors) {
            if (selector) {
              target = document.querySelector(selector);
              if (target && target.offsetParent !== null) {
                break;
              }
            }
          }

          if (!target) {
            console.warn(`Tour target not found: ${currentStep.targetSelector}`);
            setTargetFound(false);
            
            // Try again after a delay if we haven't exceeded max retries
            if (retryCount < maxRetries) {
              positionTimeoutRef.current = setTimeout(() => {
                setRetryCount(prev => prev + 1);
                findAndPositionTarget();
              }, 500);
            }
            return;
          }

          setTargetFound(true);
          setRetryCount(0); // Reset retry count on success

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
              top = Math.max(spacing, targetRect.top - tooltipHeight - spacing);
              left = Math.max(spacing, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, window.innerWidth - tooltipWidth - spacing));
              break;
            case 'bottom':
              top = Math.max(spacing, targetRect.bottom + spacing);
              left = Math.max(spacing, Math.min(targetRect.left + (targetRect.width - tooltipWidth) / 2, window.innerWidth - tooltipWidth - spacing));
              break;
            case 'left':
              top = Math.max(spacing, Math.min(targetRect.top + (targetRect.height - tooltipHeight) / 2, window.innerHeight - tooltipHeight - spacing));
              left = Math.max(spacing, targetRect.left - tooltipWidth - spacing);
              break;
            case 'right':
              top = Math.max(spacing, Math.min(targetRect.top + (targetRect.height - tooltipHeight) / 2, window.innerHeight - tooltipHeight - spacing));
              left = Math.max(spacing, targetRect.right + spacing);
              break;
          }

          setTooltipPosition({ top, left });
          setArrowPosition(position);

          // Highlight target element with safe class manipulation
          try {
            target.classList.add('tour-highlight');
            // Scroll into view with safe fallback
            if (target.scrollIntoView) {
              target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          } catch (err) {
            console.warn('Failed to highlight target element:', err);
          }

          // Execute optional action with error handling
          if (currentStep.action) {
            try {
              currentStep.action();
            } catch (err) {
              console.warn('Failed to execute tour step action:', err);
            }
          }
        } catch (err) {
          console.error('Error in tour positioning:', err);
          setTargetFound(false);
        }
      };

      // Initial attempt
      findAndPositionTarget();
    };

    positionTooltip();
    
    const handleResize = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(positionTooltip, 100);
    };
    
    const handleScroll = () => {
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      positionTimeoutRef.current = setTimeout(positionTooltip, 50);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      
      if (positionTimeoutRef.current) {
        clearTimeout(positionTimeoutRef.current);
      }
      
      // Remove highlight from all elements safely
      try {
        document.querySelectorAll('.tour-highlight').forEach(el => {
          el.classList.remove('tour-highlight');
        });
      } catch (err) {
        console.warn('Error cleaning up tour highlights:', err);
      }
    };
  }, [currentIndex, currentStep, isVisible, retryCount]);

  const handleNext = () => {
    // Reset target found state for next step
    setTargetFound(false);
    setRetryCount(0);
    
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    // Reset target found state for previous step
    setTargetFound(false);
    setRetryCount(0);
    
    if (!isFirstStep) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSkip = () => {
    // Clear timeouts before skipping
    if (positionTimeoutRef.current) {
      clearTimeout(positionTimeoutRef.current);
    }
    onSkip();
  };

  const handleDismiss = () => {
    // Clear timeouts before dismissing
    if (positionTimeoutRef.current) {
      clearTimeout(positionTimeoutRef.current);
    }
    onDismiss();
  };

  if (!isVisible || !currentStep) return null;

  // Fallback position when target is not found
  const fallbackPosition = {
    top: Math.max(80, window.innerHeight * 0.2),
    left: Math.max(16, window.innerWidth * 0.1)
  };

  const displayPosition = targetFound ? tooltipPosition : fallbackPosition;

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
      {/* Non-intrusive backdrop - allows sidebar interactions */}
      <div className="fixed inset-0 pointer-events-none z-40" />

      {/* Tooltip with improved z-index to not conflict with sidebar */}
      <div
        className="fixed z-[60] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 w-80 p-6 transition-all duration-300"
        style={{
          top: `${displayPosition.top}px`,
          left: `${displayPosition.left}px`,
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
          {/* Status indicator when target not found */}
          {!targetFound && retryCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Finding element... (attempt {retryCount + 1}/{maxRetries + 1})</span>
              </div>
            </div>
          )}
          
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
              {!targetFound && retryCount >= maxRetries && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Element not found. You can still continue with the tour.
                </p>
              )}
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
          z-index: 45 !important;
          box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.4), 0 0 20px rgba(168, 85, 247, 0.2);
          border-radius: 8px;
          transition: all 0.3s ease;
          /* Ensure sidebar elements remain functional */
          pointer-events: auto !important;
        }
        
        .tour-highlight::after {
          content: '';
          position: absolute;
          inset: -3px;
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
            opacity: 0.7;
          }
        }
        
        /* Ensure sidebar elements maintain their interactions */
        [data-tour] {
          pointer-events: auto !important;
        }
        
        /* Allow scrolling during tour */
        .tour-highlight {
          overflow: visible !important;
        }
      `}</style>
    </>
  );
}
