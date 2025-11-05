import React from 'react';
import { Camera, Plus, Lightbulb, Target, ArrowRight, Calendar } from 'lucide-react';

interface NoPostsYetProps {
  onCreatePost?: () => void;
  onViewTemplates?: () => void;
  onSchedulePost?: () => void;
  className?: string;
  showActions?: boolean;
  compact?: boolean;
}

const NoPostsYet: React.FC<NoPostsYetProps> = ({
  onCreatePost,
  onViewTemplates,
  onSchedulePost,
  className = '',
  showActions = true,
  compact = false
}) => {
  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost();
    } else {
      console.log('Navigate to post creation');
    }
  };

  const handleViewTemplates = () => {
    if (onViewTemplates) {
      onViewTemplates();
    } else {
      console.log('Navigate to templates');
    }
  };

  const handleSchedulePost = () => {
    if (onSchedulePost) {
      onSchedulePost();
    } else {
      console.log('Navigate to scheduling');
    }
  };

  const insights = [
    {
      icon: Target,
      title: 'Find Your Niche',
      description: 'Identify trending topics that resonate with your audience'
    },
    {
      icon: Lightbulb,
      title: 'AI Content Ideas',
      description: 'Get personalized suggestions based on your goals'
    }
  ];

  if (compact) {
    return (
      <div className={`bg-white dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center ${className}`}>
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-4">
          <Camera className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No posts yet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Start posting to see engagement insights
        </p>
        {showActions && (
          <button
            onClick={handleCreatePost}
            className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Post
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-[500px] flex items-center justify-center p-8 ${className}`}>
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-100 to-pink-100 dark:from-orange-900/20 dark:to-pink-900/20 rounded-2xl flex items-center justify-center mb-6">
          <Camera className="w-10 h-10 text-orange-600 dark:text-orange-400" />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Start posting to see engagement insights
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
          Once you start creating and publishing content, you'll be able to track engagement metrics, analyze performance, and discover growth opportunities.
        </p>

        {/* Action Cards */}
        {showActions && (
          <div className="grid grid-cols-1 gap-4 mb-8">
            <button
              onClick={handleCreatePost}
              className="group p-6 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all duration-200 transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6" />
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-lg mb-1">Create Your First Post</h3>
                  <p className="text-sm text-white/80">Start sharing your story with the world</p>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleViewTemplates}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Lightbulb className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Get Ideas</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-powered content suggestions</p>
                </div>
              </button>

              <button
                onClick={handleSchedulePost}
                className="p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="text-center">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">Schedule</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Plan your content calendar</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Insights Preview */}
        <div className="text-left bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
          <h3 className="font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target className="w-4 h-4" />
            What you'll learn once you start posting:
          </h3>
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <insight.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {insight.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {insight.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Encouragement */}
        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>✨ Every influencer started with their first post. What's yours going to be?</p>
        </div>
      </div>
    </div>
  );
};

export default NoPostsYet;