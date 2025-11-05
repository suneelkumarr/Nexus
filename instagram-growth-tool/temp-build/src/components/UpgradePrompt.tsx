import { Crown, X, TrendingUp, Zap, ArrowRight } from 'lucide-react';

interface UpgradePromptProps {
  isVisible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  reason?: 'limit_reached' | 'feature_locked' | 'usage_warning';
  currentPlan?: string;
}

export default function UpgradePrompt({ 
  isVisible, 
  onClose, 
  onUpgrade, 
  reason = 'limit_reached',
  currentPlan = 'free'
}: UpgradePromptProps) {
  if (!isVisible) return null;

  const getReasonContent = () => {
    switch (reason) {
      case 'limit_reached':
        return {
          title: 'Account Limit Reached',
          message: 'You\'ve reached the maximum number of Instagram accounts for your current plan.',
          icon: TrendingUp,
          color: 'from-red-500 to-pink-600'
        };
      case 'usage_warning':
        return {
          title: 'Approaching Limit',
          message: 'You\'re running low on your account allowance. Upgrade now to continue growing.',
          icon: TrendingUp,
          color: 'from-yellow-500 to-orange-600'
        };
      case 'feature_locked':
        return {
          title: 'Premium Feature',
          message: 'This feature is available on Pro and Enterprise plans only.',
          icon: Zap,
          color: 'from-purple-500 to-pink-600'
        };
      default:
        return {
          title: 'Upgrade Required',
          message: 'Upgrade your plan to access more features and capabilities.',
          icon: Crown,
          color: 'from-purple-500 to-pink-600'
        };
    }
  };

  const content = getReasonContent();
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full relative overflow-hidden">
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${content.color} opacity-10`} />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 hover:bg-white/30 text-gray-700 dark:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative p-8 text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r ${content.color} mb-6 shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>

          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {content.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            {content.message}
          </p>

          {/* Benefits */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Pro Plan Benefits:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">Up to 25 Instagram accounts</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">AI-powered content suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">Competitor analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Maybe Later
            </button>
            <button
              onClick={onUpgrade}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r ${content.color} text-white rounded-lg font-semibold hover:shadow-lg transition-all`}
            >
              <Crown className="w-4 h-4" />
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Pricing */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Starting at <span className="font-semibold text-purple-600">$29.99/month</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}