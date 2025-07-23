# 👻 Haunted Dashboard & Phase IV Services Launcher
Write-Host "👻 Starting Haunted Dashboard and Phase IV Services" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Start Dashboard
Write-Host "Starting Dashboard Server on port 3002..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\dashboard"
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Normal

Start-Sleep 3
Set-Location $PSScriptRoot

# Start Phase IV Services
Write-Host "Starting Phase IV Services..." -ForegroundColor Yellow

Write-Host "  🏆 Creator Leaderboards (port 8085)..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "creator-leaderboards.js" -WindowStyle Normal

Write-Host "  🧬 Fragment Remix Engine (port 8086)..." -ForegroundColor Green  
Start-Process -FilePath "node" -ArgumentList "fragment-remix-engine.js" -WindowStyle Normal

Write-Host "  💰 Revenue Multipliers (port 8087)..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "revenue-multipliers.js" -WindowStyle Normal

Write-Host "  🌐 Multi-Platform Dispatcher (port 8088)..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "multi-platform-dispatcher.js" -WindowStyle Normal

Write-Host "  🧠 Sentiment & Lore Evolution (port 8089)..." -ForegroundColor Green
Start-Process -FilePath "node" -ArgumentList "sentiment-lore-evolution.js" -WindowStyle Normal

Write-Host ""
Write-Host "✅ All services starting..." -ForegroundColor Green
Write-Host ""
Write-Host "Service URLs:" -ForegroundColor Cyan
Write-Host "🌐 Dashboard: http://localhost:3002" -ForegroundColor White
Write-Host "📊 Creator Leaderboards: http://localhost:8085/stats" -ForegroundColor White
Write-Host "🧬 Fragment Remix: http://localhost:8086/stats" -ForegroundColor White
Write-Host "💰 Revenue Multipliers: http://localhost:8087/stats" -ForegroundColor White
Write-Host "🌎 Multi-Platform: http://localhost:8088/stats" -ForegroundColor White
Write-Host "🧠 Sentiment Evolution: http://localhost:8089/stats" -ForegroundColor White
Write-Host ""

Write-Host "Waiting 10 seconds for services to initialize..." -ForegroundColor Yellow
Start-Sleep 10

Write-Host "Checking service status..." -ForegroundColor Yellow
node check-phase-iv.js

Write-Host ""
Write-Host "🎉 Phase IV: Scale the Haunt is operational!" -ForegroundColor Green
Write-Host "👻 Visit the dashboard at http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to continue"
