import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Target, 
  Calculator, 
  CheckSquare, 
  TrendingUp,
  Menu,
  X,
  Activity,
  Lightbulb,
  Download,
  Settings
} from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ConversionDashboard } from './components/Dashboard/ConversionDashboard';
import { ABTestDashboard } from './components/A-BTesting/ABTestDashboard';
import { ROICalculator } from './components/ROICalculator/ROICalculator';
import { SuccessCriteriaValidator } from './components/Validation/SuccessCriteriaValidator';
import { UserBehaviorAnalytics } from './components/Analytics/UserBehaviorAnalytics';
import { Button } from './components/Shared/Button';
import { Badge } from './components/Shared/Badge';
import { cn } from './utils/analytics';

type TabType = 'dashboard' | 'behavior' | 'ab-testing' | 'validation' | 'roi';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
  description: string;
  color: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs: TabConfig[] = [
    {
      id: 'dashboard',
      label: 'Conversion Dashboard',
      icon: BarChart3,
      component: ConversionDashboard,
      description: 'Overview of conversion metrics and funnel analysis',
      color: 'bg-blue-500'
    },
    {
      id: 'behavior',
      label: 'User Behavior',
      icon: Users,
      component: UserBehaviorAnalytics,
      description: 'Detailed user behavior and engagement analytics',
      color: 'bg-green-500'
    },
    {
      id: 'ab-testing',
      label: 'A/B Testing',
      icon: Target,
      component: ABTestDashboard,
      description: 'A/B test results and statistical analysis',
      color: 'bg-purple-500'
    },
    {
      id: 'validation',
      label: 'Success Criteria',
      icon: CheckSquare,
      component: SuccessCriteriaValidator,
      description: 'Automated validation of conversion goals',
      color: 'bg-yellow-500'
    },
    {
      id: 'roi',
      label: 'ROI Calculator',
      icon: Calculator,
      component: ROICalculator,
      description: 'Return on investment analysis and projections',
      color: 'bg-indigo-500'
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);
  const ActiveComponent = activeTabConfig?.component || ConversionDashboard;

  const quickStats = [
    { label: 'Conversion Rate', value: '15.2%', trend: '+2.3%', positive: true },
    { label: 'Trial Conversions', value: '1,247', trend: '+18.5%', positive: true },
    { label: 'Active A/B Tests', value: '3', trend: '1 significant', positive: true },
    { label: 'ROI', value: '245%', trend: '+12.1%', positive: true }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Conversion Validation Framework
                  </h1>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Comprehensive analytics for Free to Pro conversion optimization
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="hidden lg:flex items-center space-x-6">
              {quickStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                  <div className="flex items-center space-x-1">
                    <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                    <Badge 
                      variant={stat.positive ? "default" : "destructive"} 
                      className="text-xs"
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={cn(
            "lg:w-64 bg-white rounded-lg shadow-sm border h-fit",
            sidebarOpen ? "block" : "hidden lg:block"
          )}>
            <div className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">Analytics Modules</h3>
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                        isActive 
                          ? "bg-blue-50 text-blue-700 border border-blue-200" 
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md",
                        isActive ? "bg-blue-100" : "bg-gray-100"
                      )}>
                        <Icon className={cn(
                          "h-4 w-4",
                          isActive ? "text-blue-600" : "text-gray-500"
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {tab.label}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {tab.description}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Generate Insights
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Activity className="h-4 w-4 mr-2" />
                  Real-time Monitor
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Tab Header */}
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-2">
                {activeTabConfig && (
                  <>
                    <div className={cn(
                      "p-2 rounded-lg",
                      activeTabConfig.color
                    )}>
                      <activeTabConfig.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {activeTabConfig.label}
                      </h2>
                      <p className="text-gray-600">
                        {activeTabConfig.description}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tab Navigation (Mobile) */}
            <div className="lg:hidden mb-6">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-1 flex flex-col items-center space-y-1 px-2 py-2 rounded-md text-xs font-medium transition-colors",
                        activeTab === tab.id 
                          ? "bg-white text-gray-900 shadow-sm" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="truncate">{tab.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Component Content */}
            <ActiveComponent />
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Conversion Validation Framework v1.0
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-500">All systems operational</span>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Last updated: {new Date().toLocaleDateString()}</span>
              <span>•</span>
              <span>Real-time data</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;