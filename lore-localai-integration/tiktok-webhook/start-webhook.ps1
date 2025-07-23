# TikTok Webhook Server Startup Script
# Run this as Administrator for port 80/443 binding

Write-Host "🚀 Starting TikTok Webhook Server for Phantom Gear..." -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
$isAdmin = $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator!" -ForegroundColor Yellow
    Write-Host "   Ports 80/443 may not be accessible without admin privileges" -ForegroundColor Yellow
    Write-Host "   Consider running PowerShell as Administrator" -ForegroundColor Yellow
    Write-Host ""
}

# Set environment variables
$env:TIKTOK_WEBHOOK_SECRET = "phantom_gear_secret_2025"

Write-Host "🔧 Configuration:" -ForegroundColor Green
Write-Host "   🌐 Domain: api.phantomgear.it.com" -ForegroundColor White
Write-Host "   🔑 Webhook Secret: SET" -ForegroundColor White
Write-Host "   📡 Webhook URL: https://api.phantomgear.it.com/api/webhooks/tiktok" -ForegroundColor White
Write-Host "   🏥 Health URL: https://api.phantomgear.it.com/health" -ForegroundColor White
Write-Host "   🔒 SSL Certificate: tiktok-webhook.crt" -ForegroundColor White
Write-Host "   🔑 SSL Private Key: tiktok-webhook.key" -ForegroundColor White
Write-Host ""

# Check if certificate files exist
if (-not (Test-Path "tiktok-webhook.crt")) {
    Write-Host "❌ TikTok SSL certificate not found! Generating..." -ForegroundColor Red
    go run generate-tiktok-ssl.go
}

if (-not (Test-Path "tiktok-webhook.key")) {
    Write-Host "❌ TikTok SSL private key not found! Please run generate-tiktok-ssl.go first" -ForegroundColor Red
    exit 1
}

Write-Host "🎯 Port Forwarding Required:" -ForegroundColor Magenta
Write-Host "   Router: TCP 443 → 192.168.0.187:443" -ForegroundColor White
Write-Host "   Router: TCP 80 → 192.168.0.187:80" -ForegroundColor White
Write-Host ""

Write-Host "🌐 TikTok Developer Console Setup:" -ForegroundColor Magenta
Write-Host "   Webhook URL: https://api.phantomgear.it.com/api/webhooks/tiktok" -ForegroundColor White
Write-Host "   Verification Code: H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Starting webhook server..." -ForegroundColor Green
Write-Host "   Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Start the webhook server
& .\tiktok-webhook.exe
