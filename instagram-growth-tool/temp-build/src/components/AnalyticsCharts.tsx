import { useState, useEffect } from 'react';
import { Calendar, Download, Filter, RefreshCw, BarChart3, Users, Camera, Heart, Share2, Monitor, Camera as CameraIcon, Eye, Zap } from 'lucide-react';
import { useExport } from '@/hooks/useExport';
import ExportModal from '@/components/Export/ExportModal';
import ChartExporter from '@/components/Export/ChartExporter';
import SocialShare from '@/components/Sharing/SocialShare';
import PresentationMode from '@/components/PresentationMode';
import FollowerGrowthChart from './charts/FollowerGrowthChart';
import PostFrequencyChart from './charts/PostFrequencyChart';
import ContentTypeChart from './charts/ContentTypeChart';
import EngagementTrendChart from './charts/EngagementTrendChart';

type TimeRange = '7d' | '30d' | '3m' | '1y';

interface AnalyticsChartsProps {
  selectedAccount?: string | null;
}

export default function AnalyticsCharts({ selectedAccount }: AnalyticsChartsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeChart, setActiveChart] = useState<'all' | 'growth' | 'frequency' | 'content' | 'engagement'>('all');
  const [isExporting, setIsExporting] = useState(false);
  
  // Export and sharing state
  const [showExportModal, setShowExportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showChartExporter, setShowChartExporter] = useState(false);
  const [showPresentationMode, setShowPresentationMode] = useState(false);
  const [selectedChart, setSelectedChart] = useState<string | null>(null);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const timeRangeOptions = [
    { value: '7d' as TimeRange, label: '7 Days', description: 'Last week' },
    { value: '30d' as TimeRange, label: '30 Days', description: 'Last month' },
    { value: '3m' as TimeRange, label: '3 Months', description: 'Last quarter' },
    { value: '1y' as TimeRange, label: '1 Year', description: 'Last year' },
  ];

  const chartTypes = [
    { 
      id: 'all' as const, 
      name: 'Overview', 
      icon: BarChart3, 
      color: 'from-gray-500 to-gray-600',
      description: 'All analytics charts'
    },
    { 
      id: 'growth' as const, 
      name: 'Follower Growth', 
      icon: Users, 
      color: 'from-blue-500 to-purple-600',
      description: 'Audience growth trends'
    },
    { 
      id: 'frequency' as const, 
      name: 'Post Frequency', 
      icon: Camera, 
      color: 'from-purple-500 to-pink-600',
      description: 'Content publishing patterns'
    },
    { 
      id: 'content' as const, 
      name: 'Content Types', 
      icon: BarChart3, 
      color: 'from-pink-500 to-purple-600',
      description: 'Posts vs Stories vs Reels'
    },
    { 
      id: 'engagement' as const, 
      name: 'Engagement', 
      icon: Heart, 
      color: 'from-pink-500 to-red-600',
      description: 'Audience interaction rates'
    },
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise(resolve => setTimeout(resolve, 1500));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const { exportToPDF, exportToCSV, exportToExcel, exportChartImage } = useExport();

  const handleExport = async (chartType?: string) => {
    setIsExporting(true);
    try {
      // Create comprehensive export data
      const exportData = {
        accounts: [],
        charts: [
          { id: 'follower-growth', name: 'Follower Growth', type: 'line', title: 'Follower Growth Over Time', data: [] },
          { id: 'engagement-trend', name: 'Engagement Trend', type: 'line', title: 'Engagement Rate Trends', data: [] },
          { id: 'content-type', name: 'Content Type', type: 'bar', title: 'Content Performance by Type', data: [] },
          { id: 'post-frequency', name: 'Post Frequency', type: 'area', title: 'Posting Frequency Analysis', data: [] }
        ],
        analyticsData: {
          followers: 15000,
          engagementRate: 4.2,
          reach: 250000,
          likes: 12500,
          comments: 890,
          growth: {
            followers: 15.3,
            engagement: 8.7,
            reach: 22.1,
            likes: 18.4,
            comments: 12.9
          },
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
          }
        },
        timeRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          end: new Date()
        },
        generatedAt: new Date()
      };

      // Export based on chart type or show export modal
      if (chartType) {
        await exportChartImage(chartType);
      } else {
        setShowExportModal(true);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleChartExport = async (chartId: string) => {
    setSelectedChart(chartId);
    setShowChartExporter(true);
  };

  const handlePresentationMode = () => {
    setShowPresentationMode(true);
  };

  const slides = [
    {
      id: 'overview',
      title: 'Analytics Overview',
      component: ({ data }: any) => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Total Followers', value: '15,234', change: '+12.5%', color: 'text-blue-600' },
            { label: 'Engagement Rate', value: '4.2%', change: '+8.7%', color: 'text-green-600' },
            { label: 'Reach', value: '125K', change: '+22.1%', color: 'text-purple-600' },
            { label: 'Growth Rate', value: '+15.3%', change: 'vs last month', color: 'text-pink-600' }
          ].map((metric, index) => (
            <div key={index} className="text-center">
              <div className={`text-3xl font-bold ${metric.color} mb-2`}>{metric.value}</div>
              <div className="text-gray-600 mb-1">{metric.label}</div>
              <div className="text-sm text-green-600">{metric.change}</div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'charts',
      title: 'Visual Analytics',
      component: () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-96">
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <FollowerGrowthChart timeRange="30d" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center">
            <EngagementTrendChart timeRange="30d" />
          </div>
        </div>
      )
    },
    {
      id: 'insights',
      title: 'Key Insights',
      component: () => (
        <div className="space-y-6">
          {[
            { type: 'success', title: 'Follower Growth Success', description: 'Achieved 15.3% follower growth this month' },
            { type: 'insight', title: 'Engagement Peak', description: 'Tuesday posts get 40% more engagement' },
            { type: 'opportunity', title: 'Content Opportunity', description: 'Video content outperforms images by 3x' }
          ].map((insight, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">{insight.title}</h3>
              <p className="text-gray-600">{insight.description}</p>
            </div>
          ))}
        </div>
      )
    }
  ];

  const shareData = {
    title: 'Instagram Analytics Dashboard',
    description: `Check out my Instagram analytics for ${timeRange} - ${activeChart} view`,
    url: window.location.href,
    hashtags: ['Instagram', 'Analytics', 'Growth', 'SocialMedia']
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderChart = (chartId: string) => {
    const commonProps = { timeRange, data: undefined };
    
    switch (chartId) {
      case 'growth':
        return <FollowerGrowthChart {...commonProps} />;
      case 'frequency':
        return <PostFrequencyChart {...commonProps} />;
      case 'content':
        return <ContentTypeChart {...commonProps} />;
      case 'engagement':
        return <EngagementTrendChart {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive insights into your Instagram performance and growth patterns
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Time Range Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTimeRange(option.value)}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-all ${
                    timeRange === option.value
                      ? 'bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                  title={option.description}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isRefreshing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </button>

              <button
                onClick={() => handleExport()}
                disabled={isExporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Export</span>
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowShareModal(true)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                title="Share Analytics"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share</span>
              </button>

              {/* Chart Export Button */}
              <button
                onClick={() => setShowChartExporter(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                title="Export Charts"
              >
                <CameraIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Charts</span>
              </button>

              {/* Presentation Mode Button */}
              <button
                onClick={() => setShowPresentationMode(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
                title="Presentation Mode"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Present</span>
              </button>
            </div>
          </div>
        </div>

        {/* Last Updated Info */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
          </div>
          {selectedAccount && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Tracking: {selectedAccount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap gap-2">
          {chartTypes.map((chartType) => {
            const Icon = chartType.icon;
            const isActive = activeChart === chartType.id;
            
            return (
              <button
                key={chartType.id}
                onClick={() => setActiveChart(chartType.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  isActive
                    ? `bg-gradient-to-r ${chartType.color} text-white shadow-lg`
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                <div>
                  <div className={`font-medium text-sm ${isActive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                    {chartType.name}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {chartType.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="space-y-6">
        {(activeChart === 'all' || activeChart === 'growth') && (
          <div className={activeChart === 'all' ? '' : 'max-w-4xl mx-auto'}>
            <FollowerGrowthChart timeRange={timeRange} />
          </div>
        )}

        {(activeChart === 'all' || activeChart === 'frequency') && (
          <div className={activeChart === 'all' ? '' : 'max-w-4xl mx-auto'}>
            <PostFrequencyChart timeRange={timeRange} />
          </div>
        )}

        {(activeChart === 'all' || activeChart === 'content') && (
          <div className={activeChart === 'all' ? '' : 'max-w-4xl mx-auto'}>
            <ContentTypeChart timeRange={timeRange} />
          </div>
        )}

        {(activeChart === 'all' || activeChart === 'engagement') && (
          <div className={activeChart === 'all' ? '' : 'max-w-4xl mx-auto'}>
            <EngagementTrendChart timeRange={timeRange} />
          </div>
        )}
      </div>

      {/* Summary Cards */}
      {activeChart === 'all' && (
        <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-900/20 dark:via-pink-900/20 dark:to-blue-900/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/50 p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Summary
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Key insights from your {timeRangeOptions.find(opt => opt.value === timeRange)?.description.toLowerCase()} performance
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Growth Rate</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Audience increase</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">+2.3%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">↗ Positive trend</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Post Consistency</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Publishing schedule</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">4.2/week</p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">✓ On target</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Content Mix</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type distribution</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-pink-600 dark:text-pink-400">60/25/15</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">✓ Optimal ratio</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Engagement</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Interaction rate</p>
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">4.7%</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">↗ Above average</p>
            </div>
          </div>
        </div>
      )}

      {/* Export and Sharing Modals */}
      {showExportModal && (
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          exportData={{
            accounts: [],
            charts: [
              { id: 'follower-growth', name: 'Follower Growth', type: 'line', title: 'Follower Growth Over Time', data: [] },
              { id: 'engagement-trend', name: 'Engagement Trend', type: 'line', title: 'Engagement Rate Trends', data: [] },
              { id: 'content-type', name: 'Content Type', type: 'bar', title: 'Content Performance by Type', data: [] },
              { id: 'post-frequency', name: 'Post Frequency', type: 'area', title: 'Posting Frequency Analysis', data: [] }
            ],
            analyticsData: {
              followers: 15000,
              engagementRate: 4.2,
              reach: 250000,
              likes: 12500,
              comments: 890,
              growth: {
                followers: 15.3,
                engagement: 8.7,
                reach: 22.1,
                likes: 18.4,
                comments: 12.9
              },
              period: {
                start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                end: new Date()
              }
            },
            timeRange: {
              start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              end: new Date()
            },
            generatedAt: new Date()
          }}
        />
      )}

      {showChartExporter && selectedChart && (
        <ChartExporter
          isOpen={showChartExporter}
          onClose={() => {
            setShowChartExporter(false);
            setSelectedChart(null);
          }}
          chartId={selectedChart}
          chartData={{
            id: selectedChart,
            name: selectedChart === 'follower-growth' ? 'Follower Growth' :
                  selectedChart === 'engagement-trend' ? 'Engagement Trend' :
                  selectedChart === 'content-type' ? 'Content Type' : 'Post Frequency',
            type: 'line',
            title: `${selectedChart.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Chart`,
            data: []
          }}
        />
      )}

      {showShareModal && (
        <SocialShare
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          shareData={shareData}
        />
      )}

      {showPresentationMode && (
        <PresentationMode
          isOpen={showPresentationMode}
          onClose={() => setShowPresentationMode(false)}
          slides={slides}
          presentationData={{
            mode: 'dashboard',
            fullscreen: true,
            autoAdvance: true,
            duration: 10
          }}
        />
      )}
    </div>
  );
}