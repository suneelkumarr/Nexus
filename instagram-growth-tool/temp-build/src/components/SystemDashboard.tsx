import React, { useState } from 'react';
import { 
  Activity, 
  BarChart3, 
  Search, 
  Radio, 
  TestTube, 
  Shield
} from 'lucide-react';
import SystemOverview from './SystemOverview';
import PerformanceMonitor from './PerformanceMonitor';
import AdvancedSearch from './AdvancedSearch';
import RealTimeDashboard from './RealTimeDashboard';
import TestingSuite from './TestingSuite';
import AdminPanel from './AdminPanel';

interface SystemDashboardProps {
  className?: string;
}

const SystemDashboard: React.FC<SystemDashboardProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    {
      id: 'overview',
      label: 'System Overview',
      icon: Activity,
      component: SystemOverview
    },
    {
      id: 'performance',
      label: 'Performance Monitor',
      icon: BarChart3,
      component: PerformanceMonitor
    },
    {
      id: 'search',
      label: 'Advanced Search',
      icon: Search,
      component: AdvancedSearch
    },
    {
      id: 'realtime',
      label: 'Real-Time Updates',
      icon: Radio,
      component: RealTimeDashboard
    },
    {
      id: 'testing',
      label: 'Testing Suite',
      icon: TestTube,
      component: TestingSuite
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      icon: Shield,
      component: AdminPanel
    }
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || SystemOverview;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Dashboard</h1>
            <p className="text-gray-600">Platform enhancement and monitoring tools</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 min-h-[600px]">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default SystemDashboard;