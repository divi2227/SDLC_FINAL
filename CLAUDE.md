# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stock Analysis and Selection Platform - a Flask web application for analyzing and ranking stocks based on investment priorities (ROI, Growth, Dividends). Also serves as a template for AI-accelerated SDLC requirement gathering.

## Commands

```bash
# Run development server (http://127.0.0.1:5000)
python run.py

# Run pytest (unit/integration tests)
pytest
pytest tests/test_api.py              # Single file
pytest tests/test_api.py::test_name   # Single test

# Run Playwright (E2E tests - 390 tests across 3 browsers)
npx playwright test
npx playwright test --project=chromium                    # Single browser
npx playwright test e2e/AI_e2e/home-page.spec.ts         # Single file
npx playwright show-report                                # View HTML report

# Setup
pip install -r requirements.txt
npm install && npx playwright install --with-deps
```

## Architecture

**Flask Application Factory Pattern:**
- `run.py` - Entry point, creates app via `create_app()`
- `app/__init__.py` - Factory with logging, error handlers, blueprint registration
- `app/routes.py` - Two blueprints: `main_bp` (web/HTML) and `api_bp` (JSON at `/api/*`)
- `app/models.py` - In-memory stock database (STOCKS_DATA), ranking/filtering logic
- `app/services.py` - Business logic layer wrapping models
- `app/constants.py` - Priority options, limits, field mappings

**Data Flow:** Routes → Services → Models → In-memory STOCKS_DATA

**API Endpoints:**
- `GET /` - Home page with ranked stocks
- `GET /stock/<ticker>` - Stock detail page
- `GET /api/stocks?priority=roi&limit=10` - Ranked stocks (priorities: roi, growth, dividends)
- `GET /api/stocks/<ticker>` - Single stock
- `GET /api/sectors` - Available sectors
- `GET /api/health` - Health check

## Testing

**Pytest** (`tests/`): Unit tests for models, API endpoints, web routes. Fast feedback loop.

**Playwright** (`e2e/AI_e2e/`): E2E browser tests across Chromium, Firefox, WebKit. Tests UI rendering, navigation, error handling.

There is ~30-40% overlap between test suites - pytest tests logic directly while Playwright tests the full user experience in real browsers.

## Documentation

- `design/HLD/` - High-level architecture and system design
- `design/LLD/` - API contracts, database schema, sequence flows
- `requirements/` - Problem definition, PRD, user stories, acceptance criteria
- `CODE_REVIEW.md` - Known issues and improvement opportunities
