# A/B Testing Framework for Instagram Analytics Platform

A comprehensive, production-ready A/B testing framework built specifically for SaaS platforms, with TypeScript interfaces, React hooks, and modern best practices.

## 🚀 Features

### Core Functionality
- **User Randomization & Assignment**: Consistent hashing-based user bucketing
- **Experiment Management**: Full CRUD operations for experiments
- **Statistical Analysis**: Built-in significance testing and power calculations
- **Real-time Tracking**: Event tracking and metric monitoring
- **Configuration Management**: System settings and user overrides

### Technical Features
- **TypeScript First**: Comprehensive type definitions
- **React Hooks**: Custom hooks for all A/B testing operations
- **Modern Architecture**: Scalable, maintainable codebase
- **Performance Optimized**: Efficient randomization and caching
- **Developer Friendly**: Debug tools and mock data generators

### Statistical Capabilities
- **Significance Testing**: Z-tests for proportions
- **Sample Size Calculation**: Power analysis for experiment planning
- **Confidence Intervals**: Statistical inference support
- **Multiple Variants**: Support for A/B/C/D testing
- **Funnel Analysis**: Multi-step conversion tracking

## 📦 Installation

```bash
npm install @your-org/ab-testing-framework
# or
yarn add @your-org/ab-testing-framework
```

## 🏗️ Architecture

```
code/ab-testing/
├── types.ts              # TypeScript interfaces and types
├── utils.ts              # Core utilities and algorithms
├── hooks.ts              # React hooks for A/B testing
├── components.tsx        # UI components for experiment management
├── components-advanced.tsx # Advanced components and dashboards
├── config.ts             # Configuration management system
├── example.tsx           # Complete implementation examples
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Basic Setup

```tsx
import { ABTestingDashboard } from './code/ab-testing/example';

function App() {
  return <ABTestingDashboard />;
}
```

### 2. Using the Framework in Your Components

```tsx
import { useABTesting } from './code/ab-testing/hooks';

function MyComponent({ userId }: { userId: string }) {
  const { 
    assignUserToExperiment, 
    getUserAssignment, 
    trackEvent 
  } = useABTesting();

  const handleButtonClick = async () => {
    // Assign user to experiment
    const assignment = await assignUserToExperiment(
      { id: userId }, 
      'my-experiment-id'
    );

    if (assignment) {
      // Track conversion event
      await trackEvent(
        'my-experiment-id',
        assignment.variantId,
        userId,
        'conversion',
        1
      );
    }
  };

  return (
    <button onClick={handleButtonClick}>
      Try Feature
    </button>
  );
}
```

### 3. Simple A/B Testing

```tsx
import { useSimpleABTest } from './code/ab-testing/example';

function LandingPage({ userId }: { userId: string }) {
  const { VariantComponent, trackEvent } = useSimpleABTest(
    'hero_message',
    [
      { name: 'default', component: DefaultHero },
      { name: 'urgent', component: UrgentHero },
      { name: 'social_proof', component: SocialProofHero }
    ],
    userId
  );

  return (
    <div>
      <VariantComponent onCTAClick={() => trackEvent('cta_click')} />
    </div>
  );
}
```

## 🔧 Configuration

### System Configuration

```typescript
import { ABTestConfigManager } from './code/ab-testing/config';

const configManager = ABTestConfigManager.getInstance();

// Update system settings
await configManager.updateSystemConfig({
  defaultConfidenceLevel: 0.95,
  minimumSampleSize: 100,
  autoStartExperiments: true
});
```

### Creating Experiments

```typescript
const experiment = await configManager.saveExperimentConfig({
  name: 'Button Color Test',
  description: 'Testing different CTA button colors',
  status: 'active',
  variants: [
    {
      id: 'control',
      name: 'Blue Button',
      weight: 50,
      isControl: true,
      description: 'Current blue button'
    },
    {
      id: 'variant_a',
      name: 'Green Button',
      weight: 50,
      description: 'New green button variant'
    }
  ],
  metrics: [
    {
      id: 'conversion',
      name: 'Click-through Rate',
      type: 'conversion',
      eventName: 'cta_click',
      aggregation: 'percentage',
      isPrimary: true
    }
  ],
  createdBy: 'user_id',
  priority: 8,
  tags: ['cta', 'ui', 'conversion']
});
```

## 📊 Statistical Analysis

### Built-in Statistical Functions

```typescript
import { 
  calculateStatisticalSignificance,
  calculateRequiredSampleSize,
  analyzeExperimentResults 
} from './code/ab-testing/utils';

// Calculate significance between variants
const result = calculateStatisticalSignificance(
  { conversions: 45, total: 500 }, // Control
  { conversions: 67, total: 520 }, // Variant
  0.05 // Alpha level
);

console.log(result.isSignificant); // true/false
console.log(result.pValue); // p-value
console.log(result.effectSize); // Effect size

// Calculate required sample size
const requiredSize = calculateRequiredSampleSize(
  0.1, // Baseline conversion rate
  0.02, // Minimum detectable effect
  0.05, // Alpha
  0.8  // Power
);

console.log(requiredSize); // Required sample size per variant
```

### Analyzing Results

```typescript
import { useExperiment } from './code/ab-testing/hooks';

function ResultsPage({ experimentId }: { experimentId: string }) {
  const { results, analyzeResults } = useExperiment(experimentId);

  useEffect(() => {
    if (events.length > 0) {
      const analysis = analyzeResults();
      console.log('Recommended action:', analysis?.overallResult.recommendedAction);
    }
  }, [events]);

  // Render results dashboard
  return <ExperimentResultsDashboard experimentId={experimentId} />;
}
```

## 🎯 Advanced Features

### User Segmentation

```typescript
import { TargetAudience } from './code/ab-testing/types';

const targetAudience: TargetAudience = {
  userProperties: {
    plan: 'pro',
    country: 'US',
    device: 'desktop'
  },
  percentage: 50, // Include 50% of eligible users
  includeRules: ['signed_up_after_2024'],
  excludeRules: ['banned_users']
};
```

### Experiment Overrides

```typescript
import { ABTestConfigManager } from './code/ab-testing/config';

const configManager = ABTestConfigManager.getInstance();

// Override user assignment
await configManager.setUserOverride({
  userId: 'user_123',
  experimentId: 'exp_456',
  variantId: 'winner_variant',
  reason: 'QA testing',
  expiresAt: new Date('2024-12-31')
});
```

### Custom Metrics

```typescript
const customMetrics = [
  {
    id: 'engagement',
    name: 'Engagement Score',
    type: 'custom',
    eventName: 'engagement_score',
    aggregation: 'average',
    isPrimary: false
  },
  {
    id: 'revenue',
    name: 'Revenue per User',
    type: 'revenue',
    eventName: 'purchase',
    aggregation: 'sum',
    isPrimary: true
  }
];
```

## 🎨 UI Components

### Experiment Management

```tsx
import { 
  ExperimentList,
  ExperimentCreator,
  ExperimentResultsDashboard 
} from './code/ab-testing/components';

function ExperimentManager() {
  const [view, setView] = useState<'list' | 'create' | 'results'>('list');
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);

  return (
    <div>
      {view === 'list' && (
        <ExperimentList
          onCreateExperiment={() => setView('create')}
          onEditExperiment={(exp) => setSelectedExperiment(exp.id)}
          onViewResults={(exp) => {
            setSelectedExperiment(exp.id);
            setView('results');
          }}
        />
      )}
      
      {view === 'create' && (
        <ExperimentCreator
          onCreate={(exp) => {
            setView('list');
            setSelectedExperiment(exp.id);
          }}
          onCancel={() => setView('list')}
        />
      )}
      
      {view === 'results' && selectedExperiment && (
        <ExperimentResultsDashboard experimentId={selectedExperiment} />
      )}
    </div>
  );
}
```

### User Assignment Display

```tsx
import { UserAssignmentManager } from './code/ab-testing/components';

function UserDashboard({ userId }: { userId: string }) {
  return (
    <div>
      <h2>Your Active Experiments</h2>
      <UserAssignmentManager userId={userId} />
    </div>
  );
}
```

## 🔍 Development and Testing

### Mock Data Generation

```typescript
import { MockDataGenerator } from './code/ab-testing/example';

// Generate test users
const users = Array.from({ length: 100 }, (_, i) => 
  MockDataGenerator.generateUser(`test_user_${i}`)
);

// Generate test experiment
const experiment = MockDataGenerator.generateExperiment('Test Button Colors');

// Generate test events
const events = MockDataGenerator.generateEvents(
  experiment.id,
  ['control', 'variant_a'],
  100
);
```

### Debug Toolbar

```tsx
import { ABTestDevToolbar } from './code/ab-testing/example';

function AppWithDebug({ userId }: { userId: string }) {
  return (
    <div>
      {/* Your app content */}
      <ABTestDevToolbar userId={userId} />
    </div>
  );
}
```

## 📈 Best Practices

### 1. Experiment Planning

- **Define clear hypotheses** before creating experiments
- **Set minimum sample sizes** based on expected effect sizes
- **Choose appropriate metrics** (primary and secondary)
- **Plan for statistical significance** with proper alpha levels

### 2. Implementation Guidelines

```typescript
// ✅ Good: Clear experiment structure
const pricingExperiment = {
  name: 'Pricing Page Layout Test',
  description: 'Testing different pricing page layouts for conversion',
  variants: [
    {
      name: 'Current Layout',
      weight: 50,
      isControl: true,
      config: { layout: 'current' }
    },
    {
      name: 'Simplified Layout',
      weight: 50,
      config: { layout: 'simplified' }
    }
  ],
  metrics: [
    {
      name: 'Conversion Rate',
      type: 'conversion',
      eventName: 'signup_complete',
      isPrimary: true
    }
  ]
};

// ❌ Avoid: Vague experiment names and configurations
const badExperiment = {
  name: 'Test 1',
  variants: [{ name: 'A', weight: 50 }, { name: 'B', weight: 50 }],
  metrics: [{ name: 'Metric 1', type: 'custom' }]
};
```

### 3. Statistical Considerations

```typescript
// ✅ Proper significance testing
const analysis = analyzeExperimentResults(
  experimentId,
  events,
  controlVariantId,
  0.95 // 95% confidence level
);

if (analysis.overallResult.isConclusive) {
  // Implement winning variant
  implementWinningVariant(analysis.overallResult.winner);
} else {
  // Continue testing
  continueExperiment();
}

// ❌ Avoid making decisions without proper analysis
if (variantAConversions > variantBConversions) {
  implementVariantA(); // Not statistically valid
}
```

### 4. User Experience

```typescript
// ✅ Good: Graceful degradation
function FeatureWithABTest({ userId }: { userId: string }) {
  const { variants } = useUserABTests(userId);
  const assignment = variants.find(v => 
    v.experiment.id === 'feature-test'
  );

  // Show default feature if no assignment
  if (!assignment) {
    return <DefaultFeature />;
  }

  return <VariantFeature variant={assignment.variant} />;
}

// ❌ Avoid: Breaking user experience
function BrokenABTest({ userId }: { userId: string }) {
  const { VariantComponent } = useSimpleABTest('broken', variants, userId);
  
  // This could crash if assignment fails
  return <VariantComponent />;
}
```

## 🔧 Configuration Options

### System Configuration

```typescript
interface ABTestSystemConfig {
  autoStartExperiments: boolean;        // Auto-start experiments after creation
  defaultExperimentDuration: number;     // Default duration in days
  minimumSampleSize: number;            // Minimum sample size per variant
  defaultConfidenceLevel: number;       // Default statistical confidence (0.95)
  defaultStatisticalPower: number;      // Default statistical power (0.8)
  enableRealTimeTracking: boolean;      // Enable real-time event tracking
  enableAutomaticAnalysis: boolean;     // Automatic statistical analysis
  maxConcurrentExperiments: number;     // Maximum active experiments
  dataRetentionDays: number;           // Data retention period
  enableCrossDomainTracking: boolean;   // Cross-domain experiment tracking
  featureFlags: {                      // Feature toggles
    enableMultivariateTests: boolean;
    enableFunnelAnalysis: boolean;
    enableCohortAnalysis: boolean;
    enablePersonalization: boolean;
  };
}
```

## 📊 Analytics Integration

### Event Tracking

```typescript
// Track custom events
await trackEvent(
  'checkout-experiment',
  'variant_b',
  'user_123',
  'add_to_cart',
  29.99,
  { product_id: 'prod_456', category: 'electronics' }
);

// Track conversion funnel
await trackEvent('signup-funnel', 'control', 'user_123', 'step1_complete');
await trackEvent('signup-funnel', 'control', 'user_123', 'step2_complete');
await trackEvent('signup-funnel', 'control', 'user_123', 'conversion');
```

### Integration with Analytics Platforms

```typescript
// Google Analytics integration
function trackToAnalytics(event: ExperimentEvent) {
  if (typeof gtag !== 'undefined') {
    gtag('event', event.eventName, {
      experiment_id: event.experimentId,
      variant_id: event.variantId,
      value: event.eventValue
    });
  }
}
```

## 🚀 Deployment

### Environment Setup

```typescript
// Environment-specific configuration
const config = {
  development: {
    enableDebugMode: true,
    autoAssignUsers: false,
    sampleDataGeneration: true
  },
  production: {
    enableDebugMode: false,
    autoAssignUsers: true,
    sampleDataGeneration: false
  }
};
```

### Performance Optimization

```typescript
// Cache user assignments
const assignmentCache = new Map<string, UserAssignment>();

// Batch event tracking
const eventQueue: ExperimentEvent[] = [];
const BATCH_SIZE = 10;

async function batchTrackEvents() {
  if (eventQueue.length >= BATCH_SIZE) {
    await sendEventsToAnalytics(eventQueue.splice(0, BATCH_SIZE));
  }
}
```

## 🔒 Security Considerations

### User Privacy

- **Anonymize user data** in experiment tracking
- **Implement data retention policies** (configurable)
- **Secure user assignment** with proper hashing
- **GDPR compliance** with user consent management

### Experiment Security

```typescript
// Validate experiment configurations
const validationErrors = ConfigValidator.validateExperiment(config);
if (validationErrors.length > 0) {
  throw new Error(`Invalid experiment: ${validationErrors.join(', ')}`);
}

// Sanitize user input
function sanitizeExperimentName(name: string): string {
  return name.replace(/[<>\"'&]/g, '').substring(0, 100);
}
```

## 📚 API Reference

### Core Hooks

| Hook | Description | Parameters | Returns |
|------|-------------|------------|---------|
| `useABTesting` | Main A/B testing hook | none | A/B testing instance |
| `useExperiment` | Manage specific experiment | `experimentId` | Experiment data and methods |
| `useUserABTests` | Get user's assignments | `userId` | User's variant assignments |
| `useExperimentFilters` | Filter and sort experiments | none | Filtered experiments |
| `useExperimentCreator` | Create new experiments | none | Experiment creation methods |

### Utility Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `assignVariant` | Assign user to variant | `userId, experimentId, variants` | `ExperimentVariant` |
| `calculateStatisticalSignificance` | Calculate significance | `control, variant, alpha` | `StatisticalResult` |
| `analyzeExperimentResults` | Analyze complete results | `experimentId, events, controlId` | `ExperimentResults` |
| `validateExperiment` | Validate experiment config | `experiment` | `string[]` (errors) |

### Components

| Component | Description | Props |
|-----------|-------------|-------|
| `ExperimentList` | Display experiments | `onCreateExperiment, onEditExperiment` |
| `ExperimentCreator` | Create new experiments | `onCreate, onCancel` |
| `ExperimentResultsDashboard` | Show results | `experimentId` |
| `UserAssignmentManager` | Show user assignments | `userId` |

## 🤝 Contributing

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/ab-testing-framework.git

# Install dependencies
npm install

# Run tests
npm test

# Start development server
npm run dev
```

### Code Standards

- **TypeScript**: Strict mode enabled
- **ESLint**: Follow existing patterns
- **Prettier**: Code formatting
- **Testing**: Unit tests for all utilities
- **Documentation**: JSDoc comments for public APIs

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline comments
- **Issues**: Open GitHub issues for bugs and feature requests
- **Examples**: See `example.tsx` for implementation patterns
- **Testing**: Use mock data generator for development

---

**Built with ❤️ for the Instagram Analytics Platform**