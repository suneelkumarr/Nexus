# Metrics Tracking and Analytics System

A comprehensive metrics tracking system for the Instagram Analytics Platform, focusing on Free to Pro conversion rates, onboarding completion rates, and feature engagement.

## Features

- **Event Tracking**: Comprehensive user action tracking with automatic funnel analysis
- **Conversion Funnel Analysis**: Track and analyze user journeys through predefined funnels
- **Performance Metrics**: Real-time performance monitoring and optimization alerts
- **Dashboard Widgets**: Interactive dashboard components for visualizing key metrics
- **A/B Testing**: Track and analyze A/B test results with statistical significance
- **Automated Reporting**: Scheduled report generation and email delivery

## Quick Start

### Basic Setup

```typescript
import { MetricsTrackingSystem, eventTracking } from './metrics-tracking';

// Initialize the system
const metrics = new MetricsTrackingSystem({
  apiEndpoint: 'https://your-api.com',
  autoTrack: true,
  debug: false
});

// Initialize with user ID
metrics.initialize('user-123');
```

### Track User Events

```typescript
// Track page views
eventTracking.trackPageView('/dashboard');

// Track onboarding
eventTracking.trackOnboardingStart();
eventTracking.trackOnboardingStep('account-setup');
eventTracking.trackOnboardingComplete();

// Track feature usage
eventTracking.trackFeatureUse('analytics-dashboard');
eventTracking.trackFeatureEngagement('analytics-dashboard', 30000); // 30 seconds

// Track conversions
eventTracking.trackUpgradeAttempt('pro');
eventTracking.trackUpgradeSuccess('pro', 29.99);
```

### Analyze Conversion Funnels

```typescript
import { FunnelAnalyzer, predefinedFunnels } from './metrics-tracking';

// Analyze free to pro conversion funnel
const funnelData = metrics.analyzeFunnel('free-to-pro-conversion');

console.log(`Conversion Rate: ${(funnelData.conversionRate * 100).toFixed(2)}%`);
console.log(`Total Users: ${funnelData.totalUsers}`);
console.log(`Completed Users: ${funnelData.completedUsers}`);

// Analyze step-by-step drop-offs
const dropOffRates = funnelAnalyzer.calculateDropOffRates('free-to-pro-conversion');
dropOffRates.forEach(dropOff => {
  console.log(`${dropOff.fromStep} → ${dropOff.toStep}: ${(dropOff.dropoffRate * 100).toFixed(1)}% drop-off`);
});
```

### Performance Monitoring

```typescript
import { PerformanceCollector } from './metrics-tracking';

const performance = metrics.getPerformanceMetrics();

console.log(`Average page load time: ${Object.values(performance.pageLoadTime).reduce((sum, time) => sum + time, 0) / Object.keys(performance.pageLoadTime).length}ms`);
console.log(`Error rate: ${Object.values(performance.errorRates).reduce((sum, error) => sum + error.rate, 0) / Object.keys(performance.errorRates).length}`);

// Generate performance report
const report = performanceCollector.generatePerformanceReport();
console.log('Recommendations:', report.recommendations);
console.log('Alerts:', report.alerts);
```

### Dashboard Widgets

```typescript
import { DashboardManager, MetricWidget, FunnelWidget } from './metrics-tracking';

const dashboard = new DashboardManager();

// Add custom widgets
const conversionWidget = new MetricWidget({
  title: 'Free to Pro Conversion',
  metric: 'free-to-pro-conversion',
  format: 'percentage',
  trend: { direction: 'up', percentage: 5.2 }
});

dashboard.addWidget(conversionWidget);

// Funnel visualization
const funnelWidget = new FunnelWidget({
  funnelId: 'onboarding-completion'
});

dashboard.addWidget(funnelWidget);
```

### Automated Reporting

```typescript
import { reportingSystem, reportTemplates } from './metrics-tracking';

// Generate manual report
const reportPath = await metrics.generateReport('daily-executive-summary', 'pdf');

// Check report history
const history = reportingSystem.getReportHistory('daily-executive-summary');
console.log('Generated reports:', history);

// Create custom report
const customReport = reportingSystem.createReport({
  id: 'weekly-conversion-report',
  name: 'Weekly Conversion Analysis',
  description: 'Weekly deep dive into conversion funnel performance',
  schedule: 'weekly',
  recipients: ['marketing@company.com', 'product@company.com'],
  metrics: ['free-to-pro-conversion', 'onboarding-completion', 'feature-adoption'],
  format: 'excel',
  filters: {
    funnels: ['free-to-pro-conversion', 'onboarding-completion']
  }
});
```

## React Integration

### Using React Hooks

```typescript
import React from 'react';
import { useMetrics, useEventTracking, Dashboard } from './metrics-tracking';

function App() {
  const { isInitialized, trackPageView } = useMetrics();
  const { trackFeatureUsage, trackUpgradeAttempt } = useEventTracking();

  const handleFeatureClick = (featureName: string) => {
    trackFeatureUsage(featureName);
  };

  const handleUpgradeClick = () => {
    trackUpgradeAttempt('pro');
  };

  if (!isInitialized) {
    return <div>Loading metrics...</div>;
  }

  return (
    <div>
      <Dashboard 
        widgets={['freeToProConversion', 'onboardingCompletion', 'dailyActiveUsers']}
        autoRefresh={true}
        refreshInterval={30000}
      />
    </div>
  );
}
```

### Component with Automatic Event Tracking

```typescript
import React from 'react';
import { withEventTracking, useEventTracking } from './metrics-tracking';

function AnalyticsDashboard() {
  const { trackPageView } = useEventTracking();
  
  return (
    <div>
      <button onClick={() => trackFeatureUsage('export-data')}>
        Export Data
      </button>
    </div>
  );
}

// Auto-track component usage
const TrackedAnalyticsDashboard = withEventTracking(AnalyticsDashboard, {
  eventType: 'page_view',
  getProperties: (props) => ({ page: 'analytics-dashboard' })
});
```

### Individual Widget Components

```typescript
import React from 'react';
import { MetricWidget, FunnelWidget, ABTestWidget } from './metrics-tracking';

function MetricsSection() {
  return (
    <div className="metrics-section">
      <MetricWidget
        title="Daily Active Users"
        metric="daily-active-users"
        format="number"
        trend={{ direction: 'up', percentage: 12.5 }}
      />
      
      <FunnelWidget
        title="Onboarding Funnel"
        funnelId="onboarding-completion"
        refreshInterval={30000}
      />
      
      <ABTestWidget
        title="Signup Flow Test"
        testId="signup-flow-test"
      />
    </div>
  );
}
```

## Predefined Funnels

The system includes several pre-configured funnels:

### Free to Pro Conversion
Tracks the complete journey from user signup to successful upgrade:
1. Sign Up
2. Onboarding Start
3. Onboarding Complete
4. Feature Discovery
5. Upgrade Attempt
6. Upgrade Success

### Onboarding Completion
Monitors the onboarding process completion rates:
1. Onboarding Start
2. Account Setup
3. Profile Configuration
4. Feature Tutorial
5. Onboarding Complete

### Feature Adoption
Tracks adoption of key features:
1. User Login
2. Dashboard View
3. Feature Use
4. Feature Engagement

## Performance Monitoring

The system automatically tracks:

- **Page Load Times**: Individual page performance with slow load alerts
- **API Response Times**: Endpoint performance with P95 tracking
- **Error Rates**: Real-time error monitoring
- **User Engagement**: Session duration, pages per session, bounce rate
- **System Metrics**: Memory usage, CPU usage, active users
- **Web Vitals**: Core Web Vitals (LCP, FID, CLS)

## A/B Testing Integration

```typescript
import { ABTestWidget } from './metrics-tracking';

// Display A/B test results
const testWidget = new ABTestWidget({
  testId: 'pricing-page-test'
});

dashboard.addWidget(testWidget);

// Test results include:
// - Statistical significance
// - Conversion rates for each variant
// - Confidence intervals
// - Sample sizes
// - Revenue uplift
```

## Report Types

### Pre-configured Reports

1. **Daily Executive Summary**
   - Key business metrics
   - Conversion rates
   - Revenue data
   - Format: PDF

2. **Weekly Product Analytics**
   - Feature usage
   - User engagement
   - A/B test results
   - Format: Excel

3. **Monthly Performance Report**
   - Technical performance metrics
   - System health
   - User experience metrics
   - Format: JSON

4. **Conversion Optimization Report**
   - Funnel performance analysis
   - Drop-off identification
   - Optimization opportunities
   - Format: PDF

### Custom Reports

Create custom reports with:

```typescript
const customReport = reportingSystem.createReport({
  id: 'custom-metrics-report',
  name: 'Custom Metrics Report',
  description: 'Tailored metrics for specific use case',
  schedule: 'daily', // 'daily' | 'weekly' | 'monthly'
  recipients: ['team@company.com'],
  metrics: ['custom-metric-1', 'custom-metric-2'],
  segments: ['enterprise', 'smb'],
  format: 'pdf',
  filters: {
    funnels: ['custom-funnel'],
    abTests: ['custom-test']
  }
});
```

## API Endpoints

The system expects these API endpoints to be available:

```
GET  /api/analytics/metrics/:metricId
POST /api/analytics/events
GET  /api/analytics/funnels/:funnelId
POST /api/analytics/funnels/:funnelId
GET  /api/analytics/ab-tests/:testId
GET  /api/analytics/performance
POST /api/analytics/performance
```

## Configuration

### Environment Variables

```bash
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USERNAME=your-email@company.com
SMTP_PASSWORD=your-password
API_ENDPOINT=https://api.your-app.com
```

### Initialization Options

```typescript
const metrics = new MetricsTrackingSystem({
  apiEndpoint: 'https://api.your-app.com',  // Analytics API endpoint
  autoTrack: true,                          // Auto-track page views, errors, etc.
  debug: false,                             // Enable debug logging
  bufferSize: 100,                          // Event buffer size
  flushInterval: 5000,                      // Auto-flush interval (ms)
  refreshInterval: 60000                    // Dashboard refresh interval (ms)
});
```

## Best Practices

### Event Naming
- Use consistent, descriptive event names
- Include relevant properties (plan type, feature name, etc.)
- Track meaningful business events

### Performance
- Use the event buffer for high-traffic applications
- Monitor dashboard refresh intervals
- Implement proper error handling

### Privacy
- Ensure compliance with privacy regulations
- Anonymize sensitive user data
- Implement proper consent management

### Testing
- Test funnel calculations with known data
- Verify A/B test statistical significance calculations
- Validate performance metrics accuracy

## Error Handling

The system includes comprehensive error handling:

```typescript
try {
  const funnelData = metrics.analyzeFunnel('invalid-funnel');
} catch (error) {
  eventTracking.trackError(error, {
    context: 'funnel_analysis',
    funnelId: 'invalid-funnel'
  });
}
```

## Advanced Usage

### Custom Funnel Creation

```typescript
import { FunnelDefinition } from './types';

const customFunnel: FunnelDefinition = {
  id: 'custom-conversion',
  name: 'Custom Conversion Funnel',
  description: 'Track custom user journey',
  steps: [
    {
      stepName: 'Landing',
      eventType: 'page_view',
      description: 'User lands on page',
      required: true
    },
    {
      stepName: 'Engagement',
      eventType: 'feature_use',
      description: 'User engages with feature',
      required: true,
      timeLimit: 300 // 5 minutes
    }
  ],
  conversionGoal: 'feature_engagement'
};

funnelAnalyzer.registerFunnel(customFunnel);
```

### Real-time Event Processing

```typescript
import { EventData } from './types';

const events: EventData[] = [
  {
    id: '1',
    userId: 'user-123',
    eventType: 'user_signup',
    timestamp: Date.now(),
    properties: { source: 'organic' },
    sessionId: 'session-123'
  }
];

// Process events through funnel analyzer
funnelAnalyzer.processEvents(events);
```

## Monitoring and Alerts

The system provides real-time monitoring and alerts:

```typescript
const status = metrics.getSystemStatus();

if (status.status === 'error') {
  // Send immediate alert
  sendAlert(status.alerts);
} else if (status.status === 'warning') {
  // Log for review
  console.warn('Metrics system warnings:', status.alerts);
}
```

## License

This metrics tracking system is designed for the Instagram Analytics Platform and includes specialized features for tracking Free to Pro conversions, onboarding completion rates, and feature engagement.