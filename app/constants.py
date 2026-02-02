"""
Constants and configuration values for Stock Analysis Platform.
"""

# Valid investment priority options
VALID_PRIORITIES = ['roi', 'growth', 'dividends']
DEFAULT_PRIORITY = 'roi'

# Pagination limits
DEFAULT_LIMIT = 10
MIN_LIMIT = 1
MAX_LIMIT = 50

# Priority labels for display
PRIORITY_LABELS = {
    'roi': 'Return on Investment (ROI)',
    'growth': 'Growth Potential',
    'dividends': 'Dividend Yield'
}

# Priority to database field mapping
PRIORITY_FIELD_MAP = {
    'roi': 'roi',
    'growth': 'growth_potential',
    'dividends': 'dividend_yield'
}
