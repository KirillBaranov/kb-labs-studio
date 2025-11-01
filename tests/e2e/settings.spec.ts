import { test, expect } from '@playwright/test';

test.describe('Studio Settings', () => {
  test('should load settings page and show health status', async ({ page }) => {
    await page.goto('/settings');

    // Should see settings page
    await expect(page.locator('h1')).toContainText(/Settings/i);

    // Should see data sources health section
    const hasContent = await page.locator('text=Data Sources Health,text=audit,text=release,text=system').count();
    expect(hasContent > 0).toBeTruthy();
  });

  test('should allow theme toggle', async ({ page }) => {
    await page.goto('/');

    // Find theme toggle button
    const themeToggle = page.locator('button[aria-label="Toggle theme"]').first();
    
    if (await themeToggle.isVisible()) {
      const initialClass = await page.locator('html').getAttribute('data-theme');
      
      await themeToggle.click();
      await page.waitForTimeout(200);
      
      const newClass = await page.locator('html').getAttribute('data-theme');
      
      // Should have changed
      expect(newClass).not.toBe(initialClass);
    }
  });
});

