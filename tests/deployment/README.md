# Deployment Regression Test Suite

This directory contains comprehensive regression tests for all deployment-related files and configurations.

## Overview

The test suite validates:
- GitHub Actions workflow configurations
- Backend deployment settings (Docker, requirements, config)
- Frontend deployment settings (package.json, Vite config)
- Deployment scripts for syntax and correctness

## Structure

```
tests/deployment/
├── README.md                      # This file
├── test_cases.md                  # Detailed test case documentation
├── conftest.py                    # Pytest configuration and fixtures
├── pytest.ini                     # Pytest settings
├── requirements.txt               # Test dependencies
├── __init__.py                    # Package initialization
├── test_workflows.py              # GitHub Actions workflow tests
├── test_backend_deployment.py     # Backend configuration tests
├── test_frontend_deployment.py    # Frontend configuration tests
└── test_scripts.py                # Deployment script tests
```

## Installation

Install test dependencies:

```bash
# From the tests/deployment directory
pip install -r requirements.txt

# Or from project root
pip install -r tests/deployment/requirements.txt
```

## Running Tests

### All Tests

```bash
# Run all deployment tests
pytest tests/deployment/

# Run with verbose output
pytest tests/deployment/ -v

# Run with coverage report
pytest tests/deployment/ --cov=. --cov-report=html --cov-report=term
```

### Specific Test Categories

```bash
# Run only workflow tests
pytest tests/deployment/ -m workflows

# Run only backend tests
pytest tests/deployment/ -m backend

# Run only frontend tests
pytest tests/deployment/ -m frontend

# Run only script tests
pytest tests/deployment/ -m scripts

# Run only security tests
pytest tests/deployment/ -m security
```

### Specific Test Files

```bash
# Run workflow tests only
pytest tests/deployment/test_workflows.py

# Run backend deployment tests only
pytest tests/deployment/test_backend_deployment.py

# Run frontend deployment tests only
pytest tests/deployment/test_frontend_deployment.py

# Run script tests only
pytest tests/deployment/test_scripts.py
```

## Test Categories

### 1. GitHub Workflows (test_workflows.py)

Validates workflow YAML syntax, job dependencies, and configurations:
- Deploy workflow validation (main deployment)
- Backend CI workflow validation
- Frontend CI workflow validation
- Secret references and environment variables
- Job dependencies and execution order

### 2. Backend Deployment (test_backend_deployment.py)

Tests Docker configurations, Cloud Run settings, and environment variables:
- Dockerfile structure and security
- Requirements.txt dependencies and versions
- Config.py environment handling
- Production vs development settings

### 3. Frontend Deployment (test_frontend_deployment.py)

Tests build processes, storage configurations, and caching:
- Package.json scripts and dependencies
- Vite configuration for production builds
- Project structure validation
- Build output configuration

### 4. Scripts (test_scripts.py)

Validates shell scripts for syntax errors, permissions, and functionality:
- Migration scripts
- GCP permission scripts
- GitHub secrets setup scripts
- Shell syntax and error handling
- Security checks for hardcoded secrets

## Test Markers

The test suite uses pytest markers:
- `workflows` - GitHub Actions workflow tests
- `backend` - Backend deployment tests
- `frontend` - Frontend deployment tests
- `scripts` - Deployment script tests
- `security` - Security-related tests
- `syntax` - Syntax validation tests

## Documentation

- [test_cases.md](test_cases.md) - Detailed test case documentation with 67 documented test cases
- [pytest.ini](pytest.ini) - Pytest configuration
- [conftest.py](conftest.py) - Shared fixtures and markers
