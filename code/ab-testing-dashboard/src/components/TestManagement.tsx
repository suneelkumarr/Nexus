import React, { useState } from 'react';
import {
  BeakerIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { ABTest } from '../types';
import { toast } from 'react-hot-toast';

const TestManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'all' | 'running' | 'completed' | 'draft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'startDate' | 'status' | 'priority'>('startDate');
  const [showTestModal, setShowTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  // Mock test data
  const [tests] = useState<ABTest[]>([
    {
      id: '1',
      name: 'Homepage Hero Button Color',
      description: 'Testing blue vs green CTA button color on homepage hero section',
      status: 'running',
      variantA: {
        id: 'a1',
        name: 'Control',
        description: 'Blue button',
        trafficAllocation: 50,
        conversionRate: 3.2,
        visitors: 2450,
        conversions: 78,
      },
      variantB: {
        id: 'b1',
        name: 'Green Button',
        description: 'Green button variant',
        trafficAllocation: 50,
        conversionRate: 3.8,
        visitors: 2430,
        conversions: 92,
      },
      targetAudience: {
        demographic: 'all',
        geographic: 'all',
        device: 'all',
        behavior: 'new_visitors',
      },
      metrics: {
        primary: 'conversion_rate',
        secondary: ['click_through_rate', 'time_on_page'],
      },
      startDate: '2025-10-15T00:00:00Z',
      duration: 14,
      minimumSampleSize: 1000,
      statisticalSignificance: 0.95,
      confidenceLevel: 95,
      createdAt: '2025-10-14T10:30:00Z',
      createdBy: 'user1',
      lastModified: '2025-10-30T14:20:00Z',
      tags: ['homepage', 'conversion', 'cta'],
      priority: 'high',
    },
    {
      id: '2',
      name: 'Product Page Layout Test',
      description: 'Comparing single-column vs multi-column product layout',
      status: 'running',
      variantA: {
        id: 'a2',
        name: 'Single Column',
        description: 'Vertical layout',
        trafficAllocation: 50,
        conversionRate: 4.1,
        visitors: 1890,
        conversions: 77,
      },
      variantB: {
        id: 'b2',
        name: 'Multi Column',
        description: 'Side-by-side layout',
        trafficAllocation: 50,
        conversionRate: 4.6,
        visitors: 1920,
        conversions: 88,
      },
      targetAudience: {
        demographic: '25-44',
        geographic: 'all',
        device: 'desktop',
        behavior: 'returning_customers',
      },
      metrics: {
        primary: 'conversion_rate',
        secondary: ['time_on_page', 'bounce_rate'],
      },
      startDate: '2025-10-20T00:00:00Z',
      duration: 21,
      minimumSampleSize: 1500,
      statisticalSignificance: 0.95,
      confidenceLevel: 95,
      createdAt: '2025-10-19T09:15:00Z',
      createdBy: 'user2',
      lastModified: '2025-10-30T11:45:00Z',
      tags: ['product_page', 'layout', 'desktop'],
      priority: 'medium',
    },
    {
      id: '3',
      name: 'Email Subject Line Test',
      description: 'Personalized vs generic subject lines',
      status: 'completed',
      variantA: {
        id: 'a3',
        name: 'Generic',
        description: 'Standard subject line',
        trafficAllocation: 50,
        conversionRate: 12.3,
        visitors: 5000,
        conversions: 615,
      },
      variantB: {
        id: 'b3',
        name: 'Personalized',
        description: 'Name-based personalization',
        trafficAllocation: 50,
        conversionRate: 15.1,
        visitors: 4950,
        conversions: 747,
      },
      targetAudience: {
        demographic: 'all',
        geographic: 'all',
        device: 'all',
        behavior: 'email_subscribers',
      },
      metrics: {
        primary: 'click_through_rate',
        secondary: ['conversion_rate'],
      },
      startDate: '2025-10-01T00:00:00Z',
      endDate: '2025-10-14T00:00:00Z',
      duration: 14,
      minimumSampleSize: 3000,
      statisticalSignificance: 0.99,
      confidenceLevel: 95,
      createdAt: '2025-09-30T16:00:00Z',
      createdBy: 'user1',
      lastModified: '2025-10-14T18:30:00Z',
      tags: ['email', 'subject_line', 'personalization'],
      priority: 'high',
    },
    {
      id: '4',
      name: 'Checkout Flow Optimization',
      description: 'One-page vs multi-step checkout process',
      status: 'running',
      variantA: {
        id: 'a4',
        name: 'Multi-step',
        description: 'Traditional checkout flow',
        trafficAllocation: 50,
        conversionRate: 2.1,
        visitors: 3200,
        conversions: 67,
      },
      variantB: {
        id: 'b4',
        name: 'One-page',
        description: 'Single page checkout',
        trafficAllocation: 50,
        conversionRate: 1.9,
        visitors: 3180,
        conversions: 60,
      },
      targetAudience: {
        demographic: 'all',
        geographic: 'all',
        device: 'all',
        behavior: 'cart_users',
      },
      metrics: {
        primary: 'conversion_rate',
        secondary: ['abandonment_rate', 'time_to_complete'],
      },
      startDate: '2025-10-25T00:00:00Z',
      duration: 28,
      minimumSampleSize: 2000,
      statisticalSignificance: 0.95,
      confidenceLevel: 95,
      createdAt: '2025-10-24T13:45:00Z',
      createdBy: 'user3',
      lastModified: '2025-10-30T09:20:00Z',
      tags: ['checkout', 'conversion', 'flow'],
      priority: 'critical',
    },
  ]);

  if (!hasPermission('view_tests')) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have permission to view tests.</p>
      </div>
    );
  }

  const filteredTests = tests.filter(test => {
    const matchesTab = selectedTab === 'all' || test.status === selectedTab;
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  const sortedTests = [...filteredTests].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'startDate':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      default:
        return 0;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayIcon className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <StopIcon className="h-4 w-4 text-blue-500" />;
      case 'draft':
        return <BeakerIcon className="h-4 w-4 text-gray-500" />;
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
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateLift = (test: ABTest) => {
    const control = test.variantA.conversionRate;
    const variant = test.variantB.conversionRate;
    return ((variant - control) / control * 100).toFixed(1);
  };

  const isWinner = (test: ABTest) => {
    const control = test.variantA.conversionRate;
    const variant = test.variantB.conversionRate;
    const lift = ((variant - control) / control * 100);
    return Math.abs(lift) > 5 && test.status === 'completed';
  };

  const handleTestAction = (testId: string, action: 'pause' | 'resume' | 'stop' | 'delete') => {
    switch (action) {
      case 'pause':
        toast.success('Test paused successfully');
        break;
      case 'resume':
        toast.success('Test resumed successfully');
        break;
      case 'stop':
        toast.success('Test stopped successfully');
        break;
      case 'delete':
        toast.success('Test deleted successfully');
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Test Management</h1>
          <p className="text-gray-600">Monitor and manage your A/B tests</p>
        </div>
        {hasPermission('create_tests') && (
          <button
            onClick={() => {
              // This would navigate to create test page
              toast('Navigate to create test page');
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BeakerIcon className="h-4 w-4 mr-2" />
            Create New Test
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div>
              <select
                value={selectedTab}
                onChange={(e) => setSelectedTab(e.target.value as any)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Tests ({tests.length})</option>
                <option value="running">Running ({tests.filter(t => t.status === 'running').length})</option>
                <option value="completed">Completed ({tests.filter(t => t.status === 'completed').length})</option>
                <option value="draft">Draft ({tests.filter(t => t.status === 'draft').length})</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="startDate">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              <input
                type="text"
                placeholder="Search tests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Tests ({sortedTests.length})
          </h3>
        </div>

        {sortedTests.length === 0 ? (
          <div className="text-center py-12">
            <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tests found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by creating your first A/B test.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedTests.map((test) => (
              <div key={test.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(test.status)}
                      <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                        {test.priority}
                      </span>
                      {isWinner(test) && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Winner
                        </span>
                      )}
                    </div>
                    
                    <p className="mt-1 text-sm text-gray-600 max-w-3xl">
                      {test.description}
                    </p>
                    
                    <div className="mt-3 flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Started: {new Date(test.startDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <UserGroupIcon className="h-4 w-4 mr-1" />
                        Target: {test.targetAudience.demographic || 'All'} • {test.targetAudience.device || 'All devices'}
                      </div>
                      <div className="flex items-center">
                        <ChartBarIcon className="h-4 w-4 mr-1" />
                        Sample: {(test.variantA.visitors + test.variantB.visitors).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-gray-500">Control:</span>
                        <span className="ml-1 font-medium">{test.variantA.conversionRate.toFixed(2)}%</span>
                        <span className="ml-1 text-gray-400">
                          ({test.variantA.conversions}/{test.variantA.visitors})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Variant:</span>
                        <span className="ml-1 font-medium">{test.variantB.conversionRate.toFixed(2)}%</span>
                        <span className="ml-1 text-gray-400">
                          ({test.variantB.conversions}/{test.variantB.visitors})
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Lift:</span>
                        <span className={`ml-1 font-medium ${parseFloat(calculateLift(test)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {parseFloat(calculateLift(test)) >= 0 ? '+' : ''}{calculateLift(test)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-2">
                      {test.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                        >
                          <TagIcon className="h-3 w-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTest(test);
                        setShowTestModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                      title="View details"
                    >
                      <EyeIcon className="h-5 w-5" />
                    </button>
                    
                    {hasPermission('edit_tests') && (
                      <button
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Edit test"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {test.status === 'running' && hasPermission('manage_tests') && (
                      <button
                        onClick={() => handleTestAction(test.id, 'pause')}
                        className="p-2 text-gray-400 hover:text-yellow-600"
                        title="Pause test"
                      >
                        <PauseIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {test.status === 'paused' && hasPermission('manage_tests') && (
                      <button
                        onClick={() => handleTestAction(test.id, 'resume')}
                        className="p-2 text-gray-400 hover:text-green-600"
                        title="Resume test"
                      >
                        <PlayIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {(test.status === 'running' || test.status === 'paused') && hasPermission('manage_tests') && (
                      <button
                        onClick={() => handleTestAction(test.id, 'stop')}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Stop test"
                      >
                        <StopIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    {hasPermission('delete_tests') && (
                      <button
                        onClick={() => handleTestAction(test.id, 'delete')}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Delete test"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Detail Modal */}
      {showTestModal && selectedTest && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedTest.name}</h3>
              <button
                onClick={() => setShowTestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900">Description</h4>
                <p className="text-sm text-gray-600">{selectedTest.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">Status</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTest.status)}`}>
                    {selectedTest.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Priority</h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedTest.priority)}`}>
                    {selectedTest.priority}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Performance Comparison</h4>
                <div className="mt-2 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Control (A)</h5>
                      <p className="text-lg font-semibold">{selectedTest.variantA.conversionRate.toFixed(2)}%</p>
                      <p className="text-sm text-gray-500">
                        {selectedTest.variantA.conversions} conversions / {selectedTest.variantA.visitors} visitors
                      </p>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">Variant (B)</h5>
                      <p className="text-lg font-semibold">{selectedTest.variantB.conversionRate.toFixed(2)}%</p>
                      <p className="text-sm text-gray-500">
                        {selectedTest.variantB.conversions} conversions / {selectedTest.variantB.visitors} visitors
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Overall Lift</span>
                      <span className={`text-lg font-semibold ${parseFloat(calculateLift(selectedTest)) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(calculateLift(selectedTest)) >= 0 ? '+' : ''}{calculateLift(selectedTest)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Target Audience</h4>
                <div className="text-sm text-gray-600">
                  <p>Demographics: {selectedTest.targetAudience.demographic || 'All'}</p>
                  <p>Device: {selectedTest.targetAudience.device || 'All'}</p>
                  <p>Region: {selectedTest.targetAudience.geographic || 'All'}</p>
                  <p>Behavior: {selectedTest.targetAudience.behavior || 'All users'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900">Tags</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTest.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestManagement;