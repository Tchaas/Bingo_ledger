# Enable GCR Permissions - Final Fix

The issue is that GCR (Google Container Registry) stores images in Google Cloud Storage, and we need to ensure:
1. The Container Registry API is enabled
2. The service account has access to the GCR storage bucket

## 🔧 Run This in Cloud Shell

**Open**: https://console.cloud.google.com/?cloudshell=true

**Copy and paste ALL of this**:

```bash
PROJECT_ID="tchaas-ledger"
SA_EMAIL="github-actions@tchaas-ledger.iam.gserviceaccount.com"

echo "Step 1: Enable Container Registry API..."
gcloud services enable containerregistry.googleapis.com --project=$PROJECT_ID

echo ""
echo "Step 2: Enable Artifact Registry API..."
gcloud services enable artifactregistry.googleapis.com --project=$PROJECT_ID

echo ""
echo "Step 3: Grant Storage Admin at PROJECT level..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_EMAIL" \
  --role="roles/storage.admin"

echo ""
echo "Step 4: Grant permissions on GCR bucket directly..."
# GCR uses a special bucket named artifacts.{PROJECT_ID}.appspot.com
GCR_BUCKET="gs://artifacts.${PROJECT_ID}.appspot.com"
GCR_BUCKET_EU="gs://eu.artifacts.${PROJECT_ID}.appspot.com"
GCR_BUCKET_US="gs://us.artifacts.${PROJECT_ID}.appspot.com"
GCR_BUCKET_ASIA="gs://asia.artifacts.${PROJECT_ID}.appspot.com"

# Grant access to all possible GCR buckets
for bucket in "$GCR_BUCKET" "$GCR_BUCKET_US" "$GCR_BUCKET_EU" "$GCR_BUCKET_ASIA"; do
  echo "Granting access to $bucket..."
  gsutil iam ch serviceAccount:$SA_EMAIL:objectAdmin $bucket 2>/dev/null || echo "  (bucket doesn't exist yet, will be created on first push)"
done

echo ""
echo "Step 5: Verify current permissions..."
gcloud projects get-iam-policy $PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:$SA_EMAIL" \
  --format="table(bindings.role)"

echo ""
echo "✅ Done! Permissions configured."
echo ""
echo "Now retry the deployment:"
echo "  git commit --allow-empty -m 'retry after GCR permissions fix' && git push"
```

## Alternative: Use Artifact Registry Instead

If GCR continues to have issues, we can switch to Artifact Registry (newer, recommended):

```bash
PROJECT_ID="tchaas-ledger"
REGION="us-central1"
REPO_NAME="tchaas-ledger"

# Create Artifact Registry repository
gcloud artifacts repositories create $REPO_NAME \
  --repository-format=docker \
  --location=$REGION \
  --project=$PROJECT_ID

echo "Artifact Registry repository created!"
echo "Now update the workflow to use:"
echo "  ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_NAME}/tchaas-ledger-api"
```

Then I'll update the workflow to use Artifact Registry instead of GCR.

---

## Which approach do you want?

1. **Try the GCR fix above** (run the bash script in Cloud Shell)
2. **Switch to Artifact Registry** (I'll update the workflow)

Let me know which one you prefer!
