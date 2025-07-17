# 🔐 GitHub Secrets Configuration Script
# This script helps you set up GitHub secrets for the Lore Engine deployment pipeline

param(
    [string]$Repository = "",
    [string]$GitHubToken = "",
    [switch]$Interactive,
    [switch]$Help
)

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    
    switch ($Color) {
        "Red" { Write-Host $Message -ForegroundColor Red }
        "Green" { Write-Host $Message -ForegroundColor Green }
        "Yellow" { Write-Host $Message -ForegroundColor Yellow }
        "Blue" { Write-Host $Message -ForegroundColor Blue }
        "Cyan" { Write-Host $Message -ForegroundColor Cyan }
        "Magenta" { Write-Host $Message -ForegroundColor Magenta }
        default { Write-Host $Message }
    }
}

# Show help
if ($Help) {
    Write-ColorOutput "🔐 GitHub Secrets Configuration Script" "Cyan"
    Write-ColorOutput ""
    Write-ColorOutput "Usage: .\configure-github-secrets.ps1 [-Repository <repo>] [-GitHubToken <token>] [-Interactive] [-Help]" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Parameters:" "Yellow"
    Write-ColorOutput "  -Repository    GitHub repository (format: owner/repo)" "White"
    Write-ColorOutput "  -GitHubToken   GitHub Personal Access Token with repo scope" "White"
    Write-ColorOutput "  -Interactive   Run in interactive mode (default: true)" "White"
    Write-ColorOutput "  -Help          Show this help message" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Examples:" "Yellow"
    Write-ColorOutput "  .\configure-github-secrets.ps1 -Repository 'myuser/lore-engine' -GitHubToken 'ghp_...' -Interactive" "White"
    Write-ColorOutput "  .\configure-github-secrets.ps1 -Interactive" "White"
    Write-ColorOutput ""
    Write-ColorOutput "Required GitHub Token Permissions:" "Yellow"
    Write-ColorOutput "  - repo (Full control of private repositories)" "White"
    Write-ColorOutput "  - admin:repo_hook (Admin repo hooks)" "White"
    Write-ColorOutput ""
    exit 0
}

# Header
Write-ColorOutput "🔮 Lore Engine GitHub Secrets Configuration" "Magenta"
Write-ColorOutput "=============================================" "Cyan"
Write-ColorOutput ""

# Function to get user input
function Get-UserInput {
    param(
        [string]$Prompt,
        [string]$Default = "",
        [bool]$Secure = $false
    )
    
    if ($Default -ne "") {
        $fullPrompt = "$Prompt [$Default]" + ": "
    } else {
        $fullPrompt = "$Prompt" + ": "
    }
    
    Write-Host $fullPrompt -NoNewline -ForegroundColor Yellow
    
    if ($Secure) {
        $userInput = Read-Host -AsSecureString
        $userInput = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($userInput))
    } else {
        $userInput = Read-Host
    }
    
    if ($userInput -eq "" -and $Default -ne "") {
        return $Default
    }
    
    return $userInput
}

# Function to validate GitHub token
function Test-GitHubToken {
    param([string]$Token)
    
    try {
        $headers = @{
            "Authorization" = "token $Token"
            "Accept" = "application/vnd.github.v3+json"
        }
        
        $null = Invoke-RestMethod -Uri "https://api.github.com/user" -Headers $headers -Method GET
        return $true
    } catch {
        return $false
    }
}

# Function to set GitHub secret
function Set-GitHubSecret {
    param(
        [string]$Repository,
        [string]$Token,
        [string]$SecretName,
        [string]$SecretValue
    )
    
    try {
        # Get public key for encryption
        $headers = @{
            "Authorization" = "token $Token"
            "Accept" = "application/vnd.github.v3+json"
        }
        
        $null = Invoke-RestMethod -Uri "https://api.github.com/repos/$Repository/actions/secrets/public-key" -Headers $headers -Method GET
        
        # For simplicity, we'll show the command to run with GitHub CLI
        Write-ColorOutput "Setting secret: $SecretName" "Blue"
        Write-ColorOutput "gh secret set $SecretName --body '$SecretValue' --repo $Repository" "Gray"
        
        return $true
    } catch {
        Write-ColorOutput "Failed to set secret $SecretName`: $($_.Exception.Message)" "Red"
        return $false
    }
}

# Main configuration function
function Start-SecretsConfiguration {
    # Set default for Interactive if not specified
    if (-not $PSBoundParameters.ContainsKey('Interactive')) {
        $Script:Interactive = $true
    }
    Write-ColorOutput "📋 Starting GitHub Secrets Configuration..." "Blue"
    Write-ColorOutput ""
    
    # Get repository information
    if ($Repository -eq "" -and $Interactive) {
        $Repository = Get-UserInput "Enter GitHub repository (format: owner/repo)"
    }
    
    # Get GitHub token
    if ($GitHubToken -eq "" -and $Interactive) {
        $GitHubToken = Get-UserInput "Enter GitHub Personal Access Token" -Secure $true
    }
    
    # Validate token
    if ($GitHubToken -ne "") {
        Write-ColorOutput "🔍 Validating GitHub token..." "Blue"
        if (-not (Test-GitHubToken $GitHubToken)) {
            Write-ColorOutput "❌ Invalid GitHub token. Please check your token and permissions." "Red"
            return $false
        }
        Write-ColorOutput "✅ GitHub token validated successfully." "Green"
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "🔐 Configuring deployment secrets..." "Blue"
    Write-ColorOutput ""
    
    # Required secrets configuration
    $secrets = @{
        "PROD_HOST" = @{
            "Description" = "Production server IP address or hostname"
            "Example" = "203.0.113.10 or lore-engine.example.com"
            "Required" = $true
        }
        "PROD_USER" = @{
            "Description" = "SSH username for production server"
            "Example" = "ubuntu, deploy, or lore-engine"
            "Required" = $true
        }
        "PROD_SSH_KEY" = @{
            "Description" = "SSH private key for production server"
            "Example" = "-----BEGIN OPENSSH PRIVATE KEY-----..."
            "Required" = $true
            "Multiline" = $true
        }
        "STAGING_HOST" = @{
            "Description" = "Staging server IP address or hostname"
            "Example" = "203.0.113.11 or staging.lore-engine.example.com"
            "Required" = $true
        }
        "STAGING_USER" = @{
            "Description" = "SSH username for staging server"
            "Example" = "ubuntu, deploy, or lore-engine-staging"
            "Required" = $true
        }
        "STAGING_SSH_KEY" = @{
            "Description" = "SSH private key for staging server"
            "Example" = "-----BEGIN OPENSSH PRIVATE KEY-----..."
            "Required" = $true
            "Multiline" = $true
        }
        "DISCORD_WEBHOOK_URL" = @{
            "Description" = "Discord webhook URL for deployment notifications"
            "Example" = "https://discord.com/api/webhooks/123456789/abcdef..."
            "Required" = $true
        }
        "DOCKER_REGISTRY_USER" = @{
            "Description" = "Docker registry username (optional)"
            "Example" = "Your GitHub username or Docker Hub username"
            "Required" = $false
        }
        "DOCKER_REGISTRY_PASSWORD" = @{
            "Description" = "Docker registry password/token (optional)"
            "Example" = "GitHub PAT with write:packages or Docker Hub password"
            "Required" = $false
        }
    }
    
    # Collect secret values
    $secretValues = @{}
    
    foreach ($secretName in $secrets.Keys) {
        $secretInfo = $secrets[$secretName]
        
        Write-ColorOutput "📝 Configuring: $secretName" "Yellow"
        Write-ColorOutput "   Description: $($secretInfo.Description)" "White"
        Write-ColorOutput "   Example: $($secretInfo.Example)" "Gray"
        
        if ($secretInfo.Required) {
            Write-ColorOutput "   Status: REQUIRED" "Red"
        } else {
            Write-ColorOutput "   Status: OPTIONAL" "Green"
        }
        
        if ($Interactive) {
            if ($secretInfo.ContainsKey("Multiline") -and $secretInfo.Multiline) {
                Write-ColorOutput "   Enter the value (press Enter twice when done):" "Yellow"
                $lines = @()
                do {
                    $line = Read-Host
                    if ($line -ne "") {
                        $lines += $line
                    }
                } while ($line -ne "" -or $lines.Count -eq 0)
                
                $secretValue = $lines -join "`n"
            } else {
                $secretValue = Get-UserInput "   Enter value" -Secure ($secretName -match "PASSWORD|TOKEN|KEY")
            }
            
            if ($secretValue -ne "" -or -not $secretInfo.Required) {
                $secretValues[$secretName] = $secretValue
            } elseif ($secretInfo.Required) {
                Write-ColorOutput "   ❌ This secret is required and cannot be empty." "Red"
                return $false
            }
        }
        
        Write-ColorOutput ""
    }
    
    # Generate GitHub CLI commands
    Write-ColorOutput "🚀 Generated GitHub CLI Commands:" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "# Run these commands to set your GitHub secrets:" "Gray"
    Write-ColorOutput ""
    
    foreach ($secretName in $secretValues.Keys) {
        $value = $secretValues[$secretName]
        if ($value -ne "") {
            if ($secretName -match "SSH_KEY") {
                Write-ColorOutput "# Set $secretName (paste the entire private key)" "Gray"
                Write-ColorOutput "gh secret set $secretName --repo $Repository" "White"
            } else {
                Write-ColorOutput "gh secret set $secretName --body `"$value`" --repo $Repository" "White"
            }
        }
    }
    
    Write-ColorOutput ""
    Write-ColorOutput "📋 Alternative: Manual Setup" "Yellow"
    Write-ColorOutput ""
    Write-ColorOutput "You can also add these secrets manually:" "White"
    Write-ColorOutput "1. Go to https://github.com/$Repository/settings/secrets/actions" "White"
    Write-ColorOutput "2. Click 'New repository secret'" "White"
    Write-ColorOutput "3. Add each secret with the values you provided" "White"
    Write-ColorOutput ""
    
    # Generate SSH key creation commands
    Write-ColorOutput "🔑 SSH Key Generation Commands:" "Blue"
    Write-ColorOutput ""
    Write-ColorOutput "# Generate SSH keys for deployment:" "Gray"
    Write-ColorOutput "ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-prod -C `"lore-engine-prod-deploy`"" "White"
    Write-ColorOutput "ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-staging -C `"lore-engine-staging-deploy`"" "White"
    Write-ColorOutput ""
    Write-ColorOutput "# Display public keys (add to servers):" "Gray"
    Write-ColorOutput "cat ~/.ssh/lore-engine-prod.pub" "White"
    Write-ColorOutput "cat ~/.ssh/lore-engine-staging.pub" "White"
    Write-ColorOutput ""
    Write-ColorOutput "# Display private keys (add to GitHub secrets):" "Gray"
    Write-ColorOutput "cat ~/.ssh/lore-engine-prod" "White"
    Write-ColorOutput "cat ~/.ssh/lore-engine-staging" "White"
    Write-ColorOutput ""
    
    # Server setup commands
    Write-ColorOutput "🖥️ Server Setup Commands:" "Blue"
    Write-ColorOutput ""
    Write-ColorOutput "# Run on both production and staging servers:" "Gray"
    Write-ColorOutput "sudo mkdir -p /opt/lore-engine" "White"
    Write-ColorOutput "sudo useradd -r -s /bin/false lore-engine" "White"
    Write-ColorOutput "sudo chown -R lore-engine:lore-engine /opt/lore-engine" "White"
    Write-ColorOutput "sudo mkdir -p /opt/lore-engine/logs" "White"
    Write-ColorOutput ""
    Write-ColorOutput "# Add public keys to authorized_keys:" "Gray"
    Write-ColorOutput "echo `"ssh-ed25519 AAAA... lore-engine-prod-deploy`" >> ~/.ssh/authorized_keys" "White"
    Write-ColorOutput "chmod 600 ~/.ssh/authorized_keys" "White"
    Write-ColorOutput ""
    
    # Testing commands
    Write-ColorOutput "🧪 Testing Commands:" "Blue"
    Write-ColorOutput ""
    Write-ColorOutput "# Test SSH access:" "Gray"
    Write-ColorOutput "ssh -i ~/.ssh/lore-engine-prod $($secretValues['PROD_USER'])@$($secretValues['PROD_HOST']) `"echo 'Production SSH works!'`"" "White"
    Write-ColorOutput "ssh -i ~/.ssh/lore-engine-staging $($secretValues['STAGING_USER'])@$($secretValues['STAGING_HOST']) `"echo 'Staging SSH works!'`"" "White"
    Write-ColorOutput ""
    Write-ColorOutput "# Test Discord webhook:" "Gray"
    if ($secretValues.ContainsKey('DISCORD_WEBHOOK_URL') -and $secretValues['DISCORD_WEBHOOK_URL'] -ne "") {
        Write-ColorOutput "curl -H `"Content-Type: application/json`" -d `"{\`"content\`": \`"🧪 Test notification from Lore Engine!\`"}`" $($secretValues['DISCORD_WEBHOOK_URL'])" "White"
    } else {
        Write-ColorOutput "curl -H `"Content-Type: application/json`" -d `"{\`"content\`": \`"🧪 Test notification from Lore Engine!\`"}`" YOUR_DISCORD_WEBHOOK_URL" "White"
    }
    Write-ColorOutput ""
    
    return $true
}

# Run the configuration
if (Start-SecretsConfiguration) {
    Write-ColorOutput "🎉 GitHub Secrets Configuration Complete!" "Green"
    Write-ColorOutput ""
    Write-ColorOutput "📋 Next Steps:" "Yellow"
    Write-ColorOutput "1. Run the GitHub CLI commands above to set your secrets" "White"
    Write-ColorOutput "2. Set up your servers with the provided commands" "White"
    Write-ColorOutput "3. Test SSH access and Discord webhook" "White"
    Write-ColorOutput "4. Run: .\setup-deployment.ps1 -Environment production" "White"
    Write-ColorOutput "5. Push to repository to trigger deployment" "White"
    Write-ColorOutput ""
    Write-ColorOutput "🔮 The Lore Engine deployment secrets are ready! ✨" "Magenta"
} else {
    Write-ColorOutput "❌ Configuration failed. Please check the errors above and try again." "Red"
    exit 1
}
