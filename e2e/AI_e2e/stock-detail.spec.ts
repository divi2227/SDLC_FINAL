import { test, expect } from '@playwright/test';

test.describe('Stock Detail Page - Valid Stock Navigation', () => {
  test('should navigate to stock detail page from home page', async ({ page }) => {
    await page.goto('/');
    
    const firstViewButton = page.getByRole('link', { name: /View Details/i }).first();
    const href = await firstViewButton.getAttribute('href');
    
    await firstViewButton.click();
    await page.waitForURL(href!);
    
    await expect(page).toHaveURL(/\/stock\/[A-Z0-9.]+/);
  });

  test('should display stock ticker and company name in header', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    const firstCompanyName = await page.locator('tbody tr').first().locator('.company-name').textContent();
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.locator('h1')).toContainText(firstTicker!.trim());
    await expect(page.getByText(firstCompanyName!.trim())).toBeVisible();
  });

  test('should display current stock price with dollar format', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    const priceElement = page.locator('.current-price');
    const priceText = await priceElement.textContent();

    expect(priceText).toMatch(/\$[\d.]+/);
  });

  test('should display back to rankings navigation link', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const backLink = page.getByRole('link', { name: /Back to Rankings/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });

  test('should navigate back to home page when clicking back link', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await page.getByRole('link', { name: /Back to Rankings/i }).click();
    await page.waitForURL('/');
    
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
  });
});

test.describe('Stock Detail Page - Metric Cards Display', () => {
  test('should display ROI metric card with percentage value', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/Return on Investment/i)).toBeVisible();

    const roiCard = page.locator('.roi-content');
    const roiValue = roiCard.locator('div[style*="font-size: 2rem"]');
    const roiText = await roiValue.textContent();

    expect(roiText).toMatch(/[\d.-]+%/);
  });

  test('should display Growth Potential metric card with percentage value', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/Growth Potential/i)).toBeVisible();

    const growthCard = page.locator('.growth-content');
    const growthValue = growthCard.locator('div[style*="font-size: 2rem"]');
    const growthText = await growthValue.textContent();

    expect(growthText).toMatch(/[\d.-]+%/);
  });

  test('should display Dividend Yield metric card with percentage value', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/Dividend Yield/i)).toBeVisible();

    const dividendCard = page.locator('.dividend-content');
    const dividendValue = dividendCard.locator('div[style*="font-size: 2rem"]');
    const dividendText = await dividendValue.textContent();

    expect(dividendText).toMatch(/[\d.-]+%/);
  });

  test('should display all three metric cards on page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByText(/Return on Investment/i)).toBeVisible();
    await expect(page.getByText(/Growth Potential/i)).toBeVisible();
    await expect(page.getByText(/Dividend Yield/i)).toBeVisible();
  });

  test('should display metric descriptions below values', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByText(/Measures profitability relative to investment/i)).toBeVisible();
    await expect(page.getByText(/Projected future growth based on analysis/i)).toBeVisible();
    await expect(page.getByText(/Annual dividend as percentage/i)).toBeVisible();
  });
});

test.describe('Stock Detail Page - Additional Information', () => {
  test('should display additional information section', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    await expect(page.getByText(/Additional Information/i)).toBeVisible();
  });

  test('should display market cap information', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const marketCapLabel = page.locator('div:has-text("Market Cap")').first();
    await expect(marketCapLabel).toBeVisible();
  });

  test('should display sector information', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const sectorLabel = page.locator('div:has-text("Sector")').filter({ hasText: /^Sector$/i });
    await expect(sectorLabel).toBeVisible();
  });

  test('should display last updated date', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const lastUpdatedLabel = page.locator('div:has-text("Last Updated")').first();
    await expect(lastUpdatedLabel).toBeVisible();
  });

  test('should display sector badge in header', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');
    
    const sectorBadge = page.locator('.sector-badge').first();
    await expect(sectorBadge).toBeVisible();
  });
});

test.describe('Stock Detail Page - Direct URL Access', () => {
  test('should load valid stock detail page via direct URL', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    const ticker = firstTicker!.trim();
    
    await page.goto(`/stock/${ticker}`);
    
    await expect(page).toHaveTitle(new RegExp(ticker));
    await expect(page.locator('h1')).toContainText(ticker);
  });

  test('should display page title with stock ticker and company name', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = await page.locator('tbody tr').first().locator('.ticker').textContent();
    const ticker = firstTicker!.trim();
    
    await page.goto(`/stock/${ticker}`);
    
    await expect(page).toHaveTitle(new RegExp(`${ticker}.*Stock Analysis Platform`));
  });
});

test.describe('Stock Detail Page - Color Coding', () => {
  test('should apply green color to positive ROI values', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    const roiCard = page.locator('.roi-content');
    const roiValue = roiCard.locator('div[style*="font-size: 2rem"]');
    const roiText = await roiValue.textContent();

    if (roiText && parseFloat(roiText) >= 0) {
      const color = await roiValue.evaluate(el => window.getComputedStyle(el).color);
      expect(color).toMatch(/rgb\(74, 222, 128\)|#4ade80/);
    }
  });

  test('should apply green color to positive growth values', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /View Details/i }).first().click();
    await page.waitForLoadState('domcontentloaded');

    const growthCard = page.locator('.growth-content');
    const growthValue = growthCard.locator('div[style*="font-size: 2rem"]');
    const growthText = await growthValue.textContent();

    if (growthText && parseFloat(growthText) >= 0) {
      const color = await growthValue.evaluate(el => window.getComputedStyle(el).color);
      expect(color).toMatch(/rgb\(74, 222, 128\)|#4ade80/);
    }
  });
});
