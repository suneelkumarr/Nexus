// Real-time Dashboard Validation System
import { DashboardValidationResult, DashboardValidationConfig } from '../types/validation-types';
import { ValidationConfigManager } from '../config/validation-config';

interface DashboardData {
  id: string;
  name: string;
  lastUpdate: number;
  metrics: Record<string, {
    value: number;
    lastUpdate: number;
    trend: number;
    status: 'good' | 'warning' | 'critical';
  }>;
  cache: {
    lastRefresh: number;
    size: number;
    hitRate: number;
  };
}

export class DashboardValidator {
  private config: DashboardValidationConfig;
  private configManager: ValidationConfigManager;

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.config = this.configManager.getDashboardConfig();
  }

  /**
   * Validate real-time dashboard accuracy and consistency
   */
  async validateDashboards(mockData?: DashboardData[]): Promise<DashboardValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get or generate test data
      const dashboards = mockData || this.generateMockDashboardData();
      
      const validation = {
        dashboardsValidated: dashboards.length,
        staleDataIssues: [] as any[],
        consistencyIssues: [] as any[]
      };

      for (const dashboard of dashboards) {
        // Check for stale data
        if (this.config.alertOnStaleData) {
          const staleness = this.calculateDataStaleness(dashboard);
          if (staleness > this.config.staleDataThreshold * 60) { // Convert minutes to seconds
            validation.staleDataIssues.push({
              dashboardId: dashboard.id,
              lastUpdate: dashboard.lastUpdate,
              staleness: staleness / 60 // Convert to minutes
            });
          }
        }

        // Check data consistency
        if (this.config.dataConsistencyChecks) {
          const consistencyIssues = this.checkDataConsistency(dashboard);
          validation.consistencyIssues.push(...consistencyIssues);
        }

        // Check cache health
        if (this.config.cacheValidation) {
          const cacheIssues = this.validateCacheHealth(dashboard.cache);
          validation.consistencyIssues.push(...cacheIssues.map(issue => ({
            ...issue,
            dashboardId: dashboard.id
          })));
        }
      }

      // Determine overall status
      const criticalIssues = validation.staleDataIssues.length;
      const totalIssues = validation.staleDataIssues.length + validation.consistencyIssues.length;
      
      let status: 'passed' | 'warning' | 'failed' = 'passed';
      let message = 'Dashboard validation passed successfully';
      
      if (criticalIssues > dashboards.length * 0.5) {
        status = 'failed';
        message = `Critical dashboard issues found: ${criticalIssues} dashboards have stale data`;
      } else if (totalIssues > dashboards.length * 0.7) {
        status = 'failed';
        message = `Multiple dashboard issues found: ${totalIssues} total issues`;
      } else if (totalIssues > 0) {
        status = 'warning';
        message = `Some dashboard issues found: ${totalIssues} issues`;
      }

      const result: DashboardValidationResult = {
        id: `dashboard-${Date.now()}`,
        type: 'dashboard',
        status,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message,
        details: {
          ...validation,
          averageRefreshInterval: this.calculateAverageRefreshInterval(dashboards),
          cacheHitRate: this.calculateOverallCacheHitRate(dashboards),
          dataAccuracy: this.calculateDataAccuracy(dashboards)
        },
        recommendations: this.generateDashboardRecommendations(validation),
        severity: status === 'failed' ? 'high' : status === 'warning' ? 'medium' : 'low'
      };

      return result;

    } catch (error) {
      return {
        id: `dashboard-error-${Date.now()}`,
        type: 'dashboard',
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `Dashboard validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          dashboardsValidated: 0,
          staleDataIssues: [],
          consistencyIssues: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        recommendations: ['Check dashboard implementation', 'Verify real-time data pipeline'],
        severity: 'critical'
      };
    }
  }

  /**
   * Calculate data staleness
   */
  private calculateDataStaleness(dashboard: DashboardData): number {
    const now = Date.now();
    return (now - dashboard.lastUpdate) / 1000; // Return in seconds
  }

  /**
   * Check data consistency across metrics
   */
  private checkDataConsistency(dashboard: DashboardData): Array<{
    metric: string;
    issue: string;
  }> {
    const issues: Array<{ metric: string; issue: string }> = [];

    // Check for negative values where they shouldn't exist
    for (const [metricName, metric] of Object.entries(dashboard.metrics)) {
      if (metric.value < 0 && !this.canBeNegative(metricName)) {
        issues.push({
          metric: metricName,
          issue: 'Metric has negative value but should be non-negative'
        });
      }

      // Check for unrealistic values
      if (metric.value > 1000000 && this.shouldBeLimited(metricName)) {
        issues.push({
          metric: metricName,
          issue: 'Metric value exceeds reasonable limits'
        });
      }

      // Check trend consistency
      if (Math.abs(metric.trend) > 100) {
        issues.push({
          metric: metricName,
          issue: 'Trend value is unrealistic (>100% change)'
        });
      }

      // Check for stale individual metrics
      const metricStaleness = (Date.now() - metric.lastUpdate) / 1000;
      if (metricStaleness > this.config.staleDataThreshold * 60) {
        issues.push({
          metric: metricName,
          issue: 'Individual metric data is stale'
        });
      }
    }

    // Cross-metric consistency checks
    const consistencyChecks = this.performCrossMetricChecks(dashboard.metrics);
    issues.push(...consistencyChecks);

    return issues;
  }

  /**
   * Validate cache health
   */
  private validateCacheHealth(cache: { lastRefresh: number; size: number; hitRate: number }): Array<{
    metric: string;
    issue: string;
  }> {
    const issues: Array<{ metric: string; issue: string }> = [];

    // Check cache refresh frequency
    const timeSinceRefresh = (Date.now() - cache.lastRefresh) / 1000;
    if (timeSinceRefresh > this.config.refreshInterval * 2) {
      issues.push({
        metric: 'cache_refresh',
        issue: 'Cache has not been refreshed recently'
      });
    }

    // Check cache hit rate
    if (cache.hitRate < 0.7) {
      issues.push({
        metric: 'cache_hit_rate',
        issue: `Cache hit rate is low: ${(cache.hitRate * 100).toFixed(1)}%`
      });
    }

    // Check cache size
    if (cache.size > 1000000) { // 1MB threshold
      issues.push({
        metric: 'cache_size',
        issue: `Cache size is large: ${(cache.size / 1024).toFixed(1)}KB`
      });
    }

    return issues;
  }

  /**
   * Perform cross-metric consistency checks
   */
  private performCrossMetricChecks(metrics: Record<string, any>): Array<{ metric: string; issue: string }> {
    const issues: Array<{ metric: string; issue: string }> = [];

    // Check if conversion rate is consistent with upgrade metrics
    const conversionRate = metrics['conversion_rate'];
    const upgradeAttempts = metrics['upgrade_attempts'];
    const upgradeSuccesses = metrics['upgrade_successes'];

    if (conversionRate && upgradeAttempts && upgradeSuccesses) {
      const calculatedRate = upgradeSuccesses.value / upgradeAttempts.value;
      if (Math.abs(calculatedRate - conversionRate.value) > 0.01) {
        issues.push({
          metric: 'conversion_rate',
          issue: 'Conversion rate inconsistent with upgrade attempt/success numbers'
        });
      }
    }

    // Check funnel step consistency
    const funnelSteps = Object.keys(metrics).filter(key => key.startsWith('funnel_step_'));
    if (funnelSteps.length > 1) {
      const stepValues = funnelSteps.map(step => metrics[step].value).sort((a, b) => b - a);
      
      // Check if steps generally decrease
      for (let i = 1; i < stepValues.length; i++) {
        if (stepValues[i-1] < stepValues[i]) {
          issues.push({
            metric: 'funnel_consistency',
            issue: 'Funnel steps are not in expected descending order'
          });
          break;
        }
      }
    }

    return issues;
  }

  /**
   * Check if a metric can have negative values
   */
  private canBeNegative(metricName: string): boolean {
    const canBeNegative = [
      'trend',
      'growth_rate',
      'change'
    ];
    return canBeNegative.some(term => metricName.toLowerCase().includes(term));
  }

  /**
   * Check if a metric should be limited to reasonable values
   */
  private shouldBeLimited(metricName: string): boolean {
    const shouldBeLimited = [
      'rate',
      'percentage',
      'ratio',
      'conversion'
    ];
    return shouldBeLimited.some(term => metricName.toLowerCase().includes(term));
  }

  /**
   * Calculate average refresh interval
   */
  private calculateAverageRefreshInterval(dashboards: DashboardData[]): number {
    if (dashboards.length === 0) return 0;
    
    const intervals = dashboards.map(d => (Date.now() - d.lastUpdate) / 1000);
    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  /**
   * Calculate overall cache hit rate
   */
  private calculateOverallCacheHitRate(dashboards: DashboardData[]): number {
    const hitRates = dashboards.map(d => d.cache.hitRate);
    return hitRates.length > 0 ? hitRates.reduce((sum, rate) => sum + rate, 0) / hitRates.length : 0;
  }

  /**
   * Calculate data accuracy score
   */
  private calculateDataAccuracy(dashboards: DashboardData[]): number {
    let totalScore = 0;
    
    for (const dashboard of dashboards) {
      let score = 100;
      
      // Deduct for stale data
      const staleness = this.calculateDataStaleness(dashboard);
      if (staleness > this.config.staleDataThreshold * 60) {
        score -= 20;
      } else if (staleness > this.config.staleDataThreshold * 30) {
        score -= 10;
      }
      
      // Deduct for consistency issues
      const consistencyIssues = this.checkDataConsistency(dashboard);
      score -= consistencyIssues.length * 5;
      
      // Deduct for poor cache performance
      if (dashboard.cache.hitRate < 0.7) {
        score -= (0.7 - dashboard.cache.hitRate) * 100;
      }
      
      totalScore += Math.max(0, score);
    }
    
    return dashboards.length > 0 ? totalScore / dashboards.length : 0;
  }

  /**
   * Generate mock dashboard data for testing
   */
  private generateMockDashboardData(): DashboardData[] {
    const now = Date.now();
    
    return [
      {
        id: 'main-dashboard',
        name: 'Main Analytics Dashboard',
        lastUpdate: now - 20000, // 20 seconds ago
        metrics: {
          daily_active_users: { value: 1247, lastUpdate: now - 15000, trend: 5.2, status: 'good' as const },
          conversion_rate: { value: 0.05, lastUpdate: now - 18000, trend: -2.1, status: 'warning' as const },
          onboarding_completion: { value: 0.78, lastUpdate: now - 25000, trend: 3.4, status: 'good' as const },
          upgrade_attempts: { value: 156, lastUpdate: now - 30000, trend: 8.7, status: 'good' as const },
          upgrade_successes: { value: 8, lastUpdate: now - 30000, trend: 12.5, status: 'warning' as const },
          avg_session_duration: { value: 245, lastUpdate: now - 12000, trend: -1.2, status: 'good' as const }
        },
        cache: {
          lastRefresh: now - 25000,
          size: 245760,
          hitRate: 0.85
        }
      },
      {
        id: 'performance-dashboard',
        name: 'Performance Dashboard',
        lastUpdate: now - 180000, // 3 minutes ago (stale)
        metrics: {
          avg_page_load_time: { value: 2100, lastUpdate: now - 180000, trend: -15.2, status: 'critical' as const },
          api_response_time: { value: 850, lastUpdate: now - 180000, trend: 5.3, status: 'warning' as const },
          error_rate: { value: 0.025, lastUpdate: now - 180000, trend: 0.5, status: 'good' as const },
          memory_usage: { value: 68, lastUpdate: now - 180000, trend: 2.1, status: 'good' as const },
          cpu_usage: { value: 42, lastUpdate: now - 180000, trend: -3.2, status: 'good' as const }
        },
        cache: {
          lastRefresh: now - 200000,
          size: 1024000,
          hitRate: 0.62
        }
      },
      {
        id: 'ab-test-dashboard',
        name: 'A/B Test Results Dashboard',
        lastUpdate: now - 45000, // 45 seconds ago
        metrics: {
          test_1_conversion: { value: 0.066, lastUpdate: now - 40000, trend: 15.2, status: 'good' as const },
          test_1_visitors_control: { value: 980, lastUpdate: now - 42000, trend: 0, status: 'good' as const },
          test_1_visitors_variant: { value: 965, lastUpdate: now - 42000, trend: 0, status: 'good' as const },
          test_2_conversion: { value: 0.042, lastUpdate: now - 45000, trend: -8.1, status: 'warning' as const },
          statistical_significance: { value: 0.95, lastUpdate: now - 45000, trend: 0, status: 'good' as const }
        },
        cache: {
          lastRefresh: now - 50000,
          size: 512000,
          hitRate: 0.91
        }
      }
    ];
  }

  /**
   * Generate dashboard recommendations
   */
  private generateDashboardRecommendations(validation: any): string[] {
    const recommendations: string[] = [];

    if (validation.staleDataIssues.length > 0) {
      recommendations.push('Increase dashboard refresh frequency to reduce data staleness');
      recommendations.push('Implement WebSocket connections for real-time data updates');
      recommendations.push('Add loading indicators and last-updated timestamps');
    }

    if (validation.consistencyIssues.length > 0) {
      recommendations.push('Implement data validation rules in dashboard metrics');
      recommendations.push('Add cross-metric consistency checks');
      recommendations.push('Set up automated data quality monitoring');
    }

    const lowCacheHitRate = validation.cacheHitRate && validation.cacheHitRate < 0.7;
    if (lowCacheHitRate) {
      recommendations.push('Optimize caching strategy to improve hit rates');
      recommendations.push('Review cache invalidation logic');
      recommendations.push('Consider implementing tiered caching');
    }

    const lowDataAccuracy = validation.dataAccuracy && validation.dataAccuracy < 80;
    if (lowDataAccuracy) {
      recommendations.push('Implement comprehensive data validation pipeline');
      recommendations.push('Add data lineage tracking for debugging');
      recommendations.push('Set up automated data reconciliation');
    }

    if (validation.staleDataIssues.length === 0 && validation.consistencyIssues.length === 0) {
      recommendations.push('Dashboards are performing optimally');
      recommendations.push('Continue monitoring for data quality issues');
    }

    // General recommendations
    recommendations.push('Implement progressive data loading for better performance');
    recommendations.push('Add data export functionality with timestamp validation');
    recommendations.push('Consider implementing data versioning for audit trails');

    return recommendations;
  }

  /**
   * Get dashboard health score
   */
  public getDashboardHealth(dashboards: DashboardData[]): number {
    let totalScore = 0;
    
    for (const dashboard of dashboards) {
      let score = 100;
      
      // Deduct for stale data
      const staleness = this.calculateDataStaleness(dashboard);
      if (staleness > this.config.staleDataThreshold * 60) {
        score -= 25;
      } else if (staleness > this.config.staleDataThreshold * 30) {
        score -= 15;
      }
      
      // Deduct for cache issues
      if (dashboard.cache.hitRate < 0.7) {
        score -= (0.7 - dashboard.cache.hitRate) * 50;
      }
      
      // Deduct for consistency issues
      const consistencyIssues = this.checkDataConsistency(dashboard);
      score -= consistencyIssues.length * 3;
      
      totalScore += Math.max(0, score);
    }
    
    return dashboards.length > 0 ? totalScore / dashboards.length : 0;
  }

  /**
   * Get dashboard update frequency analysis
   */
  public getUpdateFrequencyAnalysis(dashboards: DashboardData[]): {
    averageInterval: number;
    frequentUpdates: string[];
    infrequentUpdates: string[];
    recommendations: string[];
  } {
    const now = Date.now();
    const intervals = dashboards.map(d => (now - d.lastUpdate) / 1000);
    const averageInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
    
    const frequentUpdates = dashboards
      .filter(d => (now - d.lastUpdate) / 1000 < 30)
      .map(d => d.name);
      
    const infrequentUpdates = dashboards
      .filter(d => (now - d.lastUpdate) / 1000 > 120)
      .map(d => d.name);
    
    const recommendations: string[] = [];
    
    if (frequentUpdates.length === 0) {
      recommendations.push('Consider increasing update frequency for critical metrics');
    }
    
    if (infrequentUpdates.length > 0) {
      recommendations.push('Update less frequently refreshed dashboards or reduce complexity');
    }
    
    if (averageInterval > 60) {
      recommendations.push('Overall dashboard update interval is high - consider optimization');
    }
    
    return {
      averageInterval,
      frequentUpdates,
      infrequentUpdates,
      recommendations
    };
  }
}

export default DashboardValidator;
