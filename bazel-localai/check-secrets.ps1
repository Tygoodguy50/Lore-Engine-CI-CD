# GitHub Secrets Validation Script for Lore Engine
param(
    [string]$Repository = ""
)

Write-Host "GitHub Secrets Validation" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is available
function Test-GitHubCLI {
    try {
        $null = gh --version 2>$null
        return $true
    }
    catch {
        return $false
    }
}

if (-not (Test-GitHubCLI)) {
    Write-Host "GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "Please install it from: https://github.com/cli/cli/releases" -ForegroundColor Yellow
    Write-Host "Or use winget: winget install --id GitHub.cli" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual validation:" -ForegroundColor Blue
    Write-Host "1. Go to https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions" -ForegroundColor White
    Write-Host "2. Check that these secrets are configured:" -ForegroundColor White
    Write-Host "   - PROD_HOST" -ForegroundColor Gray
    Write-Host "   - PROD_USER" -ForegroundColor Gray
    Write-Host "   - PROD_SSH_KEY" -ForegroundColor Gray
    Write-Host "   - STAGING_HOST" -ForegroundColor Gray
    Write-Host "   - STAGING_USER" -ForegroundColor Gray
    Write-Host "   - STAGING_SSH_KEY" -ForegroundColor Gray
    Write-Host "   - DISCORD_WEBHOOK_URL" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Test Discord webhook:" -ForegroundColor White
    Write-Host "   Use a tool like Postman or curl to send a test message" -ForegroundColor Gray
    exit 0
}

# Get repository if not provided
if (-not $Repository) {
    $Repository = Read-Host "Enter your GitHub repository (format: owner/repo)"
}

Write-Host "Checking repository: $Repository" -ForegroundColor Blue
Write-Host ""

# Required secrets
$RequiredSecrets = @(
    "PROD_HOST",
    "PROD_USER", 
    "PROD_SSH_KEY",
    "STAGING_HOST",
    "STAGING_USER",
    "STAGING_SSH_KEY",
    "DISCORD_WEBHOOK_URL"
)

Write-Host "Checking GitHub secrets..." -ForegroundColor Blue

try {
    $secretsOutput = gh secret list --repo $Repository 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Successfully accessed secrets!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Configured secrets:" -ForegroundColor Yellow
        Write-Host $secretsOutput
        Write-Host ""
        
        # Parse secrets list
        $configuredSecrets = @()
        $lines = $secretsOutput -split "`n"
        foreach ($line in $lines) {
            if ($line -match "^(\w+)") {
                $configuredSecrets += $matches[1]
            }
        }
        
        Write-Host "Validation results:" -ForegroundColor Cyan
        $missingSecrets = @()
        foreach ($secret in $RequiredSecrets) {
            if ($configuredSecrets -contains $secret) {
                Write-Host "✓ $secret" -ForegroundColor Green
            } else {
                Write-Host "✗ $secret (MISSING)" -ForegroundColor Red
                $missingSecrets += $secret
            }
        }
        
        if ($missingSecrets.Count -eq 0) {
            Write-Host ""
            Write-Host "All secrets are configured! Ready to deploy!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "Missing secrets: $($missingSecrets -join ', ')" -ForegroundColor Red
        }
    } else {
        Write-Host "Error accessing secrets: $secretsOutput" -ForegroundColor Red
    }
} catch {
    Write-Host "Error checking secrets: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Push code to trigger deployment" -ForegroundColor White
Write-Host "2. Monitor GitHub Actions at: https://github.com/$Repository/actions" -ForegroundColor White
Write-Host "3. Check Discord for deployment notifications" -ForegroundColor White
