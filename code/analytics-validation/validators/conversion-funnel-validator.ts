// Conversion Funnel Validation System
import { ConversionFunnelValidationResult, MockFunnelData, FunnelValidationConfig } from '../types/validation-types';
import { ValidationConfigManager } from '../config/validation-config';

export class ConversionFunnelValidator {
  private config: FunnelValidationConfig;
  private configManager: ValidationConfigManager;

  constructor() {
    this.configManager = ValidationConfigManager.getInstance();
    this.config = this.configManager.getConversionFunnelConfig();
  }

  /**
   * Validate conversion funnel analysis
   */
  async validateConversionFunnels(mockData?: MockFunnelData[]): Promise<ConversionFunnelValidationResult> {
    const startTime = Date.now();
    
    try {
      // Get or generate test data
      const funnels = mockData || this.generateMockFunnelData();
      
      const validation = {
        funnelsValidated: funnels.length,
        problematicFunnels: [] as any[]
      };

      for (const funnel of funnels) {
        const funnelIssues = this.validateFunnel(funnel);
        if (funnelIssues.issues.length > 0) {
          validation.problematicFunnels.push({
            funnelId: funnel.funnelId,
            issue: funnelIssues.issues.join(', '),
            severity: funnelIssues.severity,
            dropOffRate: this.calculateOverallDropOffRate(funnel),
            stepIssues: funnelIssues.stepIssues
          });
        }
      }

      // Determine overall status
      const criticalIssues = validation.problematicFunnels.filter(f => f.severity === 'critical').length;
      const highIssues = validation.problematicFunnels.filter(f => f.severity === 'high').length;
      const totalIssues = validation.problematicFunnels.length;
      
      let status: 'passed' | 'warning' | 'failed' = 'passed';
      let message = 'Conversion funnel validation passed successfully';
      
      if (criticalIssues > 0) {
        status = 'failed';
        message = `Critical funnel issues found: ${criticalIssues} funnels have critical problems`;
      } else if (highIssues > 0 || totalIssues > funnels.length * 0.5) {
        status = 'failed';
        message = `Significant funnel issues found: ${totalIssues} funnels have problems`;
      } else if (totalIssues > 0) {
        status = 'warning';
        message = `Minor funnel issues found: ${totalIssues} funnels have concerns`;
      }

      const result: ConversionFunnelValidationResult = {
        id: `conversion-funnel-${Date.now()}`,
        type: 'conversion_funnel',
        status,
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message,
        details: {
          ...validation,
          totalUsers: funnels.reduce((sum, f) => sum + f.totalUsers, 0),
          averageConversionRate: funnels.reduce((sum, f) => sum + f.conversionRate, 0) / funnels.length,
          maxDropOffRate: Math.max(...funnels.map(f => this.calculateOverallDropOffRate(f)))
        },
        recommendations: this.generateFunnelRecommendations(validation),
        severity: status === 'failed' ? 'high' : status === 'warning' ? 'medium' : 'low'
      };

      return result;

    } catch (error) {
      return {
        id: `conversion-funnel-error-${Date.now()}`,
        type: 'conversion_funnel',
        status: 'failed',
        timestamp: Date.now(),
        duration: Date.now() - startTime,
        message: `Conversion funnel validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        details: {
          funnelsValidated: 0,
          problematicFunnels: [],
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        recommendations: ['Check funnel analysis implementation', 'Verify data pipeline'],
        severity: 'critical'
      };
    }
  }

  /**
   * Validate individual funnel
   */
  private validateFunnel(funnel: MockFunnelData): {
    issues: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
    stepIssues: Array<{ stepName: string; issue: string; severity: 'low' | 'medium' | 'high' | 'critical' }>;
  } {
    const issues: string[] = [];
    const stepIssues: Array<{ stepName: string; issue: string; severity: 'low' | 'medium' | 'high' | 'critical' }> = [];
    let maxSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check if funnel has minimum required steps
    if (funnel.steps.length < this.config.requiredSteps.length) {
      issues.push(`Funnel has fewer steps than required minimum (${this.config.requiredSteps.length})`);
      maxSeverity = 'medium';
    }

    // Validate each step
    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const stepValidation = this.validateFunnelStep(step, i, funnel.steps);
      
      if (stepValidation.issues.length > 0) {
        stepIssues.push({
          stepName: step.name,
          issue: stepValidation.issues.join(', '),
          severity: stepValidation.severity
        });
        issues.push(`Step "${step.name}": ${stepValidation.issues.join(', ')}`);
        
        if (stepValidation.severity === 'critical') {
          maxSeverity = 'critical';
        } else if (stepValidation.severity === 'high' && maxSeverity !== 'critical') {
          maxSeverity = 'high';
        } else if (stepValidation.severity === 'medium' && maxSeverity === 'low') {
          maxSeverity = 'medium';
        }
      }
    }

    // Check overall conversion rate reasonableness
    if (funnel.conversionRate > 1 || funnel.conversionRate < 0) {
      issues.push('Invalid conversion rate (must be between 0 and 1)');
      maxSeverity = 'critical';
    } else if (funnel.conversionRate > 0.95) {
      issues.push('Suspiciously high conversion rate (>95%)');
      maxSeverity = 'high';
    } else if (funnel.conversionRate < 0.01) {
      issues.push('Very low conversion rate (<1%)');
      maxSeverity = 'medium';
    }

    // Check for step sequence issues
    const stepSequenceIssues = this.validateStepSequence(funnel.steps);
    if (stepSequenceIssues.length > 0) {
      issues.push(...stepSequenceIssues);
      maxSeverity = 'medium';
    }

    return {
      issues,
      severity: maxSeverity,
      stepIssues
    };
  }

  /**
   * Validate individual funnel step
   */
  private validateFunnelStep(step: { name: string; users: number; dropoffRate: number }, 
                           index: number, 
                           allSteps: Array<{ name: string; users: number; dropoffRate: number }>): {
    issues: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  } {
    const issues: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check minimum users per step
    if (step.users < this.config.minimumUsersPerStep) {
      issues.push(`Insufficient users (${step.users} < ${this.config.minimumUsersPerStep})`);
      severity = 'high';
    }

    // Check drop-off rate
    if (step.dropoffRate > this.config.maxDropOffRate) {
      issues.push(`Excessive drop-off rate (${step.dropoffRate.toFixed(1)}% > ${this.config.maxDropOffRate}%)`);
      severity = 'high';
    } else if (step.dropoffRate > this.config.maxDropOffRate * 0.7) {
      issues.push(`High drop-off rate (${step.dropoffRate.toFixed(1)}%)`);
      severity = 'medium';
    }

    // Check for negative or extreme values
    if (step.dropoffRate < 0) {
      issues.push('Negative drop-off rate');
      severity = 'critical';
    } else if (step.dropoffRate > 100) {
      issues.push('Drop-off rate > 100%');
      severity = 'critical';
    }

    // Check step progression (users should generally decrease)
    if (index > 0) {
      const previousStep = allSteps[index - 1];
      if (step.users > previousStep.users) {
        issues.push('Step has more users than previous step');
        severity = 'high';
      }
    }

    return { issues, severity };
  }

  /**
   * Validate step sequence for logical flow
   */
  private validateStepSequence(steps: Array<{ name: string; users: number; dropoffRate: number }>): string[] {
    const issues: string[] = [];

    // Check for reasonable step name patterns
    const expectedPatterns = [
      /start/i, /begin/i, /signup/i,
      /setup/i, /profile/i, /onboard/i,
      /complete/i, /finish/i, /success/i
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      let hasReasonablePattern = false;

      for (const pattern of expectedPatterns) {
        if (pattern.test(step.name)) {
          hasReasonablePattern = true;
          break;
        }
      }

      if (!hasReasonablePattern) {
        issues.push(`Step "${step.name}" may not follow naming conventions`);
      }
    }

    return issues;
  }

  /**
   * Calculate overall drop-off rate for funnel
   */
  private calculateOverallDropOffRate(funnel: MockFunnelData): number {
    if (funnel.steps.length === 0) return 0;
    
    const startUsers = funnel.steps[0].users;
    const endUsers = funnel.steps[funnel.steps.length - 1].users;
    
    return startUsers > 0 ? ((startUsers - endUsers) / startUsers) * 100 : 0;
  }

  /**
   * Analyze funnel drop-off points
   */
  public analyzeDropOffPoints(funnel: MockFunnelData): {
    criticalDropOffs: Array<{ stepIndex: number; stepName: string; dropOffRate: number }>;
    optimizationOpportunities: string[];
  } {
    const criticalDropOffs: Array<{ stepIndex: number; stepName: string; dropOffRate: number }> = [];
    const optimizationOpportunities: string[] = [];

    for (let i = 1; i < funnel.steps.length; i++) {
      const currentStep = funnel.steps[i];
      const previousStep = funnel.steps[i - 1];
      const dropOffRate = ((previousStep.users - currentStep.users) / previousStep.users) * 100;

      if (dropOffRate > this.config.maxDropOffRate) {
        criticalDropOffs.push({
          stepIndex: i,
          stepName: currentStep.name,
          dropOffRate
        });

        optimizationOpportunities.push(
          `Address high drop-off at "${currentStep.name}" step (${dropOffRate.toFixed(1)}% drop-off)`
        );
      } else if (dropOffRate > this.config.maxDropOffRate * 0.6) {
        optimizationOpportunities.push(
          `Monitor drop-off at "${currentStep.name}" step (${dropOffRate.toFixed(1)}% drop-off)`
        );
      }
    }

    return { criticalDropOffs, optimizationOpportunities };
  }

  /**
   * Generate mock funnel data for testing
   */
  private generateMockFunnelData(): MockFunnelData[] {
    const funnels: MockFunnelData[] = [];

    // Free to Pro Conversion Funnel
    funnels.push({
      funnelId: 'free-to-pro-conversion',
      totalUsers: 1000,
      completedUsers: 50,
      conversionRate: 0.05,
      steps: [
        { name: 'Sign Up', users: 1000, dropoffRate: 0 },
        { name: 'Onboarding Start', users: 900, dropoffRate: 10 },
        { name: 'Profile Setup', users: 800, dropoffRate: 11.1 },
        { name: 'Feature Discovery', users: 600, dropoffRate: 25 },
        { name: 'Upgrade Attempt', users: 150, dropoffRate: 75 },
        { name: 'Upgrade Success', users: 50, dropoffRate: 66.7 }
      ]
    });

    // Onboarding Completion Funnel
    funnels.push({
      funnelId: 'onboarding-completion',
      totalUsers: 900,
      completedUsers: 720,
      conversionRate: 0.8,
      steps: [
        { name: 'Onboarding Start', users: 900, dropoffRate: 0 },
        { name: 'Account Setup', users: 850, dropoffRate: 5.6 },
        { name: 'Profile Configuration', users: 800, dropoffRate: 5.9 },
        { name: 'Feature Tutorial', users: 750, dropoffRate: 6.3 },
        { name: 'Onboarding Complete', users: 720, dropoffRate: 4 }
      ]
    });

    // Problematic Funnel (high drop-off)
    funnels.push({
      funnelId: 'problematic-funnel',
      totalUsers: 500,
      completedUsers: 5,
      conversionRate: 0.01,
      steps: [
        { name: 'Start', users: 500, dropoffRate: 0 },
        { name: 'Step 1', users: 300, dropoffRate: 40 },
        { name: 'Step 2', users: 100, dropoffRate: 66.7 },
        { name: 'Step 3', users: 20, dropoffRate: 80 },
        { name: 'Complete', users: 5, dropoffRate: 75 }
      ]
    });

    return funnels;
  }

  /**
   * Generate recommendations based on validation results
   */
  private generateFunnelRecommendations(validation: any): string[] {
    const recommendations: string[] = [];

    if (validation.problematicFunnels.length > 0) {
      recommendations.push('Review funnel step designs to identify improvement opportunities');
      recommendations.push('Consider A/B testing alternative step flows for problematic funnels');
      
      const criticalFunnels = validation.problematicFunnels.filter((f: any) => f.severity === 'critical');
      if (criticalFunnels.length > 0) {
        recommendations.push('Address critical funnel issues immediately');
      }
      
      const highDropOffs = validation.problematicFunnels.filter((f: any) => 
        f.dropOffRate > this.config.maxDropOffRate
      );
      if (highDropOffs.length > 0) {
        recommendations.push('Focus on reducing high drop-off rates in conversion funnels');
      }
    } else {
      recommendations.push('Conversion funnels are performing well');
      recommendations.push('Continue monitoring funnel performance for optimization opportunities');
    }

    // General funnel optimization recommendations
    recommendations.push('Implement progressive profiling to reduce form abandonment');
    recommendations.push('Use behavioral analytics to identify friction points');
    recommendations.push('Consider implementing exit-intent interventions at critical drop-off points');

    return recommendations;
  }

  /**
   * Get funnel health score
   */
  public getFunnelHealth(funnels: MockFunnelData[]): number {
    let totalScore = 0;
    
    for (const funnel of funnels) {
      let score = 100;
      
      // Deduct points for high drop-off rates
      for (const step of funnel.steps) {
        if (step.dropoffRate > this.config.maxDropOffRate) {
          score -= 20;
        } else if (step.dropoffRate > this.config.maxDropOffRate * 0.7) {
          score -= 10;
        }
      }
      
      // Deduct points for poor conversion rates
      if (funnel.conversionRate < 0.01) {
        score -= 30;
      } else if (funnel.conversionRate < 0.05) {
        score -= 15;
      }
      
      totalScore += Math.max(0, score);
    }
    
    return funnels.length > 0 ? totalScore / funnels.length : 0;
  }
}

export default ConversionFunnelValidator;
