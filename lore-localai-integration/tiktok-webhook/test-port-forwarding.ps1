# Test External Access After Port Forwarding
Write-Host "Testing external access after port forwarding configuration..." -ForegroundColor Yellow

# Test port 443
Write-Host "`n1. Testing HTTPS (port 443)..." -ForegroundColor Cyan
$test443 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443 -WarningAction SilentlyContinue
if ($test443.TcpTestSucceeded) {
    Write-Host "   ✅ Port 443 ACCESSIBLE externally!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 443 still blocked" -ForegroundColor Red
}

# Test port 80  
Write-Host "`n2. Testing HTTP (port 80)..." -ForegroundColor Cyan
$test80 = Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80 -WarningAction SilentlyContinue
if ($test80.TcpTestSucceeded) {
    Write-Host "   ✅ Port 80 ACCESSIBLE externally!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 80 still blocked" -ForegroundColor Red
}

Write-Host "`n🎯 Results Summary:" -ForegroundColor Magenta
if ($test443.TcpTestSucceeded -or $test80.TcpTestSucceeded) {
    Write-Host "   ✅ Port forwarding is working!" -ForegroundColor Green
    Write-Host "   🎬 TikTok webhook URLs should now work:" -ForegroundColor Yellow
    if ($test443.TcpTestSucceeded) {
        Write-Host "      https://api.phantomgear.it.com/tiktok" -ForegroundColor White
    }
    if ($test80.TcpTestSucceeded) {
        Write-Host "      http://api.phantomgear.it.com/tiktok" -ForegroundColor White
    }
} else {
    Write-Host "   ❌ Port forwarding still not working" -ForegroundColor Red
    Write-Host "   🔧 Check router configuration and reboot router" -ForegroundColor Yellow
}

Write-Host "`n📞 Router Admin:" -ForegroundColor Cyan
Write-Host "   🌐 Router IP: http://192.168.0.1" -ForegroundColor White
Write-Host "   💻 Your IP: 192.168.0.187" -ForegroundColor White
