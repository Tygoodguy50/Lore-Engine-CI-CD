Write-Host ""
Write-Host "    👻 HAUNTED DASHBOARD LAUNCHER" -ForegroundColor Magenta
Write-Host "    ============================" -ForegroundColor Magenta
Write-Host ""

Write-Host "🔍 Checking for existing dashboard server..." -ForegroundColor Yellow
$existingProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*dashboard*" -or $_.ProcessName -eq "node" }

if ($existingProcess) {
    Write-Host "⚠️  Found existing Node.js processes" -ForegroundColor Yellow
    Write-Host "💡 You may need to stop them first with: taskkill /F /IM node.exe" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🚀 Starting Haunted Dashboard Server..." -ForegroundColor Green
Write-Host "📂 Working Directory: $(Get-Location)" -ForegroundColor White
Write-Host ""

# Check if dashboard file exists
if (-not (Test-Path "haunted-dashboard.html")) {
    Write-Host "❌ ERROR: haunted-dashboard.html not found!" -ForegroundColor Red
    Write-Host "📍 Current location: $(Get-Location)" -ForegroundColor Yellow
    Write-Host "📂 Available files:" -ForegroundColor Yellow
    Get-ChildItem *.html | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor White }
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "✅ Dashboard file found: haunted-dashboard.html" -ForegroundColor Green
Write-Host ""
Write-Host "🎭 Starting server on port 3002..." -ForegroundColor Cyan
Write-Host ""

# Start the Node.js server
try {
    $process = Start-Process -FilePath "node" -ArgumentList "dashboard-server-verbose.js" -NoNewWindow -PassThru
    
    Write-Host "✅ Dashboard server started! (PID: $($process.Id))" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔗 ACCESS YOUR DASHBOARD:" -ForegroundColor Magenta
    Write-Host "   http://localhost:3002" -ForegroundColor White
    Write-Host ""
    Write-Host "⏱️  Waiting 3 seconds for server to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Test the connection
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3002" -TimeoutSec 5 -UseBasicParsing
        Write-Host "✅ Dashboard is responding! Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 SUCCESS! Your dashboard is now accessible!" -ForegroundColor Green
        Write-Host "🎭 Phase IV Haunted Empire Dashboard is LIVE!" -ForegroundColor Magenta
        
        # Try to open browser
        Write-Host ""
        Write-Host "🌐 Opening dashboard in browser..." -ForegroundColor Cyan
        Start-Process "http://localhost:3002"
        
    } catch {
        Write-Host "⚠️  Server starting but not responding yet" -ForegroundColor Yellow
        Write-Host "💡 Try accessing http://localhost:3002 in a few seconds" -ForegroundColor Cyan
    }
    
} catch {
    Write-Host "❌ Failed to start dashboard server!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 To stop the dashboard: Press Ctrl+C or close the console" -ForegroundColor Gray
Write-Host "📊 Dashboard shows live data from your Phase IV services" -ForegroundColor Gray
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
