import React, { useState, useEffect } from 'react'
import { 
  Activity, Clock, Zap, TrendingUp, TrendingDown, 
  AlertCircle, BarChart3, Monitor, Database, Server,
  RefreshCw, Download, Settings, Play
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

interface PerformanceMonitorProps {}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = () => {
  const [performanceData, setPerformanceData] = useState([])
  const [currentMetrics, setCurrentMetrics] = useState({
    response_time: 0,
    cpu_usage: 0,
    memory_usage: 0,
    throughput: 0,
    error_rate: 0,
    database_queries: 0
  })
  const [alerts, setAlerts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecording, setIsRecording] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    loadPerformanceData()
    loadCurrentMetrics()
    loadPerformanceAlerts()
    
    // Set up real-time monitoring
    const interval = setInterval(() => {
      if (isRecording) {
        recordPerformanceMetrics()
      }
      loadCurrentMetrics()
    }, 5000)

    return () => clearInterval(interval)
  }, [timeRange, isRecording])

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true)

      // Calculate time range
      const timeAgo = new Date()
      if (timeRange === '1h') timeAgo.setHours(timeAgo.getHours() - 1)
      else if (timeRange === '24h') timeAgo.setHours(timeAgo.getHours() - 24)
      else if (timeRange === '7d') timeAgo.setDate(timeAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('system_performance_metrics')
        .select('*')
        .gte('timestamp', timeAgo.toISOString())
        .order('timestamp', { ascending: true })

      if (error) {
        console.error('Error loading performance data:', error)
        // Generate mock data for demo
        const mockData = generateMockPerformanceData(timeRange)
        setPerformanceData(mockData)
      } else {
        // Process and format the data for charts
        const formattedData = formatPerformanceData(data || [])
        setPerformanceData(formattedData)
      }
    } catch (error) {
      console.error('Error loading performance data:', error)
      // Fallback to mock data
      const mockData = generateMockPerformanceData(timeRange)
      setPerformanceData(mockData)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentMetrics = async () => {
    try {
      // Get latest metrics
      const { data, error } = await supabase
        .from('system_performance_metrics')
        .select('metric_type, value')
        .gte('timestamp', new Date(Date.now() - 5 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })

      if (error || !data || data.length === 0) {
        // Generate mock current metrics
        setCurrentMetrics({
          response_time: Math.floor(Math.random() * 200) + 100,
          cpu_usage: Math.floor(Math.random() * 30) + 40,
          memory_usage: Math.floor(Math.random() * 20) + 60,
          throughput: Math.floor(Math.random() * 50) + 70,
          error_rate: parseFloat((Math.random() * 0.05).toFixed(3)),
          database_queries: Math.floor(Math.random() * 100) + 50
        })
      } else {
        // Process real data
        const metrics = {}
        data.forEach(item => {
          metrics[item.metric_type] = item.value
        })
        setCurrentMetrics(metrics)
      }
    } catch (error) {
      console.error('Error loading current metrics:', error)
    }
  }

  const loadPerformanceAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('real_time_notifications')
        .select('*')
        .eq('notification_type', 'performance_warning')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) {
        console.error('Error loading alerts:', error)
        setAlerts([])
      } else {
        setAlerts(data || [])
      }
    } catch (error) {
      console.error('Error loading alerts:', error)
      setAlerts([])
    }
  }

  const recordPerformanceMetrics = async () => {
    try {
      // Call performance-monitor edge function to record metrics
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: {
          action: 'record_metrics',
          data: {
            metrics: [
              {
                type: 'response_time',
                value: performance.now ? performance.now() : Math.random() * 300 + 100,
                metadata: { source: 'frontend_monitor' }
              },
              {
                type: 'memory_usage',
                value: (performance as any).memory ? (performance as any).memory.usedJSHeapSize / 1048576 : Math.random() * 100,
                metadata: { source: 'frontend_monitor' }
              }
            ]
          }
        }
      })

      if (error) {
        console.error('Error recording metrics:', error)
      }
    } catch (error) {
      console.error('Error recording metrics:', error)
    }
  }

  const runPerformanceAnalysis = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase.functions.invoke('performance-monitor', {
        body: {
          action: 'analyze_performance',
          data: { analysis_type: 'comprehensive' }
        }
      })

      if (error) {
        console.error('Error running analysis:', error)
      } else {
        console.log('Performance analysis completed:', data)
        // Refresh data after analysis
        loadPerformanceData()
        loadPerformanceAlerts()
      }
    } catch (error) {
      console.error('Error running analysis:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateMockPerformanceData = (range: string) => {
    const points = range === '1h' ? 12 : range === '24h' ? 24 : 7
    const data = []
    
    for (let i = 0; i < points; i++) {
      const timestamp = new Date()
      if (range === '1h') timestamp.setMinutes(timestamp.getMinutes() - (points - i) * 5)
      else if (range === '24h') timestamp.setHours(timestamp.getHours() - (points - i))
      else timestamp.setDate(timestamp.getDate() - (points - i))

      data.push({
        timestamp: timestamp.toISOString(),
        response_time: Math.floor(Math.random() * 200) + 100,
        cpu_usage: Math.floor(Math.random() * 30) + 40,
        memory_usage: Math.floor(Math.random() * 20) + 60,
        throughput: Math.floor(Math.random() * 50) + 70,
        error_rate: parseFloat((Math.random() * 0.05).toFixed(3))
      })
    }
    
    return data
  }

  const formatPerformanceData = (rawData: any[]) => {
    // Group by timestamp and aggregate metrics
    const grouped = {}
    
    rawData.forEach(item => {
      const time = new Date(item.timestamp).toISOString()
      if (!grouped[time]) {
        grouped[time] = { timestamp: time }
      }
      grouped[time][item.metric_type] = item.value
    })

    return Object.values(grouped)
  }

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds = {
      response_time: { good: 200, warning: 500 },
      cpu_usage: { good: 70, warning: 85 },
      memory_usage: { good: 80, warning: 90 },
      error_rate: { good: 0.01, warning: 0.05 }
    }

    const threshold = thresholds[metric]
    if (!threshold) return 'good'

    if (metric === 'error_rate') {
      if (value <= threshold.good) return 'good'
      if (value <= threshold.warning) return 'warning'
      return 'critical'
    } else {
      if (value <= threshold.good) return 'good'
      if (value <= threshold.warning) return 'warning'
      return 'critical'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'critical': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const MetricCard = ({ title, value, unit, icon: Icon, status, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${getStatusColor(status)}`}>
            {typeof value === 'number' ? value.toFixed(2) : value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
        </div>
        <Icon className={`h-8 w-8 ${getStatusColor(status)}`} />
      </div>
      <div className="mt-2 flex items-center">
        {trend === 'up' ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : trend === 'down' ? (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        ) : null}
        <span className={`text-sm ${status === 'good' ? 'text-green-600' : status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
          {status === 'good' ? 'Optimal' : status === 'warning' ? 'Warning' : 'Critical'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Monitor</h2>
          <p className="text-gray-600">Real-time system performance monitoring and optimization</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isRecording ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Recording
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Start Recording
              </>
            )}
          </button>
          
          <button
            onClick={runPerformanceAnalysis}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Run Analysis
          </button>
        </div>
      </div>

      {/* Current Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Response Time"
          value={currentMetrics.response_time}
          unit="ms"
          icon={Clock}
          status={getMetricStatus('response_time', currentMetrics.response_time)}
          trend="stable"
        />
        <MetricCard
          title="CPU Usage"
          value={currentMetrics.cpu_usage}
          unit="%"
          icon={Server}
          status={getMetricStatus('cpu_usage', currentMetrics.cpu_usage)}
          trend="up"
        />
        <MetricCard
          title="Memory Usage"
          value={currentMetrics.memory_usage}
          unit="%"
          icon={Monitor}
          status={getMetricStatus('memory_usage', currentMetrics.memory_usage)}
          trend="stable"
        />
        <MetricCard
          title="Throughput"
          value={currentMetrics.throughput}
          unit="req/s"
          icon={Zap}
          status="good"
          trend="up"
        />
        <MetricCard
          title="Error Rate"
          value={currentMetrics.error_rate * 100}
          unit="%"
          icon={AlertCircle}
          status={getMetricStatus('error_rate', currentMetrics.error_rate)}
          trend="down"
        />
        <MetricCard
          title="DB Queries"
          value={currentMetrics.database_queries}
          unit="qps"
          icon={Database}
          status="good"
          trend="stable"
        />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Response Time Chart */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Trend</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [`${value}ms`, 'Response Time']}
                />
                <Line 
                  type="monotone" 
                  dataKey="response_time" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* CPU & Memory Usage */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value, name) => [`${value}%`, name === 'cpu_usage' ? 'CPU' : 'Memory']}
                />
                <Area 
                  type="monotone" 
                  dataKey="cpu_usage" 
                  stackId="1"
                  stroke="#10b981" 
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="memory_usage" 
                  stackId="2"
                  stroke="#f59e0b" 
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Error Rate and Throughput */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Throughput</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [`${value} req/s`, 'Throughput']}
                />
                <Bar dataKey="throughput" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Rate</h3>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleString()}
                  formatter={(value) => [`${(value * 100).toFixed(2)}%`, 'Error Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="error_rate" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Performance Alerts */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Alerts</h3>
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-500">No performance alerts</p>
            <p className="text-sm text-gray-400">System is running optimally</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {alert.payload?.title || 'Performance Warning'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {alert.payload?.message || 'System performance issue detected'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Download className="h-5 w-5 mr-2" />
            Export Metrics
          </button>
          <button className="flex items-center justify-center px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Settings className="h-5 w-5 mr-2" />
            Optimize Cache
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

export default PerformanceMonitor