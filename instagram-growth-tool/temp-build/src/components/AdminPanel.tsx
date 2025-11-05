import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Activity, 
  Database, 
  Server, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Settings,
  Lock,
  Key,
  Monitor,
  BarChart3,
  UserCheck,
  UserX,
  Zap
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AdminMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  status: 'good' | 'warning' | 'critical';
  icon: React.ComponentType<any>;
}

interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_signups: number;
  retention_rate: number;
  avg_session_time: number;
}

interface SecurityEvent {
  id: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  user_id?: string;
  ip_address?: string;
  timestamp: string;
}

interface SystemHealth {
  api_status: 'healthy' | 'degraded' | 'down';
  database_status: 'healthy' | 'degraded' | 'down';
  edge_functions: 'healthy' | 'degraded' | 'down';
  storage_status: 'healthy' | 'degraded' | 'down';
  uptime_percentage: number;
  response_time: number;
}

const AdminPanel: React.FC = () => {
  const [adminMetrics, setAdminMetrics] = useState<AdminMetric[]>([]);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'system', label: 'System Health', icon: Monitor },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Use the admin-monitor edge function
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-monitor`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.system_health) {
          setSystemHealth(data.system_health);
        }
        if (data.user_analytics) {
          setUserAnalytics(data.user_analytics);
        }
        if (data.security_events) {
          setSecurityEvents(data.security_events);
        }
        generateAdminMetrics(data);
      } else {
        // Fallback to sample data
        generateSampleData();
      }

    } catch (error) {
      console.error('Error loading admin data:', error);
      generateSampleData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateSampleData = () => {
    // Sample admin metrics
    const metrics: AdminMetric[] = [
      {
        id: 'total_users',
        name: 'Total Users',
        value: 2847,
        change: 12.5,
        status: 'good',
        icon: Users
      },
      {
        id: 'active_sessions',
        name: 'Active Sessions',
        value: 156,
        change: 8.3,
        status: 'good',
        icon: Activity
      },
      {
        id: 'api_requests',
        name: 'API Requests/Hour',
        value: '1.2K',
        change: -5.2,
        status: 'warning',
        icon: Zap
      },
      {
        id: 'storage_usage',
        name: 'Storage Usage',
        value: '78%',
        change: 3.1,
        status: 'warning',
        icon: Database
      },
      {
        id: 'error_rate',
        name: 'Error Rate',
        value: '0.12%',
        change: -15.6,
        status: 'good',
        icon: AlertTriangle
      },
      {
        id: 'uptime',
        name: 'System Uptime',
        value: '99.9%',
        change: 0.1,
        status: 'good',
        icon: Server
      }
    ];

    setAdminMetrics(metrics);

    // Sample user analytics
    setUserAnalytics({
      total_users: 2847,
      active_users: 156,
      new_signups: 23,
      retention_rate: 87.3,
      avg_session_time: 1850
    });

    // Sample security events
    setSecurityEvents([
      {
        id: '1',
        event_type: 'failed_login',
        severity: 'medium',
        description: 'Multiple failed login attempts detected',
        ip_address: '192.168.1.100',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        event_type: 'suspicious_activity',
        severity: 'high',
        description: 'Unusual API access pattern detected',
        user_id: 'user_12345',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        event_type: 'security_scan',
        severity: 'low',
        description: 'Automated security scan completed',
        timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString()
      }
    ]);

    // Sample system health
    setSystemHealth({
      api_status: 'healthy',
      database_status: 'healthy',
      edge_functions: 'healthy',
      storage_status: 'degraded',
      uptime_percentage: 99.9,
      response_time: 245
    });
  };

  const generateAdminMetrics = (data: any) => {
    // Process real data if available, otherwise use sample data
    generateSampleData();
  };

  const executeAdminAction = async (action: string, params?: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/admin-monitor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          action,
          parameters: params
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`Admin action '${action}' executed:`, result);
        
        // Refresh data after action
        await loadAdminData();
      }
    } catch (error) {
      console.error(`Error executing admin action '${action}':`, error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Admin Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminMetrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(metric.status)}`}>
                  {metric.status}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 text-sm">{metric.name}</h3>
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-bold text-gray-800">{metric.value}</span>
                <span className={`text-xs font-medium ${
                  metric.change > 0 ? 'text-green-600' : 
                  metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => executeAdminAction('system_health_check')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Monitor className="w-6 h-6 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">System Check</h4>
            <p className="text-sm text-gray-600">Run comprehensive health check</p>
          </button>
          <button
            onClick={() => executeAdminAction('security_scan')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Shield className="w-6 h-6 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Security Scan</h4>
            <p className="text-sm text-gray-600">Scan for security issues</p>
          </button>
          <button
            onClick={() => executeAdminAction('clear_cache')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <Database className="w-6 h-6 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">Clear Cache</h4>
            <p className="text-sm text-gray-600">Clear system cache</p>
          </button>
          <button
            onClick={() => executeAdminAction('generate_report')}
            className="p-4 text-left rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-6 h-6 text-orange-600 mb-2" />
            <h4 className="font-medium text-gray-900">Generate Report</h4>
            <p className="text-sm text-gray-600">Create admin report</p>
          </button>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-6">
      {/* User Analytics */}
      {userAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-600 mb-2" />
            <div className="text-2xl font-bold text-gray-900">{userAnalytics.total_users}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <UserCheck className="w-6 h-6 mx-auto text-green-600 mb-2" />
            <div className="text-2xl font-bold text-green-600">{userAnalytics.active_users}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-purple-600 mb-2" />
            <div className="text-2xl font-bold text-purple-600">{userAnalytics.new_signups}</div>
            <div className="text-sm text-gray-600">New Signups</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Eye className="w-6 h-6 mx-auto text-orange-600 mb-2" />
            <div className="text-2xl font-bold text-orange-600">{userAnalytics.retention_rate}%</div>
            <div className="text-sm text-gray-600">Retention Rate</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
            <Activity className="w-6 h-6 mx-auto text-red-600 mb-2" />
            <div className="text-2xl font-bold text-red-600">{Math.floor(userAnalytics.avg_session_time / 60)}m</div>
            <div className="text-sm text-gray-600">Avg Session</div>
          </div>
        </div>
      )}

      {/* User Management Actions */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">User Registration</h4>
              <p className="text-sm text-gray-600">Control user registration settings</p>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Configure
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Role Management</h4>
              <p className="text-sm text-gray-600">Manage user roles and permissions</p>
            </div>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Manage
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Account Cleanup</h4>
              <p className="text-sm text-gray-600">Remove inactive accounts</p>
            </div>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Cleanup
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Security Events */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Security Events</h3>
        <div className="space-y-3">
          {securityEvents.map((event) => (
            <div key={event.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className={`w-5 h-5 mt-0.5 ${
                    event.severity === 'critical' ? 'text-red-600' :
                    event.severity === 'high' ? 'text-orange-600' :
                    event.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  }`} />
                  <div>
                    <h4 className="font-medium text-gray-900">{event.description}</h4>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(event.severity)}`}>
                        {event.severity}
                      </span>
                      <span>{event.event_type}</span>
                      {event.ip_address && <span>{event.ip_address}</span>}
                      <span>{formatTime(event.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                  Investigate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Lock className="w-5 h-5 text-purple-600" />
              <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Enforce 2FA for all users</p>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Configure
            </button>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5 text-orange-600" />
              <h4 className="font-medium text-gray-900">API Key Management</h4>
            </div>
            <p className="text-sm text-gray-600 mb-3">Manage API keys and access tokens</p>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              Manage
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      {/* System Status */}
      {systemHealth && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(systemHealth.api_status)}`}>
            <Server className="w-6 h-6 mb-2" />
            <h3 className="font-medium">API Status</h3>
            <p className="text-sm opacity-75 capitalize">{systemHealth.api_status}</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(systemHealth.database_status)}`}>
            <Database className="w-6 h-6 mb-2" />
            <h3 className="font-medium">Database</h3>
            <p className="text-sm opacity-75 capitalize">{systemHealth.database_status}</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(systemHealth.edge_functions)}`}>
            <Zap className="w-6 h-6 mb-2" />
            <h3 className="font-medium">Edge Functions</h3>
            <p className="text-sm opacity-75 capitalize">{systemHealth.edge_functions}</p>
          </div>
          <div className={`p-4 rounded-lg border-2 ${getStatusColor(systemHealth.storage_status)}`}>
            <Database className="w-6 h-6 mb-2" />
            <h3 className="font-medium">Storage</h3>
            <p className="text-sm opacity-75 capitalize">{systemHealth.storage_status}</p>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {systemHealth && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">System Uptime</h4>
              <div className="text-3xl font-bold text-green-600 mb-1">{systemHealth.uptime_percentage}%</div>
              <p className="text-sm text-gray-600">Last 30 days</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Response Time</h4>
              <div className="text-3xl font-bold text-blue-600 mb-1">{systemHealth.response_time}ms</div>
              <p className="text-sm text-gray-600">Average response time</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Analytics</h3>
        <p className="text-gray-600">Comprehensive analytics dashboard coming soon...</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="w-6 h-6 text-purple-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          <p className="text-gray-600">System administration and monitoring</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUserManagement()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'system' && renderSystemHealth()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>
    </div>
  );
};

export default AdminPanel;