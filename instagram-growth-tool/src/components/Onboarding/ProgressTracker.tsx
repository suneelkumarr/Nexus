import { useState, useEffect } from 'react';
import { 
  CheckCircle, Circle, Trophy, Target, TrendingUp, 
  Clock, Award, Star, Zap, BarChart3, Users, 
  Calendar, Search, Sparkles, ArrowRight
} from 'lucide-react';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  isOptional?: boolean;
  order: number;
  completedAt?: string;
  icon: any;
  category: 'profile' | 'accounts' | 'plan' | 'features' | 'exploration';
  estimatedTime: number; // in minutes
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface ProgressTrackerProps {
  steps: OnboardingStep[];
  achievements: Achievement[];
  isCompleted: boolean;
  startedAt: string;
  onStepClick?: (stepId: string) => void;
  showDetailed?: boolean;
  className?: string;
}

const stepIcons = {
  profile: Users,
  accounts: Users,
  plan: BarChart3,
  features: Zap,
  exploration: Target
};

const categoryColors = {
  profile: 'from-blue-500 to-cyan-500',
  accounts: 'from-purple-500 to-pink-500',
  plan: 'from-green-500 to-emerald-500',
  features: 'from-orange-500 to-red-500',
  exploration: 'from-indigo-500 to-purple-500'
};

const achievementIcons = {
  first_connection: '📱',
  plan_selected: '💎',
  first_insights: '📊',
  onboarding_complete: '🎉',
  explorer: '🗺️',
  data_master: '📈',
  early_adopter: '⚡'
};

const rarityColors = {
  common: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  rare: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  epic: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  legendary: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
};

export default function ProgressTracker({ 
  steps, 
  achievements, 
  isCompleted, 
  startedAt, 
  onStepClick,
  showDetailed = true,
  className = ''
}: ProgressTrackerProps) {
  const [hoveredStep, setHoveredStep] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const completedSteps = steps.filter(step => step.isCompleted);
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps.length / totalSteps) * 100);
  
  const totalEstimatedTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);
  const actualTimeSpent = Math.round((currentTime.getTime() - new Date(startedAt).getTime()) / (1000 * 60));
  
  const totalPoints = achievements.reduce((sum, achievement) => sum + achievement.points, 0);

  const getStepIcon = (step: OnboardingStep) => {
    const IconComponent = stepIcons[step.category] || Circle;
    return IconComponent;
  };

  const getStepStatus = (step: OnboardingStep) => {
    if (step.isCompleted) return 'completed';
    const currentStepIndex = steps.findIndex(s => !s.isCompleted);
    if (steps[currentStepIndex]?.id === step.id) return 'current';
    if (step.order < (steps[currentStepIndex]?.order || 0)) return 'available';
    return 'locked';
  };

  const getStepStyle = (step: OnboardingStep, status: string) => {
    const baseClasses = 'relative flex items-center p-4 rounded-xl border-2 transition-all duration-200';
    const colorClasses = categoryColors[step.category];
    
    switch (status) {
      case 'completed':
        return `${baseClasses} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30`;
      case 'current':
        return `${baseClasses} bg-gradient-to-r ${colorClasses} text-white cursor-pointer shadow-lg scale-105`;
      case 'available':
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`;
      case 'locked':
      default:
        return `${baseClasses} bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-50 cursor-not-allowed`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getCompletionMessage = () => {
    const completionRate = (completedSteps.length / totalSteps) * 100;
    if (completionRate === 100) return '🎉 Onboarding Complete!';
    if (completionRate >= 80) return '🚀 Almost there!';
    if (completionRate >= 60) return '💪 Great progress!';
    if (completionRate >= 40) return '📈 Keep going!';
    return '🌟 Let\'s get started!';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Onboarding Progress
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {getCompletionMessage()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {progressPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {completedSteps.length} of {totalSteps} steps
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          {isCompleted && (
            <div className="absolute -top-1 -right-1">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {actualTimeSpent}min
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Time Spent</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {totalPoints}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Points Earned</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {achievements.length}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Achievements</p>
          </div>
        </div>
      </div>

      {/* Steps List */}
      {showDetailed && (
        <div className="space-y-3 mb-6">
          {steps.map((step) => {
            const status = getStepStatus(step);
            const StepIcon = getStepIcon(step);
            const isHovered = hoveredStep === step.id;

            return (
              <div
                key={step.id}
                className={getStepStyle(step, status)}
                onClick={() => status !== 'locked' && onStepClick?.(step.id)}
                onMouseEnter={() => setHoveredStep(step.id)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    status === 'current' 
                      ? 'bg-white/20' 
                      : status === 'completed'
                      ? 'bg-green-100 dark:bg-green-900/30'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    {status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <StepIcon className={`w-5 h-5 ${
                        status === 'current' 
                          ? 'text-white' 
                          : status === 'available'
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-gray-400 dark:text-gray-500'
                      }`} />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium mb-1 ${
                      status === 'current' 
                        ? 'text-white' 
                        : status === 'completed'
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {step.title}
                    </h4>
                    <p className={`text-sm ${
                      status === 'current' 
                        ? 'text-white/80' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.description}
                    </p>
                    
                    {isHovered && status !== 'locked' && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'current' 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        }`}>
                          {step.estimatedTime}min
                        </span>
                        {status === 'available' && (
                          <ArrowRight className="w-3 h-3 text-gray-400" />
                        )}
                      </div>
                    )}
                    
                    {step.completedAt && (
                      <div className="mt-1 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">
                          Completed {getTimeAgo(step.completedAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {status === 'current' && (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Achievements Section */}
      {achievements.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Achievements
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border ${rarityColors[achievement.rarity]} relative overflow-hidden`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{achievementIcons[achievement.id as keyof typeof achievementIcons] || '🏆'}</span>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-medium text-sm truncate">{achievement.title}</h5>
                    <p className="text-xs opacity-80">{achievement.points} points</p>
                  </div>
                </div>
                <p className="text-xs opacity-75">{achievement.description}</p>
                
                <div className="absolute top-1 right-1">
                  <Star className="w-3 h-3 opacity-60" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completion Banner */}
      {isCompleted && (
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                🎉 Onboarding Complete!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Congratulations! You've successfully completed the setup process. 
                Explore the advanced features and start growing your Instagram presence!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}