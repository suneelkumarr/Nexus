import { 
  ReportConfig, 
  MetricAggregation, 
  ConversionFunnel, 
  ABTest,
  PerformanceMetrics 
} from '../types/index.js';

/**
 * Automated Reporting System
 * Generates and schedules automated reports
 */
export class ReportingSystem {
  private reports: Map<string, ReportConfig> = new Map();
  private reportHistory: Map<string, Array<{
    id: string;
    timestamp: number;
    status: 'success' | 'error';
    filePath?: string;
    error?: string;
  }>> = new Map();
  private scheduler: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.initializeReportSchedules();
  }

  /**
   * Create a new report configuration
   */
  createReport(config: ReportConfig): ReportConfig {
    this.reports.set(config.id, config);
    this.scheduleReport(config);
    return config;
  }

  /**
   * Get report configuration
   */
  getReport(id: string): ReportConfig | undefined {
    return this.reports.get(id);
  }

  /**
   * Get all reports
   */
  getAllReports(): ReportConfig[] {
    return Array.from(this.reports.values());
  }

  /**
   * Update report configuration
   */
  updateReport(id: string, updates: Partial<ReportConfig>): ReportConfig {
    const report = this.reports.get(id);
    if (!report) {
      throw new Error(`Report ${id} not found`);
    }

    const updated = { ...report, ...updates };
    this.reports.set(id, updated);
    
    // Reschedule if schedule changed
    if (updates.schedule) {
      this.rescheduleReport(id);
    }

    return updated;
  }

  /**
   * Delete report
   */
  deleteReport(id: string): boolean {
    this.unscheduleReport(id);
    return this.reports.delete(id);
  }

  /**
   * Generate report manually
   */
  async generateReport(reportId: string, format?: 'pdf' | 'excel' | 'csv' | 'json'): Promise<string> {
    const report = this.reports.get(reportId);
    if (!report) {
      throw new Error(`Report ${reportId} not found`);
    }

    const reportFormat = format || report.format;
    const reportData = await this.collectReportData(report);
    const filePath = await this.formatAndSaveReport(report, reportData, reportFormat);

    // Log report generation
    this.logReportGeneration(reportId, 'success', filePath);

    return filePath;
  }

  /**
   * Get report history
   */
  getReportHistory(reportId: string): Array<{
    id: string;
    timestamp: number;
    status: 'success' | 'error';
    filePath?: string;
    error?: string;
  }> {
    return this.reportHistory.get(reportId) || [];
  }

  /**
   * Get reports ready for generation
   */
  getPendingReports(): ReportConfig[] {
    const now = Date.now();
    return this.getAllReports().filter(report => {
      const lastRun = this.getLastRunTime(report.id);
      const interval = this.getScheduleInterval(report.schedule);
      return !lastRun || (now - lastRun) >= interval;
    });
  }

  /**
   * Private helper methods
   */
  private initializeReportSchedules(): void {
    // Initialize all existing reports
    this.getAllReports().forEach(report => {
      this.scheduleReport(report);
    });
  }

  private scheduleReport(report: ReportConfig): void {
    const interval = this.getScheduleInterval(report.schedule);
    
    const timeout = setInterval(async () => {
      try {
        await this.generateReport(report.id);
      } catch (error) {
        console.error(`Failed to generate scheduled report ${report.id}:`, error);
        this.logReportGeneration(report.id, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
      }
    }, interval);

    this.scheduler.set(report.id, timeout);
  }

  private rescheduleReport(reportId: string): void {
    this.unscheduleReport(reportId);
    const report = this.reports.get(reportId);
    if (report) {
      this.scheduleReport(report);
    }
  }

  private unscheduleReport(reportId: string): void {
    const timeout = this.scheduler.get(reportId);
    if (timeout) {
      clearInterval(timeout);
      this.scheduler.delete(reportId);
    }
  }

  private getScheduleInterval(schedule: 'daily' | 'weekly' | 'monthly'): number {
    switch (schedule) {
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      default:
        return 24 * 60 * 60 * 1000; // Default to daily
    }
  }

  private async collectReportData(report: ReportConfig): Promise<{
    metrics: Record<string, any>;
    funnels: Record<string, ConversionFunnel>;
    abTests: Record<string, ABTest>;
    performance: PerformanceMetrics;
    timeframe: { start: number; end: number };
  }> {
    const timeframe = this.calculateTimeframe(report.schedule);
    const metrics: Record<string, any> = {};
    const funnels: Record<string, ConversionFunnel> = {};
    const abTests: Record<string, ABTest> = {};

    // Collect metrics data
    for (const metricName of report.metrics) {
      metrics[metricName] = await this.fetchMetricData(metricName, timeframe, report.segments);
    }

    // Collect funnel data (if any)
    if (report.filters?.funnels) {
      for (const funnelId of report.filters.funnels as string[]) {
        funnels[funnelId] = await this.fetchFunnelData(funnelId, timeframe);
      }
    }

    // Collect A/B test data (if any)
    if (report.filters?.abTests) {
      for (const testId of report.filters.abTests as string[]) {
        abTests[testId] = await this.fetchABTestData(testId);
      }
    }

    // Collect performance metrics
    const performance = await this.fetchPerformanceData(timeframe);

    return {
      metrics,
      funnels,
      abTests,
      performance,
      timeframe,
    };
  }

  private async formatAndSaveReport(
    report: ReportConfig, 
    data: any, 
    format: 'pdf' | 'excel' | 'csv' | 'json'
  ): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${report.name.replace(/\s+/g, '-').toLowerCase()}-${timestamp}`;
    const filePath = `reports/${filename}.${format}`;

    let content: string;

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        break;
      
      case 'csv':
        content = this.convertToCSV(data);
        break;
      
      case 'pdf':
        content = await this.generatePDFReport(report, data);
        break;
      
      case 'excel':
        content = await this.generateExcelReport(report, data);
        break;
      
      default:
        content = JSON.stringify(data, null, 2);
    }

    // Save file (this would typically use a file system)
    await this.saveFile(filePath, content);

    return filePath;
  }

  private calculateTimeframe(schedule: 'daily' | 'weekly' | 'monthly'): { start: number; end: number } {
    const now = Date.now();
    const end = now;
    let start: number;

    switch (schedule) {
      case 'daily':
        start = now - (24 * 60 * 60 * 1000); // Last 24 hours
        break;
      case 'weekly':
        start = now - (7 * 24 * 60 * 60 * 1000); // Last 7 days
        break;
      case 'monthly':
        start = now - (30 * 24 * 60 * 60 * 1000); // Last 30 days
        break;
      default:
        start = now - (24 * 60 * 60 * 1000);
    }

    return { start, end };
  }

  private async fetchMetricData(
    metricName: string, 
    timeframe: { start: number; end: number },
    segments?: string[]
  ): Promise<any> {
    // This would typically make API calls to fetch metric data
    const response = await fetch(`/api/analytics/metrics/${metricName}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe, segments }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metric data for ${metricName}`);
    }
    
    return response.json();
  }

  private async fetchFunnelData(funnelId: string, timeframe: { start: number; end: number }): Promise<ConversionFunnel> {
    const response = await fetch(`/api/analytics/funnels/${funnelId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch funnel data for ${funnelId}`);
    }
    
    return response.json();
  }

  private async fetchABTestData(testId: string): Promise<ABTest> {
    const response = await fetch(`/api/analytics/ab-tests/${testId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch A/B test data for ${testId}`);
    }
    
    return response.json();
  }

  private async fetchPerformanceData(timeframe: { start: number; end: number }): Promise<PerformanceMetrics> {
    const response = await fetch('/api/analytics/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ timeframe }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch performance data');
    }
    
    return response.json();
  }

  private async generatePDFReport(report: ReportConfig, data: any): Promise<string> {
    // Generate HTML content for PDF
    const html = this.generateHTMLReport(report, data);
    
    // Convert HTML to PDF (would use a service like Puppeteer or similar)
    // For now, return placeholder
    return html;
  }

  private async generateExcelReport(report: ReportConfig, data: any): Promise<string> {
    // Generate Excel content (would use a library like ExcelJS)
    // For now, return JSON as placeholder
    return JSON.stringify(data);
  }

  private generateHTMLReport(report: ReportConfig, data: any): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>${report.name} Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .metric { margin: 20px 0; padding: 10px; border: 1px solid #ddd; }
        .metric-value { font-size: 24px; font-weight: bold; color: #007bff; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${report.name}</h1>
        <p>Generated on ${new Date().toLocaleDateString()}</p>
        <p>${report.description}</p>
    </div>
    
    <div class="content">
        <h2>Key Metrics</h2>
        ${Object.entries(data.metrics).map(([key, value]) => `
            <div class="metric">
                <h3>${key.replace(/-/g, ' ').toUpperCase()}</h3>
                <div class="metric-value">${value}</div>
            </div>
        `).join('')}
        
        ${Object.keys(data.funnels).length > 0 ? `
            <h2>Conversion Funnels</h2>
            ${Object.entries(data.funnels).map(([key, funnel]) => `
                <div class="metric">
                    <h3>${key.replace(/-/g, ' ').toUpperCase()}</h3>
                    <p>Conversion Rate: ${(funnel.conversionRate * 100).toFixed(2)}%</p>
                    <p>Total Users: ${funnel.totalUsers}</p>
                </div>
            `).join('')}
        ` : ''}
        
        <h2>Performance Summary</h2>
        <div class="metric">
            <p>Average Page Load Time: ${Object.values(data.performance.pageLoadTime).reduce((sum: number, time: any) => sum + time, 0) / Object.keys(data.performance.pageLoadTime).length || 0}ms</p>
            <p>Error Rate: ${Object.values(data.performance.errorRates).reduce((sum: number, error: any) => sum + error.rate, 0) / Object.keys(data.performance.errorRates).length || 0}</p>
        </div>
    </div>
</body>
</html>`;
  }

  private convertToCSV(data: any): string {
    let csv = 'Metric,Value\n';
    
    // Add metrics
    Object.entries(data.metrics).forEach(([key, value]) => {
      csv += `${key},${value}\n`;
    });
    
    // Add funnel data
    Object.entries(data.funnels).forEach(([key, funnel]) => {
      csv += `${key}_conversion_rate,${funnel.conversionRate}\n`;
      csv += `${key}_total_users,${funnel.totalUsers}\n`;
    });
    
    return csv;
  }

  private async saveFile(filePath: string, content: string): Promise<void> {
    // This would typically save to a file system or cloud storage
    // For now, simulate saving
    console.log(`Saving report to ${filePath}`);
    return Promise.resolve();
  }

  private logReportGeneration(
    reportId: string, 
    status: 'success' | 'error', 
    filePath?: string, 
    error?: string
  ): void {
    if (!this.reportHistory.has(reportId)) {
      this.reportHistory.set(reportId, []);
    }

    const history = this.reportHistory.get(reportId)!;
    history.push({
      id: `report-${Date.now()}`,
      timestamp: Date.now(),
      status,
      filePath,
      error,
    });

    // Keep only last 50 reports per ID
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
  }

  private getLastRunTime(reportId: string): number | null {
    const history = this.reportHistory.get(reportId);
    if (!history || history.length === 0) return null;
    
    const lastSuccess = history
      .filter(entry => entry.status === 'success')
      .pop();
    
    return lastSuccess?.timestamp || null;
  }
}

/**
 * Pre-configured report templates
 */
export const reportTemplates = {
  dailyExecutiveSummary: {
    id: 'daily-executive-summary',
    name: 'Daily Executive Summary',
    description: 'Daily overview of key business metrics',
    schedule: 'daily' as const,
    recipients: ['executives@company.com'],
    metrics: [
      'daily-active-users',
      'free-to-pro-conversion',
      'onboarding-completion',
      'monthly-revenue',
      'customer-satisfaction',
    ],
    format: 'pdf' as const,
    filters: {
      funnels: ['free-to-pro-conversion', 'onboarding-completion'],
    },
  },

  weeklyProductAnalytics: {
    id: 'weekly-product-analytics',
    name: 'Weekly Product Analytics',
    description: 'Detailed weekly product performance analysis',
    schedule: 'weekly' as const,
    recipients: ['product@company.com'],
    metrics: [
      'feature-usage',
      'user-engagement',
      'session-duration',
      'feature-adoption',
    ],
    abTests: ['signup-flow-test', 'pricing-page-test'],
    format: 'excel' as const,
    filters: {
      funnels: ['feature-adoption', 'free-to-pro-conversion'],
      abTests: ['signup-flow-test', 'pricing-page-test'],
    },
  },

  monthlyPerformanceReport: {
    id: 'monthly-performance-report',
    name: 'Monthly Performance Report',
    description: 'Monthly technical performance and user experience metrics',
    schedule: 'monthly' as const,
    recipients: ['engineering@company.com'],
    metrics: [
      'page-load-time',
      'api-response-time',
      'error-rate',
      'uptime',
    ],
    format: 'json' as const,
  },

  conversionOptimizationReport: {
    id: 'conversion-optimization-report',
    name: 'Conversion Optimization Report',
    description: 'Focus on conversion funnel performance and optimization opportunities',
    schedule: 'weekly' as const,
    recipients: ['marketing@company.com', 'product@company.com'],
    metrics: [
      'free-to-pro-conversion',
      'onboarding-completion',
      'feature-adoption',
      'upgrade-attempts',
    ],
    format: 'pdf' as const,
    filters: {
      funnels: ['free-to-pro-conversion', 'onboarding-completion', 'feature-adoption'],
    },
  },
};

/**
 * Report Email Service
 */
export class ReportEmailService {
  private emailConfig = {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: parseInt(process.env.SMTP_PORT || '587'),
    username: process.env.SMTP_USERNAME,
    password: process.env.SMTP_PASSWORD,
  };

  /**
   * Send report via email
   */
  async sendReport(
    recipients: string[], 
    subject: string, 
    body: string, 
    attachments?: Array<{
      filename: string;
      content: string;
      contentType: string;
    }>
  ): Promise<void> {
    // This would typically use a service like SendGrid, AWS SES, or Nodemailer
    // For now, just log the email details
    console.log('Sending report email:', {
      recipients,
      subject,
      body,
      attachments: attachments?.length || 0,
    });

    // Simulate email sending
    return Promise.resolve();
  }

  /**
   * Generate email content for report
   */
  generateEmailContent(report: ReportConfig, data: any): string {
    return `
      <html>
      <body>
        <h2>${report.name}</h2>
        <p>Please find the attached ${report.format.toUpperCase()} report.</p>
        
        <h3>Key Highlights:</h3>
        <ul>
          ${Object.entries(data.metrics).slice(0, 5).map(([key, value]) => `
            <li><strong>${key.replace(/-/g, ' ').toUpperCase()}:</strong> ${value}</li>
          `).join('')}
        </ul>
        
        <p>Report generated on ${new Date().toLocaleString()}</p>
        <p>For detailed analysis, please refer to the attached report.</p>
      </body>
      </html>
    `;
  }
}

// Initialize reporting system
export const reportingSystem = new ReportingSystem();
export const emailService = new ReportEmailService();

// Auto-create default reports
Object.values(reportTemplates).forEach(template => {
  reportingSystem.createReport(template);
});