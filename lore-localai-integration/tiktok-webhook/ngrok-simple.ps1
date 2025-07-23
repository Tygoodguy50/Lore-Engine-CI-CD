# Simple ngrok Setup for TikTok Webhook
Write-Host "Setting up ngrok tunnel for TikTok webhook..." -ForegroundColor Green

# Check if ngrok exists
if (Test-Path ".\ngrok.exe") {
    Write-Host "ngrok.exe found" -ForegroundColor Green
} else {
    Write-Host "Downloading ngrok..." -ForegroundColor Yellow
    try {
        $ngrokUrl = "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip"
        Invoke-WebRequest -Uri $ngrokUrl -OutFile "ngrok.zip"
        Expand-Archive -Path "ngrok.zip" -DestinationPath "." -Force
        Remove-Item "ngrok.zip"
        Write-Host "ngrok downloaded and extracted" -ForegroundColor Green
    } catch {
        Write-Host "Auto-download failed. Please download manually from https://ngrok.com/download" -ForegroundColor Red
        return
    }
}

# Check webhook server
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if (-not $webhookProcess) {
    Write-Host "Starting webhook server..." -ForegroundColor Yellow
    Start-Process -FilePath ".\tiktok-webhook-v3.exe" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "Starting ngrok tunnel..." -ForegroundColor Green
Write-Host "Your TikTok webhook URL will be shown below:" -ForegroundColor Cyan
Write-Host "Look for: https://XXXXX.ngrok-free.app" -ForegroundColor Yellow
Write-Host "Add /tiktok to the end for TikTok webhook" -ForegroundColor Yellow
Write-Host ""

# Start ngrok
& .\ngrok.exe http 8443
