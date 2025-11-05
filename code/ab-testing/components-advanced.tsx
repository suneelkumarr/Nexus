/**
 * Additional A/B Testing Components
 * Results dashboard, tracking components, and variant management
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Experiment,
  ExperimentVariant,
  ExperimentResults,
  ExperimentProgress,
  StatisticalResult,
  User,
  ExperimentEvent
} from './types';
import { useExperiment, useUserABTests, useABTesting } from './hooks';
import { 
  analyzeExperimentResults,
  getTrafficAllocation,
  formatPercentage,
  formatNumber
} from './utils';

// ============================================================================
// EXPERIMENT RESULTS DASHBOARD
// ============================================================================

interface ExperimentResultsDashboardProps {
  experimentId: string;
  className?: string;
}

export const ExperimentResultsDashboard: React.FC<ExperimentResultsDashboardProps> = ({
  experimentId,
  className = ''
}) => {
  const { experiment, results, events, analyzeResults, updateProgress } = useExperiment(experimentId);

  useEffect(() => {
    if (events.length > 0) {
      analyzeResults();
      updateProgress();
    }
  }, [events, analyzeResults, updateProgress]);

  if (!experiment) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <p className="text-gray-500">Experiment not found</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{experiment.name}</h2>
            <p className="text-gray-600 mt-1">{experiment.description}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <span>{experiment.variants.length} variants</span>
              <span>{experiment.metrics.length} metrics</span>
              <span>{results?.totalUsers || 0} total users</span>
            </div>
          </div>
          
          {results && (
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                results.overallResult.isConclusive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {results.overallResult.isConclusive ? 'Conclusive' : 'Inconclusive'}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Confidence: {formatPercentage(results.confidenceLevel)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overall Results */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Results</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-1">Recommendation</h4>
              <p className="text-lg font-semibold text-blue-900">
                {results.overallResult.recommendedAction.toUpperCase()}
              </p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-1">Winner</h4>
              <p className="text-lg font-semibold text-green-900">
                {results.overallResult.winner || 'No clear winner'}
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-1">Total Users</h4>
              <p className="text-lg font-semibold text-gray-900">
                {formatNumber(results.totalUsers)}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Reasoning</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              {results.overallResult.reasoning.map((reason, index) => (
                <li key={index}>• {reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Variant Comparison */}
      {results && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Variant Performance</h3>
          <VariantComparisonTable variants={results.variants} />
        </div>
      )}

      {/* Progress Metrics */}
      {experiment && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Test Progress</h3>
          <ExperimentProgressMetrics experiment={experiment} events={events} />
        </div>
      )}
    </div>
  );
};

// ============================================================================
// VARIANT COMPARISON TABLE
// ============================================================================

interface VariantComparisonTableProps {
  variants: StatisticalResult[];
}

const VariantComparisonTable: React.FC<VariantComparisonTableProps> = ({ variants }) => {
  const getSignificanceBadge = (result: StatisticalResult) => {
    if (result.variantId.includes('control') || result.pValue === 1) {
      return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs">Control</span>;
    }
    
    if (result.isSignificant) {
      return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Significant</span>;
    }
    
    return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">Not Significant</span>;
  };

  const getEffectColor = (effectSize: number) => {
    if (effectSize > 0.05) return 'text-green-600';
    if (effectSize < -0.05) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Variant
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sample Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Conversion Rate
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Effect Size
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              P-Value
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confidence
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {variants.map((result) => (
            <tr key={result.variantId}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {result.variantId}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatNumber(result.sampleSize)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(result.conversionRate)}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getEffectColor(result.effectSize)}`}>
                {result.effectSize > 0 ? '+' : ''}{formatPercentage(result.effectSize)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {result.pValue.toFixed(4)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatPercentage(result.confidenceLevel)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {getSignificanceBadge(result)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// EXPERIMENT PROGRESS METRICS
// ============================================================================

interface ExperimentProgressMetricsProps {
  experiment: Experiment;
  events: ExperimentEvent[];
}

const ExperimentProgressMetrics: React.FC<ExperimentProgressMetricsProps> = ({
  experiment,
  events
}) => {
  const variantCounts = useMemo(() => {
    const counts: Record<string, Set<string>> = {};
    
    events.forEach(event => {
      if (!counts[event.variantId]) {
        counts[event.variantId] = new Set();
      }
      counts[event.variantId].add(event.userId);
    });
    
    return Object.entries(counts).reduce((result, [variantId, users]) => {
      result[variantId] = users.size;
      return result;
    }, {} as Record<string, number>);
  }, [events]);

  const totalUsers = Object.values(variantCounts).reduce((sum, count) => sum + count, 0);
  const requiredSampleSize = 1000; // This would be calculated based on experiment parameters

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Total Users</h4>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(totalUsers)}</p>
          <div className="mt-2">
            <div className="bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min((totalUsers / requiredSampleSize) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(Math.min(totalUsers / requiredSampleSize, 1))} of target sample size
            </p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Variants</h4>
          <p className="text-2xl font-bold text-gray-900">{experiment.variants.length}</p>
          <div className="mt-2 space-y-1">
            {experiment.variants.map(variant => (
              <div key={variant.id} className="flex justify-between text-xs">
                <span className="text-gray-600">{variant.name}</span>
                <span className="text-gray-900">{formatNumber(variantCounts[variant.id] || 0)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-800 mb-1">Events Tracked</h4>
          <p className="text-2xl font-bold text-gray-900">{formatNumber(events.length)}</p>
          <div className="mt-2">
            {experiment.metrics.slice(0, 3).map(metric => {
              const metricEvents = events.filter(e => e.eventName === metric.eventName).length;
              return (
                <div key={metric.id} className="flex justify-between text-xs">
                  <span className="text-gray-600">{metric.name}</span>
                  <span className="text-gray-900">{formatNumber(metricEvents)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// VARIANT ASSIGNMENT DISPLAY
// ============================================================================

interface VariantAssignmentDisplayProps {
  userId: string;
  experiment: Experiment;
  assignment: { variant: ExperimentVariant | null; assignment: UserAssignment | null };
  className?: string;
}

export const VariantAssignmentDisplay: React.FC<VariantAssignmentDisplayProps> = ({
  userId,
  experiment,
  assignment,
  className = ''
}) => {
  const { trackEvent } = useABTesting();

  const handleVariantAction = async (action: string) => {
    if (assignment.assignment && assignment.variant) {
      await trackEvent(
        experiment.id,
        assignment.variant.id,
        userId,
        action,
        1,
        { timestamp: Date.now() }
      );
    }
  };

  if (!assignment.variant || !assignment.assignment) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-4 ${className}`}>
        <p className="text-yellow-800">No variant assigned for this experiment</p>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{experiment.name}</h4>
          <p className="text-sm text-gray-600">{experiment.description}</p>
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          assignment.variant.isControl 
            ? 'bg-blue-100 text-blue-800' 
            : 'bg-green-100 text-green-800'
        }`}>
          {assignment.variant.name}
          {assignment.variant.isControl && ' (Control)'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Assigned:</span>
          <span className="text-gray-900">
            {new Date(assignment.assignment.assignedAt).toLocaleDateString()}
          </span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Traffic Bucket:</span>
          <span className="text-gray-900">{assignment.assignment.trafficBucket}</span>
        </div>
      </div>

      {assignment.variant.description && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">{assignment.variant.description}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => handleVariantAction('variant_interaction')}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
        >
          Interact
        </button>
        
        <button
          onClick={() => handleVariantAction('variant_conversion')}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
        >
          Convert
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// USER ASSIGNMENT MANAGER
// ============================================================================

interface UserAssignmentManagerProps {
  userId: string;
  className?: string;
}

export const UserAssignmentManager: React.FC<UserAssignmentManagerProps> = ({
  userId,
  className = ''
}) => {
  const { variants } = useUserABTests(userId);

  if (variants.length === 0) {
    return (
      <div className={`bg-gray-50 rounded-lg p-6 text-center ${className}`}>
        <p className="text-gray-500">No active experiments for this user</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900">
        Active Experiments ({variants.length})
      </h3>
      
      {variants.map(({ experiment, variant, assignment }) => (
        <VariantAssignmentDisplay
          key={experiment.id}
          userId={userId}
          experiment={experiment}
          assignment={{ variant, assignment }}
        />
      ))}
    </div>
  );
};

// ============================================================================
// EXPERIMENT TRACKER
// ============================================================================

interface ExperimentTrackerProps {
  userId: string;
  experiments: Experiment[];
  onEventTracked?: (event: ExperimentEvent) => void;
}

export const ExperimentTracker: React.FC<ExperimentTrackerProps> = ({
  userId,
  experiments,
  onEventTracked
}) => {
  const { assignUserToExperiment, getUserAssignment, trackEvent } = useABTesting();

  // Auto-assign user to new active experiments
  useEffect(() => {
    const assignUser = async () => {
      for (const experiment of experiments) {
        const assignment = getUserAssignment(userId, experiment.id);
        if (!assignment) {
          await assignUserToExperiment({ id: userId }, experiment.id);
        }
      }
    };

    if (userId && experiments.length > 0) {
      assignUser();
    }
  }, [userId, experiments, assignUserToExperiment, getUserAssignment]);

  const trackConversion = async (experimentId: string, eventValue?: number) => {
    const assignment = getUserAssignment(userId, experimentId);
    if (assignment) {
      const event = await trackEvent(
        experimentId,
        assignment.variantId,
        userId,
        'conversion',
        eventValue
      );
      onEventTracked?.(event);
    }
  };

  const trackCustomEvent = async (experimentId: string, eventName: string, eventData?: Record<string, any>) => {
    const assignment = getUserAssignment(userId, experimentId);
    if (assignment) {
      const event = await trackEvent(
        experimentId,
        assignment.variantId,
        userId,
        eventName,
        undefined,
        eventData
      );
      onEventTracked?.(event);
    }
  };

  return {
    trackConversion,
    trackCustomEvent
  };
};

// ============================================================================
// EXPORT AND REPORTING COMPONENTS
// ============================================================================

interface ExperimentExportProps {
  experimentId: string;
  format: 'csv' | 'json' | 'xlsx';
  onExport?: (data: any) => void;
}

export const ExperimentExport: React.FC<ExperimentExportProps> = ({
  experimentId,
  format,
  onExport
}) => {
  const { events, results } = useExperiment(experimentId);

  const exportData = useMemo(() => {
    if (!results) return null;

    switch (format) {
      case 'json':
        return {
          experimentId,
          results,
          events,
          exportedAt: new Date().toISOString()
        };
      
      case 'csv':
        const csvHeaders = ['User ID', 'Variant', 'Event Name', 'Event Value', 'Timestamp'];
        const csvRows = events.map(event => [
          event.userId,
          event.variantId,
          event.eventName,
          event.eventValue || '',
          event.timestamp.toISOString()
        ]);
        return {
          headers: csvHeaders,
          rows: csvRows,
          filename: `experiment_${experimentId}_${Date.now()}.csv`
        };
      
      default:
        return null;
    }
  }, [experimentId, format, events, results]);

  const handleExport = () => {
    if (exportData && onExport) {
      onExport(exportData);
    }
  };

  if (!exportData) {
    return (
      <div className="text-center text-gray-500">
        <p>No data available for export</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h4 className="font-medium text-gray-900">Export Experiment Data</h4>
          <p className="text-sm text-gray-600">Format: {format.toUpperCase()}</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
        >
          Export
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};