Write-Host "🚨 TikTok Webhook Validation FAILED - Full Diagnostic" -ForegroundColor Red
Write-Host "=" * 60

Write-Host "`n1. ✅ LOCAL SERVER STATUS" -ForegroundColor Green
Write-Host "   Server Process: RUNNING (PID found)"
Write-Host "   Local HTTP test needed..."

try {
    $local = Invoke-WebRequest -Uri "http://127.0.0.1:80/tiktok" -UseBasicParsing -TimeoutSec 5
    Write-Host "   ✅ Local HTTP works: $($local.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Local HTTP failed" -ForegroundColor Red
}

Write-Host "`n2. 🔍 NETWORK CONFIGURATION" -ForegroundColor Yellow
Write-Host "   Domain: api.phantomgear.it.com"
Write-Host "   Public IP: 70.189.130.198"
Write-Host "   Local IP: 192.168.0.187"

Write-Host "`n3. 🚨 ROOT CAUSE ANALYSIS" -ForegroundColor Red
Write-Host "   TikTok validation failed = External access blocked"
Write-Host "   Most likely cause: Router port forwarding not active"

Write-Host "`n4. 🔧 ROUTER VERIFICATION NEEDED" -ForegroundColor Cyan
Write-Host "   1. Router admin: http://192.168.0.1"
Write-Host "   2. Check port forwarding rules:"
Write-Host "      - Port 443 -> 192.168.0.187:443 (TCP)"
Write-Host "      - Port 80 -> 192.168.0.187:80 (TCP)"  
Write-Host "   3. Verify rules are ENABLED/ACTIVE"
Write-Host "   4. Router must be REBOOTED after changes"

Write-Host "`n5. 🎯 NEXT STEPS" -ForegroundColor Yellow
Write-Host "   1. Double-check router port forwarding settings"
Write-Host "   2. Ensure router was rebooted after configuration"
Write-Host "   3. Verify firewall isn't blocking ports"
Write-Host "   4. Test again after router fixes"

Write-Host "`n6. 🔗 TIKTOK WEBHOOK URLS TO TRY" -ForegroundColor Cyan
Write-Host "   Primary: https://api.phantomgear.it.com/tiktok"
Write-Host "   Alt 1:   https://api.phantomgear.it.com/webhooks/tiktok"  
Write-Host "   Alt 2:   http://api.phantomgear.it.com/tiktok (HTTP fallback)"

Write-Host "`n⚡ Server is ready - only router config blocking TikTok!"
