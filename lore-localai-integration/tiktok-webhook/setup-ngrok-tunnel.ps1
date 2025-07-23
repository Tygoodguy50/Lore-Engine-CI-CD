# Quick ngrok Setup for TikTok Webhook
# Alternative to Cox DMZ - creates secure tunnel

Write-Host "🌐 Setting up ngrok tunnel for TikTok webhook..." -ForegroundColor Green
Write-Host ""

# Check if ngrok exists
if (Test-Path ".\ngrok.exe") {
    Write-Host "✅ ngrok.exe found" -ForegroundColor Green
} else {
    Write-Host "❌ ngrok.exe not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Download ngrok:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Download ngrok for Windows" -ForegroundColor White
    Write-Host "3. Extract ngrok.exe to this folder" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    
    # Try to download automatically
    Write-Host "🤖 Attempting automatic download..." -ForegroundColor Yellow
    try {
        $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
        Write-Host "Downloading from: $ngrokUrl" -ForegroundColor Gray
        
        Invoke-WebRequest -Uri $ngrokUrl -OutFile "ngrok.zip" -TimeoutSec 30
        Write-Host "✅ Downloaded ngrok.zip" -ForegroundColor Green
        
        # Extract zip
        Expand-Archive -Path "ngrok.zip" -DestinationPath "." -Force
        Remove-Item "ngrok.zip"
        Write-Host "✅ Extracted ngrok.exe" -ForegroundColor Green
    } catch {
        Write-Host "❌ Auto-download failed: $_" -ForegroundColor Red
        Write-Host "Please download manually from https://ngrok.com/download" -ForegroundColor Yellow
        return
    }
}

# Check if webhook server is running
Write-Host "🔍 Checking webhook server..." -ForegroundColor Yellow
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if (-not $webhookProcess) {
    Write-Host "❌ Webhook server not running!" -ForegroundColor Red
    Write-Host "Starting webhook server..." -ForegroundColor Yellow
    
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
Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
Write-Host ""

# Start ngrok tunnel
try {
    Write-Host "Creating HTTPS tunnel to localhost:8443..." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🎯 Your TikTok webhook URL will be shown below:" -ForegroundColor Green
    Write-Host "   Look for: https://XXXXX.ngrok-free.app" -ForegroundColor Green
    Write-Host "   Use that URL + /tiktok for TikTok webhook" -ForegroundColor Green
    Write-Host "   Example: https://abc123.ngrok-free.app/tiktok" -ForegroundColor Green
    Write-Host ""
    
    # Run ngrok
    & .\ngrok.exe http 8443
    
} catch {
    Write-Host "❌ Failed to start ngrok: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Manual ngrok setup:" -ForegroundColor Yellow
    Write-Host "1. Open command prompt in this folder" -ForegroundColor White
    Write-Host "2. Run: ngrok http 8443" -ForegroundColor White
    Write-Host "3. Copy the https://XXXXX.ngrok-free.app URL" -ForegroundColor White
    Write-Host "4. Add /tiktok to the end for webhook URL" -ForegroundColor White
}
