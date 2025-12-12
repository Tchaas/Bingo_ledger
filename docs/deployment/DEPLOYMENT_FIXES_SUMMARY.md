# Deployment Fixes Summary

**Date**: 2025-12-10
**Status**: ✅ Code fixes complete, 🔧 GCP permissions needed

## ✅ Fixed Issues

### 1. Docker Build Failure (FIXED ✅)
**Problem**: `pip install` failed with exit code 1 due to Python 3.13 incompatibility

**Solution Applied**:
- Changed Dockerfile from Python 3.13 → Python 3.11
- Added `curl` for healthcheck
- Fixed healthcheck to use `curl` instead of missing `requests` library
- Preserved build dependencies (g++, make, python3-dev)

**Files Changed**:
- [backend/Dockerfile](backend/Dockerfile)

**Commit**: `210186b` - "fix: update Dockerfile to Python 3.11 and fix healthcheck"

---

### 2. Backend CI Build Failure (FIXED ✅)
**Problem**: CI workflow using Python 3.13 couldn't build `grpcio` from source

**Solution Applied**:
- Changed backend-ci.yml from Python 3.13 → Python 3.11
- Now matches Dockerfile Python version
- Uses prebuilt wheels for grpcio and other packages

**Files Changed**:
- [.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml)

**Commit**: `3bdc5f2` - "fix: update backend CI to use Python 3.11 and add GCP permissions guide"

---

## 🔧 Action Required: GCP Permissions

### Problem
GitHub Actions deployment fails with:
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied
```

The service account `github-actions@tchaas-ledger.iam.gserviceaccount.com` needs additional IAM roles to:
- Push Docker images to Google Container Registry (GCR)
- Deploy to Cloud Run
- Access Cloud SQL and Secret Manager

### Solution Steps

**📖 Full Guide**: See [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md)

**Quick Steps**:

1. **Go to GCP IAM Console**:
   https://console.cloud.google.com/iam-admin/iam?project=tchaas-ledger

2. **Find Service Account**:
   `github-actions@tchaas-ledger.iam.gserviceaccount.com`

3. **Click Edit (pencil icon) and add these 6 roles**:
   - ✅ Storage Admin
   - ✅ Artifact Registry Writer
   - ✅ Cloud Run Admin
   - ✅ Service Account User
   - ✅ Cloud SQL Client
   - ✅ Secret Manager Secret Accessor

4. **Save** and re-run the GitHub Actions workflow

### Verification
After granting permissions, the deployment workflow should succeed:
- https://github.com/Tchaas/Tchaasledger/actions

---

## 📊 What's Fixed vs What's Pending

| Issue | Status | Action Required |
|-------|--------|----------------|
| Dockerfile Python version | ✅ Fixed | None - committed |
| Dockerfile healthcheck | ✅ Fixed | None - committed |
| Backend CI Python version | ✅ Fixed | None - committed |
| GCP Service Account Permissions | 🔧 Pending | **You must grant IAM roles** |
| Backend CI tests | ⏸️ Blocked | Will work after permissions fixed |
| Cloud Run deployment | ⏸️ Blocked | Will work after permissions fixed |

---

## 🚀 Next Steps

### Immediate (Required)
1. **Grant GCP IAM roles** following [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md)
2. **Re-run GitHub Actions workflow** at https://github.com/Tchaas/Tchaasledger/actions
3. **Verify deployment succeeds**

### After Deployment Works
1. Set up Cloud SQL instance (currently using placeholder)
2. Update `DATABASE_URL` GitHub secret with real Cloud SQL connection
3. Update `BACKEND_API_URL` GitHub secret with deployed Cloud Run URL
4. Configure custom domain (optional)
5. Set up monitoring alerts in GCP

---

## 📁 Reference Files

- [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md) - Detailed IAM permissions guide
- [fix-gcp-permissions.sh](fix-gcp-permissions.sh) - Script to grant permissions (requires working gcloud CLI)
- [backend/Dockerfile](backend/Dockerfile) - Fixed Docker configuration
- [.github/workflows/backend-ci.yml](.github/workflows/backend-ci.yml) - Fixed CI workflow
- [.github/workflows/deploy.yml](.github/workflows/deploy.yml) - Deployment workflow
- [docs/deployment/GCP_SETUP.md](docs/deployment/GCP_SETUP.md) - GCP setup guide
- [GITHUB_SECRETS_SETUP.md](GITHUB_SECRETS_SETUP.md) - GitHub secrets configuration

---

## 🔍 Technical Details

### Why Python 3.11?
- Python 3.13 was released recently (Oct 2024)
- Many packages don't have prebuilt wheels yet
- Building from source requires additional system dependencies and is slower
- Python 3.11 is stable, well-supported, and has wheels for all packages

### Why These Specific IAM Roles?
- **Storage Admin**: GCR stores images in Google Cloud Storage
- **Artifact Registry Writer**: New registry system requires this
- **Cloud Run Admin**: Deploy and manage Cloud Run services
- **Service Account User**: Required when Cloud Run uses a service account
- **Cloud SQL Client**: Connect backend to PostgreSQL database
- **Secret Manager Secret Accessor**: Read secrets like DATABASE_URL, SECRET_KEY

---

**Last Updated**: 2025-12-10
**Project**: Tchaas Ledger 990
**GCP Project ID**: tchaas-ledger
**Repository**: https://github.com/Tchaas/Tchaasledger
