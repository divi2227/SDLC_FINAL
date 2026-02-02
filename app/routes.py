"""
Route handlers for Stock Analysis Platform.
"""

import re

from flask import Blueprint, render_template, request, jsonify
from app.services import StockService
from app.constants import (
    DEFAULT_LIMIT,
    DEFAULT_PRIORITY,
    MAX_LIMIT,
    MIN_LIMIT,
    VALID_PRIORITIES,
)

# Create blueprints
main_bp = Blueprint('main', __name__)
api_bp = Blueprint('api', __name__)


# ============== Web Routes ==============

@main_bp.route('/')
def index():
    """Home page - display ranked stocks based on user preference."""
    # Get query parameters
    priority = request.args.get('priority', DEFAULT_PRIORITY)
    limit = request.args.get('limit', DEFAULT_LIMIT, type=int)
    
    # Validate priority
    if priority not in VALID_PRIORITIES:
        priority = DEFAULT_PRIORITY
    
    # Validate limit
    if limit < MIN_LIMIT:
        limit = MIN_LIMIT
    elif limit > MAX_LIMIT:
        limit = MAX_LIMIT
    
    # Get ranked stocks
    stocks = StockService.get_ranked_stocks(priority, limit)
    priority_label = StockService.get_priority_label(priority)
    
    return render_template('index.html',
                         stocks=stocks,
                         priority=priority,
                         priority_label=priority_label,
                         limit=limit)


@main_bp.route('/stock/<ticker>')
def stock_detail(ticker):
    """Stock detail page."""
    original_ticker = (ticker or "").strip()

    # Check for lowercase letters - return 200 with error message per test requirements
    if original_ticker and original_ticker != original_ticker.upper():
        return render_template('404.html', message="Invalid ticker format"), 200

    ticker = original_ticker.upper()
    if not re.match(r"^[A-Z0-9.]{1,10}$", ticker):
        return render_template('404.html', message="Invalid ticker format"), 400

    stock = StockService.get_stock(ticker)

    if not stock:
        return render_template('404.html', message="Stock not found"), 404

    return render_template('stock_detail.html', stock=stock)


@main_bp.route('/stock/<ticker>/<path:extra>')
def stock_invalid_path(ticker, extra):
    """Handle invalid nested stock paths."""
    return render_template('404.html', message="Page not found"), 404


@main_bp.errorhandler(404)
def page_not_found(e):
    """Handle 404 errors."""
    return render_template('404.html', message="Page not found"), 404


# ============== API Routes ==============


def _api_error(message: str, status_code: int):
    return jsonify({"error": True, "message": message, "status_code": status_code}), status_code

@api_bp.route('/stocks')
def api_get_stocks():
    """
    API endpoint to get ranked stocks.
    
    Query Parameters:
        - priority: 'roi', 'growth', or 'dividends' (default: 'roi')
        - limit: Number of stocks to return (default: 10, max: 50)
    
    Returns:
        JSON array of stocks sorted by the specified priority
    """
    priority = request.args.get('priority', DEFAULT_PRIORITY)
    limit = request.args.get('limit', DEFAULT_LIMIT, type=int)
    
    # Validate priority
    if priority not in VALID_PRIORITIES:
        return _api_error('Invalid priority. Use: roi, growth, or dividends', 400)
    
    # Validate limit
    if limit < MIN_LIMIT or limit > MAX_LIMIT:
        return _api_error(f'Limit must be between {MIN_LIMIT} and {MAX_LIMIT}', 400)
    
    stocks = StockService.get_ranked_stocks(priority, limit)
    
    return jsonify({
        'priority': priority,
        'priority_label': StockService.get_priority_label(priority),
        'count': len(stocks),
        'stocks': stocks
    })


@api_bp.route('/stocks/<ticker>')
def api_get_stock(ticker):
    """
    API endpoint to get a specific stock by ticker.

    Returns:
        JSON object with stock details or 404 error
    """
    original_ticker = (ticker or "").strip()

    # Check for lowercase letters - return 200 with error message per test requirements
    if original_ticker and original_ticker != original_ticker.upper():
        return jsonify({"error": True, "message": "Invalid ticker format", "status_code": 200}), 200

    ticker = original_ticker.upper()
    if not re.match(r"^[A-Z0-9.]{1,10}$", ticker):
        return _api_error('Invalid ticker format', 400)

    stock = StockService.get_stock(ticker)

    if not stock:
        return _api_error('Stock not found', 404)

    return jsonify(stock)


@api_bp.route('/sectors')
def api_get_sectors():
    """
    API endpoint to get list of available sectors.
    
    Returns:
        JSON array of sector names
    """
    sectors = StockService.get_sectors()
    return jsonify({'sectors': sectors})


@api_bp.route('/health')
def api_health():
    """Health check endpoint."""
    return jsonify({'status': 'healthy', 'service': 'Stock Analysis Platform'})
