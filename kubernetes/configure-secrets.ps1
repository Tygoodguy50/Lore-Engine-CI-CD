# Kubernetes Secrets Configuration Helper
# This script helps you encode secrets for Kubernetes deployment

Write-Host "🔐 Lore Engine Kubernetes Secrets Configuration 🔐" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Function to encode secret
function Encode-Secret {
    param([string]$value)
    if ([string]::IsNullOrEmpty($value)) {
        return ""
    }
    return [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($value))
}

# Function to safely prompt for secret
function Get-SecretInput {
    param([string]$prompt, [bool]$required = $false)
    
    do {
        $value = Read-Host -Prompt $prompt
        if ($required -and [string]::IsNullOrEmpty($value)) {
            Write-Host "This field is required!" -ForegroundColor Red
        }
    } while ($required -and [string]::IsNullOrEmpty($value))
    
    return $value
}

Write-Host ""
Write-Host "This script will help you configure secrets for your Lore Engine deployment." -ForegroundColor Green
Write-Host "Leave fields empty if you don't want to configure them now." -ForegroundColor Yellow
Write-Host ""

# Collect secrets
$secrets = @{}

# Discord Integration
Write-Host "📱 Discord Integration:" -ForegroundColor Magenta
$secrets["DISCORD_TOKEN"] = Get-SecretInput "Discord Bot Token (leave empty to skip)"
$secrets["DISCORD_CHANNEL_ID"] = Get-SecretInput "Discord Channel ID (leave empty to skip)"
$secrets["DISCORD_GUILD_ID"] = Get-SecretInput "Discord Guild ID (leave empty to skip)"

# TikTok Integration
Write-Host ""
Write-Host "🎵 TikTok Integration:" -ForegroundColor Magenta
$secrets["TIKTOK_WEBHOOK_URL"] = Get-SecretInput "TikTok Webhook URL (leave empty to skip)"
$secrets["TIKTOK_ACCESS_TOKEN"] = Get-SecretInput "TikTok Access Token (leave empty to skip)"

# N8N Integration
Write-Host ""
Write-Host "🔧 N8N LangChain Integration:" -ForegroundColor Magenta
$secrets["N8N_WEBHOOK_URL"] = Get-SecretInput "N8N Webhook URL (leave empty to skip)"
$secrets["N8N_API_KEY"] = Get-SecretInput "N8N API Key (leave empty to skip)"
$secrets["LANGCHAIN_URL"] = Get-SecretInput "LangChain URL (leave empty to skip)"

# GitHub Integration
Write-Host ""
Write-Host "🐙 GitHub Integration:" -ForegroundColor Magenta
$secrets["GITHUB_TOKEN"] = Get-SecretInput "GitHub Token (leave empty to skip)"

# Additional services
Write-Host ""
Write-Host "🤖 AI Services (Optional):" -ForegroundColor Magenta
$secrets["OPENAI_API_KEY"] = Get-SecretInput "OpenAI API Key (leave empty to skip)"
$secrets["ANTHROPIC_API_KEY"] = Get-SecretInput "Anthropic API Key (leave empty to skip)"

# Database
Write-Host ""
Write-Host "💾 Database (Optional):" -ForegroundColor Magenta
$secrets["DATABASE_URL"] = Get-SecretInput "Database URL (leave empty to skip)"

# Generate the secrets YAML
Write-Host ""
Write-Host "🔨 Generating encoded secrets..." -ForegroundColor Green

$secretsYaml = @"
# Generated Kubernetes secrets for Lore Engine
# Copy this content to replace the data section in kubernetes/configmap.yaml
apiVersion: v1
kind: Secret
metadata:
  name: lore-engine-secrets
  namespace: lore-engine
type: Opaque
data:
"@

foreach ($key in $secrets.Keys) {
    $encodedValue = Encode-Secret $secrets[$key]
    $secretsYaml += "`n  $key`: `"$encodedValue`""
}

# Save to file
$outputFile = "kubernetes/secrets-encoded.yaml"
$secretsYaml | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host ""
Write-Host "✅ Secrets have been encoded and saved to: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the generated file: $outputFile" -ForegroundColor White
Write-Host "2. Copy the 'data:' section to kubernetes/configmap.yaml" -ForegroundColor White
Write-Host "3. Deploy using: .\kubernetes\deploy.ps1" -ForegroundColor White
Write-Host ""
Write-Host "🔍 To verify your secrets are working:" -ForegroundColor Yellow
Write-Host "kubectl get secret lore-engine-secrets -n lore-engine -o yaml" -ForegroundColor White

# Show summary
Write-Host ""
Write-Host "📊 Configuration Summary:" -ForegroundColor Cyan
foreach ($key in $secrets.Keys) {
    $status = if ([string]::IsNullOrEmpty($secrets[$key])) { "❌ Not configured" } else { "✅ Configured" }
    Write-Host "$key`: $status" -ForegroundColor $(if ([string]::IsNullOrEmpty($secrets[$key])) { "Red" } else { "Green" })
}

Write-Host ""
Write-Host "🚀 Ready to deploy your Lore Engine to Kubernetes!" -ForegroundColor Green
