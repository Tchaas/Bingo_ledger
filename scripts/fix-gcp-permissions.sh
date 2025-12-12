#!/bin/bash

# Fix GCP Permissions for GitHub Actions
# This script grants the necessary permissions for the service account to push to GCR

set -e

PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

echo "Granting permissions to service account: $SA_EMAIL"
echo "Project: $PROJECT_ID"
echo ""

# Grant Storage Admin (for GCR - legacy Container Registry)
echo "✓ Granting Storage Admin role (for Container Registry)..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/storage.admin" \
    --condition=None

# Grant Artifact Registry Writer (for new Artifact Registry)
echo "✓ Granting Artifact Registry Writer role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/artifactregistry.writer" \
    --condition=None

# Grant Cloud Run Admin (for deploying services)
echo "✓ Granting Cloud Run Admin role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/run.admin" \
    --condition=None

# Grant Service Account User (required for Cloud Run deployments)
echo "✓ Granting Service Account User role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/iam.serviceAccountUser" \
    --condition=None

# Grant Cloud SQL Client (for database connections)
echo "✓ Granting Cloud SQL Client role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client" \
    --condition=None

# Grant Secret Manager Accessor (for accessing secrets)
echo "✓ Granting Secret Manager Secret Accessor role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --condition=None

echo ""
echo "✅ All permissions granted successfully!"
echo ""
echo "Service account $SA_EMAIL now has:"
echo "  - Storage Admin (push to GCR)"
echo "  - Artifact Registry Writer (push to Artifact Registry)"
echo "  - Cloud Run Admin (deploy services)"
echo "  - Service Account User (required for deployments)"
echo "  - Cloud SQL Client (database access)"
echo "  - Secret Manager Secret Accessor (access secrets)"
echo ""
echo "You can now push your code to trigger the GitHub Actions workflow."
