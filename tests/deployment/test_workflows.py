"""
Regression tests for GitHub Actions workflows.

Tests verify workflow configurations, syntax, dependencies, and proper setup
for deploy.yml, backend-ci.yml, and frontend-ci.yml.
"""

import os
import yaml
import pytest
from pathlib import Path


# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
WORKFLOWS_DIR = PROJECT_ROOT / ".github" / "workflows"


class TestWorkflowFiles:
    """Test that workflow files exist and are valid YAML."""

    def test_deploy_workflow_exists(self):
        """TC-GW-001: Verify deploy.yml exists."""
        deploy_file = WORKFLOWS_DIR / "deploy.yml"
        assert deploy_file.exists(), "deploy.yml workflow file not found"

    def test_backend_ci_workflow_exists(self):
        """TC-BC-001: Verify backend-ci.yml exists."""
        backend_ci_file = WORKFLOWS_DIR / "backend-ci.yml"
        assert backend_ci_file.exists(), "backend-ci.yml workflow file not found"

    def test_frontend_ci_workflow_exists(self):
        """TC-FC-001: Verify frontend-ci.yml exists."""
        frontend_ci_file = WORKFLOWS_DIR / "frontend-ci.yml"
        assert frontend_ci_file.exists(), "frontend-ci.yml workflow file not found"

    def test_deploy_workflow_valid_yaml(self):
        """TC-GW-001: Verify deploy.yml is valid YAML."""
        deploy_file = WORKFLOWS_DIR / "deploy.yml"
        with open(deploy_file) as f:
            try:
                yaml.safe_load(f)
            except yaml.YAMLError as e:
                pytest.fail(f"deploy.yml has invalid YAML syntax: {e}")

    def test_backend_ci_workflow_valid_yaml(self):
        """TC-BC-001: Verify backend-ci.yml is valid YAML."""
        backend_ci_file = WORKFLOWS_DIR / "backend-ci.yml"
        with open(backend_ci_file) as f:
            try:
                yaml.safe_load(f)
            except yaml.YAMLError as e:
                pytest.fail(f"backend-ci.yml has invalid YAML syntax: {e}")

    def test_frontend_ci_workflow_valid_yaml(self):
        """TC-FC-001: Verify frontend-ci.yml is valid YAML."""
        frontend_ci_file = WORKFLOWS_DIR / "frontend-ci.yml"
        with open(frontend_ci_file) as f:
            try:
                yaml.safe_load(f)
            except yaml.YAMLError as e:
                pytest.fail(f"frontend-ci.yml has invalid YAML syntax: {e}")


class TestDeployWorkflow:
    """Tests for the main deployment workflow (deploy.yml)."""

    @pytest.fixture
    def deploy_config(self):
        """Load deploy.yml configuration."""
        deploy_file = WORKFLOWS_DIR / "deploy.yml"
        with open(deploy_file) as f:
            return yaml.safe_load(f)

    def test_workflow_name(self, deploy_config):
        """Verify workflow has a descriptive name."""
        assert "name" in deploy_config
        assert deploy_config["name"] == "Deploy to Production"

    def test_trigger_configuration(self, deploy_config):
        """TC-GW-002: Verify workflow triggers are correctly configured."""
        assert "on" in deploy_config
        triggers = deploy_config["on"]

        # Check push trigger
        assert "push" in triggers
        assert "branches" in triggers["push"]
        assert "main" in triggers["push"]["branches"]

        # Check workflow_dispatch trigger
        assert "workflow_dispatch" in triggers
        assert "inputs" in triggers["workflow_dispatch"]
        assert "environment" in triggers["workflow_dispatch"]["inputs"]

    def test_environment_variables(self, deploy_config):
        """TC-GW-003: Verify all required environment variables are defined."""
        assert "env" in deploy_config
        env_vars = deploy_config["env"]

        required_vars = [
            "GCP_PROJECT_ID",
            "GCP_REGION",
            "BACKEND_SERVICE_NAME",
            "FRONTEND_BUCKET",
            "ARTIFACT_REGISTRY_REPO"
        ]

        for var in required_vars:
            assert var in env_vars, f"Required environment variable {var} not defined"

    def test_job_dependencies(self, deploy_config):
        """TC-GW-004: Verify deploy-frontend depends on deploy-backend."""
        jobs = deploy_config.get("jobs", {})

        assert "deploy-backend" in jobs
        assert "deploy-frontend" in jobs

        frontend_job = jobs["deploy-frontend"]
        assert "needs" in frontend_job
        assert "deploy-backend" in frontend_job["needs"] or frontend_job["needs"] == "deploy-backend"

    def test_backend_deployment_steps(self, deploy_config):
        """TC-GW-005: Verify all backend deployment steps are present."""
        jobs = deploy_config.get("jobs", {})
        backend_job = jobs.get("deploy-backend", {})
        steps = backend_job.get("steps", [])

        step_names = [step.get("name", "") for step in steps]

        required_steps = [
            "Checkout code",
            "Authenticate to Google Cloud",
            "Set up Cloud SDK",
            "Configure Docker for Artifact Registry",
            "Build Docker image",
            "Push Docker image to Artifact Registry",
            "Deploy to Cloud Run",
            "Get Cloud Run URL",
            "Test deployment"
        ]

        for required_step in required_steps:
            assert any(required_step in step for step in step_names), \
                f"Required step '{required_step}' not found in backend deployment"

    def test_frontend_deployment_steps(self, deploy_config):
        """TC-GW-006: Verify all frontend deployment steps are present."""
        jobs = deploy_config.get("jobs", {})
        frontend_job = jobs.get("deploy-frontend", {})
        steps = frontend_job.get("steps", [])

        step_names = [step.get("name", "") for step in steps]

        required_steps = [
            "Checkout code",
            "Set up Node.js",
            "Install dependencies",
            "Build production bundle",
            "Authenticate to Google Cloud",
            "Set up Cloud SDK",
            "Deploy to Cloud Storage"
        ]

        for required_step in required_steps:
            assert any(required_step in step for step in step_names), \
                f"Required step '{required_step}' not found in frontend deployment"

    def test_secret_references(self, deploy_config):
        """TC-GW-007: Verify all secrets are properly referenced."""
        workflow_str = str(deploy_config)

        required_secrets = [
            "GCP_SA_KEY",
            "CLOUD_SQL_INSTANCE",
            "DATABASE_URL",
            "SECRET_KEY"
        ]

        for secret in required_secrets:
            assert secret in workflow_str, \
                f"Required secret '{secret}' not referenced in deploy workflow"

    def test_health_check_endpoint(self, deploy_config):
        """TC-GW-008: Verify health check is performed after backend deployment."""
        jobs = deploy_config.get("jobs", {})
        backend_job = jobs.get("deploy-backend", {})
        steps = backend_job.get("steps", [])

        # Find test deployment step
        test_step = None
        for step in steps:
            if "Test deployment" in step.get("name", ""):
                test_step = step
                break

        assert test_step is not None, "Test deployment step not found"
        assert "run" in test_step
        assert "/health" in test_step["run"], "Health check endpoint not tested"

    def test_output_variables(self, deploy_config):
        """TC-GW-009: Verify backend URL is captured and passed to frontend."""
        jobs = deploy_config.get("jobs", {})
        backend_job = jobs.get("deploy-backend", {})

        # Check backend outputs
        assert "outputs" in backend_job
        assert "backend_url" in backend_job["outputs"]

        # Check frontend uses the output
        frontend_job = jobs.get("deploy-frontend", {})
        steps = frontend_job.get("steps", [])

        # Find build step and check it uses backend URL
        build_step = None
        for step in steps:
            if "Build production bundle" in step.get("name", ""):
                build_step = step
                break

        assert build_step is not None
        assert "env" in build_step
        assert "VITE_API_URL" in build_step["env"]

    def test_notification_job(self, deploy_config):
        """TC-GW-010: Verify notification job runs after both deployments."""
        jobs = deploy_config.get("jobs", {})

        assert "notify" in jobs
        notify_job = jobs["notify"]

        # Check it depends on both deployments
        assert "needs" in notify_job
        needs = notify_job["needs"]
        assert "deploy-backend" in needs
        assert "deploy-frontend" in needs

        # Check it always runs
        assert notify_job.get("if") == "always()"


class TestBackendCIWorkflow:
    """Tests for the backend CI workflow (backend-ci.yml)."""

    @pytest.fixture
    def backend_ci_config(self):
        """Load backend-ci.yml configuration."""
        backend_ci_file = WORKFLOWS_DIR / "backend-ci.yml"
        with open(backend_ci_file) as f:
            return yaml.safe_load(f)

    def test_workflow_name(self, backend_ci_config):
        """Verify workflow has a descriptive name."""
        assert "name" in backend_ci_config
        assert backend_ci_config["name"] == "Backend CI"

    def test_path_filtering(self, backend_ci_config):
        """TC-BC-002: Verify workflow only triggers on backend file changes."""
        triggers = backend_ci_config.get("on", {})

        # Check push trigger
        if "push" in triggers:
            assert "paths" in triggers["push"]
            paths = triggers["push"]["paths"]
            assert "backend/**" in paths
            assert ".github/workflows/backend-ci.yml" in paths

        # Check pull_request trigger
        if "pull_request" in triggers:
            assert "paths" in triggers["pull_request"]
            paths = triggers["pull_request"]["paths"]
            assert "backend/**" in paths

    def test_postgresql_service(self, backend_ci_config):
        """TC-BC-003: Verify PostgreSQL service container is configured."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})

        assert "services" in test_job
        assert "postgres" in test_job["services"]

        postgres = test_job["services"]["postgres"]
        assert postgres["image"] == "postgres:15"
        assert "env" in postgres
        assert postgres["env"]["POSTGRES_DB"] == "tchaas_ledger_test"
        assert "options" in postgres
        assert "health-cmd" in postgres["options"]

    def test_python_version(self, backend_ci_config):
        """TC-BC-004: Verify correct Python version is used."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find Python setup step
        python_step = None
        for step in steps:
            if "Set up Python" in step.get("name", ""):
                python_step = step
                break

        assert python_step is not None
        assert "with" in python_step
        assert python_step["with"]["python-version"] == "3.11"
        assert "cache" in python_step["with"]
        assert python_step["with"]["cache"] == "pip"

    def test_test_dependencies(self, backend_ci_config):
        """TC-BC-005: Verify all test dependencies are installed."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find install dependencies step
        install_step = None
        for step in steps:
            if "Install dependencies" in step.get("name", ""):
                install_step = step
                break

        assert install_step is not None
        assert "run" in install_step
        install_commands = install_step["run"]
        assert "pytest" in install_commands
        assert "pytest-cov" in install_commands
        assert "flake8" in install_commands

    def test_linting_step(self, backend_ci_config):
        """TC-BC-006: Verify flake8 linting is configured properly."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find lint step
        lint_step = None
        for step in steps:
            if "Lint with flake8" in step.get("name", ""):
                lint_step = step
                break

        assert lint_step is not None
        assert "run" in lint_step
        # Check for syntax error detection
        assert "E9,F63,F7,F82" in lint_step["run"]

    def test_database_migrations(self, backend_ci_config):
        """TC-BC-007: Verify migrations run before tests."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find migration step
        migration_step = None
        for step in steps:
            if "Run database migrations" in step.get("name", ""):
                migration_step = step
                break

        assert migration_step is not None
        assert "run" in migration_step
        assert "flask db upgrade" in migration_step["run"]

    def test_test_execution(self, backend_ci_config):
        """TC-BC-008: Verify pytest runs with coverage reporting."""
        jobs = backend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find test step
        test_step = None
        for step in steps:
            if "Run tests with pytest" in step.get("name", ""):
                test_step = step
                break

        assert test_step is not None
        assert "run" in test_step
        assert "--cov" in test_step["run"]
        assert "--cov-report=xml" in test_step["run"]

    def test_docker_build(self, backend_ci_config):
        """TC-BC-009: Verify Docker image builds successfully."""
        jobs = backend_ci_config.get("jobs", {})

        assert "build" in jobs
        build_job = jobs["build"]
        steps = build_job.get("steps", [])

        # Find Docker build step
        docker_build_step = None
        for step in steps:
            if "Build Docker image" in step.get("name", ""):
                docker_build_step = step
                break

        assert docker_build_step is not None
        assert "run" in docker_build_step
        assert "docker build" in docker_build_step["run"]

    def test_docker_container_test(self, backend_ci_config):
        """TC-BC-010: Verify Docker container starts and responds to health checks."""
        jobs = backend_ci_config.get("jobs", {})
        build_job = jobs.get("build", {})
        steps = build_job.get("steps", [])

        # Find Docker test step
        docker_test_step = None
        for step in steps:
            if "Test Docker image runs" in step.get("name", ""):
                docker_test_step = step
                break

        assert docker_test_step is not None
        assert "run" in docker_test_step
        test_commands = docker_test_step["run"]
        assert "docker run" in test_commands
        assert "/health" in test_commands


class TestFrontendCIWorkflow:
    """Tests for the frontend CI workflow (frontend-ci.yml)."""

    @pytest.fixture
    def frontend_ci_config(self):
        """Load frontend-ci.yml configuration."""
        frontend_ci_file = WORKFLOWS_DIR / "frontend-ci.yml"
        with open(frontend_ci_file) as f:
            return yaml.safe_load(f)

    def test_workflow_name(self, frontend_ci_config):
        """Verify workflow has a descriptive name."""
        assert "name" in frontend_ci_config
        assert frontend_ci_config["name"] == "Frontend CI"

    def test_path_filtering(self, frontend_ci_config):
        """TC-FC-002: Verify workflow only triggers on frontend file changes."""
        triggers = frontend_ci_config.get("on", {})

        # Check push trigger
        if "push" in triggers:
            assert "paths" in triggers["push"]
            paths = triggers["push"]["paths"]
            assert "frontend/**" in paths
            assert ".github/workflows/frontend-ci.yml" in paths

        # Check pull_request trigger
        if "pull_request" in triggers:
            assert "paths" in triggers["pull_request"]
            paths = triggers["pull_request"]["paths"]
            assert "frontend/**" in paths

    def test_nodejs_version(self, frontend_ci_config):
        """TC-FC-003: Verify correct Node.js version is used."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find Node.js setup step
        node_step = None
        for step in steps:
            if "Set up Node.js" in step.get("name", ""):
                node_step = step
                break

        assert node_step is not None
        assert "with" in node_step
        assert node_step["with"]["node-version"] == "18"
        assert "cache" in node_step["with"]
        assert node_step["with"]["cache"] == "npm"

    def test_dependency_installation(self, frontend_ci_config):
        """TC-FC-004: Verify npm ci is used for clean installs."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find install dependencies step
        install_step = None
        for step in steps:
            if "Install dependencies" in step.get("name", ""):
                install_step = step
                break

        assert install_step is not None
        assert "run" in install_step
        assert "npm ci" in install_step["run"]

    def test_type_checking(self, frontend_ci_config):
        """TC-FC-005: Verify TypeScript type checking is performed."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find type check step
        type_check_step = None
        for step in steps:
            if "Type check" in step.get("name", ""):
                type_check_step = step
                break

        assert type_check_step is not None
        assert "run" in type_check_step
        assert "tsc" in type_check_step["run"] or "type-check" in type_check_step["run"]

    def test_linting(self, frontend_ci_config):
        """TC-FC-006: Verify linting step exists."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find lint step
        lint_step = None
        for step in steps:
            if "Lint" in step.get("name", ""):
                lint_step = step
                break

        assert lint_step is not None
        assert "run" in lint_step

    def test_production_build(self, frontend_ci_config):
        """TC-FC-008: Verify production bundle is created."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find build step
        build_step = None
        for step in steps:
            if "Build production bundle" in step.get("name", ""):
                build_step = step
                break

        assert build_step is not None
        assert "run" in build_step
        assert "npm run build" in build_step["run"]

    def test_bundle_size_check(self, frontend_ci_config):
        """TC-FC-009: Verify bundle size is reported."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find bundle size check step
        size_check_step = None
        for step in steps:
            if "Check bundle size" in step.get("name", ""):
                size_check_step = step
                break

        assert size_check_step is not None
        assert "run" in size_check_step

    def test_build_artifacts_upload(self, frontend_ci_config):
        """TC-FC-010: Verify build artifacts are uploaded."""
        jobs = frontend_ci_config.get("jobs", {})
        test_job = jobs.get("test", {})
        steps = test_job.get("steps", [])

        # Find upload artifacts step
        upload_step = None
        for step in steps:
            if "Upload build artifacts" in step.get("name", ""):
                upload_step = step
                break

        assert upload_step is not None
        assert "uses" in upload_step
        assert "upload-artifact" in upload_step["uses"]

    def test_accessibility_job(self, frontend_ci_config):
        """TC-FC-011: Verify accessibility testing job exists."""
        jobs = frontend_ci_config.get("jobs", {})

        assert "accessibility" in jobs
        accessibility_job = jobs["accessibility"]

        # Check it depends on test job
        assert "needs" in accessibility_job
        assert accessibility_job["needs"] == "test"
