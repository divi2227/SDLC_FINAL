"""
Business logic services for Stock Analysis Platform.
"""

from app.constants import PRIORITY_LABELS
from app.models import get_all_stocks, get_stock_by_ticker, get_ranked_stocks, get_sectors


class StockService:
    """Service class for stock-related operations."""
    
    @staticmethod
    def get_all_stocks():
        """Retrieve all stocks."""
        return get_all_stocks()
    
    @staticmethod
    def get_stock(ticker):
        """Retrieve a specific stock by ticker."""
        return get_stock_by_ticker(ticker)
    
    @staticmethod
    def get_ranked_stocks(priority='roi', limit=10):
        """
        Get stocks ranked by investment priority.
        
        Args:
            priority: Investment priority ('roi', 'growth', 'dividends')
            limit: Maximum number of stocks to return
        
        Returns:
            List of stocks sorted by the specified priority
        """
        return get_ranked_stocks(priority, limit)
    
    @staticmethod
    def get_sectors():
        """Get list of available sectors."""
        return get_sectors()
    
    @staticmethod
    def get_priority_label(priority):
        """Get human-readable label for priority."""
        return PRIORITY_LABELS.get(priority, 'Unknown')
    
    @staticmethod
    def format_percentage(value):
        """Format a value as percentage string."""
        if value is None:
            return 'N/A'
        return f"{value:.1f}%"
    
    @staticmethod
    def format_currency(value):
        """Format a value as currency string."""
        if value is None:
            return 'N/A'
        return f"${value:,.2f}"
    
    @staticmethod
    def format_market_cap(value):
        """Format market cap in billions."""
        if value is None:
            return 'N/A'
        return f"${value:,.1f}B"
