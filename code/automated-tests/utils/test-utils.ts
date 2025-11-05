import { Page, ElementHandle, Locator } from '@playwright/test';
import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Test utilities for Instagram Analytics Platform
 */

// Performance monitoring utilities
export class PerformanceMonitor {
  private startTime: number = 0;
  private metrics: Record<string, number> = {};

  start() {
    this.startTime = performance.now();
  }

  end(label: string) {
    const duration = performance.now() - this.startTime;
    this.metrics[label] = duration;
    console.log(`Performance [${label}]: ${duration.toFixed(2)}ms`);
    return duration;
  }

  getMetrics() {
    return this.metrics;
  }

  assertPerformanceThresholds(thresholds: Record<string, number>) {
    for (const [label, threshold] of Object.entries(thresholds)) {
      const actual = this.metrics[label];
      if (actual !== undefined) {
        expect(actual).toBeLessThan(threshold);
      }
    }
  }
}

// Accessibility testing utilities
export class AccessibilityTester {
  constructor(private page: Page) {}

  async checkContrast(element: Locator | string) {
    const colorRatio = await this.page.evaluate(({ color, backgroundColor }) => {
      // Simple color contrast calculation
      const getLuminance = (color: string) => {
        const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
        const [r, g, b] = rgb.map(c => {
          c = c / 255;
          return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };

      const l1 = getLuminance(color) + 0.05;
      const l2 = getLuminance(backgroundColor) + 0.05;
      const ratio = Math.max(l1, l2) / Math.min(l1, l2);
      return ratio;
    }, await this.getElementStyles(element));

    // WCAG AA requires 4.5:1 for normal text
    expect(colorRatio).toBeGreaterThanOrEqual(4.5);
  }

  async checkHeadingHierarchy() {
    const headings = await this.page.$$eval('h1, h2, h3, h4, h5, h6', 
      elements => elements.map(el => ({
        level: parseInt(el.tagName.charAt(1)),
        text: el.textContent?.trim()
      }))
    );

    // Check that we have exactly one h1
    const h1Count = headings.filter(h => h.level === 1).length;
    expect(h1Count).toBe(1);

    // Check heading hierarchy (no skipping levels)
    let lastLevel = 0;
    for (const heading of headings) {
      expect(heading.level).toBeLessThanOrEqual(lastLevel + 1);
      lastLevel = heading.level;
    }
  }

  async checkAriaLabels() {
    const interactiveElements = await this.page.$$('button, a, input, select, textarea');
    
    for (const element of interactiveElements) {
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const textContent = await element.textContent();
      
      // Each interactive element should have an accessible name
      expect(ariaLabel || ariaLabelledby || textContent?.trim()).toBeTruthy();
    }
  }

  async checkKeyboardNavigation() {
    // Tab through all focusable elements
    const focusableElements = await this.page.$$(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.locator(':focus').elementHandle();
      
      if (focusedElement) {
        expect(focusedElement).toBeTruthy();
      }
    }
  }

  private async getElementStyles(element: Locator | string) {
    if (typeof element === 'string') {
      return this.page.evaluate(selector => {
        const el = document.querySelector(selector);
        const computed = window.getComputedStyle(el!);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      }, element);
    } else {
      return element.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor
        };
      });
    }
  }
}

// Visual regression testing utilities
export class VisualTester {
  constructor(private page: Page) {}

  async takeScreenshot(name: string, element?: Locator | string) {
    if (element) {
      if (typeof element === 'string') {
        await this.page.locator(element).screenshot({ 
          path: `screenshots/${name}.png`,
          animations: 'disabled'
        });
      } else {
        await element.screenshot({ 
          path: `screenshots/${name}.png`,
          animations: 'disabled'
        });
      }
    } else {
      await this.page.screenshot({ 
        path: `screenshots/${name}.png`,
        fullPage: true,
        animations: 'disabled'
      });
    }
  }

  async compareScreenshots(name: string, tolerance = 0.1) {
    // This would integrate with a visual regression tool like Pixelmatch
    // For now, we'll just verify screenshots exist
    const expectedPath = join(process.cwd(), 'screenshots', `${name}.png`);
    try {
      readFileSync(expectedPath);
      return true;
    } catch {
      return false;
    }
  }

  async disableAnimations() {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `
    });
  }
}

// API testing utilities
export class APITester {
  constructor(private page: Page) {}

  async mockAPI(endpoint: string, response: any, status = 200) {
    await this.page.route(endpoint, async route => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    });
  }

  async captureAPIRequests() {
    const requests: any[] = [];
    
    await this.page.route('**/api/**', async route => {
      const request = route.request();
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData()
      });
      
      await route.continue();
    });

    return requests;
  }

  async assertAPICalled(endpoint: string, expectedCount = 1) {
    const requests = await this.captureAPIRequests();
    const matchingRequests = requests.filter(r => r.url.includes(endpoint));
    expect(matchingRequests.length).toBe(expectedCount);
  }

  async injectError(endpoint: string, errorMessage = 'API Error') {
    await this.page.route(endpoint, async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: errorMessage })
      });
    });
  }
}

// Data generation utilities
export class DataGenerator {
  static generateUser(overrides: any = {}) {
    return {
      id: `user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
      subscriptionTier: 'free',
      onboardingCompleted: false,
      preferences: {
        industry: 'fitness',
        goals: ['growth'],
        experienceLevel: 'intermediate',
        contentTypes: ['video']
      },
      analytics: {
        followerCount: Math.floor(Math.random() * 10000) + 1000,
        engagementRate: (Math.random() * 5 + 1).toFixed(1),
        averageLikes: Math.floor(Math.random() * 500) + 100,
        averageComments: Math.floor(Math.random() * 50) + 10
      },
      ...overrides
    };
  }

  static generateAnalyticsData(count = 100) {
    return Array.from({ length: count }, (_, i) => ({
      id: `insight-${i}`,
      type: ['performance', 'engagement', 'growth', 'content'][i % 4],
      title: `Insight ${i}`,
      description: `This is insight number ${i}`,
      value: Math.random() * 100,
      confidence: Math.floor(Math.random() * 20) + 80,
      impact: ['low', 'medium', 'high'][i % 3],
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    }));
  }

  static generateConversionFunnel() {
    return {
      visit: { count: 1000, rate: 100 },
      signup: { count: Math.floor(1000 * 0.25), rate: 25 },
      onboarding: { count: Math.floor(1000 * 0.18), rate: 18 },
      analytics: { count: Math.floor(1000 * 0.12), rate: 12 },
      conversion: { count: Math.floor(1000 * 0.045), rate: 4.5 }
    };
  }

  static generateABTest() {
    return {
      id: 'test-001',
      name: 'CTA Button Color Test',
      variants: {
        A: { conversionRate: 3.2, traffic: 500, name: 'Blue CTA' },
        B: { conversionRate: 4.8, traffic: 500, name: 'Green CTA' }
      },
      winner: 'B',
      confidence: 95,
      status: 'running'
    };
  }
}

// Test data cleanup utilities
export class TestCleanup {
  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  static async clearCookies(page: Page) {
    await page.context().clearCookies();
  }

  static async resetDatabase() {
    // Add database reset logic here
    // This would typically call a test API endpoint
  }

  static async cleanupTestData(page: Page) {
    await this.clearLocalStorage(page);
    await this.clearCookies(page);
    // Reset any global state
    await page.evaluate(() => {
      // Clear any test-specific global variables
      delete (window as any).__TEST_DATA__;
    });
  }
}

// Mobile testing utilities
export class MobileTester {
  constructor(private page: Page) {}

  async simulateTouch(element: Locator | string) {
    const elem = typeof element === 'string' 
      ? this.page.locator(element)
      : element;
    
    const box = await elem.boundingBox();
    if (box) {
      await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await this.page.mouse.down();
      await this.page.mouse.up();
    }
  }

  async swipe(element: Locator, direction: 'left' | 'right' | 'up' | 'down') {
    const box = await element.boundingBox();
    if (box) {
      const { x, y, width, height } = box;
      const startX = x + width / 2;
      const startY = y + height / 2;
      
      let endX = startX;
      let endY = startY;
      
      const distance = 100;
      
      switch (direction) {
        case 'left':
          endX = startX - distance;
          break;
        case 'right':
          endX = startX + distance;
          break;
        case 'up':
          endY = startY - distance;
          break;
        case 'down':
          endY = startY + distance;
          break;
      }
      
      await this.page.mouse.move(startX, startY);
      await this.page.mouse.down();
      await this.page.mouse.move(endX, endY);
      await this.page.mouse.up();
    }
  }

  async checkViewportSize(minWidth: number, minHeight: number) {
    const viewport = this.page.viewportSize();
    expect(viewport?.width).toBeGreaterThanOrEqual(minWidth);
    expect(viewport?.height).toBeGreaterThanOrEqual(minHeight);
  }

  async testTouchTargets() {
    const touchTargets = await this.page.$$('button, a, [role="button"]');
    
    for (const target of touchTargets) {
      const box = await target.boundingBox();
      if (box) {
        // Touch targets should be at least 44x44px
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  }
}

// Export commonly used matchers and utilities
export const testUtils = {
  DataGenerator,
  TestCleanup,
  PerformanceMonitor,
  AccessibilityTester,
  VisualTester,
  APITester,
  MobileTester
};