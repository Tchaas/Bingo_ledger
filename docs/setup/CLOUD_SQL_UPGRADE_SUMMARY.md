# Cloud SQL Upgrade Summary

**Date**: 2025-12-10
**Status**: Ready to deploy with PostgreSQL

## What's Changed

### From SQLite → PostgreSQL (Cloud SQL)

**Before:**
- SQLite database in container `/tmp` directory
- Data lost on every deployment
- Not suitable for production

**After:**
- PostgreSQL 15 on Cloud SQL
- Persistent, production-ready database
- Automatic backups (optional)
- Scalable storage

## Setup Steps

### 1. Run Cloud SQL Setup Script

**Open Cloud Shell**: https://console.cloud.google.com/?cloudshell=true

**Copy and run the quick setup script from**: [SETUP_CLOUD_SQL.md](SETUP_CLOUD_SQL.md)

The script will:
- ✅ Create Cloud SQL instance (db-f1-micro, ~$8-11/month)
- ✅ Create database `tchaas_ledger`
- ✅ Create user `tchaas_ledger_user`
- ✅ Store credentials in Secret Manager
- ✅ Grant service account permissions

### 2. Update GitHub Secrets

After running the script, add one more secret:

**Go to**: https://github.com/Tchaas/Tchaasledger/settings/secrets/actions

**Add or Update**:
- Name: `CLOUD_SQL_INSTANCE`
- Value: `tchaas-ledger:us-central1:tchaas-ledger-db`

### 3. Deploy!

```bash
git push
```

The deployment will:
1. Build Docker image
2. Push to Artifact Registry
3. Run database migrations automatically
4. Deploy to Cloud Run with PostgreSQL connection

## Deployment Workflow Changes

### New Features

1. **Database Migrations**: Automatic via Cloud Run Jobs
   ```bash
   flask db upgrade
   ```

2. **Secret Manager Integration**: Credentials stored securely
   - DATABASE_URL
   - SECRET_KEY

3. **Cloud SQL Connection**: Via Unix socket
   - No exposed IP addresses
   - Secure internal connection

### Workflow Steps

```
Build → Push → Migrate → Deploy → Test
  ↓       ↓       ↓        ↓       ↓
Docker  AR    Cloud Run  Cloud   Health
Image        Job        Run     Check
```

## Architecture

```
GitHub Actions
     ↓
Artifact Registry (Docker Images)
     ↓
Cloud Run (Backend API)
     ├── Unix Socket → Cloud SQL (PostgreSQL)
     └── API → Secret Manager (Credentials)

Cloud Storage (Frontend)
```

## Configuration

### Environment Variables (Cloud Run)

- `GCP_PROJECT_ID`: tchaas-ledger
- `ENABLE_GCP_MONITORING`: true (can be enabled)
- `FLASK_ENV`: production
- `FLASK_APP`: run.py

### Secrets (Secret Manager)

- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Flask secret key for sessions

### Cloud SQL Connection

- Instance: `tchaas-ledger-db`
- Database: `tchaas_ledger`
- User: `tchaas_ledger_user`
- Connection: Unix socket (`/cloudsql/tchaas-ledger:us-central1:tchaas-ledger-db`)

## Cost Breakdown

| Resource | Type | Monthly Cost |
|----------|------|--------------|
| Cloud Run | Auto-scaling (0-10) | ~$0-5 |
| Cloud SQL | db-f1-micro | ~$7-10 |
| Storage (DB) | 10GB HDD | ~$1 |
| Artifact Registry | Storage | ~$0-1 |
| Cloud Storage | Frontend | ~$0 |
| **Total** | | **~$8-17/month** |

## Verification

After deployment, verify:

```bash
# Check Cloud SQL instance
gcloud sql instances list --project=tchaas-ledger

# Check secrets
gcloud secrets list --project=tchaas-ledger

# Test backend endpoint
curl https://tchaas-ledger-api-4iozosj54q-uc.a.run.app/health

# View Cloud Run logs
gcloud run services logs read tchaas-ledger-api --region=us-central1
```

## Database Management

### Connect to Database

```bash
# Via Cloud SQL Proxy
gcloud sql connect tchaas-ledger-db \
  --user=tchaas_ledger_user \
  --database=tchaas_ledger
```

### Run Migrations Manually

```bash
# Create a Cloud Run Job
gcloud run jobs create manual-migration \
  --image us-central1-docker.pkg.dev/tchaas-ledger/docker-images/tchaas-ledger-api:latest \
  --region us-central1 \
  --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
  --set-env-vars FLASK_APP=run.py \
  --add-cloudsql-instances tchaas-ledger:us-central1:tchaas-ledger-db \
  --command flask \
  --args db,upgrade

# Execute it
gcloud run jobs execute manual-migration --region us-central1 --wait
```

### View Database Tables

Once connected:
```sql
\dt                    -- List tables
\d+ organizations     -- Describe organizations table
SELECT * FROM organizations;
```

## Rollback Plan

If you need to rollback to SQLite:

```bash
# Re-enable simplified workflow
mv .github/workflows/deploy-simplified.yml.disabled .github/workflows/deploy-simplified.yml
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# Commit and push
git add .github/workflows/
git commit -m "rollback: temporarily use SQLite"
git push
```

## Troubleshooting

### Migration Fails

```bash
# Check migration job logs
gcloud run jobs executions list --job=migration-<sha> --region=us-central1
gcloud run jobs logs read migration-<sha> --region=us-central1
```

### Can't Connect to Cloud SQL

- Verify CLOUD_SQL_INSTANCE secret is correct
- Check service account has `roles/cloudsql.client`
- Verify Cloud SQL instance is running

### Secret Manager Errors

- Verify secrets exist: `gcloud secrets list`
- Check service account has `roles/secretmanager.secretAccessor`
- Verify secret versions: `gcloud secrets versions list SECRET_NAME`

## Next Steps

1. ✅ Run Cloud SQL setup script
2. ✅ Add CLOUD_SQL_INSTANCE to GitHub Secrets
3. 🚀 Push code to trigger deployment
4. ✅ Verify deployment and database connection
5. 📊 Monitor logs and metrics
6. 🔧 (Optional) Enable GCP monitoring
7. 🔧 (Optional) Add automated backups

---

**Documentation**:
- [SETUP_CLOUD_SQL.md](SETUP_CLOUD_SQL.md) - Setup script
- [FINAL_DEPLOYMENT_STEPS.md](FINAL_DEPLOYMENT_STEPS.md) - General deployment
- [FIX_GCP_PERMISSIONS.md](FIX_GCP_PERMISSIONS.md) - IAM permissions

**Status**: Ready to deploy! Run the Cloud SQL setup script, then push.
