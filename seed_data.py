"""
Seed script to populate database with sample stock data.
Run this script to initialize the database with sample S&P 500 stocks.
"""

from app import create_app, db
from app.models import Stock
from datetime import datetime

# Sample S&P 500 stocks with realistic data
SAMPLE_STOCKS = [
    # Technology
    {"ticker": "AAPL", "company_name": "Apple Inc.", "sector": "Technology", "market_cap": 2800, "current_price": 185.50, "roi": 28.5, "growth_potential": 15.2, "dividend_yield": 0.52},
    {"ticker": "MSFT", "company_name": "Microsoft Corporation", "sector": "Technology", "market_cap": 2750, "current_price": 378.25, "roi": 32.1, "growth_potential": 18.5, "dividend_yield": 0.82},
    {"ticker": "GOOGL", "company_name": "Alphabet Inc.", "sector": "Technology", "market_cap": 1750, "current_price": 142.80, "roi": 24.3, "growth_potential": 22.1, "dividend_yield": 0.0},
    {"ticker": "NVDA", "company_name": "NVIDIA Corporation", "sector": "Technology", "market_cap": 1200, "current_price": 485.50, "roi": 45.8, "growth_potential": 35.5, "dividend_yield": 0.04},
    {"ticker": "META", "company_name": "Meta Platforms Inc.", "sector": "Technology", "market_cap": 850, "current_price": 325.40, "roi": 22.5, "growth_potential": 28.3, "dividend_yield": 0.0},
    {"ticker": "AMZN", "company_name": "Amazon.com Inc.", "sector": "Technology", "market_cap": 1550, "current_price": 152.75, "roi": 18.2, "growth_potential": 25.8, "dividend_yield": 0.0},
    {"ticker": "CRM", "company_name": "Salesforce Inc.", "sector": "Technology", "market_cap": 220, "current_price": 225.30, "roi": 15.8, "growth_potential": 19.5, "dividend_yield": 0.0},
    {"ticker": "ORCL", "company_name": "Oracle Corporation", "sector": "Technology", "market_cap": 310, "current_price": 115.80, "roi": 21.5, "growth_potential": 14.2, "dividend_yield": 1.38},
    
    # Healthcare
    {"ticker": "JNJ", "company_name": "Johnson & Johnson", "sector": "Healthcare", "market_cap": 450, "current_price": 165.25, "roi": 18.5, "growth_potential": 8.5, "dividend_yield": 2.95},
    {"ticker": "UNH", "company_name": "UnitedHealth Group", "sector": "Healthcare", "market_cap": 480, "current_price": 525.80, "roi": 25.2, "growth_potential": 12.5, "dividend_yield": 1.42},
    {"ticker": "PFE", "company_name": "Pfizer Inc.", "sector": "Healthcare", "market_cap": 165, "current_price": 28.50, "roi": 8.5, "growth_potential": 5.2, "dividend_yield": 5.85},
    {"ticker": "ABBV", "company_name": "AbbVie Inc.", "sector": "Healthcare", "market_cap": 285, "current_price": 162.40, "roi": 22.8, "growth_potential": 9.8, "dividend_yield": 3.75},
    {"ticker": "MRK", "company_name": "Merck & Co.", "sector": "Healthcare", "market_cap": 295, "current_price": 118.50, "roi": 19.5, "growth_potential": 11.2, "dividend_yield": 2.58},
    
    # Finance
    {"ticker": "JPM", "company_name": "JPMorgan Chase & Co.", "sector": "Finance", "market_cap": 485, "current_price": 168.50, "roi": 15.8, "growth_potential": 10.5, "dividend_yield": 2.45},
    {"ticker": "V", "company_name": "Visa Inc.", "sector": "Finance", "market_cap": 520, "current_price": 258.25, "roi": 28.5, "growth_potential": 14.8, "dividend_yield": 0.78},
    {"ticker": "MA", "company_name": "Mastercard Inc.", "sector": "Finance", "market_cap": 385, "current_price": 412.80, "roi": 32.5, "growth_potential": 16.2, "dividend_yield": 0.58},
    {"ticker": "BAC", "company_name": "Bank of America Corp.", "sector": "Finance", "market_cap": 265, "current_price": 32.50, "roi": 12.5, "growth_potential": 8.5, "dividend_yield": 2.95},
    {"ticker": "WFC", "company_name": "Wells Fargo & Co.", "sector": "Finance", "market_cap": 175, "current_price": 48.25, "roi": 10.8, "growth_potential": 7.5, "dividend_yield": 2.85},
    
    # Consumer
    {"ticker": "WMT", "company_name": "Walmart Inc.", "sector": "Consumer", "market_cap": 425, "current_price": 158.50, "roi": 18.2, "growth_potential": 9.5, "dividend_yield": 1.42},
    {"ticker": "PG", "company_name": "Procter & Gamble Co.", "sector": "Consumer", "market_cap": 355, "current_price": 152.80, "roi": 16.5, "growth_potential": 7.8, "dividend_yield": 2.48},
    {"ticker": "KO", "company_name": "Coca-Cola Company", "sector": "Consumer", "market_cap": 265, "current_price": 62.50, "roi": 12.8, "growth_potential": 6.5, "dividend_yield": 2.95},
    {"ticker": "PEP", "company_name": "PepsiCo Inc.", "sector": "Consumer", "market_cap": 235, "current_price": 172.25, "roi": 14.5, "growth_potential": 7.2, "dividend_yield": 2.85},
    {"ticker": "COST", "company_name": "Costco Wholesale Corp.", "sector": "Consumer", "market_cap": 285, "current_price": 585.50, "roi": 22.5, "growth_potential": 12.8, "dividend_yield": 0.68},
    {"ticker": "NKE", "company_name": "Nike Inc.", "sector": "Consumer", "market_cap": 165, "current_price": 108.25, "roi": 15.8, "growth_potential": 11.5, "dividend_yield": 1.35},
    
    # Energy
    {"ticker": "XOM", "company_name": "Exxon Mobil Corp.", "sector": "Energy", "market_cap": 445, "current_price": 105.50, "roi": 18.5, "growth_potential": 5.8, "dividend_yield": 3.52},
    {"ticker": "CVX", "company_name": "Chevron Corporation", "sector": "Energy", "market_cap": 295, "current_price": 152.80, "roi": 16.2, "growth_potential": 4.5, "dividend_yield": 3.95},
    
    # Industrial
    {"ticker": "CAT", "company_name": "Caterpillar Inc.", "sector": "Industrial", "market_cap": 145, "current_price": 285.50, "roi": 24.5, "growth_potential": 10.5, "dividend_yield": 1.82},
    {"ticker": "BA", "company_name": "Boeing Company", "sector": "Industrial", "market_cap": 125, "current_price": 205.25, "roi": 8.5, "growth_potential": 18.5, "dividend_yield": 0.0},
    {"ticker": "HON", "company_name": "Honeywell International", "sector": "Industrial", "market_cap": 135, "current_price": 205.80, "roi": 18.8, "growth_potential": 9.5, "dividend_yield": 2.05},
    {"ticker": "UPS", "company_name": "United Parcel Service", "sector": "Industrial", "market_cap": 125, "current_price": 155.50, "roi": 15.5, "growth_potential": 8.2, "dividend_yield": 4.15},
    
    # Telecommunications
    {"ticker": "VZ", "company_name": "Verizon Communications", "sector": "Telecom", "market_cap": 165, "current_price": 38.50, "roi": 8.5, "growth_potential": 3.5, "dividend_yield": 6.85},
    {"ticker": "T", "company_name": "AT&T Inc.", "sector": "Telecom", "market_cap": 125, "current_price": 17.25, "roi": 6.5, "growth_potential": 4.2, "dividend_yield": 6.45},
    
    # Real Estate
    {"ticker": "AMT", "company_name": "American Tower Corp.", "sector": "Real Estate", "market_cap": 95, "current_price": 205.50, "roi": 12.5, "growth_potential": 8.5, "dividend_yield": 3.15},
    {"ticker": "PLD", "company_name": "Prologis Inc.", "sector": "Real Estate", "market_cap": 115, "current_price": 125.80, "roi": 14.2, "growth_potential": 9.8, "dividend_yield": 2.75},
    
    # Utilities
    {"ticker": "NEE", "company_name": "NextEra Energy Inc.", "sector": "Utilities", "market_cap": 135, "current_price": 65.50, "roi": 11.5, "growth_potential": 12.5, "dividend_yield": 2.85},
    {"ticker": "DUK", "company_name": "Duke Energy Corp.", "sector": "Utilities", "market_cap": 78, "current_price": 102.25, "roi": 9.5, "growth_potential": 5.5, "dividend_yield": 3.95},
]


def seed_database():
    """Seed the database with sample stock data."""
    app = create_app()
    
    with app.app_context():
        # Clear existing stocks
        Stock.query.delete()
        
        # Add sample stocks
        for stock_data in SAMPLE_STOCKS:
            stock = Stock(
                ticker=stock_data["ticker"],
                company_name=stock_data["company_name"],
                sector=stock_data["sector"],
                market_cap=stock_data["market_cap"],
                current_price=stock_data["current_price"],
                roi=stock_data["roi"],
                growth_potential=stock_data["growth_potential"],
                dividend_yield=stock_data["dividend_yield"],
                last_updated=datetime.utcnow()
            )
            db.session.add(stock)
        
        db.session.commit()
        print(f"✅ Successfully seeded {len(SAMPLE_STOCKS)} stocks into the database!")


if __name__ == "__main__":
    seed_database()
