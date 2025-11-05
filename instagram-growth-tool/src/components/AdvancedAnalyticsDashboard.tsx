import { useState } from 'react';
import { TrendingUp, BarChart3, Users, Hash, Video } from 'lucide-react';
import FollowerGrowthChart from './FollowerGrowthChart';
import PostPerformanceAnalytics from './PostPerformanceAnalytics';
import AudienceDemographics from './AudienceDemographics';
import HashtagAnalytics from './HashtagAnalytics';
import StoriesReelsAnalytics from './StoriesReelsAnalytics';

interface AdvancedAnalyticsDashboardProps {
  selectedAccount: string | null;
}

type AnalyticsTab = 'growth' | 'posts' | 'audience' | 'hashtags' | 'stories';

export default function AdvancedAnalyticsDashboard({ selectedAccount }: AdvancedAnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('growth');

  const tabs = [
    { 
      id: 'growth', 
      name: 'Follower Growth', 
      icon: TrendingUp,
      description: 'Track audience growth trends',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      id: 'posts', 
      name: 'Post Performance', 
      icon: BarChart3,
      description: 'Analyze content engagement',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'audience', 
      name: 'Demographics', 
      icon: Users,
      description: 'Know your audience',
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      id: 'hashtags', 
      name: 'Hashtag Analytics', 
      icon: Hash,
      description: 'Optimize hashtag strategy',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'stories', 
      name: 'Stories & Reels', 
      icon: Video,
      description: 'Track ephemeral content',
      color: 'from-orange-500 to-red-600'
    },
  ] as const;

  if (!selectedAccount) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/20 dark:to-pink-900/30 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
              
              {/* Animated Icon */}
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-blue-500" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Advanced Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Select an Instagram account from the Accounts tab to access comprehensive analytics, growth insights, and performance metrics.
              </p>
              
              {/* Features List */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200/50 dark:border-blue-700/50">
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-4">
                  What You'll Get:
                </h4>
                <div className="space-y-3 text-left">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div key={tab.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${tab.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{tab.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{tab.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'growth':
        return <FollowerGrowthChart accountId={selectedAccount} />;
      case 'posts':
        return <PostPerformanceAnalytics accountId={selectedAccount} />;
      case 'audience':
        return <AudienceDemographics accountId={selectedAccount} />;
      case 'hashtags':
        return <HashtagAnalytics accountId={selectedAccount} />;
      case 'stories':
        return <StoriesReelsAnalytics accountId={selectedAccount} />;
      default:
        return <FollowerGrowthChart accountId={selectedAccount} />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Premium Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AnalyticsTab)}
                className={`relative p-4 rounded-xl text-left transition-all duration-300 group ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg transform scale-105`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isActive 
                        ? 'text-white' 
                        : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                    }`} />
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className={`font-semibold text-sm ${
                  isActive ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}>
                  {tab.name}
                </div>
                <div className={`text-xs mt-1 ${
                  isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {tab.description}
                </div>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute bottom-0 left-4 right-4 h-1 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content with Animation */}
      <div 
        key={activeTab}
        className="animate-fadeIn"
        style={{
          animation: 'fadeIn 0.5s ease-out'
        }}
      >
        {renderTabContent()}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
