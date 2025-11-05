// Analytics Validation System Configuration
import { ValidationConfig } from '../types/validation-types';

export const validationConfig: ValidationConfig = {
  eventTracking: {
    enabled: true,
    sampleSize: 1000,
    requiredEvents: [
      'page_view',
      'user_signup',
      'user_login',
      'onboarding_start',
      'onboarding_complete',
      'feature_use',
      'feature_engagement',
      'upgrade_attempt',
      'upgrade_success',
      'upgrade_failure'
    ],
    validationInterval: 300, // 5 minutes
    errorThreshold: 5, // 5%
    duplicateDetection: true,
    timestampTolerance: 60000 // 1 minute
  },
  
  abTesting: {
    enabled: true,
    minimumSampleSize: 100,
    confidenceLevel: 0.95,
    statisticalPower: 0.8,
    maxPValue: 0.05,
    sampleRatioMismatch: {
      enabled: true,
      threshold: 10 // 10% deviation
    },
    effectSize: {
      minimum: 0.01, // 1% minimum effect size
      maximum: 1.0 // 100% maximum effect size
    },
    validationInterval: 600 // 10 minutes
  },
  
  conversionFunnels: {
    enabled: true,
    minimumUsersPerStep: 10,
    maxDropOffRate: 80, // 80% maximum drop-off rate
    validationInterval: 900, // 15 minutes
    segmentBreakdown: true,
    timeWindow: 24, // 24 hours
    requiredSteps: [
      'start',
      'engagement',
      'conversion'
    ]
  },
  
  performanceMetrics: {
    enabled: true,
    alertThresholds: {
      pageLoadTime: 3000, // 3 seconds
      apiResponseTime: 1000, // 1 second
      errorRate: 5, // 5%
      memoryUsage: 80, // 80%
      cpuUsage: 70 // 70%
    },
    validationInterval: 60, // 1 minute
    slackNotifications: true,
    emailNotifications: true
  },
  
  realtimeDashboards: {
    enabled: true,
    refreshInterval: 30, // 30 seconds
    dataConsistencyChecks: true,
    cacheValidation: true,
    alertOnStaleData: true,
    staleDataThreshold: 10 // 10 minutes
  }
};

// Environment-specific configurations
export const developmentConfig: ValidationConfig = {
  ...validationConfig,
  eventTracking: {
    ...validationConfig.eventTracking,
    sampleSize: 100, // Smaller sample for dev
    validationInterval: 60 // 1 minute in dev
  },
  abTesting: {
    ...validationConfig.abTesting,
    minimumSampleSize: 20, // Smaller sample for dev
    validationInterval: 120 // 2 minutes in dev
  },
  performanceMetrics: {
    ...validationConfig.performanceMetrics,
    alertThresholds: {
      pageLoadTime: 5000, // More lenient in dev
      apiResponseTime: 2000,
      errorRate: 10,
      memoryUsage: 90,
      cpuUsage: 80
    }
  }
};

export const stagingConfig: ValidationConfig = {
  ...validationConfig,
  eventTracking: {
    ...validationConfig.eventTracking,
    sampleSize: 500
  },
  abTesting: {
    ...validationConfig.abTesting,
    minimumSampleSize: 50
  }
};

export const productionConfig: ValidationConfig = validationConfig;

// Configuration manager
export class ValidationConfigManager {
  private static instance: ValidationConfigManager;
  private config: ValidationConfig;

  private constructor() {
    this.config = this.getEnvironmentConfig();
  }

  public static getInstance(): ValidationConfigManager {
    if (!ValidationConfigManager.instance) {
      ValidationConfigManager.instance = new ValidationConfigManager();
    }
    return ValidationConfigManager.instance;
  }

  private getEnvironmentConfig(): ValidationConfig {
    const env = process.env.NODE_ENV || 'development';
    
    switch (env) {
      case 'production':
        return productionConfig;
      case 'staging':
        return stagingConfig;
      case 'development':
      default:
        return developmentConfig;
    }
  }

  public getConfig(): ValidationConfig {
    return this.config;
  }

  public updateConfig(updates: Partial<ValidationConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getEventTrackingConfig() {
    return this.config.eventTracking;
  }

  public getABTestingConfig() {
    return this.config.abTesting;
  }

  public getConversionFunnelConfig() {
    return this.config.conversionFunnels;
  }

  public getPerformanceConfig() {
    return this.config.performanceMetrics;
  }

  public getDashboardConfig() {
    return this.config.realtimeDashboards;
  }

  public isEnabled(type: keyof ValidationConfig): boolean {
    return this.config[type].enabled;
  }

  public setEnabled(type: keyof ValidationConfig, enabled: boolean): void {
    this.config[type].enabled = enabled;
  }
}

export default ValidationConfigManager;
