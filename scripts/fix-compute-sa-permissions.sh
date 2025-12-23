#!/bin/bash

# Fix: Grant compute service account access to Secret Manager
# The Cloud Run Job uses the default compute service account
set -e

PROJECT_ID="tchaas-ledger"
PROJECT_NUMBER="1057248865206"
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "Granting Secret Manager access to compute service account..."
echo "Service Account: $COMPUTE_SA"
echo ""

# Grant access to DATABASE_URL secret
gcloud secrets add-iam-policy-binding DATABASE_URL \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

echo "✅ DATABASE_URL access granted"

# Grant access to SECRET_KEY secret
gcloud secrets add-iam-policy-binding SECRET_KEY \
  --member="serviceAccount:$COMPUTE_SA" \
  --role="roles/secretmanager.secretAccessor" \
  --project=$PROJECT_ID

echo "✅ SECRET_KEY access granted"

echo ""
echo "Verification:"
gcloud secrets get-iam-policy DATABASE_URL --project=$PROJECT_ID

echo ""
echo "✅ Compute service account now has Secret Manager access!"
echo "Re-run the deployment."
