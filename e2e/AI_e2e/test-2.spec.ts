import { test, expect } from '@playwright/test';

test.describe('User Journey - Priority Comparison Flow', () => {
  test('should compare different priorities to find best stocks', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /ROI/i }).click();
    await page.waitForURL('/?priority=roi');
    
    const roiFirstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await expect(page.getByRole('columnheader', { name: 'ROI' })).toBeVisible();
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await expect(page.getByRole('columnheader', { name: 'Growth' })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
    
    await page.getByRole('button', { name: /Dividends/i }).click();
    await page.waitForURL('/?priority=dividends');
    
    await expect(page.getByRole('columnheader', { name: 'Dividend' })).toBeVisible();
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });
});
