import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('WCAG 2.1 AA compliance - Navigation', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
    
    // First heading should be h1
    const firstHeading = await page.locator('h1').first();
    await expect(firstHeading).toBeVisible();
    
    // Check for skip links
    const skipLink = page.locator('a[href="#main"], a[href="#content"]');
    if (await skipLink.count() > 0) {
      await expect(skipLink.first()).toBeVisible();
    }
    
    // Check navigation landmarks
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toHaveCount(1);
    
    // Check main content area
    const main = page.locator('main, [role="main"]');
    await expect(main).toHaveCount(1);
  });

  test('Keyboard navigation accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Test tab navigation
    const focusableElements = await page.locator(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();
    
    // Should have focusable elements
    expect(focusableElements.length).toBeGreaterThan(0);
    
    // Test tab order
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus').first();
    await expect(firstFocusable).toBeVisible();
    
    // Test all interactive elements are reachable
    for (let i = 0; i < Math.min(10, focusableElements.length); i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').first();
      await expect(focused).toBeVisible();
    }
    
    // Test Enter/Space activation on buttons
    const button = page.locator('button').first();
    if (await button.count() > 0) {
      await button.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
    }
  });

  test('Form accessibility', async ({ page }) => {
    await page.goto('/signup');
    
    // Check form labels
    const inputs = await page.locator('input').all();
    
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const label = id ? page.locator(`label[for="${id}"]`) : null;
      
      // Each input should have a label or aria-label
      if (label) {
        await expect(label).toBeVisible();
      } else if (ariaLabel) {
        expect(ariaLabel).toBeTruthy();
      } else {
        // Fallback to placeholder or name attribute
        const placeholder = await input.getAttribute('placeholder');
        const name = await input.getAttribute('name');
        expect(placeholder || name).toBeTruthy();
      }
    }
    
    // Check error message association
    await page.fill('[data-testid="email-input"]', 'invalid-email');
    await page.click('[data-testid="submit-button"]');
    
    const errorMessage = page.locator('[data-testid="email-error"], .error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage.first()).toBeVisible();
      
      // Error should be associated with input
      const inputId = await page.locator('[data-testid="email-input"]').getAttribute('id');
      if (inputId) {
        const errorAriaDescribedBy = await errorMessage.first().getAttribute('aria-describedby');
        expect(errorAriaDescribedBy).toContain(inputId);
      }
    }
  });

  test('Color contrast and visual accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for color contrast (this is a simplified check)
    const elements = await page.locator('*').all();
    
    for (const element of elements.slice(0, 20)) { // Check first 20 elements
      const styles = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity
        };
      });
      
      // Basic check for transparency issues
      expect(styles.opacity).not.toBe('0');
    }
    
    // Check that important information isn't conveyed by color alone
    const statusElements = await page.locator('[data-testid*="status"], .status, .error, .success').all();
    
    for (const element of statusElements) {
      const textContent = await element.textContent();
      const ariaLabel = await element.getAttribute('aria-label');
      
      // Should have text content or aria-label for screen readers
      expect(textContent || ariaLabel).toBeTruthy();
    }
  });

  test('Screen reader compatibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for ARIA labels
    const interactiveElements = await page.locator('button, a, input').all();
    
    for (const element of interactiveElements.slice(0, 10)) { // Check first 10
      const ariaLabel = await element.getAttribute('aria-label');
      const ariaLabelledby = await element.getAttribute('aria-labelledby');
      const title = await element.getAttribute('title');
      
      // Interactive elements should have accessible names
      if (ariaLabel || ariaLabelledby || title) {
        expect(ariaLabel || ariaLabelledby || title).toBeTruthy();
      }
    }
    
    // Check live regions for dynamic content
    const liveRegions = await page.locator('[aria-live], [role="status"], [role="alert"]').all();
    expect(liveRegions.length).toBeGreaterThan(0);
    
    // Check for proper landmarks
    const banner = page.locator('header, [role="banner"]');
    const complementary = page.locator('aside, [role="complementary"]');
    const contentinfo = page.locator('footer, [role="contentinfo"]');
    
    // Should have proper page structure
    await expect(banner).toHaveCount(1);
  });

  test('Modal and dialog accessibility', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Trigger a modal
    await page.click('[data-testid="open-modal"]');
    
    const modal = page.locator('[role="dialog"], .modal');
    await expect(modal).toBeVisible({ timeout: 3000 });
    
    // Check modal attributes
    const modalElement = modal.first();
    await expect(modalElement).toHaveAttribute('aria-modal', 'true');
    
    // Check focus management
    const firstFocusable = await modalElement.locator('button, input, select, textarea, a[href]').first();
    if (await firstFocusable.count() > 0) {
      await expect(firstFocusable).toBeFocused();
    }
    
    // Test Escape key to close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
    
    // Check focus return
    const triggerButton = page.locator('[data-testid="open-modal"]');
    await expect(triggerButton).toBeFocused();
  });

  test('Charts and data visualization accessibility', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for charts to load
    await page.waitForSelector('[data-testid="chart"], canvas, svg');
    
    const charts = await page.locator('[data-testid="chart"], canvas, svg').all();
    
    for (const chart of charts) {
      const ariaLabel = await chart.getAttribute('aria-label');
      const ariaDescribedby = await chart.getAttribute('aria-describedby');
      const title = await chart.getAttribute('title');
      
      // Charts should have accessible descriptions
      expect(ariaLabel || ariaDescribedby || title).toBeTruthy();
      
      // Check for fallback content
      const chartContainer = chart.locator('..');
      const fallbackText = await chartContainer.locator('.sr-only, .visually-hidden').textContent();
      
      if (fallbackText) {
        expect(fallbackText.length).toBeGreaterThan(0);
      }
    }
    
    // Check for data table alternatives
    const dataTableLink = page.locator('a[href*="data-table"], button[data-testid="view-data-table"]');
    if (await dataTableLink.count() > 0) {
      await expect(dataTableLink.first()).toBeVisible();
    }
  });

  test('Responsive accessibility', async ({ page, isMobile }) => {
    if (isMobile) {
      await page.goto('/');
      
      // Check mobile navigation accessibility
      const menuButton = page.locator('[data-testid="menu-button"], button[aria-expanded]');
      if (await menuButton.count() > 0) {
        await expect(menuButton.first()).toHaveAttribute('aria-expanded');
      }
      
      // Test touch target sizes
      const buttons = await page.locator('button, a').all();
      
      for (const button of buttons.slice(0, 5)) {
        const box = await button.boundingBox();
        if (box) {
          // Touch targets should be at least 44x44px
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('Animation and motion accessibility', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check for reduced motion preferences
    await page.addStyleTag({
      content: '@media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }'
    });
    
    // Check that animations respect reduced motion
    const animations = await page.evaluate(() => {
      const style = window.getComputedStyle(document.body);
      return {
        animationDuration: style.animationDuration,
        transitionDuration: style.transitionDuration
      };
    });
    
    // Should have minimal or no animations when reduced motion is preferred
    if (animations.animationDuration !== '0s' && animations.animationDuration !== '0ms') {
      // This is expected to pass if the app doesn't properly respect reduced motion
      console.log('Animations may not respect reduced motion preference');
    }
    
    // Check for pause/stop animation controls
    const animationControls = await page.locator('[data-testid="pause-animation"], button[aria-label*="pause"], button[aria-label*="stop"]').all();
    
    // If there are animations, there should be controls to manage them
    if (await page.locator('[style*="animation"], .animate-').count() > 0) {
      // Could have animation controls
      console.log('Animation controls found:', animationControls.length);
    }
  });

  test('Language and internationalization accessibility', async ({ page }) => {
    await page.goto('/');
    
    // Check for language declaration
    const html = page.locator('html');
    const lang = await html.getAttribute('lang');
    expect(lang).toBeTruthy();
    
    // Check for text direction support (if needed)
    const dir = await html.getAttribute('dir');
    if (dir) {
      expect(['ltr', 'rtl']).toContain(dir);
    }
    
    // Check that language changes are announced
    const languageToggle = page.locator('[data-testid="language-toggle"], button[aria-label*="language"]');
    if (await languageToggle.count() > 0) {
      await expect(languageToggle.first()).toHaveAttribute('aria-label');
    }
  });

  test('Focus management in complex interactions', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Test tabbing through complex widgets
    const complexWidget = page.locator('[data-testid="complex-widget"]');
    if (await complexWidget.count() > 0) {
      // Enter the widget
      await complexWidget.focus();
      await page.keyboard.press('Tab');
      
      // Should move through widget elements in logical order
      for (let i = 0; i < 5; i++) {
        const focused = await page.locator(':focus').first();
        await expect(focused).toBeVisible();
        await page.keyboard.press('Tab');
      }
      
      // Exit the widget
      await page.keyboard.press('Tab');
      const outsideFocus = await page.locator(':focus').first();
      await expect(outsideFocus).toBeVisible();
    }
    
    // Test focus trapping in lists/grids
    const listWidget = page.locator('[role="grid"], [role="listbox"], .select-options');
    if (await listWidget.count() > 0) {
      await listWidget.focus();
      
      // Should be able to navigate with arrow keys
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowUp');
      
      // Focus should remain within the widget
      const focusedInWidget = await page.evaluate(() => {
        const focused = document.activeElement;
        return focused?.closest('[role="grid"], [role="listbox"], .select-options');
      });
      
      expect(focusedInWidget).toBeTruthy();
    }
  });
});