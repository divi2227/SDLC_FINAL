import os

import pytest

from app import create_app


@pytest.fixture(scope="session")
def app():
    os.environ["SECRET_KEY"] = "test-secret"
    flask_app = create_app(config_name="testing")
    flask_app.config.update(TESTING=True)
    return flask_app


@pytest.fixture()
def client(app):
    return app.test_client()
