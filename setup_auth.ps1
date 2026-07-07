#Requires -Version 5.1
<#
.SYNOPSIS
    One-time Azure AD app registration for the AB InBev Knowledge Base extractor.
    Run this ONCE — after that, run_local.bat handles everything automatically.

.DESCRIPTION
    Uses Azure CLI to:
    1. Sign you in to Azure (opens browser)
    2. Register a dedicated "ABI-KB-Reader" app in YOUR tenant
    3. Add Sites.Read.All + Files.Read.All permissions
    4. Grant admin consent (if you have admin rights)
    5. Save the config to extractor\auth_config.json

    Total time: ~3 minutes.
#>

$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host "  AB InBev KB — One-Time Authentication Setup" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Yellow
Write-Host ""

# ── Check Azure CLI ─────────────────────────────────────────────────────────
Write-Host "[1/5] Checking Azure CLI..." -ForegroundColor Cyan
try {
    $azVersion = az --version 2>&1 | Select-String "azure-cli" | Select-Object -First 1
    Write-Host "      Found: $azVersion" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[ERROR] Azure CLI not found." -ForegroundColor Red
    Write-Host "        Install it from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    Write-Host "        Then re-run this script." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

# ── Azure login ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Signing in to Azure..." -ForegroundColor Cyan
Write-Host "      A browser window will open. Sign in with your AB InBev account."
Write-Host ""

az login --allow-no-subscriptions 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Login failed. Please try again." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

$tenantId = az account show --query tenantId -o tsv 2>&1
Write-Host "      Tenant ID: $tenantId" -ForegroundColor Green

# ── Create app registration ───────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Creating app registration 'ABI-KB-Reader'..." -ForegroundColor Cyan

# Check if app already exists
$existingApp = az ad app list --display-name "ABI-KB-Reader" --query "[0]" 2>&1 | ConvertFrom-Json
if ($existingApp -and $existingApp.appId) {
    Write-Host "      App already exists. Reusing: $($existingApp.appId)" -ForegroundColor Green
    $appId = $existingApp.appId
    $objectId = $existingApp.id
} else {
    $appJson = az ad app create `
        --display-name "ABI-KB-Reader" `
        --sign-in-audience "AzureADMyOrg" `
        --public-client-redirect-uris "http://localhost" `
        2>&1 | ConvertFrom-Json

    $appId   = $appJson.appId
    $objectId = $appJson.id
    Write-Host "      Created! Client ID: $appId" -ForegroundColor Green

    # Make it a public client (required for interactive auth without client secret)
    az rest --method PATCH `
        --uri "https://graph.microsoft.com/v1.0/applications/$objectId" `
        --headers "Content-Type=application/json" `
        --body '{"isFallbackPublicClient":true}' | Out-Null

    # Create service principal so it can be used in the tenant
    az ad sp create --id $appId 2>&1 | Out-Null
    Write-Host "      Service principal created." -ForegroundColor Green
}

# ── Add permissions ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Adding SharePoint read permissions..." -ForegroundColor Cyan

# Sites.Read.All (delegated) = 75359482-378d-4052-8f01-80520e7db3cd
# Files.Read.All (delegated) = df85f4d6-205c-4ac5-a5ea-6bf408dba283
az ad app permission add `
    --id $appId `
    --api "00000003-0000-0000-c000-000000000000" `
    --api-permissions "75359482-378d-4052-8f01-80520e7db3cd=Scope" `
    2>&1 | Out-Null

az ad app permission add `
    --id $appId `
    --api "00000003-0000-0000-c000-000000000000" `
    --api-permissions "df85f4d6-205c-4ac5-a5ea-6bf408dba283=Scope" `
    2>&1 | Out-Null

Write-Host "      Sites.Read.All + Files.Read.All added." -ForegroundColor Green

# ── Admin consent ──────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Granting admin consent..." -ForegroundColor Cyan

$consentResult = az ad app permission admin-consent --id $appId 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      Admin consent granted successfully!" -ForegroundColor Green
} else {
    Write-Host "      Could not auto-grant consent (you may not be a Global Admin)." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "      Ask your IT admin to open this URL and click 'Grant consent':" -ForegroundColor Yellow
    Write-Host "      https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/CallAnAPI/appId/$appId" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "      OR send them this admin consent URL:" -ForegroundColor Yellow
    Write-Host "      https://login.microsoftonline.com/$tenantId/adminconsent?client_id=$appId" -ForegroundColor Cyan
}

# ── Save config ────────────────────────────────────────────────────────────────
$config = @{
    client_id = $appId
    tenant_id = $tenantId
    app_name  = "ABI-KB-Reader"
    created   = (Get-Date -Format "yyyy-MM-ddTHH:mm:ss")
} | ConvertTo-Json

$configPath = Join-Path $scriptDir "extractor\auth_config.json"
$config | Set-Content $configPath -Encoding UTF8

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "  Setup complete!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Client ID : $appId" -ForegroundColor White
Write-Host "  Tenant ID : $tenantId" -ForegroundColor White
Write-Host "  Config    : extractor\auth_config.json" -ForegroundColor White
Write-Host ""
Write-Host "  Now double-click run_local.bat to fetch SharePoint content." -ForegroundColor Cyan
Write-Host "  (A browser will open once for SSO — then it's cached.)" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"
