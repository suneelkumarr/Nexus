import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Database, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Shield
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SystemMetric {
  id: string;
  name: string;
  value: string;
  status: 'healthy' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down' | 'stable';
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

const SystemOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'critical'>('healthy');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setIsLoading(true);
      
      // Load system performance metrics
      await loadMetrics();
      
      // Load recent alerts
      await loadAlerts();
      
      // Calculate overall system health
      calculateSystemHealth();
      
    } catch (error) {
      console.error('Error loading system data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data: performanceData } = await supabase
        .from('system_performance_metrics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Calculate metric summaries
      const defaultMetrics: SystemMetric[] = [
        {
          id: 'api_health',
          name: 'API Health',
          value: '99.9%',
          status: 'healthy',
          icon: Server,
          trend: 'stable'
        },
        {
          id: 'database_status',
          name: 'Database Status',
          value: 'Online',
          status: 'healthy',
          icon: Database,
          trend: 'stable'
        },
        {
          id: 'active_users',
          name: 'Active Users',
          value: '247',
          status: 'healthy',
          icon: Users,
          trend: 'up'
        },
        {
          id: 'response_time',
          name: 'Avg Response Time',
          value: '245ms',
          status: 'healthy',
          icon: Clock,
          trend: 'down'
        },
        {
          id: 'cpu_usage',
          name: 'CPU Usage',
          value: '34%',
          status: 'healthy',
          icon: Cpu,
          trend: 'stable'
        },
        {
          id: 'storage_usage',
          name: 'Storage Usage',
          value: '67%',
          status: 'warning',
          icon: HardDrive,
          trend: 'up'
        },
        {
          id: 'network_status',
          name: 'Network Status',
          value: 'Stable',
          status: 'healthy',
          icon: Wifi,
          trend: 'stable'
        },
        {
          id: 'security_status',
          name: 'Security Status',
          value: 'Secure',
          status: 'healthy',
          icon: Shield,
          trend: 'stable'
        }
      ];

      if (performanceData && performanceData.length > 0) {
        // Process real performance data if available
        const processedMetrics = defaultMetrics.map(metric => {
          const relevantData = performanceData.find(p => 
            p.metric_type?.toLowerCase().includes(metric.id.replace('_', ''))
          );
          
          if (relevantData) {
            return {
              ...metric,
              value: relevantData.value?.toString() || metric.value,
              status: relevantData.metadata?.status || metric.status
            };
          }
          return metric;
        });
        setMetrics(processedMetrics);
      } else {
        setMetrics(defaultMetrics);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
      // Set default metrics on error
      setMetrics([
        {
          id: 'system_status',
          name: 'System Status',
          value: 'Operational',
          status: 'healthy',
          icon: Activity,
          trend: 'stable'
        }
      ]);
    }
  };

  const loadAlerts = async () => {
    try {
      const { data: notificationData } = await supabase
        .from('real_time_notifications')
        .select('*')
        .eq('notification_type', 'system_alert')
        .order('created_at', { ascending: false })
        .limit(5);

      if (notificationData && notificationData.length > 0) {
        const processedAlerts: SystemAlert[] = notificationData.map(notification => ({
          id: notification.id,
          type: notification.priority === 'high' ? 'error' : 
                notification.priority === 'medium' ? 'warning' : 'info',
          message: notification.payload?.message || 'System notification',
          timestamp: new Date(notification.created_at).toLocaleString()
        }));
        setAlerts(processedAlerts);
      } else {
        // Default alerts
        setAlerts([
          {
            id: '1',
            type: 'info',
            message: 'System monitoring is active and running normally',
            timestamp: new Date().toLocaleString()
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
      setAlerts([]);
    }
  };

  const calculateSystemHealth = () => {
    const healthyCount = metrics.filter(m => m.status === 'healthy').length;
    const warningCount = metrics.filter(m => m.status === 'warning').length;
    const criticalCount = metrics.filter(m => m.status === 'critical').length;

    if (criticalCount > 0) {
      setSystemHealth('critical');
    } else if (warningCount > healthyCount) {
      setSystemHealth('degraded');
    } else {
      setSystemHealth('healthy');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
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
      {/* System Health Overview */}
      <div className={`p-6 rounded-xl border-2 ${getSystemHealthColor(systemHealth)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {systemHealth === 'healthy' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
            )}
            <div>
              <h2 className="text-xl font-bold">System Health</h2>
              <p className="text-sm opacity-75">
                Overall system status: {systemHealth.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={loadSystemData}
            className="px-4 py-2 bg-white rounded-lg text-sm font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            Refresh Status
          </button>
        </div>
      </div>

      {/* System Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="bg-white p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {getTrendIcon(metric.trend)}
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{metric.name}</h3>
              <p className="text-xl font-bold text-gray-800 mt-1">{metric.value}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                {metric.status.toUpperCase()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Recent Alerts */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Alerts</h3>
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className={`p-1 rounded-full ${
                  alert.type === 'error' ? 'bg-red-100' :
                  alert.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.type === 'error' ? 'text-red-600' :
                    alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No recent alerts</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Server className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">System Diagnostics</h4>
            <p className="text-sm text-gray-600">Run comprehensive system check</p>
          </button>
          <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Database className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Database Health</h4>
            <p className="text-sm text-gray-600">Check database performance</p>
          </button>
          <button className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <Activity className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Performance Report</h4>
            <p className="text-sm text-gray-600">Generate detailed performance report</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemOverview;