import { test, expect } from '@playwright/test';

test.describe('Home Page - Initial Load and Rendering', () => {
  test('should load home page successfully with default priority', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/Stock Analysis Platform/);
    await expect(page.getByRole('heading', { name: /Stock Analysis Platform/i })).toBeVisible();
    await expect(page.getByText(/Select your investment priority/i)).toBeVisible();
  });

  test('should display all three priority selection buttons', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('button', { name: /ROI/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Growth/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dividends/i })).toBeVisible();
  });

  test('should show ROI button as active by default', async ({ page }) => {
    await page.goto('/');
    
    const roiButton = page.getByRole('button', { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test('should display stock table with proper headers', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByRole('heading', { name: /Top Ranked Stocks/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Rank/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Ticker/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Company/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /Sector/i })).toBeVisible();
  });

  test('should display at least one stock in the results table', async ({ page }) => {
    await page.goto('/');
    
    const tableRows = page.locator('tbody tr');
    await expect(tableRows.first()).toBeVisible();
    await expect(tableRows).not.toHaveCount(0);
  });

  test('should display result count in table header', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText(/Showing \d+ results by/i)).toBeVisible();
  });

  test('should show View Details link for each stock', async ({ page }) => {
    await page.goto('/');
    
    const firstViewButton = page.getByRole('link', { name: /View Details/i }).first();
    await expect(firstViewButton).toBeVisible();
    await expect(firstViewButton).toHaveAttribute('href', /\/stock\//);
  });
});

test.describe('Home Page - Priority Selection', () => {
  test('should change priority to Growth when Growth button is clicked', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Growth/i }).click();
    await page.waitForURL('/?priority=growth');
    
    const growthButton = page.getByRole('button', { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
    await expect(page.getByText(/Showing \d+ results by Growth/i)).toBeVisible();
  });

  test('should change priority to Dividends when Dividends button is clicked', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /Dividends/i }).click();
    await page.waitForURL('/?priority=dividends');
    
    const dividendsButton = page.getByRole('button', { name: /Dividends/i });
    await expect(dividendsButton).toHaveClass(/active/);
    await expect(page.getByText(/Showing \d+ results by Dividend/i)).toBeVisible();
  });

  test('should reload page with ROI priority when ROI button is clicked', async ({ page }) => {
    await page.goto('/?priority=growth');
    
    await page.getByRole('button', { name: /ROI/i }).click();
    await page.waitForURL('/?priority=roi');
    
    const roiButton = page.getByRole('button', { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
    await expect(page.getByText(/Showing \d+ results by ROI/i)).toBeVisible();
  });

  test('should display appropriate metric column header based on priority', async ({ page }) => {
    await page.goto('/?priority=roi');
    await expect(page.getByRole('columnheader', { name: 'ROI' })).toBeVisible();
    
    await page.goto('/?priority=growth');
    await expect(page.getByRole('columnheader', { name: 'Growth' })).toBeVisible();
    
    await page.goto('/?priority=dividends');
    await expect(page.getByRole('columnheader', { name: 'Dividend' })).toBeVisible();
  });
});

test.describe('Home Page - Stock Table Content Validation', () => {
  test('should display stock data with rank numbers starting from 1', async ({ page }) => {
    await page.goto('/');
    
    const firstRank = page.locator('tbody tr').first().locator('.rank');
    await expect(firstRank).toHaveText('#1');
  });

  test('should display stock ticker in uppercase format', async ({ page }) => {
    await page.goto('/');
    
    const firstTicker = page.locator('tbody tr').first().locator('.ticker');
    const tickerText = await firstTicker.textContent();
    
    expect(tickerText).toMatch(/^[A-Z0-9.]+$/);
  });

  test('should display company name for each stock', async ({ page }) => {
    await page.goto('/');
    
    const firstCompanyName = page.locator('tbody tr').first().locator('.company-name');
    await expect(firstCompanyName).not.toBeEmpty();
  });

  test('should display metric values with percentage format', async ({ page }) => {
    await page.goto('/');
    
    const firstMetric = page.locator('tbody tr').first().locator('.metric-value');
    const metricText = await firstMetric.textContent();
    
    expect(metricText).toMatch(/[\d.-]+%/);
  });

  test('should display price with dollar sign format', async ({ page }) => {
    await page.goto('/');
    
    const firstPrice = page.locator('tbody tr').first().locator('td').nth(5);
    const priceText = await firstPrice.textContent();
    
    expect(priceText).toMatch(/\$[\d.]+/);
  });

  test('should apply negative class to negative metric values', async ({ page }) => {
    await page.goto('/');
    
    const negativeMetrics = page.locator('.metric-value.negative');
    const count = await negativeMetrics.count();
    
    if (count > 0) {
      await expect(negativeMetrics.first()).toBeVisible();
    }
  });
});

test.describe('Home Page - Responsive Behavior', () => {
  test('should hide mobile-specific columns on desktop view', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    const sectorColumn = page.getByRole('columnheader', { name: /Sector/i });
    await expect(sectorColumn).toBeVisible();
  });
});

test.describe('Home Page - Empty State', () => {
  test('should display empty state message when no stocks available', async ({ page }) => {
    await page.goto('/?priority=roi&limit=0');
    
    const emptyState = page.locator('.empty-state');
    if (await emptyState.isVisible()) {
      await expect(page.getByText(/No Stocks Found/i)).toBeVisible();
    }
  });
});
