import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  Check, Instagram, TrendingUp, Zap, X, ArrowRight, Users, 
  Crown, Sparkles, BarChart3, Calendar, Search, UserCheck,
  Star, ArrowLeft, PlayCircle, Settings
} from 'lucide-react';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  isLastStep?: boolean;
}

const steps: OnboardingStep[] = [
  {
    id: 1,
    title: 'Welcome to GrowthHub',
    description: 'Your all-in-one Instagram analytics and growth platform',
    icon: Instagram
  },
  {
    id: 2,
    title: 'Setup Instagram Accounts',
    description: 'Connect your Instagram accounts to start tracking',
    icon: Users
  },
  {
    id: 3,
    title: 'Choose Subscription Plan',
    description: 'Select the perfect plan for your growth needs',
    icon: Crown
  },
  {
    id: 4,
    title: 'First Insights',
    description: 'See your dashboard and explore powerful features',
    icon: Sparkles
  }
];

const planFeatures = [
  {
    name: 'Basic',
    price: 'Free',
    period: '',
    features: [
      '1 Instagram account',
      'Basic analytics',
      '7-day data history',
      'Email support'
    ],
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: [
      '5 Instagram accounts',
      'Advanced analytics',
      'Unlimited data history',
      'AI content suggestions',
      'Priority support'
    ],
    popular: true
  },
  {
    name: 'Enterprise',
    price: '$99',
    period: '/month',
    features: [
      'Unlimited accounts',
      'Full analytics suite',
      'Custom reports',
      'Team collaboration',
      '24/7 phone support'
    ],
    popular: false
  }
];

interface OnboardingModalProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingModal({ onComplete, onSkip }: OnboardingModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showGuidedTour, setShowGuidedTour] = useState(false);

  const handleNext = async () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      await updateProgress(currentStep + 1);
      
      // Show guided tour on the last step
      if (currentStep + 1 === steps.length) {
        setTimeout(() => setShowGuidedTour(true), 500);
      }
    } else {
      await completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('manage-onboarding', {
        body: { action: 'skip' }
      });
      toast.success('Onboarding skipped');
      onSkip();
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (step: number) => {
    try {
      await supabase.functions.invoke('manage-onboarding', {
        body: { 
          action: 'update',
          step,
          completedSteps: Array.from({ length: step }, (_, i) => i + 1)
        }
      });
    } catch (error) {
      console.error('Error updating onboarding:', error);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await supabase.functions.invoke('manage-onboarding', {
        body: { action: 'complete' }
      });
      toast.success('Welcome to GrowthHub! 🎉');
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (planName: string) => {
    setSelectedPlan(planName);
    toast.success(`${planName} plan selected!`);
  };

  const currentStepData = steps.find(s => s.id === currentStep);
  if (!currentStepData) return null;

  const Icon = currentStepData.icon;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Welcome
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Advanced Analytics</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track followers, engagement & growth trends</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200 dark:border-cyan-700">
                <div className="w-12 h-12 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">AI Insights</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get smart recommendations & predictions</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-700">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Content Management</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan, schedule & optimize your posts</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-700">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Market Research</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Analyze competitors & find opportunities</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white">What makes GrowthHub special?</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Real-time analytics and insights</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">AI-powered content suggestions</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Competitor analysis tools</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 dark:text-gray-300">Automated growth recommendations</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // Setup Instagram Accounts
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Connect Your Instagram Accounts
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Navigate to Accounts Tab</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">After completing onboarding, go to the "Accounts" section in the sidebar</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Add Instagram Account</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Click "Add Account" and enter your Instagram username (without @)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-1">Start Tracking</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Your analytics will begin updating immediately once connected</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-600 dark:text-amber-400 text-xs">💡</span>
                </div>
                <div>
                  <h5 className="font-medium text-amber-900 dark:text-amber-100 mb-1">Pro Tip</h5>
                  <p className="text-sm text-amber-800 dark:text-amber-200">You can add multiple Instagram accounts to track all your profiles in one place!</p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // Choose Subscription Plan
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Choose Your Plan</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Select the perfect plan for your growth journey</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planFeatures.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                    selectedPlan === plan.name
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                  } ${plan.popular ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}`}
                  onClick={() => handlePlanSelect(plan.name)}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="text-center">
                    <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h5>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">{plan.period}</span>
                    </div>
                    
                    <ul className="space-y-2 mb-6 text-left">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                        selectedPlan === plan.name
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-purple-100 dark:hover:bg-purple-900/30'
                      }`}
                    >
                      {selectedPlan === plan.name ? 'Selected' : 'Select Plan'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                All plans include a 14-day free trial. Cancel anytime.
              </p>
            </div>
          </div>
        );

      case 4: // First Insights & Guided Tour
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ready to Explore!</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Let's take a quick tour of your new dashboard</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Overview Dashboard</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">View your key metrics, follower growth, and engagement trends at a glance</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Advanced Analytics</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Deep dive into detailed analytics with custom date ranges and filters</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">AI Insights</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get personalized recommendations powered by artificial intelligence</p>
              </div>

              <div className="p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <h5 className="font-semibold text-gray-900 dark:text-white">Collaboration</h5>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Work together with your team and manage multiple accounts</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-4">
                <PlayCircle className="w-6 h-6 text-purple-600" />
                <h5 className="font-semibold text-gray-900 dark:text-white">Start Your Journey</h5>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                When you click "Get Started", you'll see a guided tour highlighting all the key features of your dashboard. 
                You can skip the tour at any time by clicking the "Skip Tour" button.
              </p>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Settings className="w-4 h-4" />
                  <span>Accessible via Help menu</span>
                </div>
                <div className="flex items-center gap-1">
                  <ArrowRight className="w-4 h-4" />
                  <span>Interactive tooltips</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold mb-1">Getting Started</h2>
                <p className="text-white/80">Step {currentStep} of {steps.length}</p>
              </div>
              <button
                onClick={handleSkip}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-6">
                <Icon className="w-10 h-10 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {currentStepData.title}
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {currentStepData.description}
              </p>
            </div>

            {/* Step specific content */}
            {renderStepContent()}

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Skip for now
              </button>
              
              <div className="flex-1 flex gap-2">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    disabled={loading}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : currentStep === steps.length ? (
                    'Get Started'
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
