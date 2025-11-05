import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, TrendingUp, Users, Target, AlertTriangle, CheckCircle, AlertCircle, Loader2, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface IntelligentReportsProps {
  selectedAccount: string | null;
}

interface IntelligentReport {
  id: string;
  report_type: string;
  report_period: string;
  insights: any;
  recommendations: any;
  metrics_summary: any;
  created_at: string;
}

const IntelligentReports: React.FC<IntelligentReportsProps> = ({ selectedAccount }) => {
  const [reports, setReports] = useState<IntelligentReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<IntelligentReport | null>(null);
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');

  useEffect(() => {
    if (selectedAccount) {
      fetchReports();
    }
  }, [selectedAccount]);

  const fetchReports = async () => {
    if (!selectedAccount) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('ai_intelligent_reports')
        .select('*')
        .eq('account_id', selectedAccount)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to load intelligent reports');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedAccount) return;

    setGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-intelligent-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          accountId: selectedAccount,
          reportType: reportType,
          period: reportType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate report');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      // Refresh reports after generation
      await fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'weekly':
        return <Calendar className="w-5 h-5" />;
      case 'monthly':
        return <BarChart3 className="w-5 h-5" />;
      case 'quarterly':
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatMetricValue = (value: any) => {
    if (typeof value === 'number') {
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    }
    return value?.toString() || 'N/A';
  };

  const exportReport = (report: IntelligentReport) => {
    const reportData = {
      title: `Instagram Analytics Report - ${report.report_type}`,
      period: report.report_period,
      generated: new Date(report.created_at).toLocaleDateString(),
      insights: report.insights,
      recommendations: report.recommendations,
      metrics: report.metrics_summary
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `instagram-report-${report.report_type}-${new Date(report.created_at).toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!selectedAccount) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Account Selected</h3>
          <p className="mt-1 text-sm text-gray-500">
            Select an Instagram account to view intelligent reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Intelligent Reports</h2>
          <p className="text-sm text-gray-600 mt-1">
            Comprehensive AI-generated analytics reports with insights and recommendations
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="quarterly">Quarterly Report</option>
          </select>
          <button
            onClick={generateReport}
            disabled={generating}
            className="bg-gradient-to-r from-cyan-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-600 hover:to-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4" />
                <span>Generate Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-32">
          <div className="flex items-center space-x-3">
            <Loader2 className="w-6 h-6 text-cyan-600 animate-spin" />
            <span className="text-gray-600">Loading reports...</span>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {reports.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No Reports Yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Click "Generate Report" to create your first intelligent analytics report.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg">
                        {getReportTypeIcon(report.report_type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">
                          {report.report_type} Report
                        </h3>
                        <p className="text-sm text-gray-500">{report.report_period}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportReport(report);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Export Report"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Key Metrics Preview */}
                  {report.metrics_summary && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Total Reach</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {formatMetricValue(report.metrics_summary.total_reach)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Engagement Rate</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {report.metrics_summary.engagement_rate ? `${report.metrics_summary.engagement_rate}%` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Insights Count */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="w-4 h-4" />
                      <span>{report.insights ? Object.keys(report.insights).length : 0} Insights</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4" />
                      <span>{report.recommendations ? Object.keys(report.recommendations).length : 0} Recommendations</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Generated {new Date(report.created_at).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-cyan-600 font-medium">Click to view details</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-lg">
                    {getReportTypeIcon(selectedReport.report_type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 capitalize">
                      {selectedReport.report_type} Analytics Report
                    </h3>
                    <p className="text-gray-600">{selectedReport.report_period}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => exportReport(selectedReport)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Metrics Summary */}
                {selectedReport.metrics_summary && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Metrics Summary</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(selectedReport.metrics_summary).map(([key, value]) => (
                        <div key={key} className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-500 capitalize">
                            {key.replace(/_/g, ' ')}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatMetricValue(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights */}
                {selectedReport.insights && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Key Insights</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedReport.insights).map(([category, insight]: [string, any]) => (
                        <div key={category} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <h5 className="font-medium text-blue-900 capitalize mb-1">
                                {category.replace(/_/g, ' ')}
                              </h5>
                              <p className="text-blue-800 text-sm">
                                {typeof insight === 'object' ? JSON.stringify(insight) : insight}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedReport.recommendations && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
                    <div className="space-y-3">
                      {Object.entries(selectedReport.recommendations).map(([priority, recs]: [string, any]) => (
                        <div key={priority}>
                          <h5 className={`font-medium mb-2 capitalize px-3 py-1 rounded-full inline-block ${getPriorityColor(priority)}`}>
                            {priority} Priority
                          </h5>
                          <div className="space-y-2">
                            {Array.isArray(recs) ? recs.map((rec, index) => (
                              <div key={index} className="bg-gray-50 rounded-lg p-3 flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{rec}</p>
                              </div>
                            )) : (
                              <div className="bg-gray-50 rounded-lg p-3 flex items-start space-x-3">
                                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 text-sm">{recs}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generation Info */}
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Report generated on {new Date(selectedReport.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntelligentReports;