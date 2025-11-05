import { AlertTriangle, Clock, TrendingUp, Crown, Lock, ArrowRight, Zap, Users, BarChart3, Target } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LimitationContext {
  feature: string;
  currentUsage: number;
  limit: number;
  percentage: number;
  daysRemaining?: number;
  premiumFeatures: string[];
  potentialValue: string;
}

interface LimitationMessageProps {
  context: LimitationContext;
  onUpgrade: () => void;
  onDismiss: () => void;
  variant?: 'inline' | 'modal' | 'banner';
}

const limitationTypes = {
  accounts: {
    icon: Users,
    title: 'Account Limit Reached',
    message: 'You\'ve connected the maximum number of Instagram accounts for your plan.',
    urgency: 'high',
    valueProposition: 'Connect up to 25 accounts and manage all your profiles in one place',
    benefits: [
      'Unified dashboard for all accounts',
      'Cross-account analytics and insights',
      'Bulk content scheduling',
      'Team collaboration tools'
    ]
  },
  analytics: {
    icon: BarChart3,
    title: 'Analytics Limit Exceeded',
    message: 'You\'ve used your monthly analytics allowance.',
    urgency: 'medium',
    valueProposition: 'Get 10x more analytics and detailed insights into your performance',
    benefits: [
      'Unlimited profile visits and insights',
      'Advanced audience demographics',
      'Competitor performance tracking',
      'Predictive growth analytics'
    ]
  },
  features: {
    icon: Lock,
    title: 'Premium Feature Locked',
    message: 'This advanced feature requires a Pro subscription.',
    urgency: 'medium',
    valueProposition: 'Unlock AI-powered tools and advanced analytics to accelerate your growth',
    benefits: [
      'AI content suggestions and optimization',
      'Advanced hashtag research',
      'Automated posting schedules',
      'White-label reports for clients'
    ]
  },
  time: {
    icon: Clock,
    title: 'Trial Period Ending Soon',
    message: 'Your free trial expires soon. Upgrade to continue using Pro features.',
    urgency: 'high',
    valueProposition: 'Maintain your growth momentum with uninterrupted access to all Pro features',
    benefits: [
      'Continue unlimited access',
      'Keep all your analytics and insights',
      'Maintain scheduled content',
      'Preserve growth tracking data'
    ]
  }
};

export default function LimitationMessage({ context, onUpgrade, onDismiss, variant = 'modal' }: LimitationMessageProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setAnimateIn(false);
    setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 300);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'from-red-500 to-pink-600';
      case 'medium': return 'from-orange-500 to-yellow-600';
      default: return 'from-purple-500 to-pink-600';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const limitation = limitationTypes.accounts; // Default, would be determined by context

  if (variant === 'inline') {
    return (
      <div className={`transition-all duration-300 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-1 text-sm sm:text-base">
                {limitation.title}
              </h4>
              <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-400 mb-3 leading-relaxed">
                {limitation.message} You've used {context.currentUsage}/{context.limit} ({context.percentage}%)
              </p>
              
              {/* Progress Bar - Mobile Optimized */}
              <div className="w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-3 mb-3">
                <div 
                  className={`h-3 rounded-full transition-all ${getProgressColor(context.percentage)}`}
                  style={{ width: `${Math.min(context.percentage, 100)}%` }}
                />
              </div>

              {/* Benefits - Hidden on very small screens */}
              <div className="hidden xs:block space-y-1 mb-3">
                {limitation.benefits.slice(0, 2).map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <Crown className="w-3 h-3 text-purple-600 flex-shrink-0" />
                    <span className="text-yellow-700 dark:text-yellow-300">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Mobile-Optimized Buttons */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={onUpgrade}
                  className="flex-1 px-4 py-3 sm:py-2 bg-yellow-600 text-white rounded-lg text-sm sm:text-xs font-semibold hover:bg-yellow-700 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="flex-1 px-4 py-3 sm:py-2 border border-yellow-300 text-yellow-700 dark:text-yellow-300 rounded-lg text-sm sm:text-xs font-medium hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors min-h-[44px] flex items-center justify-center"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`transition-all duration-300 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 sm:p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-sm sm:text-base leading-tight">
                    You've reached {context.percentage}% of your {context.feature} limit
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={onUpgrade}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-white text-orange-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors min-h-[44px] flex items-center justify-center text-sm"
                >
                  Upgrade Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="p-2.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <span className="text-lg">×</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Modal variant (default) - Mobile Optimized
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className={`bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md md:max-w-lg transition-all duration-300 max-h-[90vh] sm:max-h-[85vh] flex flex-col ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full sm:translate-y-0 sm:scale-95'
      }`}>
        {/* Header - Mobile Optimized */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-4 sm:p-6 text-white rounded-t-2xl sm:rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold leading-tight">Limit Reached</h2>
                <p className="text-orange-100 text-xs sm:text-sm">
                  {context.currentUsage}/{context.limit} {context.feature} used
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <span className="text-lg sm:text-base">×</span>
            </button>
          </div>

          {/* Usage Visualization - Mobile Optimized */}
          <div className="bg-white/20 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-sm">Usage</span>
              <span className="text-sm font-semibold">{context.percentage}%</span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 sm:h-3">
              <div 
                className="bg-white h-4 sm:h-3 rounded-full transition-all"
                style={{ width: `${Math.min(context.percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            {/* Value Proposition - Mobile Optimized */}
            <div className="text-center mb-6">
              <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-2 leading-tight">
                Unlock Unlimited {context.feature}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {limitation.valueProposition}
              </p>
            </div>

            {/* Benefits - Stacked for Mobile */}
            <div className="space-y-3 mb-6">
              {limitation.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 sm:w-5 sm:h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Urgency - Mobile Optimized */}
            {context.daysRemaining && context.daysRemaining > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <span className="text-sm sm:text-sm text-red-800 dark:text-red-300 font-medium leading-tight">
                    Only {context.daysRemaining} days left on your current plan
                  </span>
                </div>
              </div>
            )}

            {/* Value Calculator - Mobile Optimized */}
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3 text-sm sm:text-sm">
                What you could achieve with Pro:
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-400">Expected follower growth:</span>
                  <span className="font-medium text-purple-800 dark:text-purple-300">+300%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-400">Time saved per week:</span>
                  <span className="font-medium text-purple-800 dark:text-purple-300">8+ hours</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-400">ROI in first month:</span>
                  <span className="font-medium text-purple-800 dark:text-purple-300">9,490%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed Bottom Actions */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
          {/* CTAs - Mobile Optimized */}
          <div className="flex flex-col gap-3 mb-4">
            <button
              onClick={() => onUpgrade()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all min-h-[52px] text-sm sm:text-base"
            >
              <Crown className="w-5 h-5" />
              Upgrade to Pro - $29/month
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleDismiss}
              className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px] text-sm"
            >
              Maybe Later
            </button>
          </div>

          {/* Trust Elements - Mobile Optimized */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              🎁 14-day free trial • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Contextual limitation messages that appear based on user behavior - Mobile Optimized
export function ContextualLimitationPrompt({ 
  trigger, 
  onUpgrade, 
  onDismiss 
}: {
  trigger: 'content_locked' | 'analytics_exhausted' | 'competitor_limit' | 'scheduling_limit';
  onUpgrade: () => void;
  onDismiss: () => void;
}) {
  const prompts = {
    content_locked: {
      title: 'Unlock AI Content Suggestions',
      message: 'Generate 50+ content ideas per month with AI-powered suggestions',
      benefit: 'Boost engagement by 285%',
      icon: Zap,
      color: 'from-purple-500 to-pink-600'
    },
    analytics_exhausted: {
      title: 'View Unlimited Analytics',
      message: 'Get detailed insights into your top-performing content and audience',
      benefit: 'Make data-driven decisions',
      icon: BarChart3,
      color: 'from-blue-500 to-indigo-600'
    },
    competitor_limit: {
      title: 'Track More Competitors',
      message: 'Monitor up to 10 competitor profiles and their strategies',
      benefit: 'Stay ahead of competition',
      icon: Target,
      color: 'from-green-500 to-emerald-600'
    },
    scheduling_limit: {
      title: 'Schedule Unlimited Content',
      message: 'Plan your entire month with advanced scheduling features',
      benefit: 'Save 8+ hours per week',
      icon: Clock,
      color: 'from-orange-500 to-red-600'
    }
  };

  const prompt = prompts[trigger];
  const Icon = prompt.icon;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto sm:max-w-sm z-40">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className={`bg-gradient-to-r ${prompt.color} p-4 text-white`}>
          <div className="flex items-start gap-3">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm sm:text-sm leading-tight">{prompt.title}</h3>
              <p className="text-white/90 text-xs leading-relaxed">{prompt.benefit}</p>
            </div>
            <button
              onClick={onDismiss}
              className="text-white/80 hover:text-white p-1 rounded transition-colors flex-shrink-0"
            >
              <span className="text-sm">×</span>
            </button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">{prompt.message}</p>
          <div className="flex gap-2">
            <button
              onClick={onUpgrade}
              className={`flex-1 px-4 py-3 bg-gradient-to-r ${prompt.color} text-white rounded-lg text-sm font-semibold transition-all min-h-[44px] flex items-center justify-center`}
            >
              Upgrade
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium min-h-[44px] flex items-center justify-center"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}