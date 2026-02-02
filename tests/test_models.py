from app.models import STOCKS_DATA, get_all_stocks, get_ranked_stocks, get_stock_by_ticker


def test_get_all_stocks_returns_copies():
    stocks = get_all_stocks()
    assert stocks

    # Mutate returned data
    stocks[0]["ticker"] = "ZZZZ"

    # Source data must remain unchanged
    assert STOCKS_DATA[0]["ticker"] != "ZZZZ"


def test_get_stock_by_ticker_returns_copy():
    stock = get_stock_by_ticker("AAPL")
    assert stock is not None
    stock["ticker"] = "ZZZZ"

    # Source must remain unchanged
    assert STOCKS_DATA[0]["ticker"] == "AAPL"


def test_ranked_stocks_by_roi_sorted_desc_and_ranked():
    ranked = get_ranked_stocks(priority="roi", limit=10)
    assert 1 <= len(ranked) <= 10

    # Should be sorted descending by ROI
    rois = [s.get("roi") or 0 for s in ranked]
    assert rois == sorted(rois, reverse=True)

    # Rank must be sequential starting at 1
    ranks = [s.get("rank") for s in ranked]
    assert ranks == list(range(1, len(ranked) + 1))


def test_ranked_stocks_adds_rank_without_mutating_source():
    _ = get_ranked_stocks(priority="growth", limit=5)

    # Source entries should not gain derived fields
    assert "rank" not in STOCKS_DATA[0]
    assert "sort_value" not in STOCKS_DATA[0]
