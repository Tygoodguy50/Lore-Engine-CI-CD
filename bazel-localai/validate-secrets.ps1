# 🔐 GitHub Secrets Validation Script
# This script validates your GitHub secrets configuration for the Lore Engine deployment pipeline

param(
    [string]$Repository = "",
    [switch]$Help
)

if ($Help) {
    Write-Host "🔐 GitHub Secrets Validation Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage: .\validate-secrets.ps1 [-Repository owner/repo]"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\validate-secrets.ps1 -Repository username/lore-engine"
    Write-Host "  .\validate-secrets.ps1  # Will prompt for repository"
    Write-Host ""
    exit 0
}

# Function to check if GitHub CLI is available
function Test-GitHubCLI {
    try {
        $null = gh --version
        return $true
    }
    catch {
        return $false
    }
}

# Function to install GitHub CLI
function Install-GitHubCLI {
    Write-Host "⚠️  GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To install GitHub CLI, choose one of these options:" -ForegroundColor White
    Write-Host "1. Using winget (recommended):" -ForegroundColor Green
    Write-Host "   winget install --id GitHub.cli" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Using Chocolatey:" -ForegroundColor Green
    Write-Host "   choco install gh" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Using Scoop:" -ForegroundColor Green
    Write-Host "   scoop install gh" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4. Download from: https://github.com/cli/cli/releases" -ForegroundColor Green
    Write-Host ""
    
    $install = Read-Host "Would you like to install GitHub CLI now using winget? (y/n)"
    if ($install -eq 'y' -or $install -eq 'Y') {
        Write-Host "Installing GitHub CLI..." -ForegroundColor Blue
        winget install --id GitHub.cli
        Write-Host "GitHub CLI installed! Please restart your terminal and run this script again." -ForegroundColor Green
        exit 0
    }
    else {
        Write-Host "Please install GitHub CLI and run this script again." -ForegroundColor Red
        exit 1
    }
}

# Required secrets for deployment
$RequiredSecrets = @(
    "PROD_HOST",
    "PROD_USER", 
    "PROD_SSH_KEY",
    "STAGING_HOST",
    "STAGING_USER",
    "STAGING_SSH_KEY",
    "DISCORD_WEBHOOK_URL"
)

Write-Host "🔐 GitHub Secrets Validation" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
if (-not (Test-GitHubCLI)) {
    Install-GitHubCLI
}

# Get repository if not provided
if (-not $Repository) {
    Write-Host "📁 Repository Information" -ForegroundColor Yellow
    Write-Host "Please provide your GitHub repository information:" -ForegroundColor White
    $Repository = Read-Host "Repository (format: owner/repo)"
    
    if (-not $Repository -or $Repository -notmatch "^[^/]+/[^/]+$") {
        Write-Host "❌ Invalid repository format. Please use 'owner/repo' format." -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔍 Checking repository: $Repository" -ForegroundColor Blue
Write-Host ""

# Test GitHub CLI authentication
Write-Host "🔑 Testing GitHub CLI authentication..." -ForegroundColor Blue
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub CLI is authenticated" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub CLI is not authenticated" -ForegroundColor Red
        Write-Host "Please run: gh auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error checking GitHub CLI authentication: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check repository access
Write-Host "📋 Checking repository access..." -ForegroundColor Blue
try {
    $repoInfo = gh repo view $Repository --json name,owner 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Repository access confirmed" -ForegroundColor Green
    } else {
        Write-Host "❌ Cannot access repository: $Repository" -ForegroundColor Red
        Write-Host "Please check repository name and permissions." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error accessing repository: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check secrets
Write-Host "🔐 Checking GitHub secrets..." -ForegroundColor Blue
try {
    $secrets = gh secret list --repo $Repository --json name 2>&1
    if ($LASTEXITCODE -eq 0) {
        $secretList = $secrets | ConvertFrom-Json
        $configuredSecrets = $secretList | ForEach-Object { $_.name }
        
        Write-Host "✅ Secrets access confirmed" -ForegroundColor Green
        Write-Host ""
        
        # Check each required secret
        $missingSecrets = @()
        $foundSecrets = @()
        
        foreach ($secret in $RequiredSecrets) {
            if ($configuredSecrets -contains $secret) {
                Write-Host "✅ $secret" -ForegroundColor Green
                $foundSecrets += $secret
            } else {
                Write-Host "❌ $secret (MISSING)" -ForegroundColor Red
                $missingSecrets += $secret
            }
        }
        
        Write-Host ""
        
        # Summary
        Write-Host "📊 Summary" -ForegroundColor Cyan
        Write-Host "============" -ForegroundColor Cyan
        Write-Host "✅ Found: $($foundSecrets.Count)/$($RequiredSecrets.Count) secrets" -ForegroundColor Green
        
        if ($missingSecrets.Count -gt 0) {
            Write-Host "❌ Missing: $($missingSecrets.Count) secrets" -ForegroundColor Red
            Write-Host ""
            Write-Host "Missing secrets:" -ForegroundColor Yellow
            foreach ($secret in $missingSecrets) {
                Write-Host "  - $secret" -ForegroundColor Red
            }
            Write-Host ""
            Write-Host "To add missing secrets, run:" -ForegroundColor Yellow
            foreach ($secret in $missingSecrets) {
                Write-Host "  gh secret set $secret --repo $Repository" -ForegroundColor Gray
            }
        } else {
            Write-Host "🎉 All required secrets are configured!" -ForegroundColor Green
        }
        
    } else {
        Write-Host "❌ Cannot access secrets for repository: $Repository" -ForegroundColor Red
        Write-Host "Please check repository permissions." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error checking secrets: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Additional validation checks
Write-Host "🔍 Additional Validation" -ForegroundColor Blue
Write-Host "========================" -ForegroundColor Blue

# Check if Actions are enabled
Write-Host "📋 Checking GitHub Actions..." -ForegroundColor Blue
try {
    $workflows = gh workflow list --repo $Repository --json name 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ GitHub Actions are enabled" -ForegroundColor Green
    } else {
        Write-Host "❌ GitHub Actions may not be enabled" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Could not check GitHub Actions status" -ForegroundColor Yellow
}

Write-Host ""

# Final recommendations
Write-Host "🎯 Next Steps" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan

if ($missingSecrets.Count -eq 0) {
    Write-Host "✅ All secrets are configured! You can now:" -ForegroundColor Green
    Write-Host "  1. Push code to trigger deployment" -ForegroundColor White
    Write-Host "  2. Monitor GitHub Actions for deployment status" -ForegroundColor White
    Write-Host "  3. Check Discord for deployment notifications" -ForegroundColor White
    Write-Host ""
    Write-Host "Test commands:" -ForegroundColor Yellow
    Write-Host "  git push origin develop    # Deploy to staging" -ForegroundColor Gray
    Write-Host "  git push origin main       # Deploy to production" -ForegroundColor Gray
} else {
    Write-Host "⚠️  Please configure missing secrets before deployment" -ForegroundColor Yellow
    Write-Host "  Use the configure-github-secrets.ps1 script or add them manually" -ForegroundColor White
}

Write-Host ""
Write-Host "🔗 Useful Links:" -ForegroundColor Blue
Write-Host "  Repository: https://github.com/$Repository" -ForegroundColor Gray
Write-Host "  Secrets: https://github.com/$Repository/settings/secrets/actions" -ForegroundColor Gray
Write-Host "  Actions: https://github.com/$Repository/actions" -ForegroundColor Gray

Write-Host ""
Write-Host "Validation complete!" -ForegroundColor Green
