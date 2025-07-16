#!/bin/bash

# 🚀 Lore Engine Complete Deployment Script
# This script sets up the entire deployment pipeline infrastructure

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Configuration
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ENV=${1:-"production"}
DOCKER_REGISTRY="ghcr.io"
IMAGE_NAME="lore-engine"

# Environment-specific configurations
if [ "$DEPLOY_ENV" = "production" ]; then
    PORT=8080
    ENV_FILE=".env.production"
    SERVICE_NAME="lore-engine-production"
elif [ "$DEPLOY_ENV" = "staging" ]; then
    PORT=8081
    ENV_FILE=".env.staging"
    SERVICE_NAME="lore-engine-staging"
else
    error "Invalid environment: $DEPLOY_ENV. Use 'production' or 'staging'"
fi

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if required tools are installed
    command -v docker >/dev/null 2>&1 || error "Docker is not installed"
    command -v bazel >/dev/null 2>&1 || error "Bazel is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        error "Not in a git repository"
    fi
    
    # Check if required files exist
    [ -f "BUILD.bazel" ] || error "BUILD.bazel not found"
    [ -f "$ENV_FILE" ] || error "$ENV_FILE not found"
    [ -f "Dockerfile" ] || error "Dockerfile not found"
    
    success "Prerequisites check passed"
}

# Function to setup GitHub Actions secrets
setup_github_secrets() {
    log "Setting up GitHub Actions secrets..."
    
    cat << EOF

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

EOF
    
    read -p "Press Enter when you have configured GitHub secrets..."
}

# Function to build the application
build_application() {
    log "Building Lore Engine..."
    
    # Clean previous builds
    bazel clean
    
    # Build the application
    if [ "$DEPLOY_ENV" = "production" ]; then
        bazel build //:local-ai --config=release
    else
        bazel build //:local-ai
    fi
    
    success "Application built successfully"
}

# Function to run tests
run_tests() {
    log "Running tests..."
    
    # Run unit tests
    bazel test //...
    
    # Run integration tests if they exist
    if [ -d "tests/integration" ]; then
        log "Running integration tests..."
        bazel test //tests/integration/...
    fi
    
    success "All tests passed"
}

# Function to build Docker image
build_docker_image() {
    log "Building Docker image..."
    
    # Get current commit hash
    COMMIT_HASH=$(git rev-parse --short HEAD)
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    
    # Build image with multiple tags
    docker build -t "${IMAGE_NAME}:${COMMIT_HASH}" .
    docker build -t "${IMAGE_NAME}:${BRANCH_NAME}" .
    docker build -t "${IMAGE_NAME}:latest" .
    
    success "Docker image built successfully"
}

# Function to setup server infrastructure
setup_server_infrastructure() {
    log "Setting up server infrastructure..."
    
    # Create systemd service file
    cat > "${SERVICE_NAME}.service" << EOF
[Unit]
Description=Lore Engine ${DEPLOY_ENV^}
After=network.target

[Service]
Type=simple
User=lore-engine
Group=lore-engine
WorkingDirectory=/opt/lore-engine
ExecStart=/opt/lore-engine/launch.sh --env=${DEPLOY_ENV}
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lore-engine-${DEPLOY_ENV}

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
EOF
    
    success "Server infrastructure files created"
}

# Function to setup monitoring
setup_monitoring() {
    log "Setting up monitoring..."
    
    # Create Prometheus configuration
    mkdir -p monitoring/prometheus
    cat > monitoring/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "lore-engine-rules.yml"

scrape_configs:
  - job_name: 'lore-engine-${DEPLOY_ENV}'
    static_configs:
      - targets: ['localhost:${PORT}']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']
EOF
    
    # Create Grafana provisioning
    mkdir -p monitoring/grafana/provisioning/dashboards
    mkdir -p monitoring/grafana/provisioning/datasources
    
    cat > monitoring/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    url: http://localhost:9090
    access: proxy
    isDefault: true
EOF
    
    success "Monitoring configuration created"
}

# Function to create deployment package
create_deployment_package() {
    log "Creating deployment package..."
    
    # Create deployment directory
    mkdir -p deployment
    
    # Copy application files
    cp bazel-bin/local-ai deployment/
    cp $ENV_FILE deployment/
    cp launch.sh deployment/
    cp deploy-community-api.sh deployment/
    cp -r config deployment/ 2>/dev/null || true
    cp -r docs deployment/ 2>/dev/null || true
    cp -r public deployment/ 2>/dev/null || true
    cp -r monitoring deployment/ 2>/dev/null || true
    
    # Copy service file
    cp "${SERVICE_NAME}.service" deployment/
    
    # Create deployment script
    cat > deployment/deploy.sh << 'EOF'
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
EOF
    
    chmod +x deployment/deploy.sh
    
    # Create archive
    tar -czf "lore-engine-${DEPLOY_ENV}-$(date +%Y%m%d-%H%M%S).tar.gz" deployment/
    
    success "Deployment package created"
}

# Function to validate deployment
validate_deployment() {
    log "Validating deployment..."
    
    # Check if binary exists and is executable
    [ -x "deployment/local-ai" ] || error "Binary is not executable"
    
    # Check if configuration files exist
    [ -f "deployment/$ENV_FILE" ] || error "Environment file missing"
    [ -f "deployment/launch.sh" ] || error "Launch script missing"
    
    # Validate environment file
    if ! grep -q "PORT=$PORT" "deployment/$ENV_FILE"; then
        error "Environment file doesn't contain correct port"
    fi
    
    success "Deployment validation passed"
}

# Function to setup CI/CD pipeline
setup_cicd_pipeline() {
    log "Setting up CI/CD pipeline..."
    
    # Ensure .github/workflows directory exists
    mkdir -p .github/workflows
    
    # Check if deploy.yml exists
    if [ ! -f ".github/workflows/deploy.yml" ]; then
        error "GitHub Actions workflow file not found. Please ensure .github/workflows/deploy.yml exists."
    fi
    
    # Validate workflow file
    if ! grep -q "name:" ".github/workflows/deploy.yml"; then
        error "Invalid GitHub Actions workflow file"
    fi
    
    success "CI/CD pipeline validated"
}

# Function to generate deployment report
generate_deployment_report() {
    log "Generating deployment report..."
    
    COMMIT_HASH=$(git rev-parse HEAD)
    BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
    TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    cat > "deployment-report-${DEPLOY_ENV}.md" << EOF
# 🚀 Lore Engine Deployment Report

## Deployment Information
- **Environment**: ${DEPLOY_ENV^}
- **Timestamp**: ${TIMESTAMP}
- **Git Commit**: ${COMMIT_HASH}
- **Git Branch**: ${BRANCH_NAME}
- **Port**: ${PORT}
- **Service**: ${SERVICE_NAME}

## Build Information
- **Bazel Version**: $(bazel version | head -1)
- **Go Version**: $(go version)
- **Docker Version**: $(docker --version)

## Deployment Package
- **Archive**: lore-engine-${DEPLOY_ENV}-$(date +%Y%m%d-%H%M%S).tar.gz
- **Binary**: local-ai
- **Config**: ${ENV_FILE}
- **Service**: ${SERVICE_NAME}.service

## Health Check
- **Endpoint**: http://localhost:${PORT}/health
- **Dashboard**: http://localhost:${PORT}/dashboard
- **Metrics**: http://localhost:${PORT}/metrics

## Next Steps
1. Upload deployment package to target server
2. Extract and run deployment script
3. Verify service is running
4. Check health endpoint
5. Monitor logs and metrics

## Rollback Plan
\`\`\`bash
# Stop service
sudo systemctl stop ${SERVICE_NAME}

# Restore previous version
sudo tar -xzf lore-engine-${DEPLOY_ENV}-previous.tar.gz -C /opt/lore-engine

# Restart service
sudo systemctl start ${SERVICE_NAME}
\`\`\`

---
*Generated by Lore Engine Deployment Script*
EOF
    
    success "Deployment report generated: deployment-report-${DEPLOY_ENV}.md"
}

# Function to print final instructions
print_final_instructions() {
    cat << EOF

🎉 ${GREEN}Lore Engine Deployment Setup Complete!${NC}

📋 ${YELLOW}Next Steps:${NC}

1. ${BLUE}Server Setup:${NC}
   • Upload deployment package to your server
   • Extract: tar -xzf lore-engine-${DEPLOY_ENV}-*.tar.gz
   • Run: cd deployment && ./deploy.sh ${DEPLOY_ENV}

2. ${BLUE}GitHub Actions:${NC}
   • Push to repository to trigger automated deployment
   • Monitor deployment in Actions tab
   • Check Discord for deployment notifications

3. ${BLUE}Monitoring:${NC}
   • Setup Prometheus: http://server:9090
   • Setup Grafana: http://server:3000
   • Configure alerts and dashboards

4. ${BLUE}Health Checks:${NC}
   • Health: http://server:${PORT}/health
   • Dashboard: http://server:${PORT}/dashboard
   • Metrics: http://server:${PORT}/metrics

5. ${BLUE}Logs:${NC}
   • View logs: journalctl -u ${SERVICE_NAME} -f
   • Check status: systemctl status ${SERVICE_NAME}

📁 ${YELLOW}Files Created:${NC}
• deployment-report-${DEPLOY_ENV}.md
• lore-engine-${DEPLOY_ENV}-$(date +%Y%m%d-%H%M%S).tar.gz
• ${SERVICE_NAME}.service
• monitoring/prometheus/prometheus.yml

🔮 ${PURPLE}The Lore Engine is ready to awaken!${NC} ✨

EOF
}

# Main execution
main() {
    log "🔮 Starting Lore Engine Deployment Setup..."
    
    # Change to repository root
    cd "$REPO_ROOT"
    
    # Execute deployment steps
    check_prerequisites
    setup_github_secrets
    build_application
    run_tests
    build_docker_image
    setup_server_infrastructure
    setup_monitoring
    create_deployment_package
    validate_deployment
    setup_cicd_pipeline
    generate_deployment_report
    print_final_instructions
    
    success "🎉 Lore Engine deployment setup completed successfully!"
}

# Script help
if [[ "${1}" == "--help" || "${1}" == "-h" ]]; then
    cat << EOF
🔮 Lore Engine Deployment Script

Usage: $0 [environment]

Environments:
  production    Deploy to production (default)
  staging       Deploy to staging

Options:
  --help, -h    Show this help message

Examples:
  $0 production
  $0 staging

This script will:
1. Check prerequisites
2. Build the application
3. Run tests
4. Create Docker image
5. Setup server infrastructure
6. Create deployment package
7. Generate deployment report

EOF
    exit 0
fi

# Run main function
main "$@"
