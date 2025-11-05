import { useState, useEffect } from 'react';
import { 
  X, ArrowRight, ArrowLeft, SkipForward, Play, 
  TrendingUp, BarChart3, Calendar, Search, Sparkles, 
  UserCheck, Activity, User, Users, CheckCircle
} from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

const tourSteps: TourStep[] = [
  {
    id: 'sidebar',
    title: 'Navigation Sidebar',
    description: 'This is your main navigation. Click any tab to access different features of GrowthHub.',
    icon: Activity,
    position: 'right',
    action: 'highlight'
  },
  {
    id: 'overview',
    title: 'Overview Dashboard',
    description: 'Get a quick summary of your Instagram performance with key metrics and trends.',
    icon: TrendingUp,
    targetSelector: '[data-tour="overview"]',
    position: 'bottom'
  },
  {
    id: 'accounts',
    title: 'Account Management',
    description: 'Manage all your Instagram accounts in one place. Add, edit, or remove accounts here.',
    icon: Users,
    targetSelector: '[data-tour="accounts"]',
    position: 'right'
  },
  {
    id: 'advanced',
    title: 'Advanced Analytics',
    description: 'Deep dive into detailed analytics with custom filters, date ranges, and export options.',
    icon: BarChart3,
    targetSelector: '[data-tour="advanced"]',
    position: 'right'
  },
  {
    id: 'content',
    title: 'Content Management',
    description: 'Plan, schedule, and manage your Instagram content with our powerful tools.',
    icon: Calendar,
    targetSelector: '[data-tour="content"]',
    position: 'right'
  },
  {
    id: 'research',
    title: 'Market Research',
    description: 'Analyze competitors, discover trending content, and find growth opportunities.',
    icon: Search,
    targetSelector: '[data-tour="research"]',
    position: 'right'
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations, content suggestions, and performance predictions.',
    icon: Sparkles,
    targetSelector: '[data-tour="ai-insights"]',
    position: 'right'
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work with your team, share insights, and manage permissions across your organization.',
    icon: UserCheck,
    targetSelector: '[data-tour="collaboration"]',
    position: 'right'
  },
  {
    id: 'profile',
    title: 'Profile & Settings',
    description: 'Manage your profile, subscription, and application preferences.',
    icon: User,
    targetSelector: '[data-tour="profile"]',
    position: 'right'
  },
  {
    id: 'complete',
    title: 'You\'re All Set!',
    description: 'Congratulations! You\'re now ready to grow your Instagram presence with GrowthHub.',
    icon: CheckCircle,
    position: 'center'
  }
];

interface GuidedTourProps {
  onComplete: () => void;
  onSkip: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function GuidedTour({ onComplete, onSkip, activeTab, onTabChange }: GuidedTourProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  const currentStep = tourSteps[currentStepIndex];
  const isLastStep = currentStepIndex === tourSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    if (currentStep.targetSelector) {
      // Highlight the target element
      const element = document.querySelector(currentStep.targetSelector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Auto-navigate to relevant tabs
    if (currentStep.targetSelector && activeTab !== currentStep.id) {
      onTabChange(currentStep.id);
    }
  }, [currentStep, activeTab, onTabChange]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  const Icon = currentStep.icon;

  if (!isVisible) return null;

  const getTooltipPosition = () => {
    if (!currentStep.targetSelector) {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
    }

    const position = currentStep.position || 'right';
    const baseClasses = 'fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-sm';

    switch (position) {
      case 'top':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} left-4 top-1/2 transform -translate-y-1/2`;
      case 'right':
      default:
        return `${baseClasses} right-4 top-1/2 transform -translate-y-1/2`;
    }
  };

  const getArrowPosition = () => {
    if (!currentStep.targetSelector) return '';

    const position = currentStep.position || 'right';
    const baseClasses = 'absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45';

    switch (position) {
      case 'top':
        return `${baseClasses} -top-1.5 left-1/2 transform -translate-x-1/2 rotate-45`;
      case 'bottom':
        return `${baseClasses} -bottom-1.5 left-1/2 transform -translate-x-1/2 rotate-45`;
      case 'left':
        return `${baseClasses} -left-1.5 top-1/2 transform -translate-y-1/2 rotate-45`;
      case 'right':
      default:
        return `${baseClasses} -right-1.5 top-1/2 transform -translate-y-1/2 rotate-45`;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40" />
      
      {/* Highlight overlay for target elements */}
      {highlightedElement && currentStep.targetSelector && (
        <div className="fixed inset-0 z-30 pointer-events-none">
          <div 
            className="absolute bg-purple-500/20 border-2 border-purple-500 rounded-lg animate-pulse"
            style={{
              top: highlightedElement.offsetTop - 8,
              left: highlightedElement.offsetLeft - 8,
              width: highlightedElement.offsetWidth + 16,
              height: highlightedElement.offsetHeight + 16,
            }}
          />
        </div>
      )}

      {/* Tooltip */}
      <div className={getTooltipPosition()}>
        {currentStep.targetSelector && (
          <div className={getArrowPosition()} />
        )}
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {currentStep.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {currentStep.description}
            </p>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / tourSteps.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {currentStepIndex + 1} / {tourSteps.length}
              </span>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Skip Tour
              </button>
              
              <div className="flex-1" />
              
              <button
                onClick={handlePrevious}
                disabled={isFirstStep}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {isLastStep ? (
                  'Finish Tour'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          <button
            onClick={handleComplete}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Floating tour controls */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Guided Tour</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            
            <button
              onClick={handleSkip}
              className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <SkipForward className="w-3 h-3" />
              Skip
            </button>
          </div>
        </div>
      </div>
    </>
  );
}