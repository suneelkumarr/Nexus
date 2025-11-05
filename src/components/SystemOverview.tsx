import React, { useState, useEffect } from 'react'
import { 
  Monitor, Database, Zap, Shield, Users, BarChart3,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, Server, Activity, Globe
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface SystemOverviewProps {
  systemStatus: {
    overall_score: number
    performance: string
    security: string
    uptime: number
  }
}

const SystemOverview: React.FC<SystemOverviewProps> = ({ systemStatus }) => {
  const [systemMetrics, setSystemMetrics] = useState({
    users: { total: 0, active: 0, new: 0 },
    performance: { response_time: 0, throughput: 0, error_rate: 0 },
    security: { events: 0, threats: 0, score: 100 },
    database: { connections: 0, queries: 0, storage: 0 },
    api: { requests: 0, success_rate: 0, rate_limits: 0 }
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [systemAlerts, setSystemAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSystemMetrics()
    loadRecentActivity()
    loadSystemAlerts()
  }, [])

  const loadSystemMetrics = async () => {
    try {
      setIsLoading(true)

      // Simulate system metrics (in real implementation, call admin-monitor edge function)
      const mockMetrics = {
        users: {
          total: Math.floor(Math.random() * 5000) + 1000,
          active: Math.floor(Math.random() * 1500) + 500,
          new: Math.floor(Math.random() * 200) + 50
        },
        performance: {
          response_time: Math.floor(Math.random() * 200) + 100,
          throughput: Math.floor(Math.random() * 100) + 50,
          error_rate: parseFloat((Math.random() * 0.05).toFixed(3))
        },
        security: {
          events: Math.floor(Math.random() * 100) + 20,
          threats: Math.floor(Math.random() * 5),
          score: Math.floor(Math.random() * 20) + 80
        },
        database: {
          connections: Math.floor(Math.random() * 50) + 20,
          queries: Math.floor(Math.random() * 200) + 100,
          storage: Math.floor(Math.random() * 30) + 60
        },
        api: {
          requests: Math.floor(Math.random() * 10000) + 5000,
          success_rate: parseFloat((95 + Math.random() * 4).toFixed(1)),
          rate_limits: Math.floor(Math.random() * 50)
        }
      }

      setSystemMetrics(mockMetrics)
    } catch (error) {
      console.error('Error loading system metrics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadRecentActivity = async () => {
    try {
      // Get recent activity from various tables
      const { data: searchHistory } = await supabase
        .from('global_search_history')
        .select('query, search_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const { data: notifications } = await supabase
        .from('real_time_notifications')
        .select('notification_type, payload, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      const activities = []

      // Add search activities
      if (searchHistory) {
        searchHistory.forEach(search => {
          activities.push({
            type: 'search',
            description: `Search: "${search.query}" (${search.search_type})`,
            timestamp: search.created_at,
            icon: 'search'
          })
        })
      }

      // Add notification activities
      if (notifications) {
        notifications.forEach(notif => {
          activities.push({
            type: 'notification',
            description: `Notification: ${notif.notification_type}`,
            timestamp: notif.created_at,
            icon: 'bell'
          })
        })
      }

      // Sort by timestamp and take top 10
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      setRecentActivity(activities.slice(0, 10))
    } catch (error) {
      console.error('Error loading recent activity:', error)
    }
  }

  const loadSystemAlerts = async () => {
    try {
      // Get recent system alerts
      const { data: alerts } = await supabase
        .from('real_time_notifications')
        .select('notification_type, payload, priority, created_at')
        .eq('notification_type', 'system_alert')
        .order('created_at', { ascending: false })
        .limit(5)

      const formattedAlerts = (alerts || []).map(alert => ({
        type: alert.priority <= 2 ? 'critical' : alert.priority === 3 ? 'warning' : 'info',
        message: alert.payload?.message || 'System alert',
        timestamp: alert.created_at
      }))

      setSystemAlerts(formattedAlerts)
    } catch (error) {
      console.error('Error loading system alerts:', error)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  const getMetricTrend = (value: number, threshold: number, reverse = false) => {
    const isGood = reverse ? value < threshold : value > threshold
    return isGood ? 'positive' : 'negative'
  }

  const MetricCard = ({ title, value, unit, icon: Icon, trend, color = 'blue' }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>
            {typeof value === 'number' ? formatNumber(value) : value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-600`} />
      </div>
      {trend && (
        <div className="mt-2 flex items-center">
          {trend === 'positive' ? (
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${trend === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'positive' ? 'Trending up' : 'Needs attention'}
          </span>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Health Overview */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">System Health Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${systemStatus.overall_score >= 90 ? 'text-green-600' : systemStatus.overall_score >= 75 ? 'text-yellow-600' : 'text-red-600'}`}>
              {systemStatus.overall_score}%
            </div>
            <div className="text-sm text-gray-500">Overall Health</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{systemStatus.uptime}%</div>
            <div className="text-sm text-gray-500">Uptime</div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${systemStatus.performance === 'excellent' ? 'text-green-600' : 'text-yellow-600'}`}>
              {systemStatus.performance}
            </div>
            <div className="text-sm text-gray-500">Performance</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{systemStatus.security}</div>
            <div className="text-sm text-gray-500">Security</div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={systemMetrics.users.total}
          icon={Users}
          trend={getMetricTrend(systemMetrics.users.new, 100)}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={systemMetrics.users.active}
          icon={Activity}
          trend={getMetricTrend(systemMetrics.users.active, systemMetrics.users.total * 0.3)}
          color="green"
        />
        <MetricCard
          title="Response Time"
          value={systemMetrics.performance.response_time}
          unit="ms"
          icon={Clock}
          trend={getMetricTrend(systemMetrics.performance.response_time, 200, true)}
          color="purple"
        />
        <MetricCard
          title="API Requests"
          value={systemMetrics.api.requests}
          unit="/day"
          icon={Globe}
          trend={getMetricTrend(systemMetrics.api.requests, 5000)}
          color="indigo"
        />
        <MetricCard
          title="Database Connections"
          value={systemMetrics.database.connections}
          icon={Database}
          trend={getMetricTrend(systemMetrics.database.connections, 15)}
          color="emerald"
        />
        <MetricCard
          title="Security Score"
          value={systemMetrics.security.score}
          unit="%"
          icon={Shield}
          trend={getMetricTrend(systemMetrics.security.score, 85)}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            ) : (
              recentActivity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {activity.icon === 'search' ? (
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Zap className="h-5 w-5 text-green-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          {recentActivity.length > 5 && (
            <div className="mt-4 text-center">
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View all activity
              </button>
            </div>
          )}
        </div>

        {/* System Alerts */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Alerts</h3>
          <div className="space-y-3">
            {systemAlerts.length === 0 ? (
              <div className="text-center py-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-500">No active alerts</p>
                <p className="text-xs text-gray-400">All systems operational</p>
              </div>
            ) : (
              systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {alert.type === 'critical' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : alert.type === 'warning' ? (
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{systemMetrics.performance.response_time}ms</div>
            <div className="text-sm text-gray-500">Avg Response Time</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min((200 - systemMetrics.performance.response_time) / 200 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{systemMetrics.performance.throughput}/s</div>
            <div className="text-sm text-gray-500">Throughput</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(systemMetrics.performance.throughput / 100 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{(systemMetrics.performance.error_rate * 100).toFixed(2)}%</div>
            <div className="text-sm text-gray-500">Error Rate</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${Math.min(systemMetrics.performance.error_rate * 100 / 5 * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Monitor className="h-5 w-5 mr-2" />
            View Performance
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Shield className="h-5 w-5 mr-2" />
            Security Scan
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
            <BarChart3 className="h-5 w-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  )
}

export default SystemOverview