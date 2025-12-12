"""
Pytest configuration and fixtures for deployment tests.

This module provides shared fixtures and configuration for all deployment tests.
"""

import pytest
from pathlib import Path


# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"
FRONTEND_DIR = PROJECT_ROOT / "frontend"
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
WORKFLOWS_DIR = PROJECT_ROOT / ".github" / "workflows"


@pytest.fixture(scope="session")
def project_root():
    """Provide the project root directory."""
    return PROJECT_ROOT


@pytest.fixture(scope="session")
def backend_dir():
    """Provide the backend directory."""
    return BACKEND_DIR


@pytest.fixture(scope="session")
def frontend_dir():
    """Provide the frontend directory."""
    return FRONTEND_DIR


@pytest.fixture(scope="session")
def scripts_dir():
    """Provide the scripts directory."""
    return SCRIPTS_DIR


@pytest.fixture(scope="session")
def workflows_dir():
    """Provide the workflows directory."""
    return WORKFLOWS_DIR


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "workflows: tests for GitHub Actions workflows"
    )
    config.addinivalue_line(
        "markers", "backend: tests for backend deployment configurations"
    )
    config.addinivalue_line(
        "markers", "frontend: tests for frontend deployment configurations"
    )
    config.addinivalue_line(
        "markers", "scripts: tests for deployment scripts"
    )
    config.addinivalue_line(
        "markers", "security: security-related tests"
    )
    config.addinivalue_line(
        "markers", "syntax: syntax validation tests"
    )


def pytest_collection_modifyitems(config, items):
    """Automatically mark tests based on their module."""
    for item in items:
        # Add markers based on test module
        if "test_workflows" in item.nodeid:
            item.add_marker(pytest.mark.workflows)
        elif "test_backend_deployment" in item.nodeid:
            item.add_marker(pytest.mark.backend)
        elif "test_frontend_deployment" in item.nodeid:
            item.add_marker(pytest.mark.frontend)
        elif "test_scripts" in item.nodeid:
            item.add_marker(pytest.mark.scripts)

        # Add syntax marker for syntax-related tests
        if "syntax" in item.name.lower():
            item.add_marker(pytest.mark.syntax)

        # Add security marker for security-related tests
        if "security" in item.name.lower() or "secret" in item.name.lower():
            item.add_marker(pytest.mark.security)
