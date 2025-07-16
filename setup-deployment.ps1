# 🚀 Lore Engine Complete Deployment Script (PowerShell)
# This script sets up the entire deployment pipeline infrastructure

param(
    [string]$Environment = "production",
    [switch]$Help
)

# Color functions
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Blue
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
    exit 1
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning-Custom {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Configuration
$RepoRoot = $PSScriptRoot
$DeployEnv = $Environment
$DockerRegistry = "ghcr.io"
$ImageName = "lore-engine"

# Environment-specific configurations
switch ($DeployEnv) {
    "production" {
        $Port = 8080
        $EnvFile = ".env.production"
        $ServiceName = "lore-engine-production"
    }
    "staging" {
        $Port = 8081
        $EnvFile = ".env.staging"
        $ServiceName = "lore-engine-staging"
    }
    default {
        Write-Error-Custom "Invalid environment: $DeployEnv. Use 'production' or 'staging'"
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check if required tools are installed
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Docker is not installed"
    }
    
    if (-not (Get-Command bazel -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Bazel is not installed"
    }
    
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error-Custom "Git is not installed"
    }
    
    # Check if we're in a git repository
    if (-not (Test-Path ".git")) {
        Write-Error-Custom "Not in a git repository"
    }
    
    # Check if required files exist
    if (-not (Test-Path "BUILD.bazel")) {
        Write-Error-Custom "BUILD.bazel not found"
    }
    
    if (-not (Test-Path $EnvFile)) {
        Write-Error-Custom "$EnvFile not found"
    }
    
    if (-not (Test-Path "Dockerfile")) {
        Write-Error-Custom "Dockerfile not found"
    }
    
    Write-Success "Prerequisites check passed"
}

# Function to setup GitHub Actions secrets
function Show-GitHubSecretsSetup {
    Write-Log "Setting up GitHub Actions secrets..."
    
    Write-Host @"

📋 GitHub Secrets Setup Required:

Please add the following secrets to your GitHub repository:
(Go to: Settings > Secrets and variables > Actions)

🔑 Required Secrets:
- PROD_HOST: Your production server IP/hostname
- PROD_USER: SSH username for production server
- PROD_SSH_KEY: SSH private key for production server
- STAGING_HOST: Your staging server IP/hostname  
- STAGING_USER: SSH username for staging server
- STAGING_SSH_KEY: SSH private key for staging server
- DISCORD_WEBHOOK_URL: Discord webhook URL for notifications

📋 Optional Secrets:
- GITHUB_TOKEN: Automatically provided by GitHub
- DOCKER_REGISTRY_USER: Docker registry username
- DOCKER_REGISTRY_PASSWORD: Docker registry password

"@
    
    Read-Host "Press Enter when you have configured GitHub secrets"
}

# Function to build the application
function Build-Application {
    Write-Log "Building Lore Engine..."
    
    # Clean previous builds
    & bazel clean
    
    # Build the application
    if ($DeployEnv -eq "production") {
        & bazel build //:local-ai --config=release
    } else {
        & bazel build //:local-ai
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Build failed"
    }
    
    Write-Success "Application built successfully"
}

# Function to run tests
function Invoke-Tests {
    Write-Log "Running tests..."
    
    # Run unit tests
    & bazel test //...
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Tests failed"
    }
    
    # Run integration tests if they exist
    if (Test-Path "tests/integration") {
        Write-Log "Running integration tests..."
        & bazel test //tests/integration/...
        
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Integration tests failed"
        }
    }
    
    Write-Success "All tests passed"
}

# Function to build Docker image
function Build-DockerImage {
    Write-Log "Building Docker image..."
    
    # Get current commit hash
    $CommitHash = (git rev-parse --short HEAD).Trim()
    $BranchName = (git rev-parse --abbrev-ref HEAD).Trim()
    
    # Build image with multiple tags
    & docker build -t "${ImageName}:${CommitHash}" .
    & docker build -t "${ImageName}:${BranchName}" .
    & docker build -t "${ImageName}:latest" .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Docker build failed"
    }
    
    Write-Success "Docker image built successfully"
}

# Function to setup server infrastructure
function New-ServerInfrastructure {
    Write-Log "Setting up server infrastructure..."
    
    # Create systemd service file
    $ServiceFileContent = @"
[Unit]
Description=Lore Engine $($DeployEnv.Substring(0,1).ToUpper() + $DeployEnv.Substring(1))
After=network.target

[Service]
Type=simple
User=lore-engine
Group=lore-engine
WorkingDirectory=/opt/lore-engine
ExecStart=/opt/lore-engine/launch.sh --env=$DeployEnv
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lore-engine-$DeployEnv

# Resource limits
LimitNOFILE=65536
LimitMEMLOCK=infinity

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ReadWritePaths=/opt/lore-engine/logs
ReadWritePaths=/opt/lore-engine/data

[Install]
WantedBy=multi-user.target
"@
    
    Set-Content -Path "$ServiceName.service" -Value $ServiceFileContent
    
    Write-Success "Server infrastructure files created"
}

# Function to setup monitoring
function New-MonitoringSetup {
    Write-Log "Setting up monitoring..."
    
    # Create Prometheus configuration
    New-Item -ItemType Directory -Path "monitoring/prometheus" -Force | Out-Null
    
    $PrometheusConfig = @"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "lore-engine-rules.yml"

scrape_configs:
  - job_name: 'lore-engine-$DeployEnv'
    static_configs:
      - targets: ['localhost:$Port']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
"@
    
    Set-Content -Path "monitoring/prometheus/prometheus.yml" -Value $PrometheusConfig
    
    # Create Grafana provisioning
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/dashboards" -Force | Out-Null
    New-Item -ItemType Directory -Path "monitoring/grafana/provisioning/datasources" -Force | Out-Null
    
    $GrafanaDataSource = @"
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
"@
    
    Set-Content -Path "monitoring/grafana/provisioning/datasources/prometheus.yml" -Value $GrafanaDataSource
    
    Write-Success "Monitoring configuration created"
}

# Function to create deployment package
function New-DeploymentPackage {
    Write-Log "Creating deployment package..."
    
    # Create deployment directory
    New-Item -ItemType Directory -Path "deployment" -Force | Out-Null
    
    # Copy application files
    Copy-Item "bazel-bin/local-ai*" "deployment/" -Force
    Copy-Item $EnvFile "deployment/" -Force
    Copy-Item "launch.sh" "deployment/" -Force
    Copy-Item "deploy-community-api.sh" "deployment/" -Force
    
    # Copy directories if they exist
    if (Test-Path "config") { Copy-Item "config" "deployment/" -Recurse -Force }
    if (Test-Path "docs") { Copy-Item "docs" "deployment/" -Recurse -Force }
    if (Test-Path "public") { Copy-Item "public" "deployment/" -Recurse -Force }
    if (Test-Path "monitoring") { Copy-Item "monitoring" "deployment/" -Recurse -Force }
    
    # Copy service file
    Copy-Item "$ServiceName.service" "deployment/" -Force
    
    # Create deployment script
    $DeployScript = @'
#!/bin/bash
set -e

DEPLOY_ENV=${1:-"production"}
SERVICE_NAME="lore-engine-${DEPLOY_ENV}"

echo "🚀 Deploying Lore Engine to ${DEPLOY_ENV}..."

# Create user if it doesn't exist
if ! id "lore-engine" &>/dev/null; then
    sudo useradd -r -s /bin/false lore-engine
fi

# Set permissions
sudo chown -R lore-engine:lore-engine /opt/lore-engine
sudo chmod +x local-ai launch.sh deploy-community-api.sh

# Install systemd service
sudo cp ${SERVICE_NAME}.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable ${SERVICE_NAME}

# Start/restart service
sudo systemctl restart ${SERVICE_NAME}

# Check status
sleep 5
sudo systemctl status ${SERVICE_NAME}

echo "✅ Deployment complete!"
'@
    
    Set-Content -Path "deployment/deploy.sh" -Value $DeployScript
    
    # Create archive using tar (if available) or 7-zip
    $Timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $ArchiveName = "lore-engine-$DeployEnv-$Timestamp.tar.gz"
    
    if (Get-Command tar -ErrorAction SilentlyContinue) {
        & tar -czf $ArchiveName deployment/
    } elseif (Get-Command 7z -ErrorAction SilentlyContinue) {
        & 7z a -tgzip "$ArchiveName" deployment/
    } else {
        # Fallback to PowerShell compression
        Compress-Archive -Path deployment/* -DestinationPath "lore-engine-$DeployEnv-$Timestamp.zip"
        Write-Warning-Custom "Created ZIP archive instead of tar.gz (tar not available)"
    }
    
    Write-Success "Deployment package created"
}

# Function to validate deployment
function Test-Deployment {
    Write-Log "Validating deployment..."
    
    # Check if binary exists
    if (-not (Test-Path "deployment/local-ai*")) {
        Write-Error-Custom "Binary not found"
    }
    
    # Check if configuration files exist
    if (-not (Test-Path "deployment/$EnvFile")) {
        Write-Error-Custom "Environment file missing"
    }
    
    if (-not (Test-Path "deployment/launch.sh")) {
        Write-Error-Custom "Launch script missing"
    }
    
    # Validate environment file
    $EnvContent = Get-Content "deployment/$EnvFile" -Raw
    if (-not ($EnvContent -match "PORT=$Port")) {
        Write-Error-Custom "Environment file doesn't contain correct port"
    }
    
    Write-Success "Deployment validation passed"
}

# Function to setup CI/CD pipeline
function Test-CICDPipeline {
    Write-Log "Setting up CI/CD pipeline..."
    
    # Ensure .github/workflows directory exists
    New-Item -ItemType Directory -Path ".github/workflows" -Force | Out-Null
    
    # Check if deploy.yml exists
    if (-not (Test-Path ".github/workflows/deploy.yml")) {
        Write-Error-Custom "GitHub Actions workflow file not found. Please ensure .github/workflows/deploy.yml exists."
    }
    
    # Validate workflow file
    $WorkflowContent = Get-Content ".github/workflows/deploy.yml" -Raw
    if (-not ($WorkflowContent -match "name:")) {
        Write-Error-Custom "Invalid GitHub Actions workflow file"
    }
    
    Write-Success "CI/CD pipeline validated"
}

# Function to generate deployment report
function New-DeploymentReport {
    Write-Log "Generating deployment report..."
    
    $CommitHash = (git rev-parse HEAD).Trim()
    $BranchName = (git rev-parse --abbrev-ref HEAD).Trim()
    $Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    $ReportDate = Get-Date -Format "yyyyMMdd-HHmmss"
    
    $ReportContent = @"
# 🚀 Lore Engine Deployment Report

## Deployment Information
- **Environment**: $($DeployEnv.Substring(0,1).ToUpper() + $DeployEnv.Substring(1))
- **Timestamp**: $Timestamp
- **Git Commit**: $CommitHash
- **Git Branch**: $BranchName
- **Port**: $Port
- **Service**: $ServiceName

## Build Information
- **Bazel Version**: $(& bazel version | Select-Object -First 1)
- **PowerShell Version**: $($PSVersionTable.PSVersion)
- **Docker Version**: $(& docker --version)

## Deployment Package
- **Archive**: lore-engine-$DeployEnv-$ReportDate.tar.gz
- **Binary**: local-ai
- **Config**: $EnvFile
- **Service**: $ServiceName.service

## Health Check
- **Endpoint**: http://localhost:$Port/health
- **Dashboard**: http://localhost:$Port/dashboard
- **Metrics**: http://localhost:$Port/metrics

## Next Steps
1. Upload deployment package to target server
2. Extract and run deployment script
3. Verify service is running
4. Check health endpoint
5. Monitor logs and metrics

## Rollback Plan
``````bash
# Stop service
sudo systemctl stop $ServiceName

# Restore previous version
sudo tar -xzf lore-engine-$DeployEnv-previous.tar.gz -C /opt/lore-engine

# Restart service
sudo systemctl start $ServiceName
``````

---
*Generated by Lore Engine Deployment Script*
"@
    
    Set-Content -Path "deployment-report-$DeployEnv.md" -Value $ReportContent
    
    Write-Success "Deployment report generated: deployment-report-$DeployEnv.md"
}

# Function to print final instructions
function Show-FinalInstructions {
    $ReportDate = Get-Date -Format "yyyyMMdd-HHmmss"
    
    Write-Host @"

🎉 Lore Engine Deployment Setup Complete!

📋 Next Steps:

1. Server Setup:
   • Upload deployment package to your server
   • Extract: tar -xzf lore-engine-$DeployEnv-$ReportDate.tar.gz
   • Run: cd deployment && ./deploy.sh $DeployEnv

2. GitHub Actions:
   • Push to repository to trigger automated deployment
   • Monitor deployment in Actions tab
   • Check Discord for deployment notifications

3. Monitoring:
   • Setup Prometheus: http://server:9090
   • Setup Grafana: http://server:3000
   • Configure alerts and dashboards

4. Health Checks:
   • Health: http://server:$Port/health
   • Dashboard: http://server:$Port/dashboard
   • Metrics: http://server:$Port/metrics

5. Logs:
   • View logs: journalctl -u $ServiceName -f
   • Check status: systemctl status $ServiceName

📁 Files Created:
• deployment-report-$DeployEnv.md
• lore-engine-$DeployEnv-$ReportDate.tar.gz
• $ServiceName.service
• monitoring/prometheus/prometheus.yml

🔮 The Lore Engine is ready to awaken! ✨

"@ -ForegroundColor Cyan
}

# Main execution
function Main {
    Write-Log "🔮 Starting Lore Engine Deployment Setup..."
    
    # Change to repository root
    Set-Location $RepoRoot
    
    # Execute deployment steps
    Test-Prerequisites
    Show-GitHubSecretsSetup
    Build-Application
    Invoke-Tests
    Build-DockerImage
    New-ServerInfrastructure
    New-MonitoringSetup
    New-DeploymentPackage
    Test-Deployment
    Test-CICDPipeline
    New-DeploymentReport
    Show-FinalInstructions
    
    Write-Success "🎉 Lore Engine deployment setup completed successfully!"
}

# Script help
if ($Help) {
    Write-Host @"
🔮 Lore Engine Deployment Script

Usage: .\setup-deployment.ps1 [[-Environment] <string>] [-Help]

Parameters:
  -Environment    Deploy environment (production, staging) [Default: production]
  -Help          Show this help message

Examples:
  .\setup-deployment.ps1 -Environment production
  .\setup-deployment.ps1 -Environment staging

This script will:
1. Check prerequisites
2. Build the application
3. Run tests
4. Create Docker image
5. Setup server infrastructure
6. Create deployment package
7. Generate deployment report

"@
    exit 0
}

# Run main function
Main
