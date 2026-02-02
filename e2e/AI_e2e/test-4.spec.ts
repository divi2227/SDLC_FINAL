import { test, expect } from '@playwright/test';

test.describe('User Journey - Performance and Reliability', () => {
  test('should load page quickly without errors', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should handle rapid navigation without crashes', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.goBack();
    await page.waitForURL('/?priority=growth');
    
    await page.getByRole('button', { name: /Dividends/i }).click();
    await page.waitForURL('/?priority=dividends');
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should persist state correctly across multiple interactions', async ({ page }) => {
    await page.goto('/?priority=growth');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});
