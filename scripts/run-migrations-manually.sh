#!/bin/bash

# Run Database Migrations Manually
# Use this after the backend has been deployed successfully

set -e

PROJECT_ID="tchaas-ledger"
REGION="us-central1"
SERVICE_NAME="tchaas-ledger-api"
CLOUD_SQL_INSTANCE="tchaas-ledger:us-central1:tchaas-ledger-db"

echo "========================================="
echo "Running Database Migrations"
echo "========================================="
echo ""

# Get the latest deployed image
IMAGE=$(gcloud run services describe $SERVICE_NAME \
  --region=$REGION \
  --project=$PROJECT_ID \
  --format='value(spec.template.spec.containers[0].image)')

echo "Using image: $IMAGE"
echo ""

# Create a one-time migration job
JOB_NAME="manual-migration-$(date +%s)"

echo "Creating migration job: $JOB_NAME"
gcloud run jobs create $JOB_NAME \
  --image $IMAGE \
  --region $REGION \
  --project $PROJECT_ID \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --set-env-vars FLASK_APP=run.py \
  --set-cloudsql-instances $CLOUD_SQL_INSTANCE \
  --command flask \
  --args db,upgrade

echo ""
echo "Executing migration..."
gcloud run jobs execute $JOB_NAME \
  --region $REGION \
  --project $PROJECT_ID \
  --wait

echo ""
echo "========================================="
echo "✅ Migrations Complete!"
echo "========================================="
echo ""
echo "View logs:"
echo "gcloud run jobs executions list --job=$JOB_NAME --region=$REGION"
echo ""
echo "Cleanup (optional):"
echo "gcloud run jobs delete $JOB_NAME --region=$REGION --quiet"
echo ""
