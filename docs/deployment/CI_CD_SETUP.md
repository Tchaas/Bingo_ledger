# CI/CD Setup Guide - GitHub Actions

**Last Updated**: 2025-12-09
**Status**: Production Ready

## 📋 Overview

This project uses GitHub Actions for continuous integration and deployment. We have three main workflows:

1. **Backend CI** - Tests, lints, and builds the Python Flask backend
2. **Frontend CI** - Tests, type-checks, and builds the React frontend
3. **Deploy** - Deploys both backend and frontend to Google Cloud Platform

## 🔄 Workflows

### 1. Backend CI (`backend-ci.yml`)

**Triggers**:
- Push to `main` or `develop` branches (when backend files change)
- Pull requests to `main` or `develop` (when backend files change)

**Jobs**:

#### Test Job
- Runs on Ubuntu latest
- Sets up PostgreSQL 15 service container
- Uses Python 3.13
- Steps:
  1. Checkout code
  2. Install Python dependencies with pip cache
  3. Lint with flake8
  4. Run database migrations
  5. Execute pytest with coverage
  6. Upload coverage to Codecov

#### Build Job
- Runs after test job succeeds
- Builds Docker image
- Tests that Docker container starts and health endpoint responds

**Environment Variables Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `FLASK_ENV` - Set to "testing"
- `SECRET_KEY` - Test secret key
- `GCP_PROJECT_ID` - Test project ID

### 2. Frontend CI (`frontend-ci.yml`)

**Triggers**:
- Push to `main` or `develop` branches (when frontend files change)
- Pull requests to `main` or `develop` (when frontend files change)

**Jobs**:

#### Test Job
- Runs on Ubuntu latest
- Uses Node.js 18
- Steps:
  1. Checkout code
  2. Install dependencies with npm cache
  3. Run TypeScript type checking
  4. Run linter (if configured)
  5. Execute tests with coverage
  6. Build production bundle
  7. Check bundle size
  8. Upload build artifacts (retained for 7 days)

#### Accessibility Job
- Runs after test job succeeds
- Placeholder for future accessibility testing
- Can integrate tools like axe-core

**Environment Variables Required**:
- None for CI, but build uses `VITE_API_URL` if available

### 3. Deploy (`deploy.yml`)

**Triggers**:
- Push to `main` branch
- Manual workflow dispatch with environment selection

**Jobs**:

#### Deploy Backend Job
- Deploys Flask API to Cloud Run
- Steps:
  1. Authenticate to GCP
  2. Build Docker image
  3. Push to Google Container Registry
  4. Run database migrations as Cloud Run Job
  5. Deploy to Cloud Run service
  6. Test deployment health endpoint

**Configuration**:
- Service: `tchaas-ledger-api`
- Region: `us-central1`
- Min instances: 0 (scales to zero)
- Max instances: 10
- CPU: 1 vCPU
- Memory: 512 Mi
- Timeout: 300 seconds

#### Deploy Frontend Job
- Deploys React app to Cloud Storage
- Runs after backend deployment succeeds
- Steps:
  1. Install Node.js dependencies
  2. Build production bundle
  3. Authenticate to GCP
  4. Upload to Cloud Storage bucket
  5. Set cache headers (1 year for assets, no-cache for index.html)

#### Notify Job
- Runs after both deployments (always)
- Reports deployment status

## 🔐 Required Secrets

Configure these in GitHub repository settings under Settings → Secrets and variables → Actions:

### Required Secrets

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `GCP_SA_KEY` | Service account JSON key for GCP authentication | `{"type":"service_account"...}` |
| `DATABASE_URL` | Production database connection string | `postgresql://user:pass@/db?host=/cloudsql/...` |
| `SECRET_KEY` | Flask secret key for sessions | Random 32+ character string |
| `CLOUD_SQL_INSTANCE` | Cloud SQL instance connection name | `tchaas-ledger:us-central1:tchaas-ledger-db` |
| `BACKEND_API_URL` | Backend API URL for frontend | `https://tchaas-ledger-api-xyz.run.app` |

### Optional Secrets

| Secret Name | Description |
|-------------|-------------|
| `CODECOV_TOKEN` | Token for uploading code coverage (if using Codecov) |

## 🚀 Setup Instructions

### 1. Create GCP Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Service Account" \
  --project=tchaas-ledger

# Grant necessary permissions
gcloud projects add-iam-policy-binding tchaas-ledger \
  --member="serviceAccount:github-actions@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding tchaas-ledger \
  --member="serviceAccount:github-actions@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding tchaas-ledger \
  --member="serviceAccount:github-actions@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding tchaas-ledger \
  --member="serviceAccount:github-actions@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@tchaas-ledger.iam.gserviceaccount.com
```

### 2. Add Secret to GitHub

```bash
# Copy the entire JSON file content
cat github-actions-key.json

# Go to GitHub repository → Settings → Secrets and variables → Actions
# Click "New repository secret"
# Name: GCP_SA_KEY
# Value: Paste the JSON content
```

### 3. Create GCP Secrets for Environment Variables

```bash
# Create secrets in Secret Manager
echo -n "your-production-secret-key" | \
  gcloud secrets create SECRET_KEY --data-file=- --project=tchaas-ledger

echo -n "postgresql://user:pass@/tchaas_ledger?host=/cloudsql/tchaas-ledger:us-central1:tchaas-ledger-db" | \
  gcloud secrets create DATABASE_URL --data-file=- --project=tchaas-ledger

# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding SECRET_KEY \
  --member="serviceAccount:tchaas-ledger-sa@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:tchaas-ledger-sa@tchaas-ledger.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Create Cloud Storage Bucket for Frontend

```bash
# Create bucket
gsutil mb -p tchaas-ledger -l us-central1 gs://tchaas-ledger-frontend

# Make bucket publicly readable
gsutil iam ch allUsers:objectViewer gs://tchaas-ledger-frontend

# Set website configuration
gsutil web set -m index.html -e index.html gs://tchaas-ledger-frontend
```

### 5. Add Remaining Secrets to GitHub

Add these secrets in GitHub repository settings:

- `DATABASE_URL`: Same as GCP Secret Manager value
- `SECRET_KEY`: Same as GCP Secret Manager value
- `CLOUD_SQL_INSTANCE`: `tchaas-ledger:us-central1:tchaas-ledger-db`
- `BACKEND_API_URL`: Will be available after first deployment

## 🧪 Testing Workflows Locally

### Test Backend Workflow

```bash
cd backend

# Set up test database
createdb tchaas_ledger_test

# Run tests
export DATABASE_URL="postgresql://localhost/tchaas_ledger_test"
export FLASK_ENV=testing
pytest --cov=app

# Lint
flake8 .

# Build Docker
docker build -t test-backend .
docker run -e DATABASE_URL=sqlite:///test.db -p 5000:5000 test-backend
```

### Test Frontend Workflow

```bash
cd frontend

# Install dependencies
npm ci

# Type check
npx tsc --noEmit

# Test
npm test

# Build
npm run build
```

## 📊 Monitoring Workflows

### View Workflow Runs

1. Go to GitHub repository
2. Click "Actions" tab
3. Select workflow from left sidebar
4. View run history and logs

### Workflow Status Badges

Status badges are displayed in README.md:

```markdown
[![Backend CI](https://github.com/tchaas/tchaasledger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/tchaas/tchaasledger/actions/workflows/backend-ci.yml)
```

## 🔧 Troubleshooting

### Common Issues

#### 1. GCP Authentication Failed

**Error**: `Error: google-github-actions/auth failed with: failed to generate Google Cloud federated token`

**Solution**:
- Verify `GCP_SA_KEY` secret is correctly set
- Ensure service account has necessary permissions
- Check JSON key is valid and not expired

#### 2. Database Migration Failed

**Error**: `Cloud Run job execution failed`

**Solution**:
- Check `DATABASE_URL` secret is correct
- Verify Cloud SQL instance is running
- Check migration files are valid
- Review Cloud Run job logs: `gcloud run jobs logs read migration-<sha> --region us-central1`

#### 3. Docker Build Failed

**Error**: `Failed to build Docker image`

**Solution**:
- Check Dockerfile syntax
- Verify all dependencies are in requirements.txt
- Review build logs for specific errors
- Test locally: `docker build -t test .`

#### 4. Health Check Failed

**Error**: `curl: (7) Failed to connect to localhost port 5000`

**Solution**:
- Check app is listening on correct port
- Verify health endpoint exists at `/health`
- Review application logs
- Ensure environment variables are set

#### 5. Frontend Build Failed

**Error**: `npm run build failed`

**Solution**:
- Check TypeScript errors: `npx tsc --noEmit`
- Verify all dependencies are installed
- Review build logs
- Test locally: `npm run build`

### Debug Logs

Enable debug logging in workflows:

```yaml
- name: Debug
  run: |
    echo "GitHub SHA: ${{ github.sha }}"
    echo "GitHub Ref: ${{ github.ref }}"
    env
```

## 🔄 Updating Workflows

### Modify Workflow Files

1. Edit workflow files in `.github/workflows/`
2. Commit and push changes
3. Workflows will use updated version on next run

### Testing Workflow Changes

Before merging to main:
1. Create feature branch
2. Modify workflow
3. Push to feature branch
4. Create pull request
5. Review workflow run in PR
6. Merge if successful

## 📈 Best Practices

### 1. Branch Protection

Configure branch protection rules:
- Require pull request reviews
- Require status checks to pass (CI workflows)
- Require branches to be up to date
- Don't allow force pushes

### 2. Secret Rotation

Rotate secrets regularly:
- Service account keys: Every 90 days
- Database passwords: Every 180 days
- Secret keys: Annually

### 3. Caching

Workflows use caching to speed up runs:
- Python dependencies: `pip` cache
- Node.js dependencies: `npm` cache
- Docker layers: BuildKit cache

### 4. Conditional Deployment

Deploy workflow only runs on `main` branch:
```yaml
if: github.ref == 'refs/heads/main'
```

### 5. Environment Separation

Consider adding staging environment:
1. Create `staging` branch
2. Add staging GCP resources
3. Update deploy workflow to handle both environments

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Workflow Syntax Reference](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Next Steps**:
1. ✅ Workflows created
2. ⏭️ Set up GCP service account
3. ⏭️ Add secrets to GitHub
4. ⏭️ Create Cloud Storage bucket
5. ⏭️ Test first deployment
6. ⏭️ Configure branch protection
7. ⏭️ Set up monitoring alerts for workflow failures

**Setup Date**: 2025-12-09
**Project**: Tchaas Ledger 990
**CI/CD Platform**: GitHub Actions
**Cloud Provider**: Google Cloud Platform
