// Example configuration for Conversion Validation Framework
// Copy this file to config.ts and customize for your needs

import { EventTrackingConfig, ExperimentConfig, SegmentCriteria } from './src/types/analytics';

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.VITE_API_BASE_URL || 'https://api.example.com',
  apiKey: process.env.VITE_API_KEY || 'your-api-key',
  timeout: 10000,
  retries: 3,
  endpoints: {
    events: '/api/analytics/events',
    users: '/api/analytics/users',
    abTests: '/api/ab-tests',
    conversions: '/api/analytics/conversions',
    roi: '/api/analytics/roi',
    segments: '/api/analytics/segments'
  }
};

// Analytics Configuration
export const ANALYTICS_CONFIG = {
  // Event tracking settings
  tracking: {
    enabled: process.env.VITE_ANALYTICS_ENABLED === 'true',
    batchSize: 50,
    flushInterval: 30000, // 30 seconds
    anonymizeIP: true,
    respectDoNotTrack: true,
    capturePageViews: true,
    captureClicks: true,
    captureFormSubmissions: true
  } as EventTrackingConfig,

  // Data refresh intervals (in milliseconds)
  refreshIntervals: {
    realTimeMetrics: 5000,      // 5 seconds
    conversionData: 30000,      // 30 seconds
    abTestResults: 60000,       // 1 minute
    roiAnalysis: 300000,        // 5 minutes
    userBehavior: 180000,       // 3 minutes
    successCriteria: 300000     // 5 minutes
  },

  // Data retention policies
  dataRetention: {
    events: 90,        // days
    abTests: 365,      // days
    behaviorData: 30,  // days
    roiData: 730       // days
  }
};

// A/B Testing Configuration
export const AB_TEST_CONFIG = {
  enabled: process.env.VITE_AB_TESTING_ENABLED === 'true',
  defaultSignificanceLevel: 0.05,
  minimumTestDuration: 7, // days
  maximumConcurrentTests: 10,
  trafficAllocation: {
    minimum: 5,        // minimum % traffic per variant
    maximum: 95        // maximum % traffic per variant
  },
  autoStop: {
    enabled: true,
    maxDuration: 90,   // days
    significanceThreshold: 0.01
  }
} as ExperimentConfig;

// User Segmentation Configuration
export const SEGMENTATION_CONFIG = {
  // Predefined segments
  predefinedSegments: [
    {
      id: 'high_intent',
      name: 'High Intent Users',
      criteria: {
        behavior: {
          sessionDuration: '> 15 minutes',
          pagesVisited: '> 5',
          featuresUsed: '> 3',
          returnVisits: '> 2'
        }
      } as SegmentCriteria
    },
    {
      id: 'social_referrals',
      name: 'Social Media Referrals',
      criteria: {
        acquisition: {
          source: 'social_media',
          utm_campaign: /summer|launch|promo/i
        }
      } as SegmentCriteria
    },
    {
      id: 'mobile_users',
      name: 'Mobile Users',
      criteria: {
        demographics: {
          device_type: 'mobile'
        }
      } as SegmentCriteria
    },
    {
      id: 'enterprise',
      name: 'Enterprise Users',
      criteria: {
        demographics: {
          company_size: '> 100',
          industry: ['technology', 'finance', 'healthcare']
        }
      } as SegmentCriteria
    }
  ],

  // Dynamic segment rules
  dynamicSegments: {
    recentSignups: {
      condition: 'days_since_signup <= 7',
      autoUpdate: true
    },
    powerUsers: {
      condition: 'feature_usage_score >= 8',
      autoUpdate: true
    },
    atRisk: {
      condition: 'days_inactive >= 14 AND conversion_status = "free"',
      autoUpdate: true
    }
  }
};

// Conversion Funnel Configuration
export const FUNNEL_CONFIG = {
  // Standard conversion funnel steps
  steps: [
    {
      name: 'Landing Page Visit',
      event: 'page_view',
      page: '/landing',
      required: true
    },
    {
      name: 'Signup Started',
      event: 'signup_started',
      required: true
    },
    {
      name: 'Account Created',
      event: 'account_created',
      required: true
    },
    {
      name: 'Onboarding Started',
      event: 'onboarding_started',
      required: false
    },
    {
      name: 'Onboarding Complete',
      event: 'onboarding_completed',
      required: false
    },
    {
      name: 'First Feature Use',
      event: 'feature_used',
      required: false
    },
    {
      name: 'Trial Started',
      event: 'trial_started',
      required: false
    },
    {
      name: 'Upgrade Intent',
      event: 'upgrade_clicked',
      required: false
    },
    {
      name: 'Payment Started',
      event: 'payment_started',
      required: false
    },
    {
      name: 'Payment Complete',
      event: 'payment_completed',
      required: false
    }
  ],

  // Custom funnel variations
  variations: {
    mobile: {
      name: 'Mobile Conversion Funnel',
      steps: ['landing_page', 'signup', 'mobile_onboarding', 'feature_trial', 'mobile_upgrade', 'payment']
    },
    enterprise: {
      name: 'Enterprise Conversion Funnel',
      steps: ['demo_request', 'demo_completed', 'sales_contact', 'proposal', 'contract', 'implementation']
    }
  }
};

// Success Criteria Configuration
export const SUCCESS_CRITERIA_CONFIG = {
  // Default success criteria
  defaultCriteria: [
    {
      name: 'Trial Conversion Rate',
      metric: 'trial_conversion_rate',
      targetValue: 20,
      operator: '>=',
      timeframe: 30,
      priority: 'critical',
      automatedCheck: true
    },
    {
      name: 'Onboarding Completion Rate',
      metric: 'onboarding_completion_rate',
      targetValue: 70,
      operator: '>=',
      timeframe: 14,
      priority: 'high',
      automatedCheck: true
    },
    {
      name: 'Feature Adoption Rate',
      metric: 'feature_adoption_rate',
      targetValue: 60,
      operator: '>=',
      timeframe: 30,
      priority: 'medium',
      automatedCheck: false
    },
    {
      name: 'Customer Churn Rate',
      metric: 'monthly_churn_rate',
      targetValue: 5,
      operator: '<=',
      timeframe: 30,
      priority: 'high',
      automatedCheck: true
    }
  ],

  // Alert thresholds
  alertThresholds: {
    critical: {
      conversionRateDrop: 10,    // % decrease triggers critical alert
      timeToAlert: 3600000       // 1 hour in milliseconds
    },
    warning: {
      conversionRateDrop: 5,     // % decrease triggers warning
      timeToAlert: 7200000       // 2 hours in milliseconds
    }
  }
};

// ROI Calculation Configuration
export const ROI_CONFIG = {
  // Cost categories
  costCategories: [
    'Development',
    'Marketing',
    'Infrastructure',
    'Customer Support',
    'Sales',
    'Operations'
  ],

  // Revenue streams
  revenueStreams: [
    'Subscription Revenue',
    'One-time Purchases',
    'Add-on Features',
    'Professional Services'
  ],

  // Calculation periods
  calculationPeriods: {
    daily: 1,
    weekly: 7,
    monthly: 30,
    quarterly: 90,
    yearly: 365
  },

  // Default assumptions
  assumptions: {
    discountRate: 0.1,      // 10% annual discount rate
    customerLifespan: 24,   // months
    operationalCosts: 0.2,  // 20% of revenue
    growthRate: 0.15        // 15% monthly growth
  }
};

// Notification Configuration
export const NOTIFICATION_CONFIG = {
  // Email notifications
  email: {
    enabled: true,
    smtpConfig: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    },
    recipients: {
      admin: 'admin@example.com',
      team: 'team@example.com',
      stakeholders: 'stakeholders@example.com'
    }
  },

  // Slack notifications
  slack: {
    enabled: process.env.SLACK_WEBHOOK_URL ? true : false,
    webhookUrl: process.env.SLACK_WEBHOOK_URL,
    channels: {
      alerts: '#conversion-alerts',
      reports: '#conversion-reports'
    }
  },

  // Webhook notifications
  webhooks: {
    enabled: true,
    endpoints: [
      {
        url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
        events: ['success_criteria_met', 'success_criteria_failed', 'ab_test_significant']
      }
    ]
  }
};

// UI Configuration
export const UI_CONFIG = {
  // Theme settings
  theme: {
    default: 'light',
    allowToggle: true,
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    }
  },

  // Dashboard layout
  dashboard: {
    defaultLayout: 'grid',
    availableWidgets: [
      'conversion-metrics',
      'funnel-analysis',
      'user-behavior',
      'ab-test-results',
      'success-criteria',
      'roi-analysis',
      'trend-charts',
      'segment-analysis'
    ],
    maxWidgetsPerPage: 8
  },

  // Chart settings
  charts: {
    defaultColors: [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
      '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'
    ],
    animationDuration: 750,
    responsive: true,
    exportFormats: ['png', 'svg', 'pdf']
  }
};

// Feature Flags
export const FEATURE_FLAGS = {
  realTimeUpdates: process.env.VITE_ENABLE_REAL_TIME === 'true',
  advancedSegmentation: process.env.VITE_ENABLE_SEGMENTS === 'true',
  predictiveAnalytics: process.env.VITE_ENABLE_PREDICTIONS === 'true',
  advancedExport: process.env.VITE_ENABLE_EXPORT === 'true',
  customDashboards: process.env.VITE_ENABLE_CUSTOM_DASHBOARDS === 'true',
  apiIntegration: process.env.VITE_ENABLE_API === 'true'
};

// Environment-specific configurations
export const getEnvironmentConfig = (environment: string) => {
  const configs = {
    development: {
      debug: true,
      mockData: true,
      realTimeUpdates: true,
      showErrors: true
    },
    staging: {
      debug: false,
      mockData: false,
      realTimeUpdates: true,
      showErrors: true
    },
    production: {
      debug: false,
      mockData: false,
      realTimeUpdates: true,
      showErrors: false
    }
  };

  return configs[environment as keyof typeof configs] || configs.development;
};

// Export all configurations
export const config = {
  api: API_CONFIG,
  analytics: ANALYTICS_CONFIG,
  abTesting: AB_TEST_CONFIG,
  segmentation: SEGMENTATION_CONFIG,
  funnel: FUNNEL_CONFIG,
  successCriteria: SUCCESS_CRITERIA_CONFIG,
  roi: ROI_CONFIG,
  notifications: NOTIFICATION_CONFIG,
  ui: UI_CONFIG,
  features: FEATURE_FLAGS
};

export default config;