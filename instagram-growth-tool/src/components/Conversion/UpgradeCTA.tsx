import { Crown, Zap, TrendingUp, Users, BarChart3, Clock, Star, ArrowRight, Sparkles, Target, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface UpgradeCTAProps {
  trigger: 'limit_reached' | 'feature_requested' | 'high_engagement' | 'milestone_reached' | 'usage_warning';
  context?: {
    featureName?: string;
    currentUsage?: number;
    limit?: number;
    timeSpent?: string;
    engagement?: number;
    followers?: number;
  };
  onUpgrade: (planType: 'pro' | 'enterprise') => void;
  onDismiss: () => void;
}

const ctaTemplates = {
  limit_reached: {
    title: 'You\'ve Hit Your Account Limit',
    subtitle: 'Unlock unlimited growth potential',
    urgency: 'high',
    icon: TrendingUp,
    color: 'from-red-500 to-pink-600',
    benefits: [
      'Connect up to 25 Instagram accounts',
      'Advanced analytics for all profiles',
      'Team collaboration tools',
      'Priority customer support'
    ],
    primaryCTA: 'Upgrade Now - $29/month',
    secondaryCTA: 'Maybe Later',
    roiMessage: 'Average users see 3x follower growth within 30 days'
  },
  feature_requested: {
    title: 'Unlock {featureName}',
    subtitle: 'This powerful feature is available on Pro',
    urgency: 'medium',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-600',
    benefits: [
      'Advanced hashtag research and trending analysis',
      'AI-powered content suggestions (50/month)',
      'Competitor tracking and analysis',
      'Custom performance reports'
    ],
    primaryCTA: 'Start Free Trial',
    secondaryCTA: 'Learn More',
    roiMessage: 'Unlock 285% more reach with advanced insights'
  },
  high_engagement: {
    title: 'Your Content is Going Viral!',
    subtitle: 'Scale your success with Pro features',
    urgency: 'low',
    icon: Star,
    color: 'from-yellow-500 to-orange-600',
    benefits: [
      'Unlimited content scheduling',
      'Advanced performance predictions',
      'White-label client reports',
      'Dedicated account manager'
    ],
    primaryCTA: 'Scale My Growth',
    secondaryCTA: 'Continue Free',
    roiMessage: 'Capitalize on your momentum - users like you see 10x growth'
  },
  milestone_reached: {
    title: 'Congratulations! You\'re Growing Fast',
    subtitle: 'Your success deserves Pro-level tools',
    urgency: 'medium',
    icon: Crown,
    color: 'from-green-500 to-emerald-600',
    benefits: [
      'Advanced audience insights',
      'Content optimization recommendations',
      'Automated posting with AI timing',
      'Team collaboration for agencies'
    ],
    primaryCTA: 'Unlock Full Potential',
    secondaryCTA: 'Celebrate Later',
    roiMessage: 'Keep growing 4x faster with Pro features'
  },
  usage_warning: {
    title: 'You\'re Running Low on Credits',
    subtitle: 'Upgrade before you run out',
    urgency: 'medium',
    icon: Clock,
    color: 'from-orange-500 to-red-600',
    benefits: [
      '10x more monthly analytics',
      'Unlimited hashtag research',
      'Advanced competitor tracking',
      'Priority support'
    ],
    primaryCTA: 'Refill Credits',
    secondaryCTA: 'Remind Me Tomorrow',
    roiMessage: 'Avoid disruption and maintain your growth momentum'
  }
};

export default function UpgradeCTA({ trigger, context, onUpgrade, onDismiss }: UpgradeCTAProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [animateIn, setAnimateIn] = useState(false);
  const template = ctaTemplates[trigger];

  useEffect(() => {
    // Trigger entrance animation
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

  const handleUpgrade = (planType: 'pro' | 'enterprise' = 'pro') => {
    onUpgrade(planType);
  };

  const Icon = template.icon;

  return (
    <div className={`fixed top-4 right-4 md:top-4 md:right-4 z-50 transition-all duration-500 safe-area-inset-top safe-area-inset-right ${
      animateIn ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm w-[calc(100vw-2rem)] md:w-full overflow-hidden">
        {/* Header */}
        <div className={`bg-gradient-to-r ${template.color} p-4 text-white relative`}>
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Dismiss upgrade prompt"
          >
            <span className="text-lg">×</span>
          </button>
          
          <div className="flex items-start gap-3 pr-12 md:pr-0">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base md:text-sm leading-tight">
                {template.title.replace('{featureName}', context?.featureName || '')}
              </h3>
              <p className="text-white/90 text-sm md:text-xs mt-1">{template.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-4">
          {/* Benefits List */}
          <div className="space-y-3 md:space-y-2 mb-5 md:mb-4">
            {template.benefits.slice(0, 3).map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{benefit}</span>
              </div>
            ))}
          </div>

          {/* ROI Message */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mb-5 md:mb-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="text-sm md:text-sm font-medium text-purple-800 dark:text-purple-300 leading-relaxed">
                {template.roiMessage}
              </span>
            </div>
          </div>

          {/* Context Info */}
          {context && (
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-5 md:mb-4">
              <div className="space-y-2 md:space-y-1 text-sm md:text-xs text-gray-600 dark:text-gray-400">
                {context.currentUsage && context.limit && (
                  <div>Current: {context.currentUsage}/{context.limit} accounts</div>
                )}
                {context.followers && (
                  <div>Followers: {context.followers.toLocaleString()}</div>
                )}
                {context.engagement && (
                  <div>Engagement rate: {context.engagement}%</div>
                )}
                {context.timeSpent && (
                  <div>Time on platform: {context.timeSpent}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 md:flex-row md:gap-2">
            <button
              onClick={() => handleUpgrade()}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-4 md:px-3 md:py-2 min-h-[48px] md:min-h-0 bg-gradient-to-r ${template.color} text-white rounded-lg text-sm font-semibold hover:shadow-lg active:scale-95 transition-all touch-manipulation`}
            >
              <Crown className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-sm md:text-sm">{template.primaryCTA}</span>
              <ArrowRight className="w-4 h-4 md:w-3 md:h-3" />
            </button>
            <button
              onClick={handleDismiss}
              className="w-full px-4 py-4 md:px-3 md:py-2 min-h-[48px] md:min-h-0 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-colors touch-manipulation"
            >
              {template.secondaryCTA}
            </button>
          </div>

          {/* Trial Info */}
          <div className="mt-4 md:mt-3 text-center">
            <p className="text-sm md:text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              🎁 14-day free trial • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Upgrade Modal Component for more prominent CTAs
interface UpgradeModalProps {
  isOpen: boolean;
  trigger: 'milestone' | 'weekly_report' | 'feature_preview';
  context?: any;
  onUpgrade: (planType: 'pro' | 'enterprise') => void;
  onClose: () => void;
}

export function UpgradeModal({ isOpen, trigger, context, onUpgrade, onClose }: UpgradeModalProps) {
  if (!isOpen) return null;

  const milestoneContent = {
    title: '🎉 You\'ve Hit a Major Milestone!',
    subtitle: 'Your growth momentum is incredible',
    description: 'With your current success rate, you could reach 100K followers in just 6 months with Pro features.',
    benefits: [
      'Advanced audience insights to optimize content strategy',
      'AI-powered posting schedule for maximum engagement',
      'Competitor analysis to stay ahead of trends',
      'White-label reports for potential brand partnerships'
    ],
    urgency: 'Act now to maximize your growth potential',
    ctaText: 'Accelerate My Growth'
  };

  const weeklyContent = {
    title: '📊 Your Weekly Growth Report',
    subtitle: 'Here\'s how you performed this week',
    description: 'You grew 15% faster than average users. Pro features could help you maintain this momentum.',
    benefits: [
      'Detailed competitor performance tracking',
      'Predictive analytics for content planning',
      'Automated growth tracking and alerts',
      'Priority support for growth strategies'
    ],
    urgency: 'Keep your growth streak going',
    ctaText: 'Unlock Advanced Analytics'
  };

  const featureContent = {
    title: '✨ Introducing Advanced Competitor Analysis',
    subtitle: 'See what\'s working for your competition',
    description: 'Track up to 10 competitor profiles and discover their winning strategies.',
    benefits: [
      'Real-time competitor tracking and alerts',
      'Content strategy analysis and insights',
      'Hashtag performance comparison',
      'Growth opportunity identification'
    ],
    urgency: 'Limited time: Free for new Pro users',
    ctaText: 'Start Free Trial'
  };

  const content = trigger === 'milestone' ? milestoneContent : 
                  trigger === 'weekly_report' ? weeklyContent : featureContent;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-6 text-white relative rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors touch-manipulation"
            aria-label="Close modal"
          >
            <span className="text-xl">×</span>
          </button>
          
          <div className="pr-12 sm:pr-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">{content.title}</h2>
            <p className="text-sm sm:text-base text-purple-100">{content.subtitle}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <p className="text-gray-700 dark:text-gray-300 mb-6 text-base sm:text-sm leading-relaxed">{content.description}</p>

          {/* Benefits */}
          <div className="space-y-4 sm:space-y-3 mb-6">
            {content.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          {/* ROI Section */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3 mb-2">
              <Target className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
              <span className="font-semibold text-purple-800 dark:text-purple-300 text-sm sm:text-sm">Why upgrade now?</span>
            </div>
            <p className="text-purple-700 dark:text-purple-400 text-sm leading-relaxed ml-8 sm:ml-0">{content.urgency}</p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-3">
            <button
              onClick={() => onUpgrade('pro')}
              className="flex-1 flex items-center justify-center gap-3 px-6 py-4 min-h-[56px] bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg active:scale-95 transition-all touch-manipulation text-base sm:text-sm"
            >
              <Crown className="w-6 h-6 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-sm">{content.ctaText}</span>
              <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-4 min-h-[56px] border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-colors touch-manipulation text-base sm:text-sm"
            >
              Maybe Later
            </button>
          </div>

          {/* Trial Info */}
          <div className="mt-6 md:mt-4 text-center">
            <p className="text-sm md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              🎁 Start your 14-day free trial • Cancel anytime • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}