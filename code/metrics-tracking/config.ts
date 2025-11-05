/**
 * Configuration for Metrics Tracking System
 * Customize these settings for your environment
 */

export interface MetricsConfig {
  // API Configuration
  api: {
    baseUrl: string;
    endpoints: {
      events: string;
      metrics: string;
      funnels: string;
      abTests: string;
      performance: string;
    };
    timeout: number;
    retries: number;
  };

  // Event Tracking Configuration
  tracking: {
    bufferSize: number;
    flushInterval: number;
    sessionTimeout: number;
    trackPageViews: boolean;
    trackErrors: boolean;
    trackPerformance: boolean;
    debug: boolean;
  };

  // Dashboard Configuration
  dashboard: {
    refreshInterval: number;
    defaultWidgets: string[];
    theme: 'light' | 'dark' | 'auto';
    maxWidgetCount: number;
  };

  // Reporting Configuration
  reporting: {
    enabled: boolean;
    defaultFormat: 'pdf' | 'excel' | 'csv' | 'json';
    storagePath: string;
    retentionDays: number;
    emailEnabled: boolean;
  };

  // Performance Monitoring
  performance: {
    collectWebVitals: boolean;
    trackUserInteractions: boolean;
    monitorApiCalls: boolean;
    alertThresholds: {
      pageLoadTime: number; // milliseconds
      apiResponseTime: number; // milliseconds
      errorRate: number; // percentage
    };
  };

  // Funnel Configuration
  funnels: {
    enabled: string[];
    customFunnels: Array<{
      id: string;
      name: string;
      steps: Array<{
        eventType: string;
        required: boolean;
        timeLimit?: number;
      }>;
    }>;
  };

  // A/B Testing Configuration
  abTesting: {
    enabled: boolean;
    statisticalSignificance: number; // 0.95 for 95% confidence
    minSampleSize: number;
    maxTestDuration: number; // days
  };

  // Privacy and Compliance
  privacy: {
    anonymizeUserIds: boolean;
    trackIpAddresses: boolean;
    trackUserAgent: boolean;
    gdprCompliant: boolean;
    dataRetentionDays: number;
  };
}

// Default configuration
export const defaultConfig: MetricsConfig = {
  api: {
    baseUrl: process.env.METRICS_API_URL || 'http://localhost:3000',
    endpoints: {
      events: '/api/analytics/events',
      metrics: '/api/analytics/metrics',
      funnels: '/api/analytics/funnels',
      abTests: '/api/analytics/ab-tests',
      performance: '/api/analytics/performance',
    },
    timeout: 10000,
    retries: 3,
  },

  tracking: {
    bufferSize: 100,
    flushInterval: 5000, // 5 seconds
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    trackPageViews: true,
    trackErrors: true,
    trackPerformance: true,
    debug: process.env.NODE_ENV === 'development',
  },

  dashboard: {
    refreshInterval: 60000, // 1 minute
    defaultWidgets: [
      'freeToProConversion',
      'onboardingCompletion',
      'dailyActiveUsers',
      'revenue',
      'conversionFunnel',
      'abTestResults',
      'userEngagement',
    ],
    theme: 'auto',
    maxWidgetCount: 20,
  },

  reporting: {
    enabled: true,
    defaultFormat: 'pdf',
    storagePath: './reports',
    retentionDays: 90,
    emailEnabled: true,
  },

  performance: {
    collectWebVitals: true,
    trackUserInteractions: true,
    monitorApiCalls: true,
    alertThresholds: {
      pageLoadTime: 3000, // 3 seconds
      apiResponseTime: 1000, // 1 second
      errorRate: 0.05, // 5%
    },
  },

  funnels: {
    enabled: [
      'free-to-pro-conversion',
      'onboarding-completion',
      'feature-adoption',
    ],
    customFunnels: [
      {
        id: 'premium-feature-adoption',
        name: 'Premium Feature Adoption',
        steps: [
          {
            eventType: 'feature_use',
            required: true,
            timeLimit: 600, // 10 minutes
          },
          {
            eventType: 'feature_engagement',
            required: true,
          },
        ],
      },
    ],
  },

  abTesting: {
    enabled: true,
    statisticalSignificance: 0.95,
    minSampleSize: 100,
    maxTestDuration: 30, // days
  },

  privacy: {
    anonymizeUserIds: true,
    trackIpAddresses: false,
    trackUserAgent: false,
    gdprCompliant: true,
    dataRetentionDays: 365,
  },
};

// Environment-specific configurations
export const environments = {
  development: {
    ...defaultConfig,
    tracking: {
      ...defaultConfig.tracking,
      debug: true,
      bufferSize: 50,
      flushInterval: 2000,
    },
    reporting: {
      ...defaultConfig.reporting,
      storagePath: './dev-reports',
    },
  },

  staging: {
    ...defaultConfig,
    tracking: {
      ...defaultConfig.tracking,
      debug: true,
    },
    privacy: {
      ...defaultConfig.privacy,
      anonymizeUserIds: true,
      gdprCompliant: true,
    },
  },

  production: {
    ...defaultConfig,
    tracking: {
      ...defaultConfig.tracking,
      debug: false,
      bufferSize: 200,
      flushInterval: 10000,
    },
    dashboard: {
      ...defaultConfig.dashboard,
      refreshInterval: 30000, // 30 seconds
    },
  },
};

// Helper function to get configuration for current environment
export const getConfig = (environment?: string): MetricsConfig => {
  const env = environment || process.env.NODE_ENV || 'development';
  return environments[env as keyof typeof environments] || defaultConfig;
};

// Helper function to update configuration
export const updateConfig = (updates: Partial<MetricsConfig>): MetricsConfig => {
  const currentConfig = getConfig();
  return {
    ...currentConfig,
    ...updates,
    // Deep merge for nested objects
    api: { ...currentConfig.api, ...updates.api },
    tracking: { ...currentConfig.tracking, ...updates.tracking },
    dashboard: { ...currentConfig.dashboard, ...updates.dashboard },
    reporting: { ...currentConfig.reporting, ...updates.reporting },
    performance: { ...currentConfig.performance, ...updates.performance },
    funnels: { ...currentConfig.funnels, ...updates.funnels },
    abTesting: { ...currentConfig.abTesting, ...updates.abTesting },
    privacy: { ...currentConfig.privacy, ...updates.privacy },
  };
};

// Environment variable mapping
export const envVars = {
  METRICS_API_URL: 'api.baseUrl',
  METRICS_API_TIMEOUT: 'api.timeout',
  METRICS_BUFFER_SIZE: 'tracking.bufferSize',
  METRICS_FLUSH_INTERVAL: 'tracking.flushInterval',
  METRICS_DEBUG: 'tracking.debug',
  METRICS_REFRESH_INTERVAL: 'dashboard.refreshInterval',
  METRICS_REPORTING_ENABLED: 'reporting.enabled',
  METRICS_EMAIL_ENABLED: 'reporting.emailEnabled',
};

// Function to load configuration from environment variables
export const loadConfigFromEnv = (): MetricsConfig => {
  const config = getConfig();
  
  Object.entries(envVars).forEach(([envVar, configPath]) => {
    const value = process.env[envVar];
    if (value !== undefined) {
      const pathParts = configPath.split('.');
      let current: any = config;
      
      // Navigate to the parent object
      for (let i = 0; i < pathParts.length - 1; i++) {
        if (!current[pathParts[i]]) {
          current[pathParts[i]] = {};
        }
        current = current[pathParts[i]];
      }
      
      // Set the value (with type conversion)
      const key = pathParts[pathParts.length - 1];
      const convertedValue = convertEnvValue(value);
      current[key] = convertedValue;
    }
  });
  
  return config;
};

// Helper function to convert environment variable values
const convertEnvValue = (value: string): any => {
  // Boolean conversion
  if (value.toLowerCase() === 'true') return true;
  if (value.toLowerCase() === 'false') return false;
  
  // Number conversion
  if (!isNaN(Number(value))) return Number(value);
  
  // Return as string if no conversion applies
  return value;
};

// Configuration validation
export const validateConfig = (config: MetricsConfig): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate API configuration
  if (!config.api.baseUrl) {
    errors.push('API base URL is required');
  }
  
  if (config.api.timeout < 1000) {
    errors.push('API timeout should be at least 1000ms');
  }
  
  // Validate tracking configuration
  if (config.tracking.bufferSize < 10) {
    errors.push('Buffer size should be at least 10');
  }
  
  if (config.tracking.flushInterval < 1000) {
    errors.push('Flush interval should be at least 1000ms');
  }
  
  // Validate performance thresholds
  if (config.performance.alertThresholds.pageLoadTime < 1000) {
    errors.push('Page load time threshold should be at least 1000ms');
  }
  
  if (config.performance.alertThresholds.apiResponseTime < 100) {
    errors.push('API response time threshold should be at least 100ms');
  }
  
  // Validate privacy settings
  if (config.privacy.dataRetentionDays < 1) {
    errors.push('Data retention days should be at least 1');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
};

// Default export
export default defaultConfig;