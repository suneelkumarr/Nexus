import { ConversionEvent, UserBehaviorMetrics, ABTestResult, ROIAnalysis, SuccessCriteria } from '../types/analytics';

export class DataExportService {
  static exportToCSV(data: any[], filename: string): void {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape commas and quotes in CSV format
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportToJSON(data: any, filename: string): void {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  static exportConversionEvents(events: ConversionEvent[], filename = 'conversion-events'): void {
    const csvData = events.map(event => ({
      id: event.id,
      userId: event.userId,
      sessionId: event.sessionId,
      eventType: event.eventType,
      timestamp: event.timestamp.toISOString(),
      abTestVariant: event.abTestVariant || '',
      source: event.source,
      page: event.metadata.page || '',
      campaign: event.metadata.campaign || '',
      device: event.metadata.device || ''
    }));

    this.exportToCSV(csvData, filename);
  }

  static exportBehaviorMetrics(metrics: UserBehaviorMetrics[], filename = 'user-behavior'): void {
    const csvData = metrics.map(metric => ({
      userId: metric.userId,
      sessionId: metric.sessionId,
      startTime: metric.startTime.toISOString(),
      endTime: metric.endTime.toISOString(),
      totalTimeSpent: metric.totalTimeSpent,
      pagesVisited: metric.pagesVisited.join('|'),
      featuresUsed: metric.featuresUsed.join('|'),
      onboardingCompleted: metric.onboardingCompleted,
      upgradeInitiated: metric.upgradeInitiated,
      upgradeCompleted: metric.upgradeCompleted,
      abTestVariant: metric.abTestVariant || ''
    }));

    this.exportToCSV(csvData, filename);
  }

  static exportABTestResults(tests: ABTestResult[], filename = 'ab-test-results'): void {
    const csvData: any[] = [];

    tests.forEach(test => {
      test.variants.forEach(variant => {
        csvData.push({
          testName: test.name,
          testId: test.id,
          variantName: variant.name,
          variantId: variant.id,
          trafficAllocation: variant.trafficAllocation,
          visitors: variant.visitors,
          conversions: variant.conversions,
          conversionRate: variant.conversionRate,
          revenue: variant.revenue,
          startDate: test.startDate.toISOString(),
          endDate: test.endDate ? test.endDate.toISOString() : '',
          status: test.status
        });
      });
    });

    this.exportToCSV(csvData, filename);
  }

  static exportROIMetrics(roiData: ROIAnalysis, filename = 'roi-analysis'): void {
    const summary = {
      analysisName: roiData.name,
      startDate: roiData.startDate.toISOString(),
      endDate: roiData.endDate.toISOString(),
      totalInvestment: roiData.totalInvestment,
      totalRevenue: roiData.totalRevenue,
      netProfit: roiData.netProfit,
      roi: roiData.roi,
      paybackPeriod: roiData.paybackPeriod
    };

    const metrics = roiData.metrics.map(metric => ({
      name: metric.name,
      value: metric.value,
      unit: metric.unit,
      category: metric.category,
      timeframe: metric.timeframe
    }));

    const breakdown = roiData.breakdown.map(item => ({
      category: item.category,
      subcategory: item.subcategory,
      amount: item.amount,
      percentage: item.percentage
    }));

    const exportData = {
      summary,
      metrics,
      breakdown,
      exportedAt: new Date().toISOString()
    };

    this.exportToJSON(exportData, filename);
  }

  static exportSuccessCriteria(criteria: SuccessCriteria[], filename = 'success-criteria'): void {
    const csvData = criteria.map(c => ({
      name: c.name,
      description: c.description,
      metric: c.metric,
      targetValue: c.targetValue,
      currentValue: c.currentValue,
      operator: c.operator,
      timeframe: c.timeframe,
      priority: c.priority,
      status: c.status,
      automatedCheck: c.automatedCheck,
      lastChecked: c.lastChecked.toISOString()
    }));

    this.exportToCSV(csvData, filename);
  }

  static generateComprehensiveReport(
    events: ConversionEvent[],
    behaviorMetrics: UserBehaviorMetrics[],
    abTests: ABTestResult[],
    roiData: ROIAnalysis,
    criteria: SuccessCriteria[]
  ): void {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalEvents: events.length,
        totalUsers: new Set(events.map(e => e.userId)).size,
        totalSessions: new Set(events.map(e => e.sessionId)).size,
        activeABTests: abTests.filter(t => t.status === 'running').length,
        overallConversionRate: this.calculateOverallConversionRate(events),
        criteriaMet: criteria.filter(c => c.status === 'met' || c.status === 'exceeded').length,
        roiAnalysis: {
          totalInvestment: roiData.totalInvestment,
          totalRevenue: roiData.totalRevenue,
          netProfit: roiData.netProfit,
          roi: roiData.roi
        }
      },
      topPerformingFeatures: this.getTopPerformingFeatures(behaviorMetrics),
      topDropOffPoints: this.getTopDropOffPoints(events),
      significantABTests: abTests.filter(t => t.results.some(r => r.isSignificant)),
      atRiskCriteria: criteria.filter(c => c.status === 'at_risk' || c.status === 'not_met'),
      recommendations: this.generateRecommendations(events, behaviorMetrics, criteria)
    };

    this.exportToJSON(report, 'comprehensive-conversion-report');
  }

  private static calculateOverallConversionRate(events: ConversionEvent[]): number {
    const users = new Set(events.map(e => e.userId));
    const converters = new Set(
      events
        .filter(e => e.eventType === 'upgrade_completion' || e.eventType === 'payment_complete')
        .map(e => e.userId)
    );

    return users.size > 0 ? (converters.size / users.size) * 100 : 0;
  }

  private static getTopPerformingFeatures(metrics: UserBehaviorMetrics[]): string[] {
    const featureCounts = new Map<string, number>();
    
    metrics.forEach(metric => {
      metric.featuresUsed.forEach(feature => {
        featureCounts.set(feature, (featureCounts.get(feature) || 0) + 1);
      });
    });

    return Array.from(featureCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([feature]) => feature);
  }

  private static getTopDropOffPoints(events: ConversionEvent[]): string[] {
    // This would need more sophisticated analysis in a real implementation
    // For now, return common drop-off points
    return [
      'Account creation form',
      'Payment method input',
      'Feature trial limits',
      'Pricing page comparison'
    ];
  }

  private static generateRecommendations(
    events: ConversionEvent[],
    behaviorMetrics: UserBehaviorMetrics[],
    criteria: SuccessCriteria[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze criteria to generate recommendations
    const atRiskCriteria = criteria.filter(c => c.status === 'at_risk' || c.status === 'not_met');
    
    atRiskCriteria.forEach(criterion => {
      if (criterion.metric.includes('onboarding')) {
        recommendations.push('Optimize onboarding flow to improve completion rates');
      } else if (criterion.metric.includes('conversion')) {
        recommendations.push('Test different upgrade prompts and pricing strategies');
      } else if (criterion.metric.includes('feature')) {
        recommendations.push('Improve feature discovery and in-app guidance');
      }
    });

    return recommendations;
  }
}