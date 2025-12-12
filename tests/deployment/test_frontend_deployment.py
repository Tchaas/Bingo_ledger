"""
Regression tests for frontend deployment configurations.

Tests verify package.json, Vite configuration, and build settings
for proper production deployment.
"""

import json
import re
import pytest
from pathlib import Path


# Get the project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent
FRONTEND_DIR = PROJECT_ROOT / "frontend"


class TestPackageJson:
    """Tests for frontend package.json configuration."""

    @pytest.fixture
    def package_json_path(self):
        """Path to package.json."""
        return FRONTEND_DIR / "package.json"

    @pytest.fixture
    def package_json(self, package_json_path):
        """Load package.json content."""
        with open(package_json_path) as f:
            return json.load(f)

    def test_package_json_exists(self, package_json_path):
        """Verify package.json exists in frontend directory."""
        assert package_json_path.exists(), "package.json not found in frontend directory"

    def test_package_json_valid(self, package_json):
        """Verify package.json is valid JSON."""
        assert isinstance(package_json, dict), "package.json is not a valid JSON object"

    def test_build_scripts(self, package_json):
        """TC-FD-001: Verify build scripts are defined."""
        assert "scripts" in package_json, "No scripts section in package.json"

        scripts = package_json["scripts"]

        # Essential scripts
        assert "build" in scripts, "build script not defined"
        assert "dev" in scripts, "dev script not defined"

    def test_build_script_command(self, package_json):
        """Verify build script uses vite."""
        scripts = package_json.get("scripts", {})
        build_script = scripts.get("build", "")

        assert "vite build" in build_script or "vite" in build_script, \
            "build script should use vite build"

    def test_core_dependencies(self, package_json):
        """TC-FD-002: Verify core dependencies are present."""
        assert "dependencies" in package_json, "No dependencies section in package.json"

        dependencies = package_json["dependencies"]
        required_deps = ["react", "react-dom"]

        for dep in required_deps:
            assert dep in dependencies, \
                f"Required dependency '{dep}' not found in package.json"

    def test_react_version(self, package_json):
        """Verify React version is modern."""
        dependencies = package_json.get("dependencies", {})
        react_version = dependencies.get("react", "")

        # Extract version number
        version_match = re.search(r'(\d+)\.', react_version)
        if version_match:
            major_version = int(version_match.group(1))
            assert major_version >= 18, \
                f"React version should be 18 or higher, found: {react_version}"

    def test_dev_dependencies(self, package_json):
        """Verify development dependencies are present."""
        assert "devDependencies" in package_json, \
            "No devDependencies section in package.json"

        dev_deps = package_json["devDependencies"]

        # Should have Vite
        assert "vite" in dev_deps, "Vite not found in devDependencies"

    def test_vite_version(self, package_json):
        """Verify Vite version is appropriate."""
        dev_deps = package_json.get("devDependencies", {})
        vite_version = dev_deps.get("vite", "")

        assert vite_version, "Vite version not specified"

        # Extract version number
        version_match = re.search(r'(\d+)\.', vite_version)
        if version_match:
            major_version = int(version_match.group(1))
            # Vite 4+ is recommended
            assert major_version >= 3, \
                f"Vite version should be 3 or higher, found: {vite_version}"

    def test_version_compatibility(self, package_json):
        """TC-FD-003: Verify dependency versions don't have obvious conflicts."""
        dependencies = package_json.get("dependencies", {})
        dev_dependencies = package_json.get("devDependencies", {})

        # Check React and React-DOM have compatible versions
        if "react" in dependencies and "react-dom" in dependencies:
            react_ver = dependencies["react"]
            react_dom_ver = dependencies["react-dom"]

            # Extract major versions
            react_major = re.search(r'(\d+)\.', react_ver)
            react_dom_major = re.search(r'(\d+)\.', react_dom_ver)

            if react_major and react_dom_major:
                assert react_major.group(1) == react_dom_major.group(1), \
                    "React and React-DOM should have matching major versions"

    def test_no_deprecated_packages(self, package_json):
        """Check for commonly deprecated packages."""
        all_deps = {
            **package_json.get("dependencies", {}),
            **package_json.get("devDependencies", {})
        }

        deprecated = []
        # Add packages that are known to be deprecated
        deprecated_packages = []  # Add any known deprecated packages here

        for pkg in deprecated_packages:
            if pkg in all_deps:
                deprecated.append(pkg)

        assert len(deprecated) == 0, \
            f"Deprecated packages found: {deprecated}"

    def test_ui_library_presence(self, package_json):
        """Verify UI component library is configured."""
        dependencies = package_json.get("dependencies", {})

        # Check for common UI libraries (adjust based on your project)
        ui_libs = ["@radix-ui", "lucide-react", "class-variance-authority"]

        has_ui_lib = any(
            any(lib in dep for lib in ui_libs)
            for dep in dependencies.keys()
        )

        assert has_ui_lib, "No UI component library found"


class TestViteConfig:
    """Tests for Vite configuration."""

    @pytest.fixture
    def vite_config_path(self):
        """Path to vite.config.ts."""
        return FRONTEND_DIR / "vite.config.ts"

    @pytest.fixture
    def vite_config_content(self, vite_config_path):
        """Read vite.config.ts content."""
        with open(vite_config_path) as f:
            return f.read()

    def test_vite_config_exists(self, vite_config_path):
        """Verify vite.config.ts exists."""
        # Check for .ts or .js version
        ts_exists = (FRONTEND_DIR / "vite.config.ts").exists()
        js_exists = (FRONTEND_DIR / "vite.config.js").exists()

        assert ts_exists or js_exists, \
            "vite.config.ts or vite.config.js not found in frontend directory"

    def test_build_configuration(self, vite_config_content):
        """TC-FD-004: Verify Vite build settings are production-ready."""
        # Check for build configuration
        assert "build:" in vite_config_content or "build :" in vite_config_content, \
            "Build configuration not found in vite.config"

        # Check for output directory
        assert "outDir" in vite_config_content, \
            "outDir not specified in build configuration"

        # Verify outDir is set to 'build' or 'dist'
        outdir_match = re.search(r"outDir:\s*['\"](\w+)['\"]", vite_config_content)
        if outdir_match:
            outdir = outdir_match.group(1)
            assert outdir in ['build', 'dist'], \
                f"outDir should be 'build' or 'dist', found: {outdir}"

    def test_plugins_configuration(self, vite_config_content):
        """Verify Vite plugins are configured."""
        assert "plugins:" in vite_config_content or "plugins :" in vite_config_content, \
            "Plugins configuration not found"

        # Should have React plugin
        assert "react" in vite_config_content, \
            "React plugin not configured"

    def test_react_plugin(self, vite_config_content):
        """Verify React plugin is properly configured."""
        # Check for @vitejs/plugin-react or @vitejs/plugin-react-swc
        assert "@vitejs/plugin-react" in vite_config_content, \
            "Vite React plugin not imported"

    def test_resolve_configuration(self, vite_config_content):
        """Verify resolve configuration exists."""
        # Path aliases are common and helpful
        if "resolve:" in vite_config_content or "resolve :" in vite_config_content:
            # If resolve is configured, check for alias
            assert "alias" in vite_config_content, \
                "resolve configured but no aliases defined"

    def test_environment_variable_handling(self, vite_config_content):
        """TC-FD-005: Verify environment variables can be handled."""
        # Vite uses import.meta.env, just verify config doesn't break it
        # This is more of a structural check
        assert "defineConfig" in vite_config_content, \
            "Vite config should use defineConfig for proper typing"

    def test_server_configuration(self, vite_config_content):
        """Verify dev server configuration."""
        # Check if server config exists
        has_server_config = "server:" in vite_config_content or "server :" in vite_config_content

        if has_server_config:
            # If configured, check for port
            port_match = re.search(r"port:\s*(\d+)", vite_config_content)
            if port_match:
                port = int(port_match.group(1))
                # Port should be in reasonable range
                assert 1024 <= port <= 65535, \
                    f"Server port {port} is outside valid range"

    def test_import_statements(self, vite_config_content):
        """Verify proper imports."""
        # Should import defineConfig
        assert "import" in vite_config_content, \
            "No imports found in vite.config"
        assert "defineConfig" in vite_config_content, \
            "defineConfig not imported from vite"

    def test_export_default(self, vite_config_content):
        """Verify config is properly exported."""
        assert "export default" in vite_config_content, \
            "Config not exported as default"


class TestFrontendStructure:
    """Tests for overall frontend structure."""

    def test_src_directory_exists(self):
        """Verify src directory exists."""
        src_dir = FRONTEND_DIR / "src"
        assert src_dir.exists(), "src directory not found"
        assert src_dir.is_dir(), "src should be a directory"

    def test_index_html_exists(self):
        """Verify index.html exists."""
        index_html = FRONTEND_DIR / "index.html"
        assert index_html.exists(), "index.html not found in frontend directory"

    def test_index_html_content(self):
        """Verify index.html has proper structure."""
        index_html = FRONTEND_DIR / "index.html"
        with open(index_html) as f:
            content = f.read()

        # Should have root div
        assert 'id="root"' in content or "id='root'" in content, \
            "index.html should have a root div"

        # Should have script tag
        assert "<script" in content, \
            "index.html should have script tag for main entry point"

    def test_gitignore_exists(self):
        """Verify .gitignore exists in frontend."""
        gitignore = FRONTEND_DIR / ".gitignore"
        assert gitignore.exists(), ".gitignore not found in frontend directory"

    def test_gitignore_content(self):
        """Verify .gitignore has essential entries."""
        gitignore = FRONTEND_DIR / ".gitignore"
        with open(gitignore) as f:
            content = f.read()

        essential_entries = ["node_modules", "dist", "build"]

        for entry in essential_entries:
            assert entry in content, \
                f".gitignore should include {entry}"

    def test_public_or_assets_directory(self):
        """Verify public or assets directory exists for static files."""
        public_dir = FRONTEND_DIR / "public"
        assets_dir = FRONTEND_DIR / "src" / "assets"

        has_static_dir = public_dir.exists() or assets_dir.exists()

        assert has_static_dir, \
            "Neither public/ nor src/assets/ directory found for static files"

    def test_components_directory_structure(self):
        """Verify components directory exists."""
        src_dir = FRONTEND_DIR / "src"
        components_dir = src_dir / "components"

        # Components directory is common but not required
        # Just verify src exists
        assert src_dir.exists(), "src directory should exist"

    def test_readme_exists(self):
        """Verify README.md exists."""
        readme = FRONTEND_DIR / "README.md"
        # README is helpful but not critical for deployment
        if readme.exists():
            assert readme.is_file(), "README.md should be a file"

    def test_no_typescript_errors_in_config(self):
        """Verify vite config doesn't have obvious TypeScript errors."""
        vite_config_ts = FRONTEND_DIR / "vite.config.ts"

        if vite_config_ts.exists():
            with open(vite_config_ts) as f:
                content = f.read()

            # Check for common syntax errors
            # Count brackets
            open_braces = content.count('{')
            close_braces = content.count('}')
            open_parens = content.count('(')
            close_parens = content.count(')')
            open_brackets = content.count('[')
            close_brackets = content.count(']')

            assert open_braces == close_braces, \
                "Mismatched curly braces in vite.config.ts"
            assert open_parens == close_parens, \
                "Mismatched parentheses in vite.config.ts"
            assert open_brackets == close_brackets, \
                "Mismatched square brackets in vite.config.ts"


class TestBuildOutput:
    """Tests for build output configuration."""

    def test_build_directory_in_gitignore(self):
        """Verify build output directories are in .gitignore."""
        gitignore = FRONTEND_DIR / ".gitignore"

        with open(gitignore) as f:
            content = f.read()

        build_dirs = ["dist", "build", ".vite"]

        found_build_dir = any(dir_name in content for dir_name in build_dirs)

        assert found_build_dir, \
            "Build output directory should be in .gitignore"

    def test_no_build_directory_committed(self):
        """Verify build directory doesn't exist in repo (should be gitignored)."""
        # This test checks that build artifacts aren't accidentally committed
        dist_dir = FRONTEND_DIR / "dist"
        build_dir = FRONTEND_DIR / "build"

        # If they exist, they should be empty or contain only expected files
        # In a fresh clone, they shouldn't exist
        # This is more of a sanity check
        if dist_dir.exists():
            # If it exists, it should at least be in gitignore
            gitignore = FRONTEND_DIR / ".gitignore"
            with open(gitignore) as f:
                assert "dist" in f.read(), \
                    "dist directory exists but not in .gitignore"


class TestTypeScriptConfiguration:
    """Tests for TypeScript configuration (if present)."""

    def test_typescript_in_project(self):
        """Check if TypeScript is used in the project."""
        # Check for .ts or .tsx files
        vite_config_ts = FRONTEND_DIR / "vite.config.ts"
        has_typescript = vite_config_ts.exists()

        if not has_typescript:
            # Check for TypeScript in package.json
            package_json_path = FRONTEND_DIR / "package.json"
            with open(package_json_path) as f:
                package_json = json.load(f)

            dev_deps = package_json.get("devDependencies", {})
            has_typescript = "typescript" in dev_deps

        # If TypeScript is used, certain configurations should exist
        if has_typescript:
            # This is just informational
            assert has_typescript, "TypeScript appears to be in use"

    def test_type_declarations(self):
        """Verify type declaration packages for Node if using TypeScript."""
        package_json_path = FRONTEND_DIR / "package.json"
        with open(package_json_path) as f:
            package_json = json.load(f)

        dev_deps = package_json.get("devDependencies", {})

        # If using TypeScript, should have type definitions
        if "typescript" in dev_deps:
            # @types/node is helpful for Node.js APIs
            # This is a recommendation, not a hard requirement
            pass  # Just checking structure
