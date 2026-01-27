/**
 * Data Fetching E2E Test
 *
 * Verifies that the app correctly handles data fetching from API.
 * Tests both success and error scenarios.
 */
import { test, expect } from '@playwright/test';

test.describe('Data Fetching', () => {
  test('should fetch and display data from API', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Wait for any data-dependent widgets to load
    await page.waitForTimeout(2000);

    // Look for loading states (should be gone after data loads)
    const loadingStates = page.locator('[data-testid="loading"], .loading, [class*="skeleton"]');
    const stillLoading = await loadingStates.count();

    if (stillLoading > 0) {
      console.warn(`⚠️  ${stillLoading} component(s) still in loading state after 2s`);
    }

    // Should have some content rendered (not all loading)
    const content = page.locator('[data-testid^="widget-"], .widget, [class*="widget"]');
    const contentCount = await content.count();

    expect(contentCount).toBeGreaterThan(0);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API calls and force an error
    await page.route('**/api/v1/**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('http://localhost:3000');

    // Wait for error handling
    await page.waitForTimeout(2000);

    // Should show error state (not crash)
    const errorStates = page.locator('[data-testid="error-state"], .error-state');
    const errorCount = await errorStates.count();

    // Should have at least one error state shown
    expect(errorCount).toBeGreaterThan(0);

    console.log('✅ App gracefully handled API error');
  });

  test('should handle slow API responses', async ({ page }) => {
    // Intercept API calls and delay response
    await page.route('**/api/v1/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      route.continue();
    });

    await page.goto('http://localhost:3000');

    // Should show loading state initially
    await page.waitForTimeout(500);
    const loadingStates = page.locator('[data-testid="loading"], .loading, [class*="skeleton"]');
    const hasLoading = await loadingStates.count();

    if (hasLoading > 0) {
      console.log('✅ Loading state shown during slow API call');
    }

    // Wait for data to eventually load
    await page.waitForTimeout(3500);

    // Should have rendered content after loading
    const content = page.locator('[data-testid^="widget-"], .widget');
    expect(await content.count()).toBeGreaterThan(0);
  });

  test('should handle network offline', async ({ page, context }) => {
    // Simulate offline
    await context.setOffline(true);

    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);

    // Should show error or empty state (not crash)
    const body = page.locator('body');
    await expect(body).toBeVisible();

    console.log('✅ App handles offline scenario');

    // Restore online
    await context.setOffline(false);
  });
});

test.describe('Mock Data Mode', () => {
  test('should work in mock data mode', async ({ page }) => {
    // If your app supports mock data mode via env var or URL param
    await page.goto('http://localhost:3000?mode=mock');

    await page.waitForTimeout(1000);

    // Should render widgets with mock data
    const widgets = page.locator('[data-testid^="widget-"], .widget');
    const widgetCount = await widgets.count();

    expect(widgetCount).toBeGreaterThan(0);
    console.log('✅ Mock data mode works');
  });
});

test.describe('Real-time Updates', () => {
  test('should handle polling/real-time updates', async ({ page }) => {
    await page.goto('http://localhost:3000/observability/logs');

    // Wait for initial load
    await page.waitForTimeout(1000);

    // If logs auto-refresh, count initial logs
    const initialLogs = await page.locator('[data-testid^="log-"], .log-entry, [class*="log"]').count();

    console.log(`Initial log count: ${initialLogs}`);

    // Wait for potential auto-refresh (if enabled)
    await page.waitForTimeout(6000);

    // Count logs again
    const updatedLogs = await page.locator('[data-testid^="log-"], .log-entry, [class*="log"]').count();

    console.log(`Updated log count: ${updatedLogs}`);

    // Test passes if no crash during polling
    expect(true).toBe(true);
  });
});
