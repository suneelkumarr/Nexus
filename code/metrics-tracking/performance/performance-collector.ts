import { PerformanceMetrics, EventData } from '../types/index.js';

/**
 * Performance Metrics Collector
 * Collects and analyzes system and user performance metrics
 */
export class PerformanceCollector {
  private metrics: PerformanceMetrics;
  private observer: PerformanceObserver | null = null;
  private sessionStartTime: number;
  private userInteractions: number = 0;
  private errors: number = 0;

  constructor() {
    this.sessionStartTime = Date.now();
    this.metrics = {
      pageLoadTime: {},
      apiResponseTime: {},
      errorRates: {},
      userEngagement: {
        sessionDuration: 0,
        pagesPerSession: 0,
        bounceRate: 0,
        returnUserRate: 0,
      },
      systemMetrics: {
        memoryUsage: 0,
        cpuUsage: 0,
        activeUsers: 0,
        throughput: 0,
      },
    };

    this.initializePerformanceObservers();
    this.startMetricsCollection();
  }

  /**
   * Track page load performance
   */
  trackPageLoad(pageName: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          const loadTime = navigation.loadEventEnd - navigation.fetchStart;
          const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
          const firstPaint = paint.find(entry => entry.name === 'first-paint')?.startTime || 0;
          const firstContentfulPaint = paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0;

          this.metrics.pageLoadTime[pageName] = {
            loadTime,
            domContentLoaded,
            firstPaint,
            firstContentfulPaint,
          };

          // Track slow page loads
          if (loadTime > 3000) {
            this.recordSlowPageLoad(pageName, loadTime);
          }
        }, 0);
      });
    }
  }

  /**
   * Track API response times
   */
  trackApiCall(endpoint: string, duration: number, statusCode?: number): void {
    if (!this.metrics.apiResponseTime[endpoint]) {
      this.metrics.apiResponseTime[endpoint] = {
        count: 0,
        average: 0,
        p95: 0,
      };
    }

    const apiMetrics = this.metrics.apiResponseTime[endpoint];
    apiMetrics.count++;
    
    // Update running average
    apiMetrics.average = ((apiMetrics.average * (apiMetrics.count - 1)) + duration) / apiMetrics.count;
    
    // Update P95 (approximation)
    const durations = this.getApiDurations(endpoint);
    durations.push(duration);
    durations.sort((a, b) => a - b);
    apiMetrics.p95 = durations[Math.floor(durations.length * 0.95)] || duration;

    // Track slow API calls
    if (duration > 2000) {
      this.recordSlowApiCall(endpoint, duration);
    }

    // Track errors
    if (statusCode && statusCode >= 400) {
      this.recordApiError(endpoint, statusCode);
    }
  }

  /**
   * Track user interactions
   */
  trackUserInteraction(type: 'click' | 'scroll' | 'hover' | 'focus' | 'input'): void {
    this.userInteractions++;
  }

  /**
   * Track system metrics
   */
  trackSystemMetrics(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Memory usage (if available)
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.systemMetrics.memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
      }

      // Active users (estimated based on current session and concurrent users)
      this.estimateActiveUsers();
    }

    // CPU usage estimation
    this.estimateCpuUsage();
  }

  /**
   * Calculate user engagement metrics
   */
  calculateEngagementMetrics(currentPage: string, previousPages: string[]): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const pagesVisited = new Set([...previousPages, currentPage]).size;

    this.metrics.userEngagement.sessionDuration = sessionDuration;
    this.metrics.userEngagement.pagesPerSession = pagesVisited;
    this.metrics.userEngagement.bounceRate = pagesVisited <= 1 ? 1 : 0;
    
    // Return user rate calculation
    const returnUserRate = this.calculateReturnUserRate();
    this.metrics.userEngagement.returnUserRate = returnUserRate;
  }

  /**
   * Get real-time performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    this.trackSystemMetrics();
    return { ...this.metrics };
  }

  /**
   * Get metrics for specific timeframe
   */
  getMetricsForTimeframe(startTime: number, endTime: number): Partial<PerformanceMetrics> {
    // This would typically query a time-series database
    // For now, returning current metrics as placeholder
    return this.getCurrentMetrics();
  }

  /**
   * Generate performance report
   */
  generatePerformanceReport(): {
    summary: string;
    metrics: PerformanceMetrics;
    recommendations: string[];
    alerts: Array<{ type: 'warning' | 'critical'; message: string; metric: string }>;
  } {
    const metrics = this.getCurrentMetrics();
    const recommendations: string[] = [];
    const alerts: Array<{ type: 'warning' | 'critical'; message: string; metric: string }> = [];

    // Check for performance issues and generate recommendations
    Object.entries(metrics.pageLoadTime).forEach(([page, loadTime]) => {
      if (loadTime > 3000) {
        alerts.push({
          type: 'warning',
          message: `Page ${page} has slow load time (${(loadTime / 1000).toFixed(2)}s)`,
          metric: 'pageLoadTime',
        });
        recommendations.push(`Optimize page ${page} load time - consider code splitting or lazy loading`);
      }
    });

    Object.entries(metrics.apiResponseTime).forEach(([endpoint, responseTime]) => {
      if (responseTime.average > 1000) {
        alerts.push({
          type: 'warning',
          message: `API endpoint ${endpoint} has high response time (${responseTime.average.toFixed(0)}ms)`,
          metric: 'apiResponseTime',
        });
        recommendations.push(`Optimize API endpoint ${endpoint} - consider caching or database indexing`);
      }
    });

    Object.entries(metrics.errorRates).forEach(([endpoint, errorRate]) => {
      if (errorRate.rate > 0.05) {
        alerts.push({
          type: 'critical',
          message: `API endpoint ${endpoint} has high error rate (${(errorRate.rate * 100).toFixed(2)}%)`,
          metric: 'errorRate',
        });
        recommendations.push(`Fix error issues in API endpoint ${endpoint}`);
      }
    });

    // Generate summary
    const avgPageLoadTime = Object.values(metrics.pageLoadTime).reduce((sum, time) => sum + time, 0) / 
                           Object.keys(metrics.pageLoadTime).length || 0;
    
    const avgApiResponseTime = Object.values(metrics.apiResponseTime).reduce((sum, api) => sum + api.average, 0) / 
                              Object.keys(metrics.apiResponseTime).length || 0;
    
    const summary = `Average page load time: ${(avgPageLoadTime / 1000).toFixed(2)}s, ` +
                   `Average API response time: ${avgApiResponseTime.toFixed(0)}ms, ` +
                   `Session duration: ${(metrics.userEngagement.sessionDuration / 1000 / 60).toFixed(1)}min`;

    return {
      summary,
      metrics,
      recommendations,
      alerts,
    };
  }

  /**
   * Private helper methods
   */
  private initializePerformanceObservers(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe resource loading
      this.observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            const resource = entry as PerformanceResourceTiming;
            const duration = resource.responseEnd - resource.startTime;
            
            // Track different types of resources
            if (resource.name.includes('/api/')) {
              this.trackApiCall(new URL(resource.name).pathname, duration);
            } else if (resource.name.match(/\.(js|css)$/)) {
              this.trackAssetLoad(resource.name, duration);
            }
          }
        }
      });

      this.observer.observe({ entryTypes: ['resource', 'navigation'] });
    }
  }

  private startMetricsCollection(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.trackSystemMetrics();
    }, 30000);

    // Update engagement metrics every minute
    setInterval(() => {
      this.calculateEngagementMetrics(window.location.pathname, []);
    }, 60000);
  }

  private recordSlowPageLoad(page: string, loadTime: number): void {
    // Log slow page load for analysis
    console.warn(`Slow page load detected: ${page} took ${loadTime}ms`);
  }

  private recordSlowApiCall(endpoint: string, duration: number): void {
    // Log slow API call for analysis
    console.warn(`Slow API call: ${endpoint} took ${duration}ms`);
  }

  private recordApiError(endpoint: string, statusCode: number): void {
    if (!this.metrics.errorRates[endpoint]) {
      this.metrics.errorRates[endpoint] = {
        count: 0,
        rate: 0,
      };
    }

    const errorMetrics = this.metrics.errorRates[endpoint];
    errorMetrics.count++;
    
    // Calculate error rate (simplified)
    const totalCalls = this.getApiCallCount(endpoint);
    errorMetrics.rate = totalCalls > 0 ? errorMetrics.count / totalCalls : 0;
  }

  private trackAssetLoad(assetUrl: string, loadTime: number): void {
    // Track asset loading performance
    if (loadTime > 500) {
      console.warn(`Slow asset load: ${assetUrl} took ${loadTime}ms`);
    }
  }

  private getApiDurations(endpoint: string): number[] {
    // This would typically retrieve stored durations
    // For now, return empty array
    return [];
  }

  private getApiCallCount(endpoint: string): number {
    return this.metrics.apiResponseTime[endpoint]?.count || 0;
  }

  private estimateActiveUsers(): void {
    // This would typically use WebSocket connections or polling
    // For now, estimate based on current session
    this.metrics.systemMetrics.activeUsers = 1;
  }

  private estimateCpuUsage(): void {
    // CPU usage estimation would require more sophisticated monitoring
    // This is a placeholder implementation
    this.metrics.systemMetrics.cpuUsage = Math.random() * 100; // Simulated
  }

  private calculateReturnUserRate(): number {
    // Check if user has visited before
    const visitCount = localStorage.getItem('visitCount');
    const currentCount = visitCount ? parseInt(visitCount) : 0;
    
    localStorage.setItem('visitCount', (currentCount + 1).toString());
    
    return currentCount > 0 ? 1 : 0;
  }
}

/**
 * Web Vitals tracking
 */
export class WebVitalsTracker {
  private vitals: Record<string, number> = {};

  /**
   * Track Core Web Vitals
   */
  trackWebVitals(): void {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.trackLCP();
    
    // First Input Delay (FID)
    this.trackFID();
    
    // Cumulative Layout Shift (CLS)
    this.trackCLS();
  }

  private trackLCP(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.vitals.LCP = lastEntry.startTime;
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  private trackFID(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.vitals.FID = entry.processingStart - entry.startTime;
        }
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  }

  private trackCLS(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
        this.vitals.CLS = clsValue;
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  }

  getVitals(): Record<string, number> {
    return { ...this.vitals };
  }
}

// Initialize performance tracking
const initPerformanceTracking = () => {
  const collector = new PerformanceCollector();
  const vitalsTracker = new WebVitalsTracker();

  // Track page load
  collector.trackPageLoad(window.location.pathname);
  
  // Track web vitals
  vitalsTracker.trackWebVitals();

  return { collector, vitalsTracker };
};

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
  const { collector } = initPerformanceTracking();
  
  // Global access for other components
  (window as any).performanceCollector = collector;
}