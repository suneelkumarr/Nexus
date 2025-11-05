import { useState, useEffect } from 'react';
import { Users, Shield, Download, Bell, Share2, Settings, Plus, Search, Filter } from 'lucide-react';
import TeamManagement from './TeamManagement';
import TeamMembers from './TeamMembers';
import UserPermissions from './UserPermissions';
import ExportTemplates from './ExportTemplates';
import NotificationCenter from './NotificationCenter';
import SocialPlatforms from './SocialPlatforms';
import DashboardCustomization from './DashboardCustomization';

type CollaborationTabType = 'teams' | 'members' | 'permissions' | 'exports' | 'notifications' | 'platforms' | 'customization';

interface CollaborationProps {
  selectedAccount: string | null;
}

export default function CollaborationDashboard({ selectedAccount }: CollaborationProps) {
  const [activeTab, setActiveTab] = useState<CollaborationTabType>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const tabs = [
    {
      id: 'teams',
      name: 'Team Management',
      icon: Users,
      description: 'Create and manage teams',
      color: 'from-blue-500 to-indigo-600',
      count: 0
    },
    {
      id: 'members',
      name: 'Team Members',
      icon: Shield,
      description: 'Manage member roles',
      color: 'from-purple-500 to-violet-600',
      count: 0
    },
    {
      id: 'permissions',
      name: 'Permissions',
      icon: Shield,
      description: 'Access control',
      color: 'from-green-500 to-emerald-600',
      count: 0
    },
    {
      id: 'exports',
      name: 'Export Templates',
      icon: Download,
      description: 'Custom export formats',
      color: 'from-orange-500 to-amber-600',
      count: 0
    },
    {
      id: 'notifications',
      name: 'Notifications',
      icon: Bell,
      description: 'Team communication',
      color: 'from-red-500 to-rose-600',
      count: 0
    },
    {
      id: 'platforms',
      name: 'Social Platforms',
      icon: Share2,
      description: 'Multi-platform sync',
      color: 'from-cyan-500 to-blue-600',
      count: 0
    },
    {
      id: 'customization',
      name: 'Customization',
      icon: Settings,
      description: 'Dashboard themes',
      color: 'from-pink-500 to-rose-600',
      count: 0
    }
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'teams':
        return <TeamManagement selectedAccount={selectedAccount} />;
      case 'members':
        return <TeamMembers selectedAccount={selectedAccount} />;
      case 'permissions':
        return <UserPermissions selectedAccount={selectedAccount} />;
      case 'exports':
        return <ExportTemplates selectedAccount={selectedAccount} />;
      case 'notifications':
        return <NotificationCenter selectedAccount={selectedAccount} />;
      case 'platforms':
        return <SocialPlatforms selectedAccount={selectedAccount} />;
      case 'customization':
        return <DashboardCustomization selectedAccount={selectedAccount} />;
      default:
        return <TeamManagement selectedAccount={selectedAccount} />;
    }
  };

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Team Collaboration Hub
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage teams, permissions, and collaborative workflows
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>

            {/* Quick Add */}
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Quick Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  <span>{tab.name}</span>
                  {tab.count > 0 && (
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Current Tab Header */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {currentTab && (
                  <>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${currentTab.color}`}>
                      <currentTab.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {currentTab.name}
                      </h2>
                      <p className="text-gray-600 dark:text-gray-400">
                        {currentTab.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div 
              key={activeTab}
              className="animate-fadeIn"
            >
              {renderTabContent()}
            </div>
          </div>
        </div>
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
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}