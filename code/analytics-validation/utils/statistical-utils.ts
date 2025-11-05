// Statistical Analysis Utilities for Analytics Validation
export class StatisticalAnalyzer {
  
  /**
   * Calculate z-score for two proportions
   */
  static calculateZScore(controlRate: number, variantRate: number, nControl: number, nVariant: number): number {
    const pooledRate = (controlRate * nControl + variantRate * nVariant) / (nControl + nVariant);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/nControl + 1/nVariant));
    return (variantRate - controlRate) / standardError;
  }

  /**
   * Calculate p-value from z-score (two-tailed test)
   */
  static calculatePValue(zScore: number): number {
    return 2 * (1 - this.normalCDF(Math.abs(zScore)));
  }

  /**
   * Normal cumulative distribution function
   */
  static normalCDF(x: number): number {
    return (1 + this.erf(x / Math.sqrt(2))) / 2;
  }

  /**
   * Error function approximation (Abramowitz and Stegun)
   */
  static erf(x: number): number {
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
   * Calculate confidence interval for proportion
   */
  static calculateConfidenceInterval(p: number, n: number, confidence: number = 0.95): [number, number] {
    const z = this.getZScore(confidence);
    const marginOfError = z * Math.sqrt(p * (1 - p) / n);
    return [Math.max(0, p - marginOfError), Math.min(1, p + marginOfError)];
  }

  /**
   * Get z-score for confidence level
   */
  static getZScore(confidence: number): number {
    const confidenceMap: Record<string, number> = {
      '0.90': 1.645,
      '0.95': 1.96,
      '0.99': 2.576
    };
    
    return confidenceMap[confidence.toString()] || 1.96;
  }

  /**
   * Calculate required sample size for A/B test
   */
  static calculateRequiredSampleSize(
    baselineRate: number,
    minimumDetectableEffect: number,
    alpha: number = 0.05,
    power: number = 0.8
  ): number {
    const zAlpha = this.getZScore(1 - alpha / 2);
    const zBeta = this.getZScore(power);
    const variantRate = baselineRate + minimumDetectableEffect;
    
    const pooledRate = (baselineRate + variantRate) / 2;
    
    const numerator = Math.pow(zAlpha * Math.sqrt(2 * pooledRate * (1 - pooledRate)) + 
                               zBeta * Math.sqrt(baselineRate * (1 - baselineRate) + 
                                                variantRate * (1 - variantRate)), 2);
    
    const denominator = Math.pow(minimumDetectableEffect, 2);
    
    return Math.ceil(numerator / denominator);
  }

  /**
   * Calculate statistical power
   */
  static calculateStatisticalPower(
    controlRate: number,
    variantRate: number,
    nControl: number,
    nVariant: number,
    alpha: number = 0.05
  ): number {
    const pooledRate = (controlRate * nControl + variantRate * nVariant) / (nControl + nVariant);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/nControl + 1/nVariant));
    const delta = Math.abs(variantRate - controlRate);
    
    const zAlpha = this.getZScore(1 - alpha / 2);
    const zCritical = zAlpha * standardError;
    const zBeta = (delta - zCritical) / standardError;
    
    return this.normalCDF(zBeta);
  }

  /**
   * Calculate effect size (Cohen's h)
   */
  static calculateEffectSize(controlRate: number, variantRate: number): number {
    const h1 = 2 * Math.asin(Math.sqrt(controlRate));
    const h2 = 2 * Math.asin(Math.sqrt(variantRate));
    return Math.abs(h2 - h1);
  }

  /**
   * Perform chi-square test for independence
   */
  static chiSquareTest(observed: number[][], expected: number[][]): {
    chiSquare: number;
    degreesOfFreedom: number;
    pValue: number;
    isSignificant: boolean;
  } {
    let chiSquare = 0;
    
    for (let i = 0; i < observed.length; i++) {
      for (let j = 0; j < observed[i].length; j++) {
        const diff = observed[i][j] - expected[i][j];
        chiSquare += (diff * diff) / expected[i][j];
      }
    }
    
    const degreesOfFreedom = (observed.length - 1) * (observed[0].length - 1);
    const pValue = 1 - this.chiSquareCDF(chiSquare, degreesOfFreedom);
    
    return {
      chiSquare,
      degreesOfFreedom,
      pValue,
      isSignificant: pValue < 0.05
    };
  }

  /**
   * Chi-square cumulative distribution function approximation
   */
  static chiSquareCDF(x: number, k: number): number {
    // Simplified approximation for chi-square distribution
    // In production, use a proper statistical library
    if (x <= 0) return 0;
    
    const normalizedX = x / k;
    if (normalizedX < 1) {
      return Math.pow(normalizedX, k/2) * Math.exp(-normalizedX/2) / 
             (Math.pow(2, k/2) * this.gammaFunction(k/2));
    }
    
    // For larger values, use normal approximation
    const z = (x - k) / Math.sqrt(2 * k);
    return this.normalCDF(z);
  }

  /**
   * Gamma function approximation
   */
  static gammaFunction(z: number): number {
    // Lanczos approximation for gamma function
    const g = 7;
    const p = [
      0.99999999999980993,
      676.5203681218851,
      -1259.1392167224028,
      771.32342877765313,
      -176.61502916214059,
      12.507343278686905,
      -0.13857109526572012,
      9.9843695780195716e-6,
      1.5056327351493116e-7
    ];

    if (z < 0.5) {
      return Math.PI / (Math.sin(Math.PI * z) * this.gammaFunction(1 - z));
    }

    z -= 1;
    let x = p[0];
    for (let i = 1; i < p.length; i++) {
      x += p[i] / (z + i);
    }

    const t = z + g + 0.5;
    return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
  }

  /**
   * Calculate sample ratio mismatch p-value
   */
  static calculateSRMPValue(observed: number[], expected: number[]): number {
    const totalObserved = observed.reduce((sum, val) => sum + val, 0);
    const totalExpected = expected.reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(totalObserved - totalExpected) > 1) {
      return 0; // Significant mismatch
    }
    
    const ratios = observed.map((obs, i) => obs / totalObserved);
    const expectedRatios = expected.map((exp, i) => exp / totalExpected);
    
    let chiSquare = 0;
    for (let i = 0; i < ratios.length; i++) {
      const diff = ratios[i] - expectedRatios[i];
      chiSquare += (diff * diff) / expectedRatios[i];
    }
    
    return this.chiSquareCDF(chiSquare, ratios.length - 1);
  }

  /**
   * Calculate Bayesian probability of superiority
   */
  static calculateBayesianProbability(
    controlConversions: number,
    controlTotal: number,
    variantConversions: number,
    variantTotal: number,
    iterations: number = 10000
  ): number {
    let variantWins = 0;
    
    for (let i = 0; i < iterations; i++) {
      // Sample from Beta distributions
      const controlSample = this.betaSample(controlConversions + 1, controlTotal - controlConversions + 1);
      const variantSample = this.betaSample(variantConversions + 1, variantTotal - variantConversions + 1);
      
      if (variantSample > controlSample) {
        variantWins++;
      }
    }
    
    return variantWins / iterations;
  }

  /**
   * Beta distribution sampling using rejection method
   */
  static betaSample(alpha: number, beta: number): number {
    // Simple rejection sampling for Beta distribution
    // For production, use a proper random number generator
    const u1 = Math.random();
    const u2 = Math.random();
    
    // Approximation using two Gamma distributions
    const x = this.gammaSample(alpha, 1);
    const y = this.gammaSample(beta, 1);
    
    return x / (x + y);
  }

  /**
   * Gamma distribution sampling
   */
  static gammaSample(shape: number, scale: number): number {
    // Marsaglia and Tsang method for gamma sampling
    if (shape < 1) {
      return this.gammaSample(shape + 1, scale) * Math.pow(Math.random(), 1 / shape);
    }
    
    const d = shape - 1/3;
    const c = 1 / Math.sqrt(9 * d);
    
    while (true) {
      let x, v;
      
      do {
        x = this.normalSample();
        v = 1 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      
      if (u < 1 - 0.0331 * x * x * x * x) {
        return d * v * scale;
      }
      
      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v * scale;
      }
    }
  }

  /**
   * Normal distribution sampling
   */
  static normalSample(): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

// Sample Size Calculator
export class SampleSizeCalculator {
  /**
   * Calculate minimum sample size for A/B test
   */
  static calculateMinimumSampleSize(
    baselineConversionRate: number,
    minimumDetectableEffect: number,
    confidenceLevel: number = 0.95,
    statisticalPower: number = 0.8
  ): {
    perVariant: number;
    total: number;
  } {
    const requiredPerVariant = StatisticalAnalyzer.calculateRequiredSampleSize(
      baselineConversionRate,
      minimumDetectableEffect,
      1 - confidenceLevel,
      statisticalPower
    );
    
    return {
      perVariant: requiredPerVariant,
      total: requiredPerVariant * 2
    };
  }

  /**
   * Calculate sample size for multiple variants
   */
  static calculateMultiVariantSampleSize(
    baselineRate: number,
    effectSize: number,
    numVariants: number,
    alpha: number = 0.05,
    power: number = 0.8
  ): {
    perVariant: number;
    total: number;
  } {
    // Adjust alpha for multiple comparisons (Bonferroni correction)
    const adjustedAlpha = alpha / (numVariants - 1);
    const requiredPerVariant = StatisticalAnalyzer.calculateRequiredSampleSize(
      baselineRate,
      effectSize,
      adjustedAlpha,
      power
    );
    
    return {
      perVariant: requiredPerVariant,
      total: requiredPerVariant * numVariants
    };
  }
}

// Anomaly Detection
export class AnomalyDetector {
  /**
   * Detect outliers using IQR method
   */
  static detectOutliersIQR(values: number[]): {
    outliers: number[];
    lowerBound: number;
    upperBound: number;
  } {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const outliers = values.filter(value => value < lowerBound || value > upperBound);
    
    return { outliers, lowerBound, upperBound };
  }

  /**
   * Calculate percentile
   */
  static calculatePercentile(sortedValues: number[], percentile: number): number {
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (upper >= sortedValues.length) {
      return sortedValues[sortedValues.length - 1];
    }
    
    return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
  }

  /**
   * Detect trends using linear regression
   */
  static detectTrend(values: number[], timePoints: number[]): {
    slope: number;
    intercept: number;
    rSquared: number;
    isIncreasing: boolean;
    significance: number;
  } {
    const n = values.length;
    const sumX = timePoints.reduce((sum, x) => sum + x, 0);
    const sumY = values.reduce((sum, y) => sum + y, 0);
    const sumXY = values.reduce((sum, y, i) => sum + y * timePoints[i], 0);
    const sumX2 = timePoints.reduce((sum, x) => sum + x * x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared
    const yMean = sumY / n;
    const totalSumSquares = values.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const residualSumSquares = values.reduce((sum, y, i) => {
      const predicted = slope * timePoints[i] + intercept;
      return sum + Math.pow(y - predicted, 2);
    }, 0);
    
    const rSquared = 1 - (residualSumSquares / totalSumSquares);
    
    return {
      slope,
      intercept,
      rSquared,
      isIncreasing: slope > 0,
      significance: rSquared
    };
  }
}

export default {
  StatisticalAnalyzer,
  SampleSizeCalculator,
  AnomalyDetector
};
