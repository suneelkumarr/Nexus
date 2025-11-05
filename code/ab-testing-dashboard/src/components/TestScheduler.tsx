import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  TrashIcon,
  PlusIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  CogIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { ABTest, ScheduledAction, BulkOperation } from '../types';

const scheduleSchema = z.object({
  testIds: z.array(z.string()).min(1, 'Select at least one test'),
  action: z.enum(['start', 'stop', 'pause', 'resume', 'clone', 'archive']),
  scheduledTime: z.string().min(1, 'Scheduled time is required'),
  timezone: z.string().default('UTC'),
  reason: z.string().min(5, 'Reason is required'),
  conditions: z.object({
    minSampleSize: z.boolean().default(false),
    statisticalSignificance: z.boolean().default(false),
    minDuration: z.number().optional(),
    timeOfDay: z.string().optional(),
    dayOfWeek: z.string().optional(),
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    slack: z.boolean().default(false),
    webhook: z.boolean().default(false),
    recipients: z.array(z.string()).default([]),
  }),
  metadata: z.object({
    priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
    maxRetries: z.number().min(0).max(5).default(3),
    timeoutMinutes: z.number().min(1).max(120).default(30),
    rollbackOnFailure: z.boolean().default(true),
  }),
});

type ScheduleFormData = z.infer<typeof scheduleSchema>;

const TestScheduler: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'schedule' | 'manage' | 'bulk' | 'history'>('schedule');
  const [scheduledActions, setScheduledActions] = useState<ScheduledAction[]>([]);
  const [bulkOperations, setBulkOperations] = useState<BulkOperation[]>([]);
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTests, setSelectedTests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState('UTC');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      testIds: [],
      action: 'start',
      scheduledTime: '',
      timezone: 'UTC',
      reason: '',
      conditions: {
        minSampleSize: false,
        statisticalSignificance: false,
      },
      notifications: {
        email: true,
        slack: false,
        webhook: false,
        recipients: [],
      },
      metadata: {
        priority: 'normal',
        maxRetries: 3,
        timeoutMinutes: 30,
        rollbackOnFailure: true,
      },
    },
  });

  const { fields: notificationFields, append: appendNotification, remove: removeNotification } = useFieldArray({
    control,
    name: 'notifications.recipients',
  });

  // Mock data
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Homepage CTA Test',
        description: 'Testing CTA button colors',
        hypothesis: 'Green buttons will perform better',
        status: 'running',
        category: 'Landing Page',
        priority: 'high',
        variants: [
          {
            id: 'control',
            name: 'Blue Button',
            description: 'Current blue CTA',
            trafficAllocation: 50,
            isControl: true,
            conversionRate: 2.3,
            visitors: 1247,
            conversions: 29,
            revenue: 1450,
            config: {},
            color: '#3B82F6',
          },
          {
            id: 'variant_a',
            name: 'Green Button',
            description: 'New green CTA',
            trafficAllocation: 50,
            isControl: false,
            conversionRate: 2.8,
            visitors: 1289,
            conversions: 36,
            revenue: 1800,
            config: {},
            color: '#10B981',
          },
        ],
        targetAudience: {
          percentage: 100,
          device: { desktop: true, mobile: true, tablet: true },
        },
        metrics: [
          {
            id: 'primary',
            name: 'Conversion Rate',
            type: 'conversion',
            eventName: 'signup',
            aggregation: 'percentage',
            isPrimary: true,
            unit: '%',
          },
        ],
        startDate: new Date().toISOString(),
        duration: 0,
        minimumSampleSize: 1000,
        statisticalSignificance: 5,
        confidenceLevel: 95,
        statisticalPower: 80,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
        lastModified: new Date().toISOString(),
        owner: user?.id || '1',
        collaborators: [],
        tags: ['cta', 'homepage'],
        isArchived: false,
      },
      {
        id: 'test_2',
        name: 'Pricing Page Test',
        description: 'Testing pricing layout',
        hypothesis: 'Multi-column layout will increase conversions',
        status: 'paused',
        category: 'Pricing',
        priority: 'medium',
        variants: [
          {
            id: 'control',
            name: 'Single Column',
            description: 'Current layout',
            trafficAllocation: 50,
            isControl: true,
            conversionRate: 1.8,
            visitors: 856,
            conversions: 15,
            revenue: 2250,
            config: {},
            color: '#8B5CF6',
          },
          {
            id: 'variant_a',
            name: 'Multi Column',
            description: 'New layout',
            trafficAllocation: 50,
            isControl: false,
            conversionRate: 2.1,
            visitors: 834,
            conversions: 18,
            revenue: 2700,
            config: {},
            color: '#F59E0B',
          },
        ],
        targetAudience: {
          percentage: 75,
          device: { desktop: true, mobile: false, tablet: false },
        },
        metrics: [
          {
            id: 'primary',
            name: 'Conversion Rate',
            type: 'conversion',
            eventName: 'purchase',
            aggregation: 'percentage',
            isPrimary: true,
            unit: '%',
          },
        ],
        startDate: new Date().toISOString(),
        duration: 0,
        minimumSampleSize: 500,
        statisticalSignificance: 5,
        confidenceLevel: 95,
        statisticalPower: 80,
        createdAt: new Date().toISOString(),
        createdBy: user?.id || '1',
        lastModified: new Date().toISOString(),
        owner: user?.id || '1',
        collaborators: [],
        tags: ['pricing', 'layout'],
        isArchived: false,
      },
    ];

    const mockScheduledActions: ScheduledAction[] = [
      {
        id: 'sched_1',
        testId: 'test_1',
        action: 'pause',
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC',
        status: 'scheduled',
        createdBy: user?.id || '1',
        reason: 'Pause for maintenance window',
        metadata: { priority: 'normal' },
      },
      {
        id: 'sched_2',
        testId: 'test_2',
        action: 'resume',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        timezone: 'UTC',
        status: 'scheduled',
        createdBy: user?.id || '1',
        reason: 'Resume after maintenance',
        metadata: { priority: 'high' },
      },
    ];

    const mockBulkOperations: BulkOperation[] = [
      {
        id: 'bulk_1',
        type: 'pause',
        testIds: ['test_1', 'test_2'],
        status: 'processing',
        progress: 75,
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdBy: user?.id || '1',
      },
    ];

    setTests(mockTests);
    setScheduledActions(mockScheduledActions);
    setBulkOperations(mockBulkOperations);
  }, [user]);

  const onSubmit = async (data: ScheduleFormData) => {
    if (!hasPermission('schedule_tests')) {
      toast.error('You do not have permission to schedule tests');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create scheduled actions for each selected test
      const newScheduledActions: ScheduledAction[] = data.testIds.map(testId => ({
        id: `sched_${Date.now()}_${testId}`,
        testId,
        action: data.action,
        scheduledAt: new Date(data.scheduledTime).toISOString(),
        timezone: data.timezone,
        status: 'scheduled',
        createdBy: user!.id,
        reason: data.reason,
        metadata: {
          ...data.conditions,
          ...data.notifications,
          ...data.metadata,
        },
      }));

      setScheduledActions(prev => [...newScheduledActions, ...prev]);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`${data.testIds.length} test(s) scheduled successfully`);
      reset();
    } catch (error) {
      console.error('Scheduling error:', error);
      toast.error('Failed to schedule tests');
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeBulkOperation = async (type: BulkOperation['type'], testIds: string[]) => {
    if (!hasPermission('bulk_operations')) {
      toast.error('You do not have permission for bulk operations');
      return;
    }

    const newOperation: BulkOperation = {
      id: `bulk_${Date.now()}`,
      type,
      testIds,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
      createdBy: user!.id,
    };

    setBulkOperations(prev => [newOperation, ...prev]);

    // Simulate bulk operation execution
    const interval = setInterval(() => {
      setBulkOperations(prev => prev.map(op => 
        op.id === newOperation.id 
          ? { ...op, progress: Math.min(op.progress + 10, 100) }
          : op
      ));
    }, 500);

    setTimeout(() => {
      clearInterval(interval);
      setBulkOperations(prev => prev.map(op => 
        op.id === newOperation.id 
          ? { ...op, status: 'completed', progress: 100 }
          : op
      ));
      
      // Update test statuses based on operation
      setTests(prev => prev.map(test => 
        testIds.includes(test.id) 
          ? { 
              ...test, 
              status: type === 'pause' ? 'paused' : 
                     type === 'resume' ? 'running' :
                     type === 'stop' ? 'completed' :
                     test.status 
            }
          : test
      ));

      toast.success(`Bulk ${type} operation completed for ${testIds.length} test(s)`);
    }, 5000);
  };

  const cancelScheduledAction = async (actionId: string) => {
    try {
      setScheduledActions(prev => prev.map(action => 
        action.id === actionId 
          ? { ...action, status: 'cancelled' as const }
          : action
      ));
      toast.success('Scheduled action cancelled');
    } catch (error) {
      toast.error('Failed to cancel scheduled action');
    }
  };

  const cloneTest = async (testId: string) => {
    if (!hasPermission('clone_tests')) {
      toast.error('You do not have permission to clone tests');
      return;
    }

    try {
      const originalTest = tests.find(t => t.id === testId);
      if (!originalTest) return;

      const clonedTest: ABTest = {
        ...originalTest,
        id: `${originalTest.id}_copy_${Date.now()}`,
        name: `${originalTest.name} (Copy)`,
        status: 'draft',
        startDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      setTests(prev => [clonedTest, ...prev]);
      toast.success('Test cloned successfully');
    } catch (error) {
      toast.error('Failed to clone test');
    }
  };

  const filteredScheduledActions = useMemo(() => {
    return scheduledActions.filter(action => {
      const test = tests.find(t => t.id === action.testId);
      const testName = test?.name?.toLowerCase() || '';
      
      const matchesSearch = !searchQuery || testName.includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || action.status === filterStatus;
      const matchesAction = filterAction === 'all' || action.action === filterAction;
      
      return matchesSearch && matchesStatus && matchesAction;
    });
  }, [scheduledActions, tests, searchQuery, filterStatus, filterAction]);

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
  ];

  const getStatusIcon = (status: ScheduledAction['status']) => {
    switch (status) {
      case 'scheduled':
        return <ClockIcon className="h-4 w-4 text-blue-500" />;
      case 'executing':
        return <ArrowPathIcon className="h-4 w-4 text-yellow-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: ScheduledAction['action']) => {
    switch (action) {
      case 'start':
        return 'bg-green-100 text-green-800';
      case 'stop':
        return 'bg-red-100 text-red-800';
      case 'pause':
        return 'bg-yellow-100 text-yellow-800';
      case 'resume':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <CalendarIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Scheduler</h1>
            <p className="text-gray-600 mt-1">
              Schedule test operations, manage bulk actions, and automate test workflows
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2">
          {[
            { tab: 'schedule', label: 'Schedule Test', icon: CalendarIcon },
            { tab: 'manage', label: 'Manage Schedules', icon: CogIcon },
            { tab: 'bulk', label: 'Bulk Operations', icon: FunnelIcon },
            { tab: 'history', label: 'History', icon: DocumentDuplicateIcon },
          ].map(({ tab, label, icon: Icon }) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Test Tab */}
      {selectedTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Test Selection */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Tests</h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {tests.filter(test => 
                    test.status === 'running' || test.status === 'paused' || test.status === 'draft'
                  ).map(test => (
                    <label key={test.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        value={test.id}
                        {...register('testIds')}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{test.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            test.status === 'running' ? 'bg-green-100 text-green-800' :
                            test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {test.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{test.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.testIds && (
                  <p className="text-sm text-red-600 mt-2">{errors.testIds.message}</p>
                )}
              </div>

              {/* Action Configuration */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Action Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Action *
                    </label>
                    <select
                      {...register('action')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="start">Start Test</option>
                      <option value="pause">Pause Test</option>
                      <option value="resume">Resume Test</option>
                      <option value="stop">Stop Test</option>
                      <option value="clone">Clone Test</option>
                      <option value="archive">Archive Test</option>
                    </select>
                    {errors.action && (
                      <p className="text-sm text-red-600 mt-1">{errors.action.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      {...register('metadata.priority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason *
                  </label>
                  <textarea
                    {...register('reason')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Explain why this action is needed"
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600 mt-1">{errors.reason.message}</p>
                  )}
                </div>
              </div>

              {/* Scheduling */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Scheduling</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scheduled Date & Time *
                    </label>
                    <input
                      {...register('scheduledTime')}
                      type="datetime-local"
                      min={new Date().toISOString().slice(0, 16)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                    {errors.scheduledTime && (
                      <p className="text-sm text-red-600 mt-1">{errors.scheduledTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      {...register('timezone')}
                      value={selectedTimezone}
                      onChange={(e) => setSelectedTimezone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      {timezones.map(tz => (
                        <option key={tz} value={tz}>{tz}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Conditions */}
                <details className="mt-4">
                  <summary className="text-sm text-indigo-600 hover:text-indigo-800 cursor-pointer">
                    Advanced Conditions
                  </summary>
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center">
                      <input
                        {...register('conditions.minSampleSize')}
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Only execute when minimum sample size is reached
                      </span>
                    </label>

                    <label className="flex items-center">
                      <input
                        {...register('conditions.statisticalSignificance')}
                        type="checkbox"
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Only execute when statistical significance is achieved
                      </span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Duration (days)
                      </label>
                      <input
                        {...register('conditions.minDuration')}
                        type="number"
                        min="1"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </details>
              </div>

              {/* Notifications */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      {...register('notifications.email')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('notifications.slack')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Slack notifications</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('notifications.webhook')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Webhook notifications</span>
                  </label>
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Schedule {watch('testIds')?.length || 0} Test(s)
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setValue('action', 'pause');
                    setValue('reason', 'Quick pause for maintenance');
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <PauseIcon className="h-4 w-4 mr-2" />
                  Quick Pause All
                </button>
                
                <button
                  onClick={() => {
                    setValue('action', 'resume');
                    setValue('reason', 'Quick resume after maintenance');
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlayIcon className="h-4 w-4 mr-2" />
                  Quick Resume All
                </button>
                
                <button
                  onClick={() => {
                    setValue('action', 'stop');
                    setValue('reason', 'Stop all running tests');
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop All Running
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tests:</span>
                  <span className="font-medium">{tests.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scheduled Actions:</span>
                  <span className="font-medium">{scheduledActions.filter(a => a.status === 'scheduled').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Operations:</span>
                  <span className="font-medium">{bulkOperations.filter(b => b.status === 'processing').length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Schedules Tab */}
      {selectedTab === 'manage' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="executing">Executing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Actions</option>
                <option value="start">Start</option>
                <option value="pause">Pause</option>
                <option value="resume">Resume</option>
                <option value="stop">Stop</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredScheduledActions.length} of {scheduledActions.length} actions
            </div>
          </div>

          {/* Scheduled Actions List */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Scheduled Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScheduledActions.map((action) => {
                    const test = tests.find(t => t.id === action.testId);
                    return (
                      <tr key={action.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BeakerIcon className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {test?.name || 'Unknown Test'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {test?.category || 'No category'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(action.action)}`}>
                            {action.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(action.scheduledAt).toLocaleString()}
                          <div className="text-xs text-gray-500">{action.timezone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(action.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">{action.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {action.reason}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {action.status === 'scheduled' && (
                            <button
                              onClick={() => cancelScheduledAction(action.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredScheduledActions.length === 0 && (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Actions</h3>
                <p className="text-gray-600">No scheduled actions match your current filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bulk Operations Tab */}
      {selectedTab === 'bulk' && (
        <div className="space-y-6">
          {/* Bulk Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Test Selection</h3>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedTests(tests.filter(t => t.status === 'running').map(t => t.id))}
                  className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200"
                >
                  Select All Running
                </button>
                
                <button
                  onClick={() => setSelectedTests(tests.filter(t => t.status === 'paused').map(t => t.id))}
                  className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                >
                  Select All Paused
                </button>
                
                <button
                  onClick={() => setSelectedTests([])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded hover:bg-gray-200"
                >
                  Clear Selection
                </button>
              </div>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {tests.map(test => (
                  <label key={test.id} className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedTests.includes(test.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTests(prev => [...prev, test.id]);
                        } else {
                          setSelectedTests(prev => prev.filter(id => id !== test.id));
                        }
                      }}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{test.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          test.status === 'running' ? 'bg-green-100 text-green-800' :
                          test.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.status}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {selectedTests.length > 0 && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-800">
                    {selectedTests.length} test(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Bulk Operations */}
          {selectedTests.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { action: 'pause', label: 'Pause Tests', color: 'bg-yellow-600 hover:bg-yellow-700', icon: PauseIcon },
                { action: 'resume', label: 'Resume Tests', color: 'bg-green-600 hover:bg-green-700', icon: PlayIcon },
                { action: 'stop', label: 'Stop Tests', color: 'bg-red-600 hover:bg-red-700', icon: StopIcon },
                { action: 'clone', label: 'Clone Tests', color: 'bg-blue-600 hover:bg-blue-700', icon: DocumentDuplicateIcon },
                { action: 'archive', label: 'Archive Tests', color: 'bg-gray-600 hover:bg-gray-700', icon: ArchiveIcon },
              ].map(({ action, label, color, icon: Icon }) => (
                <button
                  key={action}
                  onClick={() => executeBulkOperation(action as any, selectedTests)}
                  disabled={!hasPermission('bulk_operations')}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg text-white font-medium ${color} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Active Operations */}
          {bulkOperations.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Bulk Operations</h3>
              
              <div className="space-y-4">
                {bulkOperations.map(operation => (
                  <div key={operation.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <ArrowPathIcon className={`h-5 w-5 mr-2 ${
                          operation.status === 'processing' ? 'animate-spin text-blue-500' : 'text-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900 capitalize">
                          Bulk {operation.type} Operation
                        </span>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        operation.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {operation.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      {operation.testIds.length} test(s) • 
                      Started {new Date(operation.createdAt).toLocaleString()}
                    </div>
                    
                    {operation.status === 'processing' && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${operation.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Operation History</h3>
            
            <div className="text-center py-12">
              <DocumentDuplicateIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">History Coming Soon</h3>
              <p className="text-gray-600">
                Detailed operation history and audit logs will be available in a future update
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestScheduler;
