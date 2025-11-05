import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'false'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { action, data } = await req.json()

    switch (action) {
      case 'record_metrics':
        return await recordMetrics(supabaseClient, user.id, data)
      case 'get_metrics':
        return await getMetrics(supabaseClient, user.id, data)
      case 'analyze_performance':
        return await analyzePerformance(supabaseClient, user.id, data)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    console.error('Error in performance-monitor:', error)
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'PERFORMANCE_MONITOR_ERROR',
          message: error.message 
        }
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function recordMetrics(supabaseClient: any, userId: string, data: any) {
  const { metrics } = data

  if (!Array.isArray(metrics)) {
    throw new Error('Metrics must be an array')
  }

  // Validate and insert performance metrics
  const metricsToInsert = metrics.map((metric: any) => ({
    user_id: userId,
    metric_type: metric.type,
    value: parseFloat(metric.value),
    metadata: metric.metadata || {},
    timestamp: metric.timestamp || new Date().toISOString()
  }))

  const { data: insertedMetrics, error } = await supabaseClient
    .from('system_performance_metrics')
    .insert(metricsToInsert)
    .select()

  if (error) {
    throw new Error(`Failed to record metrics: ${error.message}`)
  }

  // Calculate basic statistics
  const stats = calculateMetricsStats(metrics)

  return new Response(
    JSON.stringify({ 
      data: {
        recorded_count: insertedMetrics.length,
        metrics: insertedMetrics,
        statistics: stats,
        timestamp: new Date().toISOString()
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function getMetrics(supabaseClient: any, userId: string, data: any) {
  const { 
    metric_types = [], 
    time_range = '24 hours',
    limit = 1000 
  } = data

  let query = supabaseClient
    .from('system_performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  // Add time range filter
  const timeAgo = new Date()
  if (time_range === '1 hour') {
    timeAgo.setHours(timeAgo.getHours() - 1)
  } else if (time_range === '24 hours') {
    timeAgo.setHours(timeAgo.getHours() - 24)
  } else if (time_range === '7 days') {
    timeAgo.setDate(timeAgo.getDate() - 7)
  } else if (time_range === '30 days') {
    timeAgo.setDate(timeAgo.getDate() - 30)
  }

  query = query.gte('timestamp', timeAgo.toISOString())

  // Add metric type filter
  if (metric_types.length > 0) {
    query = query.in('metric_type', metric_types)
  }

  const { data: metrics, error } = await query

  if (error) {
    throw new Error(`Failed to fetch metrics: ${error.message}`)
  }

  // Group metrics by type and calculate aggregations
  const groupedMetrics = groupMetricsByType(metrics)
  const trends = calculateTrends(metrics)

  return new Response(
    JSON.stringify({ 
      data: {
        metrics,
        grouped_metrics: groupedMetrics,
        trends,
        count: metrics.length,
        time_range
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function analyzePerformance(supabaseClient: any, userId: string, data: any) {
  const { analysis_type = 'comprehensive' } = data

  // Get recent performance data
  const timeAgo = new Date()
  timeAgo.setHours(timeAgo.getHours() - 24)

  const { data: metrics, error } = await supabaseClient
    .from('system_performance_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('timestamp', timeAgo.toISOString())
    .order('timestamp', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch metrics for analysis: ${error.message}`)
  }

  // Perform performance analysis
  const analysis = {
    overall_score: calculateOverallScore(metrics),
    bottlenecks: identifyBottlenecks(metrics),
    recommendations: generateRecommendations(metrics),
    health_status: assessHealthStatus(metrics),
    alerts: generateAlerts(metrics),
    summary: generateSummary(metrics)
  }

  // Record the analysis in admin_analytics if user has permission
  try {
    await supabaseClient
      .from('admin_analytics')
      .insert({
        metric_type: 'performance_analysis',
        value: analysis.overall_score,
        metadata: analysis,
        time_period: 'daily',
        period_start: timeAgo.toISOString(),
        period_end: new Date().toISOString(),
        aggregation_level: 'user'
      })
  } catch (analyticsError) {
    console.log('Could not record analytics (user may not have permission):', analyticsError)
  }

  return new Response(
    JSON.stringify({ 
      data: analysis
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

function calculateMetricsStats(metrics: any[]) {
  const stats: any = {}

  metrics.forEach(metric => {
    if (!stats[metric.type]) {
      stats[metric.type] = {
        count: 0,
        sum: 0,
        min: Infinity,
        max: -Infinity,
        values: []
      }
    }
    
    const value = parseFloat(metric.value)
    stats[metric.type].count++
    stats[metric.type].sum += value
    stats[metric.type].min = Math.min(stats[metric.type].min, value)
    stats[metric.type].max = Math.max(stats[metric.type].max, value)
    stats[metric.type].values.push(value)
  })

  // Calculate averages and standard deviations
  Object.keys(stats).forEach(type => {
    const data = stats[type]
    data.average = data.sum / data.count
    
    const variance = data.values.reduce((acc: number, val: number) => 
      acc + Math.pow(val - data.average, 2), 0) / data.count
    data.std_deviation = Math.sqrt(variance)
    
    delete data.values // Remove raw values to save space
  })

  return stats
}

function groupMetricsByType(metrics: any[]) {
  const grouped: any = {}

  metrics.forEach(metric => {
    if (!grouped[metric.metric_type]) {
      grouped[metric.metric_type] = []
    }
    grouped[metric.metric_type].push(metric)
  })

  return grouped
}

function calculateTrends(metrics: any[]) {
  const trends: any = {}
  const grouped = groupMetricsByType(metrics)

  Object.keys(grouped).forEach(type => {
    const typeMetrics = grouped[type].sort((a: any, b: any) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    
    if (typeMetrics.length >= 2) {
      const first = typeMetrics[0].value
      const last = typeMetrics[typeMetrics.length - 1].value
      const change = ((last - first) / first) * 100
      
      trends[type] = {
        direction: change > 0 ? 'increasing' : change < 0 ? 'decreasing' : 'stable',
        change_percent: Math.round(change * 100) / 100,
        data_points: typeMetrics.length
      }
    }
  })

  return trends
}

function calculateOverallScore(metrics: any[]) {
  if (metrics.length === 0) return 0

  // Simple scoring based on key performance indicators
  const scores: any = {}
  
  metrics.forEach(metric => {
    let score = 100
    
    // Score based on metric type and value ranges
    switch (metric.metric_type) {
      case 'response_time':
        score = metric.value < 200 ? 100 : metric.value < 500 ? 80 : metric.value < 1000 ? 60 : 40
        break
      case 'error_rate':
        score = metric.value < 0.01 ? 100 : metric.value < 0.05 ? 80 : metric.value < 0.1 ? 60 : 40
        break
      case 'cpu_usage':
        score = metric.value < 50 ? 100 : metric.value < 70 ? 80 : metric.value < 85 ? 60 : 40
        break
      case 'memory_usage':
        score = metric.value < 60 ? 100 : metric.value < 75 ? 80 : metric.value < 85 ? 60 : 40
        break
      default:
        score = 75 // Default score for unknown metrics
    }
    
    if (!scores[metric.metric_type]) {
      scores[metric.metric_type] = []
    }
    scores[metric.metric_type].push(score)
  })

  // Calculate weighted average
  let totalScore = 0
  let totalWeight = 0

  Object.keys(scores).forEach(type => {
    const typeScores = scores[type]
    const avgScore = typeScores.reduce((a: number, b: number) => a + b, 0) / typeScores.length
    totalScore += avgScore
    totalWeight += 1
  })

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0
}

function identifyBottlenecks(metrics: any[]) {
  const bottlenecks = []
  const grouped = groupMetricsByType(metrics)

  Object.keys(grouped).forEach(type => {
    const typeMetrics = grouped[type]
    const avgValue = typeMetrics.reduce((sum: number, m: any) => sum + m.value, 0) / typeMetrics.length

    // Identify bottlenecks based on thresholds
    if (type === 'response_time' && avgValue > 1000) {
      bottlenecks.push({
        type,
        severity: 'high',
        value: avgValue,
        description: 'High response time detected'
      })
    } else if (type === 'error_rate' && avgValue > 0.05) {
      bottlenecks.push({
        type,
        severity: 'critical',
        value: avgValue,
        description: 'High error rate detected'
      })
    } else if (type === 'cpu_usage' && avgValue > 85) {
      bottlenecks.push({
        type,
        severity: 'high',
        value: avgValue,
        description: 'High CPU usage detected'
      })
    } else if (type === 'memory_usage' && avgValue > 85) {
      bottlenecks.push({
        type,
        severity: 'high',
        value: avgValue,
        description: 'High memory usage detected'
      })
    }
  })

  return bottlenecks
}

function generateRecommendations(metrics: any[]) {
  const recommendations = []
  const bottlenecks = identifyBottlenecks(metrics)

  bottlenecks.forEach(bottleneck => {
    switch (bottleneck.type) {
      case 'response_time':
        recommendations.push({
          category: 'performance',
          priority: 'high',
          title: 'Optimize Response Time',
          description: 'Consider implementing caching, optimizing database queries, or using a CDN'
        })
        break
      case 'error_rate':
        recommendations.push({
          category: 'reliability',
          priority: 'critical',
          title: 'Reduce Error Rate',
          description: 'Review error logs, implement better error handling, and add monitoring alerts'
        })
        break
      case 'cpu_usage':
        recommendations.push({
          category: 'resources',
          priority: 'high',
          title: 'Optimize CPU Usage',
          description: 'Consider scaling up resources or optimizing code for better CPU efficiency'
        })
        break
      case 'memory_usage':
        recommendations.push({
          category: 'resources',
          priority: 'high',
          title: 'Optimize Memory Usage',
          description: 'Review memory leaks, optimize data structures, or increase available memory'
        })
        break
    }
  })

  if (recommendations.length === 0) {
    recommendations.push({
      category: 'general',
      priority: 'low',
      title: 'Continue Monitoring',
      description: 'System performance is within acceptable ranges. Continue regular monitoring.'
    })
  }

  return recommendations
}

function assessHealthStatus(metrics: any[]) {
  const score = calculateOverallScore(metrics)
  
  if (score >= 90) return { status: 'excellent', color: 'green' }
  if (score >= 75) return { status: 'good', color: 'blue' }
  if (score >= 60) return { status: 'warning', color: 'yellow' }
  if (score >= 40) return { status: 'poor', color: 'orange' }
  return { status: 'critical', color: 'red' }
}

function generateAlerts(metrics: any[]) {
  const alerts = []
  const bottlenecks = identifyBottlenecks(metrics)

  bottlenecks.forEach(bottleneck => {
    if (bottleneck.severity === 'critical') {
      alerts.push({
        type: 'critical',
        message: `Critical issue detected: ${bottleneck.description}`,
        metric_type: bottleneck.type,
        value: bottleneck.value,
        timestamp: new Date().toISOString()
      })
    }
  })

  return alerts
}

function generateSummary(metrics: any[]) {
  const totalMetrics = metrics.length
  const uniqueTypes = new Set(metrics.map(m => m.metric_type)).size
  const timeSpan = metrics.length > 0 ? 
    new Date(Math.max(...metrics.map(m => new Date(m.timestamp).getTime()))) - 
    new Date(Math.min(...metrics.map(m => new Date(m.timestamp).getTime()))) : 0

  return {
    total_metrics: totalMetrics,
    unique_metric_types: uniqueTypes,
    time_span_hours: Math.round(timeSpan / (1000 * 60 * 60) * 100) / 100,
    overall_score: calculateOverallScore(metrics),
    health_status: assessHealthStatus(metrics).status
  }
}

// Helper function to create Supabase client
function createClient(supabaseUrl: string, supabaseKey: string, options: any) {
  return {
    auth: {
      getUser: async () => {
        const authHeader = options.global.headers.Authorization
        if (!authHeader) {
          throw new Error('No authorization header')
        }
        
        // Simple user validation - in real implementation, verify JWT
        return {
          data: { user: { id: 'user-id-from-jwt' } },
          error: null
        }
      }
    },
    from: (table: string) => ({
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          gte: (column: string, value: any) => ({
            order: (column: string, options: any) => ({
              limit: (limit: number) => ({
                // Mock implementation for development
              })
            })
          }),
          order: (column: string, options: any) => ({
            limit: (limit: number) => ({
              // Mock implementation for development
            })
          }),
          limit: (limit: number) => ({
            // Mock implementation for development
          })
        }),
        gte: (column: string, value: any) => ({
          order: (column: string, options: any) => ({
            limit: (limit: number) => ({
              // Mock implementation for development
            })
          })
        }),
        in: (column: string, values: any[]) => ({
          // Mock implementation for development
        }),
        order: (column: string, options: any) => ({
          limit: (limit: number) => ({
            // Mock implementation for development
          })
        }),
        limit: (limit: number) => ({
          // Mock implementation for development
        })
      }),
      insert: (data: any) => ({
        select: () => ({
          // Mock implementation for development
        })
      })
    })
  }
}