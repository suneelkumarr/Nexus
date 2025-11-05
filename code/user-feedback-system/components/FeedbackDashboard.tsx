import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Users,
  Activity,
  Filter,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import {
  FeedbackDashboard,
  FeedbackFilter,
  UserFeedback,
  FeedbackTrend,
  NPSMetrics,
  SentimentAnalytics
} from '../types';
import { feedbackService } from '../services/feedbackService';

interface FeedbackDashboardProps {
  dateRange?: { start: string; end: string };
  filters?: FeedbackFilter;
  onFilterChange?: (filters: FeedbackFilter) => void;
}

const FeedbackAnalyticsDashboard: React.FC<FeedbackDashboardProps> = ({
  dateRange,
  filters = {},
  onFilterChange
}) => {
  const [dashboardData, setDashboardData] = useState<FeedbackDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'trends' | 'nps' | 'sentiment'>('overview');
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedDateRange, filters]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getDashboard(selectedDateRange);
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading feedback data...</span>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Feedback"
          value={dashboardData.overview.total_feedback_count.toLocaleString()}
          change={dashboardData.overview.period_change.feedback_count_change}
          icon={<MessageSquare className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Average Rating"
          value={dashboardData.overview.average_rating.toFixed(1)}
          change={dashboardData.overview.period_change.rating_change}
          icon={<Star className="h-5 w-5" />}
          color="yellow"
        />
        <MetricCard
          title="NPS Score"
          value={dashboardData.overview.nps_score.toString()}
          change={dashboardData.overview.period_change.nps_change}
          icon={<ThumbsUp className="h-5 w-5" />}
          color="green"
        />
        <MetricCard
          title="Sentiment Score"
          value={(dashboardData.overview.average_sentiment * 100).toFixed(0) + '%'}
          change={dashboardData.overview.period_change.sentiment_change * 100}
          icon={<Activity className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dashboardData.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total_count"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Feedback"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={dashboardData.categories.map(cat => ({
                  name: cat.category,
                  value: cat.feedback_count
                }))}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {dashboardData.categories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(index)} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Action Items</h3>
          <div className="space-y-3">
            {dashboardData.action_items.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  item.priority === 'critical' ? 'bg-red-500' :
                  item.priority === 'high' ? 'bg-orange-500' :
                  item.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{item.feedback_count} feedback items</span>
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3" />
                      {(item.avg_sentiment * 100).toFixed(0)}% sentiment
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNPSTab = () => (
    <div className="space-y-6">
      {/* NPS Score Card */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Net Promoter Score</h3>
            <p className="text-3xl font-bold mt-2">{dashboardData.nps_metrics.current_score}</p>
            <p className="text-sm opacity-90 mt-1">
              {dashboardData.nps_metrics.previous_score > dashboardData.nps_metrics.current_score ? (
                <span className="flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  {Math.abs(dashboardData.nps_metrics.current_score - dashboardData.nps_metrics.previous_score)} decrease
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {dashboardData.nps_metrics.current_score - dashboardData.nps_metrics.previous_score} increase
                </span>
              )}
            </p>
          </div>
          <ThumbsUp className="h-12 w-12 opacity-80" />
        </div>
      </div>

      {/* NPS Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <ThumbsUp className="h-5 w-5" />
            <span className="font-medium">Promoters (9-10)</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-2">
            {dashboardData.nps_metrics.distribution.promoters}%
          </p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <Target className="h-5 w-5" />
            <span className="font-medium">Passives (7-8)</span>
          </div>
          <p className="text-2xl font-bold text-yellow-900 mt-2">
            {dashboardData.nps_metrics.distribution.passives}%
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-red-800">
            <ThumbsDown className="h-5 w-5" />
            <span className="font-medium">Detractors (0-6)</span>
          </div>
          <p className="text-2xl font-bold text-red-900 mt-2">
            {dashboardData.nps_metrics.distribution.detractors}%
          </p>
        </div>
      </div>

      {/* NPS Trend Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dashboardData.nps_metrics.trend_data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={3}
              name="NPS Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Segment Scores */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS by User Segment</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={dashboardData.nps_metrics.segment_scores}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="segment" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderSentimentTab = () => (
    <div className="space-y-6">
      {/* Overall Sentiment */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Overall Sentiment</h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Negative</span>
              <span>Neutral</span>
              <span>Positive</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="h-3 rounded-full flex">
                <div
                  className="bg-red-500 rounded-l-full"
                  style={{ width: `${dashboardData.sentiment_analysis.sentiment_distribution.negative * 100}%` }}
                />
                <div
                  className="bg-yellow-500"
                  style={{ width: `${dashboardData.sentiment_analysis.sentiment_distribution.neutral * 100}%` }}
                />
                <div
                  className="bg-green-500 rounded-r-full"
                  style={{ width: `${dashboardData.sentiment_analysis.sentiment_distribution.positive * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">
              {(dashboardData.sentiment_analysis.overall_sentiment * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600">Positive</p>
          </div>
        </div>
      </div>

      {/* Emotional Trends */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Trends</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(dashboardData.sentiment_analysis.emotional_trends).map(([emotion, data]) => (
            <div key={emotion} className="text-center p-4 border border-gray-200 rounded">
              <p className="text-sm font-medium text-gray-900 capitalize">{emotion}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {(data.score * 100).toFixed(0)}%
              </p>
              <div className={`flex items-center justify-center gap-1 mt-2 text-xs ${
                data.trend === 'up' ? 'text-green-600' :
                data.trend === 'down' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {data.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {data.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                <span className="capitalize">{data.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Themes */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Themes</h3>
        <div className="space-y-3">
          {dashboardData.sentiment_analysis.key_themes.map((theme, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{theme.theme}</p>
                <p className="text-sm text-gray-600">{theme.mentions} mentions</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  theme.sentiment > 0 ? 'text-green-600' :
                  theme.sentiment < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {(theme.sentiment * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback Volume Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dashboardData.trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="total_count"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Feedback"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="average_rating"
              stroke="#f59e0b"
              strokeWidth={2}
              name="Average Rating"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={dashboardData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="average_sentiment"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                name="Sentiment Score"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS Score Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="nps_score"
                stroke="#10b981"
                strokeWidth={3}
                name="NPS Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Analytics</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track user sentiment, satisfaction, and feedback trends
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <input
                  type="date"
                  value={selectedDateRange.start}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={selectedDateRange.end}
                  onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                />
              </div>
              
              <button
                onClick={() => {
                  // Export functionality
                  feedbackService.exportData('csv', filters, selectedDateRange)
                    .then(blob => {
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `feedback-data-${selectedDateRange.start}-${selectedDateRange.end}.csv`;
                      a.click();
                    });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: Activity },
              { key: 'trends', label: 'Trends', icon: TrendingUp },
              { key: 'nps', label: 'NPS', icon: ThumbsUp },
              { key: 'sentiment', label: 'Sentiment', icon: MessageSquare }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 text-sm font-medium ${
                  selectedTab === key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && renderOverviewTab()}
        {selectedTab === 'trends' && renderTrendsTab()}
        {selectedTab === 'nps' && renderNPSTab()}
        {selectedTab === 'sentiment' && renderSentimentTab()}
      </div>
    </div>
  );
};

// Helper Components
interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'purple';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200'
  };

  return (
    <div className={`p-6 rounded-lg border ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {change > 0 ? <TrendingUp className="h-3 w-3" /> : 
             change < 0 ? <TrendingDown className="h-3 w-3" /> : null}
            <span>{Math.abs(change).toFixed(1)}% vs last period</span>
          </div>
        </div>
        <div className="opacity-75">
          {icon}
        </div>
      </div>
    </div>
  );
};

const getCategoryColor = (index: number): string => {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  return colors[index % colors.length];
};

export default FeedbackAnalyticsDashboard;