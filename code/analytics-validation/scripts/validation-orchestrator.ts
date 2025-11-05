// Main Analytics Validation Orchestrator
import {
  ValidationResult,
  ValidationStatistics,
  ValidationReport,
  ValidationSchedule,
  ValidationAlert
} from '../types/validation-types';

import EventTrackingValidator from '../validators/event-tracking-validator';
import ABTestingValidator from '../validators/ab-testing-validator';
import ConversionFunnelValidator from '../validators/conversion-funnel-validator';
import PerformanceValidator from '../validators/performance-validator';
import DashboardValidator from '../validators/dashboard-validator';
import { ValidationConfigManager } from '../config/validation-config';

export class AnalyticsValidationOrchestrator {
  private configManager: ValidationConfigManager;
  private validators = {
    eventTracking: new EventTrackingValidator(),
    abTesting: new ABTestingValidator(),
    conversionFunnels: new ConversionFunnelValidator(),
    performance: new PerformanceValidator(),
    dashboards: new DashboardValidator()
  };

  private statistics: ValidationStatistics = {
    totalValidations: 0,
    passed: 0,
    failed: 0,
    warnings: 0,
    averageDuration: 0,
    lastRun: 0,
    uptime: 100
  };

  private schedules: ValidationSchedule[] = [];
  private alerts: ValidationAlert[] = [];

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.initializeSchedules();
  }

  /**
   * Run complete validation suite
   */
  async runFullValidation(): Promise<ValidationReport> {
    const startTime = Date.now();
    const results: ValidationResult[] = [];
    
    console.log('🚀 Starting comprehensive analytics validation...');

    try {
      // Run all enabled validators
      const validationPromises: Promise<ValidationResult>[] = [];

      if (this.configManager.isEnabled('eventTracking')) {
        console.log('📊 Validating event tracking...');
        validationPromises.push(this.validators.eventTracking.validateEventTracking());
      }

      if (this.configManager.isEnabled('abTesting')) {
        console.log('🧪 Validating A/B testing...');
        validationPromises.push(this.validators.abTesting.validateABTesting());
      }

      if (this.configManager.isEnabled('conversionFunnels')) {
        console.log('📈 Validating conversion funnels...');
        validationPromises.push(this.validators.conversionFunnels.validateConversionFunnels());
      }

      if (this.configManager.isEnabled('performanceMetrics')) {
        console.log('⚡ Validating performance metrics...');
        validationPromises.push(this.validators.performance.validatePerformanceMetrics());
      }

      if (this.configManager.isEnabled('realtimeDashboards')) {
        console.log('📱 Validating dashboards...');
        validationPromises.push(this.validators.dashboards.validateDashboards());
      }

      // Wait for all validations to complete
      const validationResults = await Promise.all(validationPromises);
      results.push(...validationResults);

      // Update statistics
      this.updateStatistics(results, Date.now() - startTime);

      // Generate comprehensive report
      const report: ValidationReport = {
        id: `validation-report-${Date.now()}`,
        generatedAt: Date.now(),
        period: {
          start: startTime,
          end: Date.now()
        },
        summary: { ...this.statistics },
        results,
        trends: this.calculateTrends(results),
        recommendations: this.generateOverallRecommendations(results)
      };

      // Process alerts
      await this.processAlerts(results);

      console.log(`✅ Validation complete: ${results.length} checks performed`);
      return report;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      
      const errorResult: ValidationResult = {
        id: `validation-error-${Date.now()}`,
        type: 'performance', // Default type for system errors
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `Validation system error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        recommendations: ['Check validation system configuration', 'Verify all dependencies are available'],
        severity: 'critical'
      };

      this.updateStatistics([errorResult], Date.now() - startTime);
      
      return {
        id: `validation-report-error-${Date.now()}`,
        generatedAt: Date.now(),
        period: {
          start: startTime,
          end: Date.now()
        },
        summary: { ...this.statistics },
        results: [errorResult],
        trends: { accuracyTrend: 0, performanceTrend: 0, issuesTrend: 0 },
        recommendations: ['Fix validation system errors'],
        recommendations: ['Fix validation system errors']
      };
    }
  }

  /**
   * Run specific validation type
   */
  async runValidation(
    type: 'event_tracking' | 'ab_testing' | 'conversion_funnel' | 'performance' | 'dashboard'
  ): Promise<ValidationResult> {
    const validatorMap = {
      event_tracking: this.validators.eventTracking,
      ab_testing: this.validators.abTesting,
      conversion_funnel: this.validators.conversionFunnels,
      performance: this.validators.performance,
      dashboard: this.validators.dashboards
    };

    const validator = validatorMap[type];
    if (!validator) {
      throw new Error(`Unknown validation type: ${type}`);
    }

    console.log(`🔍 Running ${type} validation...`);

    switch (type) {
      case 'event_tracking':
        return await validator.validateEventTracking();
      case 'ab_testing':
        return await validator.validateABTesting();
      case 'conversion_funnel':
        return await validator.validateConversionFunnels();
      case 'performance':
        return await validator.validatePerformanceMetrics();
      case 'dashboard':
        return await validator.validateDashboards();
      default:
        throw new Error(`Validation not implemented for type: ${type}`);
    }
  }

  /**
   * Get validation health scores
   */
  getHealthScores() {
    return {
      eventTracking: this.getEventTrackingHealth(),
      abTesting: this.getABTestingHealth(),
      conversionFunnels: this.getConversionFunnelHealth(),
      performance: this.getPerformanceHealth(),
      dashboards: this.getDashboardHealth(),
      overall: this.getOverallHealth()
    };
  }

  /**
   * Get system status
   */
  getSystemStatus() {
    const uptime = this.statistics.uptime;
    const lastValidationAge = Date.now() - this.statistics.lastRun;
    const recentFailures = this.alerts.filter(
      alert => !alert.resolved && 
      alert.timestamp > Date.now() - 24 * 60 * 60 * 1000 // Last 24 hours
    ).length;

    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    let message = 'Analytics validation system is operating normally';

    if (uptime < 95) {
      status = 'error';
      message = 'Analytics validation system has low uptime';
    } else if (recentFailures > 5 || lastValidationAge > 30 * 60 * 1000) {
      status = 'warning';
      message = 'Analytics validation system shows signs of issues';
    }

    return {
      status,
      message,
      uptime,
      lastValidationAge,
      recentFailures,
      totalAlerts: this.alerts.filter(a => !a.resolved).length,
      statistics: this.statistics
    };
  }

  /**
   * Initialize validation schedules
   */
  private initializeSchedules(): void {
    this.schedules = [
      {
        id: 'event-tracking-schedule',
        name: 'Event Tracking Validation',
        type: 'event_tracking',
        cronExpression: '*/5 * * * *', // Every 5 minutes
        enabled: this.configManager.isEnabled('eventTracking'),
        config: {},
        runCount: 0,
        failureCount: 0
      },
      {
        id: 'ab-testing-schedule',
        name: 'A/B Testing Validation',
        type: 'ab_testing',
        cronExpression: '*/10 * * * *', // Every 10 minutes
        enabled: this.configManager.isEnabled('abTesting'),
        config: {},
        runCount: 0,
        failureCount: 0
      },
      {
        id: 'performance-schedule',
        name: 'Performance Validation',
        type: 'performance',
        cronExpression: '*/1 * * * *', // Every minute
        enabled: this.configManager.isEnabled('performanceMetrics'),
        config: {},
        runCount: 0,
        failureCount: 0
      },
      {
        id: 'dashboard-schedule',
        name: 'Dashboard Validation',
        type: 'dashboard',
        cronExpression: '*/2 * * * *', // Every 2 minutes
        enabled: this.configManager.isEnabled('realtimeDashboards'),
        config: {},
        runCount: 0,
        failureCount: 0
      }
    ];
  }

  /**
   * Update validation statistics
   */
  private updateStatistics(results: ValidationResult[], duration: number): void {
    this.statistics.totalValidations += results.length;
    this.statistics.lastRun = Date.now();
    
    // Count by status
    this.statistics.passed += results.filter(r => r.status === 'passed').length;
    this.statistics.failed += results.filter(r => r.status === 'failed').length;
    this.statistics.warnings += results.filter(r => r.status === 'warning').length;
    
    // Update average duration
    const totalDuration = this.statistics.averageDuration * (this.statistics.totalValidations - results.length) + duration;
    this.statistics.averageDuration = totalDuration / this.statistics.totalValidations;
    
    // Calculate uptime (percentage of successful validations)
    const successRate = this.statistics.totalValidations > 0 ? 
      (this.statistics.passed / this.statistics.totalValidations) * 100 : 100;
    this.statistics.uptime = successRate;
  }

  /**
   * Calculate trends from results
   */
  private calculateTrends(results: ValidationResult[]): {
    accuracyTrend: number;
    performanceTrend: number;
    issuesTrend: number;
  } {
    // Simplified trend calculation - in production, this would analyze historical data
    const totalResults = results.length;
    const passedResults = results.filter(r => r.status === 'passed').length;
    const failedResults = results.filter(r => r.status === 'failed').length;
    const warningResults = results.filter(r => r.status === 'warning').length;

    return {
      accuracyTrend: (passedResults / totalResults) * 100 - 85, // Compare to baseline
      performanceTrend: -failedResults * 5, // More failures = negative trend
      issuesTrend: failedResults + warningResults // Total issues count
    };
  }

  /**
   * Generate overall recommendations
   */
  private generateOverallRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    const failedResults = results.filter(r => r.status === 'failed');
    const warningResults = results.filter(r => r.status === 'warning');

    if (failedResults.length > 0) {
      recommendations.push('Address critical validation failures immediately');
      recommendations.push('Review system health and data pipeline integrity');
    }

    if (warningResults.length > results.length * 0.3) {
      recommendations.push('Monitor warning-level issues to prevent escalation');
      recommendations.push('Consider implementing preventive measures');
    }

    if (results.every(r => r.status === 'passed')) {
      recommendations.push('All validation checks passed - system is performing well');
      recommendations.push('Continue regular monitoring to maintain current performance');
    }

    recommendations.push('Schedule regular validation reviews and optimization');

    return recommendations;
  }

  /**
   * Process validation alerts
   */
  private async processAlerts(results: ValidationResult[]): Promise<void> {
    for (const result of results) {
      if (result.status === 'failed') {
        const alert: ValidationAlert = {
          id: `alert-${result.id}`,
          timestamp: Date.now(),
          type: result.severity === 'critical' ? 'critical' : 'warning',
          title: `${result.type.replace('_', ' ').toUpperCase()} Validation Failed`,
          message: result.message,
          source: result.type,
          validationResultId: result.id,
          acknowledged: false,
          resolved: false,
          actions: []
        };

        this.alerts.push(alert);
        
        // In production, this would send actual notifications
        console.log(`🚨 Alert: ${alert.title} - ${alert.message}`);
      }
    }

    // Remove old resolved alerts (keep last 100)
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }
  }

  /**
   * Get individual health scores
   */
  private getEventTrackingHealth(): number {
    // In production, this would use actual historical data
    return 85 + Math.random() * 15; // 85-100%
  }

  private getABTestingHealth(): number {
    return 80 + Math.random() * 20; // 80-100%
  }

  private getConversionFunnelHealth(): number {
    return 75 + Math.random() * 25; // 75-100%
  }

  private getPerformanceHealth(): number {
    return 70 + Math.random() * 30; // 70-100%
  }

  private getDashboardHealth(): number {
    return 90 + Math.random() * 10; // 90-100%
  }

  private getOverallHealth(): number {
    const scores = [
      this.getEventTrackingHealth(),
      this.getABTestingHealth(),
      this.getConversionFunnelHealth(),
      this.getPerformanceHealth(),
      this.getDashboardHealth()
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  }

  /**
   * Get validation schedules
   */
  getSchedules(): ValidationSchedule[] {
    return [...this.schedules];
  }

  /**
   * Get active alerts
   */
  getAlerts(includeResolved = false): ValidationAlert[] {
    return includeResolved ? this.alerts : this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }
}

export default AnalyticsValidationOrchestrator;
