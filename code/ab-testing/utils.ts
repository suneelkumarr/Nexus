/**
 * A/B Testing Core Utilities
 * Randomization, statistical analysis, and helper functions
 */

import { 
  Experiment, 
  ExperimentVariant, 
  User, 
  StatisticalResult, 
  ExperimentResults,
  ExperimentEvent,
  TargetAudience 
} from './types';

// ============================================================================
// RANDOMIZATION AND ASSIGNMENT UTILITIES
// ============================================================================

/**
 * Hash function for consistent user bucketing
 */
export function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a consistent hash for user-experiment combination
 */
export function generateUserBucket(userId: string, experimentId: string): number {
  return hashString(`${userId}:${experimentId}`) % 10000;
}

/**
 * Assign user to experiment variant using consistent hashing
 */
export function assignVariant(
  userId: string, 
  experimentId: string, 
  variants: ExperimentVariant[]
): ExperimentVariant | null {
  if (!variants.length || !userId || !experimentId) {
    return null;
  }

  // Check if user should be excluded based on target audience
  if (!isUserEligible(userId, experimentId, variants[0]?.config?.targetAudience)) {
    return null;
  }

  const userBucket = generateUserBucket(userId, experimentId);
  const normalizedBucket = userBucket / 100; // Convert to 0-100 scale

  // Calculate cumulative weights
  let cumulativeWeight = 0;
  const sortedVariants = [...variants].sort((a, b) => a.weight - b.weight);

  for (const variant of sortedVariants) {
    cumulativeWeight += variant.weight;
    if (normalizedBucket <= cumulativeWeight) {
      return variant;
    }
  }

  // Fallback to last variant if weights don't add up to 100
  return sortedVariants[sortedVariants.length - 1] || null;
}

/**
 * Check if user meets experiment targeting criteria
 */
export function isUserEligible(
  userId: string, 
  experimentId: string, 
  targetAudience?: TargetAudience
): boolean {
  if (!targetAudience) return true;

  // For simplicity, we'll assume user properties are stored elsewhere
  // In a real implementation, you'd fetch user properties from your user service
  const userProperties = getUserProperties(userId);
  
  // Check user properties
  if (targetAudience.userProperties) {
    for (const [key, value] of Object.entries(targetAudience.userProperties)) {
      if (userProperties[key] !== value) {
        return false;
      }
    }
  }

  // Check percentage filter
  if (targetAudience.percentage) {
    const bucket = generateUserBucket(userId, experimentId);
    const normalizedBucket = bucket / 100;
    if (normalizedBucket > targetAudience.percentage) {
      return false;
    }
  }

  return true;
}

/**
 * Get user properties (mock implementation)
 * In real implementation, this would fetch from user database/service
 */
function getUserProperties(userId: string): Record<string, any> {
  // Mock implementation - replace with actual user service call
  return {
    plan: 'free',
    country: 'US',
    device: 'desktop',
    created_days_ago: 30
  };
}

// ============================================================================
// STATISTICAL ANALYSIS UTILITIES
// ============================================================================

/**
 * Calculate statistical significance using z-test for proportions
 */
export function calculateStatisticalSignificance(
  controlResults: { conversions: number; total: number },
  variantResults: { conversions: number; total: number },
  alpha: number = 0.05
): StatisticalResult {
  const controlRate = controlResults.conversions / controlResults.total;
  const variantRate = variantResults.conversions / variantResults.total;
  const effectSize = variantRate - controlRate;

  // Calculate pooled standard error
  const pooledProportion = (controlResults.conversions + variantResults.conversions) / 
                          (controlResults.total + variantResults.total);
  
  const standardError = Math.sqrt(
    pooledProportion * (1 - pooledProportion) * 
    (1 / controlResults.total + 1 / variantResults.total)
  );

  // Calculate z-score
  const zScore = effectSize / standardError;

  // Calculate p-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));

  // Calculate confidence interval
  const criticalValue = getCriticalValue(1 - alpha / 2);
  const marginOfError = criticalValue * standardError;
  
  return {
    variantId: '', // Will be set by caller
    sampleSize: variantResults.total,
    conversionRate: variantRate,
    confidenceLevel: 1 - alpha,
    pValue,
    isSignificant: pValue < alpha,
    effectSize,
    confidenceInterval: {
      lower: effectSize - marginOfError,
      upper: effectSize + marginOfError
    },
    power: calculatePower(controlRate, variantRate, controlResults.total, variantResults.total)
  };
}

/**
 * Calculate sample size needed for experiment
 */
export function calculateRequiredSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  alpha: number = 0.05,
  power: number = 0.8
): number {
  const effectSize = Math.abs(minimumDetectableEffect);
  const variantRate = baselineRate + effectSize;
  
  // Z-scores for alpha and power
  const zAlpha = getCriticalValue(1 - alpha / 2);
  const zBeta = getCriticalValue(power);
  
  // Sample size calculation for two-proportion z-test
  const pooledRate = (baselineRate + variantRate) / 2;
  const variance = pooledRate * (1 - pooledRate);
  
  const sampleSize = Math.ceil(
    2 * variance * Math.pow(zAlpha + zBeta, 2) / Math.pow(effectSize, 2)
  );
  
  return sampleSize;
}

/**
 * Normal cumulative distribution function
 * Approximation using error function
 */
function normalCDF(x: number): number {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

/**
 * Error function approximation
 */
function erf(x: number): number {
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
 * Get critical value for standard normal distribution
 */
function getCriticalValue(probability: number): number {
  // Approximation for inverse normal CDF
  // This is a simplified version - use a library like jStat for production
  const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

  const p = Math.min(Math.max(probability, 1e-10), 1 - 1e-10);
  
  if (p < 0.02425) {
    const q = Math.sqrt(-2 * Math.log(p));
    return (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
           ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
  } else if (p > 1 - 0.02425) {
    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
             ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
  } else {
    const q = p - 0.5;
    const r = q * q;
    return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
           (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
  }
}

/**
 * Calculate statistical power
 */
function calculatePower(
  controlRate: number, 
  variantRate: number, 
  controlSample: number, 
  variantSample: number
): number {
  const effectSize = Math.abs(variantRate - controlRate);
  const pooledProportion = (controlRate + variantRate) / 2;
  
  const standardError = Math.sqrt(
    pooledProportion * (1 - pooledProportion) * 
    (1 / controlSample + 1 / variantSample)
  );
  
  const zScore = effectSize / standardError;
  
  return 1 - normalCDF(zScore - getCriticalValue(0.975));
}

/**
 * Analyze experiment results and determine winner
 */
export function analyzeExperimentResults(
  experimentId: string,
  events: ExperimentEvent[],
  controlVariantId: string,
  confidenceLevel: number = 0.95
): ExperimentResults {
  const eventsByVariant = groupEventsByVariant(events);
  const alpha = 1 - confidenceLevel;
  
  const results: StatisticalResult[] = [];
  
  // Calculate results for each variant
  Object.entries(eventsByVariant).forEach(([variantId, variantEvents]) => {
    const metrics = analyzeVariantEvents(variantEvents);
    const isControl = variantId === controlVariantId;
    
    if (isControl) {
      // Control variant doesn't need significance test against itself
      results.push({
        variantId,
        sampleSize: metrics.totalUsers,
        conversionRate: metrics.conversionRate,
        confidenceLevel,
        pValue: 1,
        isSignificant: false,
        effectSize: 0,
        confidenceInterval: { lower: 0, upper: 0 },
        power: 0
      });
    } else {
      const controlResults = eventsByVariant[controlVariantId];
      const statisticalResult = calculateStatisticalSignificance(
        {
          conversions: controlResults.filter(e => e.eventName === 'conversion').length,
          total: metrics.totalUsers
        },
        {
          conversions: variantEvents.filter(e => e.eventName === 'conversion').length,
          total: metrics.totalUsers
        },
        alpha
      );
      
      statisticalResult.variantId = variantId;
      results.push(statisticalResult);
    }
  });
  
  // Determine winner and recommendation
  const winningVariant = results
    .filter(r => r.variantId !== controlVariantId)
    .reduce((winner, current) => 
      current.conversionRate > (winner?.conversionRate || 0) ? current : winner
    );
  
  const isConclusive = results.some(r => r.isSignificant);
  const recommendedAction = isConclusive ? 'ship' : 'continue';
  const reasoning = generateReasoning(results, isConclusive);
  
  return {
    experimentId,
    totalUsers: events.reduce((total, event) => {
      if (!total.includes(event.userId)) total.push(event.userId);
      return total;
    }, [] as string[]).length,
    variants: results,
    overallResult: {
      winner: winningVariant?.variantId,
      isConclusive,
      recommendedAction,
      reasoning
    },
    analysisDate: new Date(),
    confidenceLevel
  };
}

/**
 * Group events by variant
 */
function groupEventsByVariant(events: ExperimentEvent[]): Record<string, ExperimentEvent[]> {
  return events.reduce((groups, event) => {
    if (!groups[event.variantId]) {
      groups[event.variantId] = [];
    }
    groups[event.variantId].push(event);
    return groups;
  }, {} as Record<string, ExperimentEvent[]>);
}

/**
 * Analyze variant events to get metrics
 */
function analyzeVariantEvents(events: ExperimentEvent[]) {
  const uniqueUsers = new Set(events.map(e => e.userId));
  const conversions = events.filter(e => e.eventName === 'conversion');
  
  return {
    totalUsers: uniqueUsers.size,
    conversionRate: uniqueUsers.size > 0 ? conversions.length / uniqueUsers.size : 0,
    totalEvents: events.length
  };
}

/**
 * Generate reasoning for experiment results
 */
function generateReasoning(results: StatisticalResult[], isConclusive: boolean): string[] {
  const reasoning: string[] = [];
  
  if (!isConclusive) {
    reasoning.push('Results are not statistically significant yet');
    reasoning.push('Continue running the test to collect more data');
    reasoning.push('Consider checking if sample sizes are adequate');
  } else {
    const winner = results.filter(r => r.isSignificant).sort((a, b) => b.effectSize - a.effectSize)[0];
    if (winner) {
      reasoning.push(`Variant "${winner.variantId}" shows statistically significant improvement`);
      reasoning.push(`Effect size: ${(winner.effectSize * 100).toFixed(2)} percentage points`);
      reasoning.push(`Confidence level: ${(winner.confidenceLevel * 100).toFixed(1)}%`);
    }
  }
  
  return reasoning;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if experiment is currently active
 */
export function isExperimentActive(experiment: Experiment): boolean {
  const now = new Date();
  return experiment.status === 'active' &&
         (!experiment.startDate || experiment.startDate <= now) &&
         (!experiment.endDate || experiment.endDate >= now);
}

/**
 * Get traffic allocation for variants
 */
export function getTrafficAllocation(variants: ExperimentVariant[]): Record<string, number> {
  const allocation: Record<string, number> = {};
  let totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
  
  variants.forEach(variant => {
    allocation[variant.id] = totalWeight > 0 ? (variant.weight / totalWeight) * 100 : 0;
  });
  
  return allocation;
}

/**
 * Validate experiment configuration
 */
export function validateExperiment(experiment: Partial<Experiment>): string[] {
  const errors: string[] = [];
  
  if (!experiment.name?.trim()) {
    errors.push('Experiment name is required');
  }
  
  if (!experiment.variants?.length || experiment.variants.length < 2) {
    errors.push('At least 2 variants are required');
  }
  
  const totalWeight = experiment.variants?.reduce((sum, v) => sum + v.weight, 0) || 0;
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push('Variant weights must sum to 100%');
  }
  
  if (!experiment.metrics?.length) {
    errors.push('At least one metric is required');
  }
  
  if (experiment.startDate && experiment.endDate && experiment.startDate >= experiment.endDate) {
    errors.push('End date must be after start date');
  }
  
  return errors;
}

/**
 * Generate unique experiment ID
 */
export function generateExperimentId(): string {
  return `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique event ID
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate experiment duration in days
 */
export function getExperimentDuration(experiment: Experiment): number {
  if (!experiment.startDate || !experiment.endDate) {
    return 0;
  }
  
  const diffTime = Math.abs(experiment.endDate.getTime() - experiment.startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if experiment has sufficient sample size
 */
export function hasSufficientSampleSize(
  events: ExperimentEvent[], 
  minimumSampleSize: number,
  targetMetric: string
): boolean {
  const uniqueUsers = new Set(events.map(e => e.userId));
  const eventsForMetric = events.filter(e => e.eventName === targetMetric);
  
  return uniqueUsers.size >= minimumSampleSize && eventsForMetric.length >= minimumSampleSize / 10;
}