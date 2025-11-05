import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  TrendingUp as TrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { ABTest, TestResult, StatisticalResult, RealTimeUpdate, DashboardConfig } from '../types';

interface RealTimeMonitorProps {
  selectedTest?: ABTest;
  onTestSelect?: (test: ABTest) => void;
  onUpdateTest?: (test: ABTest) => void;
}

interface LiveMetrics {
  totalVisitors: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  revenuePerVisitor: number;
  currentTime: string;
  lastUpdate: string;
}

interface ChartDataPoint {
  time: string;
  timestamp: number;
  [variantId: string]: any;
}

const RealTimeMonitor: React.FC<RealTimeMonitorProps> = ({
  selectedTest,
  onTestSelect,
  onUpdateTest,
}) => {
  const { user, hasPermission } = useAuth();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [liveData, setLiveData] = useState<Map<string, TestResult>>(new Map());
  const [metrics, setMetrics] = useState<Map<string, LiveMetrics>>(new Map());
  const [chartData, setChartData] = useState<Map<string, ChartDataPoint[]>>(new Map());
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(10); // seconds
  const [config, setConfig] = useState<DashboardConfig>({
    refreshInterval: 10,
    defaultTimeRange: '24h',
    showSampleSizeWarnings: true,
    showStatisticalSignificanceBadges: true,
    autoRefresh: true,
    chartType: 'line',
    theme: 'light',
    notifications: {
      enabled: true,
      sound: false,
      desktop: false,
    },
  });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [loading, setLoading] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const dataRef = useRef(new Map());

  // Mock test data
  useEffect(() => {
    const mockTests: ABTest[] = [
      {
        id: 'test_1',
        name: 'Homepage CTA Button Color',
        description: 'Testing blue vs green CTA button colors on homepage',
        hypothesis: 'Green buttons will increase conversion rate by at least 5%',
        status: 'running',
        category: 'Landing Page',
        priority: 'high',
        variants: [
          {
            id: 'control',
            name: 'Blue Button',
            description: 'Current blue CTA button',
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
            description: 'New green CTA button variant',
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
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
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
        tags: ['cta', 'homepage', 'conversion'],
        isArchived: false,
      },
      {
        id: 'test_2',
        name: 'Pricing Page Layout Test',
        description: 'Testing single-column vs multi-column pricing layout',
        hypothesis: 'Multi-column layout will increase pricing page conversions',
        status: 'running',
        category: 'Pricing',
        priority: 'medium',
        variants: [
          {
            id: 'control',
            name: 'Single Column',
            description: 'Current single column layout',
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
            description: 'New multi-column layout',
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
        startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        tags: ['pricing', 'layout', 'ecommerce'],
        isArchived: false,
      },
    ];

    setTests(mockTests);
    if (!selectedTest && mockTests.length > 0 && onTestSelect) {
      onTestSelect(mockTests[0]);
    }
  }, [selectedTest, onTestSelect, user]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    if (selectedTest && hasPermission('access_real_time_data')) {
      initializeWebSocket();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedTest, hasPermission]);

  // Auto-refresh setup
  useEffect(() => {
    if (isAutoRefresh && hasPermission('access_real_time_data')) {
      intervalRef.current = setInterval(() => {
        refreshData();
      }, refreshInterval * 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [isAutoRefresh, refreshInterval, hasPermission]);

  const initializeWebSocket = () => {
    try {
      // Mock WebSocket connection for demonstration
      const mockWebSocket = {
        send: (data: string) => {
          console.log('Mock WebSocket send:', data);
        },
        close: () => {
          console.log('Mock WebSocket closed');
        },
        addEventListener: () => {},
        removeEventListener: () => {},
      } as any;

      wsRef.current = mockWebSocket;

      // Simulate real-time data updates
      const mockUpdate: RealTimeUpdate = {
        type: 'metric_update',
        testId: selectedTest!.id,
        timestamp: new Date().toISOString(),
        data: {
          conversionRate: 2.3 + Math.random() * 0.5,
          visitors: Math.floor(Math.random() * 100) + 1200,
          conversions: Math.floor(Math.random() * 10) + 25,
        },
      };

      // Auto-trigger initial update
      setTimeout(() => {
        handleRealTimeUpdate(mockUpdate);
      }, 1000);
    } catch (error) {
      console.error('WebSocket initialization failed:', error);
      toast.error('Failed to initialize real-time connection');
    }
  };

  const handleRealTimeUpdate = useCallback((update: RealTimeUpdate) => {
    if (update.testId === selectedTest?.id) {
      // Update live data
      setLiveData(prev => {
        const newData = new Map(prev);
        const currentData = newData.get(update.testId) || createEmptyTestResult(update.testId);
        
        const updatedResult: TestResult = {
          ...currentData,
          timestamp: update.timestamp,
          variants: {
            ...currentData.variants,
            ...Object.keys(update.data).reduce((acc, key) => {
              if (key.startsWith('variant_')) {
                const variantId = key;
                const variantData = update.data[key];
                acc[variantId] = {
                  ...currentData.variants[variantId],
                  ...variantData,
                };
              }
              return acc;
            }, {} as any),
          },
        };

        newData.set(update.testId, updatedResult);
        return newData;
      });

      // Update metrics
      setMetrics(prev => {
        const newMetrics = new Map(prev);
        const currentMetrics = newMetrics.get(update.testId) || createEmptyMetrics();
        
        const updatedMetrics: LiveMetrics = {
          ...currentMetrics,
          ...update.data,
          lastUpdate: update.timestamp,
        };

        newMetrics.set(update.testId, updatedMetrics);
        return newMetrics;
      });

      // Add to chart data
      setChartData(prev => {
        const newChartData = new Map(prev);
        const current = newChartData.get(update.testId) || [];
        
        const newPoint: ChartDataPoint = {
          time: new Date().toLocaleTimeString(),
          timestamp: Date.now(),
          ...update.data,
        };

        newChartData.set(update.testId, [...current, newPoint].slice(-100)); // Keep last 100 points
        return newChartData;
      });

      // Check for alerts
      checkForAlerts(update);
    }
  }, [selectedTest]);

  const checkForAlerts = (update: RealTimeUpdate) => {
    const newAlerts = [];
    
    // Statistical significance alert
    if (update.data.statisticalSignificance && update.data.statisticalSignificance > 95) {
      newAlerts.push({
        id: Date.now(),
        type: 'success',
        title: 'Statistical Significance Reached',
        message: 'Your test has reached statistical significance!',
        timestamp: new Date().toISOString(),
      });
    }

    // Sample size warning
    if (update.data.visitors && update.data.visitors < (selectedTest?.minimumSampleSize || 0) * 0.5) {
      newAlerts.push({
        id: Date.now() + 1,
        type: 'warning',
        title: 'Low Sample Size',
        message: 'Your test may not have enough data for reliable results yet.',
        timestamp: new Date().toISOString(),
      });
    }

    if (newAlerts.length > 0) {
      setAlerts(prev => [...newAlerts, ...prev].slice(0, 5));
      
      newAlerts.forEach(alert => {
        if (config.notifications.enabled) {
          toast(alert.message, {
            icon: alert.type === 'success' ? '🎉' : '⚠️',
            duration: alert.type === 'success' ? 6000 : 4000,
          });
        }
      });
    }
  };

  const refreshData = async () => {
    if (!selectedTest || !hasPermission('access_real_time_data')) return;

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock updated data
      const mockUpdate: RealTimeUpdate = {
        type: 'metric_update',
        testId: selectedTest.id,
        timestamp: new Date().toISOString(),
        data: {
          visitors: selectedTest.variants.reduce((sum, v) => sum + (v.visitors || 0), 0) + Math.floor(Math.random() * 10),
          conversions: selectedTest.variants.reduce((sum, v) => sum + (v.conversions || 0), Math.floor(Math.random() * 3)),
        },
      };

      handleRealTimeUpdate(mockUpdate);
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const createEmptyTestResult = (testId: string): TestResult => ({
    testId,
    timestamp: new Date().toISOString(),
    variants: selectedTest?.variants.reduce((acc, variant) => {
      acc[variant.id] = {
        visitors: variant.visitors || 0,
        conversions: variant.conversions || 0,
        revenue: variant.revenue || 0,
        bounceRate: 0,
        timeOnPage: 0,
        conversionRate: variant.conversionRate || 0,
        revenuePerUser: 0,
        cumulativeData: {
          visitors: variant.visitors || 0,
          conversions: variant.conversions || 0,
          revenue: variant.revenue || 0,
        },
      };
      return acc;
    }, {} as any) || {},
    overall: {
      totalVisitors: 0,
      totalConversions: 0,
      totalRevenue: 0,
      overallConversionRate: 0,
      statisticalSignificance: 0,
      isSignificant: false,
    },
  });

  const createEmptyMetrics = (): LiveMetrics => ({
    totalVisitors: 0,
    totalConversions: 0,
    totalRevenue: 0,
    conversionRate: 0,
    revenuePerVisitor: 0,
    currentTime: new Date().toLocaleTimeString(),
    lastUpdate: new Date().toISOString(),
  });

  const pauseTest = async () => {
    if (!selectedTest || !hasPermission('pause_tests')) return;

    try {
      const updatedTest = { ...selectedTest, status: 'paused' as const };
      onUpdateTest && onUpdateTest(updatedTest);
      toast.success('Test paused successfully');
    } catch (error) {
      toast.error('Failed to pause test');
    }
  };

  const resumeTest = async () => {
    if (!selectedTest || !hasPermission('start_tests')) return;

    try {
      const updatedTest = { ...selectedTest, status: 'running' as const };
      onUpdateTest && onUpdateTest(updatedTest);
      toast.success('Test resumed successfully');
    } catch (error) {
      toast.error('Failed to resume test');
    }
  };

  const stopTest = async () => {
    if (!selectedTest || !hasPermission('stop_tests')) return;

    if (window.confirm('Are you sure you want to stop this test? This action cannot be undone.')) {
      try {
        const updatedTest = { 
          ...selectedTest, 
          status: 'completed' as const,
          endDate: new Date().toISOString(),
        };
        onUpdateTest && onUpdateTest(updatedTest);
        toast.success('Test stopped successfully');
      } catch (error) {
        toast.error('Failed to stop test');
      }
    }
  };

  const exportData = () => {
    if (!selectedTest || !hasPermission('export_data')) return;

    const data = {
      test: selectedTest,
      liveData: liveData.get(selectedTest.id),
      metrics: metrics.get(selectedTest.id),
      chartData: chartData.get(selectedTest.id),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTest.name.replace(/\s+/g, '_')}_realtime_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Real-time data exported successfully');
  };

  const calculateStatisticalSignificance = (variantA: any, variantB: any) => {
    if (!variantA || !variantB || variantA.visitors === 0 || variantB.visitors === 0) {
      return { isSignificant: false, pValue: 1, confidenceInterval: [0, 0] as [number, number] };
    }

    const p1 = variantA.conversions / variantA.visitors;
    const p2 = variantB.conversions / variantB.visitors;
    const pooled = (variantA.conversions + variantB.conversions) / (variantA.visitors + variantB.visitors);
    
    const se = Math.sqrt(pooled * (1 - pooled) * (1/variantA.visitors + 1/variantB.visitors));
    const z = (p2 - p1) / se;
    
    // Approximate p-value for two-tailed test
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));
    const isSignificant = pValue < 0.05;
    const confidenceInterval = [
      (p2 - p1) - 1.96 * se,
      (p2 - p1) + 1.96 * se,
    ];

    return { isSignificant, pValue, confidenceInterval };
  };

  // Normal CDF approximation
  const normalCDF = (x: number): number => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  // Error function approximation
  const erf = (x: number): number => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const currentLiveData = selectedTest ? liveData.get(selectedTest.id) : null;
  const currentMetrics = selectedTest ? metrics.get(selectedTest.id) : null;
  const currentChartData = selectedTest ? chartData.get(selectedTest.id) || [] : [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Real-Time Monitor</h1>
            <p className="text-gray-600 mt-1">
              Monitor your A/B tests in real-time with live updates and insights
            </p>
          </div>
          
          <div className="flex space-x-3">
            {/* Auto-refresh toggle */}
            <div className="flex items-center space-x-2">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAutoRefresh}
                  onChange={(e) => setIsAutoRefresh(e.target.checked)}
                  className="sr-only"
                />
                <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAutoRefresh ? 'bg-indigo-600' : 'bg-gray-300'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAutoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </div>
                <span className="ml-2 text-sm text-gray-700">Auto-refresh</span>
              </label>
            </div>

            {/* Refresh interval */}
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              disabled={!isAutoRefresh}
            >
              <option value={5}>5s</option>
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
            </select>

            {/* Manual refresh */}
            <button
              onClick={refreshData}
              disabled={loading}
              className="flex items-center px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            {/* Export */}
            {selectedTest && hasPermission('export_data') && (
              <button
                onClick={exportData}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>

        {/* Test Selection */}
        <div className="flex space-x-4">
          <select
            value={selectedTest?.id || ''}
            onChange={(e) => {
              const test = tests.find(t => t.id === e.target.value);
              if (test && onTestSelect) onTestSelect(test);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a test to monitor</option>
            {tests.filter(test => test.status === 'running' || test.status === 'paused').map(test => (
              <option key={test.id} value={test.id}>
                {test.name} ({test.status})
              </option>
            ))}
          </select>

          {/* Time range selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>
      </div>

      {!selectedTest ? (
        <div className="text-center py-12">
          <ChartBarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Selected</h3>
          <p className="text-gray-600">Select a test from the dropdown above to start monitoring</p>
        </div>
      ) : (
        <>
          {/* Test Controls */}
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">{selectedTest.name}</h2>
              <span className={`px-2 py-1 text-xs rounded-full ${
                selectedTest.status === 'running' ? 'bg-green-100 text-green-800' :
                selectedTest.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {selectedTest.status}
              </span>
              
              {currentMetrics?.lastUpdate && (
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(currentMetrics.lastUpdate).toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex space-x-2">
              {selectedTest.status === 'running' && hasPermission('pause_tests') && (
                <button
                  onClick={pauseTest}
                  className="flex items-center px-3 py-1 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  <PauseIcon className="h-4 w-4 mr-1" />
                  Pause
                </button>
              )}
              
              {selectedTest.status === 'paused' && hasPermission('start_tests') && (
                <button
                  onClick={resumeTest}
                  className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <PlayIcon className="h-4 w-4 mr-1" />
                  Resume
                </button>
              )}
              
              {hasPermission('stop_tests') && (
                <button
                  onClick={stopTest}
                  className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <StopIcon className="h-4 w-4 mr-1" />
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="mb-6 space-y-2">
              {alerts.slice(0, 3).map(alert => (
                <div key={alert.id} className={`p-4 rounded-lg border ${
                  alert.type === 'success' ? 'bg-green-50 border-green-200' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-red-50 border-red-200'
                }`}>
                  <div className="flex">
                    {alert.type === 'success' ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5" />
                    ) : alert.type === 'warning' ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-400 mt-0.5" />
                    )}
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-blue-600">Total Visitors</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {currentMetrics?.totalVisitors?.toLocaleString() || '0'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center">
                <TrendingUpIcon className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-green-900">
                    {(currentMetrics?.conversionRate || 0).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-purple-900">
                    ${(currentMetrics?.totalRevenue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
              <div className="flex items-center">
                <ClockIcon className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-orange-600">Revenue/Visitor</p>
                  <p className="text-2xl font-bold text-orange-900">
                    ${(currentMetrics?.revenuePerVisitor || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Variant Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Variant Performance Table */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Variant Performance</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Variant</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Visitors</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Conversions</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Conv. Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTest.variants.map((variant, index) => {
                      const data = currentLiveData?.variants[variant.id] || variant;
                      const isControl = variant.isControl;
                      
                      return (
                        <tr key={variant.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <div className="flex items-center">
                              <div
                                className="w-3 h-3 rounded mr-2"
                                style={{ backgroundColor: variant.color }}
                              />
                              <span className="font-medium text-gray-900">{variant.name}</span>
                              {isControl && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  Control
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-3 text-gray-900">
                            {(data.visitors || 0).toLocaleString()}
                          </td>
                          <td className="text-right py-3 text-gray-900">
                            {(data.conversions || 0).toLocaleString()}
                          </td>
                          <td className="text-right py-3 text-gray-900">
                            {(data.conversionRate || 0).toFixed(2)}%
                          </td>
                          <td className="text-right py-3 text-gray-900">
                            ${(data.revenue || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Statistical Significance */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Statistical Analysis</h3>
              {selectedTest.variants.length >= 2 ? (
                <div className="space-y-4">
                  {(() => {
                    const control = selectedTest.variants.find(v => v.isControl);
                    const variants = selectedTest.variants.filter(v => !v.isControl);
                    
                    return variants.map(variant => {
                      const stats = control && currentLiveData ? 
                        calculateStatisticalSignificance(
                          currentLiveData.variants[control.id],
                          currentLiveData.variants[variant.id]
                        ) : null;
                      
                      if (!stats) return null;
                      
                      const improvement = control && currentLiveData ?
                        ((currentLiveData.variants[variant.id]?.conversionRate || 0) - 
                         (currentLiveData.variants[control.id]?.conversionRate || 0)) : 0;
                      
                      return (
                        <div key={variant.id} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">{variant.name}</span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              stats.isSignificant ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {stats.isSignificant ? 'Significant' : 'Not Significant'}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Improvement:</span>
                              <span className="ml-2 font-medium">
                                {improvement > 0 ? '+' : ''}{improvement.toFixed(2)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">P-Value:</span>
                              <span className="ml-2 font-medium">{stats.pValue.toFixed(4)}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Confidence Interval:</span>
                              <span className="ml-2 font-medium">
                                [{(stats.confidenceInterval[0] * 100).toFixed(2)}%, {(stats.confidenceInterval[1] * 100).toFixed(2)}%]
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              ) : (
                <p className="text-gray-500">Need at least 2 variants for statistical analysis</p>
              )}
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Traffic Over Time */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Traffic Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedTest.variants.map((variant, index) => (
                    <Area
                      key={variant.id}
                      type="monotone"
                      dataKey={variant.id}
                      stackId="1"
                      stroke={variant.color}
                      fill={variant.color}
                      fillOpacity={0.6}
                      name={variant.name}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Rate Comparison */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Conversion Rate Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={selectedTest.variants.map(variant => ({
                  name: variant.name,
                  conversionRate: (currentLiveData?.variants[variant.id]?.conversionRate || 0),
                  visitors: (currentLiveData?.variants[variant.id]?.visitors || 0),
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value, name) => [
                    name === 'conversionRate' ? `${Number(value).toFixed(2)}%` : value,
                    name === 'conversionRate' ? 'Conversion Rate' : 'Visitors'
                  ]} />
                  <Bar dataKey="conversionRate" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Live Data Feed */}
          <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Data Feed</h3>
            <div className="max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {currentChartData.slice(-10).reverse().map((point, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                    <span className="text-gray-600">{point.time}</span>
                    <div className="flex space-x-4">
                      {selectedTest.variants.map(variant => (
                        <span key={variant.id} className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-1"
                            style={{ backgroundColor: variant.color }}
                          />
                          {point[variant.id] || 0}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RealTimeMonitor;
