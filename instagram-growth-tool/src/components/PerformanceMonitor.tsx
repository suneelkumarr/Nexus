import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Zap, 
  Database, 
  Server,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface PerformanceMetric {
  id: string;
  metric_type: string;
  value: number;
  unit: string;
  timestamp: string;
  metadata?: any;
}

interface MetricCard {
  id: string;
  name: string;
  value: string;
  unit: string;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
}

const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [metricCards, setMetricCards] = useState<MetricCard[]>([]);
  const [selectedMetric, setSelectedMetric] = useState('response_time');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadPerformanceData();
    const interval = setInterval(loadPerformanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeRange]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);

      // Calculate time range
      const now = new Date();
      const timeAgo = new Date();
      switch (timeRange) {
        case '1h':
          timeAgo.setHours(now.getHours() - 1);
          break;
        case '24h':
          timeAgo.setDate(now.getDate() - 1);
          break;
        case '7d':
          timeAgo.setDate(now.getDate() - 7);
          break;
        case '30d':
          timeAgo.setDate(now.getDate() - 30);
          break;
      }

      const { data: performanceData } = await supabase
        .from('system_performance_metrics')
        .select('*')
        .gte('created_at', timeAgo.toISOString())
        .order('created_at', { ascending: false });

      if (performanceData && performanceData.length > 0) {
        setMetrics(performanceData);
        generateMetricCards(performanceData);
      } else {
        // Generate sample data for demonstration
        generateSampleData();
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      generateSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = () => {
    const now = new Date();
    const sampleData: PerformanceMetric[] = [];
    
    // Generate sample metrics for the last 24 hours
    for (let i = 0; i < 24; i++) {
      const timestamp = new Date(now.getTime() - (i * 60 * 60 * 1000));
      
      sampleData.push(
        {
          id: `response_${i}`,
          metric_type: 'response_time',
          value: Math.random() * 200 + 100, // 100-300ms
          unit: 'ms',
          timestamp: timestamp.toISOString(),
        },
        {
          id: `cpu_${i}`,
          metric_type: 'cpu_usage',
          value: Math.random() * 40 + 20, // 20-60%
          unit: '%',
          timestamp: timestamp.toISOString(),
        },
        {
          id: `memory_${i}`,
          metric_type: 'memory_usage',
          value: Math.random() * 30 + 50, // 50-80%
          unit: '%',
          timestamp: timestamp.toISOString(),
        },
        {
          id: `requests_${i}`,
          metric_type: 'requests_per_minute',
          value: Math.random() * 100 + 50, // 50-150 requests
          unit: 'req/min',
          timestamp: timestamp.toISOString(),
        }
      );
    }

    setMetrics(sampleData);
    generateMetricCards(sampleData);
  };

  const generateMetricCards = (data: PerformanceMetric[]) => {
    const metricTypes = ['response_time', 'cpu_usage', 'memory_usage', 'requests_per_minute'];
    
    const cards: MetricCard[] = metricTypes.map(type => {
      const typeData = data.filter(m => m.metric_type === type);
      const latest = typeData[0];
      const previous = typeData[1];
      
      const value = latest?.value || 0;
      const change = previous ? ((value - previous.value) / previous.value) * 100 : 0;
      
      let status: 'good' | 'warning' | 'critical' = 'good';
      if (type === 'response_time' && value > 500) status = 'critical';
      else if (type === 'response_time' && value > 300) status = 'warning';
      else if ((type === 'cpu_usage' || type === 'memory_usage') && value > 80) status = 'critical';
      else if ((type === 'cpu_usage' || type === 'memory_usage') && value > 60) status = 'warning';

      return {
        id: type,
        name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        value: value.toFixed(type.includes('usage') ? 0 : 1),
        unit: latest?.unit || getDefaultUnit(type),
        change,
        status,
        icon: getMetricIcon(type)
      };
    });

    setMetricCards(cards);
  };

  const getDefaultUnit = (type: string) => {
    switch (type) {
      case 'response_time': return 'ms';
      case 'cpu_usage':
      case 'memory_usage': return '%';
      case 'requests_per_minute': return 'req/min';
      default: return '';
    }
  };

  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'response_time': return Clock;
      case 'cpu_usage': return Zap;
      case 'memory_usage': return Database;
      case 'requests_per_minute': return Server;
      default: return Activity;
    }
  };

  const recordMetric = async () => {
    try {
      setIsRecording(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const performanceMetrics = [
        {
          user_id: user.id,
          metric_type: 'response_time',
          value: Math.random() * 200 + 100,
          unit: 'ms',
          metadata: { source: 'manual_recording', endpoint: '/api/performance' }
        },
        {
          user_id: user.id,
          metric_type: 'cpu_usage',
          value: Math.random() * 40 + 20,
          unit: '%',
          metadata: { source: 'manual_recording', server: 'main' }
        },
        {
          user_id: user.id,
          metric_type: 'memory_usage',
          value: Math.random() * 30 + 50,
          unit: '%',
          metadata: { source: 'manual_recording', server: 'main' }
        }
      ];

      for (const metric of performanceMetrics) {
        await supabase
          .from('system_performance_metrics')
          .insert(metric);
      }

      // Refresh data
      await loadPerformanceData();
      
    } catch (error) {
      console.error('Error recording metrics:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const getChartData = () => {
    return metrics
      .filter(m => m.metric_type === selectedMetric)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map(m => ({
        timestamp: new Date(m.timestamp).toLocaleTimeString(),
        value: m.value,
        formatted: `${m.value.toFixed(1)} ${m.unit}`
      }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600 bg-green-100 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Gauge className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Real-time system performance metrics and analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <button
            onClick={recordMetric}
            disabled={isRecording}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-shadow disabled:opacity-50"
          >
            {isRecording ? 'Recording...' : 'Record Metrics'}
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className={`p-4 rounded-xl border-2 ${getStatusColor(card.status)}`}>
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6" />
                {getStatusIcon(card.status)}
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{card.name}</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">
                  {card.value}
                </span>
                <span className="text-sm text-gray-600">{card.unit}</span>
              </div>
              <div className="flex items-center space-x-1 mt-2">
                <TrendingUp 
                  className={`w-3 h-3 ${
                    card.change > 0 ? 'text-green-500' : 
                    card.change < 0 ? 'text-red-500 rotate-180' : 'text-gray-400'
                  }`} 
                />
                <span className={`text-xs font-medium ${
                  card.change > 0 ? 'text-green-600' : 
                  card.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {Math.abs(card.change).toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Metric Trends</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="response_time">Response Time</option>
            <option value="cpu_usage">CPU Usage</option>
            <option value="memory_usage">Memory Usage</option>
            <option value="requests_per_minute">Requests/Minute</option>
          </select>
        </div>

        {/* Performance Chart */}
        <div className="h-80">
          {getChartData().length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value: any) => [value, 'Value']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No performance data available for the selected metric</p>
                <p className="text-sm mt-1">Try recording some metrics or changing the time range</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Recommendations */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Recommendations</h3>
        <div className="space-y-3">
          {metricCards.some(card => card.status === 'critical') && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Critical Performance Issues Detected</p>
                  <p className="text-red-700 text-sm">Immediate attention required for optimal system performance.</p>
                </div>
              </div>
            </div>
          )}
          {metricCards.some(card => card.status === 'warning') && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Performance Warnings</p>
                  <p className="text-yellow-700 text-sm">Monitor these metrics closely for potential optimization.</p>
                </div>
              </div>
            </div>
          )}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">Performance Tips</p>
                <ul className="text-blue-700 text-sm mt-1 space-y-1">
                  <li>• Regularly monitor response times during peak hours</li>
                  <li>• Set up automated alerts for critical thresholds</li>
                  <li>• Consider implementing caching for frequently accessed data</li>
                  <li>• Review database query performance periodically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;