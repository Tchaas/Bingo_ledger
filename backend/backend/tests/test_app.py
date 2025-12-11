"""
Basic application tests.
"""
import pytest


def test_app_exists(app):
    """Test that the application instance exists."""
    assert app is not None


def test_app_is_testing(app):
    """Test that the application is in testing mode."""
    assert app.config['TESTING'] is True


def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['app'] == 'tchaas-ledger'


def test_metrics_endpoint(client):
    """Test the metrics endpoint."""
    response = client.get('/metrics')
    assert response.status_code == 200
    # Metrics endpoint returns prometheus format text
    assert response.content_type.startswith('text/plain')


def test_404_error(client):
    """Test 404 error handling."""
    response = client.get('/nonexistent-route')
    assert response.status_code == 404
