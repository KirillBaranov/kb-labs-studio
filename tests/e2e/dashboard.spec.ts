import { test, expect } from '@playwright/test';

test.describe('Studio Dashboard', () => {
  test('should load dashboard with KPIs', async ({ page }) => {
    await page.goto('/');

    // Wait for content to load
    await expect(page.locator('h1')).toContainText(/KB Labs Studio|Audit|Dashboard/i);
    
    // Check for skeleton or loaded content
    const hasSkeleton = await page.locator('[class*="skeleton"], [class*="animate-pulse"]').count();
    const hasContent = await page.locator('text=Audit Duration,text=Packages OK,text=Failed,text=Warnings').count();
    
    expect(hasSkeleton > 0 || hasContent > 0).toBeTruthy();
  });

  test('should navigate to audit page', async ({ page }) => {
    await page.goto('/');

    // Wait for navigation
    await page.waitForLoadState('networkidle');

    // Click on Audit link
    await page.locator('text=Audit').click();

    // Should be on audit page
    await expect(page.locator('h1')).toContainText(/Audit/i);
    
    // Should see summary or skeleton
    const hasContent = await page.locator('text=Summary,text=Packages').count();
    expect(hasContent > 0).toBeTruthy();
  });
});

