import { useState } from 'react';
import { Calendar, TrendingUp, Lightbulb, List, CheckSquare, LayoutDashboard } from 'lucide-react';
import ContentDashboard from './ContentDashboard';
import ContentCalendar from './ContentCalendar';
import PostRankings from './PostRankings';
import AIIdeasGenerator from './AIIdeasGenerator';
import BulkManagement from './BulkManagement';
import ApprovalWorkflow from './ApprovalWorkflow';

interface ContentManagementProps {
  selectedAccount: string | null;
}

type ContentTab = 'dashboard' | 'calendar' | 'rankings' | 'ideas' | 'bulk' | 'approvals';

export default function ContentManagement({ selectedAccount }: ContentManagementProps) {
  const [activeTab, setActiveTab] = useState<ContentTab>('dashboard');

  const tabs = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & quick actions',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      id: 'calendar', 
      name: 'Content Calendar', 
      icon: Calendar,
      description: 'Schedule & organize posts',
      color: 'from-purple-500 to-pink-600'
    },
    { 
      id: 'rankings', 
      name: 'Post Rankings', 
      icon: TrendingUp,
      description: 'Performance analysis',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      id: 'ideas', 
      name: 'AI Ideas', 
      icon: Lightbulb,
      description: 'Content suggestions',
      color: 'from-orange-500 to-red-600'
    },
    { 
      id: 'bulk', 
      name: 'Bulk Actions', 
      icon: List,
      description: 'Manage multiple posts',
      color: 'from-indigo-500 to-purple-600'
    },
    { 
      id: 'approvals', 
      name: 'Approvals', 
      icon: CheckSquare,
      description: 'Review & approve content',
      color: 'from-pink-500 to-rose-600'
    },
  ] as const;

  if (!selectedAccount) {
    return (
      <div className="p-8">
        <div className="text-center py-16">
          <div className="relative mx-auto max-w-md">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 dark:from-purple-900/30 dark:via-pink-900/20 dark:to-blue-900/30 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-12">
              
              <div className="relative mx-auto w-20 h-20 mb-8">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl animate-pulse"></div>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-10 h-10 text-purple-500" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Content Management System
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Select an Instagram account from the Accounts tab to access content scheduling, performance rankings, AI ideas, and more.
              </p>
              
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200/50 dark:border-purple-700/50">
                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-4">
                  Features Available:
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <div key={tab.id} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 bg-gradient-to-r ${tab.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left">
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
      case 'dashboard':
        return <ContentDashboard accountId={selectedAccount} />;
      case 'calendar':
        return <ContentCalendar accountId={selectedAccount} />;
      case 'rankings':
        return <PostRankings accountId={selectedAccount} />;
      case 'ideas':
        return <AIIdeasGenerator accountId={selectedAccount} />;
      case 'bulk':
        return <BulkManagement accountId={selectedAccount} />;
      case 'approvals':
        return <ApprovalWorkflow accountId={selectedAccount} />;
      default:
        return <ContentDashboard accountId={selectedAccount} />;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Premium Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ContentTab)}
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
