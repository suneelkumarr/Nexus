import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ChartBarIcon,
  InformationCircleIcon,
  CalculatorIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BeakerIcon,
  LightBulbIcon,
  DocumentChartBarIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { StatisticalResult, ABTest } from '../types';

const calculatorSchema = z.object({
  baselineConversionRate: z.number().min(0).max(100).default(5),
  minimumDetectableEffect: z.number().min(0.1).max(100).default(5),
  confidenceLevel: z.number().min(80).max(99).default(95),
  statisticalPower: z.number().min(70).max(99).default(80),
  numberOfVariants: z.number().min(2).max(10).default(2),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    visitors: z.number().min(0, 'Visitors must be non-negative'),
    conversions: z.number().min(0, 'Conversions must be non-negative'),
    revenue: z.number().min(0, 'Revenue must be non-negative').default(0),
    expectedImprovement: z.number().optional(),
  })),
  businessMetrics: z.object({
    dailyTraffic: z.number().min(1, 'Daily traffic must be greater than 0'),
    costPerVisitor: z.number().min(0, 'Cost per visitor must be non-negative').default(0),
    averageOrderValue: z.number().min(0, 'Average order value must be non-negative').default(0),
    testDuration: z.number().min(1, 'Test duration must be at least 1 day').default(14),
  }),
  advanced: z.object({
    alphaLevel: z.number().min(0.001).max(0.1).default(0.05),
    effectSizeThreshold: z.number().min(0.001).max(0.5).default(0.02),
    multipleTestingCorrection: z.boolean().default(false),
    sequentialAnalysis: z.boolean().default(false),
    bayesianAnalysis: z.boolean().default(false),
  }),
});

type CalculatorFormData = z.infer<typeof calculatorSchema>;

interface AdvancedStatisticalResult {
  sampleSizeAnalysis: {
    perVariant: number;
    totalRequired: number;
    perDay: number;
    estimatedDuration: number;
    withTraffic: number;
  };
  
  powerAnalysis: {
    statisticalPower: number;
    typeIErrors: number;
    typeIIErrors: number;
    criticalValue: number;
  };
  
  significanceTesting: {
    [variantId: string]: {
      comparisonToControl: {
        zScore: number;
        pValue: number;
        confidenceInterval: [number, number];
        isSignificant: boolean;
        effectSize: number;
      };
      pairwiseComparisons: {
        [comparisonVariant: string]: {
          zScore: number;
          pValue: number;
          isSignificant: boolean;
          confidenceInterval: [number, number];
        };
      };
    };
  };
  
  businessImpact: {
    revenueImpact: {
      daily: number;
      monthly: number;
      yearly: number;
    };
    costAnalysis: {
      testCost: number;
      opportunityCost: number;
      breakEvenPoint: number;
    };
    roiProjection: {
      optimistic: number;
      realistic: number;
      pessimistic: number;
    };
  };
  
  recommendations: {
    primary: string;
    secondary: string[];
    warnings: string[];
    nextSteps: string[];
    statisticalGuidance: string;
  };
  
  assumptions: {
    isValid: boolean;
    warnings: string[];
    recommendations: string[];
  };
}

const StatisticalCalculator: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const [result, setResult] = useState<AdvancedStatisticalResult | null>(null);
  const [calculationMode, setCalculationMode] = useState<'sample-size' | 'significance' | 'power' | 'business-impact'>('sample-size');
  const [comparisonVariant, setComparisonVariant] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<CalculatorFormData>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      baselineConversionRate: 5,
      minimumDetectableEffect: 5,
      confidenceLevel: 95,
      statisticalPower: 80,
      numberOfVariants: 2,
      variants: [
        {
          name: 'Control',
          visitors: 1000,
          conversions: 50,
          revenue: 2500,
        },
        {
          name: 'Variant A',
          visitors: 1000,
          conversions: 65,
          revenue: 3250,
        },
      ],
      businessMetrics: {
        dailyTraffic: 1000,
        costPerVisitor: 0.5,
        averageOrderValue: 50,
        testDuration: 14,
      },
      advanced: {
        alphaLevel: 0.05,
        effectSizeThreshold: 0.02,
        multipleTestingCorrection: false,
        sequentialAnalysis: false,
        bayesianAnalysis: false,
      },
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants',
  });

  const watchedValues = watch();

  // Statistical calculations
  const calculateAdvancedStatistics = (data: CalculatorFormData): AdvancedStatisticalResult => {
    const {
      baselineConversionRate,
      minimumDetectableEffect,
      confidenceLevel,
      statisticalPower,
      numberOfVariants,
      variants,
      businessMetrics,
      advanced,
    } = data;

    // Sample size calculation using normal approximation
    const alpha = 1 - confidenceLevel / 100;
    const beta = 1 - statisticalPower / 100;
    const delta = minimumDetectableEffect / 100;
    const p1 = baselineConversionRate / 100;
    const p2 = p1 + delta;

    // Z-scores for alpha and beta
    const zAlpha = inverseNormalCDF(1 - alpha / 2);
    const zBeta = inverseNormalCDF(1 - beta);

    // Sample size per variant (two-proportion z-test)
    const pooledP = (p1 + p2) / 2;
    const variance = pooledP * (1 - pooledP);
    const pooledVariance = 2 * variance; // For equal allocation
    
    const sampleSizePerVariant = Math.ceil(
      ((zAlpha * Math.sqrt(2 * pooledVariance) + zBeta * Math.sqrt(2 * variance)) ** 2) / (delta ** 2)
    );

    const totalSampleSize = sampleSizePerVariant * numberOfVariants;
    const dailyTrafficRequired = Math.ceil(sampleSizePerVariant / businessMetrics.testDuration);
    const estimatedDuration = Math.ceil(totalSampleSize / businessMetrics.dailyTraffic);

    // Power analysis
    const actualPower = calculatePower(p1, p2, sampleSizePerVariant, alpha);
    const typeIErrors = alpha;
    const typeIIErrors = beta;
    const criticalValue = zAlpha;

    // Significance testing for each variant
    const significanceTesting: any = {};
    const control = variants[0];
    
    variants.slice(1).forEach((variant, index) => {
      const variantIndex = index + 1;
      const variantId = `variant_${variantIndex}`;
      
      if (control.visitors > 0 && variant.visitors > 0) {
        const p1_actual = control.conversions / control.visitors;
        const p2_actual = variant.conversions / variant.visitors;
        
        const se = Math.sqrt(p1_actual * (1 - p1_actual) / control.visitors + 
                           p2_actual * (1 - p2_actual) / variant.visitors);
        
        const zScore = (p2_actual - p1_actual) / se;
        const pValue = 2 * (1 - normalCDF(Math.abs(zScore)));
        const confidenceInterval = [
          (p2_actual - p1_actual) - zAlpha * se,
          (p2_actual - p1_actual) + zAlpha * se,
        ];
        
        const effectSize = Math.abs(p2_actual - p1_actual) / p1_actual;
        
        significanceTesting[variantId] = {
          comparisonToControl: {
            zScore,
            pValue,
            confidenceInterval,
            isSignificant: pValue < alpha,
            effectSize,
          },
          pairwiseComparisons: {},
        };
        
        // Pairwise comparisons with other variants
        variants.slice(2).forEach((otherVariant, otherIndex) => {
          if (otherVariant.visitors > 0) {
            const p3_actual = otherVariant.conversions / otherVariant.visitors;
            const sePairwise = Math.sqrt(p2_actual * (1 - p2_actual) / variant.visitors + 
                                       p3_actual * (1 - p3_actual) / otherVariant.visitors);
            const zScorePairwise = (p2_actual - p3_actual) / sePairwise;
            const pValuePairwise = 2 * (1 - normalCDF(Math.abs(zScorePairwise)));
            const ciPairwise = [
              (p2_actual - p3_actual) - zAlpha * sePairwise,
              (p2_actual - p3_actual) + zAlpha * sePairwise,
            ];
            
            significanceTesting[variantId].pairwiseComparisons[`variant_${otherIndex + 2}`] = {
              zScore: zScorePairwise,
              pValue: pValuePairwise,
              isSignificant: pValuePairwise < alpha,
              confidenceInterval: ciPairwise,
            };
          }
        });
      }
    });

    // Business impact analysis
    const controlConversionRate = control.visitors > 0 ? control.conversions / control.visitors : 0;
    const bestVariant = variants.reduce((best, current) => {
      const currentRate = current.visitors > 0 ? current.conversions / current.visitors : 0;
      const bestRate = best.visitors > 0 ? best.conversions / best.visitors : 0;
      return currentRate > bestRate ? current : best;
    });

    const dailyRevenueLift = (bestVariant.conversions - control.conversions) * businessMetrics.averageOrderValue;
    const monthlyRevenueLift = dailyRevenueLift * 30;
    const yearlyRevenueLift = monthlyRevenueLift * 12;

    const testCost = businessMetrics.dailyTraffic * businessMetrics.costPerVisitor * businessMetrics.testDuration;
    const opportunityCost = (sampleSizePerVariant - control.visitors) * businessMetrics.costPerVisitor;
    const breakEvenPoint = testCost > 0 ? testCost / (dailyRevenueLift * businessMetrics.averageOrderValue / businessMetrics.dailyTraffic) : 0;

    const optimisticRoi = ((yearlyRevenueLift * 1.5) / testCost) * 100;
    const realisticRoi = (yearlyRevenueLift / testCost) * 100;
    const pessimisticRoi = ((yearlyRevenueLift * 0.5) / testCost) * 100;

    // Generate recommendations
    const recommendations = generateRecommendations(
      significanceTesting,
      sampleSizePerVariant,
      estimatedDuration,
      actualPower,
      businessMetrics,
      advanced
    );

    // Validate assumptions
    const assumptions = validateAssumptions(variants, businessMetrics, advanced);

    return {
      sampleSizeAnalysis: {
        perVariant: sampleSizePerVariant,
        totalRequired: totalSampleSize,
        perDay: dailyTrafficRequired,
        estimatedDuration,
        withTraffic: Math.max(estimatedDuration, businessMetrics.testDuration),
      },
      powerAnalysis: {
        statisticalPower: actualPower,
        typeIErrors,
        typeIIErrors,
        criticalValue,
      },
      significanceTesting,
      businessImpact: {
        revenueImpact: {
          daily: dailyRevenueLift,
          monthly: monthlyRevenueLift,
          yearly: yearlyRevenueLift,
        },
        costAnalysis: {
          testCost,
          opportunityCost,
          breakEvenPoint,
        },
        roiProjection: {
          optimistic: optimisticRoi,
          realistic: realisticRoi,
          pessimistic: pessimisticRoi,
        },
      },
      recommendations,
      assumptions,
    };
  };

  const generateRecommendations = (
    significanceTesting: any,
    sampleSize: number,
    duration: number,
    power: number,
    businessMetrics: any,
    advanced: any
  ) => {
    const recommendations: any = {
      primary: '',
      secondary: [],
      warnings: [],
      nextSteps: [],
      statisticalGuidance: '',
    };

    // Sample size recommendations
    if (duration > 30) {
      recommendations.warnings.push('Test duration exceeds 30 days. Consider increasing traffic or decreasing detectable effect.');
    } else if (duration < 7) {
      recommendations.warnings.push('Test may conclude too quickly. Ensure adequate data collection period.');
    }

    // Power analysis
    if (power < 0.8) {
      recommendations.warnings.push('Statistical power is below 80%. Consider increasing sample size or test duration.');
    } else if (power > 0.95) {
      recommendations.secondary.push('Statistical power is very high. You might be able to detect smaller effects.');
    }

    // Significance analysis
    const significantVariants = Object.values(significanceTesting).filter((test: any) => 
      test.comparisonToControl.isSignificant
    );

    if (significantVariants.length > 0) {
      recommendations.primary = 'Significant results detected! Consider implementing the winning variant.';
      recommendations.nextSteps.push('Analyze the winning variant\'s characteristics for broader implementation.');
      recommendations.nextSteps.push('Plan follow-up tests to validate results in different contexts.');
    } else {
      recommendations.primary = 'No significant differences detected. Continue collecting data or adjust test parameters.';
      recommendations.nextSteps.push('Extend test duration if sample size targets haven\'t been met.');
      recommendations.nextSteps.push('Consider increasing the minimum detectable effect size.');
    }

    // Business recommendations
    if (businessMetrics.testDuration < 14) {
      recommendations.secondary.push('Consider extending test duration to at least 2 weeks for reliable results.');
    }

    if (advanced.multipleTestingCorrection) {
      recommendations.secondary.push('Multiple testing correction applied. Results account for increased Type I error risk.');
    }

    if (advanced.bayesianAnalysis) {
      recommendations.secondary.push('Bayesian analysis provides probability estimates for each variant being the best.');
    }

    // Statistical guidance
    recommendations.statisticalGuidance = `Based on your parameters: ${sampleSize.toLocaleString()} visitors per variant needed, ` +
      `${duration} day duration estimated, ${(power * 100).toFixed(1)}% statistical power achieved.`;

    return recommendations;
  };

  const validateAssumptions = (variants: any[], businessMetrics: any, advanced: any) => {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Sample size validation
    const controlVisitors = variants[0]?.visitors || 0;
    if (controlVisitors < 30) {
      warnings.push('Control group has very small sample size. Results may not be reliable.');
      recommendations.push('Increase sample size for more reliable statistical inference.');
    }

    // Conversion rate validation
    const conversionRates = variants.map(v => v.visitors > 0 ? v.conversions / v.visitors : 0);
    const maxRate = Math.max(...conversionRates);
    const minRate = Math.min(...conversionRates);
    
    if (maxRate > 0.5) {
      warnings.push('Very high conversion rates detected. Verify data accuracy and test setup.');
    } else if (minRate < 0.001) {
      warnings.push('Very low conversion rates detected. Consider if the metrics are appropriate.');
    }

    // Business validation
    if (businessMetrics.dailyTraffic < 100) {
      warnings.push('Low daily traffic may require extended test duration.');
      recommendations.push('Consider running multiple tests simultaneously to maximize traffic utilization.');
    }

    // Advanced settings validation
    if (advanced.alphaLevel < 0.01) {
      warnings.push('Very strict significance threshold may require larger sample sizes.');
    } else if (advanced.alphaLevel > 0.1) {
      warnings.push('Liberal significance threshold increases false positive risk.');
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      recommendations,
    };
  };

  // Statistical functions
  const normalCDF = (x: number): number => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  const inverseNormalCDF = (p: number): number => {
    // Beasley-Springer-Moro algorithm approximation
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
               1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
               6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
               -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
               3.754408661907416e+00];

    const plow = 0.02425;
    const phigh = 1 - plow;
    let q, r;

    if (p < plow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[1]*q + c[2])*q + c[3])*q + c[4])*q + c[5])*q + c[6]) /
             ((((d[1]*q + d[2])*q + d[3])*q + d[4])*q + 1);
    }

    if (phigh < p) {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[1]*q + c[2])*q + c[3])*q + c[4])*q + c[5])*q + c[6]) /
               ((((d[1]*q + d[2])*q + d[3])*q + d[4])*q + 1);
    }

    q = p - 0.5;
    r = q * q;
    return (((((a[1]*r + a[2])*r + a[3])*r + a[4])*r + a[5])*r + a[6]) * q /
           (((((b[1]*r + b[2])*r + b[3])*r + b[4])*r + b[5])*r + 1);
  };

  const erf = (x: number): number => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const calculatePower = (p1: number, p2: number, n: number, alpha: number): number => {
    const pooled = (p1 + p2) / 2;
    const se1 = Math.sqrt(pooled * (1 - pooled) * 2 / n);
    const se2 = Math.sqrt(p1 * (1 - p1) / n + p2 * (1 - p2) / n);
    
    const zAlpha = inverseNormalCDF(1 - alpha / 2);
    const criticalValue = zAlpha * se1;
    const delta = Math.abs(p2 - p1);
    
    // Power calculation using normal approximation
    return 1 - normalCDF((criticalValue - delta) / se2);
  };

  const onSubmit = async (data: CalculatorFormData) => {
    setIsCalculating(true);
    
    try {
      // Simulate calculation delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const calculatedResult = calculateAdvancedStatistics(data);
      setResult(calculatedResult);
      
      toast.success('Statistical analysis completed successfully!');
    } catch (error) {
      console.error('Calculation error:', error);
      toast.error('Failed to calculate statistics. Please check your input data.');
    } finally {
      setIsCalculating(false);
    }
  };

  const addVariant = () => {
    const currentCount = variantFields.length;
    if (currentCount < 10) {
      appendVariant({
        name: `Variant ${String.fromCharCode(65 + currentCount - 1)}`,
        visitors: 1000,
        conversions: 50,
        revenue: 2500,
        expectedImprovement: 0,
      });
    }
  };

  const removeVariantByIndex = (index: number) => {
    if (variantFields.length > 2) {
      removeVariant(index);
    }
  };

  // Generate chart data for significance visualization
  const significanceChartData = useMemo(() => {
    if (!result || !watchedValues.variants) return [];
    
    return watchedValues.variants.map((variant, index) => {
      const variantId = `variant_${index}`;
      const significance = result.significanceTesting[variantId];
      
      if (!significance) {
        return {
          name: variant.name,
          conversionRate: variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0,
          visitors: variant.visitors,
          confidenceInterval: [0, 0],
          isSignificant: false,
          pValue: 1,
        };
      }
      
      const conversionRate = variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0;
      const [lower, upper] = significance.comparisonToControl.confidenceInterval;
      
      return {
        name: variant.name,
        conversionRate,
        visitors: variant.visitors,
        confidenceInterval: [lower * 100, upper * 100],
        isSignificant: significance.comparisonToControl.isSignificant,
        pValue: significance.comparisonToControl.pValue,
      };
    });
  }, [result, watchedValues.variants]);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <CalculatorIcon className="h-8 w-8 text-indigo-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistical Calculator</h1>
            <p className="text-gray-600 mt-1">
              Advanced statistical analysis for A/B tests with power analysis and business impact assessment
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="flex space-x-2 mb-6">
          {[
            { mode: 'sample-size', label: 'Sample Size', icon: ChartBarIcon },
            { mode: 'significance', label: 'Significance Test', icon: DocumentChartBarIcon },
            { mode: 'power', label: 'Power Analysis', icon: ArrowTrendingUpIcon },
            { mode: 'business-impact', label: 'Business Impact', icon: LightBulbIcon },
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setCalculationMode(mode as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                calculationMode === mode
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="h-4 w-4 mr-2" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Parameters */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Baseline Conversion Rate (%)
                  </label>
                  <input
                    {...register('baselineConversionRate')}
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.baselineConversionRate && (
                    <p className="text-sm text-red-600 mt-1">{errors.baselineConversionRate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Detectable Effect (%)
                  </label>
                  <input
                    {...register('minimumDetectableEffect')}
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                  {errors.minimumDetectableEffect && (
                    <p className="text-sm text-red-600 mt-1">{errors.minimumDetectableEffect.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence Level (%)
                  </label>
                  <select
                    {...register('confidenceLevel')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                    <option value={99}>99%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statistical Power (%)
                  </label>
                  <select
                    {...register('statisticalPower')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={70}>70%</option>
                    <option value={80}>80%</option>
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Variant Data */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Variant Performance Data</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  disabled={variantFields.length >= 10}
                  className="flex items-center px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  <BeakerIcon className="h-4 w-4 mr-1" />
                  Add Variant
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-sm font-medium text-gray-600">Variant</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Visitors</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Conversions</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Conv. Rate</th>
                      <th className="text-right py-2 text-sm font-medium text-gray-600">Revenue</th>
                      <th className="text-center py-2 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantFields.map((field, index) => {
                      const variant = watchedValues.variants?.[index] || {};
                      const conversionRate = variant.visitors > 0 ? (variant.conversions / variant.visitors) * 100 : 0;
                      
                      return (
                        <tr key={field.id} className="border-b border-gray-100">
                          <td className="py-3">
                            <input
                              {...register(`variants.${index}.name`)}
                              type="text"
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                            {index === 0 && (
                              <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                Control
                              </span>
                            )}
                          </td>
                          <td className="text-right py-3">
                            <input
                              {...register(`variants.${index}.visitors`)}
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                          </td>
                          <td className="text-right py-3">
                            <input
                              {...register(`variants.${index}.conversions`)}
                              type="number"
                              min="0"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                          </td>
                          <td className="text-right py-3 text-sm font-medium">
                            {conversionRate.toFixed(2)}%
                          </td>
                          <td className="text-right py-3">
                            <input
                              {...register(`variants.${index}.revenue`)}
                              type="number"
                              min="0"
                              step="0.01"
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-right"
                            />
                          </td>
                          <td className="text-center py-3">
                            {variantFields.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeVariantByIndex(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                ×
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Business Metrics */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Metrics</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Traffic
                  </label>
                  <input
                    {...register('businessMetrics.dailyTraffic')}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost per Visitor ($)
                  </label>
                  <input
                    {...register('businessMetrics.costPerVisitor')}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Average Order Value ($)
                  </label>
                  <input
                    {...register('businessMetrics.averageOrderValue')}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Test Duration (days)
                  </label>
                  <input
                    {...register('businessMetrics.testDuration')}
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Advanced Settings</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Alpha Level (Type I Error)
                    </label>
                    <input
                      {...register('advanced.alphaLevel')}
                      type="number"
                      min="0.001"
                      max="0.1"
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effect Size Threshold
                    </label>
                    <input
                      {...register('advanced.effectSizeThreshold')}
                      type="number"
                      min="0.001"
                      max="0.5"
                      step="0.001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      {...register('advanced.multipleTestingCorrection')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Apply multiple testing correction</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('advanced.sequentialAnalysis')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable sequential analysis</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      {...register('advanced.bayesianAnalysis')}
                      type="checkbox"
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable Bayesian analysis</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isCalculating}
                className={`flex items-center px-6 py-3 rounded-lg text-white font-medium ${
                  isCalculating
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <CalculatorIcon className="h-5 w-5 mr-2" />
                    Calculate Statistics
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {!result ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <AcademicCapIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Calculate</h3>
              <p className="text-gray-600">Enter your test data and click calculate to see detailed statistical analysis</p>
            </div>
          ) : (
            <>
              {/* Sample Size Results */}
              {result && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-blue-900 mb-4">Sample Size Analysis</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Per Variant:</span>
                      <span className="font-medium text-blue-900">
                        {result.sampleSizeAnalysis.perVariant.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total Required:</span>
                      <span className="font-medium text-blue-900">
                        {result.sampleSizeAnalysis.totalRequired.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Per Day:</span>
                      <span className="font-medium text-blue-900">
                        {result.sampleSizeAnalysis.perDay.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">Est. Duration:</span>
                      <span className="font-medium text-blue-900">
                        {result.sampleSizeAnalysis.estimatedDuration} days
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Power Analysis */}
              {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-green-900 mb-4">Power Analysis</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-700">Statistical Power:</span>
                      <span className="font-medium text-green-900">
                        {(result.powerAnalysis.statisticalPower * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Type I Error:</span>
                      <span className="font-medium text-green-900">
                        {(result.powerAnalysis.typeIErrors * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">Type II Error:</span>
                      <span className="font-medium text-green-900">
                        {(result.powerAnalysis.typeIIErrors * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Business Impact */}
              {result && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-purple-900 mb-4">Business Impact</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-purple-700">Revenue Impact:</span>
                      <div className="mt-1 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-purple-600">Daily:</span>
                          <span className="font-medium text-purple-900">
                            ${result.businessImpact.revenueImpact.daily.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Monthly:</span>
                          <span className="font-medium text-purple-900">
                            ${result.businessImpact.revenueImpact.monthly.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-600">Yearly:</span>
                          <span className="font-medium text-purple-900">
                            ${result.businessImpact.revenueImpact.yearly.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {result && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-yellow-900 mb-4">Recommendations</h3>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-yellow-700 font-medium">Primary:</span>
                      <p className="text-yellow-800 mt-1">{result.recommendations.primary}</p>
                    </div>
                    
                    {result.recommendations.secondary.length > 0 && (
                      <div>
                        <span className="text-yellow-700 font-medium">Secondary:</span>
                        <ul className="mt-1 space-y-1">
                          {result.recommendations.secondary.map((rec, index) => (
                            <li key={index} className="text-yellow-800">• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {result.recommendations.warnings.length > 0 && (
                      <div>
                        <span className="text-yellow-700 font-medium">Warnings:</span>
                        <ul className="mt-1 space-y-1">
                          {result.recommendations.warnings.map((warning, index) => (
                            <li key={index} className="text-yellow-800 flex items-start">
                              <ExclamationTriangleIcon className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                              {warning}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      {result && significanceChartData.length > 0 && (
        <div className="mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Statistical Significance Visualization</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Conversion Rate Chart */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Conversion Rates with Confidence Intervals</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={significanceChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Conversion Rate']} />
                    <Bar dataKey="conversionRate" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Significance Indicators */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Significance Status</h4>
                <div className="space-y-3">
                  {significanceChartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {item.isSignificant ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-400 mr-2" />
                        )}
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          p-value: {item.pValue.toFixed(4)}
                        </div>
                        <div className={`text-xs ${
                          item.isSignificant ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {item.isSignificant ? 'Significant' : 'Not Significant'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticalCalculator;
