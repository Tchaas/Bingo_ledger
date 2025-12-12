# Fix GCP Permissions for GitHub Actions Deployment

## Problem

The GitHub Actions workflow is failing with this error:
```
denied: Permission "artifactregistry.repositories.uploadArtifacts" denied on resource "projects/tchaas-ledger/locations/us/repositories/gcr.io"
```

This means the service account `github-actions@tchaas-ledger.iam.gserviceaccount.com` doesn't have permission to push Docker images to Google Container Registry.

## Solution: Grant Required Permissions

### Option 1: Using Google Cloud Console (Recommended)

1. **Go to IAM & Admin**
   - Visit: https://console.cloud.google.com/iam-admin/iam?project=tchaas-ledger
   - Or navigate to: Cloud Console → IAM & Admin → IAM

2. **Find the Service Account**
   - Look for: `github-actions@tchaas-ledger.iam.gserviceaccount.com`
   - Click the pencil/edit icon next to it

3. **Add the Following Roles:**

   Click "+ ADD ANOTHER ROLE" for each and add:

   - ✅ **Storage Admin** (`roles/storage.admin`)
     - Allows pushing to Google Container Registry (GCR)

   - ✅ **Artifact Registry Writer** (`roles/artifactregistry.writer`)
     - Allows pushing to Artifact Registry

   - ✅ **Cloud Run Admin** (`roles/run.admin`)
     - Allows deploying Cloud Run services

   - ✅ **Service Account User** (`roles/iam.serviceAccountUser`)
     - Required for Cloud Run deployments

   - ✅ **Cloud SQL Client** (`roles/cloudsql.client`)
     - Allows connecting to Cloud SQL

   - ✅ **Secret Manager Secret Accessor** (`roles/secretmanager.secretAccessor`)
     - Allows reading secrets from Secret Manager

4. **Save**
   - Click "SAVE" at the bottom

### Option 2: Using gcloud CLI Commands

If you have gcloud CLI working, run these commands:

```bash
# Set variables
PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

# Grant Storage Admin (for GCR)
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

# Grant Artifact Registry Writer
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/artifactregistry.writer"

# Grant Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin"

# Grant Service Account User
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# Grant Cloud SQL Client
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client"

# Grant Secret Manager Secret Accessor
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor"
```

### Option 3: Using Cloud Shell

1. Go to: https://console.cloud.google.com/?cloudshell=true
2. This opens Cloud Shell with gcloud pre-configured
3. Copy and paste the commands from Option 2 above

## Verification

After granting permissions, verify by:

1. **Check IAM Page**
   - Go to: https://console.cloud.google.com/iam-admin/iam?project=tchaas-ledger
   - Find `github-actions@tchaas-ledger.iam.gserviceaccount.com`
   - Verify it has all 6 roles listed above

2. **Test the Deployment**
   - Make a small change and push to GitHub
   - Or manually trigger the workflow: https://github.com/Tchaas/Tchaasledger/actions
   - Check if the Docker push succeeds

## Required Roles Summary

| Role | Purpose |
|------|---------|
| Storage Admin | Push Docker images to GCR |
| Artifact Registry Writer | Push to Artifact Registry |
| Cloud Run Admin | Deploy Cloud Run services |
| Service Account User | Required for Cloud Run |
| Cloud SQL Client | Connect to database |
| Secret Manager Secret Accessor | Read secrets |

## Next Steps

After fixing permissions:

1. ✅ Grant all required IAM roles (see above)
2. 🔄 Re-run the failed GitHub Actions workflow
3. ✅ Verify deployment succeeds
4. 🎉 Your CI/CD pipeline should be working!

## Alternative: Use Secret Manager for Database Credentials

Instead of using GitHub Secrets for sensitive data, you should use GCP Secret Manager:

1. Create secrets in Secret Manager:
   ```bash
   echo -n "postgresql://..." | gcloud secrets create DATABASE_URL --data-file=-
   echo -n "your-secret-key" | gcloud secrets create SECRET_KEY --data-file=-
   ```

2. Update [.github/workflows/deploy.yml](.github/workflows/deploy.yml) to reference secrets from Secret Manager instead of GitHub Secrets

3. The service account already has `secretmanager.secretAccessor` role (granted above)

---

**Created**: 2025-12-10
**Project**: Tchaas Ledger
**GCP Project ID**: tchaas-ledger
**Service Account**: github-actions@tchaas-ledger.iam.gserviceaccount.com
