# Test DMZ Setup for TikTok Webhook
Write-Host "Testing DMZ Setup for TikTok Webhook..." -ForegroundColor Green

# Get current public IP
Write-Host "Checking Public IP..." -ForegroundColor Yellow
try {
    $publicIP = (Invoke-RestMethod -Uri "http://api.ipify.org" -TimeoutSec 10).Trim()
    Write-Host "Public IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "Failed to get public IP" -ForegroundColor Red
}

# Test local webhook server
Write-Host "Testing Local Webhook Server..." -ForegroundColor Yellow
try {
    $localTest = Invoke-WebRequest -Uri "http://localhost:8080/tiktok" -TimeoutSec 5
    Write-Host "Local server responding: $($localTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Local server not responding - is tiktok-webhook-v3.exe running?" -ForegroundColor Red
}

# Test external access
Write-Host "Testing External Access..." -ForegroundColor Yellow
try {
    $httpsTest = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 8443 -WarningAction SilentlyContinue
    if ($httpsTest.TcpTestSucceeded) {
        Write-Host "HTTPS port 8443 accessible from external" -ForegroundColor Green
        Write-Host "TikTok webhook URL READY: https://api.phantomgear.it.com:8443/tiktok" -ForegroundColor Green
    } else {
        Write-Host "HTTPS port 8443 not accessible - DMZ not configured" -ForegroundColor Red
    }
} catch {
    Write-Host "Failed to test HTTPS access" -ForegroundColor Red
}

# Check webhook server status
Write-Host "Checking Webhook Server Status..." -ForegroundColor Yellow
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if ($webhookProcess) {
    Write-Host "Webhook server running (PID: $($webhookProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "Webhook server not running!" -ForegroundColor Red
}

Write-Host ""
Write-Host "DMZ Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Open Cox Panoramic WiFi app"
Write-Host "2. Go to Advanced Settings"
Write-Host "3. Find 'DMZ' or 'Exposed Host' setting"
Write-Host "4. Set DMZ Host to: 192.168.0.187"
Write-Host "5. Enable DMZ and save"
Write-Host "6. Wait 2-3 minutes then run this test again"
