def test_health_endpoint(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload["status"] == "healthy"


def test_api_stocks_default(client):
    resp = client.get("/api/stocks")
    assert resp.status_code == 200
    payload = resp.get_json()
    assert payload["priority"] == "roi"
    assert "stocks" in payload
    assert payload["count"] == len(payload["stocks"])


def test_api_stocks_invalid_priority(client):
    resp = client.get("/api/stocks?priority=bad")
    assert resp.status_code == 400
    payload = resp.get_json()
    assert payload["error"] is True


def test_api_stock_not_found(client):
    resp = client.get("/api/stocks/NOPE")
    assert resp.status_code == 404
    payload = resp.get_json()
    assert payload["error"] is True


def test_api_stock_invalid_ticker(client):
    resp = client.get("/api/stocks/INVALID!!")
    assert resp.status_code == 400
    payload = resp.get_json()
    assert payload["error"] is True


def test_api_stocks_sorted_by_growth(client):
    resp = client.get("/api/stocks?priority=growth&limit=10")
    assert resp.status_code == 200
    payload = resp.get_json()
    stocks = payload["stocks"]
    values = [s.get("growth_potential") or 0 for s in stocks]
    assert values == sorted(values, reverse=True)
