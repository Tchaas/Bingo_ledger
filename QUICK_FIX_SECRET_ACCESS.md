# Quick Fix: Grant Compute Service Account Secret Access

## Problem

Cloud Run Jobs are trying to use the compute service account but it doesn't have access to Secret Manager.

Error:
```
Permission denied on secret: ... for Revision service account 1057248865206-compute@developer.gserviceaccount.com
```

## Solution

**Open Cloud Shell**: https://console.cloud.google.com/?cloudshell=true

**Run this**:

```bash
PROJECT_ID="tchaas-ledger"
PROJECT_NUMBER="1057248865206"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# Grant Secret Manager access to compute service account
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding SECRET_KEY \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

echo "✅ Permissions granted!"
```

## Then

Re-trigger the deployment:

```bash
git commit --allow-empty -m "retry deployment after compute SA permissions" && git push
```

---

## What This Does

Grants the default Cloud Run compute service account access to read secrets from Secret Manager, which is needed for:
- Migration jobs to access DATABASE_URL
- Backend service to access DATABASE_URL and SECRET_KEY
