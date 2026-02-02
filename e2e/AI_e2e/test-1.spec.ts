import { test, expect } from '@playwright/test';

test.describe('User Journey - Complete Investment Flow', () => {
  test('should complete full investment research journey from home to stock detail', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Stock Analysis Platform/);
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/\/stock\//);
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
    
    await expect(page.getByText(/Return on Investment/i)).toBeVisible();
    await expect(page.getByText(/Growth Potential/i)).toBeVisible();
    await expect(page.getByText(/Dividend Yield/i)).toBeVisible();
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
  });
});
