"""
Regression tests for backend deployment configurations.

Tests verify Dockerfile, requirements.txt, and config.py settings
for proper production deployment.
"""

import os
import re
import pytest
from pathlib import Path


# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
BACKEND_DIR = PROJECT_ROOT / "backend"


class TestDockerfile:
    """Tests for backend Dockerfile configuration."""

    @pytest.fixture
    def dockerfile_path(self):
        """Path to the Dockerfile."""
        return BACKEND_DIR / "Dockerfile"

    @pytest.fixture
    def dockerfile_content(self, dockerfile_path):
        """Read Dockerfile content."""
        with open(dockerfile_path) as f:
            return f.read()

    def test_dockerfile_exists(self, dockerfile_path):
        """Verify Dockerfile exists in backend directory."""
        assert dockerfile_path.exists(), "Dockerfile not found in backend directory"

    def test_base_image(self, dockerfile_content):
        """TC-BD-001: Verify correct Python base image is used."""
        assert "FROM python:" in dockerfile_content, "Python base image not specified"
        # Check for Python 3.11
        assert "python:3.11" in dockerfile_content.lower(), \
            "Expected Python 3.11 base image"

    def test_working_directory(self, dockerfile_content):
        """TC-BD-002: Verify working directory is set correctly."""
        assert "WORKDIR /app" in dockerfile_content, \
            "WORKDIR not set to /app"

    def test_requirements_installation(self, dockerfile_content):
        """TC-BD-003: Verify requirements.txt is copied and installed before source code."""
        lines = dockerfile_content.split('\n')

        # Find line numbers
        copy_requirements_line = -1
        copy_source_line = -1
        pip_install_line = -1

        for i, line in enumerate(lines):
            if "COPY requirements.txt" in line:
                copy_requirements_line = i
            elif "COPY . ." in line:
                copy_source_line = i
            elif "pip install" in line and "requirements.txt" in line:
                pip_install_line = i

        assert copy_requirements_line != -1, "requirements.txt not copied"
        assert pip_install_line != -1, "requirements.txt not installed"
        assert copy_source_line != -1, "Source code not copied"

        # Verify order: copy requirements -> install -> copy source
        assert copy_requirements_line < pip_install_line < copy_source_line, \
            "Requirements should be installed before copying source code for better caching"

    def test_port_exposure(self, dockerfile_content):
        """TC-BD-004: Verify correct port is exposed."""
        assert "EXPOSE 5000" in dockerfile_content, \
            "Port 5000 not exposed"

    def test_entry_point(self, dockerfile_content):
        """TC-BD-005: Verify entry point is configured."""
        assert "CMD" in dockerfile_content or "ENTRYPOINT" in dockerfile_content, \
            "No entry point command specified"

        # Check that it uses python or gunicorn
        cmd_pattern = r'CMD.*(?:python|gunicorn)'
        assert re.search(cmd_pattern, dockerfile_content), \
            "Entry point should use python or gunicorn"

    def test_healthcheck(self, dockerfile_content):
        """Verify healthcheck is configured."""
        assert "HEALTHCHECK" in dockerfile_content, \
            "Health check not configured in Dockerfile"
        assert "/health" in dockerfile_content, \
            "Health check should test /health endpoint"

    def test_non_root_user(self, dockerfile_content):
        """Verify container runs as non-root user."""
        assert "USER" in dockerfile_content, \
            "Container should run as non-root user"
        # Should not be USER root
        assert "USER root" not in dockerfile_content, \
            "Container should not run as root user"

    def test_environment_variables(self, dockerfile_content):
        """Verify essential environment variables are set."""
        assert "ENV FLASK_APP" in dockerfile_content, \
            "FLASK_APP environment variable not set"

    def test_system_dependencies(self, dockerfile_content):
        """Verify required system dependencies are installed."""
        # Check for PostgreSQL client library
        assert "libpq" in dockerfile_content.lower() or "postgresql" in dockerfile_content.lower(), \
            "PostgreSQL client libraries not installed"


class TestRequirements:
    """Tests for requirements.txt file."""

    @pytest.fixture
    def requirements_path(self):
        """Path to requirements.txt."""
        return BACKEND_DIR / "requirements.txt"

    @pytest.fixture
    def requirements_content(self, requirements_path):
        """Read requirements.txt content."""
        with open(requirements_path) as f:
            return f.read()

    @pytest.fixture
    def requirements_list(self, requirements_content):
        """Parse requirements into list."""
        lines = requirements_content.strip().split('\n')
        # Filter out comments and empty lines
        return [line for line in lines if line and not line.startswith('#')]

    def test_requirements_exists(self, requirements_path):
        """Verify requirements.txt exists."""
        assert requirements_path.exists(), "requirements.txt not found in backend directory"

    def test_core_dependencies(self, requirements_content):
        """TC-BD-007: Verify Flask and essential dependencies are present."""
        required_packages = [
            'Flask',
            'SQLAlchemy',
            'psycopg2-binary',
            'Flask-SQLAlchemy',
            'Flask-Migrate'
        ]

        for package in required_packages:
            assert package in requirements_content, \
                f"Required package '{package}' not found in requirements.txt"

    def test_version_pinning(self, requirements_list):
        """TC-BD-008: Verify dependencies have version constraints."""
        unpinned_packages = []

        for line in requirements_list:
            if line.startswith('-'):  # Skip flags
                continue
            # Check if line has version specifier
            if not re.search(r'[=<>!]', line):
                unpinned_packages.append(line)

        assert len(unpinned_packages) == 0, \
            f"Packages without version constraints: {unpinned_packages}"

    def test_flask_version(self, requirements_content):
        """Verify Flask version is appropriate."""
        # Look for Flask version
        flask_match = re.search(r'Flask==(\d+\.\d+\.\d+)', requirements_content)
        assert flask_match, "Flask version not pinned"

        version = flask_match.group(1)
        major_version = int(version.split('.')[0])

        # Should be Flask 3.x or higher
        assert major_version >= 3, \
            f"Flask version {version} is outdated, should be 3.x or higher"

    def test_sqlalchemy_version(self, requirements_content):
        """Verify SQLAlchemy version is appropriate."""
        sqlalchemy_match = re.search(r'SQLAlchemy==(\d+\.\d+\.\d+)', requirements_content)
        assert sqlalchemy_match, "SQLAlchemy version not pinned"

        version = sqlalchemy_match.group(1)
        major_version = int(version.split('.')[0])

        # Should be SQLAlchemy 2.x for modern features
        assert major_version >= 2, \
            f"SQLAlchemy version {version} is outdated, should be 2.x or higher"

    def test_test_dependencies(self, requirements_content):
        """Verify test dependencies are included."""
        test_packages = ['pytest', 'pytest-cov', 'pytest-flask']

        for package in test_packages:
            assert package in requirements_content, \
                f"Test package '{package}' not found in requirements.txt"

    def test_monitoring_dependencies(self, requirements_content):
        """Verify monitoring dependencies are included."""
        # Check for prometheus or GCP monitoring
        assert 'prometheus-client' in requirements_content or \
               'google-cloud-monitoring' in requirements_content, \
            "No monitoring dependencies found"

    def test_no_dev_only_in_production(self, requirements_content):
        """Verify no development-only packages that might be security risks."""
        # This is a basic check - adjust based on your needs
        risky_packages = ['ipdb', 'pdb', 'debugpy']

        for package in risky_packages:
            # Check if it's a standalone requirement (not part of another package name)
            pattern = rf'^{package}[=<>!]'
            assert not re.search(pattern, requirements_content, re.MULTILINE), \
                f"Development-only package '{package}' should not be in production requirements"


class TestConfig:
    """Tests for config.py configuration."""

    @pytest.fixture
    def config_path(self):
        """Path to config.py."""
        return BACKEND_DIR / "config.py"

    @pytest.fixture
    def config_content(self, config_path):
        """Read config.py content."""
        with open(config_path) as f:
            return f.read()

    def test_config_exists(self, config_path):
        """Verify config.py exists."""
        assert config_path.exists(), "config.py not found in backend directory"

    def test_environment_variable_loading(self, config_content):
        """TC-BD-010: Verify configuration loads from environment variables."""
        env_vars = [
            'SECRET_KEY',
            'DATABASE_URL',
            'GCP_PROJECT_ID'
        ]

        for var in env_vars:
            # Check that os.environ.get is used
            pattern = rf"os\.environ\.get\(['\"]?{var}['\"]?\)"
            assert re.search(pattern, config_content), \
                f"Configuration should load {var} from environment"

    def test_secret_key_handling(self, config_content):
        """Verify SECRET_KEY has fallback but warns about production."""
        assert "SECRET_KEY" in config_content, "SECRET_KEY not configured"
        assert "os.environ.get('SECRET_KEY')" in config_content, \
            "SECRET_KEY should be loaded from environment"

        # Should have a fallback for development
        assert " or " in re.search(r"SECRET_KEY.*os\.environ\.get.*", config_content).group(), \
            "SECRET_KEY should have development fallback"

    def test_database_url_configuration(self, config_content):
        """Verify DATABASE_URL is properly configured."""
        assert "DATABASE_URL" in config_content or "SQLALCHEMY_DATABASE_URI" in config_content, \
            "Database URL not configured"

    def test_config_classes(self, config_content):
        """Verify configuration classes exist."""
        required_configs = ['Config', 'ProductionConfig', 'TestingConfig']

        for config_class in required_configs:
            assert f"class {config_class}" in config_content, \
                f"Configuration class '{config_class}' not defined"

    def test_production_config_security(self, config_content):
        """TC-BD-011: Verify production configuration has security settings."""
        # Extract ProductionConfig class
        prod_config_match = re.search(
            r'class ProductionConfig.*?(?=class|\Z)',
            config_content,
            re.DOTALL
        )

        assert prod_config_match, "ProductionConfig class not found"
        prod_config = prod_config_match.group()

        # Check DEBUG is False
        assert 'DEBUG = False' in prod_config or 'DEBUG=False' in prod_config, \
            "ProductionConfig should have DEBUG = False"

    def test_sqlalchemy_track_modifications(self, config_content):
        """Verify SQLALCHEMY_TRACK_MODIFICATIONS is disabled."""
        assert "SQLALCHEMY_TRACK_MODIFICATIONS" in config_content, \
            "SQLALCHEMY_TRACK_MODIFICATIONS should be configured"
        assert "SQLALCHEMY_TRACK_MODIFICATIONS = False" in config_content, \
            "SQLALCHEMY_TRACK_MODIFICATIONS should be False to avoid overhead"

    def test_cors_configuration(self, config_content):
        """Verify CORS is configured."""
        assert "CORS" in config_content, "CORS configuration not found"

    def test_max_content_length(self, config_content):
        """Verify MAX_CONTENT_LENGTH is set to prevent large uploads."""
        assert "MAX_CONTENT_LENGTH" in config_content, \
            "MAX_CONTENT_LENGTH should be set to prevent DoS attacks"

    def test_monitoring_flags(self, config_content):
        """Verify monitoring can be toggled."""
        monitoring_flags = ['ENABLE_MONITORING', 'ENABLE_GCP_MONITORING']

        for flag in monitoring_flags:
            assert flag in config_content, \
                f"Monitoring flag '{flag}' not found in configuration"

    def test_config_dictionary(self, config_content):
        """Verify config dictionary maps environment names to config classes."""
        assert "config = {" in config_content, \
            "Configuration dictionary not defined"

        config_dict_match = re.search(r'config = \{.*?\}', config_content, re.DOTALL)
        assert config_dict_match, "Configuration dictionary not properly defined"

        config_dict = config_dict_match.group()
        environments = ['development', 'production', 'testing']

        for env in environments:
            assert f"'{env}'" in config_dict or f'"{env}"' in config_dict, \
                f"Environment '{env}' not in config dictionary"

    def test_get_config_function(self, config_content):
        """Verify get_config function exists."""
        assert "def get_config" in config_content, \
            "get_config() function not defined"


class TestBackendStructure:
    """Tests for overall backend structure."""

    def test_app_directory_exists(self):
        """Verify app directory exists."""
        app_dir = BACKEND_DIR / "app"
        assert app_dir.exists(), "app directory not found"
        assert app_dir.is_dir(), "app should be a directory"

    def test_migrations_directory_exists(self):
        """Verify migrations directory exists."""
        migrations_dir = BACKEND_DIR / "migrations"
        assert migrations_dir.exists(), "migrations directory not found"

    def test_run_py_exists(self):
        """Verify run.py exists."""
        run_file = BACKEND_DIR / "run.py"
        assert run_file.exists(), "run.py not found"

    def test_gitignore_exists(self):
        """Verify .gitignore exists in backend."""
        gitignore = BACKEND_DIR / ".gitignore"
        assert gitignore.exists(), ".gitignore not found in backend directory"

    def test_env_example_exists(self):
        """Verify .env.example exists."""
        env_example = BACKEND_DIR / ".env.example"
        assert env_example.exists(), ".env.example not found for documentation"

    def test_dockerignore_exists(self):
        """Verify .dockerignore exists."""
        dockerignore = BACKEND_DIR / ".dockerignore"
        assert dockerignore.exists(), ".dockerignore not found"

    def test_tests_directory_structure(self):
        """Verify tests are properly structured."""
        # Check both possible test locations
        tests_in_backend = BACKEND_DIR / "backend" / "tests"
        tests_in_root = BACKEND_DIR / "tests"

        assert tests_in_backend.exists() or tests_in_root.exists(), \
            "tests directory not found in backend"
