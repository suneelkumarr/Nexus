import { useState } from 'react';
import { Sparkles, Lightbulb, Clock, Hash, TrendingUp, FileText, Wand2 } from 'lucide-react';
import AIContentSuggestions from './AIContentSuggestions';
import PostingOptimization from './PostingOptimization';
import SmartHashtagRecommendations from './SmartHashtagRecommendations';
import PerformancePredictions from './PerformancePredictions';
import ContentVariations from './ContentVariations';
import IntelligentReports from './IntelligentReports';

interface AIInsightsProps {
  selectedAccount: string | null;
}

type AITab = 'suggestions' | 'optimization' | 'hashtags' | 'predictions' | 'variations' | 'reports';

export default function AIInsights({ selectedAccount }: AIInsightsProps) {
  const [activeTab, setActiveTab] = useState<AITab>('suggestions');

  const tabs = [
    { id: 'suggestions', name: 'Content Suggestions', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
    { id: 'optimization', name: 'Posting Optimization', icon: Clock, color: 'from-blue-500 to-cyan-500' },
    { id: 'hashtags', name: 'Smart Hashtags', icon: Hash, color: 'from-pink-500 to-rose-500' },
    { id: 'predictions', name: 'Performance Predictions', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'variations', name: 'Content Variations', icon: Wand2, color: 'from-purple-500 to-indigo-500' },
    { id: 'reports', name: 'Intelligent Reports', icon: FileText, color: 'from-cyan-500 to-teal-500' },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'suggestions':
        return <AIContentSuggestions selectedAccount={selectedAccount} />;
      case 'optimization':
        return <PostingOptimization selectedAccount={selectedAccount} />;
      case 'hashtags':
        return <SmartHashtagRecommendations selectedAccount={selectedAccount} />;
      case 'predictions':
        return <PerformancePredictions selectedAccount={selectedAccount} />;
      case 'variations':
        return <ContentVariations selectedAccount={selectedAccount} />;
      case 'reports':
        return <IntelligentReports selectedAccount={selectedAccount} />;
      default:
        return <AIContentSuggestions selectedAccount={selectedAccount} />;
    }
  };

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Select an Account
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Choose an Instagram account to access AI-powered insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8" />
          <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
        </div>
        <p className="text-cyan-100">
          Leverage artificial intelligence to optimize your content strategy and maximize engagement
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg text-center transition-all duration-200 ${
                  isActive
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-xs font-medium ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
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
