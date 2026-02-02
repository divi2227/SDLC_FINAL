import { test, expect } from '@playwright/test';

test.describe('User Journey - Stock Research and Detail View', () => {
  test('should research multiple stocks and view detailed metrics', async ({ page }) => {
    await page.goto('/?priority=dividends');
    
    const dividendsButton = page.getByRole('button', { name: /Dividends/i });
    await expect(dividendsButton).toHaveClass(/active/);
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
    await expect(page.getByText(/Dividend Yield/i)).toBeVisible();
    
    const dividendCard = page.locator('.dividend-content');
    const dividendValue = dividendCard.locator('div[style*="font-size: 2rem"]');
    await expect(dividendValue).toBeVisible();
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForLoadState('domcontentloaded');
    
    const secondTicker = await page.locator('tbody tr').nth(1).locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(secondTicker!.trim());
  });
});

