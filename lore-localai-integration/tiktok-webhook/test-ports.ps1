# Test External Port Access
Write-Host "🔍 Testing TikTok Webhook External Access..." -ForegroundColor Cyan

Write-Host "`n1. Testing HTTPS (443)..." -ForegroundColor Yellow
try {
    $result443 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443 -InformationLevel Quiet
    if ($result443) {
        Write-Host "   ✅ Port 443 ACCESSIBLE" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 443 BLOCKED - Need router config" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Port 443 BLOCKED - Need router config" -ForegroundColor Red
}

Write-Host "`n2. Testing HTTP (80)..." -ForegroundColor Yellow  
try {
    $result80 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80 -InformationLevel Quiet
    if ($result80) {
        Write-Host "   ✅ Port 80 ACCESSIBLE" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Port 80 BLOCKED - Need router config" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Port 80 BLOCKED - Need router config" -ForegroundColor Red
}

Write-Host "`n🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open router admin: http://192.168.0.1" 
Write-Host "   2. Configure port forwarding (see URGENT_ROUTER_CONFIG.md)"
Write-Host "   3. Reboot router"
Write-Host "   4. Re-run this test"
Write-Host "   5. Add TikTok webhook URL: https://api.phantomgear.it.com/tiktok"
