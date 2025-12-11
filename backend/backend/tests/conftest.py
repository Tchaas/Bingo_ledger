"""
Pytest configuration and fixtures for tests.
"""
import os
import pytest
from app import create_app
from app.models import db


@pytest.fixture(scope='session')
def app():
    """Create application for testing."""
    # Set test environment variables
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['TESTING'] = 'True'
    os.environ['DATABASE_URL'] = os.getenv(
        'DATABASE_URL',
        'postgresql://postgres:postgres@localhost:5432/tchaas_ledger_test'
    )
    os.environ['SECRET_KEY'] = 'test-secret-key'
    os.environ['ENABLE_GCP_MONITORING'] = 'false'

    # Create app
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']

    return app


@pytest.fixture(scope='session')
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture(scope='session')
def _db(app):
    """Create database for testing."""
    with app.app_context():
        db.create_all()
        yield db
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def session(_db):
    """Create a new database session for a test."""
    connection = _db.engine.connect()
    transaction = connection.begin()

    # Bind session to connection
    session = _db.create_scoped_session(
        options={"bind": connection, "binds": {}}
    )
    _db.session = session

    yield session

    # Rollback and cleanup
    transaction.rollback()
    connection.close()
    session.remove()
