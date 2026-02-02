"""
Main entry point for Stock Analysis Platform.
"""

import os

from app import create_app

APP_ENV = os.environ.get("APP_ENV", "development").lower()
app = create_app(config_name=APP_ENV)

if __name__ == "__main__":
    # Run the development server
    print("Starting Stock Analysis Platform...")
    print("Open http://localhost:5000 in your browser")
    print("-" * 50)

    debug_env = os.environ.get("FLASK_DEBUG", "0").lower() in {"1", "true", "yes"}
    debug = APP_ENV != "production" and debug_env

    host = os.environ.get("HOST", "127.0.0.1" if debug else "0.0.0.0")
    port = int(os.environ.get("PORT", "5000"))

    app.run(debug=debug, host=host, port=port)
