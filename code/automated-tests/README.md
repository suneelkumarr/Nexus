# Automated Testing Framework - Instagram Analytics Platform

## Overview

This comprehensive automated testing framework provides complete coverage for the Instagram Analytics Platform, ensuring quality, reliability, and performance across all user journeys and critical features.

## 🏗️ Framework Architecture

### Testing Layers

```
┌─────────────────────────────────────────┐
│           E2E Tests (Playwright)        │  ← User Journey Testing
├─────────────────────────────────────────┤
│      Integration Tests (Vitest)         │  ← Component Integration
├─────────────────────────────────────────┤
│        Unit Tests (Vitest)              │  ← Individual Components
├─────────────────────────────────────────┤
│     Performance & Accessibility         │  ← Cross-cutting Concerns
└─────────────────────────────────────────┘
```

## 📁 Directory Structure

```
code/automated-tests/
├── unit/                     # Unit tests for individual components
│   └── components/
│       ├── Onboarding/       # WelcomeChoiceModal tests
│       ├── Personalization/  # EnhancedPersonalizedInsights tests
│       └── Conversion/       # ConversionCenter tests
├── integration/              # Integration tests
│   └── flows/               # Complete user journey tests
├── e2e/                     # End-to-end tests (Playwright)
├── performance/             # Performance testing
├── accessibility/           # WCAG compliance testing
├── ci-cd/                   # CI/CD pipeline configuration
├── mocks/                   # API mocking utilities
├── setup.ts                 # Test environment setup
├── vitest.config.ts         # Vitest configuration
├── playwright.config.ts     # Playwright configuration
└── package.json             # Test dependencies and scripts
```

## 🚀 Quick Start

### Installation

```bash
cd code/automated-tests
npm install
```

### Running Tests

#### Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

#### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Run specific integration test
npm run test:unit -- --run integration/flows/complete-user-journey.test.tsx
```

#### E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Debug E2E tests
npm run test:e2e:debug

# Run mobile tests
npm run test:mobile

# Run cross-browser tests
npm run test:cross-browser
```

#### Specialized Tests
```bash
# Accessibility tests
npm run test:accessibility

# Performance tests
npm run test:performance

# API tests
npm run test:api

# Visual regression tests
npm run test:visual

# Load testing
npm run test:load
```

#### Complete Test Suite
```bash
# Run all tests
npm run test:all

# Run tests for CI/CD
npm run test:ci
```

## 📋 Test Coverage

### 1. Critical User Flows

#### Complete User Journey (Signup → Dashboard → Conversion)
- **Landing Page → Signup**
- **Email/Password Registration**
- **Onboarding Flow (4 steps)**
  - Goal selection (Growth, Engagement, Analytics, Content Strategy)
  - Industry selection
  - Experience level selection
  - Dashboard completion
- **Dashboard Navigation**
- **Analytics Feature Usage**
- **Conversion Events**

#### A/B Testing Flow
- **Variant Assignment**
- **Test Event Tracking**
- **Conversion Measurement**
- **Statistical Significance Testing**

#### Mobile User Experience
- **Responsive Navigation**
- **Touch Interactions**
- **Mobile Form Completion**
- **Performance on Mobile Devices**

### 2. Component Integration Tests

#### WelcomeChoiceModal
- ✅ Modal rendering and visibility
- ✅ Goal selection functionality
- ✅ Industry selection workflow
- ✅ Experience level input
- ✅ Form validation and error handling
- ✅ Keyboard navigation support
- ✅ Loading states and transitions
- ✅ Completion callback execution

#### EnhancedPersonalizedInsights
- ✅ Insight data rendering
- ✅ Confidence level display
- ✅ Impact indicator functionality
- ✅ Insight filtering capabilities
- ✅ Trend visualization
- ✅ Error state handling
- ✅ Loading state management
- ✅ Real-time updates

#### ConversionCenter
- ✅ Conversion rate display
- ✅ Funnel visualization
- ✅ Goal tracking functionality
- ✅ A/B test results integration
- ✅ Export functionality
- ✅ Time period filtering
- ✅ Real-time data updates
- ✅ Error recovery mechanisms

### 3. Accessibility Testing (WCAG 2.1 AA)

#### Navigation Accessibility
- ✅ Semantic HTML structure
- ✅ Proper heading hierarchy
- ✅ Skip links implementation
- ✅ Landmark regions

#### Keyboard Navigation
- ✅ Tab order correctness
- ✅ Focus management
- ✅ Keyboard shortcuts
- ✅ Focus trap in modals

#### Form Accessibility
- ✅ Label association
- ✅ Error message association
- ✅ Required field indication
- ✅ Field grouping

#### Visual Accessibility
- ✅ Color contrast compliance
- ✅ Text scaling support
- ✅ Animation controls
- ✅ Reduced motion support

#### Screen Reader Support
- ✅ ARIA labels and descriptions
- ✅ Live region announcements
- ✅ Alternative text for images
- ✅ Table accessibility

### 4. Performance Testing

#### Load Time Testing
- ✅ Page load performance (< 3 seconds)
- ✅ Core Web Vitals (LCP, FID, CLS)
- ✅ API response times (< 500ms)
- ✅ Bundle size optimization

#### Runtime Performance
- ✅ Dashboard rendering (< 1 second)
- ✅ Memory usage monitoring
- ✅ Animation performance
- ✅ Large dataset handling

#### Mobile Performance
- ✅ Touch interaction responsiveness
- ✅ Battery usage optimization
- ✅ Network efficiency
- ✅ Progressive loading

### 5. Cross-Browser Testing

#### Desktop Browsers
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

#### Mobile Browsers
- ✅ Mobile Chrome
- ✅ Mobile Safari
- ✅ Samsung Internet

## 🔧 Configuration

### Environment Variables

Create a `.env` file for test environment configuration:

```env
# Test Environment
NODE_ENV=test
VITE_TEST_MODE=true

# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_MOCK_API=true

# Test Database
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/test_db

# Feature Flags
VITE_ENABLE_AB_TESTING=true
VITE_ENABLE_PERSONALIZATION=true

# Visual Testing
VRT_SNAPSHOT_DIR=__snapshots__
VRT_DIFF_DIR=diffs

# Performance Testing
LIGHTHOUSE_CI_TOKEN=your-token
PERF_BUDGET_LCP=2500
PERF_BUDGET_FID=100
PERF_BUDGET_CLS=0.1
```

### Custom Configuration

#### Vitest Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setup.ts'],
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'dist/']
    }
  }
});
```

#### Playwright Configuration
```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'safari', use: { ...devices['Desktop Safari'] } }
  ]
});
```

## 📊 Test Data Management

### Mock Data Generation

The framework includes comprehensive mock data for consistent testing:

```typescript
// Example: User journey test data
const mockUserJourney = {
  user: {
    id: 'test-user-123',
    email: 'test@example.com',
    subscriptionTier: 'free'
  },
  onboardingProgress: {
    completed: true,
    currentStep: 'complete',
    progress: 100
  },
  analytics: {
    followerCount: 15420,
    engagementRate: 4.2,
    insights: [...]
  }
};
```

### API Mocking

All external API calls are mocked using MSW (Mock Service Worker):

- Authentication endpoints
- Analytics data endpoints
- A/B testing endpoints
- Conversion tracking endpoints
- Error scenarios

## 🔍 Test Debugging

### Debugging Unit Tests
```bash
# Run specific test file with debugging
npm run test:unit -- --run WelcomeChoiceModal.test.tsx

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/vitest --run
```

### Debugging E2E Tests
```bash
# Run with UI
npm run test:e2e:ui

# Debug specific test
npx playwright test --debug complete-user-journey.spec.ts

# Generate test artifacts
npx playwright test --project=chromium --trace=on
```

### Visual Debugging
```bash
# Update screenshots
npm run test:debug-screenshots

# Run visual regression tests
npm run test:visual
```

## 🚦 CI/CD Integration

### GitHub Actions Pipeline

The framework includes a comprehensive CI/CD pipeline (`ci-cd/test-pipeline.yml`):

```yaml
jobs:
  unit-tests:      # Unit and integration tests
  e2e-tests:       # Cross-browser E2E tests
  mobile-tests:    # Mobile and responsive tests
  accessibility:   # WCAG compliance tests
  performance:     # Performance benchmarks
  api-tests:       # API integration tests
  security-tests:  # Security scanning
  visual-regression: # Visual consistency checks
```

### Pipeline Triggers
- **Push** to main/develop branches
- **Pull Requests** to main
- **Scheduled** daily runs (2 AM UTC)
- **Manual** workflow dispatch

### Test Quality Gates
- **80%** code coverage requirement
- **All tests must pass** before deployment
- **Performance budgets** must be met
- **Accessibility compliance** required
- **Cross-browser compatibility** verified

## 📈 Reporting and Analytics

### Test Reports

#### Unit/Integration Test Reports
- Coverage reports (HTML, LCOV)
- Test execution time
- Failing test analysis
- Code coverage trends

#### E2E Test Reports
- HTML test reports
- Screenshot artifacts on failures
- Video recordings of test execution
- Network activity logs

#### Performance Reports
- Core Web Vitals metrics
- Lighthouse performance scores
- Memory usage analysis
- API response time trends

### Metrics Dashboard

Track key testing metrics:

- **Test Success Rate**: Percentage of passing tests
- **Code Coverage**: Lines, branches, functions, statements
- **Performance Metrics**: LCP, FID, CLS over time
- **Accessibility Score**: WCAG compliance percentage
- **Cross-browser Compatibility**: Pass rate by browser

## 🛠️ Development Workflow

### Adding New Tests

#### 1. Unit Test Example
```typescript
// components/NewFeature.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewFeature } from './NewFeature';

describe('NewFeature', () => {
  it('renders correctly', () => {
    render(<NewFeature />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles user interaction', () => {
    render(<NewFeature />);
    fireEvent.click(screen.getByRole('button'));
    // Test assertions...
  });
});
```

#### 2. E2E Test Example
```typescript
// e2e/new-feature-flow.spec.ts
import { test, expect } from '@playwright/test';

test('new feature user flow', async ({ page }) => {
  await page.goto('/feature');
  await page.click('[data-testid="feature-button"]');
  await expect(page.locator('[data-testid="feature-result"]')).toBeVisible();
});
```

#### 3. Integration Test Example
```typescript
// integration/flows/new-feature-integration.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewFeature } from './NewFeature';

describe('NewFeature Integration', () => {
  it('works with auth context', () => {
    // Test integration with context providers...
  });
});
```

### Test Best Practices

#### 1. Test Naming
- Use descriptive test names that explain what is being tested
- Follow the pattern: `should [expected behavior] when [condition]`
- Example: `should show error message when form is submitted with invalid data`

#### 2. Test Organization
- Group related tests in `describe` blocks
- Use setup functions for common test data
- Keep tests independent and isolated

#### 3. Assertions
- Make specific, meaningful assertions
- Test for both positive and negative cases
- Include error handling scenarios

#### 4. Test Data
- Use realistic test data
- Mock external dependencies
- Create factory functions for complex objects

#### 5. Accessibility Testing
- Always test keyboard navigation
- Include screen reader compatibility
- Verify color contrast and visual indicators

## 🚀 Advanced Features

### Visual Regression Testing
```typescript
test('matches visual snapshot', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveScreenshot('dashboard.png');
});
```

### Performance Monitoring
```typescript
test('meets performance budget', async ({ page }) => {
  const metrics = await page.evaluate(() => {
    return JSON.stringify(performance.getEntriesByType('navigation')[0]);
  });
  const navigation = JSON.parse(metrics);
  expect(navigation.loadEventEnd).toBeLessThan(3000);
});
```

### Database Testing
```typescript
test('persists user data correctly', async () => {
  const user = await createTestUser();
  expect(user.id).toBeDefined();
  expect(user.email).toMatch(/@test\.com$/);
});
```

### API Testing
```typescript
test('handles API errors gracefully', async () => {
  server.use(
    rest.get('/api/data', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  // Test error handling...
});
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Tests Timing Out
```typescript
// Increase timeout for slow operations
test('slow operation', async () => {
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}, 15000);
```

#### 2. Element Not Found
```typescript
// Wait for element to appear
await page.waitForSelector('[data-testid="element"]', { timeout: 5000 });
```

#### 3. Flaky Tests
```typescript
// Use expect.soft for non-critical assertions
test('flaky test', async () => {
  expect.soft(await page.isVisible('[data-testid="optional"]')).toBe(true);
  expect(await page.isVisible('[data-testid="required"]')).toBe(true);
});
```

### Debug Mode
```bash
# Enable debug logging
DEBUG=pw:api npm run test:e2e

# Run with verbose output
npm run test:e2e -- --reporter=verbose
```

## 📚 Resources

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- **Playwright**: E2E testing framework
- **Vitest**: Unit and integration testing
- **Testing Library**: React component testing utilities
- **MSW**: API mocking
- **ESLint**: Code quality and consistency
- **TypeScript**: Type safety and better DX

### Continuous Integration
- **GitHub Actions**: CI/CD pipeline
- **Codecov**: Code coverage reporting
- **Lighthouse CI**: Performance monitoring
- **axe-core**: Accessibility testing

## 🤝 Contributing

### Test Contribution Guidelines

1. **Follow the existing structure** and naming conventions
2. **Write comprehensive tests** covering edge cases
3. **Include accessibility testing** for UI components
4. **Mock external dependencies** to ensure test reliability
5. **Document complex test scenarios** with comments
6. **Ensure tests are maintainable** and easy to understand

### Test Review Checklist

- [ ] Tests cover the main functionality
- [ ] Edge cases are handled
- [ ] Accessibility is considered
- [ ] Tests are isolated and independent
- [ ] Test data is realistic and consistent
- [ ] Performance impact is minimal
- [ ] Documentation is updated

## 📞 Support

For questions about the testing framework:

- **Slack**: #testing-framework
- **Documentation**: This README and inline code comments
- **Issues**: GitHub Issues for bug reports and feature requests
- **Wiki**: Detailed guides and best practices

---

**Last Updated**: November 2025  
**Version**: 1.0.0  
**Framework**: Playwright + Vitest + Testing Library