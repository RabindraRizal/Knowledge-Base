# Knowledge Base — Setup Guide

GCC 2026 AI · Command Centre Knowledge Base  
Hosted on GitHub Pages · Data fetched via GitHub Actions

---

## Architecture

```
GitHub Pages (free)          GitHub Actions
┌─────────────────┐          ┌────────────────────────────┐
│ React App       │◄─────────│ fetch-data.yml             │
│ (static)        │ commits  │                            │
│                 │ docs.json│ 1. Manual trigger          │
│ /data/          │          │ 2. Approval gate           │
│  documents.json │          │ 3. python extract.py       │
└─────────────────┘          │ 4. git commit + push       │
                             │ 5. Triggers Pages rebuild  │
                             └────────────────────────────┘
```

**Live site:** https://rabindrarizal.github.io/Knowledge-Base/

---

## One-time setup (~10 minutes)

### Step 1 — Register Azure AD App

1. Go to [Azure Portal → App registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Click **New registration**
3. Name: `KB-SharePoint-Reader`
4. Supported account types: **Single tenant**
5. No redirect URI needed → click **Register**
6. Note your **Application (client) ID** and **Directory (tenant) ID**

### Step 2 — Grant API permissions

1. In your app → **API permissions** → **Add a permission**
2. Choose **Microsoft Graph** → **Application permissions**
3. Search and add:
   - `Sites.Read.All`
   - `Files.Read.All`
4. Click **Grant admin consent for [your org]** ← requires Global Admin

### Step 3 — Create client secret

1. In your app → **Certificates & secrets** → **New client secret**
2. Set expiry: **24 months**
3. Click Add → **copy the Value immediately** (shown only once)

### Step 4 — Create GitHub Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Repository access: `RabindraRizal/Knowledge-Base`
3. Permissions: **Contents** (read/write), **Actions** (read/write), **Pages** (read/write)
4. Generate and copy the token

### Step 5 — Add GitHub Secrets

Go to https://github.com/RabindraRizal/Knowledge-Base/settings/secrets/actions

Add these **Secrets**:

| Secret | Value |
|--------|-------|
| `TENANT_ID` | Azure AD Directory (tenant) ID |
| `CLIENT_ID` | Azure AD Application (client) ID |
| `CLIENT_SECRET` | Client secret value from Step 3 |
| `GH_PAT` | GitHub PAT from Step 4 |

### Step 6 — Add GitHub Variables

Same page → **Variables** tab:

| Variable | Value |
|----------|-------|
| `VITE_BASE_URL` | `/Knowledge-Base/` |
| `SHAREPOINT_HOST` | `anheuserbuschinbev.sharepoint.com` |
| `SITE_PATH` | `/sites/Sustinability` |
| `DRIVE_NAME` | `Shared Documents` |

### Step 7 — Create approval environment

1. https://github.com/RabindraRizal/Knowledge-Base/settings/environments
2. **New environment** → name: `data-refresh`
3. Under **Protection rules** → check **Required reviewers**
4. Add yourself (and any approvers)

### Step 8 — Enable GitHub Pages

1. https://github.com/RabindraRizal/Knowledge-Base/settings/pages
2. Source: **GitHub Actions**
3. Push to `main` → the deploy workflow auto-publishes the site

---

## Triggering a data refresh

1. Go to https://github.com/RabindraRizal/Knowledge-Base/actions/workflows/fetch-data.yml
2. Click **Run workflow** → type `YES` in the confirm box → **Run workflow**
3. An approver gets notified → they approve in GitHub
4. Agent runs (~3–8 min) → commits fresh `documents.json` → site rebuilds (~2 min)
5. Live site shows updated data automatically

Or click **Auto-Fetch** tab inside the app's Data Sources panel.

---

## Local development

```bash
# Run app
cd knowledge-base-app
npm install
npm run dev

# Run extractor locally (first time — needs browser sign-in)
cd extractor
pip install -r requirements.txt
python extract.py
```
