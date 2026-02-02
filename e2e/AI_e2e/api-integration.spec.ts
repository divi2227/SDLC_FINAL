import { test, expect } from "@playwright/test";

test.describe("API Integration - Stocks Endpoint", () => {
  test("should receive 200 status from /api/stocks with default parameters", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("priority");
    expect(data).toHaveProperty("stocks");
    expect(data).toHaveProperty("count");
    expect(data.priority).toBe("roi");
  });

  test("should receive stocks array from /api/stocks endpoint", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(Array.isArray(data.stocks)).toBe(true);
    expect(data.stocks.length).toBeGreaterThan(0);
  });

  test("should receive 200 status with priority=growth parameter", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?priority=growth");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.priority).toBe("growth");
    expect(data.priority_label).toContain("Growth");
  });

  test("should receive 200 status with priority=dividends parameter", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?priority=dividends");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.priority).toBe("dividends");
    expect(data.priority_label).toContain("Dividend");
  });

  test("should receive 400 error for invalid priority parameter", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?priority=invalid");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Invalid priority/i);
  });

  test("should receive 200 status with valid limit parameter", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?limit=5");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.stocks.length).toBeLessThanOrEqual(5);
    expect(data.count).toBeLessThanOrEqual(5);
  });

  test("should receive 400 error for limit below minimum", async ({ page }) => {
    const response = await page.request.get("/api/stocks?limit=0");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Limit must be between/i);
  });

  test("should receive 400 error for limit above maximum", async ({ page }) => {
    const response = await page.request.get("/api/stocks?limit=100");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Limit must be between/i);
  });

  test("should return stocks with required fields", async ({ page }) => {
    const response = await page.request.get("/api/stocks");

    expect(response.status()).toBe(200);
    const data = await response.json();

    const stock = data.stocks[0];
    expect(stock).toHaveProperty("ticker");
    expect(stock).toHaveProperty("company_name");
    expect(stock).toHaveProperty("current_price");
    expect(stock).toHaveProperty("roi");
    expect(stock).toHaveProperty("growth_potential");
    expect(stock).toHaveProperty("dividend_yield");
  });

  test("should return stocks sorted by selected priority", async ({ page }) => {
    const response = await page.request.get(
      "/api/stocks?priority=roi&limit=10",
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    const roiValues = data.stocks.map((stock: any) => stock.roi);
    const sortedRoiValues = [...roiValues].sort((a, b) => b - a);

    expect(roiValues).toEqual(sortedRoiValues);
  });

  test("should handle combined priority and limit parameters", async ({
    page,
  }) => {
    const response = await page.request.get(
      "/api/stocks?priority=growth&limit=15",
    );

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.priority).toBe("growth");
    expect(data.stocks.length).toBeLessThanOrEqual(15);
  });
});

test.describe("API Integration - Individual Stock Endpoint", () => {
  test("should receive 200 status from /api/stocks/<ticker> with valid ticker", async ({
    page,
  }) => {
    const stocksResponse = await page.request.get("/api/stocks?limit=1");
    const stocksData = await stocksResponse.json();
    const ticker = stocksData.stocks[0].ticker;

    const response = await page.request.get(`/api/stocks/${ticker}`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.ticker).toBe(ticker);
  });

  test("should receive stock details with all required fields", async ({
    page,
  }) => {
    const stocksResponse = await page.request.get("/api/stocks?limit=1");
    const stocksData = await stocksResponse.json();
    const ticker = stocksData.stocks[0].ticker;

    const response = await page.request.get(`/api/stocks/${ticker}`);

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("ticker");
    expect(data).toHaveProperty("company_name");
    expect(data).toHaveProperty("current_price");
    expect(data).toHaveProperty("roi");
    expect(data).toHaveProperty("growth_potential");
    expect(data).toHaveProperty("dividend_yield");
    expect(data).toHaveProperty("sector");
  });

  test("should receive 404 error for non-existent ticker", async ({ page }) => {
    const response = await page.request.get("/api/stocks/NOTFOUND");

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Stock not found/i);
  });

  test("should receive 400 error for invalid ticker format", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks/INVALID@TICKER");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Invalid ticker format/i);
  });

  test("should receive 400 error for ticker with special characters", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks/AAP$L");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data.error).toBe(true);
  });

  test("should receive 200 error for lowercase ticker", async ({ page }) => {
    const response = await page.request.get("/api/stocks/aapl");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.error).toBe(true);
    expect(data.message).toMatch(/Invalid ticker format/i);
  });

  test("should return consistent data between list and detail endpoints", async ({
    page,
  }) => {
    const listResponse = await page.request.get("/api/stocks?limit=1");
    const listData = await listResponse.json();
    const ticker = listData.stocks[0].ticker;

    const detailResponse = await page.request.get(`/api/stocks/${ticker}`);
    const detailData = await detailResponse.json();

    expect(detailData.ticker).toBe(listData.stocks[0].ticker);
    expect(detailData.company_name).toBe(listData.stocks[0].company_name);
    expect(detailData.current_price).toBe(listData.stocks[0].current_price);
  });
});

test.describe("API Integration - Sectors Endpoint", () => {
  test("should receive 200 status from /api/sectors endpoint", async ({
    page,
  }) => {
    const response = await page.request.get("/api/sectors");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("sectors");
    expect(Array.isArray(data.sectors)).toBe(true);
  });

  test("should return list of sector names", async ({ page }) => {
    const response = await page.request.get("/api/sectors");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data.sectors.length).toBeGreaterThan(0);
    expect(typeof data.sectors[0]).toBe("string");
  });
});

test.describe("API Integration - Health Check Endpoint", () => {
  test("should receive 200 status from /api/health endpoint", async ({
    page,
  }) => {
    const response = await page.request.get("/api/health");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("status");
    expect(data.status).toBe("healthy");
  });

  test("should return service name in health check", async ({ page }) => {
    const response = await page.request.get("/api/health");

    expect(response.status()).toBe(200);
    const data = await response.json();

    expect(data).toHaveProperty("service");
    expect(data.service).toBe("Stock Analysis Platform");
  });
});

test.describe("API Integration - Response Headers", () => {
  test("should return JSON content-type header for stocks endpoint", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks");

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/application\/json/);
  });

  test("should return JSON content-type header for individual stock endpoint", async ({
    page,
  }) => {
    const stocksResponse = await page.request.get("/api/stocks?limit=1");
    const stocksData = await stocksResponse.json();
    const ticker = stocksData.stocks[0].ticker;

    const response = await page.request.get(`/api/stocks/${ticker}`);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/application\/json/);
  });

  test("should return JSON content-type header for error responses", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?priority=invalid");

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/application\/json/);
  });
});

test.describe("API Integration - Page Load with API Calls", () => {
  test("should make successful API calls when loading home page", async ({
    page,
  }) => {
    const apiCalls: any[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/api/")) {
        apiCalls.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
  });

  test("should render stocks without API errors on home page", async ({
    page,
  }) => {
    const apiErrors: any[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/api/") && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    expect(apiErrors).toHaveLength(0);
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("should handle priority change without API errors", async ({ page }) => {
    const apiErrors: any[] = [];

    page.on("response", (response) => {
      if (response.url().includes("/api/") && response.status() >= 400) {
        apiErrors.push({
          url: response.url(),
          status: response.status(),
        });
      }
    });

    await page.goto("/");
    await page.getByRole("button", { name: /Growth/i }).click();
    await page.waitForLoadState("domcontentloaded");

    expect(apiErrors).toHaveLength(0);
  });
});

test.describe("API Integration - Error Response Structure", () => {
  test("should return consistent error structure for 400 errors", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks?priority=invalid");

    expect(response.status()).toBe(400);
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("status_code");
    expect(data.status_code).toBe(400);
  });

  test("should return consistent error structure for 404 errors", async ({
    page,
  }) => {
    const response = await page.request.get("/api/stocks/NOTFOUND");

    expect(response.status()).toBe(404);
    const data = await response.json();

    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("message");
    expect(data).toHaveProperty("status_code");
    expect(data.status_code).toBe(404);
  });

  test("should include descriptive error messages", async ({ page }) => {
    const response = await page.request.get("/api/stocks?priority=invalid");

    const data = await response.json();

    expect(data.message).toBeTruthy();
    expect(data.message.length).toBeGreaterThan(0);
  });
});
