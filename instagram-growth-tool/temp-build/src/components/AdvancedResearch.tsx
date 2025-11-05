import { useState } from 'react';
import { Search, Target, TrendingUp, FileCheck, Award, BarChart2 } from 'lucide-react';
import CompetitorAnalysis from './CompetitorAnalysis';
import InfluencerDiscovery from './InfluencerDiscovery';
import MarketResearch from './MarketResearch';
import HashtagMonitoring from './HashtagMonitoring';
import AccountAudit from './AccountAudit';
import BenchmarkingDashboard from './BenchmarkingDashboard';

type ResearchTab = 'competitors' | 'influencers' | 'market' | 'hashtags' | 'audit' | 'benchmarking';

interface AdvancedResearchProps {
  selectedAccount: string | null;
}

export default function AdvancedResearch({ selectedAccount }: AdvancedResearchProps) {
  const [activeTab, setActiveTab] = useState<ResearchTab>('competitors');

  const researchTabs = [
    {
      id: 'competitors',
      name: 'Competitor Analysis',
      icon: Target,
      description: 'Track and compare competitors',
      color: 'from-red-500 to-orange-600'
    },
    {
      id: 'influencers',
      name: 'Influencer Discovery',
      icon: Award,
      description: 'Find and track influencers',
      color: 'from-purple-500 to-pink-600'
    },
    {
      id: 'market',
      name: 'Market Research',
      icon: Search,
      description: 'Industry trends & insights',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'hashtags',
      name: 'Hashtag Monitoring',
      icon: TrendingUp,
      description: 'Track trending hashtags',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'audit',
      name: 'Account Audit',
      icon: FileCheck,
      description: 'Optimization suggestions',
      color: 'from-indigo-500 to-purple-600'
    },
    {
      id: 'benchmarking',
      name: 'Benchmarking',
      icon: BarChart2,
      description: 'Performance comparison',
      color: 'from-orange-500 to-red-600'
    }
  ] as const;

  const renderContent = () => {
    if (!selectedAccount) {
      return (
        <div className="flex items-center justify-center h-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Account Selected
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please select an Instagram account from the Accounts tab to access research tools.
            </p>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'competitors':
        return <CompetitorAnalysis selectedAccount={selectedAccount} />;
      case 'influencers':
        return <InfluencerDiscovery selectedAccount={selectedAccount} />;
      case 'market':
        return <MarketResearch selectedAccount={selectedAccount} />;
      case 'hashtags':
        return <HashtagMonitoring selectedAccount={selectedAccount} />;
      case 'audit':
        return <AccountAudit selectedAccount={selectedAccount} />;
      case 'benchmarking':
        return <BenchmarkingDashboard selectedAccount={selectedAccount} />;
      default:
        return <CompetitorAnalysis selectedAccount={selectedAccount} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Research Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Advanced Research & Intelligence
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {researchTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ResearchTab)}
                className={`
                  group relative p-6 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-br shadow-lg scale-105' 
                    : 'bg-gray-50 dark:bg-gray-700/50 hover:shadow-md hover:scale-102'
                  }
                  ${isActive ? tab.color : ''}
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className={`
                    p-3 rounded-lg
                    ${isActive 
                      ? 'bg-white/20' 
                      : 'bg-gray-200 dark:bg-gray-600 group-hover:bg-gray-300 dark:group-hover:bg-gray-500'
                    }
                    transition-colors duration-200
                  `}>
                    <Icon className={`
                      w-6 h-6
                      ${isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300'}
                    `} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className={`
                      font-semibold text-sm mb-1
                      ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}
                    `}>
                      {tab.name}
                    </h3>
                    <p className={`
                      text-xs
                      ${isActive ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}
                    `}>
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
}
