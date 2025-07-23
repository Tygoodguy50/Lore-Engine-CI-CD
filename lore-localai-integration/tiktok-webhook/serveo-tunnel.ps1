# Alternative Tunnel Solution - serveo.net

# Use serveo.net (free SSH tunneling service)
Write-Host "Setting up serveo.net tunnel for TikTok webhook..." -ForegroundColor Green

# Check if webhook server is running
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if ($webhookProcess) {
    Write-Host "Webhook server running (PID: $($webhookProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Starting webhook server..." -ForegroundColor Yellow
    Start-Process -FilePath ".\tiktok-webhook-v3.exe" -WindowStyle Minimized
    Start-Sleep -Seconds 3
}

Write-Host ""
Write-Host "Creating tunnel with serveo.net..." -ForegroundColor Cyan
Write-Host "This will create a public HTTPS URL for your webhook" -ForegroundColor Yellow
Write-Host ""

# Use SSH to create tunnel (if SSH is available)
try {
    Write-Host "Your webhook will be available at:" -ForegroundColor Green
    Write-Host "https://phantomgear.serveo.net/tiktok" -ForegroundColor White -BackgroundColor Green
    Write-Host ""
    Write-Host "Press Ctrl+C to stop the tunnel" -ForegroundColor Yellow
    Write-Host ""
    
    # Create SSH tunnel
    ssh -R phantomgear:80:localhost:8080 serveo.net
} catch {
    Write-Host "SSH not available or tunnel failed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual alternatives:" -ForegroundColor Yellow
    Write-Host "1. Download ngrok from https://ngrok.com/download" -ForegroundColor White
    Write-Host "2. Extract ngrok.exe to this folder" -ForegroundColor White  
    Write-Host "3. Run: .\ngrok.exe http 8443" -ForegroundColor White
    Write-Host "4. Copy the HTTPS URL shown" -ForegroundColor White
}
