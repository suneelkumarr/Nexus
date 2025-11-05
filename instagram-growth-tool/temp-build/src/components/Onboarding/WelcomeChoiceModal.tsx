import { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Compass, 
  Clock, 
  ArrowRight, 
  Zap,
  Target,
  CheckCircle,
  Play
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WelcomeChoiceModalProps {
  isVisible: boolean;
  onTakeTour: () => void;
  onExploreSelf: () => void;
  onSkip: () => void;
  userProgress: number;
  estimatedTourTime?: number;
}

interface TourPreviewStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
}

const tourPreviewSteps: TourPreviewStep[] = [
  {
    id: 'welcome',
    title: 'Welcome & Overview',
    description: 'Dashboard introduction and key features',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'analytics',
    title: 'Analytics Dashboard',
    description: 'Your performance metrics and insights',
    icon: Target,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'insights',
    title: 'AI-Powered Insights',
    description: 'Personalized recommendations for growth',
    icon: Zap,
    color: 'from-yellow-500 to-orange-500'
  }
];

export default function WelcomeChoiceModal({
  isVisible,
  onTakeTour,
  onExploreSelf,
  onSkip,
  userProgress,
  estimatedTourTime = 3
}: WelcomeChoiceModalProps) {
  const [selectedOption, setSelectedOption] = useState<'tour' | 'explore' | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setSelectedOption(null);
      setShowPreview(false);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  const handleOptionSelect = (option: 'tour' | 'explore') => {
    setSelectedOption(option);
    if (option === 'tour') {
      setShowPreview(true);
      // Auto-proceed after preview after 3 seconds
      setTimeout(() => {
        onTakeTour();
      }, 3000);
    } else {
      onExploreSelf();
    }
  };

  const handleSkip = () => {
    onSkip();
    localStorage.setItem('tour_dismissed_permanently', 'true');
  };

  const formatTime = (minutes: number) => {
    return minutes < 1 ? '< 1 min' : `${minutes} min`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        
        {/* Header */}
        <div className="relative p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to GrowthHub!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              You're {userProgress}% through setup. How would you like to get started?
            </p>
          </div>
        </div>

        {/* Choice Interface */}
        {!selectedOption && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Take Tour Option */}
              <button
                onClick={() => handleOptionSelect('tour')}
                className="group relative p-6 border-2 border-purple-200 dark:border-purple-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-200 hover:shadow-lg text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Take a Quick Tour
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get a guided walkthrough of your dashboard and key features
                    </p>
                    <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(estimatedTourTime)} • Optional • Can skip anytime</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-purple-600" />
                </div>
              </button>

              {/* Explore Self Option */}
              <button
                onClick={() => handleOptionSelect('explore')}
                className="group relative p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 hover:shadow-lg text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Compass className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Explore on Your Own
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Jump right in and discover features at your own pace
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4" />
                      <span>Start exploring immediately • Help available anytime</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="w-5 h-5 text-gray-600" />
                </div>
              </button>
            </div>

            {/* Skip Option */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Skip for now • You can start a tour later from the help menu
              </button>
            </div>
          </div>
        )}

        {/* Tour Preview */}
        {showPreview && selectedOption === 'tour' && (
          <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full text-sm text-purple-700 dark:text-purple-300">
                <Clock className="w-4 h-4" />
                Tour starting in 3 seconds...
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white text-center mb-4">
                Here's what we'll cover:
              </h4>
              {tourPreviewSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {index + 1}. {step.title}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {step.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={onTakeTour}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4" />
                Start Tour Now
              </button>
              <button
                onClick={onExploreSelf}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Actually, let me explore
              </button>
            </div>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="px-6 pb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${userProgress}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span>Setup Progress</span>
            <span>{userProgress}% Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
}
