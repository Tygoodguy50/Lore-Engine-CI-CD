Write-Host ""
Write-Host "    ████████████████████████████████████████" -ForegroundColor Magenta
Write-Host "    ██                                    ██" -ForegroundColor Magenta
Write-Host "    ██      🎭 PHASE IV COMPLETE         ██" -ForegroundColor Magenta
Write-Host "    ██    Scale The Haunt - Backend       ██" -ForegroundColor Magenta
Write-Host "    ██                                    ██" -ForegroundColor Magenta
Write-Host "    ████████████████████████████████████████" -ForegroundColor Magenta
Write-Host ""

Write-Host "🚀 Starting all Phase IV backend services..." -ForegroundColor Green
Write-Host "   This will launch 5 microservices on ports 8085-8089" -ForegroundColor Yellow
Write-Host ""

# Start each service in a separate process
$services = @(
    @{ Name="Creator Leaderboards"; File="creator-leaderboards.js"; Port=8085; Icon="👑" },
    @{ Name="Fragment Remix Engine"; File="fragment-remix-engine.js"; Port=8086; Icon="🧬" },
    @{ Name="Revenue Multipliers"; File="revenue-multipliers.js"; Port=8087; Icon="💰" },
    @{ Name="Multi-Platform Dispatcher"; File="multi-platform-dispatcher.js"; Port=8088; Icon="🌐" },
    @{ Name="Sentiment & Lore Evolution"; File="sentiment-lore-evolution.js"; Port=8089; Icon="🧠" }
)

$runningServices = @()

foreach ($service in $services) {
    Write-Host "$($service.Icon) Starting $($service.Name)..." -ForegroundColor Cyan
    
    # Check if port is available
    $portCheck = netstat -an | Select-String ":$($service.Port) "
    if ($portCheck) {
        Write-Host "   ⚠️  Port $($service.Port) already in use - service may already be running" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Start the Node.js service
        $process = Start-Process -FilePath "node" -ArgumentList $service.File -WindowStyle Minimized -PassThru
        
        if ($process) {
            Write-Host "   ✅ $($service.Name) started successfully!" -ForegroundColor Green
            Write-Host "   🔗 Available at: http://localhost:$($service.Port)" -ForegroundColor White
            $runningServices += $service
            Start-Sleep -Seconds 2
        }
    }
    catch {
        Write-Host "   ❌ Failed to start $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Magenta
Write-Host "📊 PHASE IV LAUNCH COMPLETE!" -ForegroundColor Green
Write-Host "   Services Started: $($runningServices.Count)/$($services.Count)" -ForegroundColor White
Write-Host ""

if ($runningServices.Count -gt 0) {
    Write-Host "✅ OPERATIONAL SERVICES:" -ForegroundColor Green
    foreach ($service in $runningServices) {
        Write-Host "   $($service.Icon) $($service.Name): http://localhost:$($service.Port)/stats" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "🎭 DASHBOARD INTEGRATION:" -ForegroundColor Magenta
    Write-Host "   👻 Haunted Dashboard: http://localhost:3002" -ForegroundColor White
    Write-Host "   🔄 Dashboard will now switch from mock to LIVE data" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🎉 Phase IV: Scale the Haunt is FULLY OPERATIONAL!" -ForegroundColor Green
} else {
    Write-Host "❌ No services started successfully." -ForegroundColor Red
}

Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
