# Deployment Regression Test Cases

This document outlines comprehensive test cases for all deployment-related files and configurations.

## 1. GitHub Workflows Test Cases

### 1.1 Deploy Workflow (deploy.yml)

#### TC-GW-001: Workflow Syntax Validation
- **Description**: Verify that the workflow YAML is valid and parseable
- **Expected Result**: No YAML syntax errors
- **Priority**: Critical
- **Status**: Automated

#### TC-GW-002: Trigger Configuration
- **Description**: Verify workflow triggers on push to main branch and workflow_dispatch
- **Expected Result**: Triggers are correctly configured with proper inputs
- **Priority**: High
- **Status**: Automated

#### TC-GW-003: Environment Variables
- **Description**: Verify all required environment variables are defined
- **Expected Result**: GCP_PROJECT_ID, GCP_REGION, BACKEND_SERVICE_NAME, FRONTEND_BUCKET, ARTIFACT_REGISTRY_REPO are present
- **Priority**: Critical
- **Status**: Automated

#### TC-GW-004: Job Dependencies
- **Description**: Verify deploy-frontend depends on deploy-backend completion
- **Expected Result**: Frontend deployment only starts after backend succeeds
- **Priority**: High
- **Status**: Automated

#### TC-GW-005: Backend Deployment Steps
- **Description**: Verify all backend deployment steps are present and in correct order
- **Expected Result**: Checkout, auth, SDK setup, Docker config, build, push, deploy, health check
- **Priority**: Critical
- **Status**: Automated

#### TC-GW-006: Frontend Deployment Steps
- **Description**: Verify all frontend deployment steps are present and in correct order
- **Expected Result**: Checkout, Node setup, install, build, auth, SDK setup, deploy, cache settings
- **Priority**: Critical
- **Status**: Automated

#### TC-GW-007: Secret References
- **Description**: Verify all secrets are properly referenced
- **Expected Result**: GCP_SA_KEY, CLOUD_SQL_INSTANCE, DATABASE_URL, SECRET_KEY are referenced
- **Priority**: Critical
- **Status**: Automated

#### TC-GW-008: Health Check Endpoint
- **Description**: Verify health check is performed after backend deployment
- **Expected Result**: Curl request to /health endpoint with failure handling
- **Priority**: High
- **Status**: Automated

#### TC-GW-009: Output Variables
- **Description**: Verify backend URL is captured and passed to frontend job
- **Expected Result**: backend_url output is set and used in frontend build
- **Priority**: High
- **Status**: Automated

#### TC-GW-010: Notification Job
- **Description**: Verify notification job runs after both deployments
- **Expected Result**: Job checks results of both deployments and reports status
- **Priority**: Medium
- **Status**: Automated

### 1.2 Backend CI Workflow (backend-ci.yml)

#### TC-BC-001: Workflow Syntax Validation
- **Description**: Verify backend CI workflow YAML is valid
- **Expected Result**: No YAML syntax errors
- **Priority**: Critical
- **Status**: Automated

#### TC-BC-002: Path Filtering
- **Description**: Verify workflow only triggers on backend file changes
- **Expected Result**: Triggers on backend/** and workflow file changes only
- **Priority**: Medium
- **Status**: Automated

#### TC-BC-003: PostgreSQL Service
- **Description**: Verify PostgreSQL service container is configured correctly
- **Expected Result**: Postgres 15 with health checks and proper credentials
- **Priority**: Critical
- **Status**: Automated

#### TC-BC-004: Python Version
- **Description**: Verify correct Python version is used
- **Expected Result**: Python 3.11 with pip caching
- **Priority**: High
- **Status**: Automated

#### TC-BC-005: Test Dependencies
- **Description**: Verify all test dependencies are installed
- **Expected Result**: pytest, pytest-cov, flake8 are installed
- **Priority**: High
- **Status**: Automated

#### TC-BC-006: Linting Step
- **Description**: Verify flake8 linting is configured properly
- **Expected Result**: Two-stage linting with syntax errors causing failure
- **Priority**: Medium
- **Status**: Automated

#### TC-BC-007: Database Migrations
- **Description**: Verify migrations run before tests
- **Expected Result**: flask db upgrade executes successfully
- **Priority**: Critical
- **Status**: Automated

#### TC-BC-008: Test Execution
- **Description**: Verify pytest runs with coverage reporting
- **Expected Result**: Tests run with XML and terminal coverage reports
- **Priority**: Critical
- **Status**: Automated

#### TC-BC-009: Docker Build Test
- **Description**: Verify Docker image builds successfully
- **Expected Result**: Image builds and tags correctly
- **Priority**: High
- **Status**: Automated

#### TC-BC-010: Docker Container Test
- **Description**: Verify Docker container starts and responds to health checks
- **Expected Result**: Container runs and /health endpoint responds
- **Priority**: High
- **Status**: Automated

### 1.3 Frontend CI Workflow (frontend-ci.yml)

#### TC-FC-001: Workflow Syntax Validation
- **Description**: Verify frontend CI workflow YAML is valid
- **Expected Result**: No YAML syntax errors
- **Priority**: Critical
- **Status**: Automated

#### TC-FC-002: Path Filtering
- **Description**: Verify workflow only triggers on frontend file changes
- **Expected Result**: Triggers on frontend/** and workflow file changes only
- **Priority**: Medium
- **Status**: Automated

#### TC-FC-003: Node.js Version
- **Description**: Verify correct Node.js version is used
- **Expected Result**: Node.js 18 with npm caching
- **Priority**: High
- **Status**: Automated

#### TC-FC-004: Dependency Installation
- **Description**: Verify npm ci is used for clean installs
- **Expected Result**: npm ci runs in frontend directory
- **Priority**: High
- **Status**: Automated

#### TC-FC-005: Type Checking
- **Description**: Verify TypeScript type checking is performed
- **Expected Result**: Type check runs with fallback to tsc --noEmit
- **Priority**: Medium
- **Status**: Automated

#### TC-FC-006: Linting
- **Description**: Verify linting step exists with fallback
- **Expected Result**: Lint runs or skips gracefully if not configured
- **Priority**: Low
- **Status**: Automated

#### TC-FC-007: Test Execution
- **Description**: Verify tests run with coverage
- **Expected Result**: Tests run with coverage or skip gracefully
- **Priority**: Medium
- **Status**: Automated

#### TC-FC-008: Production Build
- **Description**: Verify production bundle is created
- **Expected Result**: npm run build succeeds
- **Priority**: Critical
- **Status**: Automated

#### TC-FC-009: Bundle Size Check
- **Description**: Verify bundle size is reported
- **Expected Result**: dist/ size is calculated and displayed
- **Priority**: Low
- **Status**: Automated

#### TC-FC-010: Build Artifacts Upload
- **Description**: Verify build artifacts are uploaded
- **Expected Result**: Artifacts uploaded with 7-day retention
- **Priority**: Medium
- **Status**: Automated

#### TC-FC-011: Accessibility Job
- **Description**: Verify accessibility testing job exists
- **Expected Result**: Job depends on test job and has placeholder for axe-core
- **Priority**: Low
- **Status**: Automated

## 2. Backend Development Test Cases

### 2.1 Dockerfile

#### TC-BD-001: Base Image
- **Description**: Verify correct Python base image is used
- **Expected Result**: Uses official Python image with appropriate version
- **Priority**: High
- **Status**: Automated

#### TC-BD-002: Working Directory
- **Description**: Verify working directory is set correctly
- **Expected Result**: WORKDIR is set to /app
- **Priority**: Medium
- **Status**: Automated

#### TC-BD-003: Requirements Installation
- **Description**: Verify requirements.txt is copied and installed
- **Expected Result**: Dependencies installed before copying source code
- **Priority**: High
- **Status**: Automated

#### TC-BD-004: Port Exposure
- **Description**: Verify correct port is exposed
- **Expected Result**: Port 5000 is exposed
- **Priority**: Medium
- **Status**: Automated

#### TC-BD-005: Entry Point
- **Description**: Verify correct entry point command
- **Expected Result**: Uses gunicorn or similar production server
- **Priority**: High
- **Status**: Automated

#### TC-BD-006: Multi-stage Build
- **Description**: Verify if multi-stage build is used for optimization
- **Expected Result**: Image size is optimized
- **Priority**: Low
- **Status**: Manual

### 2.2 Requirements.txt

#### TC-BD-007: Core Dependencies
- **Description**: Verify Flask and essential dependencies are present
- **Expected Result**: Flask, SQLAlchemy, psycopg2-binary listed
- **Priority**: Critical
- **Status**: Automated

#### TC-BD-008: Version Pinning
- **Description**: Verify dependencies have version constraints
- **Expected Result**: Major versions are pinned for stability
- **Priority**: High
- **Status**: Automated

#### TC-BD-009: Security Vulnerabilities
- **Description**: Verify no known vulnerabilities in dependencies
- **Expected Result**: pip-audit or safety check passes
- **Priority**: High
- **Status**: Automated

### 2.3 Config.py

#### TC-BD-010: Environment Variable Loading
- **Description**: Verify configuration loads from environment variables
- **Expected Result**: DATABASE_URL, SECRET_KEY, etc. loaded from env
- **Priority**: Critical
- **Status**: Automated

#### TC-BD-011: Default Values
- **Description**: Verify sensible defaults for non-critical settings
- **Expected Result**: Defaults don't expose security issues
- **Priority**: Medium
- **Status**: Automated

## 3. Frontend Development Test Cases

### 3.1 Package.json

#### TC-FD-001: Build Scripts
- **Description**: Verify build scripts are defined
- **Expected Result**: build, dev, preview scripts exist
- **Priority**: High
- **Status**: Automated

#### TC-FD-002: Dependencies
- **Description**: Verify core dependencies are present
- **Expected Result**: React, TypeScript, Vite are listed
- **Priority**: Critical
- **Status**: Automated

#### TC-FD-003: Version Compatibility
- **Description**: Verify dependency versions are compatible
- **Expected Result**: No peer dependency conflicts
- **Priority**: Medium
- **Status**: Automated

### 3.2 Vite Configuration

#### TC-FD-004: Build Configuration
- **Description**: Verify Vite build settings are production-ready
- **Expected Result**: Output directory is 'build' or 'dist'
- **Priority**: High
- **Status**: Automated

#### TC-FD-005: Environment Variables
- **Description**: Verify environment variable handling
- **Expected Result**: VITE_ prefixed variables are accessible
- **Priority**: High
- **Status**: Automated

### 3.3 TypeScript Configuration

#### TC-FD-006: Strict Mode
- **Description**: Verify TypeScript strict mode settings
- **Expected Result**: Appropriate strictness for production code
- **Priority**: Medium
- **Status**: Automated

#### TC-FD-007: Module Resolution
- **Description**: Verify module resolution is configured correctly
- **Expected Result**: Imports work correctly with bundler
- **Priority**: High
- **Status**: Automated

## 4. Scripts Test Cases

### 4.1 run-migrations-manually.sh

#### TC-SC-001: Shell Syntax
- **Description**: Verify shell script has no syntax errors
- **Expected Result**: shellcheck passes with no errors
- **Priority**: High
- **Status**: Automated

#### TC-SC-002: Error Handling
- **Description**: Verify script uses 'set -e' for error propagation
- **Expected Result**: Script exits on first error
- **Priority**: High
- **Status**: Automated

#### TC-SC-003: Variable Definition
- **Description**: Verify all required variables are defined
- **Expected Result**: PROJECT_ID, REGION, SERVICE_NAME, CLOUD_SQL_INSTANCE are set
- **Priority**: Critical
- **Status**: Automated

#### TC-SC-004: Image Retrieval
- **Description**: Verify script retrieves current deployed image
- **Expected Result**: gcloud command correctly fetches image URL
- **Priority**: High
- **Status**: Automated

#### TC-SC-005: Job Creation
- **Description**: Verify migration job is created with correct settings
- **Expected Result**: Job includes secrets, env vars, and Cloud SQL instance
- **Priority**: Critical
- **Status**: Automated

#### TC-SC-006: Job Execution
- **Description**: Verify job executes with --wait flag
- **Expected Result**: Script waits for job completion
- **Priority**: High
- **Status**: Automated

#### TC-SC-007: Output Messages
- **Description**: Verify helpful output messages are displayed
- **Expected Result**: Clear progress and completion messages
- **Priority**: Low
- **Status**: Manual

### 4.2 copy-github-secrets.sh

#### TC-SC-008: Shell Syntax
- **Description**: Verify shell script has no syntax errors
- **Expected Result**: shellcheck passes with no errors
- **Priority**: High
- **Status**: Automated

#### TC-SC-009: GitHub CLI Check
- **Description**: Verify script checks for gh CLI availability
- **Expected Result**: Script fails gracefully if gh not installed
- **Priority**: Medium
- **Status**: Automated

#### TC-SC-010: Authentication Check
- **Description**: Verify script checks GitHub authentication
- **Expected Result**: Script verifies gh auth status
- **Priority**: High
- **Status**: Automated

### 4.3 fix-gcp-permissions.sh

#### TC-SC-011: Shell Syntax
- **Description**: Verify shell script has no syntax errors
- **Expected Result**: shellcheck passes with no errors
- **Priority**: High
- **Status**: Automated

#### TC-SC-012: GCP Project Check
- **Description**: Verify script validates GCP project is set
- **Expected Result**: Script checks gcloud config
- **Priority**: High
- **Status**: Automated

#### TC-SC-013: Permission Grants
- **Description**: Verify correct IAM roles are granted
- **Expected Result**: Appropriate roles for Cloud Run, SQL, Storage
- **Priority**: Critical
- **Status**: Manual

### 4.4 fix-compute-sa-permissions.sh

#### TC-SC-014: Shell Syntax
- **Description**: Verify shell script has no syntax errors
- **Expected Result**: shellcheck passes with no errors
- **Priority**: High
- **Status**: Automated

#### TC-SC-015: Service Account Identification
- **Description**: Verify script correctly identifies compute service account
- **Expected Result**: Compute SA email is constructed correctly
- **Priority**: High
- **Status**: Automated

### 4.5 fix-permissions-issue.sh

#### TC-SC-016: Shell Syntax
- **Description**: Verify shell script has no syntax errors
- **Expected Result**: shellcheck passes with no errors
- **Priority**: High
- **Status**: Automated

#### TC-SC-017: Comprehensive Permission Fix
- **Description**: Verify script addresses multiple permission scenarios
- **Expected Result**: Multiple service accounts and roles are configured
- **Priority**: High
- **Status**: Automated

## 5. Integration Test Cases

### 5.1 End-to-End Deployment

#### TC-INT-001: Full Deployment Flow
- **Description**: Verify complete deployment from commit to production
- **Expected Result**: Code push triggers workflows, deploys backend and frontend
- **Priority**: Critical
- **Status**: Manual

#### TC-INT-002: Rollback Scenario
- **Description**: Verify ability to rollback to previous deployment
- **Expected Result**: Previous version can be restored
- **Priority**: High
- **Status**: Manual

#### TC-INT-003: Migration Execution
- **Description**: Verify database migrations execute correctly in production
- **Expected Result**: Migrations apply without data loss
- **Priority**: Critical
- **Status**: Manual

### 5.2 Security

#### TC-SEC-001: Secret Management
- **Description**: Verify secrets are not exposed in logs or artifacts
- **Expected Result**: No secrets visible in workflow logs
- **Priority**: Critical
- **Status**: Manual

#### TC-SEC-002: IAM Permissions
- **Description**: Verify service accounts have minimum required permissions
- **Expected Result**: Principle of least privilege is followed
- **Priority**: High
- **Status**: Manual

#### TC-SEC-003: Container Security
- **Description**: Verify Docker image has no critical vulnerabilities
- **Expected Result**: Security scan passes
- **Priority**: High
- **Status**: Automated

## 6. Performance Test Cases

### 6.1 Build Performance

#### TC-PERF-001: Backend Build Time
- **Description**: Verify backend Docker build completes in reasonable time
- **Expected Result**: Build completes in under 5 minutes
- **Priority**: Low
- **Status**: Manual

#### TC-PERF-002: Frontend Build Time
- **Description**: Verify frontend build completes in reasonable time
- **Expected Result**: Build completes in under 3 minutes
- **Priority**: Low
- **Status**: Manual

#### TC-PERF-003: Cache Effectiveness
- **Description**: Verify dependency caching reduces build times
- **Expected Result**: Cached builds are significantly faster
- **Priority**: Low
- **Status**: Manual

## Test Status Summary

- **Total Test Cases**: 67
- **Automated**: 47
- **Manual**: 20
- **Critical Priority**: 18
- **High Priority**: 29
- **Medium Priority**: 14
- **Low Priority**: 6

## Notes

1. All automated tests should run in CI/CD pipeline
2. Manual tests should be performed before major releases
3. Security tests should be run regularly and before each deployment
4. Performance baselines should be established and monitored over time
5. Test cases should be reviewed and updated quarterly
