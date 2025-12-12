"""
Regression tests for deployment scripts.

Tests verify shell scripts for syntax errors, proper structure,
and correct configuration values.
"""

import os
import re
import subprocess
import pytest
from pathlib import Path


# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts"


class TestScriptStructure:
    """Tests for overall script structure and existence."""

    def test_scripts_directory_exists(self):
        """Verify scripts directory exists."""
        assert SCRIPTS_DIR.exists(), "scripts directory not found"
        assert SCRIPTS_DIR.is_dir(), "scripts should be a directory"

    def test_migration_script_exists(self):
        """Verify run-migrations-manually.sh exists."""
        script = SCRIPTS_DIR / "run-migrations-manually.sh"
        assert script.exists(), "run-migrations-manually.sh not found"

    def test_github_secrets_script_exists(self):
        """Verify copy-github-secrets.sh exists."""
        script = SCRIPTS_DIR / "copy-github-secrets.sh"
        assert script.exists(), "copy-github-secrets.sh not found"

    def test_gcp_permissions_script_exists(self):
        """Verify fix-gcp-permissions.sh exists."""
        script = SCRIPTS_DIR / "fix-gcp-permissions.sh"
        assert script.exists(), "fix-gcp-permissions.sh not found"

    def test_compute_sa_permissions_script_exists(self):
        """Verify fix-compute-sa-permissions.sh exists."""
        script = SCRIPTS_DIR / "fix-compute-sa-permissions.sh"
        assert script.exists(), "fix-compute-sa-permissions.sh not found"

    def test_permissions_issue_script_exists(self):
        """Verify fix-permissions-issue.sh exists."""
        script = SCRIPTS_DIR / "fix-permissions-issue.sh"
        assert script.exists(), "fix-permissions-issue.sh not found"


class TestMigrationScript:
    """Tests for run-migrations-manually.sh."""

    @pytest.fixture
    def script_path(self):
        """Path to migration script."""
        return SCRIPTS_DIR / "run-migrations-manually.sh"

    @pytest.fixture
    def script_content(self, script_path):
        """Read script content."""
        with open(script_path) as f:
            return f.read()

    def test_shell_syntax(self, script_path):
        """TC-SC-001: Verify shell script has no syntax errors."""
        # Check if bash is available
        try:
            result = subprocess.run(
                ['bash', '-n', str(script_path)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Shell syntax error: {result.stderr}"
        except FileNotFoundError:
            pytest.skip("bash not available for syntax checking")

    def test_shebang(self, script_content):
        """Verify script has proper shebang."""
        assert script_content.startswith('#!/bin/bash'), \
            "Script should start with #!/bin/bash"

    def test_error_handling(self, script_content):
        """TC-SC-002: Verify script uses 'set -e' for error propagation."""
        assert 'set -e' in script_content, \
            "Script should use 'set -e' to exit on errors"

    def test_variable_definitions(self, script_content):
        """TC-SC-003: Verify all required variables are defined."""
        required_vars = [
            'PROJECT_ID',
            'REGION',
            'SERVICE_NAME',
            'CLOUD_SQL_INSTANCE'
        ]

        for var in required_vars:
            pattern = rf'{var}='
            assert re.search(pattern, script_content), \
                f"Variable '{var}' not defined in script"

    def test_project_id_value(self, script_content):
        """Verify PROJECT_ID is set correctly."""
        match = re.search(r'PROJECT_ID="([^"]+)"', script_content)
        assert match, "PROJECT_ID not found"
        project_id = match.group(1)
        assert project_id == "tchaas-ledger", \
            f"PROJECT_ID should be 'tchaas-ledger', found: {project_id}"

    def test_region_value(self, script_content):
        """Verify REGION is set correctly."""
        match = re.search(r'REGION="([^"]+)"', script_content)
        assert match, "REGION not found"
        region = match.group(1)
        # Should be a valid GCP region
        assert region in ['us-central1', 'us-east1', 'us-west1', 'us-east4'], \
            f"REGION should be a valid GCP region, found: {region}"

    def test_image_retrieval(self, script_content):
        """TC-SC-004: Verify script retrieves current deployed image."""
        assert 'gcloud run services describe' in script_content, \
            "Script should retrieve image from Cloud Run service"
        assert '--format=' in script_content or "--format " in script_content, \
            "Image retrieval should use --format to get specific value"

    def test_job_creation(self, script_content):
        """TC-SC-005: Verify migration job is created with correct settings."""
        assert 'gcloud run jobs create' in script_content, \
            "Script should create a Cloud Run job"

        # Check for required job configuration
        assert '--image' in script_content, "Job should specify image"
        assert '--set-secrets' in script_content, "Job should include secrets"
        assert '--set-env-vars' in script_content or '--set-cloudsql-instances' in script_content, \
            "Job should include environment configuration"
        assert 'CLOUD_SQL_INSTANCE' in script_content, "Job should connect to Cloud SQL"

    def test_flask_migration_command(self, script_content):
        """Verify Flask migration command is correct."""
        assert 'flask' in script_content.lower(), \
            "Script should use Flask for migrations"
        assert 'db' in script_content and 'upgrade' in script_content, \
            "Script should run 'flask db upgrade'"

    def test_job_execution(self, script_content):
        """TC-SC-006: Verify job executes with --wait flag."""
        assert 'gcloud run jobs execute' in script_content, \
            "Script should execute the migration job"
        assert '--wait' in script_content, \
            "Job execution should use --wait to block until completion"

    def test_output_messages(self, script_content):
        """TC-SC-007: Verify helpful output messages are displayed."""
        assert 'echo' in script_content, \
            "Script should have output messages"

        # Check for informative messages
        messages = ['Migration', 'Creating', 'Executing', 'Complete']
        found_messages = sum(1 for msg in messages if msg in script_content)

        assert found_messages >= 2, \
            "Script should have informative progress messages"

    def test_executable_permission(self, script_path):
        """Verify script has executable permission."""
        is_executable = os.access(script_path, os.X_OK)
        assert is_executable, \
            "Script should have executable permission (chmod +x)"


class TestGitHubSecretsScript:
    """Tests for copy-github-secrets.sh."""

    @pytest.fixture
    def script_path(self):
        """Path to GitHub secrets script."""
        return SCRIPTS_DIR / "copy-github-secrets.sh"

    @pytest.fixture
    def script_content(self, script_path):
        """Read script content."""
        with open(script_path) as f:
            return f.read()

    def test_shell_syntax(self, script_path):
        """TC-SC-008: Verify shell script has no syntax errors."""
        try:
            result = subprocess.run(
                ['bash', '-n', str(script_path)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Shell syntax error: {result.stderr}"
        except FileNotFoundError:
            pytest.skip("bash not available for syntax checking")

    def test_error_handling(self, script_content):
        """Verify error handling is configured."""
        assert 'set -e' in script_content, \
            "Script should use 'set -e' to exit on errors"

    def test_secret_definitions(self, script_content):
        """Verify script handles required GitHub secrets."""
        required_secrets = [
            'GCP_SA_KEY',
            'DATABASE_URL',
            'SECRET_KEY',
            'CLOUD_SQL_INSTANCE'
        ]

        for secret in required_secrets:
            assert secret in script_content, \
                f"Script should handle secret '{secret}'"

    def test_user_interaction(self, script_content):
        """Verify script has user interaction."""
        assert 'read' in script_content, \
            "Script should wait for user input"
        assert 'echo' in script_content, \
            "Script should provide instructions to user"

    def test_clipboard_usage(self, script_content):
        """Verify script uses clipboard for copying secrets."""
        # Check for pbcopy (macOS) or other clipboard tools
        clipboard_tools = ['pbcopy', 'xclip', 'clip']
        uses_clipboard = any(tool in script_content for tool in clipboard_tools)

        assert uses_clipboard, \
            "Script should use a clipboard tool to copy secrets"

    def test_github_url_reference(self, script_content):
        """Verify script references GitHub secrets page."""
        assert 'github.com' in script_content, \
            "Script should reference GitHub URL"
        assert 'secrets' in script_content.lower(), \
            "Script should mention secrets"


class TestGCPPermissionsScript:
    """Tests for fix-gcp-permissions.sh."""

    @pytest.fixture
    def script_path(self):
        """Path to GCP permissions script."""
        return SCRIPTS_DIR / "fix-gcp-permissions.sh"

    @pytest.fixture
    def script_content(self, script_path):
        """Read script content."""
        with open(script_path) as f:
            return f.read()

    def test_shell_syntax(self, script_path):
        """TC-SC-011: Verify shell script has no syntax errors."""
        try:
            result = subprocess.run(
                ['bash', '-n', str(script_path)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Shell syntax error: {result.stderr}"
        except FileNotFoundError:
            pytest.skip("bash not available for syntax checking")

    def test_gcp_project_check(self, script_content):
        """TC-SC-012: Verify script has GCP project configuration."""
        assert 'PROJECT_ID' in script_content, \
            "Script should define PROJECT_ID"

        # Check for service account email
        assert 'SA_EMAIL' in script_content or 'serviceAccount:' in script_content, \
            "Script should reference service account"

    def test_permission_grants(self, script_content):
        """TC-SC-013: Verify correct IAM roles are granted."""
        required_roles = [
            'roles/storage.admin',  # For GCR
            'roles/artifactregistry.writer',  # For Artifact Registry
            'roles/run.admin',  # For Cloud Run
            'roles/iam.serviceAccountUser',  # Required for deployments
        ]

        for role in required_roles:
            assert role in script_content, \
                f"Script should grant role '{role}'"

    def test_iam_policy_binding(self, script_content):
        """Verify script uses gcloud IAM commands."""
        assert 'gcloud projects add-iam-policy-binding' in script_content, \
            "Script should use gcloud to add IAM policy bindings"

    def test_service_account_reference(self, script_content):
        """Verify service account is properly referenced."""
        assert 'serviceAccount:' in script_content or '--member=' in script_content, \
            "Script should reference service account in IAM binding"

    def test_cloud_run_permissions(self, script_content):
        """Verify Cloud Run permissions are granted."""
        assert 'roles/run.admin' in script_content or 'run.admin' in script_content, \
            "Script should grant Cloud Run admin role"

    def test_storage_permissions(self, script_content):
        """Verify storage permissions are granted."""
        storage_roles = ['storage.admin', 'artifactregistry.writer']
        has_storage = any(role in script_content for role in storage_roles)

        assert has_storage, \
            "Script should grant storage or artifact registry permissions"

    def test_secret_manager_permissions(self, script_content):
        """Verify Secret Manager permissions are included."""
        assert 'secretmanager' in script_content.lower(), \
            "Script should configure Secret Manager access"


class TestComputeSAPermissionsScript:
    """Tests for fix-compute-sa-permissions.sh."""

    @pytest.fixture
    def script_path(self):
        """Path to compute SA permissions script."""
        return SCRIPTS_DIR / "fix-compute-sa-permissions.sh"

    @pytest.fixture
    def script_content(self, script_path):
        """Read script content."""
        with open(script_path) as f:
            return f.read()

    def test_shell_syntax(self, script_path):
        """TC-SC-014: Verify shell script has no syntax errors."""
        try:
            result = subprocess.run(
                ['bash', '-n', str(script_path)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Shell syntax error: {result.stderr}"
        except FileNotFoundError:
            pytest.skip("bash not available for syntax checking")

    def test_service_account_identification(self, script_content):
        """TC-SC-015: Verify script correctly identifies compute service account."""
        # Compute service account format: {PROJECT_NUMBER}-compute@developer.gserviceaccount.com
        assert 'compute@developer.gserviceaccount.com' in script_content, \
            "Script should reference compute service account"

    def test_project_configuration(self, script_content):
        """Verify project ID and number are configured."""
        assert 'PROJECT_ID' in script_content or 'PROJECT_NUMBER' in script_content, \
            "Script should define project configuration"

    def test_secret_manager_access(self, script_content):
        """Verify script grants Secret Manager access."""
        assert 'secrets add-iam-policy-binding' in script_content or \
               'secretmanager.secretAccessor' in script_content, \
            "Script should grant Secret Manager access to compute SA"

    def test_database_url_secret(self, script_content):
        """Verify DATABASE_URL secret access is granted."""
        assert 'DATABASE_URL' in script_content, \
            "Script should grant access to DATABASE_URL secret"


class TestPermissionsIssueScript:
    """Tests for fix-permissions-issue.sh."""

    @pytest.fixture
    def script_path(self):
        """Path to permissions issue script."""
        return SCRIPTS_DIR / "fix-permissions-issue.sh"

    @pytest.fixture
    def script_content(self, script_path):
        """Read script content."""
        with open(script_path) as f:
            return f.read()

    def test_shell_syntax(self, script_path):
        """TC-SC-016: Verify shell script has no syntax errors."""
        try:
            result = subprocess.run(
                ['bash', '-n', str(script_path)],
                capture_output=True,
                text=True
            )
            assert result.returncode == 0, \
                f"Shell syntax error: {result.stderr}"
        except FileNotFoundError:
            pytest.skip("bash not available for syntax checking")

    def test_comprehensive_permission_fix(self, script_content):
        """TC-SC-017: Verify script addresses multiple permission scenarios."""
        # Should handle multiple service accounts or roles
        iam_commands = script_content.count('add-iam-policy-binding')

        assert iam_commands >= 3, \
            "Script should grant multiple permissions"

    def test_verification_steps(self, script_content):
        """Verify script includes verification steps."""
        verification_commands = [
            'get-iam-policy',
            'describe',
            'list'
        ]

        has_verification = any(cmd in script_content for cmd in verification_commands)

        assert has_verification, \
            "Script should include verification steps"

    def test_troubleshooting_output(self, script_content):
        """Verify script provides troubleshooting information."""
        assert 'echo' in script_content, \
            "Script should provide output messages"

        # Check for informative sections
        info_markers = ['Verifying', 'Granting', 'Current', 'permissions']
        found_markers = sum(1 for marker in info_markers if marker in script_content)

        assert found_markers >= 2, \
            "Script should have informative troubleshooting output"


class TestScriptSecurity:
    """Security-related tests for all scripts."""

    def test_no_hardcoded_secrets(self):
        """Verify scripts don't contain actual secret values."""
        scripts = [
            SCRIPTS_DIR / "run-migrations-manually.sh",
            SCRIPTS_DIR / "fix-gcp-permissions.sh",
            SCRIPTS_DIR / "fix-compute-sa-permissions.sh",
            SCRIPTS_DIR / "fix-permissions-issue.sh"
        ]

        for script_path in scripts:
            if not script_path.exists():
                continue

            with open(script_path) as f:
                content = f.read()

            # Check for patterns that might indicate secrets
            # Allow placeholder/example values
            secret_patterns = [
                r'sk-[a-zA-Z0-9]{48}',  # OpenAI-style keys
                r'AIza[a-zA-Z0-9_-]{35}',  # Google API keys
                r'"private_key":\s*"-----BEGIN PRIVATE KEY-----',  # GCP private keys
            ]

            for pattern in secret_patterns:
                matches = re.findall(pattern, content)
                # Filter out comments and documentation
                real_matches = [m for m in matches if not m.startswith('#')]
                assert len(real_matches) == 0, \
                    f"Potential secret found in {script_path.name}: pattern {pattern}"

    def test_scripts_use_variables(self):
        """Verify scripts use variables instead of hardcoded values."""
        scripts = [
            SCRIPTS_DIR / "run-migrations-manually.sh",
            SCRIPTS_DIR / "fix-gcp-permissions.sh"
        ]

        for script_path in scripts:
            if not script_path.exists():
                continue

            with open(script_path) as f:
                content = f.read()

            # Check that project ID is a variable
            assert 'PROJECT_ID=' in content or 'PROJECT_ID =' in content, \
                f"Script {script_path.name} should use PROJECT_ID variable"

    def test_scripts_have_comments(self):
        """Verify scripts have explanatory comments."""
        scripts = list(SCRIPTS_DIR.glob("*.sh"))

        for script_path in scripts:
            with open(script_path) as f:
                content = f.read()

            # Count comment lines (excluding shebang)
            comment_lines = [line for line in content.split('\n')
                           if line.strip().startswith('#') and not line.startswith('#!/')]

            assert len(comment_lines) >= 2, \
                f"Script {script_path.name} should have explanatory comments"


class TestScriptCompatibility:
    """Tests for script compatibility and portability."""

    def test_bash_compatibility(self):
        """Verify scripts use bash-compatible syntax."""
        scripts = list(SCRIPTS_DIR.glob("*.sh"))

        for script_path in scripts:
            with open(script_path) as f:
                content = f.read()

            # Check shebang
            first_line = content.split('\n')[0]
            assert first_line.startswith('#!/bin/bash') or first_line.startswith('#!/bin/sh'), \
                f"Script {script_path.name} should have proper shebang"

    def test_no_bashisms_in_sh_scripts(self):
        """Verify scripts with #!/bin/sh don't use bash-specific features."""
        scripts = list(SCRIPTS_DIR.glob("*.sh"))

        for script_path in scripts:
            with open(script_path) as f:
                content = f.read()

            first_line = content.split('\n')[0]
            if first_line.startswith('#!/bin/sh') and not first_line.startswith('#!/bin/bash'):
                # Check for bash-specific syntax
                bash_features = ['[[', 'function ', 'declare ', 'local ']
                for feature in bash_features:
                    assert feature not in content, \
                        f"Script {script_path.name} uses bash feature '{feature}' but has #!/bin/sh"

    def test_error_handling_consistency(self):
        """Verify all scripts have consistent error handling."""
        scripts = list(SCRIPTS_DIR.glob("*.sh"))

        for script_path in scripts:
            with open(script_path) as f:
                content = f.read()

            # Scripts should either have set -e or explicit error handling
            has_set_e = 'set -e' in content
            has_error_handling = '|| ' in content or 'if [' in content

            assert has_set_e or has_error_handling, \
                f"Script {script_path.name} should have error handling"
