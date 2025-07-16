# 🚀 Lore Engine Automated Deployment Pipeline

## Overview

This automated deployment pipeline provides a complete CI/CD solution for the Lore Engine, including:

- **Automated Building**: Bazel-based builds with testing
- **Container Support**: Docker images with multi-stage builds
- **Multi-Environment**: Production and staging deployments
- **Monitoring**: Prometheus metrics and Grafana dashboards
- **Discord Notifications**: Real-time deployment status updates
- **Security Scanning**: Automated vulnerability detection
- **Performance Testing**: Load testing with k6

## 📁 Project Structure

```
LocalAI/
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions workflow
├── docs/
│   ├── deployment/
│   │   ├── DEPLOYMENT_GUIDE.md    # Deployment documentation
│   │   └── PERFORMANCE_TESTING.md # Performance testing guide
│   └── monitoring/
│       └── MONITORING_SETUP.md    # Monitoring configuration
├── monitoring/
│   ├── prometheus/
│   │   └── prometheus.yml         # Prometheus configuration
│   └── grafana/
│       └── provisioning/          # Grafana dashboards
├── BUILD.bazel                    # Bazel build configuration
├── Dockerfile                     # Container build instructions
├── setup-deployment.sh            # Linux/macOS deployment script
├── setup-deployment.ps1           # Windows PowerShell deployment script
├── .env.production                # Production environment config
├── .env.staging                   # Staging environment config
└── launch.sh                      # Application launcher
```

## 🔧 Quick Start

### Prerequisites

1. **Tools Required**:
   - Docker
   - Bazel
   - Git
   - Go 1.21+

2. **GitHub Secrets** (Required):
   ```
   PROD_HOST              # Production server IP/hostname
   PROD_USER              # SSH username for production
   PROD_SSH_KEY           # SSH private key for production
   STAGING_HOST           # Staging server IP/hostname
   STAGING_USER           # SSH username for staging
   STAGING_SSH_KEY        # SSH private key for staging
   DISCORD_WEBHOOK_URL    # Discord webhook for notifications
   ```

### Setup Deployment Pipeline

#### Windows (PowerShell)
```powershell
# Run the deployment setup script
.\setup-deployment.ps1 -Environment production

# Or for staging
.\setup-deployment.ps1 -Environment staging
```

#### Linux/macOS (Bash)
```bash
# Make script executable
chmod +x setup-deployment.sh

# Run the deployment setup script
./setup-deployment.sh production

# Or for staging
./setup-deployment.sh staging
```

### Manual Build & Test

```bash
# Build the application
bazel build //:local-ai

# Run tests
bazel test //...

# Build Docker image
docker build -t lore-engine:latest .

# Run locally
./launch.sh --env=production
```

## 🚀 Deployment Workflow

### Automated Deployment Triggers

1. **Staging Deployment**: Push to `develop` branch
2. **Production Deployment**: Push to `main` branch or create a release
3. **Manual Deployment**: Trigger workflow manually

### Deployment Steps

1. **Build & Test**:
   - Code linting and formatting
   - Unit tests with Bazel
   - Security scanning with Gosec
   - Build artifact generation

2. **Container Build**:
   - Multi-stage Docker build
   - Image tagging (commit, branch, latest)
   - Push to GitHub Container Registry

3. **Staging Deployment**:
   - Deploy to staging server
   - Health check validation
   - Performance testing with k6
   - Discord notification

4. **Production Deployment**:
   - Deploy to production server
   - Health check validation
   - Monitoring setup
   - Release notification

### Deployment Environments

#### Production
- **Port**: 8080
- **Service**: `lore-engine-production`
- **Config**: `.env.production`
- **Health**: `http://server:8080/health`
- **Dashboard**: `http://server:8080/dashboard`

#### Staging
- **Port**: 8081
- **Service**: `lore-engine-staging`
- **Config**: `.env.staging`
- **Health**: `http://server:8081/health`
- **Dashboard**: `http://server:8081/dashboard`

## 📊 Monitoring & Observability

### Metrics Collection
- **Prometheus**: Application metrics scraping
- **Grafana**: Dashboard visualization
- **Health Checks**: Automated endpoint monitoring
- **Log Aggregation**: Structured logging with ELK stack

### Key Metrics
- Request rate and response time
- Error rate and status codes
- Cursed topic activity
- Memory and CPU usage
- Active sessions and connections

### Alerting
- Discord webhook notifications
- Prometheus alerting rules
- Uptime monitoring
- Performance regression detection

## 🔐 Security Features

### Security Scanning
- **Gosec**: Go security analyzer
- **SARIF**: Security findings upload
- **Dependency Scanning**: CVE detection
- **Container Scanning**: Image vulnerability assessment

### Security Hardening
- Non-root container execution
- Resource limits and restrictions
- Network security policies
- Secret management

## ⚡ Performance Testing

### Load Testing
- **Tool**: k6 load testing
- **Scenarios**: Health checks, API endpoints, lore processing
- **Metrics**: Response time, throughput, error rates
- **Thresholds**: Automated performance validation

### Performance Targets
- **Response Time**: < 500ms for API endpoints
- **Throughput**: 1000+ requests/second
- **Error Rate**: < 1%
- **Resource Usage**: < 512MB memory, < 80% CPU

## 🎯 Usage Examples

### Trigger Staging Deployment
```bash
git checkout develop
git commit -m "feat: enhance lore conflict detection"
git push origin develop
# Automatic staging deployment triggered
```

### Trigger Production Deployment
```bash
git checkout main
git merge develop
git push origin main
# Automatic production deployment triggered
```

### Create Release
```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
# Create release on GitHub UI
# Automatic production deployment + notifications
```

### Manual Deployment
```bash
# Build deployment package
./setup-deployment.sh production

# Upload to server
scp lore-engine-production-*.tar.gz user@server:/opt/lore-engine/

# Deploy on server
ssh user@server
cd /opt/lore-engine
tar -xzf lore-engine-production-*.tar.gz
cd deployment
./deploy.sh production
```

## 🛠️ Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Go version compatibility
   - Verify Bazel configuration
   - Review dependency versions

2. **Deployment Failures**:
   - Verify SSH keys and permissions
   - Check server connectivity
   - Validate environment variables

3. **Health Check Failures**:
   - Verify application startup
   - Check port availability
   - Review application logs

### Debug Commands

```bash
# Check service status
systemctl status lore-engine-production

# View logs
journalctl -u lore-engine-production -f

# Manual health check
curl -f http://localhost:8080/health

# Test Discord webhook
curl -H "Content-Type: application/json" \
  -d '{"content": "Test notification"}' \
  YOUR_WEBHOOK_URL
```

## 🎨 Customization

### Environment Variables
Modify `.env.production` or `.env.staging` to customize:
- Port numbers
- Debug settings
- Performance limits
- Security configurations

### Docker Configuration
Update `Dockerfile` to:
- Change base images
- Add dependencies
- Modify security settings
- Configure resource limits

### Monitoring Configuration
Customize `monitoring/prometheus/prometheus.yml`:
- Scrape intervals
- Metrics endpoints
- Alert thresholds
- Dashboard settings

## 🔄 Maintenance

### Regular Tasks
- Monitor deployment logs
- Review security scan results
- Update dependencies
- Rotate SSH keys and webhooks
- Performance optimization

### Backup Strategy
- Database backups
- Configuration backups
- Deployment package archives
- Monitoring data retention

## 📈 Scaling

### Horizontal Scaling
- Load balancer configuration
- Multi-server deployment
- Database clustering
- Session management

### Vertical Scaling
- Resource limit adjustments
- Performance optimization
- Caching strategies
- Connection pooling

## 🆘 Support

### Documentation
- [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)
- [Performance Testing](docs/deployment/PERFORMANCE_TESTING.md)
- [Monitoring Setup](docs/monitoring/MONITORING_SETUP.md)

### Getting Help
- Review deployment logs
- Check health endpoints
- Monitor Discord notifications
- Consult troubleshooting guides

---

## 🔮 The Lore Engine Deployment Pipeline

This comprehensive deployment pipeline ensures that your Lore Engine deployments are:
- **Reliable**: Automated testing and validation
- **Secure**: Security scanning and hardening
- **Observable**: Comprehensive monitoring and alerting
- **Scalable**: Multi-environment support
- **Maintainable**: Clear documentation and procedures

The mystical deployment process is now fully automated! 🚀✨

*May your deployments be swift and your lore conflicts be resolved!*
