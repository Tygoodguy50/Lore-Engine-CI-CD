Write-Host "🔍 Testing TikTok Webhook Ports..." -ForegroundColor Cyan

Write-Host "`nTesting Port 443 (HTTPS)..." -ForegroundColor Yellow
$test443 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($test443) {
    Write-Host "✅ Port 443 WORKS - TikTok can reach HTTPS!" -ForegroundColor Green
} else {
    Write-Host "❌ Port 443 BLOCKED - Router config needed" -ForegroundColor Red
}

Write-Host "`nTesting Port 80 (HTTP)..." -ForegroundColor Yellow  
$test80 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80 -InformationLevel Quiet -WarningAction SilentlyContinue
if ($test80) {
    Write-Host "✅ Port 80 WORKS - TikTok can reach HTTP!" -ForegroundColor Green
} else {
    Write-Host "❌ Port 80 BLOCKED - Router config needed" -ForegroundColor Red
}

Write-Host "`n🎯 Router Setup:" -ForegroundColor Cyan
Write-Host "1. Device: Your computer (192.168.0.187)"
Write-Host "2. Port 443, Protocol TCP"  
Write-Host "3. Port 80, Protocol TCP"
Write-Host "4. Save and reboot router"
Write-Host "`n🔗 TikTok URL: https://api.phantomgear.it.com/tiktok"
