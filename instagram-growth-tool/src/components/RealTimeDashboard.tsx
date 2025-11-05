import React, { useState, useEffect, useCallback } from 'react';
import { 
  Radio, 
  Bell, 
  Users, 
  TrendingUp, 
  MessageSquare, 
  Heart,
  Eye,
  Share2,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Pause,
  Play,
  Settings,
  Filter
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface RealtimeNotification {
  id: string;
  type: string;
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  metadata?: any;
}

interface LiveMetric {
  id: string;
  name: string;
  value: number | string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

interface ActivityItem {
  id: string;
  type: 'follower' | 'like' | 'comment' | 'share' | 'mention';
  user: string;
  action: string;
  timestamp: string;
  metadata?: any;
}

const RealTimeDashboard: React.FC = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [filter, setFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    initializeRealtimeConnection();
    loadInitialData();

    return () => {
      // Cleanup subscriptions
    };
  }, []);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(updateLiveMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isPaused]);

  useEffect(() => {
    const unread = notifications.filter(n => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const initializeRealtimeConnection = async () => {
    try {
      // Simulate WebSocket connection
      setIsConnected(true);
      
      // In a real implementation, you would set up Supabase realtime subscriptions
      const subscription = supabase
        .channel('notifications')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'real_time_notifications' },
          handleNewNotification
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error initializing realtime connection:', error);
      setIsConnected(false);
    }
  };

  const handleNewNotification = useCallback((payload: any) => {
    const notification: RealtimeNotification = {
      id: payload.new.id,
      type: payload.new.notification_type,
      priority: payload.new.priority || 'medium',
      title: payload.new.payload?.title || 'New Notification',
      message: payload.new.payload?.message || 'You have a new notification',
      timestamp: payload.new.created_at,
      read: false,
      metadata: payload.new.payload
    };

    setNotifications(prev => [notification, ...prev.slice(0, 49)]); // Keep last 50
    generateActivity();
  }, []);

  const loadInitialData = async () => {
    try {
      // Load recent notifications
      const { data: notificationData } = await supabase
        .from('real_time_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (notificationData && notificationData.length > 0) {
        const processedNotifications: RealtimeNotification[] = notificationData.map(item => ({
          id: item.id,
          type: item.notification_type,
          priority: item.priority || 'medium',
          title: item.payload?.title || 'Notification',
          message: item.payload?.message || 'You have a notification',
          timestamp: item.created_at,
          read: item.read_status === 'read',
          metadata: item.payload
        }));
        setNotifications(processedNotifications);
      } else {
        // Generate sample notifications
        generateSampleNotifications();
      }

      // Initialize live metrics
      updateLiveMetrics();
      generateActivity();

    } catch (error) {
      console.error('Error loading initial data:', error);
      generateSampleNotifications();
      updateLiveMetrics();
      generateActivity();
    }
  };

  const generateSampleNotifications = () => {
    const sampleNotifications: RealtimeNotification[] = [
      {
        id: '1',
        type: 'engagement',
        priority: 'high',
        title: 'High Engagement Alert',
        message: 'Your latest post is performing 150% above average!',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        read: false,
        metadata: { post_id: 'post_123', engagement_rate: 8.5 }
      },
      {
        id: '2',
        type: 'follower',
        priority: 'medium',
        title: 'New Followers',
        message: '+25 new followers in the last hour',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        read: false,
        metadata: { count: 25 }
      },
      {
        id: '3',
        type: 'mention',
        priority: 'medium',
        title: 'Brand Mention',
        message: 'You were mentioned by @influencer_account',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        read: true,
        metadata: { mentioned_by: '@influencer_account' }
      },
      {
        id: '4',
        type: 'system',
        priority: 'low',
        title: 'Analytics Update',
        message: 'Weekly analytics report is now available',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        read: true,
        metadata: { report_type: 'weekly' }
      }
    ];

    setNotifications(sampleNotifications);
  };

  const updateLiveMetrics = () => {
    const metrics: LiveMetric[] = [
      {
        id: 'followers',
        name: 'Followers',
        value: Math.floor(Math.random() * 1000) + 45000,
        change: Math.random() * 10 - 5,
        icon: Users,
        color: 'text-blue-600'
      },
      {
        id: 'engagement',
        name: 'Engagement Rate',
        value: `${(Math.random() * 5 + 2).toFixed(1)}%`,
        change: Math.random() * 2 - 1,
        icon: Heart,
        color: 'text-red-600'
      },
      {
        id: 'reach',
        name: 'Today\'s Reach',
        value: Math.floor(Math.random() * 5000) + 15000,
        change: Math.random() * 20 - 10,
        icon: Eye,
        color: 'text-green-600'
      },
      {
        id: 'interactions',
        name: 'Interactions',
        value: Math.floor(Math.random() * 200) + 500,
        change: Math.random() * 15 - 7.5,
        icon: MessageSquare,
        color: 'text-purple-600'
      }
    ];

    setLiveMetrics(metrics);
  };

  const generateActivity = () => {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'follower',
        user: '@new_follower_123',
        action: 'started following you',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        type: 'like',
        user: '@engaged_user',
        action: 'liked your latest post',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        type: 'comment',
        user: '@active_commenter',
        action: 'commented on your post',
        timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString()
      },
      {
        id: '4',
        type: 'share',
        user: '@content_sharer',
        action: 'shared your post to their story',
        timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
      },
      {
        id: '5',
        type: 'mention',
        user: '@brand_partner',
        action: 'mentioned you in their post',
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString()
      }
    ];

    setRecentActivity(activities);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Update in database
      await supabase
        .from('real_time_notifications')
        .update({ read_status: 'read' })
        .eq('id', notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('real_time_notifications')
          .update({ read_status: 'read' })
          .in('id', unreadIds);

        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const sendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const response = await fetch(`${supabaseUrl}/functions/v1/real-time-updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          type: 'notify',
          notification: {
            user_id: user.id,
            notification_type: 'test',
            priority: 'medium',
            payload: {
              title: 'Test Notification',
              message: 'This is a test notification from the real-time dashboard'
            }
          }
        })
      });

      if (response.ok) {
        console.log('Test notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertCircle;
      case 'medium': return Info;
      case 'low': return CheckCircle;
      default: return Bell;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'follower': return Users;
      case 'like': return Heart;
      case 'comment': return MessageSquare;
      case 'share': return Share2;
      case 'mention': return Bell;
      default: return Bell;
    }
  };

  const getTimeAgo = (timestamp: string) => {
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

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || n.priority === filter
  );

  return (
    <div className="space-y-6">
      {/* Connection Status & Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
              <Radio className={`w-6 h-6 ${isConnected ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Real-Time Dashboard</h2>
              <p className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Connected • Live updates active' : 'Disconnected • Retrying...'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`p-2 rounded-lg ${isPaused ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}
              title={isPaused ? 'Resume updates' : 'Pause updates'}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <button
              onClick={sendTestNotification}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:shadow-md transition-shadow"
            >
              Send Test
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {liveMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <TrendingUp 
                    className={`w-4 h-4 ${
                      metric.change > 0 ? 'text-green-500' : 
                      metric.change < 0 ? 'text-red-500 rotate-180' : 'text-gray-400'
                    }`} 
                  />
                </div>
                <h3 className="font-medium text-gray-900 text-sm">{metric.name}</h3>
                <div className="flex items-baseline space-x-2">
                  <span className="text-xl font-bold text-gray-800">{metric.value}</span>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Notifications
                  {unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">All</option>
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="px-3 py-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 max-h-96 overflow-y-auto">
            {filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const PriorityIcon = getPriorityIcon(notification.priority);
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-l-4 rounded-lg ${getPriorityColor(notification.priority)} ${
                        !notification.read ? 'border-r-4 border-r-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <PriorityIcon className="w-5 h-5 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{getTimeAgo(notification.timestamp)}</span>
                              <span className="capitalize">{notification.priority} priority</span>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No notifications match your filter</p>
                <p className="text-sm text-gray-500 mt-1">Check back later for updates</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-gray-600 text-sm">Latest account interactions</p>
          </div>
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span>{' '}
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeDashboard;