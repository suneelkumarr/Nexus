import { useState, useEffect } from 'react';
import { Crown, TrendingUp, Users, Clock, BarChart3, ChevronDown, X } from 'lucide-react';
import FeatureComparisonMatrix from './FeatureComparisonMatrix';
import ValueProposition from './ValueProposition';
import UpgradeCTA from './UpgradeCTA';
import SocialProof from './SocialProof';
import LimitationMessage from './LimitationMessage';

interface ConversionCenterProps {
  userContext: {
    plan: string;
    usage: number;
    limit: number;
    engagement: number;
    followers: number;
    timeSpent: string;
    currentFeature?: string;
    milestone?: string;
  };
  onUpgrade: (planType: 'pro' | 'enterprise') => void;
  onClose: () => void;
  initialView?: 'comparison' | 'value' | 'social' | 'testimonial';
}

export default function ConversionCenter({ 
  userContext, 
  onUpgrade, 
  onClose, 
  initialView = 'comparison' 
}: ConversionCenterProps) {
  const [currentView, setCurrentView] = useState(initialView);
  const [showUpgradeCTA, setShowUpgradeCTA] = useState(false);
  const [showLimitationMessage, setShowLimitationMessage] = useState(false);
  const [conversionStep, setConversionStep] = useState(1);

  // Show contextual upgrade prompts based on user behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userContext.usage >= userContext.limit * 0.8) {
        setShowLimitationMessage(true);
      } else if (userContext.engagement > 5 && userContext.followers > 1000) {
        setShowUpgradeCTA(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [userContext]);

  const handleUpgrade = (planType: 'pro' | 'enterprise' = 'pro') => {
    // Track conversion event
    console.log(`Conversion: Upgrading to ${planType} plan`);
    
    // Simulate upgrade process
    onUpgrade(planType);
    onClose();
  };

  const handleDismissCTA = () => {
    setShowUpgradeCTA(false);
    // Track dismiss event for optimization
    console.log('Conversion CTA dismissed');
  };

  const handleDismissLimitation = () => {
    setShowLimitationMessage(false);
    // Track dismiss event for optimization
    console.log('Limitation message dismissed');
  };

  const views = {
    comparison: {
      title: 'Compare Plans',
      component: (
        <FeatureComparisonMatrix 
          onUpgradeClick={handleUpgrade}
          onViewPricing={() => setCurrentView('value')}
        />
      )
    },
    value: {
      title: 'See Your ROI',
      component: (
        <ValueProposition onUpgradeClick={() => handleUpgrade('pro')} />
      )
    },
    social: {
      title: 'Success Stories',
      component: (
        <SocialProof 
          onUpgradeClick={() => handleUpgrade('pro')}
          onViewTestimonials={() => setCurrentView('testimonial')}
        />
      )
    },
    testimonial: {
      title: 'What Users Say',
      component: (
        <div className="text-center py-8 sm:py-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 px-2">
            Real Results from Real People
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {/* Additional testimonials could go here */}
            <div className="bg-white dark:bg-gray-800 p-6 sm:p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mx-2 sm:mx-0">
              <div className="text-3xl sm:text-4xl mb-4">🚀</div>
              <blockquote className="text-gray-700 dark:text-gray-300 mb-4 text-sm sm:text-base leading-relaxed">
                "This platform helped us scale from 0 to 500K followers in 8 months."
              </blockquote>
              <div className="text-xs sm:text-sm text-gray-500">- Tech Startup Founder</div>
            </div>
          </div>
        </div>
      )
    }
  };

  const navItems = [
    { id: 'comparison', label: 'Plans', icon: Crown },
    { id: 'value', label: 'ROI', icon: TrendingUp },
    { id: 'social', label: 'Reviews', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 flex-shrink-0" />
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">
                  Upgrade to Pro
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                  Unlock unlimited growth potential
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Dropdown Navigation */}
          <div className="sm:hidden">
            <div className="relative">
              <select
                value={currentView}
                onChange={(e) => setCurrentView(e.target.value as keyof typeof views)}
                className="w-full appearance-none bg-transparent py-4 pl-4 pr-10 text-base font-medium text-gray-900 dark:text-white border-0 focus:ring-2 focus:ring-purple-500 touch-manipulation"
              >
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <option key={item.id} value={item.id} className="text-gray-900 dark:text-white">
                      {item.label}
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Desktop/Tablet Horizontal Tabs */}
          <div className="hidden sm:flex space-x-1 lg:space-x-8 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id as keyof typeof views)}
                  className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors min-h-[44px] ${
                    currentView === item.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-3">
            <div className="flex items-center gap-3 w-full">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Step {conversionStep} of 3
              </span>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${(conversionStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pb-safe">
        {views[currentView].component}
      </div>

      {/* Contextual Upgrade CTAs */}
      {showUpgradeCTA && (
        <UpgradeCTA
          trigger="high_engagement"
          context={{
            engagement: userContext.engagement,
            followers: userContext.followers,
            timeSpent: userContext.timeSpent
          }}
          onUpgrade={handleUpgrade}
          onDismiss={handleDismissCTA}
        />
      )}

      {showLimitationMessage && (
        <LimitationMessage
          context={{
            feature: 'accounts',
            currentUsage: userContext.usage,
            limit: userContext.limit,
            percentage: Math.round((userContext.usage / userContext.limit) * 100),
            premiumFeatures: ['Unlimited accounts', 'Advanced analytics', 'Team collaboration'],
            potentialValue: '300% follower growth'
          }}
          onUpgrade={handleUpgrade}
          onDismiss={handleDismissLimitation}
          variant="modal"
        />
      )}
    </div>
  );
}

// Quick conversion widget for embedding in existing pages
export function ConversionWidget({ 
  context, 
  position = 'bottom-right' 
}: { 
  context: any;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    'bottom-right': 'bottom-safe right-safe',
    'bottom-left': 'bottom-safe left-safe',
    'top-right': 'top-safe right-safe',
    'top-left': 'top-safe left-safe'
  };

  // Mobile-optimized sizes
  const mobileWidth = 'w-[calc(100vw-2rem)] max-w-sm';
  const desktopWidth = 'w-80';

  if (!isExpanded) {
    return (
      <div className={`fixed ${positionClasses[position]} z-30 m-4`}>
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[48px] touch-manipulation"
        >
          <Crown className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
          <span className="font-medium text-sm sm:text-base">Upgrade to Pro</span>
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${positionClasses[position]} z-30 m-2 sm:m-4`}>
      <div className={`${mobileWidth} sm:${desktopWidth} bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden`}>
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <span className="font-semibold text-sm sm:text-base truncate">Unlock Pro Features</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ml-2"
              aria-label="Close widget"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6">
          <div className="space-y-3 sm:space-y-4 mb-6">
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Unlimited Instagram accounts</span>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">Advanced analytics & insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm sm:text-base">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300">AI-powered content suggestions</span>
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              $29/month
            </div>
            <div className="text-sm text-gray-500 mb-4 sm:mb-5">
              14-day free trial
            </div>
            <button className="w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all min-h-[48px] text-sm sm:text-base touch-manipulation">
              Start Free Trial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add mobile-specific CSS utilities for safe area support
const mobileStyles = `
  @media (max-width: 640px) {
    .bottom-safe {
      bottom: env(safe-area-inset-bottom, 1rem);
    }
    .top-safe {
      top: env(safe-area-inset-top, 1rem);
    }
    .right-safe {
      right: env(safe-area-inset-right, 1rem);
    }
    .left-safe {
      left: env(safe-area-inset-left, 1rem);
    }
    .pb-safe {
      padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));
    }
  }
`;

// Inject styles if they don't exist
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('conversion-center-mobile-styles');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'conversion-center-mobile-styles';
    style.textContent = mobileStyles;
    document.head.appendChild(style);
  }
}