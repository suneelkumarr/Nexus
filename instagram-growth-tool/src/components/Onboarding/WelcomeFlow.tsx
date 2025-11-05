import { useState } from 'react';
import { 
  Check, Instagram, TrendingUp, Zap, Crown, Sparkles, 
  BarChart3, Calendar, Search, UserCheck, Star, 
  ArrowRight, ArrowLeft, PlayCircle, Settings, Users,
  Target, Award, Globe, Shield
} from 'lucide-react';

interface FeatureHighlight {
  icon: any;
  title: string;
  description: string;
  benefits: string[];
  color: string;
}

interface WelcomeFlowProps {
  onNext: () => void;
  onSkip: () => void;
  currentStep: number;
  totalSteps: number;
}

const platformFeatures: FeatureHighlight[] = [
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Deep insights into your Instagram performance',
    benefits: ['Real-time metrics tracking', 'Custom date range analysis', 'Competitor benchmarking', 'Growth trend predictions'],
    color: 'from-blue-500 to-purple-600'
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Insights',
    description: 'Smart recommendations for optimal growth',
    benefits: ['Content performance predictions', 'Optimal posting times', 'Hashtag recommendations', 'Engagement forecasts'],
    color: 'from-purple-500 to-pink-600'
  },
  {
    icon: Calendar,
    title: 'Content Management',
    description: 'Plan, schedule, and optimize your content strategy',
    benefits: ['Content calendar planning', 'Automated scheduling', 'Performance tracking', 'Content variations'],
    color: 'from-green-500 to-emerald-600'
  },
  {
    icon: Search,
    title: 'Market Research',
    description: 'Discover opportunities and track competitors',
    benefits: ['Competitor analysis', 'Trending content discovery', 'Hashtag monitoring', 'Market insights'],
    color: 'from-orange-500 to-red-600'
  }
];

const successStories = [
  {
    metric: '45%',
    description: 'Average follower growth',
    timeframe: 'within 3 months'
  },
  {
    metric: '67%',
    description: 'Increase in engagement rate',
    timeframe: 'on average'
  },
  {
    metric: '3x',
    description: 'Faster content planning',
    timeframe: 'with AI assistance'
  }
];

const whyChooseUs = [
  {
    icon: Target,
    title: 'Purpose-Built',
    description: 'Designed specifically for Instagram growth and analytics'
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Your Instagram data is protected with enterprise-grade security'
  },
  {
    icon: Globe,
    title: 'Global Community',
    description: 'Join thousands of creators and businesses worldwide'
  },
  {
    icon: Award,
    title: 'Award-Winning',
    description: 'Recognized as the best Instagram analytics platform'
  }
];

export default function WelcomeFlow({ onNext, onSkip, currentStep, totalSteps }: WelcomeFlowProps) {
  const [currentFeatureIndex, setCurrentFeatureIndex] = useState(0);
  const [showBenefits, setShowBenefits] = useState(false);

  const progressPercentage = (currentStep / totalSteps) * 100;

  const nextFeature = () => {
    setCurrentFeatureIndex((prev) => (prev + 1) % platformFeatures.length);
  };

  const previousFeature = () => {
    setCurrentFeatureIndex((prev) => (prev - 1 + platformFeatures.length) % platformFeatures.length);
  };

  const currentFeature = platformFeatures[currentFeatureIndex];
  const CurrentIcon = currentFeature.icon;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-purple-600">Getting Started</span>
          <span className="text-sm text-gray-500">{currentStep} of {totalSteps}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6">
            <Instagram className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Welcome to <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">GrowthHub</span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-6">
            Your all-in-one Instagram analytics and growth platform
          </p>
          <p className="text-lg text-gray-500 dark:text-gray-500">
            Transform your Instagram presence with AI-powered insights, advanced analytics, and strategic growth tools
          </p>
        </div>

        {/* Success Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {successStories.map((story, index) => (
            <div key={index} className="text-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {story.metric}
              </div>
              <div className="text-gray-900 dark:text-white font-medium mb-1">
                {story.description}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {story.timeframe}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Showcase */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Powerful Features for Growth
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Discover what makes GrowthHub the ultimate Instagram growth platform
            </p>
          </div>

          {/* Feature Display */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 bg-gradient-to-r ${currentFeature.color} rounded-xl flex items-center justify-center`}>
                  <CurrentIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {currentFeature.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentFeature.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h5 className="font-semibold text-gray-900 dark:text-white">Key Benefits:</h5>
                <div className="space-y-2">
                  {currentFeature.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feature Navigation */}
              <div className="flex items-center gap-2">
                <button
                  onClick={previousFeature}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex-1 flex justify-center gap-2">
                  {platformFeatures.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeatureIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentFeatureIndex
                          ? 'bg-purple-600'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <button
                  onClick={nextFeature}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${currentFeature.color} rounded-2xl opacity-20 animate-pulse`} />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className={`w-24 h-24 bg-gradient-to-r ${currentFeature.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <CurrentIcon className="w-12 h-12 text-white" />
                  </div>
                  <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {currentFeature.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {currentFeature.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-8 border border-purple-200 dark:border-purple-700">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Why Choose GrowthHub?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Join thousands of creators who trust GrowthHub for their Instagram success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {whyChooseUs.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ItemIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Steps Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Ready to Get Started?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Let's walk through setting up your account and connecting your Instagram profiles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Set Up Profile</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Complete your profile information</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Connect Account</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Link your Instagram accounts</p>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-sm">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Explore Features</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Take a guided tour of tools</p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={onSkip}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Skip for now
            </button>
            <button
              onClick={onNext}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              Continue Setup
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}