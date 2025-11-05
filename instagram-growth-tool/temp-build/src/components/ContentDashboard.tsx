import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Calendar, TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Zap } from 'lucide-react';

interface ContentDashboardProps {
  accountId: string;
}

interface ContentStats {
  scheduled: number;
  draft: number;
  published: number;
  pending_approval: number;
  total_ideas: number;
}

interface RecentContent {
  id: string;
  title: string;
  status: string;
  scheduled_date: string | null;
  created_at: string;
}

export default function ContentDashboard({ accountId }: ContentDashboardProps) {
  const [stats, setStats] = useState<ContentStats>({
    scheduled: 0,
    draft: 0,
    published: 0,
    pending_approval: 0,
    total_ideas: 0
  });
  const [recentContent, setRecentContent] = useState<RecentContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [accountId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch content stats
      const { data: contentData, error: contentError } = await supabase
        .from('content_management')
        .select('status')
        .eq('account_id', accountId);

      if (contentError) throw contentError;

      // Calculate stats
      const statsData = contentData?.reduce((acc, item) => {
        if (item.status === 'scheduled') acc.scheduled++;
        else if (item.status === 'draft') acc.draft++;
        else if (item.status === 'published') acc.published++;
        else if (item.status === 'pending_approval') acc.pending_approval++;
        return acc;
      }, { scheduled: 0, draft: 0, published: 0, pending_approval: 0, total_ideas: 0 });

      // Fetch AI ideas count
      const { count: ideasCount } = await supabase
        .from('ai_content_ideas')
        .select('*', { count: 'exact', head: true })
        .eq('account_id', accountId);

      // Fetch recent content
      const { data: recentData, error: recentError } = await supabase
        .from('content_management')
        .select('id, title, status, scheduled_date, created_at')
        .eq('account_id', accountId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentError) throw recentError;

      setStats({ ...statsData, total_ideas: ideasCount || 0 });
      setRecentContent(recentData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Scheduled',
      value: stats.scheduled,
      icon: Calendar,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      label: 'Drafts',
      value: stats.draft,
      icon: Clock,
      color: 'from-blue-500 to-cyan-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Published',
      value: stats.published,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      label: 'Pending Approval',
      value: stats.pending_approval,
      icon: AlertCircle,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      iconColor: 'text-orange-600 dark:text-orange-400'
    },
    {
      label: 'AI Ideas',
      value: stats.total_ideas,
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; text: string }> = {
      scheduled: { color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', text: 'Scheduled' },
      draft: { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300', text: 'Draft' },
      published: { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', text: 'Published' },
      pending_approval: { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', text: 'Pending' }
    };
    const badge = badges[status] || badges.draft;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Content Management Dashboard</h2>
            <p className="text-purple-100">Manage your Instagram content strategy</p>
          </div>
          <BarChart3 className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <TrendingUp className="w-6 h-6 mr-3 text-purple-600" />
          Recent Content
        </h3>
        
        {recentContent.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">No content yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Start creating content using the Calendar or AI Ideas tabs
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentContent.map((content) => (
              <div
                key={content.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    {content.title || 'Untitled Post'}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {content.scheduled_date 
                      ? `Scheduled: ${new Date(content.scheduled_date).toLocaleDateString()}`
                      : `Created: ${new Date(content.created_at).toLocaleDateString()}`
                    }
                  </p>
                </div>
                <div>
                  {getStatusBadge(content.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-left">
          <Calendar className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-1">Schedule Post</h4>
          <p className="text-sm text-purple-100">Open calendar to schedule content</p>
        </button>
        
        <button className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-left">
          <Zap className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-1">Generate Ideas</h4>
          <p className="text-sm text-orange-100">Get AI-powered content suggestions</p>
        </button>
        
        <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:shadow-lg transition-all duration-300 text-left">
          <TrendingUp className="w-8 h-8 mb-3" />
          <h4 className="font-semibold mb-1">View Rankings</h4>
          <p className="text-sm text-green-100">Analyze post performance</p>
        </button>
      </div>
    </div>
  );
}
