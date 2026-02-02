"""Stock Analysis and Selection Platform.

A Flask web application for analyzing and ranking stocks based on user preferences.
"""

import logging
import os

from flask import Flask, jsonify, render_template, request


def create_app(config_name: str = "development") -> Flask:
    """Application factory for creating Flask app instances."""
    app = Flask(__name__)

    # Basic logging configuration
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s - %(message)s",
    )

    # Configuration
    app.config["ENV"] = config_name
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", "dev-secret-key-for-development-only"
    )

    if config_name == "production" and not os.environ.get("SECRET_KEY"):
        app.logger.warning(
            "SECRET_KEY is not set; using an insecure default. Set SECRET_KEY in production."
        )

    # Register blueprints
    from app.routes import api_bp, main_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(api_bp, url_prefix="/api")

    @app.errorhandler(Exception)
    def handle_unexpected_error(e):
        app.logger.exception("Unhandled exception")
        if request.path.startswith("/api"):
            return jsonify({"error": "Internal server error"}), 500
        return render_template("500.html"), 500

    return app
