import { Crown, Check, X, Zap, TrendingUp, Users, BarChart3, Clock, Shield, Star } from 'lucide-react';
import { useState } from 'react';

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  enterprise: boolean | string;
  popular?: boolean;
  description?: string;
}

interface FeatureComparisonMatrixProps {
  onUpgradeClick: (planType: 'pro' | 'enterprise') => void;
  onViewPricing?: () => void;
}

const features: PlanFeature[] = [
  {
    name: 'Instagram Accounts',
    free: '1',
    pro: '25',
    enterprise: 'Unlimited',
    popular: true,
    description: 'Connect multiple Instagram accounts to manage all your profiles in one place'
  },
  {
    name: 'Monthly Analytics',
    free: '100',
    pro: '10,000',
    enterprise: '100,000+',
    description: 'Number of profile visits and insights you can access per month'
  },
  {
    name: 'Content Scheduling',
    free: 'Basic',
    pro: 'Advanced',
    enterprise: 'AI-Powered',
    description: 'Schedule posts with optimal timing and content suggestions'
  },
  {
    name: 'Hashtag Research',
    free: false,
    pro: 'Unlimited',
    enterprise: 'Advanced AI',
    description: 'Discover trending hashtags and optimize your reach'
  },
  {
    name: 'Competitor Analysis',
    free: false,
    pro: '10 profiles',
    enterprise: 'Unlimited',
    description: 'Track competitor performance and strategies'
  },
  {
    name: 'Content Performance Tracking',
    free: 'Basic',
    pro: 'Advanced',
    enterprise: 'Predictive AI',
    description: 'Track engagement, reach, and growth metrics'
  },
  {
    name: 'AI Content Suggestions',
    free: false,
    pro: '50/month',
    enterprise: 'Unlimited',
    description: 'AI-powered content ideas and captions'
  },
  {
    name: 'Team Collaboration',
    free: false,
    pro: false,
    enterprise: 'Up to 10 users',
    description: 'Share access and collaborate with team members'
  },
  {
    name: 'Priority Support',
    free: 'Email',
    pro: 'Chat + Email',
    enterprise: 'Dedicated Manager',
    description: 'Get help when you need it most'
  },
  {
    name: 'Custom Reports',
    free: false,
    pro: 'Basic Templates',
    enterprise: 'Fully Customizable',
    description: 'Generate branded reports for clients or stakeholders'
  },
  {
    name: 'Data Export',
    free: 'CSV only',
    pro: 'CSV, PDF',
    enterprise: 'All Formats + API',
    description: 'Export your data in multiple formats'
  },
  {
    name: 'White Label Solution',
    free: false,
    pro: false,
    enterprise: true,
    description: 'Rebrand the platform for your clients'
  }
];

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    period: '/forever',
    description: 'Perfect for getting started',
    color: 'gray',
    popular: false,
    cta: 'Current Plan'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'Best for growing businesses',
    color: 'purple',
    popular: true,
    cta: 'Start Free Trial'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    description: 'For agencies and large teams',
    color: 'blue',
    popular: false,
    cta: 'Contact Sales'
  }
];

export default function FeatureComparisonMatrix({ onUpgradeClick, onViewPricing }: FeatureComparisonMatrixProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);
  const [activeInfoTooltip, setActiveInfoTooltip] = useState<string | null>(null);

  const getFeatureValue = (value: boolean | string, plan: string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto flex-shrink-0" />
      ) : (
        <X className="w-5 h-5 text-gray-300 mx-auto flex-shrink-0" />
      );
    }
    return <span className="text-sm font-medium text-center break-words">{value}</span>;
  };

  const getPlanColor = (color: string, isActive: boolean = false) => {
    const baseClasses = {
      gray: isActive ? 'bg-gray-100 border-gray-300' : 'bg-gray-50 border-gray-200',
      purple: isActive ? 'bg-purple-100 border-purple-300' : 'bg-purple-50 border-purple-200',
      blue: isActive ? 'bg-blue-100 border-blue-300' : 'bg-blue-50 border-blue-200'
    };
    return baseClasses[color as keyof typeof baseClasses] || baseClasses.gray;
  };

  const getButtonColor = (planId: string) => {
    switch (planId) {
      case 'pro':
        return 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800';
      case 'enterprise':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800';
      default:
        return 'bg-gray-200 text-gray-500 cursor-not-allowed';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Growth Plan
        </h2>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Unlock the full potential of your Instagram presence with our comprehensive analytics and growth tools
        </p>
      </div>

      {/* Mobile: Plan Cards (Vertical Stack) */}
      <div className="block lg:hidden space-y-6 mb-8">
        {plans.map((plan) => (
          <div key={plan.id} className="relative">
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800 shadow-sm">
                  <Star className="w-4 h-4 mr-1" />
                  Most Popular
                </div>
              </div>
            )}
            <div className={`p-6 rounded-2xl border-2 pt-8 ${getPlanColor(plan.color, plan.id === 'pro')}`}>
              <div className="flex items-center justify-center mb-4">
                {plan.id === 'free' && <span className="text-3xl">🆓</span>}
                {plan.id === 'pro' && <Crown className="w-8 h-8 text-purple-600" />}
                {plan.id === 'enterprise' && <Shield className="w-8 h-8 text-blue-600" />}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 text-center">{plan.name}</h3>
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 text-lg">{plan.period}</span>
              </div>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-6 text-center">{plan.description}</p>
              
              {/* Mobile Feature List */}
              <div className="space-y-3 mb-6">
                {features.slice(0, 6).map((feature) => (
                  <div key={feature.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{feature.name}</span>
                      {feature.description && (
                        <button
                          onClick={() => setActiveInfoTooltip(activeInfoTooltip === feature.name ? null : feature.name)}
                          className="flex-shrink-0 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          aria-label={`Info about ${feature.name}`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-2">
                      {getFeatureValue(feature[plan.id as keyof typeof feature] as boolean | string, plan.id)}
                    </div>
                  </div>
                ))}
                {features.length > 6 && (
                  <button
                    onClick={() => setActiveInfoTooltip(activeInfoTooltip === 'all-features' ? null : 'all-features')}
                    className="w-full text-center text-purple-600 hover:text-purple-700 font-medium py-2 text-sm transition-colors"
                  >
                    View All Features
                  </button>
                )}
                
                {/* Expanded Feature List */}
                {activeInfoTooltip === 'all-features' && (
                  <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {features.slice(6).map((feature) => (
                      <div key={feature.name} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="font-medium text-gray-900 dark:text-white text-sm truncate">{feature.name}</span>
                          {feature.description && (
                            <button
                              onClick={() => setActiveInfoTooltip(activeInfoTooltip === feature.name ? null : feature.name)}
                              className="flex-shrink-0 p-1 text-gray-400 hover:text-purple-600 transition-colors"
                              aria-label={`Info about ${feature.name}`}
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex-shrink-0 ml-2">
                          {getFeatureValue(feature[plan.id as keyof typeof feature] as boolean | string, plan.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Tooltip */}
                {activeInfoTooltip && activeInfoTooltip !== 'all-features' && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center p-4" onClick={() => setActiveInfoTooltip(null)}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {features.find(f => f.name === activeInfoTooltip)?.name}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                        {features.find(f => f.name === activeInfoTooltip)?.description}
                      </p>
                      <button
                        onClick={() => setActiveInfoTooltip(null)}
                        className="w-full py-3 bg-purple-600 text-white rounded-lg font-medium min-h-[44px] touch-manipulation"
                      >
                        Got it
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => plan.id === 'free' ? undefined : plan.id === 'pro' ? onUpgradeClick('pro') : onViewPricing?.()}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                  plan.id === 'free' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : getButtonColor(plan.id)
                } text-white text-lg min-h-[44px] touch-manipulation`}
                disabled={plan.id === 'free'}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Plans Header */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Features</h3>
        </div>
        {plans.map((plan) => (
          <div key={plan.id} className="text-center">
            {plan.popular && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                <Star className="w-3 h-3 mr-1" />
                Most Popular
              </div>
            )}
            <div className={`p-6 rounded-2xl border-2 ${getPlanColor(plan.color, plan.id === 'pro')}`}>
              <div className="flex items-center justify-center mb-2">
                {plan.id === 'free' && <span className="text-gray-500 text-2xl">🆓</span>}
                {plan.id === 'pro' && <Crown className="w-6 h-6 text-purple-600" />}
                {plan.id === 'enterprise' && <Shield className="w-6 h-6 text-blue-600" />}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
              <button
                onClick={() => plan.id === 'free' ? undefined : plan.id === 'pro' ? onUpgradeClick('pro') : onViewPricing?.()}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  plan.id === 'free' 
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                    : getButtonColor(plan.id)
                } text-white`}
                disabled={plan.id === 'free'}
              >
                {plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Features Comparison */}
      <div className="hidden lg:block space-y-2">
        {features.map((feature, index) => (
          <div
            key={feature.name}
            className={`grid grid-cols-4 gap-4 p-4 rounded-lg transition-all cursor-pointer ${
              hoveredFeature === feature.name 
                ? 'bg-purple-50 dark:bg-purple-900/20' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
            onMouseEnter={() => setHoveredFeature(feature.name)}
            onMouseLeave={() => setHoveredFeature(null)}
          >
            {/* Feature Name and Description */}
            <div className="relative">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{feature.name}</span>
                {feature.popular && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Popular
                  </span>
                )}
              </div>
              {hoveredFeature === feature.name && feature.description && (
                <div className="absolute z-10 bottom-full left-0 mb-2 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg max-w-xs">
                  {feature.description}
                  <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>

            {/* Free Plan */}
            <div className="flex items-center justify-center">
              {getFeatureValue(feature.free, 'free')}
            </div>

            {/* Pro Plan */}
            <div className="flex items-center justify-center">
              {getFeatureValue(feature.pro, 'pro')}
            </div>

            {/* Enterprise Plan */}
            <div className="flex items-center justify-center">
              {getFeatureValue(feature.enterprise, 'enterprise')}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA Section */}
      <div className="mt-8 lg:mt-12 text-center">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to 10x Your Instagram Growth?
          </h3>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto leading-relaxed">
            Join thousands of creators and businesses who have transformed their Instagram presence with our platform. 
            Start your free trial today and see results in your first week.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => onUpgradeClick('pro')}
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg active:shadow-md transition-all min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              <Zap className="w-5 h-5" />
              Start 14-Day Free Trial
            </button>
            <button
              onClick={onViewPricing}
              className="px-8 py-4 border border-purple-300 text-purple-700 dark:text-purple-300 dark:border-purple-600 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 active:bg-purple-100 dark:active:bg-purple-900/30 transition-all min-h-[44px] touch-manipulation w-full sm:w-auto"
            >
              View Full Pricing
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 px-4">
            No credit card required • Cancel anytime • Setup in under 5 minutes
          </p>
        </div>
      </div>
    </div>
  );
}