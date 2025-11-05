import { useState, useEffect } from 'react';
import { 
  ArrowRight, TrendingUp, Target, Sparkles, Calendar, 
  BarChart3, Users, Award, Zap, Clock, CheckCircle,
  ExternalLink, Star, Lightbulb, Play, Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface NextAction {
  id: string;
  title: string;
  description: string;
  type: 'insight' | 'create' | 'schedule' | 'export' | 'upgrade' | 'explore';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // in minutes
  category: string;
  actionUrl?: string;
  actionData?: any;
  isCompleted: boolean;
  triggeredBy: string; // what event triggered this suggestion
  aiGenerated: boolean;
  confidenceScore?: number; // 0-1
}

interface PersonalizationData {
  userType: 'beginner' | 'intermediate' | 'advanced';
  goals: string[];
  recentActivity: string[];
  performanceLevel: 'poor' | 'average' | 'good' | 'excellent';
  industry?: string;
}

interface NextStepsProps {
  onActionComplete?: (actionId: string) => void;
  onUpgradePrompt?: () => void;
  className?: string;
  maxActions?: number;
}

export default function NextSteps({ 
  onActionComplete, 
  onUpgradePrompt, 
  className = '',
  maxActions = 6 
}: NextStepsProps) {
  const { user } = useAuth();
  const [actions, setActions] = useState<NextAction[]>([]);
  const [personalization, setPersonalization] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const actionTypeIcons = {
    insight: BarChart3,
    create: Sparkles,
    schedule: Calendar,
    export: TrendingUp,
    upgrade: Award,
    explore: Target
  };

  const actionTypeColors = {
    insight: 'from-blue-500 to-cyan-500',
    create: 'from-purple-500 to-pink-500',
    schedule: 'from-green-500 to-emerald-500',
    export: 'from-orange-500 to-red-500',
    upgrade: 'from-yellow-500 to-orange-500',
    explore: 'from-indigo-500 to-purple-500'
  };

  const priorityColors = {
    high: 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20',
    medium: 'border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20',
    low: 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20'
  };

  useEffect(() => {
    loadNextActions();
  }, []);

  const loadNextActions = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user's personalization data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userPersonalization: PersonalizationData = {
        userType: profileData?.user_type || 'beginner',
        goals: profileData?.goals || ['growth'],
        recentActivity: profileData?.recent_activity || [],
        performanceLevel: profileData?.performance_level || 'average',
        industry: profileData?.industry
      };

      setPersonalization(userPersonalization);

      // Generate personalized next actions
      const generatedActions = generatePersonalizedActions(userPersonalization);
      setActions(generatedActions.slice(0, maxActions));

    } catch (error) {
      console.error('Error loading next actions:', error);
      // Fallback to default actions
      setActions(getDefaultActions());
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedActions = (personalization: PersonalizationData): NextAction[] => {
    const actions: NextAction[] = [];

    // Actions based on user type
    if (personalization.userType === 'beginner') {
      actions.push({
        id: 'connect-instagram',
        title: 'Connect Your Instagram Account',
        description: 'Start tracking analytics by connecting your first Instagram account',
        type: 'explore',
        priority: 'high',
        estimatedTime: 5,
        category: 'Setup',
        triggeredBy: 'onboarding',
        isCompleted: false,
        aiGenerated: false
      });

      actions.push({
        id: 'view-basic-metrics',
        title: 'Check Your Basic Metrics',
        description: 'Get familiar with follower count, engagement rate, and recent posts',
        type: 'insight',
        priority: 'high',
        estimatedTime: 10,
        category: 'Analytics',
        triggeredBy: 'account_connected',
        isCompleted: false,
        aiGenerated: false
      });
    }

    // Actions based on goals
    if (personalization.goals.includes('growth')) {
      actions.push({
        id: 'analyze-growth-trends',
        title: 'Analyze Growth Trends',
        description: 'Identify patterns in your follower growth and optimize posting times',
        type: 'insight',
        priority: 'high',
        estimatedTime: 15,
        category: 'Growth',
        triggeredBy: 'goal_growth',
        isCompleted: false,
        aiGenerated: true,
        confidenceScore: 0.85
      });

      actions.push({
        id: 'schedule-optimal-posts',
        title: 'Schedule Posts at Optimal Times',
        description: 'Based on your audience activity, schedule posts for maximum engagement',
        type: 'schedule',
        priority: 'medium',
        estimatedTime: 20,
        category: 'Content',
        triggeredBy: 'goal_growth',
        isCompleted: false,
        aiGenerated: true,
        confidenceScore: 0.78
      });
    }

    if (personalization.goals.includes('engagement')) {
      actions.push({
        id: 'create-engagement-content',
        title: 'Create High-Engagement Content',
        description: 'Use AI suggestions to create content that resonates with your audience',
        type: 'create',
        priority: 'high',
        estimatedTime: 30,
        category: 'Content',
        triggeredBy: 'goal_engagement',
        isCompleted: false,
        aiGenerated: true,
        confidenceScore: 0.92
      });
    }

    // Actions based on performance level
    if (personalization.performanceLevel === 'poor' || personalization.performanceLevel === 'average') {
      actions.push({
        id: 'upgrade-plan',
        title: 'Upgrade for Advanced Features',
        description: 'Unlock advanced analytics, AI insights, and priority support',
        type: 'upgrade',
        priority: 'medium',
        estimatedTime: 5,
        category: 'Subscription',
        triggeredBy: 'performance_low',
        isCompleted: false,
        aiGenerated: false
      });
    }

    // Dynamic actions based on time since last activity
    const daysSinceLastPost = Math.floor(Math.random() * 7) + 1; // Simulated
    if (daysSinceLastPost > 3) {
      actions.push({
        id: 'create-post-now',
        title: 'Create a Post Now',
        description: 'Your audience is active. Create engaging content to maintain momentum',
        type: 'create',
        priority: 'high',
        estimatedTime: 25,
        category: 'Content',
        triggeredBy: 'inactivity',
        isCompleted: false,
        aiGenerated: true,
        confidenceScore: 0.88
      });
    }

    // Always include these helpful actions
    actions.push({
      id: 'export-report',
      title: 'Export Performance Report',
      description: 'Generate a comprehensive report to share with stakeholders',
      type: 'export',
      priority: 'low',
      estimatedTime: 10,
      category: 'Reporting',
      triggeredBy: 'manual',
      isCompleted: false,
      aiGenerated: false
    });

    actions.push({
      id: 'explore-competitors',
      title: 'Research Competitor Strategies',
      description: 'Discover what\'s working for similar accounts in your industry',
      type: 'explore',
      priority: 'medium',
      estimatedTime: 20,
      category: 'Research',
      triggeredBy: 'manual',
      isCompleted: false,
      aiGenerated: true,
      confidenceScore: 0.73
    });

    return actions.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const getDefaultActions = (): NextAction[] => [
    {
      id: 'connect-instagram',
      title: 'Connect Your Instagram Account',
      description: 'Start tracking analytics by connecting your first Instagram account',
      type: 'explore',
      priority: 'high',
      estimatedTime: 5,
      category: 'Setup',
      triggeredBy: 'default',
      isCompleted: false,
      aiGenerated: false
    },
    {
      id: 'view-basic-metrics',
      title: 'Check Your Basic Metrics',
      description: 'Get familiar with your Instagram performance overview',
      type: 'insight',
      priority: 'high',
      estimatedTime: 10,
      category: 'Analytics',
      triggeredBy: 'default',
      isCompleted: false,
      aiGenerated: false
    },
    {
      id: 'explore-features',
      title: 'Explore Advanced Features',
      description: 'Discover AI insights and advanced analytics tools',
      type: 'explore',
      priority: 'medium',
      estimatedTime: 15,
      category: 'Features',
      triggeredBy: 'default',
      isCompleted: false,
      aiGenerated: false
    }
  ];

  const handleActionClick = async (action: NextAction) => {
    setSelectedAction(action.id);

    try {
      // Track action engagement
      await supabase.functions.invoke('track-user-action', {
        body: {
          actionId: action.id,
          actionType: action.type,
          userId: user?.id
        }
      });

      // Handle different action types
      switch (action.type) {
        case 'upgrade':
          onUpgradePrompt?.();
          break;
        case 'explore':
          // Navigate to specific section
          break;
        case 'insight':
          // Open analytics view
          break;
        case 'create':
          // Open content creation tools
          break;
        case 'schedule':
          // Open scheduling interface
          break;
        case 'export':
          // Trigger export process
          break;
      }

      // Mark action as completed
      setActions(prev => prev.map(a => 
        a.id === action.id ? { ...a, isCompleted: true } : a
      ));

      onActionComplete?.(action.id);

    } catch (error) {
      console.error('Error handling action:', error);
    } finally {
      setSelectedAction(null);
    }
  };

  const getActionIcon = (type: string) => {
    const IconComponent = actionTypeIcons[type as keyof typeof actionTypeIcons] || Target;
    return IconComponent;
  };

  const formatEstimatedTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Recommended Next Steps
          </h3>
          <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
            <Sparkles className="w-3 h-3" />
            AI-Powered
          </div>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Personalized actions to help you achieve your Instagram growth goals
        </p>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.map((action) => {
          const ActionIcon = getActionIcon(action.type);
          const isSelected = selectedAction === action.id;
          
          return (
            <div
              key={action.id}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                action.isCompleted
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
                  : isSelected
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600'
                  : `hover:bg-gray-50 dark:hover:bg-gray-700 ${priorityColors[action.priority]}`
              }`}
              onClick={() => !action.isCompleted && handleActionClick(action)}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  action.isCompleted
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : `bg-gradient-to-r ${actionTypeColors[action.type]}`
                }`}>
                  {action.isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <ActionIcon className="w-5 h-5 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-semibold ${
                      action.isCompleted
                        ? 'text-green-900 dark:text-green-100'
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {action.title}
                    </h4>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        action.priority === 'high'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : action.priority === 'medium'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                      }`}>
                        {action.priority}
                      </span>
                      {action.aiGenerated && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400">
                          <Sparkles className="w-3 h-3" />
                          {action.confidenceScore ? Math.round(action.confidenceScore * 100) : 100}%
                        </div>
                      )}
                    </div>
                  </div>

                  <p className={`text-sm mb-3 ${
                    action.isCompleted
                      ? 'text-green-700 dark:text-green-300'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {action.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatEstimatedTime(action.estimatedTime)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        {action.category}
                      </div>
                      {action.confidenceScore && (
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {Math.round(action.confidenceScore * 100)}% confidence
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {action.actionUrl && (
                        <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      {!action.isCompleted && (
                        <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                          <span className="text-xs font-medium">
                            {isSelected ? 'Starting...' : 'Start'}
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {action.triggeredBy && (
                    <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      Suggested based on: {action.triggeredBy.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      {actions.length > maxActions && (
        <div className="mt-6 text-center">
          <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium flex items-center gap-1 mx-auto">
            <Lightbulb className="w-4 h-4" />
            View {actions.length - maxActions} more suggestions
          </button>
        </div>
      )}

      {actions.length === 0 && !loading && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">All caught up!</h4>
          <p className="text-gray-500 dark:text-gray-400">No pending actions at the moment. Check back later for new recommendations.</p>
        </div>
      )}
    </div>
  );
}