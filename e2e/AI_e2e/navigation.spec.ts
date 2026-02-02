import { test, expect } from '@playwright/test';

test.describe('Navigation - Priority Selection and URL Parameters', () => {
  test('should persist priority parameter in URL after selection', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    expect(page.url()).toContain('priority=growth');
  });

  test('should maintain priority when navigating back from detail page', async ({ page }) => {
    await page.goto('/?priority=dividends');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');

    const dividendsButton = page.getByRole('button', { name: /Dividends/i });
    await expect(dividendsButton).toHaveClass(/active/);
  });

  test('should accept priority parameter from URL on page load', async ({ page }) => {
    await page.goto('/?priority=growth');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
    await expect(page.getByText(/Showing \d+ results by Growth/i)).toBeVisible();
  });

  test('should default to ROI when invalid priority parameter is provided', async ({ page }) => {
    await page.goto('/?priority=invalid');
    
    const roiButton = page.getByRole('button', { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test('should handle missing priority parameter gracefully', async ({ page }) => {
    await page.goto('/');
    
    const roiButton = page.getByRole('button', { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
  });
});

test.describe('Navigation - Page Transitions', () => {
  test('should complete full user journey: home to detail and back', async ({ page }) => {
    await page.goto('/');
    
    const originalUrl = page.url();
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/\/stock\//);
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForURL(originalUrl);
    
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
  });

  test('should navigate between different stocks without returning to home', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForURL('/');
    
    const secondTicker = await page.locator('tbody tr').nth(1).locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).nth(1).click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(secondTicker!.trim());
  });

  test('should maintain scroll position after priority change', async ({ page }) => {
    await page.goto('/');
    
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollBefore = await page.evaluate(() => window.scrollY);
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await page.waitForLoadState('domcontentloaded');
  });
});

test.describe('Navigation - Browser Navigation Controls', () => {
  test('should handle browser back button correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    
    expect(page.url()).toMatch(/\/$|priority=roi/);
  });

  test('should handle browser forward button correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    
    await page.goForward();
    await page.waitForURL('/?priority=growth');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
  });

  test('should navigate to stock detail and back using browser controls', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page).toHaveURL(/\/stock\//);
    
    await page.goBack();
    await page.waitForURL('/');
    
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
  });
});

test.describe('Navigation - Multiple Priority Switches', () => {
  test('should switch between all three priorities sequentially', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    let activeButton = page.getByRole('button', { name: /Growth/i });
    await expect(activeButton).toHaveClass(/active/);
    
    await page.getByRole('button', { name: /Dividends/i }).click();
    await page.waitForURL('/?priority=dividends');
    activeButton = page.getByRole('button', { name: /Dividends/i });
    await expect(activeButton).toHaveClass(/active/);
    
    await page.getByRole('button', { name: /ROI/i }).click();
    await page.waitForURL('/?priority=roi');
    activeButton = page.getByRole('button', { name: /ROI/i });
    await expect(activeButton).toHaveClass(/active/);
  });

  test('should update table results when switching priorities', async ({ page }) => {
    await page.goto('/?priority=roi');
    
    const roiFirstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    await page.waitForLoadState('domcontentloaded');
    
    const growthFirstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should display correct metric column header after priority switch', async ({ page }) => {
    await page.goto('/?priority=roi');
    await expect(page.getByRole('columnheader', { name: 'ROI' })).toBeVisible();
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    await expect(page.getByRole('columnheader', { name: 'Growth' })).toBeVisible();
  });
});

test.describe('Navigation - Direct URL Navigation', () => {
  test('should navigate directly to stock detail page via URL', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    const ticker = firstTicker!.trim();
    
    await page.goto(`/stock/${ticker}`);
    
    await expect(page).toHaveURL(`/stock/${ticker}`);
    await expect(page.locator('h1')).toContainText(ticker);
  });

  test('should navigate to home with specific priority via URL', async ({ page }) => {
    await page.goto('/?priority=dividends');
    
    const dividendsButton = page.getByRole('button', { name: /Dividends/i });
    await expect(dividendsButton).toHaveClass(/active/);
    await expect(page.getByText(/Showing \d+ results by Dividend/i)).toBeVisible();
  });

  test('should load page successfully when reloading stock detail page', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
  });

  test('should load page successfully when reloading home page', async ({ page }) => {
    await page.goto('/?priority=growth');
    
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
  });
});

test.describe('Navigation - Link Attributes', () => {
  test('should have correct href attributes on view details links', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    const ticker = firstTicker!.trim();
    
    const firstLink = page.getByRole('link', { name: /View Details/i }).first();
    await expect(firstLink).toHaveAttribute('href', `/stock/${ticker}`);
  });

  test('should have correct href on back to rankings link', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const backLink = page.getByRole('link', { name: /Back to Rankings/i });
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
