import React, { useState, useEffect } from 'react';
import { 
  MetricWidget, 
  FunnelWidget, 
  ABTestWidget, 
  ChartWidget,
  DashboardManager,
  predefinedWidgets,
  EventType 
} from './index.js';

// React Hook for Metrics Tracking System
export const useMetrics = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [metricsData, setMetricsData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Auto-initialize metrics tracking
    const metricsInstance = getMetricsInstance({ autoTrack: true });
    setIsInitialized(true);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  const trackEvent = (eventType: EventType, properties?: Record<string, any>) => {
    eventTracking.track(eventType, properties);
  };

  const trackPageView = (pageName: string) => {
    trackEvent('page_view', { pageName });
  };

  const trackUserAction = (action: string, properties?: Record<string, any>) => {
    trackEvent(action as EventType, properties);
  };

  return {
    isInitialized,
    metricsData,
    trackEvent,
    trackPageView,
    trackUserAction,
  };
};

// React Dashboard Component
interface DashboardProps {
  widgets?: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
  showPerformanceMetrics?: boolean;
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({
  widgets = Object.keys(predefinedWidgets),
  autoRefresh = true,
  refreshInterval = 60000,
  showPerformanceMetrics = true,
  className = 'dashboard-grid'
}) => {
  const [widgetComponents, setWidgetComponents] = useState<React.ReactElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWidgets = async () => {
      setIsLoading(true);
      const components: React.ReactElement[] = [];

      for (const widgetKey of widgets) {
        const widget = (predefinedWidgets as any)[widgetKey];
        if (widget) {
          const component = await createReactWidget(widget);
          components.push(component);
        }
      }

      setWidgetComponents(components);
      setIsLoading(false);
    };

    loadWidgets();
  }, [widgets]);

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      {widgetComponents}
      {showPerformanceMetrics && <PerformanceMetricsWidget />}
    </div>
  );
};

// Individual Widget Components for React
interface BaseWidgetProps {
  title: string;
  description?: string;
  refreshInterval?: number;
  className?: string;
}

const BaseWidget: React.FC<BaseWidgetProps & { children: React.ReactNode }> = ({
  title,
  description,
  refreshInterval = 60000,
  className = 'widget',
  children
}) => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  return (
    <div className={className}>
      <div className="widget-header">
        <h3 className="widget-title">{title}</h3>
        {description && <p className="widget-description">{description}</p>}
      </div>
      <div className="widget-content">
        {children}
      </div>
      <div className="widget-footer">
        <small>Last updated: {lastUpdated.toLocaleTimeString()}</small>
      </div>
    </div>
  );
};

interface MetricWidgetProps extends BaseWidgetProps {
  metric: string;
  format?: 'number' | 'percentage' | 'currency';
  value?: number;
  trend?: { direction: 'up' | 'down' | 'neutral'; percentage: number };
}

export const MetricWidget: React.FC<MetricWidgetProps> = ({
  metric,
  format = 'number',
  value,
  trend,
  ...props
}) => {
  const [metricValue, setMetricValue] = useState<number>(value || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetric = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics/metrics/${metric}`);
        const data = await response.json();
        setMetricValue(data.value || 0);
        setError(null);
      } catch (err) {
        setError('Failed to load metric data');
      } finally {
        setIsLoading(false);
      }
    };

    if (value === undefined) {
      fetchMetric();
    }
  }, [metric, value]);

  const formatValue = (val: number) => {
    switch (format) {
      case 'percentage':
        return `${(val * 100).toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD'
        }).format(val);
      default:
        return val.toLocaleString();
    }
  };

  return (
    <BaseWidget {...props}>
      {isLoading ? (
        <div className="loading-spinner">Loading...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="metric-value">
          {formatValue(metricValue)}
          {trend && (
            <span className={`trend trend-${trend.direction}`}>
              {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} 
              {Math.abs(trend.percentage).toFixed(1)}%
            </span>
          )}
        </div>
      )}
    </BaseWidget>
  );
};

interface FunnelWidgetProps extends BaseWidgetProps {
  funnelId: string;
}

export const FunnelWidget: React.FC<FunnelWidgetProps> = ({
  funnelId,
  ...props
}) => {
  const [funnelData, setFunnelData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFunnel = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics/funnels/${funnelId}`);
        const data = await response.json();
        setFunnelData(data);
      } catch (err) {
        console.error('Failed to fetch funnel data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFunnel();
  }, [funnelId]);

  if (isLoading) {
    return (
      <BaseWidget {...props}>
        <div className="loading-spinner">Loading funnel data...</div>
      </BaseWidget>
    );
  }

  if (!funnelData) {
    return (
      <BaseWidget {...props}>
        <div className="error-message">Failed to load funnel data</div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props}>
      <div className="funnel-steps">
        {funnelData.stepAnalytics?.map((step: any, index: number) => (
          <div key={index} className="funnel-step">
            <div className="step-info">
              <span className="step-name">{step.stepName}</span>
              <span className="step-users">{step.totalUsers} users</span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress" 
                style={{ width: `${step.completionRate * 100}%` }}
              />
            </div>
            <div className="step-percentage">
              {(step.completionRate * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
};

interface ABTestWidgetProps extends BaseWidgetProps {
  testId: string;
}

export const ABTestWidget: React.FC<ABTestWidgetProps> = ({
  testId,
  ...props
}) => {
  const [testData, setTestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/analytics/ab-tests/${testId}`);
        const data = await response.json();
        setTestData(data);
      } catch (err) {
        console.error('Failed to fetch A/B test data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTest();
  }, [testId]);

  if (isLoading) {
    return (
      <BaseWidget {...props}>
        <div className="loading-spinner">Loading A/B test data...</div>
      </BaseWidget>
    );
  }

  if (!testData) {
    return (
      <BaseWidget {...props}>
        <div className="error-message">Failed to load A/B test data</div>
      </BaseWidget>
    );
  }

  return (
    <BaseWidget {...props}>
      <div className="variants-container">
        {testData.variants?.map((variant: any, index: number) => (
          <div key={index} className="abtest-variant">
            <div className="variant-header">
              <span className="variant-name">{variant.name}</span>
              <span className={`significance-badge ${
                variant.statisticalSignificance ? 'badge-success' : 'badge-warning'
              }`}>
                {variant.statisticalSignificance ? 'Significant' : 'Not Significant'}
              </span>
            </div>
            <div className="variant-metrics">
              <div className="metric">
                Conversion Rate: {((variant.conversionRate || 0) * 100).toFixed(2)}%
              </div>
              <div className="metric">Sample Size: {variant.sampleSize}</div>
              <div className="metric">Confidence: {(variant.confidence * 100).toFixed(1)}%</div>
              {variant.results?.uplift !== undefined && (
                <div className={`metric uplift-${variant.results.uplift >= 0 ? 'positive' : 'negative'}`}>
                  Uplift: {Math.abs(variant.results.uplift).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
};

// Performance Metrics Widget
const PerformanceMetricsWidget: React.FC = () => {
  const [performance, setPerformance] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics/performance');
        const data = await response.json();
        setPerformance(data);
      } catch (err) {
        console.error('Failed to fetch performance data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformance();
    const interval = setInterval(fetchPerformance, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <MetricWidget
        title="System Performance"
        description="Loading performance metrics..."
        metric="performance"
        className="widget"
      >
        <div className="loading-spinner">Loading...</div>
      </MetricWidget>
    );
  }

  const avgPageLoadTime = performance 
    ? Object.values(performance.pageLoadTime || {}).reduce((sum: number, time: any) => sum + time, 0) / 
      Object.keys(performance.pageLoadTime || {}).length || 0
    : 0;

  return (
    <BaseWidget 
      title="System Performance" 
      description="Current system performance metrics"
    >
      <div className="performance-metrics">
        <div className="metric-row">
          <span>Avg Page Load Time:</span>
          <span>{avgPageLoadTime.toFixed(0)}ms</span>
        </div>
        {performance?.systemMetrics?.activeUsers && (
          <div className="metric-row">
            <span>Active Users:</span>
            <span>{performance.systemMetrics.activeUsers}</span>
          </div>
        )}
        {performance?.systemMetrics?.cpuUsage && (
          <div className="metric-row">
            <span>CPU Usage:</span>
            <span>{performance.systemMetrics.cpuUsage.toFixed(1)}%</span>
          </div>
        )}
        {performance?.userEngagement?.sessionDuration && (
          <div className="metric-row">
            <span>Avg Session Duration:</span>
            <span>{(performance.userEngagement.sessionDuration / 1000 / 60).toFixed(1)}min</span>
          </div>
        )}
      </div>
    </BaseWidget>
  );
};

// Event Tracking Hook for React Components
export const useEventTracking = () => {
  const trackConversion = (event: EventType, properties?: Record<string, any>) => {
    eventTracking.track(event, properties);
  };

  const trackPageView = (pageName: string) => {
    eventTracking.track('page_view', { pageName });
  };

  const trackFeatureUsage = (featureName: string, properties?: Record<string, any>) => {
    eventTracking.track('feature_use', { featureName, ...properties });
  };

  const trackUpgradeAttempt = (planType: string, properties?: Record<string, any>) => {
    eventTracking.track('upgrade_attempt', { planType, ...properties });
  };

  const trackUpgradeSuccess = (planType: string, revenue: number, properties?: Record<string, any>) => {
    eventTracking.track('upgrade_success', { planType, revenue, ...properties });
  };

  const trackOnboardingStep = (step: string, properties?: Record<string, any>) => {
    eventTracking.track('onboarding_step', { step, ...properties });
  };

  return {
    trackConversion,
    trackPageView,
    trackFeatureUsage,
    trackUpgradeAttempt,
    trackUpgradeSuccess,
    trackOnboardingStep,
  };
};

// Higher-Order Component for Automatic Event Tracking
export const withEventTracking = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  trackingInfo: {
    eventType: EventType;
    getProperties?: (props: P) => Record<string, any>;
  }
) => {
  const TrackedComponent: React.FC<P> = (props) => {
    const { trackConversion } = useEventTracking();

    useEffect(() => {
      const properties = trackingInfo.getProperties?.(props) || {};
      trackConversion(trackingInfo.eventType, properties);
    }, [props, trackConversion]);

    return <WrappedComponent {...props} />;
  };

  TrackedComponent.displayName = `withEventTracking(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return TrackedComponent;
};