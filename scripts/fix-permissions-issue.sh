#!/bin/bash

# Troubleshoot and fix GCP permissions issue
# Run this in Cloud Shell: https://console.cloud.google.com/?cloudshell=true

set -e

PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

echo "========================================="
echo "GCP Permissions Troubleshooting"
echo "========================================="
echo ""

echo "1. Verifying service account exists..."
gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID

echo ""
echo "2. Current permissions for $SA_EMAIL:"
echo "========================================="
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"

echo ""
echo "3. Removing any existing permissions to start fresh..."
for role in \
  "roles/storage.admin" \
  "roles/artifactregistry.writer" \
  "roles/run.admin" \
  "roles/iam.serviceAccountUser" \
  "roles/cloudsql.client" \
  "roles/secretmanager.secretAccessor"
do
  echo "Removing $role (if exists)..."
  gcloud projects remove-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="$role" 2>/dev/null || echo "  (not present, skipping)"
done

echo ""
echo "4. Granting fresh permissions..."
echo "========================================="

# Storage Admin - CRITICAL for GCR
echo "✓ Granting Storage Admin..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin"

# Artifact Registry Writer
echo "✓ Granting Artifact Registry Writer..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/artifactregistry.writer"

# Cloud Run Admin
echo "✓ Granting Cloud Run Admin..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin"

# Service Account User
echo "✓ Granting Service Account User..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser"

# Cloud SQL Client (optional but included)
echo "✓ Granting Cloud SQL Client..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client"

# Secret Manager Secret Accessor (optional but included)
echo "✓ Granting Secret Manager Secret Accessor..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor"

echo ""
echo "5. Verifying new permissions..."
echo "========================================="
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"

echo ""
echo "6. Enabling required APIs..."
echo "========================================="
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID
gcloud services enable run.googleapis.com --project=$PROJECT_ID
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID

echo ""
echo "7. Creating new service account key..."
echo "========================================="

# List existing keys
echo "Existing keys for $SA_EMAIL:"
gcloud iam service-accounts keys list \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo ""
echo "Creating new key (save this to GitHub Secrets as GCP_SA_KEY)..."
KEY_FILE="github-actions-key-new-$(date +%s).json"
gcloud iam service-accounts keys create $KEY_FILE \
  --iam-account=$SA_EMAIL \
  --project=$PROJECT_ID

echo ""
echo "========================================="
echo "✅ All permissions granted and key created!"
echo "========================================="
echo ""
echo "📋 Next steps:"
echo "1. Copy the contents of $KEY_FILE"
echo "   cat $KEY_FILE"
echo ""
echo "2. Update GitHub Secret GCP_SA_KEY with the new key:"
echo "   https://github.com/Tchaas/Tchaasledger/settings/secrets/actions/GCP_SA_KEY"
echo ""
echo "3. Delete old keys (optional but recommended):"
echo "   gcloud iam service-accounts keys delete KEY_ID --iam-account=$SA_EMAIL"
echo ""
echo "4. Wait 1-2 minutes for permissions to propagate"
echo ""
echo "5. Trigger deployment again"
echo ""
echo "⚠️  IMPORTANT: Delete $KEY_FILE after copying to GitHub!"
echo "   rm $KEY_FILE"
echo ""
