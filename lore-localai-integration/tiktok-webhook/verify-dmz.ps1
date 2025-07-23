# Quick DMZ Verification for TikTok Webhook
Write-Host "Verifying DMZ Setup..." -ForegroundColor Green

# Test external HTTPS access
Write-Host "Testing external HTTPS access..." -ForegroundColor Yellow
try {
    $httpsTest = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 8443 -WarningAction SilentlyContinue
    if ($httpsTest.TcpTestSucceeded) {
        Write-Host "SUCCESS: HTTPS port 8443 accessible!" -ForegroundColor Green
        
        # Try webhook request
        try {
            $response = Invoke-WebRequest -Uri "https://api.phantomgear.it.com:8443/tiktok" -TimeoutSec 10 -SkipCertificateCheck
            Write-Host "SUCCESS: TikTok webhook responding! Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host ""
            Write-Host "TIKTOK WEBHOOK URL READY:" -ForegroundColor Green -BackgroundColor Black
            Write-Host "https://api.phantomgear.it.com:8443/tiktok" -ForegroundColor White -BackgroundColor Green
        } catch {
            Write-Host "Port accessible but webhook not responding: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "DMZ not working - port 8443 still blocked" -ForegroundColor Red
        Write-Host "Check DMZ configuration in Cox app" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "If DMZ is working, you can now add the TikTok webhook!" -ForegroundColor Cyan
