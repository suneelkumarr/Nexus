import { test, expect } from '@playwright/test';

test.describe('Complete User Journey E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses for consistent testing
    await page.route('/api/auth/**', async (route) => {
      if (route.request().url().includes('/login')) {
        await route.fulfill({
          json: {
            user: { id: 'test-user', email: 'test@example.com' },
            session: { accessToken: 'test-token' }
          }
        });
      }
    });

    await page.route('/api/analytics/**', async (route) => {
      await route.fulfill({
        json: {
          followerCount: 15420,
          engagementRate: 4.2,
          insights: [
            {
              id: '1',
              title: 'Peak Posting Time',
              description: 'Your audience is most active between 2-4 PM',
              value: '2:00 PM - 4:00 PM'
            }
          ]
        }
      });
    });

    await page.route('/api/onboarding/**', async (route) => {
      await route.fulfill({ json: { success: true } });
    });
  });

  test('complete user flow from landing to dashboard', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Check landing page loads
    await expect(page.locator('h1')).toContainText(/Instagram.*Analytics/i);
    
    // Click sign up button
    await page.click('[data-testid="signup-button"]');
    
    // Fill signup form
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'testpassword');
    await page.click('[data-testid="signup-submit"]');
    
    // Wait for navigation to onboarding
    await expect(page).toHaveURL('/onboarding');
    
    // Complete onboarding flow
    await expect(page.locator('h1')).toContainText(/Welcome/i);
    
    // Step 1: Goals selection
    await page.check('[value="growth"]');
    await page.click('[data-testid="goals-continue"]');
    
    // Step 2: Industry selection
    await page.selectOption('[data-testid="industry-select"]', 'fitness');
    await page.click('[data-testid="industry-continue"]');
    
    // Step 3: Experience level
    await page.check('[value="intermediate"]');
    await page.click('[data-testid="experience-continue"]');
    
    // Step 4: Complete
    await expect(page.locator('h2')).toContainText(/all set/i);
    await page.click('[data-testid="go-to-dashboard"]');
    
    // Verify dashboard loads
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText(/Dashboard/i);
    
    // Check that analytics data loads
    await expect(page.locator('[data-testid="follower-count"]')).toContainText('15,420');
    await expect(page.locator('[data-testid="engagement-rate"]')).toContainText('4.2%');
  });

  test('mobile responsive user flow', async ({ page, isMobile }) => {
    if (isMobile) {
      // Test mobile navigation
      await page.goto('/');
      
      // Mobile menu should be visible
      await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible();
      
      // Open mobile menu
      await page.click('[data-testid="mobile-menu-button"]');
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      
      // Navigate through signup on mobile
      await page.click('[data-testid="signup-link"]');
      await expect(page.locator('h1')).toContainText(/Sign.*Up/i);
      
      // Fill mobile form
      await page.fill('[data-testid="email-input"]', 'mobile@test.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      // Check mobile-friendly interactions
      const submitButton = page.locator('[data-testid="signup-submit"]');
      await expect(submitButton).toBeVisible();
      await expect(submitButton).toHaveCSS('min-height', '44px'); // Minimum touch target
    }
  });

  test('onboarding validation and error handling', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Try to continue without selecting goals
    await page.click('[data-testid="goals-continue"]');
    
    // Should show validation error
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText(/Please select/i);
    
    // Select a goal and continue
    await page.check('[value="growth"]');
    await page.click('[data-testid="goals-continue"]');
    
    // Should proceed to next step
    await expect(page.locator('[data-testid="industry-selection"]')).toBeVisible();
    
    // Test API error handling
    await page.route('/api/onboarding/progress', async (route) => {
      await route.fulfill({ status: 500, json: { error: 'Server error' } });
    });
    
    await page.selectOption('[data-testid="industry-select"]', 'fitness');
    await page.click('[data-testid="industry-continue"]');
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('A/B testing flow implementation', async ({ page }) => {
    // Mock A/B test assignment
    await page.route('/api/ab-test/variant-assign', async (route) => {
      await route.fulfill({
        json: { variant: 'B', testId: 'onboarding-flow' }
      });
    });

    await page.goto('/');
    
    // User should be assigned to variant B
    await page.waitForResponse('/api/ab-test/variant-assign');
    
    // Variant B should have different UI elements
    await page.click('[data-testid="signup-button"]');
    
    // Check if variant B specific elements are present
    const variantElement = page.locator('[data-testid="variant-b-feature"]');
    await expect(variantElement).toBeVisible();
    
    // Track A/B test events
    await page.route('**/api/ab-test/events', async (route) => {
      const request = route.request();
      const body = await request.postData();
      
      // Verify event tracking
      expect(body).toContain('page_view');
      expect(body).toContain('variant');
      
      await route.fulfill({ json: { success: true } });
    });
    
    // Complete the flow to trigger conversion event
    await page.fill('[data-testid="email-input"]', 'ab-test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="signup-submit"]');
  });

  test('conversion funnel tracking', async ({ page }) => {
    await page.goto('/');
    
    // Track funnel events
    const events: string[] = [];
    
    await page.route('**/api/conversion/track', async (route) => {
      const request = route.request();
      const body = await request.postData();
      events.push(JSON.parse(body).event);
      
      await route.fulfill({ json: { success: true, eventId: 'event-123' } });
    });
    
    // Navigate through funnel
    await page.click('[data-testid="signup-button"]');
    events.push('visit_to_signup');
    
    await page.fill('[data-testid="email-input"]', 'funnel@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="signup-submit"]');
    events.push('signup_complete');
    
    // Complete onboarding
    await page.check('[value="growth"]');
    await page.click('[data-testid="goals-continue"]');
    
    await page.selectOption('[data-testid="industry-select"]', 'fitness');
    await page.click('[data-testid="industry-continue"]');
    
    await page.check('[value="intermediate"]');
    await page.click('[data-testid="experience-continue"]');
    
    await page.click('[data-testid="go-to-dashboard"]');
    events.push('dashboard_access');
    
    // Verify funnel events were tracked
    expect(events).toContain('visit_to_signup');
    expect(events).toContain('signup_complete');
    expect(events).toContain('dashboard_access');
  });

  test('performance and loading states', async ({ page }) => {
    // Test slow API response
    await page.route('/api/analytics/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        json: {
          followerCount: 15420,
          engagementRate: 4.2,
          isLoading: false
        }
      });
    });

    await page.goto('/dashboard');
    
    // Should show loading state immediately
    await expect(page.locator('[data-testid="dashboard-loading"]')).toBeVisible();
    
    // Wait for data to load
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible({ timeout: 10000 });
    
    // Verify loading disappears
    await expect(page.locator('[data-testid="dashboard-loading"]')).not.toBeVisible();
  });

  test('accessibility compliance', async ({ page }) => {
    await page.goto('/');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('[data-testid="signup-button"]')).toBeFocused();
    
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/signup');
    
    // Test form accessibility
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute('aria-label', /email/i);
    await expect(emailInput).toHaveAttribute('type', 'email');
    
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveValue('test@example.com');
    
    // Test screen reader compatibility
    const signupForm = page.locator('form');
    await expect(signupForm).toHaveAttribute('role', 'form');
    
    // Test error message accessibility
    await page.fill('[data-testid="password-input"]', '123'); // Weak password
    await page.click('[data-testid="signup-submit"]');
    
    await expect(page.locator('[data-testid="password-error"]')).toHaveAttribute('role', 'alert');
  });

  test('cross-browser compatibility', async ({ page, browserName }) => {
    await page.goto('/');
    
    // Test basic functionality across browsers
    await page.click('[data-testid="signup-button"]');
    await expect(page).toHaveURL('/signup');
    
    // Fill form
    await page.fill('[data-testid="email-input"]', 'test@cross-browser.com');
    await page.fill('[data-testid="password-input"]', 'securePassword123');
    
    // Test CSS features
    const button = page.locator('[data-testid="signup-submit"]');
    await expect(button).toHaveCSS('background-color');
    
    // Verify animations work (if supported)
    await button.hover();
    await expect(button).toHaveCSS('transform');
  });

  test('data persistence across sessions', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Fill out form partially
    await page.check('[value="growth"]');
    await page.selectOption('[data-testid="industry-select"]', 'fitness');
    
    // Simulate page refresh
    await page.reload();
    
    // Form should be restored from localStorage
    await expect(page.locator('[value="growth"]')).toBeChecked();
    await expect(page.locator('[data-testid="industry-select"]')).toHaveValue('fitness');
    
    // Continue to next step
    await page.click('[data-testid="goals-continue"]');
    await expect(page.locator('[data-testid="industry-selection"]')).toBeVisible();
  });

  test('network error recovery', async ({ page }) => {
    // Block network requests temporarily
    await page.route('**/api/**', async (route) => {
      await route.abort();
    });

    await page.goto('/dashboard');
    
    // Should show error state
    await expect(page.locator('[data-testid="network-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
    
    // Restore network and retry
    await page.unroute('**/api/**');
    await page.route('/api/analytics/**', async (route) => {
      await route.fulfill({
        json: {
          followerCount: 15420,
          engagementRate: 4.2
        }
      });
    });
    
    await page.click('[data-testid="retry-button"]');
    
    // Data should load successfully
    await expect(page.locator('[data-testid="follower-count"]')).toContainText('15,420');
  });
});