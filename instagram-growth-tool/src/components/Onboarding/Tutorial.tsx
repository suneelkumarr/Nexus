import { useState, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, CheckCircle, 
  ArrowRight, ArrowLeft, X, Eye, Target, Sparkles,
  BarChart3, Calendar, Search, UserCheck, Settings
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'highlight' | 'click' | 'scroll' | 'explain';
  category: 'interface' | 'features' | 'analytics' | 'tools';
  icon: any;
  tips?: string[];
  commonMistakes?: string[];
  bestPractices?: string[];
}

interface TutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  userType: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Your Tutorial',
    description: 'Let\'s explore GrowthHub together! This interactive tutorial will show you how to make the most of your Instagram analytics platform.',
    position: 'center',
    category: 'interface',
    icon: Play,
    tips: [
      'Take your time - you can pause and resume anytime',
      'Click on highlighted elements to interact with them',
      'Use the navigation buttons to move between steps'
    ]
  },
  {
    id: 'sidebar-overview',
    title: 'Main Navigation Sidebar',
    description: 'This is your command center. All features are organized in easy-to-find tabs. Let\'s start with the Overview tab.',
    targetSelector: '[data-tour="overview"]',
    position: 'right',
    action: 'highlight',
    category: 'interface',
    icon: Target,
    tips: [
      'Overview gives you the big picture of your Instagram performance',
      'Each tab is color-coded for easy recognition',
      'You can collapse the sidebar on mobile devices'
    ],
    bestPractices: [
      'Check Overview first thing each morning',
      'Use the sidebar to quickly switch between features',
      'Notice the active tab is highlighted'
    ]
  },
  {
    id: 'overview-dashboard',
    title: 'Overview Dashboard',
    description: 'Your Instagram performance at a glance. This dashboard shows key metrics like follower growth, engagement rates, and recent performance.',
    targetSelector: '[data-tour="overview"]',
    position: 'bottom',
    category: 'interface',
    icon: Eye,
    tips: [
      'Green numbers mean growth, red means decline',
      'Click on any metric to drill down for details',
      'The trend arrows show your growth direction'
    ],
    bestPractices: [
      'Monitor follower growth trends weekly',
      'Pay attention to engagement rate changes',
      'Look for patterns in your posting times'
    ],
    commonMistakes: [
      'Don\'t panic over single-day fluctuations',
      'Focus on trends rather than daily numbers',
      'Remember to consider your content strategy'
    ]
  },
  {
    id: 'account-management',
    title: 'Account Management',
    description: 'Manage all your Instagram accounts in one place. Add new accounts, check their status, and configure settings.',
    targetSelector: '[data-tour="accounts"]',
    position: 'right',
    category: 'interface',
    icon: Settings,
    tips: [
      'You can manage multiple Instagram accounts here',
      'Each account shows its connection status',
      'Add accounts for your clients or different brands'
    ],
    bestPractices: [
      'Regularly verify account connections',
      'Keep account names organized with clear labeling',
      'Monitor connection health indicators'
    ]
  },
  {
    id: 'advanced-analytics',
    title: 'Advanced Analytics',
    description: 'Dive deep into your data with powerful filtering, custom date ranges, and detailed breakdowns.',
    targetSelector: '[data-tour="advanced"]',
    position: 'right',
    category: 'analytics',
    icon: BarChart3,
    tips: [
      'Use date filters to compare different time periods',
      'Filter by content type to see what works best',
      'Export data for external analysis'
    ],
    bestPractices: [
      'Set up regular reporting schedules',
      'Use comparison tools to track improvement',
      'Combine multiple filters for deeper insights'
    ],
    commonMistakes: [
      'Don\'t ignore the context of your data',
      'Avoid drawing conclusions from small sample sizes',
      'Remember to consider external factors'
    ]
  },
  {
    id: 'ai-insights',
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations powered by machine learning. Discover growth opportunities and optimize your content strategy.',
    targetSelector: '[data-tour="ai-insights"]',
    position: 'right',
    category: 'features',
    icon: Sparkles,
    tips: [
      'AI insights are updated regularly with new data',
      'Each recommendation includes reasoning',
      'Track the success of implemented suggestions'
    ],
    bestPractices: [
      'Review AI insights weekly',
      'Test one recommendation at a time',
      'Document what works for your audience'
    ],
    commonMistakes: [
      'Don\'t implement too many changes at once',
      'Avoid following AI suggestions blindly',
      'Remember to maintain your brand voice'
    ]
  },
  {
    id: 'content-management',
    title: 'Content Planning',
    description: 'Plan and schedule your Instagram content. Organize your posting calendar and track content performance.',
    targetSelector: '[data-tour="content"]',
    position: 'right',
    category: 'tools',
    icon: Calendar,
    tips: [
      'Plan your content themes in advance',
      'Use the calendar to visualize your posting schedule',
      'Track which content types perform best'
    ],
    bestPractices: [
      'Maintain consistent posting schedules',
      'Mix content types for variety',
      'Plan seasonal content in advance'
    ],
    commonMistakes: [
      'Don\'t over-commit to posting frequency',
      'Avoid posting similar content consecutively',
      'Don\'t forget to engage with comments'
    ]
  },
  {
    id: 'market-research',
    title: 'Market Research',
    description: 'Analyze competitors, discover trending content, and find growth opportunities in your niche.',
    targetSelector: '[data-tour="research"]',
    position: 'right',
    category: 'tools',
    icon: Search,
    tips: [
      'Study successful competitors for inspiration',
      'Monitor trending hashtags in your industry',
      'Use insights to inform your content strategy'
    ],
    bestPractices: [
      'Track 3-5 key competitors regularly',
      'Focus on engagement, not just follower count',
      'Look for content gaps you can fill'
    ],
    commonMistakes: [
      'Don\'t copy competitors directly',
      'Avoid comparing yourself to huge accounts',
      'Don\'t ignore small competitors'
    ]
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Work with your team, share insights, and manage permissions. Perfect for agencies and businesses.',
    targetSelector: '[data-tour="collaboration"]',
    position: 'right',
    category: 'features',
    icon: UserCheck,
    tips: [
      'Invite team members to collaborate',
      'Set appropriate permission levels',
      'Share reports and insights easily'
    ],
    bestPractices: [
      'Use collaborative features for client reporting',
      'Regular team check-ins on performance',
      'Maintain organized project structures'
    ]
  },
  {
    id: 'profile-settings',
    title: 'Profile & Settings',
    description: 'Customize your GrowthHub experience, manage your subscription, and update profile information.',
    targetSelector: '[data-tour="profile"]',
    position: 'right',
    category: 'interface',
    icon: Settings,
    tips: [
      'Customize your dashboard layout',
      'Manage subscription and billing here',
      'Update notification preferences'
    ],
    bestPractices: [
      'Set up email notifications for important updates',
      'Regularly review and update your profile',
      'Keep billing information current'
    ]
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    description: 'Congratulations! You now know the basics of GrowthHub. Remember, you can always access help and restart this tutorial from the help menu.',
    position: 'center',
    category: 'interface',
    icon: CheckCircle,
    tips: [
      'You can restart this tutorial anytime from Help > Start Guided Tour',
      'Explore each feature at your own pace',
      'Start with your main goals and build from there'
    ]
  }
];

export default function Tutorial({ 
  onComplete, 
  onSkip, 
  currentStep, 
  totalSteps, 
  onStepChange,
  userType,
  goals
}: TutorialProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());

  const tutorialStep = tutorialSteps[currentStep - 1];
  const isLastStep = currentStep === totalSteps;
  const isFirstStep = currentStep === 1;

  const Icon = tutorialStep.icon;
  const progressPercentage = (currentStep / totalSteps) * 100;

  useEffect(() => {
    setStepStartTime(Date.now());
    
    // Auto-scroll to highlighted element
    if (tutorialStep.targetSelector) {
      const element = document.querySelector(tutorialStep.targetSelector) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
    }

    // Auto-advance if playing
    if (isPlaying) {
      const timer = setTimeout(() => {
        handleNext();
      }, 8000); // Auto-advance after 8 seconds
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying, tutorialStep.targetSelector]);

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      onStepChange(currentStep + 1);
      setShowTips(false);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      onStepChange(currentStep - 1);
      setShowTips(false);
    }
  };

  const handleComplete = () => {
    const timeSpent = Date.now() - stepStartTime;
    onComplete();
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getTooltipPosition = () => {
    if (!tutorialStep.targetSelector) {
      return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
    }

    const position = tutorialStep.position || 'right';
    const baseClasses = 'fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md';

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
    if (!tutorialStep.targetSelector) return '';

    const position = tutorialStep.position || 'right';
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
      {highlightedElement && tutorialStep.targetSelector && (
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

      {/* Tutorial Tooltip */}
      <div className={getTooltipPosition()}>
        {tutorialStep.targetSelector && (
          <div className={getArrowPosition()} />
        )}
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
              <Icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Step Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {tutorialStep.title}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full font-medium">
                    {tutorialStep.category}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Step {currentStep} of {totalSteps}
                  </span>
                </div>
              </div>
              <button
                onClick={onSkip}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
              {tutorialStep.description}
            </p>

            {/* Tips Section */}
            {tutorialStep.tips && tutorialStep.tips.length > 0 && (
              <div className="mb-4">
                <button
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Pro Tips ({tutorialStep.tips.length})
                  <ArrowRight className={`w-3 h-3 transition-transform ${showTips ? 'rotate-90' : ''}`} />
                </button>
                
                {showTips && (
                  <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <ul className="space-y-2">
                      {tutorialStep.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-purple-800 dark:text-purple-200 flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Progress indicator */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                Skip Tutorial
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
                onClick={togglePlayPause}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Auto
                  </>
                )}
              </button>
              
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                {isLastStep ? (
                  'Complete'
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Tutorial Controls */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Tutorial</span>
            </div>
            
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700" />
            
            <button
              onClick={onSkip}
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