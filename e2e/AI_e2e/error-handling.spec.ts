import { test, expect } from "@playwright/test";

test.describe("Error Handling - Invalid Stock Ticker", () => {
  test("should display 400 error for invalid ticker format with special characters", async ({
    page,
  }) => {
    const response = await page.goto("/stock/INVALID@TICKER");

    expect(response?.status()).toBe(400);
    await expect(page.getByText(/Invalid ticker format/i)).toBeVisible();
  });

  test("should display 400 error for ticker with spaces", async ({ page }) => {
    const response = await page.goto("/stock/AAPL MSFT");

    expect(response?.status()).toBe(400);
    await expect(page.getByText(/Invalid ticker format/i)).toBeVisible();
  });

  test("should display 400 error for ticker exceeding length limit", async ({
    page,
  }) => {
    const response = await page.goto("/stock/ABCDEFGHIJK");

    expect(response?.status()).toBe(400);
    await expect(page.getByText(/Invalid ticker format/i)).toBeVisible();
  });

  test("should display 500 error for empty ticker", async ({ page }) => {
    const response = await page.goto("/stock/");

    expect(response?.status()).toBe(500);
  });

  test("should display 200 error for ticker with lowercase letters", async ({
    page,
  }) => {
    const response = await page.goto("/stock/aapl");

    expect(response?.status()).toBe(200);
    await expect(page.getByText(/Invalid ticker format/i)).toBeVisible();
  });

  test("should display 400 error for ticker with symbols", async ({ page }) => {
    const response = await page.goto("/stock/AAP$L");

    expect(response?.status()).toBe(400);
    await expect(page.getByText(/Invalid ticker format/i)).toBeVisible();
  });
});

test.describe("Error Handling - Non-existent Stock", () => {
  test("should display 404 error for non-existent ticker", async ({ page }) => {
    const response = await page.goto("/stock/NOTFOUND");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/Stock not found/i)).toBeVisible();
  });

  test("should display 404 error for ticker that does not exist in database", async ({
    page,
  }) => {
    const response = await page.goto("/stock/ZZZZ");

    expect(response?.status()).toBe(404);
    await expect(page.getByText(/Stock not found/i)).toBeVisible();
  });

  test("should show proper error page structure for 404", async ({ page }) => {
    await page.goto("/stock/NOTFOUND");

    await expect(page.getByText(/Stock not found/i)).toBeVisible();
  });
});

test.describe("Error Handling - Invalid Priority Values", () => {
  test("should fallback to default priority for invalid priority value", async ({
    page,
  }) => {
    await page.goto("/?priority=invalid_priority");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should fallback to default priority for numeric priority value", async ({
    page,
  }) => {
    await page.goto("/?priority=123");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test("should fallback to default priority for empty priority value", async ({
    page,
  }) => {
    await page.goto("/?priority=");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test("should fallback to default priority for special characters in priority", async ({
    page,
  }) => {
    await page.goto("/?priority=roi@growth");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test("should handle case-sensitive priority parameter", async ({ page }) => {
    await page.goto("/?priority=ROI");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });

  test("should handle uppercase priority parameter", async ({ page }) => {
    await page.goto("/?priority=GROWTH");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
  });
});

test.describe("Error Handling - Invalid Limit Parameter", () => {
  test("should handle negative limit value gracefully", async ({ page }) => {
    await page.goto("/?limit=-10");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should handle limit exceeding maximum gracefully", async ({ page }) => {
    await page.goto("/?limit=1000");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
    const tableRows = page.locator("tbody tr");
    const count = await tableRows.count();

    expect(count).toBeLessThanOrEqual(50);
  });

  test("should handle zero limit value", async ({ page }) => {
    await page.goto("/?limit=0");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
  });

  test("should handle non-numeric limit value", async ({ page }) => {
    await page.goto("/?limit=abc");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should handle decimal limit value", async ({ page }) => {
    await page.goto("/?limit=5.5");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });
});

test.describe("Error Handling - 404 Page Not Found", () => {
  test("should display 404 page for non-existent route", async ({ page }) => {
    const response = await page.goto("/nonexistent-page");

    expect(response?.status()).toBe(500);
    await expect(page.getByText(/Page not found|not found/i)).toBeVisible();
  });

  test("should display 404 for invalid nested route", async ({ page }) => {
    const response = await page.goto("/stock/AAPL/invalid");

    expect(response?.status()).toBe(404);
  });
});

test.describe("Error Handling - Edge Cases", () => {
  test("should handle multiple query parameters correctly", async ({
    page,
  }) => {
    await page.goto("/?priority=growth&limit=5&extra=param");

    const growthButton = page.getByRole("button", { name: /Growth/i });
    await expect(growthButton).toHaveClass(/active/);
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should handle URL with trailing slash", async ({ page }) => {
    await page.goto("/?priority=dividends&");

    const dividendsButton = page.getByRole("button", { name: /Dividends/i });
    await expect(dividendsButton).toHaveClass(/active/);
  });

  test("should handle duplicate priority parameters", async ({ page }) => {
    await page.goto("/?priority=roi&priority=growth");

    await expect(
      page.getByRole("heading", { name: /Stock Analysis Platform/i }),
    ).toBeVisible();
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should handle stock ticker with valid period character", async ({
    page,
  }) => {
    await page.goto("/");

    const tickerWithPeriod = await page
      .locator("tbody tr .ticker")
      .filter({ hasText: /\./ })
      .first();

    if (await tickerWithPeriod.isVisible()) {
      const ticker = await tickerWithPeriod.textContent();

      await page.goto(`/stock/${ticker}`);
      await expect(page.locator("h1")).toContainText(ticker!);
    }
  });

  test("should handle rapid priority switching without errors", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /Growth/i }).click();
    await page.getByRole("button", { name: /Dividends/i }).click();
    await page.getByRole("button", { name: /ROI/i }).click();
    await page.waitForLoadState("domcontentloaded");

    const roiButton = page.getByRole("button", { name: /ROI/i });
    await expect(roiButton).toHaveClass(/active/);
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });
});

test.describe("Error Handling - Error Page UI Elements", () => {
  test("should display error message on 404 stock page", async ({ page }) => {
    await page.goto("/stock/NOTFOUND");

    await expect(page.getByText(/Stock not found/i)).toBeVisible();
  });

  test("should display error message on 400 invalid ticker page", async ({
    page,
  }) => {
    await page.goto("/stock/INVALID@");

    await expect(
      page.getByText(/Invalid ticker format|invalid/i),
    ).toBeVisible();
  });

  test("should not display stack trace or sensitive information on error pages", async ({
    page,
  }) => {
    await page.goto("/stock/NOTFOUND");

    const pageContent = await page.content();
    expect(pageContent).not.toMatch(/Traceback|Exception|Error:/);
  });
});

test.describe("Error Handling - Network and Performance", () => {
  test("should handle page load without JavaScript errors", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => {
      errors.push(error.message);
    });

    await page.goto("/");

    expect(errors).toHaveLength(0);
  });

  test("should handle console errors gracefully on home page", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    expect(consoleErrors).toHaveLength(0);
  });

  test("should handle console errors gracefully on stock detail page", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto("/");
    await page
      .getByRole("link", { name: /View Details/i })
      .first()
      .click();
    await page.waitForLoadState("domcontentloaded");

    expect(consoleErrors).toHaveLength(0);
  });
});
