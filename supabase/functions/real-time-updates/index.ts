import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      case 'send_notification':
        return await sendNotification(supabaseClient, user.id, data)
      case 'get_notifications':
        return await getNotifications(supabaseClient, user.id, data)
      case 'mark_as_read':
        return await markAsRead(supabaseClient, user.id, data)
      case 'subscribe_to_updates':
        return await subscribeToUpdates(supabaseClient, user.id, data)
      case 'get_real_time_data':
        return await getRealTimeData(supabaseClient, user.id, data)
      case 'broadcast_to_team':
        return await broadcastToTeam(supabaseClient, user.id, data)
      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('Error in real-time-updates:', error)
    return new Response(
      JSON.stringify({ 
        error: {
          code: 'REAL_TIME_UPDATES_ERROR',
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

async function sendNotification(supabaseClient: any, userId: string, data: any) {
  const { 
    notification_type, 
    payload, 
    priority = 3, 
    channel = 'websocket',
    expires_in_hours = 24,
    target_user_id 
  } = data

  if (!notification_type || !payload) {
    throw new Error('notification_type and payload are required')
  }

  const targetUserId = target_user_id || userId
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expires_in_hours)

  // Insert notification into real_time_notifications table
  const { data: notification, error: insertError } = await supabaseClient
    .from('real_time_notifications')
    .insert({
      user_id: targetUserId,
      notification_type,
      payload,
      priority,
      channel,
      expires_at: expiresAt.toISOString(),
      delivery_status: 'pending'
    })
    .select()
    .single()

  if (insertError) {
    throw new Error(`Failed to create notification: ${insertError.message}`)
  }

  // Attempt to deliver notification immediately
  const deliveryResult = await attemptDelivery(supabaseClient, notification, channel)

  // Update delivery status
  await supabaseClient
    .from('real_time_notifications')
    .update({ 
      delivery_status: deliveryResult.success ? 'delivered' : 'failed',
      delivered_at: deliveryResult.success ? new Date().toISOString() : null
    })
    .eq('id', notification.id)

  // Generate real-time update event
  const updateEvent = {
    type: 'notification',
    data: notification,
    timestamp: new Date().toISOString(),
    user_id: targetUserId
  }

  return new Response(
    JSON.stringify({ 
      data: {
        notification,
        delivery_result: deliveryResult,
        real_time_event: updateEvent
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function getNotifications(supabaseClient: any, userId: string, data: any) {
  const { 
    read_status,
    priority_filter,
    limit = 50,
    offset = 0,
    include_expired = false
  } = data || {}

  let query = supabaseClient
    .from('real_time_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (read_status !== undefined) {
    query = query.eq('read_status', read_status)
  }

  if (priority_filter) {
    if (Array.isArray(priority_filter)) {
      query = query.in('priority', priority_filter)
    } else {
      query = query.eq('priority', priority_filter)
    }
  }

  if (!include_expired) {
    query = query.gt('expires_at', new Date().toISOString())
  }

  query = query.range(offset, offset + limit - 1)

  const { data: notifications, error } = await query

  if (error) {
    throw new Error(`Failed to fetch notifications: ${error.message}`)
  }

  // Get unread count
  const { count: unreadCount } = await supabaseClient
    .from('real_time_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read_status', false)
    .gt('expires_at', new Date().toISOString())

  // Group notifications by type and priority
  const grouped = groupNotifications(notifications)
  const summary = generateNotificationSummary(notifications)

  return new Response(
    JSON.stringify({ 
      data: {
        notifications,
        unread_count: unreadCount || 0,
        grouped_notifications: grouped,
        summary,
        has_more: notifications.length === limit
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function markAsRead(supabaseClient: any, userId: string, data: any) {
  const { notification_ids, mark_all = false } = data

  if (!mark_all && (!notification_ids || !Array.isArray(notification_ids))) {
    throw new Error('notification_ids array is required when mark_all is false')
  }

  let query = supabaseClient
    .from('real_time_notifications')
    .update({ 
      read_status: true,
      read_at: new Date().toISOString() 
    })
    .eq('user_id', userId)

  if (!mark_all) {
    query = query.in('id', notification_ids)
  }

  const { data: updatedNotifications, error } = await query.select()

  if (error) {
    throw new Error(`Failed to mark notifications as read: ${error.message}`)
  }

  return new Response(
    JSON.stringify({ 
      data: {
        updated_count: updatedNotifications.length,
        updated_notifications: updatedNotifications
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function subscribeToUpdates(supabaseClient: any, userId: string, data: any) {
  const { 
    subscription_types = ['all'],
    preferences = {} 
  } = data

  // Store subscription preferences (this would typically be in a user preferences table)
  const subscriptionData = {
    user_id: userId,
    subscription_types,
    preferences: {
      email_notifications: preferences.email_notifications || false,
      push_notifications: preferences.push_notifications || true,
      sms_notifications: preferences.sms_notifications || false,
      real_time_updates: preferences.real_time_updates || true,
      notification_frequency: preferences.notification_frequency || 'immediate',
      quiet_hours: preferences.quiet_hours || { start: '22:00', end: '08:00' },
      ...preferences
    },
    subscribed_at: new Date().toISOString()
  }

  // In a real implementation, you would store this in a user_subscriptions table
  // For now, we'll return the subscription confirmation

  // Create a welcome notification
  await supabaseClient
    .from('real_time_notifications')
    .insert({
      user_id: userId,
      notification_type: 'system_alert',
      payload: {
        title: 'Real-time Updates Enabled',
        message: 'You are now subscribed to real-time updates',
        subscription_types
      },
      priority: 3,
      channel: 'in_app'
    })

  return new Response(
    JSON.stringify({ 
      data: {
        subscription: subscriptionData,
        status: 'subscribed',
        message: 'Successfully subscribed to real-time updates'
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function getRealTimeData(supabaseClient: any, userId: string, data: any) {
  const { 
    data_types = ['notifications', 'analytics', 'performance'],
    since_timestamp,
    include_metadata = true
  } = data

  const sinceDate = since_timestamp ? new Date(since_timestamp) : new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes

  const realTimeData: any = {
    timestamp: new Date().toISOString(),
    user_id: userId,
    data: {}
  }

  // Fetch notifications updates
  if (data_types.includes('notifications')) {
    const { data: recentNotifications } = await supabaseClient
      .from('real_time_notifications')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false })

    realTimeData.data.notifications = {
      new_notifications: recentNotifications || [],
      count: recentNotifications?.length || 0
    }
  }

  // Fetch performance metrics updates
  if (data_types.includes('performance')) {
    const { data: performanceMetrics } = await supabaseClient
      .from('system_performance_metrics')
      .select('*')
      .eq('user_id', userId)
      .gte('timestamp', sinceDate.toISOString())
      .order('timestamp', { ascending: false })
      .limit(50)

    realTimeData.data.performance = {
      recent_metrics: performanceMetrics || [],
      count: performanceMetrics?.length || 0
    }
  }

  // Fetch analytics updates
  if (data_types.includes('analytics')) {
    const { data: analyticsData } = await supabaseClient
      .from('analytics_snapshots')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', sinceDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10)

    realTimeData.data.analytics = {
      recent_snapshots: analyticsData || [],
      count: analyticsData?.length || 0
    }
  }

  // Add system status if requested
  if (include_metadata) {
    realTimeData.metadata = {
      server_time: new Date().toISOString(),
      data_freshness: 'real-time',
      next_update_in: '60s',
      connection_status: 'active'
    }
  }

  return new Response(
    JSON.stringify({ 
      data: realTimeData
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function broadcastToTeam(supabaseClient: any, userId: string, data: any) {
  const { 
    notification_type,
    payload,
    priority = 3,
    channel = 'websocket',
    team_id
  } = data

  if (!notification_type || !payload) {
    throw new Error('notification_type and payload are required')
  }

  // Get team members
  let teamMembersQuery = supabaseClient
    .from('team_members')
    .select('user_id, role, status, team_management(*)')

  if (team_id) {
    teamMembersQuery = teamMembersQuery.eq('team_id', team_id)
  } else {
    // Get teams owned by the current user
    teamMembersQuery = teamMembersQuery
      .eq('team_management.owner_id', userId)
  }

  const { data: teamMembers, error: teamError } = await teamMembersQuery
    .eq('status', 'active')

  if (teamError) {
    throw new Error(`Failed to fetch team members: ${teamError.message}`)
  }

  if (!teamMembers || teamMembers.length === 0) {
    throw new Error('No active team members found')
  }

  // Create notifications for each team member
  const notifications = teamMembers.map(member => ({
    user_id: member.user_id,
    notification_type,
    payload: {
      ...payload,
      broadcast: true,
      from_user: userId,
      team_id: member.team_id
    },
    priority,
    channel,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
  }))

  const { data: createdNotifications, error: createError } = await supabaseClient
    .from('real_time_notifications')
    .insert(notifications)
    .select()

  if (createError) {
    throw new Error(`Failed to create team notifications: ${createError.message}`)
  }

  // Attempt delivery for each notification
  const deliveryResults = await Promise.allSettled(
    createdNotifications.map(notification => 
      attemptDelivery(supabaseClient, notification, channel)
    )
  )

  // Update delivery statuses
  const statusUpdates = createdNotifications.map((notification, index) => {
    const result = deliveryResults[index]
    const success = result.status === 'fulfilled' && result.value.success
    
    return {
      id: notification.id,
      delivery_status: success ? 'delivered' : 'failed',
      delivered_at: success ? new Date().toISOString() : null
    }
  })

  // Batch update delivery statuses
  for (const update of statusUpdates) {
    await supabaseClient
      .from('real_time_notifications')
      .update({
        delivery_status: update.delivery_status,
        delivered_at: update.delivered_at
      })
      .eq('id', update.id)
  }

  const successCount = statusUpdates.filter(u => u.delivery_status === 'delivered').length

  return new Response(
    JSON.stringify({ 
      data: {
        total_notifications: createdNotifications.length,
        successful_deliveries: successCount,
        failed_deliveries: createdNotifications.length - successCount,
        team_members_count: teamMembers.length,
        notifications: createdNotifications
      }
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  )
}

async function attemptDelivery(supabaseClient: any, notification: any, channel: string) {
  // Simulate notification delivery based on channel
  try {
    switch (channel) {
      case 'websocket':
        // In a real implementation, this would use WebSocket connections
        console.log(`WebSocket delivery to user ${notification.user_id}:`, notification.payload)
        return { success: true, channel: 'websocket', timestamp: new Date().toISOString() }
      
      case 'push':
        // In a real implementation, this would use a push notification service
        console.log(`Push notification to user ${notification.user_id}:`, notification.payload)
        return { success: true, channel: 'push', timestamp: new Date().toISOString() }
      
      case 'email':
        // In a real implementation, this would use an email service
        console.log(`Email notification to user ${notification.user_id}:`, notification.payload)
        return { success: true, channel: 'email', timestamp: new Date().toISOString() }
      
      case 'sms':
        // In a real implementation, this would use an SMS service
        console.log(`SMS notification to user ${notification.user_id}:`, notification.payload)
        return { success: true, channel: 'sms', timestamp: new Date().toISOString() }
      
      case 'in_app':
        // In-app notifications are always successful as they're stored in the database
        return { success: true, channel: 'in_app', timestamp: new Date().toISOString() }
      
      default:
        throw new Error(`Unknown delivery channel: ${channel}`)
    }
  } catch (error) {
    console.error(`Delivery failed for ${channel}:`, error)
    return { success: false, channel, error: error.message, timestamp: new Date().toISOString() }
  }
}

function groupNotifications(notifications: any[]) {
  const grouped: any = {
    by_type: {},
    by_priority: {},
    by_read_status: { read: [], unread: [] }
  }

  notifications.forEach(notification => {
    // Group by type
    if (!grouped.by_type[notification.notification_type]) {
      grouped.by_type[notification.notification_type] = []
    }
    grouped.by_type[notification.notification_type].push(notification)

    // Group by priority
    if (!grouped.by_priority[notification.priority]) {
      grouped.by_priority[notification.priority] = []
    }
    grouped.by_priority[notification.priority].push(notification)

    // Group by read status
    if (notification.read_status) {
      grouped.by_read_status.read.push(notification)
    } else {
      grouped.by_read_status.unread.push(notification)
    }
  })

  return grouped
}

function generateNotificationSummary(notifications: any[]) {
  const summary = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read_status).length,
    high_priority: notifications.filter(n => n.priority <= 2).length,
    critical: notifications.filter(n => n.priority === 1).length,
    recent: notifications.filter(n => {
      const notificationTime = new Date(n.created_at).getTime()
      const oneHourAgo = Date.now() - (60 * 60 * 1000)
      return notificationTime >= oneHourAgo
    }).length,
    types: {} as any
  }

  // Count by type
  notifications.forEach(notification => {
    summary.types[notification.notification_type] = 
      (summary.types[notification.notification_type] || 0) + 1
  })

  return summary
}