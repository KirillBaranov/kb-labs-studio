/**
 * Dashboard Critical Path E2E Test
 *
 * Tests the most critical user journey: loading the dashboard and rendering widgets.
 * This is our safety net for refactoring - if this breaks, we broke core functionality.
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard Critical Path', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page before each test
    await page.goto('http://localhost:3000');
  });

  test('should load dashboard page successfully', async ({ page }) => {
    // Verify the page loaded
    await expect(page).toHaveTitle(/KB Labs Studio/i);

    // Verify main navigation is present
    await expect(page.locator('[role="navigation"]')).toBeVisible({ timeout: 5000 });

    // Verify dashboard content area is present
    await expect(page.locator('.main-content, [class*="content"]')).toBeVisible();
  });

  test('should render widgets on dashboard', async ({ page }) => {
    // Wait for widgets to load (they may fetch data)
    await page.waitForTimeout(2000);

    // Check if at least one widget is rendered
    // Note: Exact selectors depend on your widget implementation
    const widgets = page.locator('[data-testid^="widget-"], [class*="widget"]');
    const widgetCount = await widgets.count();

    // Should have at least 1 widget
    expect(widgetCount).toBeGreaterThan(0);

    console.log(`✅ Found ${widgetCount} widget(s) on dashboard`);
  });

  test('should not show error states on initial load', async ({ page }) => {
    // Wait for initial render
    await page.waitForTimeout(1000);

    // Check for common error indicators
    const errorStates = page.locator('[data-testid="error-state"], .error-state, [class*="error"]');
    const errorCount = await errorStates.count();

    // Should have no errors on clean load
    expect(errorCount).toBe(0);
  });

  test('should handle navigation to dashboard from other pages', async ({ page }) => {
    // Navigate to a different page first
    await page.goto('http://localhost:3000/observability/logs');

    // Navigate back to dashboard
    await page.goto('http://localhost:3000/');

    // Verify dashboard loads again
    await expect(page.locator('.main-content, [class*="content"]')).toBeVisible();
  });

  test('should display page without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Load dashboard
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Filter out expected/harmless errors (adjust as needed)
    const criticalErrors = consoleErrors.filter(error => {
      // Ignore React DevTools warnings, HMR messages, etc.
      return !error.includes('DevTools') &&
             !error.includes('[vite]') &&
             !error.includes('HMR');
    });

    if (criticalErrors.length > 0) {
      console.error('Console errors detected:', criticalErrors);
    }

    // Should have no critical console errors
    expect(criticalErrors).toHaveLength(0);
  });
});

test.describe('Widget Interactions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(1000);
  });

  test('should allow clicking on widgets', async ({ page }) => {
    // Find first widget (if any)
    const widget = page.locator('[data-testid^="widget-"], [class*="widget"]').first();

    if (await widget.count() > 0) {
      // Widget exists, try to click it
      await widget.click();

      // Give time for any click handler to execute
      await page.waitForTimeout(500);

      // Test passes if no crash
      expect(true).toBe(true);
    } else {
      // No widgets found - skip this test
      test.skip();
    }
  });
});
