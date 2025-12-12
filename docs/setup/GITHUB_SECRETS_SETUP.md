# GitHub Secrets Setup Instructions

**Created**: 2025-12-10
**Status**: Ready to configure

## 📋 Overview

You need to add the following secrets to your GitHub repository to enable CI/CD workflows.

## 🔐 Secrets to Add

Go to your GitHub repository: https://github.com/tchaas/tchaasledger

Then navigate to: **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### 1. GCP_SA_KEY

**Description**: Service account JSON key for GitHub Actions to authenticate with GCP

**Value**: Copy the entire contents of the file below:

```
/Users/tchaasalexander-wright/tchaas-ledger-990/github-actions-key.json
```

To copy the file contents:
```bash
cat /Users/tchaasalexander-wright/tchaas-ledger-990/github-actions-key.json | pbcopy
```

Then paste into GitHub secret value field.

---

### 2. DATABASE_URL

**Description**: PostgreSQL connection string for production database

**Current Value** (placeholder - needs Cloud SQL instance):
```
postgresql://localhost/tchaas_ledger
```

**Future Value** (once Cloud SQL is set up):
```
postgresql://tchaas_ledger_user:PASSWORD@/tchaas_ledger?host=/cloudsql/tchaas-ledger:us-central1:tchaas-ledger-db
```

For now, add the placeholder value. We'll update it when Cloud SQL is configured.

---

### 3. SECRET_KEY

**Description**: Flask secret key for session management and security

**Value**:
```
72565073b0bc0250bd8b0374ce8ab7f466891fc509ff6c2cbc728c5264f9315b
```

---

### 4. CLOUD_SQL_INSTANCE

**Description**: Cloud SQL instance connection name (for Cloud Run to connect via Unix socket)

**Value** (placeholder - needs Cloud SQL instance):
```
tchaas-ledger:us-central1:tchaas-ledger-db
```

This will be updated once we create the Cloud SQL instance.

---

### 5. BACKEND_API_URL

**Description**: Backend API URL for frontend to make API calls

**Value** (will be available after first deployment):
```
https://tchaas-ledger-api-[random-id].run.app
```

For now, you can skip this or add a placeholder:
```
https://api.tchaas-ledger.com
```

We'll update it after the first backend deployment.

---

## ✅ Quick Copy Commands

Run these commands to copy each secret value:

```bash
# 1. Copy GCP_SA_KEY (JSON file)
cat /Users/tchaasalexander-wright/tchaas-ledger-990/github-actions-key.json | pbcopy
echo "GCP_SA_KEY copied to clipboard - paste into GitHub"

# 2. Copy DATABASE_URL
echo -n "postgresql://localhost/tchaas_ledger" | pbcopy
echo "DATABASE_URL copied to clipboard - paste into GitHub"

# 3. Copy SECRET_KEY
echo -n "72565073b0bc0250bd8b0374ce8ab7f466891fc509ff6c2cbc728c5264f9315b" | pbcopy
echo "SECRET_KEY copied to clipboard - paste into GitHub"

# 4. Copy CLOUD_SQL_INSTANCE
echo -n "tchaas-ledger:us-central1:tchaas-ledger-db" | pbcopy
echo "CLOUD_SQL_INSTANCE copied to clipboard - paste into GitHub"

# 5. Copy BACKEND_API_URL (placeholder)
echo -n "https://api.tchaas-ledger.com" | pbcopy
echo "BACKEND_API_URL copied to clipboard - paste into GitHub"
```

## 🔄 Step-by-Step Process

1. **Open GitHub Repository Settings**
   - Go to https://github.com/tchaas/tchaasledger
   - Click "Settings" tab
   - Click "Secrets and variables" in left sidebar
   - Click "Actions"

2. **Add Each Secret**
   - Click "New repository secret"
   - Enter secret name (exactly as shown above, case-sensitive)
   - Run the copy command for that secret
   - Paste the value
   - Click "Add secret"
   - Repeat for each secret

3. **Verify Secrets Added**
   After adding all secrets, you should see:
   - `GCP_SA_KEY`
   - `DATABASE_URL`
   - `SECRET_KEY`
   - `CLOUD_SQL_INSTANCE`
   - `BACKEND_API_URL`

## 🔒 Security Notes

- **NEVER commit** `github-actions-key.json` to Git
- The key file is already in `.gitignore`
- Keep the `SECRET_KEY` value secure
- Rotate service account keys every 90 days
- Consider using Workload Identity Federation instead of service account keys for enhanced security

## 🧹 Cleanup

After adding secrets to GitHub, delete the local key file:

```bash
rm /Users/tchaasalexander-wright/tchaas-ledger-990/github-actions-key.json
```

⚠️ **Important**: Only delete after confirming the secret is properly added to GitHub!

## 📊 Verification

After adding secrets, you can verify by:

1. Going to Settings → Secrets and variables → Actions
2. You should see all 5 secrets listed
3. Values are hidden for security (you'll see "Updated X days ago")

## 🚀 Next Steps

After adding GitHub secrets:
1. ✅ Create Cloud Storage bucket for frontend
2. ✅ Test CI/CD by pushing a commit
3. ⏭️ Set up Cloud SQL instance (optional for initial testing)
4. ⏭️ Update DATABASE_URL and CLOUD_SQL_INSTANCE secrets with real values
5. ⏭️ Update BACKEND_API_URL after first successful deployment

---

**File Location**: `/Users/tchaasalexander-wright/tchaas-ledger-990/GITHUB_SECRETS_SETUP.md`
**Service Account Email**: `github-actions@tchaas-ledger.iam.gserviceaccount.com`
**GCP Project**: `tchaas-ledger`
