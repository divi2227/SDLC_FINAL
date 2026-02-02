"""
Data models for Stock Analysis Platform (in-memory storage).
"""

from app.constants import DEFAULT_PRIORITY, PRIORITY_FIELD_MAP

# In-memory stock database
STOCKS_DATA = [
    {
        'id': 1,
        'ticker': 'AAPL',
        'company_name': 'Apple Inc.',
        'sector': 'Technology',
        'market_cap': 2890.5,
        'current_price': 185.92,
        'roi': 28.5,
        'growth_potential': 15.2,
        'dividend_yield': 0.5
    },
    {
        'id': 2,
        'ticker': 'MSFT',
        'company_name': 'Microsoft Corporation',
        'sector': 'Technology',
        'market_cap': 2780.3,
        'current_price': 378.91,
        'roi': 32.1,
        'growth_potential': 18.7,
        'dividend_yield': 0.8
    },
    {
        'id': 3,
        'ticker': 'GOOGL',
        'company_name': 'Alphabet Inc.',
        'sector': 'Technology',
        'market_cap': 1750.2,
        'current_price': 141.80,
        'roi': 25.3,
        'growth_potential': 22.1,
        'dividend_yield': 0.0
    },
    {
        'id': 4,
        'ticker': 'AMZN',
        'company_name': 'Amazon.com Inc.',
        'sector': 'Consumer Cyclical',
        'market_cap': 1560.8,
        'current_price': 178.25,
        'roi': 18.9,
        'growth_potential': 25.8,
        'dividend_yield': 0.0
    },
    {
        'id': 5,
        'ticker': 'NVDA',
        'company_name': 'NVIDIA Corporation',
        'sector': 'Technology',
        'market_cap': 1180.5,
        'current_price': 480.88,
        'roi': 45.2,
        'growth_potential': 35.5,
        'dividend_yield': 0.03
    },
    {
        'id': 6,
        'ticker': 'JNJ',
        'company_name': 'Johnson & Johnson',
        'sector': 'Healthcare',
        'market_cap': 425.6,
        'current_price': 162.45,
        'roi': 12.8,
        'growth_potential': 8.5,
        'dividend_yield': 2.9
    },
    {
        'id': 7,
        'ticker': 'PG',
        'company_name': 'Procter & Gamble Co.',
        'sector': 'Consumer Defensive',
        'market_cap': 358.2,
        'current_price': 152.30,
        'roi': 14.5,
        'growth_potential': 6.2,
        'dividend_yield': 2.4
    },
    {
        'id': 8,
        'ticker': 'V',
        'company_name': 'Visa Inc.',
        'sector': 'Financial Services',
        'market_cap': 520.4,
        'current_price': 262.18,
        'roi': 22.7,
        'growth_potential': 14.8,
        'dividend_yield': 0.8
    },
    {
        'id': 9,
        'ticker': 'JPM',
        'company_name': 'JPMorgan Chase & Co.',
        'sector': 'Financial Services',
        'market_cap': 498.7,
        'current_price': 172.56,
        'roi': 19.8,
        'growth_potential': 11.2,
        'dividend_yield': 2.3
    },
    {
        'id': 10,
        'ticker': 'XOM',
        'company_name': 'Exxon Mobil Corporation',
        'sector': 'Energy',
        'market_cap': 425.3,
        'current_price': 105.82,
        'roi': 16.5,
        'growth_potential': 5.8,
        'dividend_yield': 3.4
    },
    {
        'id': 11,
        'ticker': 'KO',
        'company_name': 'The Coca-Cola Company',
        'sector': 'Consumer Defensive',
        'market_cap': 265.8,
        'current_price': 61.45,
        'roi': 11.2,
        'growth_potential': 4.5,
        'dividend_yield': 3.0
    },
    {
        'id': 12,
        'ticker': 'PFE',
        'company_name': 'Pfizer Inc.',
        'sector': 'Healthcare',
        'market_cap': 165.4,
        'current_price': 29.35,
        'roi': 8.5,
        'growth_potential': 12.8,
        'dividend_yield': 5.5
    },
    {
        'id': 13,
        'ticker': 'TSLA',
        'company_name': 'Tesla Inc.',
        'sector': 'Consumer Cyclical',
        'market_cap': 785.2,
        'current_price': 248.50,
        'roi': 35.8,
        'growth_potential': 42.5,
        'dividend_yield': 0.0
    },
    {
        'id': 14,
        'ticker': 'META',
        'company_name': 'Meta Platforms Inc.',
        'sector': 'Technology',
        'market_cap': 892.5,
        'current_price': 350.25,
        'roi': 28.9,
        'growth_potential': 20.5,
        'dividend_yield': 0.4
    },
    {
        'id': 15,
        'ticker': 'VZ',
        'company_name': 'Verizon Communications',
        'sector': 'Communication Services',
        'market_cap': 168.5,
        'current_price': 40.12,
        'roi': 7.2,
        'growth_potential': 3.5,
        'dividend_yield': 6.5
    }
]


def get_all_stocks():
    """Get all stocks."""
    # Return per-item copies so callers can add derived fields safely.
    return [stock.copy() for stock in STOCKS_DATA]


def get_stock_by_ticker(ticker):
    """Get a stock by ticker symbol."""
    for stock in STOCKS_DATA:
        if stock['ticker'].upper() == ticker.upper():
            return stock.copy()
    return None


def get_ranked_stocks(priority='roi', limit=10):
    """
    Get stocks ranked by the specified priority.
    
    Args:
        priority: 'roi', 'growth', or 'dividends'
        limit: Number of stocks to return
    
    Returns:
        List of stocks sorted by priority (descending)
    """
    stocks = get_all_stocks()
    
    sort_field = PRIORITY_FIELD_MAP.get(priority, PRIORITY_FIELD_MAP[DEFAULT_PRIORITY])
    
    # Sort by the priority field (descending)
    sorted_stocks = sorted(stocks, key=lambda x: x.get(sort_field, 0) or 0, reverse=True)
    
    # Add rank to each stock
    for i, stock in enumerate(sorted_stocks):
        stock['rank'] = i + 1
        stock['sort_value'] = stock.get(sort_field, 0)
    
    return sorted_stocks[:limit]


def get_sectors():
    """Get list of unique sectors."""
    sectors = set()
    for stock in STOCKS_DATA:
        if stock.get('sector'):
            sectors.add(stock['sector'])
    return sorted(list(sectors))
