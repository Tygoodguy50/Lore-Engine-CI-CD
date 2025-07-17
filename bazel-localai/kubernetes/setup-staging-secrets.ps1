# Simple PowerShell script to set up staging server secrets
# Run this script after authenticating with GitHub CLI

Write-Host "Setting up staging server secrets for GitHub Actions..." -ForegroundColor Green

# Check if GitHub CLI is authenticated
Write-Host "Checking GitHub CLI authentication..." -ForegroundColor Yellow
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "GitHub CLI not authenticated. Please run: gh auth login" -ForegroundColor Red
    exit 1
}

Write-Host "GitHub CLI authenticated successfully!" -ForegroundColor Green

# Function to set a secret
function Set-GitHubSecret {
    param(
        [string]$Name,
        [string]$Description,
        [string]$DefaultValue = ""
    )
    
    Write-Host "`nSetting up secret: $Name" -ForegroundColor Yellow
    Write-Host "Description: $Description"
    
    if ($DefaultValue) {
        $value = Read-Host "Enter value for $Name (default: $DefaultValue)"
        if (-not $value) { $value = $DefaultValue }
    } else {
        $value = Read-Host "Enter value for $Name"
    }
    
    if ($value) {
        Write-Output $value | gh secret set $Name
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Secret $Name set successfully" -ForegroundColor Green
        } else {
            Write-Host "✗ Failed to set secret $Name" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ No value provided for $Name" -ForegroundColor Red
    }
}

# Set up the three staging server secrets
Set-GitHubSecret -Name "STAGING_HOST" -Description "Staging server hostname or IP address" -DefaultValue "your-staging-server.com"
Set-GitHubSecret -Name "STAGING_USER" -Description "SSH username for staging server" -DefaultValue "ubuntu"
Set-GitHubSecret -Name "STAGING_SSH_KEY" -Description "Private SSH key for staging server authentication (paste entire key content)"

Write-Host "`nAll staging server secrets configured!" -ForegroundColor Green
Write-Host "You can verify the secrets at: https://github.com/Tygoodguy50/Lore-Engine-CI-CD/settings/secrets/actions" -ForegroundColor Cyan
