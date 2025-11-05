import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}

export function formatPercentage(value: number, decimals = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function calculateConversionRate(conversions: number, total: number): number {
  if (total === 0) return 0;
  return conversions / total;
}

export function calculateLift(control: number, variant: number): number {
  if (control === 0) return 0;
  return (variant - control) / control;
}

export function calculateStatisticalSignificance(
  conversions: number,
  visitors: number,
  baselineConversions: number,
  baselineVisitors: number,
  alpha = 0.05
): { isSignificant: boolean; pValue: number; confidence: number } {
  // Two-proportion z-test
  const p1 = conversions / visitors;
  const p2 = baselineConversions / baselineVisitors;
  const pPooled = (conversions + baselineConversions) / (visitors + baselineVisitors);
  
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1/visitors + 1/baselineVisitors));
  const z = (p1 - p2) / se;
  
  // Calculate p-value (two-tailed test)
  const pValue = 2 * (1 - normalCDF(Math.abs(z)));
  const isSignificant = pValue < alpha;
  
  // Calculate confidence (1 - alpha)
  const confidence = (1 - alpha) * 100;
  
  return { isSignificant, pValue, confidence };
}

function normalCDF(x: number): number {
  return (1 + erf(x / Math.sqrt(2))) / 2;
}

function erf(x: number): number {
  // Approximation of the error function
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
}

export function calculateRequiredSampleSize(
  baselineRate: number,
  minimumDetectableEffect: number,
  alpha = 0.05,
  power = 0.8
): number {
  // Two-proportion test sample size calculation
  const p1 = baselineRate;
  const p2 = baselineRate * (1 + minimumDetectableEffect);
  
  const zAlpha = getZScore(1 - alpha / 2);
  const zBeta = getZScore(power);
  
  const pBar = (p1 + p2) / 2;
  const qBar = 1 - pBar;
  
  const numerator = Math.pow(
    zAlpha * Math.sqrt(2 * pBar * qBar) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
    2
  );
  
  const denominator = Math.pow(p1 - p2, 2);
  
  return Math.ceil(numerator / denominator);
}

function getZScore(probability: number): number {
  // Inverse normal distribution approximation
  const a = -39.69683028665376;
  const b = 220.9460984245205;
  const c = -275.9285104469687;
  const d = 138.3577518672690;
  const e = -30.66479806614716;
  const f = 2.506628277459239;
  
  const p = probability;
  let q, r;
  
  if (p < 0.02425) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((a * q + b) * q + c) * q + d) * q + e) * q + f) /
           ((((b * q + c) * q + d) * q + e) * q + 1);
  } else if (p > 1 - 0.02425) {
    q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((a * q + b) * q + c) * q + d) * q + e) * q + f) /
             ((((b * q + c) * q + d) * q + e) * q + 1);
  } else {
    q = p - 0.5;
    r = q * q;
    return (((((a * r + b) * r + c) * r + d) * r + e) * q + f) /
           ((((b * r + c) * r + d) * r + e) * r + 1);
  }
}

export function calculateROI(
  totalRevenue: number,
  totalInvestment: number,
  timeframe: number = 365
): number {
  if (totalInvestment === 0) return 0;
  return ((totalRevenue - totalInvestment) / totalInvestment) * 100;
}

export function calculatePaybackPeriod(
  totalInvestment: number,
  monthlyRevenue: number
): number {
  if (monthlyRevenue === 0) return Infinity;
  return totalInvestment / monthlyRevenue;
}

export function calculateCLV(
  averageRevenuePerUser: number,
  averageCustomerLifespan: number,
  profitMargin: number = 0.8
): number {
  return averageRevenuePerUser * averageCustomerLifespan * profitMargin;
}

export function generateTimeSeries(
  startDate: Date,
  endDate: Date,
  interval: 'hour' | 'day' | 'week' | 'month' = 'day'
): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    dates.push(new Date(current));
    
    switch (interval) {
      case 'hour':
        current.setHours(current.getHours() + 1);
        break;
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
    }
  }
  
  return dates;
}

export function aggregateByInterval<T>(
  data: (T & { timestamp: Date })[],
  interval: 'hour' | 'day' | 'week' | 'month' = 'day',
  aggregator: (items: T[]) => any = (items: T[]) => items.length
): { date: Date; value: any }[] {
  if (data.length === 0) return [];
  
  const grouped = new Map<string, T[]>();
  
  data.forEach(item => {
    const date = new Date(item.timestamp);
    let key: string;
    
    switch (interval) {
      case 'hour':
        date.setMinutes(0, 0, 0);
        key = date.toISOString();
        break;
      case 'day':
        date.setHours(0, 0, 0, 0);
        key = date.toISOString().split('T')[0];
        break;
      case 'week':
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek;
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        key = date.toISOString().split('T')[0];
        break;
      case 'month':
        date.setDate(1);
        date.setHours(0, 0, 0, 0);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  return Array.from(grouped.entries()).map(([key, items]) => ({
    date: new Date(key),
    value: aggregator(items)
  })).sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function calculateCohortRetention(
  cohorts: { startDate: Date; users: string[] }[],
  retentionPeriods: number[] = [1, 7, 30, 90, 180, 365]
): { cohort: Date; period: number; retentionRate: number }[] {
  const retentionData: { cohort: Date; period: number; retentionRate: number }[] = [];
  
  cohorts.forEach(cohort => {
    retentionPeriods.forEach(period => {
      const periodEnd = new Date(cohort.startDate);
      periodEnd.setDate(periodEnd.getDate() + period);
      
      // Simulate retention calculation (in real implementation, this would query actual data)
      const retentionRate = Math.max(0, 1 - (period / 365) * 0.3); // Exponential decay
      
      retentionData.push({
        cohort: cohort.startDate,
        period,
        retentionRate
      });
    });
  });
  
  return retentionData;
}

export function getConversionStage(value: number, thresholds: [number, number, number, number]): 
  'very_low' | 'low' | 'medium' | 'high' | 'very_high' {
  if (value <= thresholds[0]) return 'very_low';
  if (value <= thresholds[1]) return 'low';
  if (value <= thresholds[2]) return 'medium';
  if (value <= thresholds[3]) return 'high';
  return 'very_high';
}

export function interpolateColor(stage: string): string {
  const colors = {
    very_low: '#ef4444', // red-500
    low: '#f97316',      // orange-500
    medium: '#eab308',   // yellow-500
    high: '#22c55e',     // green-500
    very_high: '#16a34a' // green-600
  };
  
  return colors[stage as keyof typeof colors] || colors.medium;
}

export function validateMetricValue(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}