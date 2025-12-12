"""
Pytest configuration and fixtures for tests.
"""
import os
import pytest
from app import create_app, db as _db


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
    app = create_app('testing')
    app.config['TESTING'] = True

    # Create database tables
    with app.app_context():
        _db.create_all()

    yield app

    # Drop all tables after tests
    with app.app_context():
        _db.drop_all()


@pytest.fixture(scope='function')
def db(app):
    """Provide database session that rolls back after each test."""
    with app.app_context():
        # Begin a non-ORM transaction
        connection = _db.engine.connect()
        transaction = connection.begin()

        # Bind session to connection
        options = dict(bind=connection, binds={})
        session = _db.create_scoped_session(options=options)
        _db.session = session

        yield _db

        # Rollback transaction
        session.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope='function')
def client(app):
    """Create test client."""
    return app.test_client()


@pytest.fixture
def test_org(app, db):
    """Create a test organization."""
    from app.models import Organization

    org = Organization(
        name='Test Organization',
        ein='12-3456789',
        address='123 Test St',
        city='Test City',
        state='CA',
        zip_code='12345'
    )
    db.session.add(org)
    db.session.commit()
    return org


@pytest.fixture
def test_user(app, db, test_org):
    """Create a test user."""
    from app.models import User
    from app.auth.utils import hash_password

    user = User(
        email='test@example.com',
        name='Test User',
        password_hash=hash_password('TestPass123'),
        organization_id=test_org.id
    )
    db.session.add(user)
    db.session.commit()
    return user


@pytest.fixture
def auth_tokens(client, test_user):
    """Generate authentication tokens for test user."""
    response = client.post('/api/auth/login', json={
        'email': test_user.email,
        'password': 'TestPass123'
    })

    data = response.get_json()
    return {
        'access_token': data['access_token'],
        'refresh_token': data['refresh_token']
    }
