#!/usr/bin/env pwsh
# PowerShell pre-commit hook (Windows friendly) to prevent committing secrets or config.env
Param()
$ErrorActionPreference = 'Stop'

Write-Host '[pre-commit] PowerShell secret scan starting...' -ForegroundColor Yellow

# Ensure we run from repo root
Set-Location -Path (git rev-parse --show-toplevel) 2>$null

# 1. Block config.env
$staged = git diff --cached --name-only
if ($staged -contains 'config.env') {
  Write-Host 'ERROR: config.env is staged. Remove it before committing.' -ForegroundColor Red
  exit 1
}

# 2. Patterns to detect (extend as needed)
$patterns = @(
  'sk_(live|test)_[A-Za-z0-9]{10,}',
  'pk_(live|test)_[A-Za-z0-9]{10,}',
  'CONVERTKIT_API_KEY',
  'TWITTER_BEARER_TOKEN',
  'ghp_[A-Za-z0-9]{36}',
  'AIzaSy[0-9A-Za-z_-]{10,}',
  'BEGIN RSA PRIVATE KEY',
  'BEGIN OPENSSH PRIVATE KEY'
)

$scanFiles = $staged | Where-Object { $_ -and (-not ($_ -like '.husky/*')) }
if (-not $scanFiles) {
  Write-Host '[pre-commit] No scannable files (skipping secret scan).' -ForegroundColor Green
  exit 0
}

$found = $false
foreach ($file in $scanFiles) {
  try {
    $content = git show ":$file" 2>$null
  } catch {
    continue
  }
  foreach ($pat in $patterns) {
    if ($null -ne $content -and ($content -match $pat)) {
      Write-Host "ERROR: Potential secret matched pattern in $file => $pat" -ForegroundColor Red
      $found = $true
    }
  }
}

if ($found) {
  Write-Host 'Commit aborted. If false positive, refine patterns or implement allowlist.' -ForegroundColor Red
  exit 1
}

Write-Host '[pre-commit] No secrets detected.' -ForegroundColor Green
exit 0
