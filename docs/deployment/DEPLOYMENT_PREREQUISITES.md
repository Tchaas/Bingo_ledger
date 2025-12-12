# Deployment Prerequisites Checklist

**Date**: 2025-12-10
**Status**: 🔧 In Progress

## Current Deployment Failure

The deployment is failing with:
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied
```

However, even after fixing permissions, there are additional prerequisites needed for successful deployment.

## ✅ Completed

1. ✅ **Python Version Fixed** - Dockerfile and CI using Python 3.11
2. ✅ **Docker Build Fixed** - All dependencies install successfully
3. ✅ **Tests Added** - Basic test suite prevents "no tests" error
4. ✅ **GitHub Repository** - Code pushed to https://github.com/Tchaas/Tchaasledger
5. ✅ **GCP Project Created** - Project ID: `tchaas-ledger`
6. ✅ **Service Account Created** - `github-actions@tchaas-ledger.iam.gserviceaccount.com`
7. ✅ **Service Account Key** - Added to GitHub Secrets as `GCP_SA_KEY`

## 🔧 Required (Blocking Deployment)

### 1. Grant IAM Permissions to Service Account ⚠️ CRITICAL

The service account needs these roles:

| Role | Purpose | Required For |
|------|---------|--------------|
| Storage Admin | Push to GCR | Docker push ⚠️ Currently failing here |
| Artifact Registry Writer | Push to Artifact Registry | Docker push |
| Cloud Run Admin | Deploy services | Cloud Run deployment |
| Service Account User | Run as service account | Cloud Run deployment |
| Cloud SQL Client | Connect to database | Database access |
| Secret Manager Secret Accessor | Read secrets | Runtime configuration |

**Action**: Follow [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md)

**Console**: https://console.cloud.google.com/iam-admin/iam?project=tchaas-ledger

### 2. Create Secrets in Google Secret Manager

The workflow expects these secrets in Secret Manager (not just GitHub):

```bash
# Option 1: Create with placeholder values for now
gcloud secrets create DATABASE_URL \
  --data-file=- <<< "postgresql://postgres:password@localhost/tchaas_ledger" \
  --project=tchaas-ledger

gcloud secrets create SECRET_KEY \
  --data-file=- <<< "$(openssl rand -hex 32)" \
  --project=tchaas-ledger

# Option 2: Skip Secret Manager and use env vars instead
# (requires workflow modification - see option below)
```

### 3. Set Up Cloud SQL Instance (Optional for First Deployment)

The workflow references `${{ secrets.CLOUD_SQL_INSTANCE }}` which expects a Cloud SQL instance.

**For initial testing**, we can modify the workflow to skip Cloud SQL and use SQLite or skip database altogether.

**For production**, create Cloud SQL:

```bash
# Create PostgreSQL instance
gcloud sql instances create tchaas-ledger-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --project=tchaas-ledger

# Create database
gcloud sql databases create tchaas_ledger \
    --instance=tchaas-ledger-db

# Get connection name
gcloud sql instances describe tchaas-ledger-db \
    --format='value(connectionName)'
# Output: tchaas-ledger:us-central1:tchaas-ledger-db
```

Then update GitHub Secret:
```
CLOUD_SQL_INSTANCE=tchaas-ledger:us-central1:tchaas-ledger-db
```

## 🎯 Recommended Path Forward

### Option A: Quick Fix - Minimal Deployment (Recommended for Testing)

Modify the deployment workflow to:
1. Skip database migrations initially
2. Use environment variables instead of Secret Manager
3. Deploy without Cloud SQL connection

I can create this modified workflow for you.

### Option B: Full Production Setup

1. Grant all IAM permissions
2. Create Cloud SQL instance
3. Create Secret Manager secrets
4. Run full deployment

This is better for production but takes more time to set up.

## 🔄 Step-by-Step Fix (Option A - Quick Path)

### Step 1: Grant IAM Permissions (5 minutes)
```bash
# Use Cloud Shell: https://console.cloud.google.com/?cloudshell=true

PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"
```

### Step 2: Simplify Deployment Workflow

I can modify `.github/workflows/deploy.yml` to:
- Remove Secret Manager dependencies
- Remove Cloud SQL requirements
- Use environment variables from GitHub Secrets
- Skip database migrations for now
- Deploy a working backend that responds to health checks

**Would you like me to create this simplified workflow?**

## 📊 Current State

| Component | Status | Blocker |
|-----------|--------|---------|
| Code | ✅ Ready | None |
| Docker Build | ✅ Works | None |
| Tests | ✅ Pass | None |
| GCP Project | ✅ Exists | None |
| Service Account | ✅ Created | None |
| **IAM Permissions** | ❌ Missing | **YOU MUST GRANT** |
| Secret Manager | ❌ Not Setup | Optional - can use env vars |
| Cloud SQL | ❌ Not Created | Optional - can deploy without DB |
| Cloud Run | ⏸️ Not Deployed | Waiting for permissions |

## 🎯 What You Should Do Now

### Immediate (Required)
1. **Grant IAM permissions** - Use Cloud Shell commands above OR use Console
2. **Choose deployment path**:
   - **Path A (Recommended)**: Let me create a simplified workflow
   - **Path B (Full setup)**: Set up Secret Manager + Cloud SQL

### After Permissions Granted
- If you chose **Path A**: I'll update the workflow, you push, deployment works
- If you chose **Path B**: Follow Cloud SQL setup, create secrets, then re-run workflow

## ⚡ Quick Commands (Cloud Shell)

Open: https://console.cloud.google.com/?cloudshell=true

```bash
# 1. Grant minimum permissions for deployment
PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

for role in storage.admin artifactregistry.writer run.admin iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/$role"
done

echo "✅ Permissions granted! Ready to deploy."

# 2. Verify permissions
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:$SA_EMAIL" \
  --format="table(bindings.role)"
```

---

**Next Step**: Tell me which path you prefer (A or B), and whether you want me to grant the permissions via script or you'll do it manually in Console.

**Links**:
- [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md) - Detailed permission guide
- [GCP IAM Console](https://console.cloud.google.com/iam-admin/iam?project=tchaas-ledger)
- [Cloud Shell](https://console.cloud.google.com/?cloudshell=true)
- [GitHub Actions](https://github.com/Tchaas/Tchaasledger/actions)
