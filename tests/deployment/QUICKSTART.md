# Deployment Tests - Quick Start Guide

Get started with the deployment regression tests in under 5 minutes.

## 1. Install Dependencies

```bash
cd tests/deployment
pip install -r requirements.txt
```

## 2. Run All Tests

```bash
pytest
```

That's it! The tests will automatically discover and run all deployment validation tests.

## 3. Common Test Commands

```bash
# Verbose output
pytest -v

# Stop on first failure
pytest -x

# Run specific category
pytest -m workflows    # Only workflow tests
pytest -m backend      # Only backend tests
pytest -m frontend     # Only frontend tests
pytest -m scripts      # Only script tests
pytest -m security     # Only security tests

# Run specific file
pytest test_workflows.py
pytest test_backend_deployment.py
pytest test_frontend_deployment.py
pytest test_scripts.py

# Run with coverage
pytest --cov=. --cov-report=term
```

## 4. Understanding Results

### Passing Test
```
test_workflows.py::TestDeployWorkflow::test_workflow_name PASSED
```
✅ The workflow has a valid name

### Failing Test
```
test_workflows.py::TestDeployWorkflow::test_workflow_name FAILED
AssertionError: Workflow name not found
```
❌ Fix the issue in the deployment file

## 5. Test Categories

- **Workflows** (`test_workflows.py`) - GitHub Actions YAML files
- **Backend** (`test_backend_deployment.py`) - Dockerfile, requirements.txt, config.py
- **Frontend** (`test_frontend_deployment.py`) - package.json, vite.config.ts
- **Scripts** (`test_scripts.py`) - Shell scripts in /scripts

## 6. Viewing Test Cases

See [test_cases.md](test_cases.md) for detailed documentation of all 67 test cases.

## 7. Next Steps

- Add tests to your CI/CD pipeline
- Run tests before each deployment
- Review failing tests and fix deployment configurations
- Add new tests when adding new deployment files

## Need Help?

- See [README.md](README.md) for comprehensive documentation
- See [test_cases.md](test_cases.md) for detailed test case specifications
- Check pytest.ini for configuration options
