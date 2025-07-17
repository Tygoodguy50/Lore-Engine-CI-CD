# Manual GitHub Secrets Validation Guide

Write-Host "GitHub Secrets Configuration Check" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Since you manually configured your GitHub secrets, here's how to verify:" -ForegroundColor Blue
Write-Host ""

Write-Host "1. Go to your GitHub repository settings:" -ForegroundColor Yellow
Write-Host "   https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Verify these 7 secrets are configured:" -ForegroundColor Yellow
Write-Host "   ✓ PROD_HOST        (your production server IP/hostname)" -ForegroundColor Green
Write-Host "   ✓ PROD_USER        (SSH username for production, e.g., 'ubuntu')" -ForegroundColor Green
Write-Host "   ✓ PROD_SSH_KEY     (SSH private key for production server)" -ForegroundColor Green
Write-Host "   ✓ STAGING_HOST     (your staging server IP/hostname)" -ForegroundColor Green
Write-Host "   ✓ STAGING_USER     (SSH username for staging, e.g., 'ubuntu')" -ForegroundColor Green
Write-Host "   ✓ STAGING_SSH_KEY  (SSH private key for staging server)" -ForegroundColor Green
Write-Host "   ✓ DISCORD_WEBHOOK_URL (Discord webhook for notifications)" -ForegroundColor Green
Write-Host ""

Write-Host "3. Test your Discord webhook:" -ForegroundColor Yellow
Write-Host "   Open PowerShell and run this command (replace with your webhook URL):" -ForegroundColor Gray
Write-Host '   Invoke-RestMethod -Uri "YOUR_DISCORD_WEBHOOK_URL" -Method Post -Body (@{content="Test from Lore Engine setup"} | ConvertTo-Json) -ContentType "application/json"' -ForegroundColor Cyan
Write-Host ""

Write-Host "4. Test SSH access to your servers:" -ForegroundColor Yellow
Write-Host "   ssh -i path/to/your/private/key username@your-server-ip" -ForegroundColor Gray
Write-Host ""

Write-Host "5. Ready to deploy!" -ForegroundColor Green
Write-Host "   Once secrets are verified, push code to trigger deployment:" -ForegroundColor White
Write-Host "   git push origin develop  # Deploy to staging" -ForegroundColor Gray
Write-Host "   git push origin main     # Deploy to production" -ForegroundColor Gray
Write-Host ""

Write-Host "6. Monitor deployment:" -ForegroundColor Yellow
Write-Host "   GitHub Actions: https://github.com/YOUR_USERNAME/YOUR_REPO/actions" -ForegroundColor Gray
Write-Host "   Discord: Check your webhook channel for notifications" -ForegroundColor Gray

Write-Host ""
Write-Host "Great job setting up the secrets manually! Your deployment pipeline is ready." -ForegroundColor Green
