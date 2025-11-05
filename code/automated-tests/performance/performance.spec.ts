import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('page load performance', async ({ page }) => {
    // Start measuring performance
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
    
    // Check Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const metrics: any = {};
          
          entries.forEach((entry) => {
            if (entry.entryType === 'paint') {
              metrics[entry.name] = entry.startTime;
            }
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime;
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = entry.processingStart - entry.startTime;
            }
            if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
              metrics.cls += entry.value;
            }
          });
          
          resolve(metrics);
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });
      });
    });
    
    console.log('Performance Metrics:', metrics);
    
    // LCP should be under 2.5 seconds
    if (metrics.lcp) {
      expect(metrics.lcp).toBeLessThan(2500);
    }
    
    // FID should be under 100ms
    if (metrics.fid) {
      expect(metrics.fid).toBeLessThan(100);
    }
    
    // CLS should be under 0.1
    if (metrics.cls) {
      expect(metrics.cls).toBeLessThan(0.1);
    }
  });

  test('dashboard rendering performance', async ({ page }) => {
    // Navigate to dashboard with lots of data
    await page.goto('/dashboard');
    
    const renderStart = Date.now();
    
    // Wait for main content to render
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    const renderTime = Date.now() - renderStart;
    
    // Dashboard should render within 1 second
    expect(renderTime).toBeLessThan(1000);
    
    // Check for expensive operations
    const longTasks = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const longTasks = list.getEntries().filter((entry) => entry.duration > 50);
          resolve(longTasks.length);
        });
        observer.observe({ entryTypes: ['longtask'] });
      });
    });
    
    // Should have no long tasks
    expect(longTasks).toBe(0);
  });

  test('API response time', async ({ page }) => {
    const responseTimes: number[] = [];
    
    // Intercept API calls and measure response times
    await page.route('**/api/**', async (route) => {
      const startTime = Date.now();
      await route.continue();
      const responseTime = Date.now() - startTime;
      responseTimes.push(responseTime);
    });
    
    await page.goto('/dashboard');
    
    // Wait for API calls to complete
    await page.waitForTimeout(2000);
    
    // All API responses should be under 500ms
    responseTimes.forEach((time) => {
      expect(time).toBeLessThan(500);
    });
    
    // Average should be under 200ms
    const average = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
    expect(average).toBeLessThan(200);
  });

  test('memory usage during navigation', async ({ page }) => {
    await page.goto('/');
    
    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through multiple pages
    const pages = ['/onboarding', '/dashboard', '/analytics', '/insights', '/settings'];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Force garbage collection if available
      if ((window as any).gc) {
        await page.evaluate(() => (window as any).gc());
      }
    }
    
    // Return to homepage
    await page.goto('/');
    
    // Get final memory usage
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });
    
    // Memory should not increase by more than 50MB
    const memoryIncrease = finalMemory - initialMemory;
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // 50MB in bytes
  });

  test('concurrent user interactions performance', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Measure performance with multiple concurrent interactions
    const interactions = [
      () => page.click('[data-testid="filter-button"]'),
      () => page.selectOption('[data-testid="date-range"]', '7d'),
      () => page.click('[data-testid="chart-type-toggle"]'),
      () => page.fill('[data-testid="search-input"]', 'test'),
      () => page.click('[data-testid="export-button"]'),
    ];
    
    const startTime = Date.now();
    
    // Execute all interactions concurrently
    await Promise.all(interactions.map(action => action()));
    
    const totalTime = Date.now() - startTime;
    
    // Multiple interactions should complete within 2 seconds
    expect(totalTime).toBeLessThan(2000);
    
    // Check that UI remains responsive
    const responsiveButton = page.locator('[data-testid="filter-button"]');
    await responsiveButton.click();
    
    // Should respond immediately
    await expect(responsiveButton).toBeVisible();
  });

  test('large dataset rendering performance', async ({ page }) => {
    // Mock large dataset
    await page.route('/api/analytics/**', async (route) => {
      const largeDataset = {
        insights: Array.from({ length: 1000 }, (_, i) => ({
          id: i,
          title: `Insight ${i}`,
          value: Math.random() * 1000,
          timestamp: new Date().toISOString()
        })),
        charts: Array.from({ length: 100 }, (_, i) => ({
          id: i,
          data: Array.from({ length: 365 }, (_, j) => ({
            date: new Date(Date.now() - j * 24 * 60 * 60 * 1000).toISOString(),
            value: Math.random() * 1000
          }))
        }))
      };
      
      await route.fulfill({ json: largeDataset });
    });
    
    await page.goto('/dashboard');
    
    const renderStart = Date.now();
    
    // Wait for all data to render
    await page.waitForSelector('[data-testid="insight-card"]', { timeout: 10000 });
    
    const renderTime = Date.now() - renderStart;
    
    // Should render large datasets within 3 seconds
    expect(renderTime).toBeLessThan(3000);
    
    // Check that not all DOM nodes are created (virtualization)
    const totalElements = await page.locator('*').count();
    expect(totalElements).toBeLessThan(5000); // Should use virtualization
  });

  test('animation performance', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Measure animation performance
    const animationMetrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const animations = entries.filter(entry => 
            entry.entryType === 'animation' || 
            entry.name?.includes('transition') ||
            entry.name?.includes('animation')
          );
          
          const metrics = animations.map(anim => ({
            name: anim.name,
            duration: anim.duration,
            startTime: anim.startTime
          }));
          
          resolve(metrics);
        });
        
        observer.observe({ entryTypes: ['animation'] });
        
        // Trigger animations
        setTimeout(() => resolve([]), 3000);
      });
    });
    
    // Check that animations are performant
    if (Array.isArray(animationMetrics)) {
      animationMetrics.forEach((anim: any) => {
        if (anim.duration) {
          expect(anim.duration).toBeLessThan(300); // Animations should be under 300ms
        }
      });
    }
  });

  test('bundle size optimization', async ({ page }) => {
    const response = await page.goto('/');
    const content = await response?.text();
    
    // Get page size
    const pageSize = content?.length || 0;
    
    // Initial page should be under 500KB
    expect(pageSize).toBeLessThan(500 * 1024);
    
    // Check for large images
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        size: img.naturalWidth * img.naturalHeight,
        fileSize: img.naturalWidth * img.naturalHeight * 4 // Assume RGBA
      }))
    );
    
    // Check for properly optimized images
    for (const img of images) {
      if (img.size > 0) {
        // Images should not be unnecessarily large
        expect(img.size).toBeLessThan(1920 * 1080 * 4); // 4K RGB
      }
    }
  });

  test('caching effectiveness', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Clear cache
    await page.evaluate(() => {
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    });
    
    const firstLoadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.loadEventStart;
    });
    
    // Navigate away and back to test caching
    await page.goto('/');
    await page.goto('/dashboard');
    
    const cachedLoadTime = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return navigation.loadEventEnd - navigation.loadEventStart;
    });
    
    // Cached load should be significantly faster
    expect(cachedLoadTime).toBeLessThan(firstLoadTime * 0.5);
  });

  test('progressive loading performance', async ({ page }) => {
    // Test progressive loading of dashboard components
    await page.goto('/dashboard');
    
    // Check that critical content loads first
    await expect(page.locator('h1')).toBeVisible({ timeout: 1000 });
    
    // Non-critical content can load later
    await expect(page.locator('[data-testid="chart-legend"]')).toBeVisible({ timeout: 5000 });
    
    // Test that loading states are properly shown
    const loadingStates = await page.locator('[data-testid*="loading"]').count();
    expect(loadingStates).toBeGreaterThan(0);
    
    // Loading states should disappear
    await page.waitForTimeout(3000);
    const remainingLoadingStates = await page.locator('[data-testid*="loading"]').count();
    expect(remainingLoadingStates).toBe(0);
  });
});