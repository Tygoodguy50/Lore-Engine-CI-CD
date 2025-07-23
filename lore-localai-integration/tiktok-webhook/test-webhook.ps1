# Test TikTok Webhook Server
Write-Host "🧪 Testing TikTok Webhook Server..." -ForegroundColor Cyan
Write-Host ""

# Test local health endpoint
Write-Host "1️⃣ Testing local health endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "https://localhost/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ Health check passed:" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "   Time: $($healthResponse.time)" -ForegroundColor White
} catch {
    Write-Host "❌ Local health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test webhook endpoint
Write-Host "2️⃣ Testing webhook endpoint..." -ForegroundColor Yellow
try {
    $webhookResponse = Invoke-RestMethod -Uri "https://localhost/api/webhooks/tiktok" -Method GET -SkipCertificateCheck
    Write-Host "✅ Webhook endpoint accessible:" -ForegroundColor Green
    Write-Host "   Service: $($webhookResponse.service)" -ForegroundColor White
    Write-Host "   Status: $($webhookResponse.status)" -ForegroundColor White
} catch {
    Write-Host "❌ Webhook endpoint test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test with challenge parameter (TikTok verification)
Write-Host "3️⃣ Testing TikTok verification challenge..." -ForegroundColor Yellow
try {
    $challengeResponse = Invoke-RestMethod -Uri "https://localhost/api/webhooks/tiktok?challenge=test123" -Method GET -SkipCertificateCheck
    Write-Host "✅ Challenge response:" -ForegroundColor Green
    Write-Host "   Response: $challengeResponse" -ForegroundColor White
} catch {
    Write-Host "❌ Challenge test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test external connectivity (if server is running)
Write-Host "4️⃣ Testing external domain resolution..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "phantomgear.it.com" -Type A
    if ($dnsResult) {
        Write-Host "✅ Domain resolves to: $($dnsResult.IPAddress)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ DNS resolution failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Magenta
Write-Host "   1. Ensure port forwarding is configured (TCP 80→192.168.0.187:80, TCP 443→192.168.0.187:443)" -ForegroundColor White
Write-Host "   2. Start the webhook server: .\start-webhook.ps1" -ForegroundColor White
Write-Host "   3. Test from TikTok Developer Console" -ForegroundColor White
Write-Host "   4. Monitor logs for incoming webhook requests" -ForegroundColor White
