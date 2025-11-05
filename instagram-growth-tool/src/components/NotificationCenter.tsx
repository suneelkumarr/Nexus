import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Bell, BellRing, Check, X, Mail, AlertTriangle, Info, CheckCircle, Users, Calendar, Search, Filter, Trash2, EyeOff } from 'lucide-react';

interface Notification {
  id: string;
  user_id: string;
  team_id: string | null;
  notification_type: string;
  title: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  read_at: string | null;
  action_url: string | null;
  action_data: any;
  expires_at: string | null;
  sender_id: string | null;
  team_name?: string;
  sender_email?: string;
}

interface NotificationCenterProps {
  selectedAccount: string | null;
}

const NOTIFICATION_TYPES = {
  'team_invite': { name: 'Team Invitation', icon: Users, color: 'text-blue-600' },
  'team_join': { name: 'Team Member Joined', icon: Users, color: 'text-green-600' },
  'team_leave': { name: 'Team Member Left', icon: Users, color: 'text-orange-600' },
  'permission_granted': { name: 'Permission Granted', icon: CheckCircle, color: 'text-green-600' },
  'permission_revoked': { name: 'Permission Revoked', icon: AlertTriangle, color: 'text-red-600' },
  'export_ready': { name: 'Export Ready', icon: CheckCircle, color: 'text-blue-600' },
  'export_failed': { name: 'Export Failed', icon: AlertTriangle, color: 'text-red-600' },
  'report_generated': { name: 'Report Generated', icon: CheckCircle, color: 'text-green-600' },
  'account_connected': { name: 'Account Connected', icon: CheckCircle, color: 'text-green-600' },
  'account_sync_failed': { name: 'Sync Failed', icon: AlertTriangle, color: 'text-red-600' },
  'dashboard_shared': { name: 'Dashboard Shared', icon: Info, color: 'text-blue-600' },
  'mention': { name: 'Mention', icon: Mail, color: 'text-purple-600' },
  'comment': { name: 'Comment', icon: Mail, color: 'text-purple-600' },
  'approval_request': { name: 'Approval Request', icon: AlertTriangle, color: 'text-orange-600' },
  'approval_granted': { name: 'Approval Granted', icon: CheckCircle, color: 'text-green-600' },
  'approval_denied': { name: 'Approval Denied', icon: X, color: 'text-red-600' },
  'system_maintenance': { name: 'System Maintenance', icon: AlertTriangle, color: 'text-orange-600' },
  'feature_update': { name: 'Feature Update', icon: Info, color: 'text-blue-600' }
};

const PRIORITY_COLORS = {
  'low': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  'medium': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  'high': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'urgent': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
};

export default function NotificationCenter({ selectedAccount }: NotificationCenterProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user?.id}`
      }, (payload) => {
        console.log('New notification received:', payload);
        fetchNotifications();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError('');

      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          team_management(team_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get sender emails for notifications
      const notificationsWithSenders = await Promise.all(
        (data || []).map(async (notification) => {
          let senderEmail = 'System';
          if (notification.sender_id) {
            try {
              const { data: userData } = await supabase.auth.admin.getUserById(notification.sender_id);
              senderEmail = userData?.user?.email || 'Unknown';
            } catch {
              senderEmail = 'Unknown';
            }
          }
          
          return {
            ...notification,
            team_name: notification.team_management?.team_name,
            sender_email: senderEmail
          };
        })
      );

      setNotifications(notificationsWithSenders);
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      setError('');

      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'read',
          read_at: new Date().toISOString()
        })
        .in('id', notificationIds);

      if (error) throw error;

      fetchNotifications();
      setSelectedNotifications([]);
    } catch (error: any) {
      console.error('Error marking notifications as read:', error);
      setError(error.message);
    }
  };

  const markAsUnread = async (notificationIds: string[]) => {
    try {
      setError('');

      const { error } = await supabase
        .from('notifications')
        .update({
          status: 'unread',
          read_at: null
        })
        .in('id', notificationIds);

      if (error) throw error;

      fetchNotifications();
      setSelectedNotifications([]);
    } catch (error: any) {
      console.error('Error marking notifications as unread:', error);
      setError(error.message);
    }
  };

  const deleteNotifications = async (notificationIds: string[]) => {
    try {
      setError('');

      const confirmed = window.confirm(`Are you sure you want to delete ${notificationIds.length} notification(s)?`);
      if (!confirmed) return;

      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds);

      if (error) throw error;

      fetchNotifications();
      setSelectedNotifications([]);
    } catch (error: any) {
      console.error('Error deleting notifications:', error);
      setError(error.message);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (notification.status === 'unread') {
      await markAsRead([notification.id]);
    }

    // Navigate to action URL if provided
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  const toggleNotificationSelection = (notificationId: string) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const selectAllVisible = () => {
    const visibleIds = filteredNotifications.map(n => n.id);
    setSelectedNotifications(visibleIds);
  };

  const clearSelection = () => {
    setSelectedNotifications([]);
  };

  const getNotificationIcon = (type: string) => {
    const config = NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES];
    return config?.icon || Bell;
  };

  const getNotificationColor = (type: string) => {
    const config = NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES];
    return config?.color || 'text-gray-600';
  };

  const getNotificationTypeName = (type: string) => {
    const config = NOTIFICATION_TYPES[type as keyof typeof NOTIFICATION_TYPES];
    return config?.name || type;
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (showUnreadOnly && notification.status !== 'unread') return false;
    
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.sender_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || notification.notification_type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || notification.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || notification.status === statusFilter;
    
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total</p>
              <p className="text-xl font-semibold text-blue-900 dark:text-blue-100">{notifications.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
              <BellRing className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">Unread</p>
              <p className="text-xl font-semibold text-orange-900 dark:text-orange-100">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Read</p>
              <p className="text-xl font-semibold text-green-900 dark:text-green-100">{notifications.length - unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">High Priority</p>
              <p className="text-xl font-semibold text-purple-900 dark:text-purple-100">
                {notifications.filter(n => ['high', 'urgent'].includes(n.priority)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {Object.entries(NOTIFICATION_TYPES).map(([key, config]) => (
              <option key={key} value={key}>{config.name}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Unread only</span>
          </label>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedNotifications.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-700 dark:text-blue-300">
              {selectedNotifications.length} notification(s) selected
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => markAsRead(selectedNotifications)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Mark as Read
              </button>
              <button
                onClick={() => markAsUnread(selectedNotifications)}
                className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Mark as Unread
              </button>
              <button
                onClick={() => deleteNotifications(selectedNotifications)}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
              <button
                onClick={clearSelection}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifications.map((notification) => {
          const NotificationIcon = getNotificationIcon(notification.notification_type);
          const isUnread = notification.status === 'unread';
          const isSelected = selectedNotifications.includes(notification.id);
          
          return (
            <div
              key={notification.id}
              className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-all hover:shadow-md ${
                isUnread ? 'border-l-4 border-l-blue-500' : ''
              } ${
                isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Selection Checkbox */}
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleNotificationSelection(notification.id)}
                  className="mt-1 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />

                {/* Icon */}
                <div className={`p-2 rounded-lg ${isUnread ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                  <NotificationIcon className={`h-5 w-5 ${getNotificationColor(notification.notification_type)}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-sm font-medium ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                          {notification.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getNotificationTypeName(notification.notification_type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <span>From: {notification.sender_email}</span>
                        {notification.team_name && (
                          <span>Team: {notification.team_name}</span>
                        )}
                        <span>{new Date(notification.created_at).toLocaleString()}</span>
                        {notification.expires_at && (
                          <span>Expires: {new Date(notification.expires_at).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {notification.action_url && (
                        <button
                          onClick={() => handleNotificationClick(notification)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          View
                        </button>
                      )}
                      {isUnread ? (
                        <button
                          onClick={() => markAsRead([notification.id])}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => markAsUnread([notification.id])}
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Mark as unread"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotifications([notification.id])}
                        className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery || typeFilter !== 'all' || priorityFilter !== 'all' || statusFilter !== 'all' || showUnreadOnly
              ? 'Try adjusting your search or filter criteria'
              : 'You\'re all caught up! No notifications to display.'
            }
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {filteredNotifications.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={selectAllVisible}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Select all visible
            </button>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={() => markAsRead(filteredNotifications.filter(n => n.status === 'unread').map(n => n.id))}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Mark all as read
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
        </div>
      )}
    </div>
  );
}