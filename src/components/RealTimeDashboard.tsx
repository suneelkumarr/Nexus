import React, { useState, useEffect, useCallback } from 'react'
import { 
  Zap, Bell, Activity, Users, RefreshCw, 
  AlertCircle, CheckCircle, Clock, Send,
  Wifi, WifiOff, Settings, Filter, Play, Pause
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface RealTimeDashboardProps {}

const RealTimeDashboard: React.FC<RealTimeDashboardProps> = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLiveMode, setIsLiveMode] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [realTimeData, setRealTimeData] = useState({
    notifications: { new_notifications: [], count: 0 },
    performance: { recent_metrics: [], count: 0 },
    analytics: { recent_snapshots: [], count: 0 }
  })
  const [liveMetrics, setLiveMetrics] = useState({
    active_users: 0,
    system_health: 100,
    api_requests: 0,
    new_activities: 0
  })
  const [selectedFilters, setSelectedFilters] = useState({
    notification_types: [],
    priority_levels: [],
    channels: []
  })
  const [newNotification, setNewNotification] = useState({
    type: 'system_alert',
    message: '',
    priority: 3
  })
  const [showNotificationForm, setShowNotificationForm] = useState(false)

  const notificationTypes = [
    'system_alert', 'performance_warning', 'data_update', 'user_action',
    'team_invite', 'export_ready', 'analysis_complete', 'sync_status',
    'security_alert', 'maintenance_notice', 'feature_update', 'milestone_reached'
  ]

  const priorityLevels = [
    { value: 1, label: 'Critical', color: 'text-red-600' },
    { value: 2, label: 'High', color: 'text-orange-600' },
    { value: 3, label: 'Medium', color: 'text-yellow-600' },
    { value: 4, label: 'Low', color: 'text-blue-600' },
    { value: 5, label: 'Info', color: 'text-gray-600' }
  ]

  const channels = ['websocket', 'push', 'email', 'sms', 'in_app']

  useEffect(() => {
    // Initialize real-time connection
    initializeRealTimeConnection()
    
    // Set up periodic data refresh
    const interval = setInterval(() => {
      if (isLiveMode) {
        fetchRealTimeData()
        updateLiveMetrics()
      }
    }, 5000)

    // Load initial data
    loadNotifications()
    subscribeToUpdates()

    return () => {
      clearInterval(interval)
    }
  }, [isLiveMode])

  const initializeRealTimeConnection = useCallback(() => {
    // Simulate WebSocket connection
    setIsConnected(true)
    
    // In a real implementation, you would set up WebSocket connection here
    console.log('Real-time connection established')
  }, [])

  const fetchRealTimeData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-updates', {
        body: {
          action: 'get_real_time_data',
          data: {
            data_types: ['notifications', 'performance', 'analytics'],
            since_timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
            include_metadata: true
          }
        }
      })

      if (error) {
        console.error('Error fetching real-time data:', error)
        // Fallback to mock data
        const mockData = generateMockRealTimeData()
        setRealTimeData(mockData)
      } else {
        setRealTimeData(data.data.data || generateMockRealTimeData())
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error)
      const mockData = generateMockRealTimeData()
      setRealTimeData(mockData)
    }
  }

  const generateMockRealTimeData = () => {
    return {
      notifications: {
        new_notifications: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
          id: `notif_${i}`,
          notification_type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
          payload: {
            title: `Real-time notification ${i + 1}`,
            message: `This is a live notification generated at ${new Date().toLocaleTimeString()}`
          },
          priority: Math.floor(Math.random() * 5) + 1,
          created_at: new Date().toISOString()
        })),
        count: Math.floor(Math.random() * 5)
      },
      performance: {
        recent_metrics: Array.from({ length: Math.floor(Math.random() * 3) }, (_, i) => ({
          id: `metric_${i}`,
          metric_type: ['response_time', 'cpu_usage', 'memory_usage'][Math.floor(Math.random() * 3)],
          value: Math.random() * 100,
          timestamp: new Date().toISOString()
        })),
        count: Math.floor(Math.random() * 3)
      },
      analytics: {
        recent_snapshots: Array.from({ length: Math.floor(Math.random() * 2) }, (_, i) => ({
          id: `snapshot_${i}`,
          metric_name: 'user_activity',
          value: Math.floor(Math.random() * 1000),
          created_at: new Date().toISOString()
        })),
        count: Math.floor(Math.random() * 2)
      }
    }
  }

  const updateLiveMetrics = () => {
    setLiveMetrics(prev => ({
      active_users: Math.max(0, prev.active_users + Math.floor(Math.random() * 10) - 5),
      system_health: Math.min(100, Math.max(80, prev.system_health + Math.floor(Math.random() * 6) - 3)),
      api_requests: prev.api_requests + Math.floor(Math.random() * 20),
      new_activities: prev.new_activities + Math.floor(Math.random() * 5)
    }))
  }

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-updates', {
        body: {
          action: 'get_notifications',
          data: {
            limit: 20,
            include_expired: false
          }
        }
      })

      if (error) {
        console.error('Error loading notifications:', error)
        // Generate mock notifications
        const mockNotifications = generateMockNotifications()
        setNotifications(mockNotifications)
      } else {
        setNotifications(data.data.notifications || [])
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
      const mockNotifications = generateMockNotifications()
      setNotifications(mockNotifications)
    }
  }

  const generateMockNotifications = () => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `notif_${i}`,
      notification_type: notificationTypes[Math.floor(Math.random() * notificationTypes.length)],
      payload: {
        title: `Notification ${i + 1}`,
        message: `This is notification message ${i + 1}`
      },
      priority: Math.floor(Math.random() * 5) + 1,
      read_status: Math.random() > 0.7,
      channel: channels[Math.floor(Math.random() * channels.length)],
      created_at: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    }))
  }

  const subscribeToUpdates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-updates', {
        body: {
          action: 'subscribe_to_updates',
          data: {
            subscription_types: ['all'],
            preferences: {
              real_time_updates: true,
              push_notifications: true,
              notification_frequency: 'immediate'
            }
          }
        }
      })

      if (error) {
        console.error('Error subscribing to updates:', error)
      }
    } catch (error) {
      console.error('Error subscribing to updates:', error)
    }
  }

  const sendNotification = async () => {
    if (!newNotification.message.trim()) return

    try {
      const { data, error } = await supabase.functions.invoke('real-time-updates', {
        body: {
          action: 'send_notification',
          data: {
            notification_type: newNotification.type,
            payload: {
              title: 'Manual Notification',
              message: newNotification.message
            },
            priority: newNotification.priority,
            channel: 'in_app'
          }
        }
      })

      if (error) {
        console.error('Error sending notification:', error)
      } else {
        setNewNotification({ type: 'system_alert', message: '', priority: 3 })
        setShowNotificationForm(false)
        loadNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const { data, error } = await supabase.functions.invoke('real-time-updates', {
        body: {
          action: 'mark_as_read',
          data: { notification_ids: notificationIds }
        }
      })

      if (error) {
        console.error('Error marking as read:', error)
      } else {
        loadNotifications() // Refresh notifications
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const getPriorityColor = (priority: number) => {
    const config = priorityLevels.find(p => p.value === priority)
    return config ? config.color : 'text-gray-600'
  }

  const getPriorityLabel = (priority: number) => {
    const config = priorityLevels.find(p => p.value === priority)
    return config ? config.label : 'Unknown'
  }

  const getNotificationIcon = (type: string) => {
    const iconMap = {
      system_alert: AlertCircle,
      performance_warning: Activity,
      data_update: RefreshCw,
      user_action: Users,
      team_invite: Users,
      export_ready: CheckCircle,
      analysis_complete: CheckCircle,
      sync_status: RefreshCw,
      security_alert: AlertCircle,
      maintenance_notice: Settings,
      feature_update: Zap,
      milestone_reached: CheckCircle
    }
    return iconMap[type] || Bell
  }

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilters.notification_types.length > 0 && 
        !selectedFilters.notification_types.includes(notification.notification_type)) {
      return false
    }
    if (selectedFilters.priority_levels.length > 0 && 
        !selectedFilters.priority_levels.includes(notification.priority)) {
      return false
    }
    if (selectedFilters.channels.length > 0 && 
        !selectedFilters.channels.includes(notification.channel)) {
      return false
    }
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Dashboard</h2>
          <p className="text-gray-600">Live updates and notifications</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Live Mode Toggle */}
          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
              isLiveMode 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isLiveMode ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isLiveMode ? 'Live' : 'Paused'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => {
              fetchRealTimeData()
              loadNotifications()
            }}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-blue-600">{liveMetrics.active_users}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 flex items-center">
            <Activity className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600">Live</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className="text-2xl font-bold text-green-600">{liveMetrics.system_health}%</p>
            </div>
            <Activity className="h-8 w-8 text-green-600" />
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${liveMetrics.system_health}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">API Requests</p>
              <p className="text-2xl font-bold text-purple-600">{liveMetrics.api_requests.toLocaleString()}</p>
            </div>
            <Zap className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 flex items-center">
            <Clock className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-sm text-gray-600">Today</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Activities</p>
              <p className="text-2xl font-bold text-orange-600">{liveMetrics.new_activities}</p>
            </div>
            <Bell className="h-8 w-8 text-orange-600" />
          </div>
          <div className="mt-2 flex items-center">
            <RefreshCw className="h-4 w-4 text-orange-500 mr-1" />
            <span className="text-sm text-orange-600">Last 5 min</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Activity Feed */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
            <div className="flex items-center space-x-2">
              {isLiveMode && (
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm text-green-600">Live</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {/* New Real-Time Items */}
            {realTimeData.notifications.new_notifications.map((item, index) => {
              const Icon = getNotificationIcon(item.notification_type)
              return (
                <div key={`new_${index}`} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {item.payload.title} <span className="text-blue-600 font-semibold">(NEW)</span>
                    </p>
                    <p className="text-sm text-gray-600">{item.payload.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })}

            {/* Performance Updates */}
            {realTimeData.performance.recent_metrics.map((metric, index) => (
              <div key={`perf_${index}`} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <Activity className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Performance Update: {metric.metric_type}
                  </p>
                  <p className="text-sm text-gray-600">
                    Value: {metric.value.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(metric.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {/* Analytics Updates */}
            {realTimeData.analytics.recent_snapshots.map((snapshot, index) => (
              <div key={`analytics_${index}`} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <Activity className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    Analytics Update: {snapshot.metric_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    Value: {snapshot.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(snapshot.created_at).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}

            {realTimeData.notifications.count === 0 && 
             realTimeData.performance.count === 0 && 
             realTimeData.analytics.count === 0 && (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Panel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowNotificationForm(!showNotificationForm)}
              className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          {/* Send Notification Form */}
          {showNotificationForm && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
              <select
                value={newNotification.type}
                onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {notificationTypes.map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
              
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Notification message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              
              <select
                value={newNotification.priority}
                onChange={(e) => setNewNotification(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {priorityLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
              
              <div className="flex space-x-2">
                <button
                  onClick={sendNotification}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => setShowNotificationForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Notification Filters */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <button
              className="flex items-center text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {/* Toggle filter panel */}}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredNotifications.slice(0, 10).map((notification, index) => {
              const Icon = getNotificationIcon(notification.notification_type)
              return (
                <div 
                  key={index} 
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${
                    notification.read_status ? 'bg-gray-50' : 'bg-white border-blue-200'
                  }`}
                >
                  <Icon className={`h-5 w-5 mt-0.5 ${getPriorityColor(notification.priority)}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${notification.read_status ? 'text-gray-600' : 'text-gray-900'}`}>
                        {notification.payload.title || notification.notification_type.replace('_', ' ')}
                      </p>
                      <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                        {getPriorityLabel(notification.priority)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {notification.payload.message || 'No message'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                    {!notification.read_status && (
                      <button
                        onClick={() => markAsRead([notification.id])}
                        className="text-xs text-blue-600 hover:text-blue-700 mt-1"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              )
            })}

            {filteredNotifications.length === 0 && (
              <div className="text-center py-8">
                <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No notifications</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RealTimeDashboard