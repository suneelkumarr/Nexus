// Performance Metrics Validation System
import { PerformanceValidationResult, MockPerformanceData, PerformanceValidationConfig } from '../types/validation-types';
import { ValidationConfigManager } from '../config/validation-config';

export class PerformanceValidator {
  private config: PerformanceValidationConfig;
  private configManager: ValidationConfigManager;

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.config = this.configManager.getPerformanceConfig();
  }

  /**
   * Validate performance metrics
   */
  async validatePerformanceMetrics(mockData?: MockPerformanceData): Promise<PerformanceValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get or generate test data
      const performanceData = mockData || this.generateMockPerformanceData();
      
      const validation = {
        metricsValidated: 0,
        thresholdViolations: [] as any[],
        performanceScore: 0,
        recommendations: [] as string[]
      };

      // Validate page load times
      const pageLoadViolations = this.validatePageLoadTimes(performanceData.pageLoadTimes);
      validation.thresholdViolations.push(...pageLoadViolations);
      validation.metricsValidated += Object.keys(performanceData.pageLoadTimes).length;

      // Validate API response times
      const apiResponseViolations = this.validateApiResponseTimes(performanceData.apiResponseTimes);
      validation.thresholdViolations.push(...apiResponseViolations);
      validation.metricsValidated += Object.keys(performanceData.apiResponseTimes).length;

      // Validate error rates
      const errorRateViolations = this.validateErrorRates(performanceData.errorRates);
      validation.thresholdViolations.push(...errorRateViolations);
      validation.metricsValidated += Object.keys(performanceData.errorRates).length;

      // Validate system metrics
      const systemViolations = this.validateSystemMetrics(performanceData.systemMetrics);
      validation.thresholdViolations.push(...systemViolations);
      validation.metricsValidated += 3; // memory, CPU, active users

      // Calculate overall performance score
      validation.performanceScore = this.calculatePerformanceScore(performanceData, validation.thresholdViolations);

      // Generate recommendations
      validation.recommendations = this.generatePerformanceRecommendations(performanceData, validation.thresholdViolations);

      // Determine overall status
      const criticalViolations = validation.thresholdViolations.filter(v => v.severity === 'critical').length;
      const highViolations = validation.thresholdViolations.filter(v => v.severity === 'high').length;
      const totalViolations = validation.thresholdViolations.length;
      
      let status: 'passed' | 'warning' | 'failed' = 'passed';
      let message = 'Performance validation passed successfully';
      
      if (criticalViolations > 0) {
        status = 'failed';
        message = `Critical performance violations found: ${criticalViolations} critical issues`;
      } else if (highViolations > 0 || totalViolations > validation.metricsValidated * 0.3) {
        status = 'failed';
        message = `Significant performance issues found: ${totalViolations} violations across ${validation.metricsValidated} metrics`;
      } else if (totalViolations > 0) {
        status = 'warning';
        message = `Minor performance concerns found: ${totalViolations} violations`;
      }

      const result: PerformanceValidationResult = {
        id: `performance-${Date.now()}`,
        type: 'performance',
        status,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message,
        details: {
          ...validation,
          thresholds: this.config.alertThresholds,
          averagePageLoadTime: this.calculateAveragePageLoadTime(performanceData.pageLoadTimes),
          averageApiResponseTime: this.calculateAverageApiResponseTime(performanceData.apiResponseTimes),
          overallErrorRate: this.calculateOverallErrorRate(performanceData.errorRates)
        },
        recommendations: validation.recommendations,
        severity: status === 'failed' ? 'high' : status === 'warning' ? 'medium' : 'low'
      };

      return result;

    } catch (error) {
      return {
        id: `performance-error-${Date.now()}`,
        type: 'performance',
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `Performance validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          metricsValidated: 0,
          thresholdViolations: [],
          performanceScore: 0,
          recommendations: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        recommendations: ['Check performance monitoring setup', 'Verify metrics collection pipeline'],
        severity: 'critical'
      };
    }
  }

  /**
   * Validate page load times
   */
  private validatePageLoadTimes(pageLoadTimes: Record<string, number>): Array<{
    metric: string;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const violations: Array<any> = [];

    for (const [page, loadTime] of Object.entries(pageLoadTimes)) {
      if (loadTime > this.config.alertThresholds.pageLoadTime * 2) {
        violations.push({
          metric: `Page Load Time - ${page}`,
          value: loadTime,
          threshold: this.config.alertThresholds.pageLoadTime,
          severity: 'critical'
        });
      } else if (loadTime > this.config.alertThresholds.pageLoadTime * 1.5) {
        violations.push({
          metric: `Page Load Time - ${page}`,
          value: loadTime,
          threshold: this.config.alertThresholds.pageLoadTime,
          severity: 'high'
        });
      } else if (loadTime > this.config.alertThresholds.pageLoadTime) {
        violations.push({
          metric: `Page Load Time - ${page}`,
          value: loadTime,
          threshold: this.config.alertThresholds.pageLoadTime,
          severity: 'medium'
        });
      }
    }

    return violations;
  }

  /**
   * Validate API response times
   */
  private validateApiResponseTimes(apiResponseTimes: Record<string, { average: number; p95: number }>): Array<{
    metric: string;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const violations: Array<any> = [];

    for (const [endpoint, times] of Object.entries(apiResponseTimes)) {
      // Validate average response time
      if (times.average > this.config.alertThresholds.apiResponseTime * 2) {
        violations.push({
          metric: `API Average - ${endpoint}`,
          value: times.average,
          threshold: this.config.alertThresholds.apiResponseTime,
          severity: 'critical'
        });
      } else if (times.average > this.config.alertThresholds.apiResponseTime) {
        violations.push({
          metric: `API Average - ${endpoint}`,
          value: times.average,
          threshold: this.config.alertThresholds.apiResponseTime,
          severity: 'medium'
        });
      }

      // Validate P95 response time (should be higher threshold)
      const p95Threshold = this.config.alertThresholds.apiResponseTime * 2;
      if (times.p95 > p95Threshold * 2) {
        violations.push({
          metric: `API P95 - ${endpoint}`,
          value: times.p95,
          threshold: p95Threshold,
          severity: 'critical'
        });
      } else if (times.p95 > p95Threshold) {
        violations.push({
          metric: `API P95 - ${endpoint}`,
          value: times.p95,
          threshold: p95Threshold,
          severity: 'high'
        });
      }
    }

    return violations;
  }

  /**
   * Validate error rates
   */
  private validateErrorRates(errorRates: Record<string, number>): Array<{
    metric: string;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const violations: Array<any> = [];

    for (const [endpoint, rate] of Object.entries(errorRates)) {
      if (rate > this.config.alertThresholds.errorRate * 3) {
        violations.push({
          metric: `Error Rate - ${endpoint}`,
          value: rate,
          threshold: this.config.alertThresholds.errorRate,
          severity: 'critical'
        });
      } else if (rate > this.config.alertThresholds.errorRate * 2) {
        violations.push({
          metric: `Error Rate - ${endpoint}`,
          value: rate,
          threshold: this.config.alertThresholds.errorRate,
          severity: 'high'
        });
      } else if (rate > this.config.alertThresholds.errorRate) {
        violations.push({
          metric: `Error Rate - ${endpoint}`,
          value: rate,
          threshold: this.config.alertThresholds.errorRate,
          severity: 'medium'
        });
      }
    }

    return violations;
  }

  /**
   * Validate system metrics
   */
  private validateSystemMetrics(systemMetrics: { memoryUsage: number; cpuUsage: number; activeUsers: number }): Array<{
    metric: string;
    value: number;
    threshold: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const violations: Array<any> = [];

    // Memory usage
    if (systemMetrics.memoryUsage > this.config.alertThresholds.memoryUsage * 1.25) {
      violations.push({
        metric: 'Memory Usage',
        value: systemMetrics.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage,
        severity: 'critical'
      });
    } else if (systemMetrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      violations.push({
        metric: 'Memory Usage',
        value: systemMetrics.memoryUsage,
        threshold: this.config.alertThresholds.memoryUsage,
        severity: 'high'
      });
    }

    // CPU usage
    if (systemMetrics.cpuUsage > this.config.alertThresholds.cpuUsage * 1.5) {
      violations.push({
        metric: 'CPU Usage',
        value: systemMetrics.cpuUsage,
        threshold: this.config.alertThresholds.cpuUsage,
        severity: 'critical'
      });
    } else if (systemMetrics.cpuUsage > this.config.alertThresholds.cpuUsage) {
      violations.push({
        metric: 'CPU Usage',
        value: systemMetrics.cpuUsage,
        threshold: this.config.alertThresholds.cpuUsage,
        severity: 'medium'
      });
    }

    // Active users (check for unusual spikes or drops)
    if (systemMetrics.activeUsers < 0) {
      violations.push({
        metric: 'Active Users',
        value: systemMetrics.activeUsers,
        threshold: 0,
        severity: 'critical'
      });
    }

    return violations;
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(data: MockPerformanceData, violations: any[]): number {
    let score = 100;

    // Deduct points for violations
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 15;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    }

    // Additional scoring factors
    const avgPageLoadTime = this.calculateAveragePageLoadTime(data.pageLoadTimes);
    if (avgPageLoadTime > 0) {
      const loadTimeScore = Math.max(0, 100 - (avgPageLoadTime / 100)); // Deduct 1 point per 100ms
      score = (score + loadTimeScore) / 2; // Average with current score
    }

    const avgApiResponseTime = this.calculateAverageApiResponseTime(data.apiResponseTimes);
    if (avgApiResponseTime > 0) {
      const apiScore = Math.max(0, 100 - (avgApiResponseTime / 20)); // Deduct 1 point per 20ms
      score = (score + apiScore) / 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Generate performance recommendations
   */
  private generatePerformanceRecommendations(data: MockPerformanceData, violations: any[]): string[] {
    const recommendations: string[] = [];

    // Page load time recommendations
    const slowPages = Object.entries(data.pageLoadTimes)
      .filter(([_, time]) => time > this.config.alertThresholds.pageLoadTime)
      .map(([page, _]) => page);

    if (slowPages.length > 0) {
      recommendations.push(`Optimize page load times for: ${slowPages.join(', ')}`);
      recommendations.push('Consider implementing code splitting and lazy loading');
      recommendations.push('Optimize images and implement CDN for static assets');
    }

    // API response time recommendations
    const slowApis = Object.entries(data.apiResponseTimes)
      .filter(([_, times]) => times.average > this.config.alertThresholds.apiResponseTime)
      .map(([endpoint, _]) => endpoint);

    if (slowApis.length > 0) {
      recommendations.push(`Optimize API performance for: ${slowApis.join(', ')}`);
      recommendations.push('Consider implementing caching strategies');
      recommendations.push('Review database queries for optimization opportunities');
    }

    // Error rate recommendations
    const errorProneEndpoints = Object.entries(data.errorRates)
      .filter(([_, rate]) => rate > this.config.alertThresholds.errorRate)
      .map(([endpoint, _]) => endpoint);

    if (errorProneEndpoints.length > 0) {
      recommendations.push(`Investigate error rates in: ${errorProneEndpoints.join(', ')}`);
      recommendations.push('Implement better error handling and monitoring');
      recommendations.push('Add circuit breakers for resilient error handling');
    }

    // System resource recommendations
    if (data.systemMetrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      recommendations.push('Consider scaling memory resources or optimizing memory usage');
      recommendations.push('Implement garbage collection optimization');
    }

    if (data.systemMetrics.cpuUsage > this.config.alertThresholds.cpuUsage) {
      recommendations.push('Consider scaling CPU resources or optimizing CPU-intensive operations');
      recommendations.push('Review algorithmic complexity and implement caching where appropriate');
    }

    // General recommendations
    if (violations.length === 0) {
      recommendations.push('Performance metrics are within acceptable ranges');
      recommendations.push('Continue monitoring performance trends for early issue detection');
    } else {
      recommendations.push('Set up automated performance monitoring and alerting');
      recommendations.push('Implement performance budgets and enforce them in CI/CD');
    }

    return recommendations;
  }

  /**
   * Calculate average page load time
   */
  private calculateAveragePageLoadTime(pageLoadTimes: Record<string, number>): number {
    const times = Object.values(pageLoadTimes);
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  /**
   * Calculate average API response time
   */
  private calculateAverageApiResponseTime(apiResponseTimes: Record<string, { average: number; p95: number }>): number {
    const times = Object.values(apiResponseTimes).map(times => times.average);
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  /**
   * Calculate overall error rate
   */
  private calculateOverallErrorRate(errorRates: Record<string, number>): number {
    const rates = Object.values(errorRates);
    return rates.length > 0 ? rates.reduce((sum, rate) => sum + rate, 0) / rates.length : 0;
  }

  /**
   * Generate mock performance data for testing
   */
  private generateMockPerformanceData(): MockPerformanceData {
    return {
      pageLoadTimes: {
        '/dashboard': 2500,
        '/profile': 1800,
        '/analytics': 3200,
        '/settings': 1500,
        '/onboarding': 4000
      },
      apiResponseTimes: {
        '/api/users': { average: 800, p95: 1500 },
        '/api/analytics': { average: 1200, p95: 2500 },
        '/api/profile': { average: 600, p95: 1200 },
        '/api/export': { average: 2000, p95: 5000 }
      },
      errorRates: {
        '/api/users': 2.5,
        '/api/analytics': 5.2,
        '/api/profile': 1.8,
        '/api/export': 8.1
      },
      systemMetrics: {
        memoryUsage: 75,
        cpuUsage: 45,
        activeUsers: 1247
      }
    };
  }

  /**
   * Get performance health score
   */
  public getPerformanceHealth(data: MockPerformanceData): number {
    const violations = [
      ...this.validatePageLoadTimes(data.pageLoadTimes),
      ...this.validateApiResponseTimes(data.apiResponseTimes),
      ...this.validateErrorRates(data.errorRates),
      ...this.validateSystemMetrics(data.systemMetrics)
    ];

    return this.calculatePerformanceScore(data, violations);
  }

  /**
   * Get performance trends
   */
  public getPerformanceTrends(historicalData: MockPerformanceData[]): {
    pageLoadTrend: number;
    apiResponseTrend: number;
    errorRateTrend: number;
    overallTrend: number;
  } {
    if (historicalData.length < 2) {
      return { pageLoadTrend: 0, apiResponseTrend: 0, errorRateTrend: 0, overallTrend: 0 };
    }

    const current = historicalData[historicalData.length - 1];
    const previous = historicalData[historicalData.length - 2];

    const currentAvgPageLoad = this.calculateAveragePageLoadTime(current.pageLoadTimes);
    const previousAvgPageLoad = this.calculateAveragePageLoadTime(previous.pageLoadTimes);
    const pageLoadTrend = previousAvgPageLoad > 0 ? 
      ((currentAvgPageLoad - previousAvgPageLoad) / previousAvgPageLoad) * 100 : 0;

    const currentAvgApiResponse = this.calculateAverageApiResponseTime(current.apiResponseTimes);
    const previousAvgApiResponse = this.calculateAverageApiResponseTime(previous.apiResponseTimes);
    const apiResponseTrend = previousAvgApiResponse > 0 ? 
      ((currentAvgApiResponse - previousAvgApiResponse) / previousAvgApiResponse) * 100 : 0;

    const currentErrorRate = this.calculateOverallErrorRate(current.errorRates);
    const previousErrorRate = this.calculateOverallErrorRate(previous.errorRates);
    const errorRateTrend = previousErrorRate > 0 ? 
      ((currentErrorRate - previousErrorRate) / previousErrorRate) * 100 : 0;

    const overallTrend = (pageLoadTrend + apiResponseTrend + errorRateTrend) / 3;

    return { pageLoadTrend, apiResponseTrend, errorRateTrend, overallTrend };
  }
}

export default PerformanceValidator;
