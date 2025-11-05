// Main export file for Metrics Tracking System

// Types
export * from './types/index.js';

// Core Event Tracking
export { EventTracker, eventTracking } from './core/event-tracker.js';

// Funnel Analysis
export { 
  FunnelAnalyzer, 
  predefinedFunnels 
} from './funnels/funnel-analyzer.js';

// Performance Collection
export { 
  PerformanceCollector, 
  WebVitalsTracker 
} from './performance/performance-collector.js';

// Dashboard Widgets
export { 
  DashboardWidgetFactory,
  MetricWidget,
  FunnelWidget,
  ABTestWidget,
  ChartWidget,
  DashboardManager,
  predefinedWidgets
} from './dashboard/widgets.js';

// Reporting System
export { 
  ReportingSystem,
  ReportEmailService,
  reportingSystem,
  emailService,
  reportTemplates
} from './reporting/reporting-system.js';

/**
 * Complete Metrics Tracking System
 * Provides a unified interface for all analytics functionality
 */
export class MetricsTrackingSystem {
  private eventTracker: typeof EventTracker;
  private funnelAnalyzer: FunnelAnalyzer;
  private performanceCollector: PerformanceCollector;
  private dashboardManager: DashboardManager;
  private reportingSystem: ReportingSystem;

  constructor(options?: {
    apiEndpoint?: string;
    autoTrack?: boolean;
    debug?: boolean;
  }) {
    this.eventTracker = EventTracker;
    this.funnelAnalyzer = new FunnelAnalyzer();
    this.performanceCollector = new PerformanceCollector();
    this.dashboardManager = new DashboardManager();
    this.reportingSystem = reportingSystem;

    // Register predefined funnels
    Object.values(predefinedFunnels).forEach(funnel => {
      this.funnelAnalyzer.registerFunnel(funnel);
    });

    // Initialize dashboard with predefined widgets
    this.initializeDashboard();

    // Auto-start if enabled
    if (options?.autoTrack !== false) {
      this.initializeAutoTracking();
    }
  }

  /**
   * Initialize the metrics tracking system
   */
  initialize(userId?: string): void {
    // Set up event tracking
    this.eventTracker.getInstance(userId);

    // Register event processors
    this.setupEventProcessing();
  }

  /**
   * Track user action with automatic funnel analysis
   */
  track(
    eventType: string, 
    properties?: Record<string, any>
  ): void {
    eventTracking.track(eventType as any, properties);

    // Process through funnel analyzer if relevant
    if (this.isFunnelEvent(eventType)) {
      this.processFunnelEvent(eventType as any, properties);
    }
  }

  /**
   * Analyze conversion funnel
   */
  analyzeFunnel(
    funnelId: string, 
    timeframe?: { start: number; end: number }
  ): ConversionFunnel {
    return this.funnelAnalyzer.analyzeFunnel(funnelId, timeframe);
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return this.performanceCollector.getCurrentMetrics();
  }

  /**
   * Create dashboard widget
   */
  createWidget(config: any): any {
    return this.dashboardManager.addWidget(config);
  }

  /**
   * Generate manual report
   */
  async generateReport(reportId: string, format?: string): Promise<string> {
    return this.reportingSystem.generateReport(reportId, format as any);
  }

  /**
   * Get system status and health metrics
   */
  getSystemStatus(): {
    status: 'healthy' | 'warning' | 'error';
    metrics: {
      totalEvents: number;
      activeFunnels: number;
      dashboardWidgets: number;
      reportsConfigured: number;
    };
    alerts: Array<{ type: 'warning' | 'error'; message: string }>;
  } {
    const performanceMetrics = this.getPerformanceMetrics();
    const alerts: Array<{ type: 'warning' | 'error'; message: string }> = [];

    // Check for performance issues
    Object.entries(performanceMetrics.pageLoadTime).forEach(([page, loadTime]) => {
      if (loadTime > 3000) {
        alerts.push({
          type: 'warning',
          message: `Slow page load on ${page}: ${loadTime}ms`,
        });
      }
    });

    // Check error rates
    Object.entries(performanceMetrics.errorRates).forEach(([endpoint, errorRate]) => {
      if (errorRate.rate > 0.05) {
        alerts.push({
          type: 'error',
          message: `High error rate on ${endpoint}: ${(errorRate.rate * 100).toFixed(2)}%`,
        });
      }
    });

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (alerts.some(alert => alert.type === 'error')) {
      status = 'error';
    } else if (alerts.length > 0) {
      status = 'warning';
    }

    return {
      status,
      metrics: {
        totalEvents: 0, // Would get from event tracker
        activeFunnels: Object.keys(predefinedFunnels).length,
        dashboardWidgets: this.dashboardManager.getWidgets().length,
        reportsConfigured: this.reportingSystem.getAllReports().length,
      },
      alerts,
    };
  }

  /**
   * Export analytics data
   */
  exportData(
    format: 'json' | 'csv' | 'excel',
    timeframe?: { start: number; end: number }
  ): Promise<string> {
    // This would export all analytics data in the specified format
    const data = {
      funnels: Object.keys(predefinedFunnels).reduce((acc, funnelId) => {
        acc[funnelId] = this.analyzeFunnel(funnelId, timeframe);
        return acc;
      }, {} as Record<string, ConversionFunnel>),
      performance: this.getPerformanceMetrics(),
      reports: this.reportingSystem.getAllReports(),
    };

    // Format and return data
    switch (format) {
      case 'json':
        return Promise.resolve(JSON.stringify(data, null, 2));
      case 'csv':
        return Promise.resolve(this.convertToCSV(data));
      default:
        return Promise.resolve(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Private helper methods
   */
  private initializeDashboard(): void {
    // Add predefined widgets
    Object.entries(predefinedWidgets).forEach(([key, widget]) => {
      this.dashboardManager.addWidget(widget);
    });

    // Start real-time refresh
    this.dashboardManager.startRealTimeRefresh();
  }

  private initializeAutoTracking(): void {
    // Auto-track page views, errors, etc.
    if (typeof window !== 'undefined') {
      // Page view tracking is already handled in event-tracker.ts
      
      // Performance tracking is already handled in performance-collector.ts
      
      // Add additional auto-tracking as needed
      this.setupPerformanceMonitoring();
    }
  }

  private setupEventProcessing(): void {
    // Set up automatic event processing for funnel analysis
    // This would typically involve listening to events and updating funnels
  }

  private isFunnelEvent(eventType: string): boolean {
    const funnelEventTypes = [
      'user_signup',
      'user_login', 
      'onboarding_start',
      'onboarding_complete',
      'onboarding_step',
      'feature_use',
      'feature_engagement',
      'upgrade_attempt',
      'upgrade_success',
      'upgrade_failure',
    ];

    return funnelEventTypes.includes(eventType);
  }

  private processFunnelEvent(eventType: string, properties?: Record<string, any>): void {
    // Process event through funnel analyzer
    // This would typically involve updating user journey data
    console.log('Processing funnel event:', eventType, properties);
  }

  private setupPerformanceMonitoring(): void {
    // Monitor for performance issues and alert
    setInterval(() => {
      const status = this.getSystemStatus();
      if (status.status === 'error' || status.status === 'warning') {
        console.warn('Metrics tracking system alerts:', status.alerts);
      }
    }, 60000); // Check every minute
  }

  private convertToCSV(data: any): string {
    let csv = 'Type,Name,Value\n';
    
    Object.entries(data.funnels).forEach(([key, funnel]) => {
      csv += `funnel,${key}_conversion_rate,${funnel.conversionRate}\n`;
      csv += `funnel,${key}_total_users,${funnel.totalUsers}\n`;
    });

    return csv;
  }
}

// Convenience function to get the singleton instance
let metricsInstance: MetricsTrackingSystem | null = null;

export const getMetricsInstance = (options?: {
  apiEndpoint?: string;
  autoTrack?: boolean;
  debug?: boolean;
}): MetricsTrackingSystem => {
  if (!metricsInstance) {
    metricsInstance = new MetricsTrackingSystem(options);
  }
  return metricsInstance;
};

// Default export for convenience
export default MetricsTrackingSystem;