import { useState, useEffect, useRef } from 'react';
import { 
  HelpCircle, X, ExternalLink, BookOpen, Video, 
  MessageCircle, Lightbulb, Star, Clock, ChevronRight,
  TrendingUp, Users, BarChart3, Calendar, Search,
  Sparkles, Target, Award, Zap, Eye
} from 'lucide-react';

interface TooltipContent {
  title: string;
  description: string;
  examples?: string[];
  bestPractices?: string[];
  commonMistakes?: string[];
  relatedMetrics?: string[];
  videos?: { title: string; url: string; duration: string }[];
  articles?: { title: string; url: string }[];
}

interface HelpTooltipProps {
  targetId: string;
  content: TooltipContent;
  position?: 'top' | 'bottom' | 'left' | 'right';
  isVisible: boolean;
  onClose: () => void;
  className?: string;
}

const metricExplanations: Record<string, TooltipContent> = {
  follower_growth: {
    title: 'Follower Growth Rate',
    description: 'The rate at which your follower count is increasing over time. This metric shows how effectively you\'re attracting new followers.',
    examples: [
      '5% monthly growth means 50 new followers per 1,000 existing followers',
      'Consistent 2-3% weekly growth is considered excellent for most accounts',
      'Negative growth might indicate content or posting frequency issues'
    ],
    bestPractices: [
      'Track growth weekly to identify trends',
      'Compare growth rates across different time periods',
      'Consider seasonal factors (holidays, events)',
      'Focus on quality followers over quantity'
    ],
    commonMistakes: [
      'Panicking over single-day fluctuations',
      'Buying followers artificially (hurts engagement)',
      'Ignoring the source of new followers',
      'Not segmenting growth by content type'
    ],
    relatedMetrics: ['engagement_rate', 'reach', 'profile_visits', 'hashtag_performance'],
    videos: [
      { title: 'Understanding Follower Growth', url: '#', duration: '3:24' },
      { title: 'Common Growth Mistakes', url: '#', duration: '2:15' }
    ],
    articles: [
      { title: '10 Proven Ways to Grow Instagram Followers', url: '#' },
      { title: 'Instagram Algorithm Changes in 2024', url: '#' }
    ]
  },
  engagement_rate: {
    title: 'Engagement Rate',
    description: 'The percentage of your followers who interact with your content through likes, comments, shares, and saves.',
    examples: [
      'Engagement rate = (Likes + Comments + Shares) ÷ Followers × 100',
      'Industry average is 1-3% for most accounts',
      'Accounts with <1% engagement rate may need content optimization'
    ],
    bestPractices: [
      'Aim for 2-5% engagement rate for most accounts',
      'Respond to comments quickly to boost engagement',
      'Use interactive content (polls, questions, quizzes)',
      'Post consistently during peak engagement times'
    ],
    commonMistakes: [
      'Not responding to comments promptly',
      'Posting only promotional content',
      'Ignoring negative feedback',
      'Using too many hashtags (appears spammy)'
    ],
    relatedMetrics: ['reach', 'impressions', 'follower_growth', 'content_performance']
  },
  reach: {
    title: 'Reach',
    description: 'The number of unique accounts that have seen your content. Reach shows how many people were exposed to your posts.',
    examples: [
      'Reach of 1,000 means 1,000 different people saw your content',
      'Reach higher than followers indicates hashtag/explore success',
      'Low reach might suggest posting at wrong times'
    ],
    bestPractices: [
      'Use relevant, trending hashtags',
      'Post during peak activity hours for your audience',
      'Create shareable, valuable content',
      'Collaborate with other creators'
    ],
    commonMistakes: [
      'Using irrelevant hashtags',
      'Posting when your audience is inactive',
      'Creating overly promotional content',
      'Ignoring hashtag performance'
    ],
    relatedMetrics: ['impressions', 'hashtag_performance', 'story_views', 'profile_visits']
  },
  best_posting_times: {
    title: 'Optimal Posting Times',
    description: 'The times when your audience is most active and likely to engage with your content.',
    examples: [
      'Peak hours vary by audience demographics',
      'Weekend patterns differ from weekday patterns',
      'Your audience might be most active at 7-9 AM and 6-8 PM'
    ],
    bestPractices: [
      'Use Instagram Insights to find your peak times',
      'Test different posting times for 2-3 weeks',
      'Schedule content for optimal engagement windows',
      'Consider your audience\'s time zones'
    ],
    commonMistakes: [
      'Posting at random times',
      'Ignoring audience analytics',
      'Not testing different time slots',
      'Posting too early or too late for your audience'
    ],
    relatedMetrics: ['engagement_rate', 'reach', 'story_completion_rate', 'profile_visits']
  }
};

interface HelpTooltipsProps {
  enabled?: boolean;
  className?: string;
}

export default function HelpTooltips({ enabled = true, className = '' }: HelpTooltipsProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState<TooltipContent | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Auto-close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setActiveTooltip(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showTooltip = (metricId: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top') => {
    if (!enabled) return;
    
    const content = metricExplanations[metricId];
    if (content) {
      setTooltipContent(content);
      setActiveTooltip(`${metricId}-${position}`);
    }
  };

  const hideTooltip = () => {
    setActiveTooltip(null);
    setTooltipContent(null);
  };

  const getTooltipPosition = () => {
    if (!activeTooltip) return 'hidden';
    
    const [metricId, position] = activeTooltip.split('-');
    const baseClasses = 'fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md';
    
    switch (position) {
      case 'top':
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case 'bottom':
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      case 'left':
        return `${baseClasses} left-4 top-1/2 transform -translate-y-1/2`;
      case 'right':
      default:
        return `${baseClasses} right-4 top-1/2 transform -translate-y-1/2`;
    }
  };

  const getArrowPosition = () => {
    if (!activeTooltip) return '';
    
    const position = activeTooltip.split('-')[1];
    const baseClasses = 'absolute w-3 h-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform rotate-45';
    
    switch (position) {
      case 'top':
        return `${baseClasses} -top-1.5 left-1/2 transform -translate-x-1/2 rotate-45`;
      case 'bottom':
        return `${baseClasses} -bottom-1.5 left-1/2 transform -translate-x-1/2 rotate-45`;
      case 'left':
        return `${baseClasses} -left-1.5 top-1/2 transform -translate-y-1/2 rotate-45`;
      case 'right':
      default:
        return `${baseClasses} -right-1.5 top-1/2 transform -translate-y-1/2 rotate-45`;
    }
  };

  // Enhanced tooltip component for specific metrics
  const MetricTooltip = ({ metricId, children, position = 'top' }: { 
    metricId: string; 
    children: React.ReactNode; 
    position?: 'top' | 'bottom' | 'left' | 'right';
  }) => (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => showTooltip(metricId, position)}
        onMouseLeave={hideTooltip}
        className="cursor-help"
      >
        {children}
      </div>
    </div>
  );

  // Global help button component
  const HelpButton = ({ className: buttonClass = '' }: { className?: string }) => (
    <button
      onClick={() => setActiveTooltip('global-help')}
      className={`p-2 text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors ${buttonClass}`}
    >
      <HelpCircle className="w-5 h-5" />
    </button>
  );

  // Contextual help trigger
  const ContextualHelp = ({ trigger, content }: { 
    trigger: React.ReactNode; 
    content: TooltipContent; 
  }) => (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setTooltipContent(content)}
        onMouseLeave={() => setActiveTooltip(null)}
        className="cursor-help"
      >
        {trigger}
      </div>
    </div>
  );

  if (!enabled) return null;

  return (
    <>
      {/* Global Help Tooltip */}
      {activeTooltip === 'global-help' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            ref={tooltipRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  Instagram Analytics Guide
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn how to interpret and use these metrics to grow your Instagram presence
                </p>
              </div>
              <button
                onClick={hideTooltip}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(metricExplanations).map(([key, content]) => (
                <div key={key} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    {content.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {content.description}
                  </p>
                  <button
                    onClick={() => setActiveTooltip(`detail-${key}`)}
                    className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1 hover:underline"
                  >
                    Learn more
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-purple-600" />
                Pro Tips
              </h4>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Focus on trends rather than daily fluctuations</li>
                <li>• Compare your metrics to industry benchmarks</li>
                <li>• Use multiple metrics together for better insights</li>
                <li>• Track progress over weeks and months, not days</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Metric Tooltip */}
      {activeTooltip?.startsWith('detail-') && tooltipContent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div 
            ref={tooltipRef}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-2xl w-full max-h-[80vh] overflow-auto"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {tooltipContent.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {tooltipContent.description}
                </p>
              </div>
              <button
                onClick={hideTooltip}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Examples */}
              {tooltipContent.examples && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-600" />
                    Examples
                  </h4>
                  <ul className="space-y-2">
                    {tooltipContent.examples.map((example, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Best Practices */}
              {tooltipContent.bestPractices && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4 text-green-600" />
                    Best Practices
                  </h4>
                  <ul className="space-y-2">
                    {tooltipContent.bestPractices.map((practice, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        {practice}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common Mistakes */}
              {tooltipContent.commonMistakes && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-red-600" />
                    Common Mistakes
                  </h4>
                  <ul className="space-y-2">
                    {tooltipContent.commonMistakes.map((mistake, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Related Metrics */}
              {tooltipContent.relatedMetrics && (
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                    Related Metrics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tooltipContent.relatedMetrics.map((metric) => (
                      <button
                        key={metric}
                        onClick={() => {
                          const metricContent = metricExplanations[metric];
                          if (metricContent) {
                            setTooltipContent(metricContent);
                          }
                        }}
                        className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                      >
                        {metric.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              {(tooltipContent.videos || tooltipContent.articles) && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    Learn More
                  </h4>
                  
                  {tooltipContent.videos && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Tutorials
                      </h5>
                      <div className="space-y-2">
                        {tooltipContent.videos.map((video, index) => (
                          <a
                            key={index}
                            href={video.url}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">{video.title}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {video.duration}
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {tooltipContent.articles && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Articles & Guides
                      </h5>
                      <div className="space-y-2">
                        {tooltipContent.articles.map((article, index) => (
                          <a
                            key={index}
                            href={article.url}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          >
                            <span className="text-sm text-gray-700 dark:text-gray-300">{article.title}</span>
                            <ExternalLink className="w-3 h-3 text-gray-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Export help components for use in other components */}
      <div className="sr-only">
        <MetricTooltip />
        <HelpButton />
        <ContextualHelp />
      </div>
    </>
  );
}

// Export utility functions for easy access
export const MetricTooltip = HelpTooltips; // Re-export for direct usage
export const HelpButton = HelpTooltips; // Re-export for direct usage
export const ContextualHelp = HelpTooltips; // Re-export for direct usage