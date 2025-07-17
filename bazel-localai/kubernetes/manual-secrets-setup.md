# Manual GitHub CLI Setup for Staging Secrets
# Run these commands step by step in PowerShell

# 1. First, authenticate with GitHub CLI using a token
Write-Host "Option 1: Token Authentication" -ForegroundColor Yellow
Write-Host "1. Go to https://github.com/settings/tokens"
Write-Host "2. Generate a new token with 'repo' scope"
Write-Host "3. Run: gh auth login --with-token"
Write-Host "4. Paste your token when prompted"
Write-Host ""

# 2. Or authenticate with web browser
Write-Host "Option 2: Web Browser Authentication" -ForegroundColor Yellow
Write-Host "Run: gh auth login --web"
Write-Host ""

# 3. After authentication, set secrets manually
Write-Host "After authentication, set secrets with:" -ForegroundColor Green
Write-Host 'gh secret set STAGING_HOST --body "your-staging-server.com"'
Write-Host 'gh secret set STAGING_USER --body "ubuntu"'
Write-Host 'gh secret set STAGING_SSH_KEY --body "-----BEGIN RSA PRIVATE KEY-----
...your private key content...
-----END RSA PRIVATE KEY-----"'
Write-Host ""

# 4. Verify secrets were set
Write-Host "Verify secrets:" -ForegroundColor Green
Write-Host "gh secret list"
