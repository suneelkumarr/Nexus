import {
  ConversionEvent,
  ConversionFunnel,
  UserBehaviorMetrics,
  ABTestResult,
  ABTestVariant,
  ROIAnalysis,
  SuccessCriteria,
  ConversionInsights,
  SegmentAnalysis,
  ConversionGoal
} from '../types/analytics';

export class ConversionDataService {
  private static instance: ConversionDataService;

  static getInstance(): ConversionDataService {
    if (!ConversionDataService.instance) {
      ConversionDataService.instance = new ConversionDataService();
    }
    return ConversionDataService.instance;
  }

  // Mock data generation for demo purposes
  generateMockConversionEvents(count: number = 1000): ConversionEvent[] {
    const events: ConversionEvent[] = [];
    const eventTypes: ConversionEvent['eventType'][] = [
      'onboarding_start', 'onboarding_complete', 'feature_view', 'feature_use',
      'upgrade_prompt_view', 'upgrade_prompt_click', 'upgrade_completion',
      'checkout_start', 'payment_complete', 'trial_start', 'trial_end'
    ];

    for (let i = 0; i < count; i++) {
      const event: ConversionEvent = {
        id: `event_${i + 1}`,
        userId: `user_${Math.floor(Math.random() * 500) + 1}`,
        sessionId: `session_${Math.floor(Math.random() * 200) + 1}`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
        metadata: {
          page: `/page/${Math.floor(Math.random() * 20) + 1}`,
          source: ['direct', 'social', 'email', 'search', 'referral'][Math.floor(Math.random() * 5)],
          device: ['desktop', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          campaign: Math.random() > 0.8 ? `campaign_${Math.floor(Math.random() * 5) + 1}` : undefined
        },
        abTestVariant: Math.random() > 0.7 ? ['control', 'variant_a', 'variant_b'][Math.floor(Math.random() * 3)] : undefined,
        source: ['web', 'mobile_app', 'api'][Math.floor(Math.random() * 3)]
      };
      events.push(event);
    }

    return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  generateMockFunnel(): ConversionFunnel {
    const steps = [
      { name: 'Landing Page Visit', order: 1 },
      { name: 'Onboarding Start', order: 2 },
      { name: 'Account Creation', order: 3 },
      { name: 'Onboarding Complete', order: 4 },
      { name: 'Feature Trial', order: 5 },
      { name: 'Upgrade Prompt View', order: 6 },
      { name: 'Upgrade Click', order: 7 },
      { name: 'Checkout Start', order: 8 },
      { name: 'Payment Complete', order: 9 }
    ];

    let previousUsers = 10000;
    const funnelSteps = steps.map((step, index) => {
      const dropoffRate = index === 0 ? 0 : Math.random() * 0.3 + 0.1; // 10-40% dropoff
      const users = index === 0 
        ? previousUsers 
        : Math.floor(previousUsers * (1 - dropoffRate));
      const conversionRate = index === 0 ? 1 : users / 10000;

      const funnelStep = {
        id: `step_${index + 1}`,
        name: step.name,
        description: `${step.name} in conversion funnel`,
        order: step.order,
        users,
        conversionRate,
        dropoffRate: index === 0 ? 0 : dropoffRate,
        averageTimeToComplete: Math.random() * 30 + 5 // 5-35 minutes
      };

      previousUsers = users;
      return funnelStep;
    });

    return {
      id: 'funnel_1',
      name: 'Free to Pro Conversion Funnel',
      steps: funnelSteps,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(),
      totalUsers: 10000,
      conversionRate: funnelSteps[funnelSteps.length - 1].users / 10000
    };
  }

  generateMockUserBehaviorMetrics(count: number = 100): UserBehaviorMetrics[] {
    const metrics: UserBehaviorMetrics[] = [];

    for (let i = 0; i < count; i++) {
      const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
      const duration = Math.random() * 120 + 10; // 10-130 minutes
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

      const metricsData: UserBehaviorMetrics = {
        userId: `user_${i + 1}`,
        sessionId: `session_${i + 1}`,
        startTime,
        endTime,
        totalTimeSpent: duration,
        pagesVisited: this.generateRandomPages(),
        featuresUsed: this.generateRandomFeatures(),
        interactions: this.generateMockInteractions(),
        onboardingCompleted: Math.random() > 0.3, // 70% completion rate
        upgradeInitiated: Math.random() > 0.7, // 30% initiate
        upgradeCompleted: Math.random() > 0.85, // 15% complete
        abTestVariant: Math.random() > 0.6 ? ['control', 'variant_a'][Math.floor(Math.random() * 2)] : undefined
      };

      metrics.push(metricsData);
    }

    return metrics;
  }

  generateMockABTests(count: number = 5): ABTestResult[] {
    const abTests: ABTestResult[] = [];

    for (let i = 0; i < count; i++) {
      const variants: ABTestVariant[] = [
        {
          id: 'control',
          name: 'Control',
          description: 'Original experience',
          trafficAllocation: 50,
          conversions: Math.floor(Math.random() * 500) + 200,
          visitors: Math.floor(Math.random() * 2000) + 1000,
          conversionRate: 0,
          revenue: Math.floor(Math.random() * 10000) + 5000,
          metrics: {}
        },
        {
          id: 'variant_a',
          name: 'Variant A',
          description: 'New design variation',
          trafficAllocation: 50,
          conversions: Math.floor(Math.random() * 500) + 250,
          visitors: Math.floor(Math.random() * 2000) + 1000,
          conversionRate: 0,
          revenue: Math.floor(Math.random() * 12000) + 6000,
          metrics: {}
        }
      ];

      // Calculate conversion rates
      variants.forEach(variant => {
        variant.conversionRate = variant.conversions / variant.visitors;
        variant.metrics = {
          averageSessionDuration: Math.random() * 60 + 30,
          bounceRate: Math.random() * 0.5 + 0.2,
          featureAdoptionRate: Math.random() * 0.8 + 0.1,
          revenuePerVisitor: variant.revenue / variant.visitors
        };
      });

      const abTest: ABTestResult = {
        id: `test_${i + 1}`,
        name: `A/B Test ${i + 1}`,
        description: `Testing conversion improvements for ${['pricing page', 'onboarding flow', 'upgrade CTA', 'feature trial', 'payment process'][i]}`,
        hypothesis: `This variant will improve conversion rates by at least 10%`,
        variants,
        startDate: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        status: ['running', 'completed', 'paused'][Math.floor(Math.random() * 3)] as any,
        primaryMetric: 'conversion_rate',
        significanceLevel: 0.05,
        requiredSampleSize: Math.floor(Math.random() * 2000) + 1000,
        results: [{
          variantId: 'variant_a',
          metric: 'conversion_rate',
          value: variants[1].conversionRate,
          confidenceInterval: [
            variants[1].conversionRate - 0.02,
            variants[1].conversionRate + 0.02
          ],
          pValue: Math.random() * 0.1,
          isSignificant: Math.random() > 0.3,
          lift: (variants[1].conversionRate - variants[0].conversionRate) / variants[0].conversionRate * 100,
          liftConfidence: Math.random() * 30 + 70
        }]
      };

      abTests.push(abTest);
    }

    return abTests;
  }

  generateMockROIAnalysis(): ROIAnalysis {
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
    const endDate = new Date();

    const totalInvestment = 50000;
    const totalRevenue = 150000;
    const netProfit = totalRevenue - totalInvestment;
    const roi = (netProfit / totalInvestment) * 100;
    const paybackPeriod = totalInvestment / (totalRevenue / 90);

    const metrics: any[] = [
      {
        id: '1',
        name: 'Customer Acquisition Cost',
        description: 'Cost to acquire each customer',
        value: 125,
        unit: 'currency',
        calculation: 'Total Marketing Spend / New Customers',
        timeframe: 90,
        category: 'cost'
      },
      {
        id: '2',
        name: 'Customer Lifetime Value',
        description: 'Average value of a customer',
        value: 850,
        unit: 'currency',
        calculation: 'Average Revenue * Average Lifespan',
        timeframe: 365,
        category: 'revenue'
      },
      {
        id: '3',
        name: 'Trial Conversion Rate',
        description: 'Percentage of trials that convert',
        value: 15.2,
        unit: 'percentage',
        calculation: 'Paid Customers / Trial Users * 100',
        timeframe: 30,
        category: 'conversion'
      }
    ];

    const breakdown = [
      {
        category: 'Revenue',
        subcategory: 'Subscription Revenue',
        amount: 120000,
        percentage: 80,
        description: 'Monthly subscription fees'
      },
      {
        category: 'Revenue',
        subcategory: 'One-time Purchases',
        amount: 30000,
        percentage: 20,
        description: 'Premium feature purchases'
      },
      {
        category: 'Costs',
        subcategory: 'Development',
        amount: 20000,
        percentage: 40,
        description: 'Feature development costs'
      },
      {
        category: 'Costs',
        subcategory: 'Marketing',
        amount: 20000,
        percentage: 40,
        description: 'User acquisition costs'
      },
      {
        category: 'Costs',
        subcategory: 'Operations',
        amount: 10000,
        percentage: 20,
        description: 'Infrastructure and maintenance'
      }
    ];

    return {
      id: 'roi_1',
      name: 'Q4 2024 Conversion Optimization ROI',
      description: 'Analysis of conversion improvements investment',
      startDate,
      endDate,
      totalInvestment,
      totalRevenue,
      netProfit,
      roi,
      paybackPeriod,
      metrics,
      breakdown
    };
  }

  generateMockSuccessCriteria(): SuccessCriteria[] {
    return [
      {
        id: 'criteria_1',
        name: 'Trial Conversion Rate',
        description: 'Increase trial to paid conversion rate',
        metric: 'trial_conversion_rate',
        targetValue: 20,
        currentValue: 15.2,
        operator: '>=',
        timeframe: 30,
        priority: 'critical',
        status: 'not_met',
        automatedCheck: true,
        lastChecked: new Date()
      },
      {
        id: 'criteria_2',
        name: 'Onboarding Completion',
        description: 'Maintain onboarding completion rate above 70%',
        metric: 'onboarding_completion_rate',
        targetValue: 70,
        currentValue: 68.5,
        operator: '>=',
        timeframe: 7,
        priority: 'high',
        status: 'at_risk',
        automatedCheck: true,
        lastChecked: new Date()
      },
      {
        id: 'criteria_3',
        name: 'Feature Adoption Rate',
        description: 'Users try at least 3 core features',
        metric: 'feature_adoption_rate',
        targetValue: 60,
        currentValue: 72.3,
        operator: '>=',
        timeframe: 14,
        priority: 'medium',
        status: 'exceeded',
        automatedCheck: false,
        lastChecked: new Date()
      }
    ];
  }

  generateMockConversionInsights(): ConversionInsights {
    return {
      conversionRate: 15.2,
      averageTimeToConvert: 8.5,
      topDropOffPoints: [
        'Account creation form',
        'Payment method input',
        'Feature trial limits',
        'Pricing page comparison'
      ],
      mostEffectiveFeatures: [
        'Interactive product demo',
        'Social proof testimonials',
        'Limited-time discount',
        'Feature comparison table'
      ],
      abTestWinners: [
        'Simplified checkout flow (+12% conversion)',
        'Personalized upgrade prompts (+8% clicks)',
        'Trust badges on payment page (+6% completion)'
      ],
      recommendations: [
        {
          id: 'rec_1',
          title: 'Optimize Mobile Checkout',
          description: 'Mobile users have 25% lower conversion rate on payment page',
          impact: 'high',
          effort: 'medium',
          confidence: 85,
          relatedMetrics: ['mobile_conversion_rate', 'checkout_completion'],
          implementation: 'Implement one-click payment options and improve mobile form UX'
        },
        {
          id: 'rec_2',
          title: 'A/B Test Urgency Messaging',
          description: 'Add limited-time offers to trial expiration prompts',
          impact: 'medium',
          effort: 'low',
          confidence: 72,
          relatedMetrics: ['trial_conversion', 'upgrade_clicks'],
          implementation: 'Create urgency-themed variant of trial end emails'
        }
      ]
    };
  }

  generateMockSegmentAnalysis(): SegmentAnalysis[] {
    return [
      {
        id: 'segment_1',
        name: 'High Intent Users',
        criteria: {
          behavior: {
            sessionDuration: '> 15 minutes',
            pagesVisited: '> 5',
            featuresUsed: '> 3'
          }
        },
        metrics: {
          trialStartRate: 85.2,
          trialToPaidRate: 32.1,
          onboardingCompletionRate: 92.3,
          featureAdoptionRate: 78.9,
          churnRate: 8.5,
          lifetimeValue: 1250,
          averageRevenuePerUser: 145.8
        },
        size: 1250,
        conversionRate: 32.1,
        revenue: 182250
      },
      {
        id: 'segment_2',
        name: 'Social Media Referrals',
        criteria: {
          acquisition: {
            source: 'social_media',
            campaign: 'summer_launch'
          }
        },
        metrics: {
          trialStartRate: 68.4,
          trialToPaidRate: 18.7,
          onboardingCompletionRate: 72.1,
          featureAdoptionRate: 56.2,
          churnRate: 15.3,
          lifetimeValue: 890,
          averageRevenuePerUser: 98.5
        },
        size: 890,
        conversionRate: 18.7,
        revenue: 87665
      }
    ];
  }

  generateMockConversionGoals(): ConversionGoal[] {
    return [
      {
        id: 'goal_1',
        name: 'Increase Trial Conversions',
        description: 'Achieve 20% trial to paid conversion rate by end of Q1',
        target: 20,
        current: 15.2,
        unit: 'percentage',
        deadline: new Date('2024-03-31'),
        status: 'at_risk',
        metrics: ['trial_conversion_rate', 'upgrade_clicks', 'payment_completion']
      },
      {
        id: 'goal_2',
        name: 'Reduce Churn Rate',
        description: 'Keep monthly churn below 5%',
        target: 5,
        current: 3.2,
        unit: 'percentage',
        deadline: new Date('2024-01-31'),
        status: 'on_track',
        metrics: ['churn_rate', 'subscription_cancellations', 'retention_cohort']
      }
    ];
  }

  private generateRandomPages(): string[] {
    const pages = [
      '/', '/pricing', '/features', '/about', '/contact', 
      '/dashboard', '/onboarding', '/trial', '/settings', '/profile',
      '/analytics', '/integrations', '/support', '/blog', '/docs'
    ];
    const pageCount = Math.floor(Math.random() * 8) + 2;
    return Array.from(new Set(Array.from({ length: pageCount }, () => 
      pages[Math.floor(Math.random() * pages.length)]
    )));
  }

  private generateRandomFeatures(): string[] {
    const features = [
      'dashboard', 'analytics', 'reports', 'integrations', 'automation',
      'collaboration', 'templates', 'export', 'api', 'mobile_app',
      'notifications', 'scheduling', 'bulk_actions', 'advanced_search', 'custom_branding'
    ];
    const featureCount = Math.floor(Math.random() * 10) + 1;
    return Array.from(new Set(Array.from({ length: featureCount }, () => 
      features[Math.floor(Math.random() * features.length)]
    )));
  }

  private generateMockInteractions() {
    const interactionTypes = ['click', 'hover', 'scroll', 'form_submit'] as const;
    const elements = ['button', 'link', 'form', 'image', 'video', 'menu', 'dropdown'];
    
    return Array.from({ length: Math.floor(Math.random() * 20) + 5 }, () => ({
      type: interactionTypes[Math.floor(Math.random() * interactionTypes.length)],
      element: `${elements[Math.floor(Math.random() * elements.length)]}_${Math.floor(Math.random() * 50)}`,
      timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000),
      duration: Math.random() > 0.5 ? Math.random() * 300 + 10 : undefined,
      metadata: {
        position: { x: Math.floor(Math.random() * 1000), y: Math.floor(Math.random() * 800) },
        viewport: { width: 1920, height: 1080 }
      }
    }));
  }
}