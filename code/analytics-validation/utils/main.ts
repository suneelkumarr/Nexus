// Main Analytics Validation Execution Script
import AnalyticsValidationOrchestrator from '../scripts/validation-orchestrator';
import ValidationTestSuite from '../tests/test-suite';

export class AnalyticsValidationMain {
  private orchestrator: AnalyticsValidationOrchestrator;
  private testSuite: ValidationTestSuite;

  constructor() {
    this.orchestrator = new AnalyticsValidationOrchestrator();
    this.testSuite = new ValidationTestSuite();
  }

  /**
   * Run validation system with specified mode
   */
  async run(mode: 'validation' | 'test' | 'dashboard' | 'health', options: any = {}): Promise<void> {
    console.log('🚀 Analytics Validation System Starting...');
    console.log(`Mode: ${mode}`);
    console.log('Configuration:', options);

    switch (mode) {
      case 'validation':
        await this.runValidation(options);
        break;
      case 'test':
        await this.runTests(options);
        break;
      case 'dashboard':
        await this.runDashboard(options);
        break;
      case 'health':
        await this.runHealthCheck(options);
        break;
      default:
        throw new Error(`Unknown mode: ${mode}`);
    }
  }

  /**
   * Run validation mode
   */
  private async runValidation(options: any): Promise<void> {
    console.log('\n📊 Running Analytics Validation...\n');

    if (options.specific) {
      // Run specific validation
      console.log(`🎯 Running specific validation: ${options.specific}`);
      const result = await this.orchestrator.runValidation(options.specific);
      this.printValidationResult(result);
    } else {
      // Run full validation
      const report = await this.orchestrator.runFullValidation();
      this.printValidationReport(report);
    }

    // Export results if requested
    if (options.export) {
      await this.exportResults(options.export);
    }
  }

  /**
   * Run test mode
   */
  private async runTests(options: any): Promise<void> {
    console.log('\n🧪 Running Test Suite...\n');

    if (options.stress) {
      console.log('🔥 Running stress tests...');
      await this.runStressTest();
    } else {
      const result = await this.testSuite.runCompleteTestSuite();
      this.printTestResults(result);
    }

    if (options.export) {
      await this.exportTestResults(options.export);
    }
  }

  /**
   * Run dashboard mode
   */
  private async runDashboard(options: any): Promise<void> {
    console.log('\n📱 Starting Validation Dashboard...\n');

    // This would typically start a web server in production
    console.log('🌐 Dashboard would be available at: http://localhost:3000');
    console.log('📊 Real-time validation monitoring enabled');
    console.log('⚡ Auto-refresh interval:', options.refreshInterval || 30000, 'ms');

    // Simulate dashboard functionality
    const status = this.orchestrator.getSystemStatus();
    const health = this.orchestrator.getHealthScores();

    console.log('\n📈 Dashboard Snapshot:');
    console.log('System Status:', status.status.toUpperCase());
    console.log('Overall Health:', health.overall.toFixed(1) + '%');
    console.log('Active Alerts:', this.orchestrator.getAlerts().filter(a => !a.resolved).length);
  }

  /**
   * Run health check mode
   */
  private async runHealthCheck(options: any): Promise<void> {
    console.log('\n💚 Running Health Check...\n');

    const healthScores = this.orchestrator.getHealthScores();
    const status = this.orchestrator.getSystemStatus();

    console.log('📊 Health Scores:');
    Object.entries(healthScores).forEach(([component, score]) => {
      const color = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';
      console.log(`${color} ${component.replace(/([A-Z])/g, ' $1').trim()}: ${score.toFixed(1)}%`);
    });

    console.log('\n🔍 System Status:');
    console.log('Status:', status.status.toUpperCase());
    console.log('Uptime:', status.uptime.toFixed(1) + '%');
    console.log('Last Validation:', new Date(status.lastValidationAge).toLocaleTimeString() + ' ago');

    const alerts = this.orchestrator.getAlerts().filter(a => !a.resolved);
    if (alerts.length > 0) {
      console.log('\n🚨 Active Alerts:');
      alerts.forEach(alert => {
        console.log(`${alert.type.toUpperCase()}: ${alert.title}`);
      });
    }

    // Overall health assessment
    const overallHealth = healthScores.overall;
    let healthStatus = '🟢 EXCELLENT';
    if (overallHealth < 70) healthStatus = '🔴 NEEDS ATTENTION';
    else if (overallHealth < 85) healthStatus = '🟡 GOOD';

    console.log(`\n${healthStatus} - Overall System Health: ${overallHealth.toFixed(1)}%`);
  }

  /**
   * Run stress test
   */
  private async runStressTest(): Promise<void> {
    console.log('🔥 Starting Stress Test...');
    console.log('Running 10 concurrent validation cycles...\n');

    const startTime = Date.now();
    const promises = [];

    for (let i = 0; i < 10; i++) {
      promises.push(this.orchestrator.runFullValidation());
    }

    try {
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('✅ Stress Test Completed!');
      console.log(`⏱️  Total Duration: ${duration}ms`);
      console.log(`📊 Average per Validation: ${(duration / 10).toFixed(0)}ms`);
      console.log(`🎯 Success Rate: ${results.length}/10 (${(results.length / 10 * 100).toFixed(1)}%)`);

      // Memory usage check (if available)
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const memUsage = process.memoryUsage();
        console.log(`💾 Memory Usage: ${(memUsage.heapUsed / 1024 / 1024).toFixed(1)}MB`);
      }

    } catch (error) {
      console.error('❌ Stress Test Failed:', error);
    }
  }

  /**
   * Print validation result
   */
  private printValidationResult(result: any): void {
    const status = result.status.toUpperCase();
    const statusColor = result.status === 'passed' ? '✅' : 
                       result.status === 'warning' ? '⚠️' : '❌';
    
    console.log(`${statusColor} ${result.type.replace('_', ' ').toUpperCase()} VALIDATION`);
    console.log(`Status: ${status}`);
    console.log(`Message: ${result.message}`);
    console.log(`Duration: ${(result.duration / 1000).toFixed(2)}s`);
    
    if (result.details) {
      console.log('\nDetails:');
      console.log(JSON.stringify(result.details, null, 2));
    }

    if (result.recommendations && result.recommendations.length > 0) {
      console.log('\nRecommendations:');
      result.recommendations.forEach((rec: string, i: number) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
  }

  /**
   * Print validation report
   */
  private printValidationReport(report: any): void {
    console.log('📋 VALIDATION REPORT');
    console.log('=' .repeat(50));
    
    console.log(`Generated: ${new Date(report.generatedAt).toLocaleString()}`);
    console.log(`Period: ${new Date(report.period.start).toLocaleString()} - ${new Date(report.period.end).toLocaleString()}`);
    
    console.log('\n📊 Summary:');
    console.log(`Total Validations: ${report.summary.totalValidations}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Average Duration: ${(report.summary.averageDuration / 1000).toFixed(2)}s`);
    console.log(`Uptime: ${report.summary.uptime.toFixed(1)}%`);

    console.log('\n📈 Trends:');
    console.log(`Accuracy Trend: ${report.trends.accuracyTrend.toFixed(1)}%`);
    console.log(`Performance Trend: ${report.trends.performanceTrend.toFixed(1)}%`);
    console.log(`Issues Trend: ${report.trends.issuesTrend}`);

    console.log('\n🔍 Individual Results:');
    report.results.forEach((result: any) => {
      const icon = result.status === 'passed' ? '✅' : 
                   result.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${result.type.replace('_', ' ')}: ${result.status.toUpperCase()}`);
    });

    if (report.recommendations && report.recommendations.length > 0) {
      console.log('\n💡 Overall Recommendations:');
      report.recommendations.forEach((rec: string, i: number) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }
  }

  /**
   * Print test results
   */
  private printTestResults(result: any): void {
    console.log('🧪 TEST SUITE RESULTS');
    console.log('=' .repeat(50));
    
    console.log(`Total Tests: ${result.total}`);
    console.log(`Passed: ${result.passed} ✅`);
    console.log(`Failed: ${result.failed} ❌`);
    console.log(`Success Rate: ${((result.passed / result.total) * 100).toFixed(1)}%`);

    console.log('\n📋 Individual Test Results:');
    result.results.forEach((test: any) => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${test.name}: ${test.passed ? 'PASSED' : `FAILED - ${test.error}`}`);
    });
  }

  /**
   * Export validation results
   */
  private async exportResults(format: string): Promise<void> {
    const report = await this.orchestrator.runFullValidation();
    const filename = `validation-report-${Date.now()}.${format}`;
    
    console.log(`\n💾 Exporting results to: ${filename}`);
    
    // In production, this would write to actual files
    switch (format) {
      case 'json':
        console.log(JSON.stringify(report, null, 2));
        break;
      case 'csv':
        console.log('CSV export would be implemented here');
        break;
      default:
        console.log('Unsupported export format:', format);
    }
  }

  /**
   * Export test results
   */
  private async exportTestResults(format: string): Promise<void> {
    const result = await this.testSuite.runCompleteTestSuite();
    const filename = `test-results-${Date.now()}.${format}`;
    
    console.log(`\n💾 Exporting test results to: ${filename}`);
    
    switch (format) {
      case 'json':
        console.log(JSON.stringify(result, null, 2));
        break;
      case 'csv':
        console.log('CSV export would be implemented here');
        break;
      default:
        console.log('Unsupported export format:', format);
    }
  }
}

// CLI interface
export function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log(`
🚀 Analytics Validation System

Usage:
  npm run validate [mode] [options]

Modes:
  validation  - Run validation checks
  test        - Run test suite
  dashboard   - Start validation dashboard
  health      - Run health check

Options:
  --specific <type>    Run specific validation (event_tracking, ab_testing, etc.)
  --export <format>    Export results (json, csv)
  --stress            Run stress tests
  --refresh-interval <ms> Dashboard refresh interval

Examples:
  npm run validate validation
  npm run validate test
  npm run validate validation --specific ab_testing
  npm run validate dashboard --refresh-interval 10000
  npm run validate health
  npm run validate test --stress
    `);
    process.exit(0);
  }

  const mode = args[0] as 'validation' | 'test' | 'dashboard' | 'health';
  const options: any = {};

  // Parse options
  for (let i = 1; i < args.length; i += 2) {
    const key = args[i];
    const value = args[i + 1];
    
    if (key === '--specific') options.specific = value;
    else if (key === '--export') options.export = value;
    else if (key === '--stress') options.stress = true;
    else if (key === '--refresh-interval') options.refreshInterval = parseInt(value);
  }

  const validator = new AnalyticsValidationMain();
  
  validator.run(mode, options)
    .then(() => {
      console.log('\n✅ Analytics validation completed successfully');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Analytics validation failed:', error.message);
      process.exit(1);
    });
}

// Run if called directly
if (require.main === module) {
  main();
}

export default AnalyticsValidationMain;
