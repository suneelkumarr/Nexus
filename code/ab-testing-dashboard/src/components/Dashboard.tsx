import React from 'react';
import {
  BeakerIcon,
  ChartBarIcon,
  TrophyIcon,
  CurrencyDollarIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { DashboardMetrics } from '../types';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, changeType, icon: Icon }) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    if (changeType === 'increase') return '↗';
    if (changeType === 'decrease') return '↘';
    return '→';
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8 text-indigo-600" />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{value}</div>
              {change && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${getChangeColor()}`}>
                  <span className="text-xs">{getChangeIcon()}</span>
                  <span className="ml-1">{change}</span>
                </div>
              )}
            </dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in a real app, this would come from an API
  const metrics: DashboardMetrics = {
    totalTests: 47,
    activeTests: 12,
    completedTests: 31,
    avgConversionLift: 15.3,
    totalRevenue: 234000,
    winningTests: 23,
    runningTests: 12,
    scheduledTests: 4,
    pausedTests: 2,
    cancelledTests: 1,
    draftsCount: 3,
    recentActivity: [],
    performanceSummary: {
      thisWeek: {
        testsStarted: 3,
        testsCompleted: 2,
        avgLift: 12.5,
        revenueGenerated: 45000
      },
      thisMonth: {
        testsStarted: 12,
        testsCompleted: 8,
        avgLift: 15.3,
        revenueGenerated: 180000
      }
    }
  };

  const recentTests = [
    {
      id: '1',
      name: 'Homepage Hero Button Color',
      status: 'running',
      startDate: '2025-10-15',
      conversionLift: 8.5,
      confidence: 95,
    },
    {
      id: '2',
      name: 'Product Page Layout',
      status: 'running',
      startDate: '2025-10-20',
      conversionLift: 12.1,
      confidence: 89,
    },
    {
      id: '3',
      name: 'Email Subject Line Test',
      status: 'completed',
      startDate: '2025-10-01',
      conversionLift: 18.7,
      confidence: 97,
    },
    {
      id: '4',
      name: 'Checkout Flow Optimization',
      status: 'running',
      startDate: '2025-10-25',
      conversionLift: -2.3,
      confidence: 78,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <BeakerIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Message */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your A/B tests today. Track performance, manage experiments, and make data-driven decisions.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tests"
          value={metrics.totalTests}
          change="+12% vs last month"
          changeType="increase"
          icon={BeakerIcon}
        />
        <MetricCard
          title="Active Tests"
          value={metrics.activeTests}
          change="2 new this week"
          changeType="increase"
          icon={PlayIcon}
        />
        <MetricCard
          title="Winning Tests"
          value={metrics.winningTests}
          change={`${((metrics.winningTests / metrics.completedTests) * 100).toFixed(1)}% win rate`}
          changeType="increase"
          icon={TrophyIcon}
        />
        <MetricCard
          title="Revenue Impact"
          value={`$${(metrics.totalRevenue / 1000).toFixed(0)}K`}
          change="+23.5% this month"
          changeType="increase"
          icon={CurrencyDollarIcon}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Performance Overview</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Conversion Rate</span>
              <span className="text-sm font-bold text-green-600">+15.3%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '76.5%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Statistical Significance</span>
              <span className="text-sm font-bold text-blue-600">92.4%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92.4%' }}></div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Test Completion Rate</span>
              <span className="text-sm font-bold text-purple-600">78.9%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full" style={{ width: '78.9%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Test Activity</h3>
          <div className="space-y-4">
            {recentTests.slice(0, 4).map((test) => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(test.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{test.name}</p>
                    <p className="text-xs text-gray-500">Started: {test.startDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs px-2 py-1 rounded-full ${getStatusColor(test.status)}`}>
                    {test.status}
                  </p>
                  <p className={`text-sm font-medium mt-1 ${
                    test.conversionLift > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {test.conversionLift > 0 ? '+' : ''}{test.conversionLift}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <BeakerIcon className="h-5 w-5 mr-2" />
            Create New Test
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            View Analytics
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Statistical Calculator
          </button>
          <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <CurrencyDollarIcon className="h-5 w-5 mr-2" />
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;