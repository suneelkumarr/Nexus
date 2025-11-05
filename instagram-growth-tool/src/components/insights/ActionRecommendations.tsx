import { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  BarChart3,
  ArrowRight,
  Info,
  Zap
} from 'lucide-react';

interface ActionWithROI {
  id: string;
  action: string;
  rationale: string;
  expectedOutcome: {
    metric: string;
    improvement: string;
    timeframe: string;
    confidence: number;
  };
  effort: 'low' | 'medium' | 'high';
  trackingMethod: string;
  successStories?: {
    user: string;
    result: string;
    timeframe: string;
  }[];
  isCompleted?: boolean;
}

interface ActionRecommendationProps {
  actions: ActionWithROI[];
  onActionStart?: (actionId: string) => void;
  onActionComplete?: (actionId: string) => void;
  className?: string;
}

const effortColors = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-700'
};

const confidenceColors = {
  high: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300',
  medium: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300'
};

export default function ActionRecommendations({ 
  actions, 
  onActionStart,
  onActionComplete,
  className = ''
}: ActionRecommendationProps) {
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [inProgressActions, setInProgressActions] = useState<Set<string>>(new Set());

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return 'high';
    if (confidence >= 60) return 'medium';
    return 'low';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Lower Confidence';
  };

  const handleActionClick = (action: ActionWithROI) => {
    if (inProgressActions.has(action.id)) {
      // Complete action
      setInProgressActions(prev => {
        const newSet = new Set(prev);
        newSet.delete(action.id);
        return newSet;
      });
      onActionComplete?.(action.id);
    } else {
      // Start action
      setInProgressActions(prev => new Set(prev).add(action.id));
      onActionStart?.(action.id);
    }
  };

  const toggleExpanded = (actionId: string) => {
    setExpandedAction(expandedAction === actionId ? null : actionId);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recommended Actions
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Prioritized by impact and effort
        </span>
      </div>

      {actions.map((action) => {
        const isExpanded = expandedAction === action.id;
        const isInProgress = inProgressActions.has(action.id);
        const confidenceLevel = getConfidenceLevel(action.expectedOutcome.confidence);
        
        return (
          <div
            key={action.id}
            className={`border-2 rounded-xl p-5 transition-all duration-200 ${
              isInProgress 
                ? 'border-purple-300 dark:border-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {action.action}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {action.rationale}
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${effortColors[action.effort]}`}>
                  {action.effort} effort
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${confidenceColors[confidenceLevel]}`}>
                  {getConfidenceLabel(action.expectedOutcome.confidence)}
                </span>
              </div>
            </div>

            {/* Expected Outcome */}
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Expected Result
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Metric:</span>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {action.expectedOutcome.metric}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Improvement:</span>
                  <div className="font-semibold text-green-600 dark:text-green-400">
                    {action.expectedOutcome.improvement}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Timeframe:</span>
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {action.expectedOutcome.timeframe}
                  </div>
                </div>
              </div>
            </div>

            {/* Expandable Details */}
            {isExpanded && (
              <div className="mb-4 space-y-3">
                {/* Tracking Method */}
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      How to Track Success
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {action.trackingMethod}
                  </p>
                </div>

                {/* Success Stories */}
                {action.successStories && action.successStories.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        Similar Success Stories
                      </span>
                    </div>
                    <div className="space-y-2">
                      {action.successStories.map((story, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium text-blue-700 dark:text-blue-300">
                            {story.user}:
                          </span>
                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                            {story.result} in {story.timeframe}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => toggleExpanded(action.id)}
                className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <Info className="w-4 h-4" />
                {isExpanded ? 'Hide Details' : 'Show Details'}
              </button>
              
              <button
                onClick={() => handleActionClick(action)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isInProgress
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                }`}
              >
                {isInProgress ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Mark Complete
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Start Action
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-1">
              Pro Tip
            </h4>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Start with high-confidence, low-effort actions for quick wins. Track your results and build momentum before tackling more complex strategies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sample actions for testing
export const sampleActions: ActionWithROI[] = [
  {
    id: '1',
    action: 'Post during peak engagement hours (6-8 PM)',
    rationale: 'Your audience is most active during evening hours, and posts published at this time get 28% more engagement.',
    expectedOutcome: {
      metric: 'Post Engagement Rate',
      improvement: '+25-30%',
      timeframe: '2-4 weeks',
      confidence: 85
    },
    effort: 'low',
    trackingMethod: 'Compare engagement rates of posts published at different times. Use Instagram Insights to track reach and engagement by hour.',
    successStories: [
      {
        user: 'Sarah M.',
        result: 'Doubled evening post engagement',
        timeframe: '3 weeks'
      },
      {
        user: 'Mike R.',
        result: '40% increase in overall reach',
        timeframe: '1 month'
      }
    ]
  },
  {
    id: '2',
    action: 'Create 3 behind-the-scenes stories per week',
    rationale: 'Authentic, behind-the-scenes content builds trust and creates emotional connection with your audience.',
    expectedOutcome: {
      metric: 'Story Engagement & Follower Growth',
      improvement: '+45% story engagement, +20% follower growth',
      timeframe: '4-6 weeks',
      confidence: 78
    },
    effort: 'medium',
    trackingMethod: 'Monitor story completion rates, replies, and follower count changes. Stories with behind-the-scenes content typically have 50% higher completion rates.',
    successStories: [
      {
        user: 'Lisa K.',
        result: '67% more story engagement',
        timeframe: '5 weeks'
      }
    ]
  }
];
