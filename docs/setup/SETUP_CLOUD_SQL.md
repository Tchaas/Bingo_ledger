# Setup Cloud SQL PostgreSQL

**Date**: 2025-12-10
**Goal**: Replace SQLite with Cloud SQL PostgreSQL for persistent, production-ready database

## Step 1: Create Cloud SQL Instance

**Open Cloud Shell**: https://console.cloud.google.com/?cloudshell=true

**Run these commands**:

```bash
PROJECT_ID="tchaas-ledger"
REGION="us-central1"
INSTANCE_NAME="tchaas-ledger-db"
DB_NAME="tchaas_ledger"
DB_USER="tchaas_ledger_user"

echo "Creating Cloud SQL PostgreSQL instance..."
echo "This will take 5-10 minutes..."

# Create PostgreSQL 15 instance (db-f1-micro for free tier)
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --project=$PROJECT_ID \
    --root-password=$(openssl rand -base64 32) \
    --storage-type=HDD \
    --storage-size=10GB \
    --network=default \
    --no-backup

echo "✅ Cloud SQL instance created!"
```

## Step 2: Create Database and User

```bash
# Create database
echo "Creating database..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME \
    --project=$PROJECT_ID

# Create user with strong password
DB_PASSWORD=$(openssl rand -base64 32)
echo "Creating database user..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password="$DB_PASSWORD" \
    --project=$PROJECT_ID

# Save password (you'll need this!)
echo ""
echo "🔐 IMPORTANT - Save these credentials:"
echo "Database User: $DB_USER"
echo "Database Password: $DB_PASSWORD"
echo ""
echo "Save the password now - you won't be able to retrieve it later!"
echo ""
```

## Step 3: Get Connection Details

```bash
# Get the connection name
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
    --project=$PROJECT_ID \
    --format='value(connectionName)')

echo "Connection Name: $CONNECTION_NAME"

# Construct the DATABASE_URL for Cloud Run (Unix socket connection)
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"

echo ""
echo "📋 DATABASE_URL for Cloud Run:"
echo "$DATABASE_URL"
echo ""
echo "Copy this URL - you'll add it to Secret Manager next"
echo ""
```

## Step 4: Create Secrets in Secret Manager

```bash
# Enable Secret Manager API
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

# Create DATABASE_URL secret
echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic"

# Create SECRET_KEY secret (if not already exists)
SECRET_KEY=$(openssl rand -hex 32)
echo -n "$SECRET_KEY" | gcloud secrets create SECRET_KEY \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic" 2>/dev/null || echo "SECRET_KEY already exists"

echo "✅ Secrets created in Secret Manager!"
```

## Step 5: Grant Permissions to Service Account

```bash
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

# Grant Secret Manager access
echo "Granting Secret Manager access..."
gcloud secrets add-iam-policy-binding DATABASE_URL \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID

gcloud secrets add-iam-policy-binding SECRET_KEY \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID 2>/dev/null || true

# Grant Cloud SQL Client role
echo "Granting Cloud SQL Client role..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client"

echo "✅ Permissions granted!"
```

## Step 6: Update GitHub Secrets

Add the Cloud SQL connection name to GitHub Secrets:

1. Go to: https://github.com/Tchaas/Tchaasledger/settings/secrets/actions

2. Update or create `CLOUD_SQL_INSTANCE`:
   ```
   tchaas-ledger:us-central1:tchaas-ledger-db
   ```

## Step 7: Enable the Full Deployment Workflow

Now we'll re-enable the full deployment workflow with Cloud SQL support:

```bash
# This will be done via code changes in the next step
```

---

## Quick Copy-Paste Script

Run this entire script in Cloud Shell:

```bash
#!/bin/bash
set -e

PROJECT_ID="tchaas-ledger"
REGION="us-central1"
INSTANCE_NAME="tchaas-ledger-db"
DB_NAME="tchaas_ledger"
DB_USER="tchaas_ledger_user"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

echo "========================================="
echo "Setting up Cloud SQL for Tchaas Ledger"
echo "========================================="
echo ""

# Step 1: Create Cloud SQL instance
echo "Step 1/6: Creating Cloud SQL instance (this takes 5-10 minutes)..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --project=$PROJECT_ID \
    --root-password=$(openssl rand -base64 32) \
    --storage-type=HDD \
    --storage-size=10GB \
    --network=default \
    --no-backup 2>/dev/null || echo "Instance may already exist"

echo "✅ Instance ready"
echo ""

# Step 2: Create database
echo "Step 2/6: Creating database..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME \
    --project=$PROJECT_ID 2>/dev/null || echo "Database may already exist"

# Step 3: Create user
echo "Step 3/6: Creating database user..."
DB_PASSWORD=$(openssl rand -base64 32)
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password="$DB_PASSWORD" \
    --project=$PROJECT_ID 2>/dev/null || echo "User may already exist"

# Step 4: Get connection details
echo "Step 4/6: Getting connection details..."
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME \
    --project=$PROJECT_ID \
    --format='value(connectionName)')

DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"

# Step 5: Create secrets
echo "Step 5/6: Creating Secret Manager secrets..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID

echo -n "$DATABASE_URL" | gcloud secrets create DATABASE_URL \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic" 2>/dev/null || \
    echo -n "$DATABASE_URL" | gcloud secrets versions add DATABASE_URL --data-file=-

SECRET_KEY=$(openssl rand -hex 32)
echo -n "$SECRET_KEY" | gcloud secrets create SECRET_KEY \
    --data-file=- \
    --project=$PROJECT_ID \
    --replication-policy="automatic" 2>/dev/null || echo "SECRET_KEY already exists"

# Step 6: Grant permissions
echo "Step 6/6: Granting permissions..."
gcloud secrets add-iam-policy-binding DATABASE_URL \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID 2>/dev/null || true

gcloud secrets add-iam-policy-binding SECRET_KEY \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --project=$PROJECT_ID 2>/dev/null || true

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/cloudsql.client"

echo ""
echo "========================================="
echo "✅ Cloud SQL Setup Complete!"
echo "========================================="
echo ""
echo "📋 Important Information:"
echo ""
echo "Connection Name: $CONNECTION_NAME"
echo ""
echo "🔐 Add this to GitHub Secrets as CLOUD_SQL_INSTANCE:"
echo "$CONNECTION_NAME"
echo ""
echo "Database URL is stored in Secret Manager"
echo "Service account has been granted access"
echo ""
echo "Next: Update your deployment workflow to use Cloud SQL"
echo ""
```

---

## Verification

After setup, verify everything works:

```bash
# List secrets
gcloud secrets list --project=tchaas-ledger

# Verify instance is running
gcloud sql instances list --project=tchaas-ledger

# Test connection (optional)
gcloud sql connect tchaas-ledger-db --user=tchaas_ledger_user --database=tchaas_ledger
```

---

## Cost Estimate

- **db-f1-micro**: ~$7-10/month
- **10GB storage**: ~$1/month
- **Total**: ~$8-11/month

This is the smallest instance, perfect for development and small production workloads.

---

## Next Steps

After running the setup:

1. ✅ Run the Cloud Shell script above
2. ✅ Copy the CLOUD_SQL_INSTANCE value to GitHub Secrets
3. 🔄 I'll update the deployment workflow to use Cloud SQL
4. 🚀 Deploy and test with PostgreSQL

---

**Ready to proceed? Let me know once you've run the Cloud Shell script!**
