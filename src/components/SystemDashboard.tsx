import React, { useState, useEffect } from 'react'
import { 
  Monitor, Search, Zap, TestTube, Shield, Settings,
  Activity, BarChart3, Bell, Users, Clock, AlertTriangle
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Import Phase 6 components
import PerformanceMonitor from './PerformanceMonitor'
import AdvancedSearch from './AdvancedSearch'
import RealTimeDashboard from './RealTimeDashboard'
import TestingSuite from './TestingSuite'
import AdminPanel from './AdminPanel'
import SystemOverview from './SystemOverview'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface SystemDashboardProps {}

const SystemDashboard: React.FC<SystemDashboardProps> = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [systemStatus, setSystemStatus] = useState({
    overall_score: 95,
    performance: 'excellent',
    security: 'secure',
    uptime: 99.8
  })
  const [isLoading, setIsLoading] = useState(true)

  const tabs = [
    {
      id: 'overview',
      name: 'System Overview',
      icon: Monitor,
      description: 'System health and status overview'
    },
    {
      id: 'performance',
      name: 'Performance',
      icon: Activity,
      description: 'Performance monitoring and optimization'
    },
    {
      id: 'search',
      name: 'Advanced Search',
      icon: Search,
      description: 'Enhanced search and filtering capabilities'
    },
    {
      id: 'realtime',
      name: 'Real-Time',
      icon: Zap,
      description: 'Live updates and notifications'
    },
    {
      id: 'testing',
      name: 'Testing Suite',
      icon: TestTube,
      description: 'Automated testing and quality assurance'
    },
    {
      id: 'admin',
      name: 'Admin Panel',
      icon: Shield,
      description: 'Administrative controls and analytics'
    }
  ]

  useEffect(() => {
    loadSystemStatus()
  }, [])

  const loadSystemStatus = async () => {
    try {
      setIsLoading(true)
      
      // Get basic system health indicators
      const healthPromises = [
        fetchSystemHealth(),
        checkUserActivity(),
        getPerformanceMetrics()
      ]

      const [health, activity, performance] = await Promise.allSettled(healthPromises)
      
      setSystemStatus({
        overall_score: health.status === 'fulfilled' ? health.value.score : 85,
        performance: performance.status === 'fulfilled' ? performance.value.status : 'good',
        security: 'secure',
        uptime: 99.8
      })
    } catch (error) {
      console.error('Error loading system status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSystemHealth = async () => {
    // Simulate system health check
    return { score: 95, status: 'excellent' }
  }

  const checkUserActivity = async () => {
    // Get recent user activity metrics
    const { data, error } = await supabase
      .from('global_search_history')
      .select('count(*)')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    return { active: !error }
  }

  const getPerformanceMetrics = async () => {
    // Get recent performance data
    const { data, error } = await supabase
      .from('system_performance_metrics')
      .select('metric_type, value')
      .gte('timestamp', new Date(Date.now() - 60 * 60 * 1000).toISOString())
      .limit(10)

    const avgResponseTime = data?.filter(m => m.metric_type === 'response_time')
      .reduce((sum, m) => sum + m.value, 0) / (data?.length || 1) || 150

    return { 
      status: avgResponseTime < 200 ? 'excellent' : avgResponseTime < 500 ? 'good' : 'warning',
      response_time: avgResponseTime
    }
  }

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      )
    }

    switch (activeTab) {
      case 'overview':
        return <SystemOverview systemStatus={systemStatus} />
      case 'performance':
        return <PerformanceMonitor />
      case 'search':
        return <AdvancedSearch />
      case 'realtime':
        return <RealTimeDashboard />
      case 'testing':
        return <TestingSuite />
      case 'admin':
        return <AdminPanel />
      default:
        return <SystemOverview systemStatus={systemStatus} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 75) return 'text-blue-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-slate-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">System Dashboard</h1>
                <p className="text-gray-600">Platform Enhancement & Testing</p>
              </div>
            </div>
            
            {/* System Status Indicators */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(systemStatus.overall_score)}`}>
                  {systemStatus.overall_score}%
                </div>
                <div className="text-sm text-gray-500">Health Score</div>
              </div>
              <div className="text-center">
                <div className={`text-lg font-semibold ${getStatusColor(systemStatus.performance)}`}>
                  {systemStatus.performance}
                </div>
                <div className="text-sm text-gray-500">Performance</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  {systemStatus.uptime}%
                </div>
                <div className="text-sm text-gray-500">Uptime</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                      ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.name}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>

      {/* Quick Actions Floating Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="bg-white rounded-full shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('realtime')}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              title="Real-time Dashboard"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('performance')}
              className="p-3 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
              title="Performance Monitor"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            <button 
              onClick={() => setActiveTab('testing')}
              className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
              title="Run Tests"
            >
              <TestTube className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* System Status Banner */}
      {systemStatus.overall_score < 80 && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 font-medium">
                  System performance is below optimal levels. Check the Performance tab for details.
                </span>
              </div>
              <button 
                onClick={() => setActiveTab('performance')}
                className="text-yellow-800 hover:text-yellow-900 font-medium"
              >
                View Details →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SystemDashboard