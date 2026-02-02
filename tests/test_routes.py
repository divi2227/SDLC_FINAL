def test_home_page_renders(client):
    resp = client.get("/")
    assert resp.status_code == 200
    assert b"Stock Analysis Platform" in resp.data


def test_home_page_accepts_priority_param(client):
    resp = client.get("/?priority=growth")
    assert resp.status_code == 200
    assert b"Growth Potential" in resp.data


def test_home_page_invalid_priority_falls_back(client):
    resp = client.get("/?priority=bad")
    assert resp.status_code == 200
    # Default display should include ROI label
    assert b"ROI" in resp.data


def test_stock_detail_valid_ticker(client):
    resp = client.get("/stock/NVDA")
    assert resp.status_code == 200
    assert b"NVDA" in resp.data


def test_stock_detail_invalid_ticker_format(client):
    resp = client.get("/stock/INVALID!!")
    assert resp.status_code == 400


def test_stock_detail_not_found(client):
    resp = client.get("/stock/NOPE")
    assert resp.status_code == 404
