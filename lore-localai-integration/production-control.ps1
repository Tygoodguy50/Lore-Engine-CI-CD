#!/usr/bin/env pwsh
# Production Startup Script for Lore Engine Multi-Agent System

param(
    [Parameter(Mandatory=$false)]
    [switch]$StartAll = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$StopAll = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Status = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Logs = $false
)

# Color functions for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Host "🚀 Lore Engine Multi-Agent System - Production Control" -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan

# Service configuration
$services = @(
    @{
        Name = "Lore Dispatcher"
        Script = "lore-dispatcher-server.js"
        Port = 8084
        HealthUrl = "http://localhost:8084/health"
        ProcessVar = "LoreDispatcherProcess"
    },
    @{
        Name = "Conflict Detection"
        Script = "conflict-api-server.js"
        Port = 8083
        HealthUrl = "http://localhost:8083/health"
        ProcessVar = "ConflictDetectionProcess"
    },
    @{
        Name = "Real-time WebSocket"
        Script = "realtime-standalone.js"
        Port = 8082
        HealthUrl = "http://localhost:8082/api/health"
        ProcessVar = "RealtimeProcess"
    }
)

# Start all services
function Start-AllServices {
    Write-Info "Starting all Lore Engine services..."
    
    foreach ($service in $services) {
        Write-Info "Starting $($service.Name)..."
        
        # Check if port is already in use
        $portCheck = netstat -ano | findstr ":$($service.Port)"
        if ($portCheck) {
            Write-Warning "$($service.Name) port $($service.Port) is already in use"
            continue
        }
        
        # Start the service
        try {
            $process = Start-Process -FilePath "node" -ArgumentList $service.Script -NoNewWindow -PassThru
            Write-Success "$($service.Name) started (PID: $($process.Id))"
            
            # Wait a moment for startup
            Start-Sleep -Seconds 3
            
            # Health check
            try {
                $response = Invoke-WebRequest -Uri $service.HealthUrl -Method GET -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Success "$($service.Name) health check passed"
                }
            }
            catch {
                Write-Warning "$($service.Name) health check failed, but service may still be starting"
            }
        }
        catch {
            Write-Error "Failed to start $($service.Name): $_"
        }
    }
    
    Write-Success "All services startup completed!"
    Write-Info "Service URLs:"
    Write-Info "  • Lore Dispatcher API: http://localhost:8084"
    Write-Info "  • Conflict Detection API: http://localhost:8083" 
    Write-Info "  • Real-time WebSocket: http://localhost:8082"
}

# Stop all services
function Stop-AllServices {
    Write-Info "Stopping all Lore Engine services..."
    
    foreach ($service in $services) {
        Write-Info "Stopping $($service.Name)..."
        
        # Find processes on the port
        $portProcesses = netstat -ano | findstr ":$($service.Port)" | ForEach-Object {
            if ($_ -match "\s+(\d+)$") {
                $matches[1]
            }
        }
        
        foreach ($pid in $portProcesses) {
            try {
                Stop-Process -Id $pid -Force
                Write-Success "$($service.Name) stopped (PID: $pid)"
            }
            catch {
                Write-Warning "Could not stop process $pid for $($service.Name)"
            }
        }
    }
    
    Write-Success "All services stopped!"
}

# Check service status
function Get-ServiceStatus {
    Write-Info "Checking Lore Engine service status..."
    
    foreach ($service in $services) {
        Write-Host "`n$($service.Name):" -ForegroundColor Yellow
        
        # Check if port is listening
        $portCheck = netstat -ano | findstr ":$($service.Port)"
        if ($portCheck) {
            Write-Success "  Port $($service.Port): LISTENING"
            
            # Health check
            try {
                $response = Invoke-WebRequest -Uri $service.HealthUrl -Method GET -TimeoutSec 5
                if ($response.StatusCode -eq 200) {
                    Write-Success "  Health Check: HEALTHY"
                    $healthData = $response.Content | ConvertFrom-Json
                    if ($healthData.service) {
                        Write-Info "  Service: $($healthData.service)"
                    }
                    if ($healthData.timestamp) {
                        Write-Info "  Last Update: $($healthData.timestamp)"
                    }
                }
            }
            catch {
                Write-Warning "  Health Check: FAILED ($_)"
            }
        }
        else {
            Write-Error "  Port $($service.Port): NOT LISTENING"
        }
    }
}

# Show service logs
function Show-ServiceLogs {
    Write-Info "Service logs are displayed in their respective terminal windows"
    Write-Info "To view logs, check the terminal windows where services are running"
    
    # Show recent system events
    Write-Info "`nRecent system activity:"
    Get-WinEvent -FilterHashtable @{LogName='Application'; StartTime=(Get-Date).AddMinutes(-30)} -MaxEvents 5 -ErrorAction SilentlyContinue | 
    ForEach-Object {
        if ($_.Message -like "*node*" -or $_.Message -like "*lore*") {
            Write-Info "  [$($_.TimeCreated)] $($_.LevelDisplayName): $($_.Message.Substring(0, [Math]::Min(100, $_.Message.Length)))..."
        }
    }
}

# Run integration tests
function Test-AllServices {
    Write-Info "Running integration tests..."
    
    # Test Lore Dispatcher
    Write-Info "Testing Lore Dispatcher..."
    try {
        go run test-lore-dispatcher.go
        Write-Success "Lore Dispatcher tests passed"
    }
    catch {
        Write-Error "Lore Dispatcher tests failed: $_"
    }
    
    # Test Conflict Detection
    Write-Info "Testing Conflict Detection..."
    try {
        go run run-go-test.go
        Write-Success "Conflict Detection tests passed"
    }
    catch {
        Write-Error "Conflict Detection tests failed: $_"
    }
}

# Main execution
try {
    if ($StartAll) {
        Start-AllServices
    }
    elseif ($StopAll) {
        Stop-AllServices
    }
    elseif ($Status) {
        Get-ServiceStatus
    }
    elseif ($Logs) {
        Show-ServiceLogs
    }
    else {
        Write-Info "Lore Engine Multi-Agent System Control Panel"
        Write-Info "Available commands:"
        Write-Info "  -StartAll : Start all services"
        Write-Info "  -StopAll  : Stop all services"
        Write-Info "  -Status   : Check service status"
        Write-Info "  -Logs     : Show service logs"
        Write-Info ""
        Write-Info "Examples:"
        Write-Info "  .\production-control.ps1 -StartAll"
        Write-Info "  .\production-control.ps1 -Status"
        Write-Info "  .\production-control.ps1 -StopAll"
        
        Write-Info "`nQuick status check:"
        Get-ServiceStatus
    }
}
catch {
    Write-Error "Production control script failed: $_"
    exit 1
}
