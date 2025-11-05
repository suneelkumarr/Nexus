// Real-time Analytics Validation Dashboard
import React, { useState, useEffect } from 'react';
import { ValidationReport, ValidationResult, ValidationAlert } from '../types/validation-types';

interface ValidationDashboardProps {
  orchestrator: any;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({
  orchestrator,
  autoRefresh = true,
  refreshInterval = 30000 // 30 seconds
}) => {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [healthScores, setHealthScores] = useState<any>(null);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'alerts' | 'health'>('overview');

  useEffect(() => {
    if (orchestrator) {
      loadDashboardData();
      
      if (autoRefresh) {
        const interval = setInterval(loadDashboardData, refreshInterval);
        return () => clearInterval(interval);
      }
    }
  }, [orchestrator, autoRefresh, refreshInterval]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load latest validation report
      const reportData = await orchestrator.runFullValidation();
      setReport(reportData);
      
      // Load system status
      const status = orchestrator.getSystemStatus();
      setSystemStatus(status);
      
      // Load health scores
      const health = orchestrator.getHealthScores();
      setHealthScores(health);
      
      // Load alerts
      const alertsData = orchestrator.getAlerts();
      setAlerts(alertsData);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '⚠️';
      case 'medium':
        return '⚡';
      case 'low':
        return 'ℹ️';
      default:
        return '📊';
    }
  };

  return (
    <div className="analytics-validation-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Analytics Validation Dashboard
        </h1>
        
        {/* System Status Banner */}
        {systemStatus && (
          <div className={`status-banner p-4 rounded-lg mb-6 ${getStatusColor(systemStatus.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  System Status: {systemStatus.status.toUpperCase()}
                </h2>
                <p className="text-sm">{systemStatus.message}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{systemStatus.uptime.toFixed(1)}%</div>
                <div className="text-sm">Uptime</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="tabs mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview', icon: '📊' },
              { key: 'validation', label: 'Validation Results', icon: '✅' },
              { key: 'alerts', label: 'Alerts', icon: '🚨' },
              { key: 'health', label: 'Health Scores', icon: '💚' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading validation data...</p>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && report && (
        <div className="overview-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="metric-card bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Validations</h3>
            <div className="mt-2 text-3xl font-semibold text-gray-900">
              {report.summary.totalValidations}
            </div>
            <p className="text-sm text-gray-600">
              Last run: {new Date(report.summary.lastRun).toLocaleTimeString()}
            </p>
          </div>

          <div className="metric-card bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <div className="mt-2 text-3xl font-semibold text-green-600">
              {((report.summary.passed / report.summary.totalValidations) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-gray-600">
              {report.summary.passed} passed out of {report.summary.totalValidations}
            </p>
          </div>

          <div className="metric-card bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Issues Found</h3>
            <div className="mt-2 text-3xl font-semibold text-red-600">
              {report.summary.failed + report.summary.warnings}
            </div>
            <p className="text-sm text-gray-600">
              {report.summary.failed} failed, {report.summary.warnings} warnings
            </p>
          </div>

          <div className="metric-card bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Avg Duration</h3>
            <div className="mt-2 text-3xl font-semibold text-blue-600">
              {(report.summary.averageDuration / 1000).toFixed(1)}s
            </div>
            <p className="text-sm text-gray-600">
              Validation execution time
            </p>
          </div>
        </div>
      )}

      {/* Validation Results Tab */}
      {activeTab === 'validation' && report && (
        <div className="validation-results">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Validation Results</h2>
            <p className="text-gray-600">
              Generated at {new Date(report.generatedAt).toLocaleString()}
            </p>
          </div>

          <div className="space-y-4">
            {report.results.map((result, index) => (
              <div key={result.id} className="result-card bg-white rounded-lg shadow border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getSeverityIcon(result.severity)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold capitalize">
                        {result.type.replace('_', ' ')} Validation
                      </h3>
                      <p className="text-gray-600">{result.message}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.status)}`}>
                    {result.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-sm text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{(result.duration / 1000).toFixed(2)}s</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Severity:</span>
                    <span className="ml-2 font-medium capitalize">{result.severity}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Timestamp:</span>
                    <span className="ml-2 font-medium">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {result.details && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Details:</h4>
                    <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </div>
                )}

                {result.recommendations && result.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Recommendations:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-700">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="alerts-section">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Active Alerts</h2>
            <p className="text-gray-600">
              {alerts.filter(alert => !alert.resolved).length} active alerts
            </p>
          </div>

          <div className="space-y-4">
            {alerts.filter(alert => !alert.resolved).map(alert => (
              <div key={alert.id} className="alert-card bg-white rounded-lg shadow border p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getSeverityIcon(alert.type)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{alert.title}</h3>
                      <p className="text-gray-600">{alert.message}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(alert.type)}`}>
                    {alert.type.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Source:</span> {alert.source}
                  </div>
                  <div>
                    <span className="font-medium">Time:</span> {new Date(alert.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> {alert.acknowledged ? 'Acknowledged' : 'New'}
                  </div>
                </div>

                {!alert.acknowledged && (
                  <div className="mt-4">
                    <button
                      onClick={() => {
                        orchestrator.acknowledgeAlert(alert.id, 'dashboard-user');
                        loadDashboardData();
                      }}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded mr-2"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => {
                        orchestrator.resolveAlert(alert.id);
                        loadDashboardData();
                      }}
                      className="bg-green-500 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            ))}

            {alerts.filter(alert => !alert.resolved).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                ✅ No active alerts - system is operating normally
              </div>
            )}
          </div>
        </div>
      )}

      {/* Health Scores Tab */}
      {activeTab === 'health' && healthScores && (
        <div className="health-scores">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Health Scores</h2>
            <p className="text-gray-600">Current system health by component</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(healthScores).map(([component, score]) => (
              <div key={component} className="health-card bg-white rounded-lg shadow border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize">
                    {component.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ${
                    score >= 90 ? 'bg-green-500' :
                    score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}>
                    {score.toFixed(0)}
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      score >= 90 ? 'bg-green-500' :
                      score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600 mt-2">
                  {score >= 90 ? 'Excellent' :
                   score >= 70 ? 'Good' : 'Needs Attention'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Actions */}
      <div className="actions mt-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Manual Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
          
          <button
            onClick={async () => {
              setLoading(true);
              await orchestrator.runFullValidation();
              await loadDashboardData();
            }}
            disabled={loading}
            className="bg-green-500 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded"
          >
            Run Full Validation
          </button>

          <button
            onClick={() => {
              const newWindow = window.open('', '_blank');
              if (newWindow && report) {
                newWindow.document.write(`
                  <html>
                    <head><title>Validation Report</title></head>
                    <body>
                      <pre>${JSON.stringify(report, null, 2)}</pre>
                    </body>
                  </html>
                `);
              }
            }}
            className="bg-purple-500 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationDashboard;
