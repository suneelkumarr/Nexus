import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  Bell,
  Lightbulb,
  RefreshCw,
  XCircle,
  CheckCircle,
  Star
} from 'lucide-react';
import { InsightData, insightGenerator } from '@/utils/insightGenerator';
import RecommendationList from './insights/RecommendationList';
import AlertBadge from './insights/AlertBadge';

interface AIInsightsPanelProps {
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

export default function AIInsightsPanel({ 
  isOpen = false, 
  onToggle, 
  className = '' 
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'recommendations' | 'opportunities'>('overview');

  // Mock selected account state
  const [selectedAccount] = useState<string | null>('demo-account');

  useEffect(() => {
    loadInsights();
  }, [selectedAccount]);

  const loadInsights = async () => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { insights: generatedInsights } = insightGenerator.generateAllInsights();
      setInsights(generatedInsights);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = (insightId: string) => {
    setInsights(prev => prev.map(insight => 
      insight.id === insightId ? { ...insight, isRead: true } : insight
    ));
    insightGenerator.markInsightAsRead(insightId);
  };

  const handleRefresh = () => {
    loadInsights();
  };

  const getInsightStats = () => {
    const total = insights.length;
    const unread = insights.filter(i => !i.isRead).length;
    const urgent = insights.filter(i => i.severity === 'urgent').length;
    const high = insights.filter(i => i.severity === 'high').length;
    const opportunities = insights.filter(i => i.type === 'opportunity').length;
    const highConfidence = insights.filter(i => i.confidence >= 90).length;

    return { total, unread, urgent, high, opportunities, highConfidence };
  };

  const stats = getInsightStats();

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={`
          fixed right-4 top-1/2 -translate-y-1/2 z-50
          bg-gradient-to-r from-purple-600 to-pink-600 
          text-white p-3 rounded-l-lg shadow-lg hover:shadow-xl 
          transition-all duration-200 group
          ${className}
        `}
      >
        <Sparkles className="h-5 w-5" />
        {stats.unread > 0 && (
          <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-semibold animate-pulse">
            {stats.unread}
          </div>
        )}
        <div className="absolute right-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1 rounded">
          AI Insights ({stats.unread} new)
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Right Sidebar */}
      <div className={`
        fixed right-0 top-0 h-full bg-white dark:bg-gray-900 shadow-2xl z-50 
        flex flex-col transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-80 sm:w-96'}
        ${className}
        lg:relative
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-white/20 rounded-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-bold text-lg">AI Insights</h2>
                <p className="text-purple-100 text-sm">
                  {stats.total} insights • {stats.unread} new
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh insights"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
            >
              <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
            </button>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isCollapsed ? (
          /* Collapsed State */
          <div className="flex-1 flex flex-col items-center py-4 space-y-4">
            <div className="text-center">
              <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                Overview
              </div>
              <div className="space-y-2">
                <div className="bg-red-100 dark:bg-red-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                  <div className="text-xs text-red-600">Urgent</div>
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
                  <div className="text-xs text-orange-600">High</div>
                </div>
                <div className="bg-green-100 dark:bg-green-900/50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{stats.opportunities}</div>
                  <div className="text-xs text-green-600">Opportunities</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded State */
          <>
            {/* Stats Cards */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Unread
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.unread}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Opportunities
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.opportunities}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      High Confidence
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.highConfidence}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stats.total}
                  </div>
                </div>
              </div>
              
              <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'alerts', label: 'Alerts', icon: Bell },
                  { id: 'recommendations', label: 'Tips', icon: Lightbulb },
                  { id: 'opportunities', label: 'Growth', icon: TrendingUp }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Analyzing your account...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  {/* Quick Insights based on active tab */}
                  {activeTab === 'overview' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Recent Insights
                      </h3>
                      {insights.slice(0, 3).map((insight) => (
                        <div
                          key={insight.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            insight.isRead
                              ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                          }`}
                          onClick={() => handleMarkAsRead(insight.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertBadge 
                                  severity={insight.severity} 
                                  type={insight.type}
                                  size="sm"
                                />
                                {!insight.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'alerts' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Priority Alerts
                      </h3>
                      {insights.filter(i => i.severity === 'urgent' || i.severity === 'high').map((insight) => (
                        <div
                          key={insight.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            insight.severity === 'urgent'
                              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                              : 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                          }`}
                          onClick={() => handleMarkAsRead(insight.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertBadge 
                                  severity={insight.severity} 
                                  type={insight.type}
                                  size="sm"
                                />
                                {!insight.isRead && (
                                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                )}
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'recommendations' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Smart Recommendations
                      </h3>
                      {insights.filter(i => i.type === 'recommendation').map((insight) => (
                        <div
                          key={insight.id}
                          className="p-3 rounded-lg border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                          onClick={() => handleMarkAsRead(insight.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertBadge 
                                  severity={insight.severity} 
                                  type={insight.type}
                                  size="sm"
                                />
                                <span className="text-xs text-gray-500">
                                  {insight.confidence}% confidence
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'opportunities' && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Growth Opportunities
                      </h3>
                      {insights.filter(i => i.type === 'opportunity').map((insight) => (
                        <div
                          key={insight.id}
                          className="p-3 rounded-lg border bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                          onClick={() => handleMarkAsRead(insight.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <AlertBadge 
                                  severity={insight.severity} 
                                  type={insight.type}
                                  size="sm"
                                />
                                <span className="text-xs text-gray-500">
                                  {insight.estimatedValue}
                                </span>
                              </div>
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {insight.title}
                              </h4>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* View All Button */}
                  <button
                    onClick={() => {
                      // In a real app, this would open a full insights view
                      alert('Opening full insights view...');
                    }}
                    className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    View All Insights
                  </button>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="grid grid-cols-2 gap-2">
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Clock className="h-3 w-3" />
                  Schedule Post
                </button>
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Lightbulb className="h-3 w-3" />
                  Create Content
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}