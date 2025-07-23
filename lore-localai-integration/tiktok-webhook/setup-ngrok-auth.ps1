# ngrok Setup with Your Auth Token
# Run this script after manually downloading ngrok

param(
    [string]$NgrokPath = ".\ngrok.exe"
)

Write-Host "🌐 Setting up ngrok for TikTok webhook..." -ForegroundColor Green
Write-Host "Auth token: 304iicb7pToMM2vJFtBG8NZk2JB_6bWMMHaQe3NY4FBJMvbFP" -ForegroundColor Yellow
Write-Host ""

# Check if ngrok exists
if (Test-Path $NgrokPath) {
    Write-Host "✅ ngrok found at: $NgrokPath" -ForegroundColor Green
} else {
    Write-Host "❌ ngrok not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download ngrok:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Download 'Windows (AMD64)' version" -ForegroundColor White
    Write-Host "3. Extract ngrok.exe to this folder" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after downloading ngrok.exe to this folder"
    
    # Check again after user confirmation
    if (-not (Test-Path $NgrokPath)) {
        Write-Host "❌ Still no ngrok.exe found. Please download it first." -ForegroundColor Red
        return
    }
}

Write-Host "📝 Configuring ngrok with auth token..." -ForegroundColor Yellow

# Configure ngrok with auth token
try {
    & $NgrokPath config add-authtoken 304iicb7pToMM2vJFtBG8NZk2JB_6bWMMHaQe3NY4FBJMvbFP
    Write-Host "✅ Auth token configured successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to configure auth token: $($_.Exception.Message)" -ForegroundColor Red
    return
}

Write-Host ""
Write-Host "🔍 Checking webhook server status..." -ForegroundColor Yellow

# Check if webhook server is running
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if ($webhookProcess) {
    Write-Host "✅ Webhook server running (PID: $($webhookProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "⚠️  Webhook server not running. Starting..." -ForegroundColor Yellow
    try {
        Start-Process -FilePath ".\tiktok-webhook-v3.exe" -WindowStyle Minimized
        Start-Sleep -Seconds 3
        Write-Host "✅ Webhook server started" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start webhook server" -ForegroundColor Red
        return
    }
}

Write-Host ""
Write-Host "🚀 Starting ngrok tunnel..." -ForegroundColor Green
Write-Host "This will create a public HTTPS URL for your TikTok webhook" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 What to do next:" -ForegroundColor Yellow
Write-Host "1. Copy the HTTPS URL shown below (https://XXXXX.ngrok-free.app)" -ForegroundColor White
Write-Host "2. Add '/tiktok' to the end" -ForegroundColor White  
Write-Host "3. Use that URL in TikTok webhook configuration" -ForegroundColor White
Write-Host "4. Example: https://abc123.ngrok-free.app/tiktok" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the tunnel when done" -ForegroundColor Gray
Write-Host ""

# Start ngrok tunnel
try {
    & $NgrokPath http 8443
} catch {
    Write-Host "❌ Failed to start ngrok tunnel: $($_.Exception.Message)" -ForegroundColor Red
}
