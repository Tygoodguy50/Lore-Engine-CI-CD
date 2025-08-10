<#
    GitHub Secrets Validation Script for Lore Engine (normalized)
#>
param([string]$Repository = "")

Write-Host "GitHub Secrets Validation" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

function Test-GitHubCLI { try { $null = gh --version 2>$null; $true } catch { $false } }

if (-not (Test-GitHubCLI)) {
    Write-Host "GitHub CLI (gh) not installed; skipping dynamic validation." -ForegroundColor Yellow
    Write-Host "Install: https://github.com/cli/cli/releases or winget install --id GitHub.cli" -ForegroundColor Yellow
    return
}

if (-not $Repository) {
    if ($env:GITHUB_REPOSITORY) { $Repository = $env:GITHUB_REPOSITORY; Write-Host "Using repository: $Repository" -ForegroundColor Yellow } else { Write-Host "No repository context; aborting." -ForegroundColor Yellow; return }
}

$RequiredSecrets = 'PROD_HOST','PROD_USER','PROD_SSH_KEY','STAGING_HOST','STAGING_USER','STAGING_SSH_KEY','DISCORD_WEBHOOK_URL'
Write-Host "Querying GitHub secrets..." -ForegroundColor Blue
try {
    $raw = gh secret list --repo $Repository 2>&1
    if($LASTEXITCODE -ne 0){ Write-Host "Error: $raw" -ForegroundColor Red; return }
    Write-Host "Configured secrets:" -ForegroundColor Yellow
    Write-Host $raw
    $configured = @(); ($raw -split "`n") | ForEach-Object { if($_ -match '^(\w+)'){ $configured += $matches[1] } }
    $missing = @()
    foreach($s in $RequiredSecrets){ if($configured -contains $s){ Write-Host "[OK] $s" -ForegroundColor Green } else { Write-Host "[MISSING] $s" -ForegroundColor Red; $missing += $s } }
    if($missing.Count -eq 0){ Write-Host "All required secrets present." -ForegroundColor Green } else { Write-Host "Missing: $($missing -join ', ')" -ForegroundColor Red }
} catch { Write-Host "Exception: $_" -ForegroundColor Red }

Write-Host "Validation complete." -ForegroundColor Cyan
