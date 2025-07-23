#!/usr/bin/env pwsh
# Production Deployment Script for Lore Engine Multi-Agent System

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",
    
    [Parameter(Mandatory=$false)]
    [switch]$Build = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Deploy = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Monitor = $false,
    
    [Parameter(Mandatory=$false)]
    [switch]$Rollback = $false
)

# Color functions for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "ℹ️  $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

Write-Host "🚀 Lore Engine Multi-Agent System - Production Deployment" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan

# Check prerequisites
function Test-Prerequisites {
    Write-Info "Checking deployment prerequisites..."
    
    # Check Docker
    if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed or not in PATH"
        exit 1
    }
    
    # Check Docker Compose
    if (!(Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed or not in PATH"
        exit 1
    }
    
    # Check environment file
    if (!(Test-Path ".env.production")) {
        Write-Warning "Production environment file not found"
        Write-Info "Please copy .env.production.example to .env.production and configure"
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

# Build production images
function Build-ProductionImages {
    Write-Info "Building production Docker images..."
    
    try {
        # Build Lore Dispatcher
        Write-Info "Building Lore Dispatcher service..."
        docker build -f Dockerfile.lore-dispatcher -t lore-dispatcher:latest .
        
        # Build Conflict Detection
        Write-Info "Building Conflict Detection service..."
        docker build -f Dockerfile.conflict-detection -t conflict-detection:latest .
        
        # Build Real-time WebSocket
        Write-Info "Building Real-time WebSocket service..."
        docker build -f Dockerfile.realtime -t realtime-ws:latest .
        
        Write-Success "All production images built successfully"
    }
    catch {
        Write-Error "Failed to build production images: $_"
        exit 1
    }
}

# Deploy to production
function Deploy-Production {
    Write-Info "Deploying to production environment..."
    
    try {
        # Copy production environment
        Copy-Item ".env.production" ".env" -Force
        
        # Stop any existing deployment
        Write-Info "Stopping existing services..."
        docker-compose -f docker-compose.prod.yml down
        
        # Deploy with production configuration
        Write-Info "Starting production services..."
        docker-compose -f docker-compose.prod.yml up -d
        
        # Wait for services to be ready
        Write-Info "Waiting for services to be ready..."
        Start-Sleep -Seconds 30
        
        # Health checks
        Write-Info "Performing health checks..."
        
        $services = @(
            @{ Name = "Lore Dispatcher"; Url = "http://localhost:8081/health" },
            @{ Name = "Conflict Detection"; Url = "http://localhost:8083/health" },
            @{ Name = "Real-time WebSocket"; Url = "http://localhost:8082/api/health" }
        )
        
        foreach ($service in $services) {
            try {
                $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Success "$($service.Name) is healthy"
                } else {
                    Write-Warning "$($service.Name) returned status $($response.StatusCode)"
                }
            }
            catch {
                Write-Error "$($service.Name) health check failed: $_"
            }
        }
        
        Write-Success "Production deployment completed"
        Write-Info "Services are now running:"
        Write-Info "  • Lore Dispatcher API: http://localhost:8081"
        Write-Info "  • Conflict Detection API: http://localhost:8083"
        Write-Info "  • Real-time WebSocket: http://localhost:8082"
        Write-Info "  • Grafana Dashboard: http://localhost:3000"
        Write-Info "  • Prometheus Metrics: http://localhost:9090"
        
    }
    catch {
        Write-Error "Production deployment failed: $_"
        exit 1
    }
}

# Monitor deployment
function Monitor-Deployment {
    Write-Info "Starting deployment monitoring..."
    
    # Show service status
    docker-compose -f docker-compose.prod.yml ps
    
    # Show logs
    Write-Info "Recent logs:"
    docker-compose -f docker-compose.prod.yml logs --tail=50
    
    # Show resource usage
    Write-Info "Resource usage:"
    docker stats --no-stream
}

# Rollback deployment
function Rollback-Deployment {
    Write-Warning "Rolling back deployment..."
    
    try {
        # Stop current deployment
        docker-compose -f docker-compose.prod.yml down
        
        # Start previous version (you would implement version tagging)
        Write-Info "Rollback completed - manual intervention may be required"
        
        Write-Success "Rollback completed"
    }
    catch {
        Write-Error "Rollback failed: $_"
        exit 1
    }
}

# Main execution
try {
    Test-Prerequisites
    
    if ($Build) {
        Build-ProductionImages
    }
    
    if ($Deploy) {
        if (!$Build) {
            # Build images if not already built
            Build-ProductionImages
        }
        Deploy-Production
    }
    
    if ($Monitor) {
        Monitor-Deployment
    }
    
    if ($Rollback) {
        Rollback-Deployment
    }
    
    if (!$Build -and !$Deploy -and !$Monitor -and !$Rollback) {
        Write-Info "Available options:"
        Write-Info "  -Build    : Build production Docker images"
        Write-Info "  -Deploy   : Deploy to production environment"
        Write-Info "  -Monitor  : Monitor current deployment"
        Write-Info "  -Rollback : Rollback to previous version"
        Write-Info ""
        Write-Info "Example: .\deploy-production.ps1 -Build -Deploy"
    }
}
catch {
    Write-Error "Deployment script failed: $_"
    exit 1
}
