// A/B Testing Validation System
import { ABTestValidationResult, MockABTestData, ABTestValidationConfig } from '../types/validation-types';
import { ValidationConfigManager } from '../config/validation-config';

export class ABTestingValidator {
  private config: ABTestValidationConfig;
  private configManager: ValidationConfigManager;

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.config = this.configManager.getABTestingConfig();
  }

  /**
   * Validate A/B testing system and results
   */
  async validateABTesting(mockData?: MockABTestData[]): Promise<ABTestValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get or generate test data
      const tests = mockData || this.generateMockABTestData();
      
      const validation = {
        testsValidated: tests.length,
        failedTests: [] as string[],
        statisticalIssues: [] as any[],
        sampleRatioMismatches: [] as any[]
      };

      for (const test of tests) {
        // Validate statistical significance
        const significanceIssues = this.validateStatisticalSignificance(test);
        if (significanceIssues.length > 0) {
          validation.statisticalIssues.push({
            testId: test.id,
            issues: significanceIssues,
            pValue: this.calculatePValue(test),
            sampleSize: Math.min(...test.variants.map(v => v.visitors)),
            power: this.calculateStatisticalPower(test)
          });
        }

        // Validate sample ratio mismatch
        if (this.config.sampleRatioMismatch.enabled) {
          const srm = this.validateSampleRatioMismatch(test);
          if (srm.deviation > this.config.sampleRatioMismatch.threshold) {
            validation.sampleRatioMismatches.push(srm);
          }
        }

        // Validate sample sizes
        const minSampleSize = Math.min(...test.variants.map(v => v.visitors));
        if (minSampleSize < this.config.minimumSampleSize) {
          validation.failedTests.push(test.id);
        }
      }

      // Determine overall status
      const totalIssues = validation.statisticalIssues.length + validation.sampleRatioMismatches.length;
      let status: 'passed' | 'warning' | 'failed' = 'passed';
      let message = 'A/B testing validation passed successfully';
      
      if (validation.failedTests.length > 0) {
        status = 'failed';
        message = `Failed tests found: ${validation.failedTests.length} tests have insufficient sample sizes`;
      } else if (totalIssues > tests.length * 0.3) {
        status = 'failed';
        message = `Multiple statistical issues found in A/B tests: ${totalIssues} issues across ${tests.length} tests`;
      } else if (totalIssues > 0) {
        status = 'warning';
        message = `Some statistical concerns found in A/B tests: ${totalIssues} issues`;
      }

      const result: ABTestValidationResult = {
        id: `ab-testing-${Date.now()}`,
        type: 'ab_testing',
        status,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message,
        details: {
          ...validation,
          confidenceLevel: this.config.confidenceLevel,
          minimumSampleSize: this.config.minimumSampleSize,
          maxPValue: this.config.maxPValue
        },
        recommendations: this.generateABTestingRecommendations(validation),
        severity: status === 'failed' ? 'critical' : status === 'warning' ? 'medium' : 'low'
      };

      return result;

    } catch (error) {
      return {
        id: `ab-testing-error-${Date.now()}`,
        type: 'ab_testing',
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `A/B testing validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          testsValidated: 0,
          failedTests: [],
          statisticalIssues: [],
          sampleRatioMismatches: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        recommendations: ['Check A/B testing implementation', 'Verify statistical analysis setup'],
        severity: 'critical'
      };
    }
  }

  /**
   * Validate statistical significance of test results
   */
  private validateStatisticalSignificance(test: MockABTestData): string[] {
    const issues: string[] = [];
    
    if (test.status !== 'completed' && test.status !== 'running') {
      return ['Test status is not valid for analysis'];
    }

    // Find control variant (typically the first one)
    const control = test.variants[0];
    const variants = test.variants.slice(1);

    for (const variant of variants) {
      const pValue = this.calculateTwoProportionPValue(
        control.conversions,
        control.visitors,
        variant.conversions,
        variant.visitors
      );

      if (pValue > this.config.maxPValue) {
        issues.push(`Variant ${variant.id} has p-value ${pValue.toFixed(4)} > ${this.config.maxPValue}`);
      }

      // Check if effect size is reasonable
      const effectSize = Math.abs(
        (variant.conversionRate - control.conversionRate) / control.conversionRate
      );

      if (effectSize > this.config.effectSize.maximum) {
        issues.push(`Variant ${variant.id} has suspiciously high effect size: ${(effectSize * 100).toFixed(1)}%`);
      }

      if (effectSize < this.config.effectSize.minimum) {
        issues.push(`Variant ${variant.id} has very small effect size: ${(effectSize * 100).toFixed(1)}%`);
      }

      // Check conversion rate bounds
      if (variant.conversionRate < 0 || variant.conversionRate > 1) {
        issues.push(`Variant ${variant.id} has invalid conversion rate: ${variant.conversionRate}`);
      }
    }

    return issues;
  }

  /**
   * Validate sample ratio mismatch
   */
  private validateSampleRatioMismatch(test: MockABTestData): {
    testId: string;
    expectedRatio: string;
    actualRatio: string;
    deviation: number;
  } {
    const totalVisitors = test.variants.reduce((sum, v) => sum + v.visitors, 0);
    const expectedPercentage = 1 / test.variants.length;
    
    let maxDeviation = 0;
    let actualRatio = '';
    let expectedRatio = test.variants.map(() => '1').join(':');

    for (const variant of test.variants) {
      const actualPercentage = variant.visitors / totalVisitors;
      const deviation = Math.abs(actualPercentage - expectedPercentage) / expectedPercentage * 100;
      actualRatio += `${variant.visitors}:`;
      maxDeviation = Math.max(maxDeviation, deviation);
    }

    actualRatio = actualRatio.slice(0, -1); // Remove trailing colon

    return {
      testId: test.id,
      expectedRatio,
      actualRatio,
      deviation: maxDeviation
    };
  }

  /**
   * Calculate p-value for two-proportion test
   */
  private calculateTwoProportionPValue(controlConv: number, controlTotal: number, 
                                      variantConv: number, variantTotal: number): number {
    // Simplified calculation - in production, use a proper statistical library
    const controlRate = controlConv / controlTotal;
    const variantRate = variantConv / variantTotal;
    const pooledRate = (controlConv + variantConv) / (controlTotal + variantTotal);
    
    const se = Math.sqrt(pooledRate * (1 - pooledRate) * (1/controlTotal + 1/variantTotal));
    const z = (variantRate - controlRate) / se;
    
    // Approximate p-value from z-score (two-tailed)
    return 2 * (1 - this.normalCDF(Math.abs(z)));
  }

  /**
   * Normal cumulative distribution function approximation
   */
  private normalCDF(x: number): number {
    return (1 + this.erf(x / Math.sqrt(2))) / 2;
  }

  /**
   * Error function approximation
   */
  private erf(x: number): number {
    // Abramowitz and Stegun approximation
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  /**
   * Calculate p-value for a test
   */
  private calculatePValue(test: MockABTestData): number {
    const control = test.variants[0];
    const variants = test.variants.slice(1);
    
    let maxPValue = 0;
    for (const variant of variants) {
      const pValue = this.calculateTwoProportionPValue(
        control.conversions,
        control.visitors,
        variant.conversions,
        variant.visitors
      );
      maxPValue = Math.max(maxPValue, pValue);
    }
    
    return maxPValue;
  }

  /**
   * Calculate statistical power
   */
  private calculateStatisticalPower(test: MockABTestData): number {
    // Simplified power calculation
    const control = test.variants[0];
    const variants = test.variants.slice(1);
    
    let minPower = 1;
    for (const variant of variants) {
      const effectSize = Math.abs(variant.conversionRate - control.conversionRate);
      const sampleSize = Math.min(control.visitors, variant.visitors);
      
      // Simplified power calculation
      const power = Math.min(1, (effectSize * Math.sqrt(sampleSize)) / 3);
      minPower = Math.min(minPower, power);
    }
    
    return minPower;
  }

  /**
   * Generate mock A/B test data for testing
   */
  private generateMockABTestData(): MockABTestData[] {
    const tests: MockABTestData[] = [];

    // Test 1: Successful test
    tests.push({
      id: 'test-1',
      name: 'Button Color Test',
      status: 'completed',
      startDate: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      variants: [
        { id: 'control', name: 'Blue Button', visitors: 1000, conversions: 50, conversionRate: 0.05 },
        { id: 'variant-a', name: 'Green Button', visitors: 980, conversions: 65, conversionRate: 0.066 }
      ]
    });

    // Test 2: Insufficient sample size
    tests.push({
      id: 'test-2',
      name: 'Layout Test',
      status: 'running',
      startDate: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
      variants: [
        { id: 'control', name: 'Current Layout', visitors: 50, conversions: 2, conversionRate: 0.04 },
        { id: 'variant-a', name: 'New Layout', visitors: 45, conversions: 3, conversionRate: 0.067 }
      ]
    });

    // Test 3: Sample ratio mismatch
    tests.push({
      id: 'test-3',
      name: 'Pricing Test',
      status: 'running',
      startDate: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
      variants: [
        { id: 'control', name: 'Current Price', visitors: 1500, conversions: 75, conversionRate: 0.05 },
        { id: 'variant-a', name: 'Lower Price', visitors: 200, conversions: 15, conversionRate: 0.075 }
      ]
    });

    return tests;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateABTestingRecommendations(validation: any): string[] {
    const recommendations: string[] = [];

    if (validation.failedTests.length > 0) {
      recommendations.push('Increase sample sizes to meet minimum requirements');
      recommendations.push('Consider extending test duration for low-traffic tests');
    }

    if (validation.statisticalIssues.length > 0) {
      recommendations.push('Review test design and hypothesis formulation');
      recommendations.push('Consider using proper statistical software for p-value calculations');
      recommendations.push('Implement sequential testing to reduce false positives');
    }

    if (validation.sampleRatioMismatches.length > 0) {
      recommendations.push('Check user randomization implementation');
      recommendations.push('Verify user assignment is consistent across sessions');
      recommendations.push('Implement proper user bucketing algorithms');
    }

    if (recommendations.length === 0) {
      recommendations.push('A/B testing system is functioning correctly');
      recommendations.push('Continue monitoring test results for statistical significance');
    }

    return recommendations;
  }

  /**
   * Get A/B testing health score
   */
  public getABTestingHealth(tests: MockABTestData[]): number {
    let score = 100;
    
    for (const test of tests) {
      const minSampleSize = Math.min(...test.variants.map(v => v.visitors));
      if (minSampleSize < this.config.minimumSampleSize) {
        score -= 20;
      }
      
      const pValue = this.calculatePValue(test);
      if (pValue > this.config.maxPValue) {
        score -= 15;
      }
      
      const srm = this.validateSampleRatioMismatch(test);
      if (srm.deviation > this.config.sampleRatioMismatch.threshold) {
        score -= 10;
      }
    }
    
    return Math.max(0, score);
  }
}

export default ABTestingValidator;
