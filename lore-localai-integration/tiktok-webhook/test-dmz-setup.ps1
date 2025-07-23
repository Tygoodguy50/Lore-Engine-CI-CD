# Test DMZ Setup for TikTok Webhook
# Run this after setting up DMZ in Cox app

Write-Host "🚀 Testing DMZ Setup for TikTok Webhook..." -ForegroundColor Green
Write-Host ""

# Get current public IP
Write-Host "📡 Checking Public IP..." -ForegroundColor Yellow
try {
    $publicIP = (Invoke-RestMethod -Uri "http://api.ipify.org" -TimeoutSec 10).Trim()
    Write-Host "✅ Public IP: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to get public IP" -ForegroundColor Red
    $publicIP = "UNKNOWN"
}

Write-Host ""

# Test local webhook server
Write-Host "🔧 Testing Local Webhook Server..." -ForegroundColor Yellow
try {
    $localTest = Invoke-WebRequest -Uri "http://localhost:8443/tiktok" -TimeoutSec 5
    Write-Host "✅ Local server responding: $($localTest.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Local server not responding - is tiktok-webhook-v3.exe running?" -ForegroundColor Red
    Write-Host "   Run: .\tiktok-webhook-v3.exe" -ForegroundColor Yellow
}

Write-Host ""

# Test external access via domain (HTTPS)
Write-Host "🌐 Testing External HTTPS Access..." -ForegroundColor Yellow
try {
    $httpsTest = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 8443 -WarningAction SilentlyContinue
    if ($httpsTest.TcpTestSucceeded) {
        Write-Host "✅ HTTPS port 8443 accessible from external" -ForegroundColor Green
        
        # Try actual webhook request
        try {
            $webhookTest = Invoke-WebRequest -Uri "https://api.phantomgear.it.com:8443/tiktok" -TimeoutSec 10 -SkipCertificateCheck
            Write-Host "✅ HTTPS webhook responding: $($webhookTest.StatusCode)" -ForegroundColor Green
            Write-Host "🎉 TikTok webhook URL READY: https://api.phantomgear.it.com:8443/tiktok" -ForegroundColor Green -BackgroundColor Black
        } catch {
            Write-Host "⚠️  Port accessible but webhook not responding" -ForegroundColor Yellow
            Write-Host "   Check if server is running with HTTPS enabled" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ HTTPS port 8443 not accessible - DMZ may not be configured" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to test HTTPS access" -ForegroundColor Red
}

Write-Host ""

# Test external access via domain (HTTP)
Write-Host "🌐 Testing External HTTP Access..." -ForegroundColor Yellow
try {
    $httpTest = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 8080 -WarningAction SilentlyContinue
    if ($httpTest.TcpTestSucceeded) {
        Write-Host "✅ HTTP port 8080 accessible from external" -ForegroundColor Green
        
        # Try actual webhook request
        try {
            $webhookTest = Invoke-WebRequest -Uri "http://api.phantomgear.it.com:8080/tiktok" -TimeoutSec 10
            Write-Host "✅ HTTP webhook responding: $($webhookTest.StatusCode)" -ForegroundColor Green
            Write-Host "🎉 Backup webhook URL: http://api.phantomgear.it.com:8080/tiktok" -ForegroundColor Green -BackgroundColor Black
        } catch {
            Write-Host "⚠️  Port accessible but webhook not responding" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ HTTP port 8080 not accessible - DMZ may not be configured" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Failed to test HTTP access" -ForegroundColor Red
}

Write-Host ""

# Check if webhook server is running
Write-Host "🔍 Checking Webhook Server Status..." -ForegroundColor Yellow
$webhookProcess = Get-Process -Name "tiktok-webhook-v3" -ErrorAction SilentlyContinue
if ($webhookProcess) {
    Write-Host "✅ Webhook server running (PID: $($webhookProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "❌ Webhook server not running!" -ForegroundColor Red
    Write-Host "   Start with: .\tiktok-webhook-v3.exe" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 DMZ Setup Instructions:" -ForegroundColor Cyan
Write-Host "1. Open Cox Panoramic WiFi app" -ForegroundColor White
Write-Host "2. Go to Advanced Settings" -ForegroundColor White
Write-Host "3. Find 'DMZ' or 'Exposed Host' setting" -ForegroundColor White
Write-Host "4. Set DMZ Host to: 192.168.0.187" -ForegroundColor White
Write-Host "5. Enable DMZ and save" -ForegroundColor White
Write-Host "6. Wait 2-3 minutes then run this test again" -ForegroundColor White
Write-Host ""

if ($httpsTest.TcpTestSucceeded -or $httpTest.TcpTestSucceeded) {
    Write-Host "🎯 READY FOR TIKTOK INTEGRATION!" -ForegroundColor Green -BackgroundColor Black
    Write-Host "Use webhook URL: https://api.phantomgear.it.com:8443/tiktok" -ForegroundColor Green
} else {
    Write-Host "🔧 DMZ needs to be configured in Cox app" -ForegroundColor Yellow
    Write-Host "Once DMZ is set up, external access will work immediately" -ForegroundColor Yellow
}
