# 🚀 Lore Engine Deployment Guide

## Prerequisites

### 1. GitHub Secrets Setup
Configure these secrets in your GitHub repository (`Settings > Secrets and variables > Actions`):

#### Production Environment
- `PROD_HOST`: Production server hostname/IP
- `PROD_USER`: SSH username for production server
- `PROD_SSH_KEY`: Private SSH key for production server

#### Staging Environment
- `STAGING_HOST`: Staging server hostname/IP
- `STAGING_USER`: SSH username for staging server
- `STAGING_SSH_KEY`: Private SSH key for staging server

#### Discord Notifications
- `DISCORD_WEBHOOK_URL`: Discord webhook URL for deployment notifications

### 2. Server Setup

#### Production Server Setup
```bash
# Create application directory
sudo mkdir -p /opt/lore-engine
sudo chown $USER:$USER /opt/lore-engine

# Create systemd service
sudo tee /etc/systemd/system/lore-engine-production.service > /dev/null <<EOF
[Unit]
Description=Lore Engine Production
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/lore-engine
ExecStart=/opt/lore-engine/launch.sh --env=production
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lore-engine-prod

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable lore-engine-production
```

#### Staging Server Setup
```bash
# Create application directory
sudo mkdir -p /opt/lore-engine
sudo chown $USER:$USER /opt/lore-engine

# Create systemd service
sudo tee /etc/systemd/system/lore-engine-staging.service > /dev/null <<EOF
[Unit]
Description=Lore Engine Staging
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/lore-engine
ExecStart=/opt/lore-engine/launch.sh --env=staging
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=lore-engine-staging

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable lore-engine-staging
```

### 3. Discord Webhook Setup

1. Go to your Discord server
2. Navigate to Server Settings > Integrations > Webhooks
3. Click "New Webhook"
4. Configure the webhook:
   - **Name**: Lore Engine CI/CD
   - **Channel**: #deployments (or your preferred channel)
   - **Avatar**: Upload a mystical/lore-themed image
5. Copy the webhook URL and add it to GitHub secrets as `DISCORD_WEBHOOK_URL`

## Pipeline Features

### 🔨 Build and Test
- **Trigger**: Every push to `main` or `develop`, and pull requests
- **Actions**:
  - Go code formatting and linting
  - Bazel build and test execution
  - Artifact generation and upload
  - Build report generation

### 🔐 Security Scanning
- **Gosec**: Security vulnerability scanning
- **SARIF**: Security report upload to GitHub
- **Dependency checks**: Automated security reviews

### 🚀 Deployment Stages

#### Staging Deployment
- **Trigger**: Push to `develop` branch
- **Process**:
  1. Build application with Bazel
  2. Deploy to staging server
  3. Health check verification
  4. Discord notification

#### Production Deployment
- **Trigger**: Push to `main` branch or release creation
- **Process**:
  1. Build with release configuration
  2. Create deployment package
  3. Deploy to production server
  4. Health check verification
  5. Discord notification with special styling

### 🐳 Container Build
- **Registry**: GitHub Container Registry (ghcr.io)
- **Images**: Built for `main` and `develop` branches
- **Tags**: Branch-based, SHA-based, and `latest` for main

### ⚡ Performance Testing
- **Tool**: k6 load testing
- **Target**: Staging environment
- **Metrics**: Response times, throughput, error rates

## Usage

### Automatic Deployments

1. **Staging**: Push to `develop` branch
   ```bash
   git checkout develop
   git push origin develop
   ```

2. **Production**: Push to `main` branch
   ```bash
   git checkout main
   git merge develop
   git push origin main
   ```

3. **Release**: Create a GitHub release
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   # Then create release on GitHub
   ```

### Manual Deployment
If you need to deploy manually:

```bash
# Build locally
bazel build //:local-ai

# Deploy to staging
scp bazel-bin/local-ai user@staging-server:/opt/lore-engine/
ssh user@staging-server "cd /opt/lore-engine && sudo systemctl restart lore-engine-staging"

# Deploy to production
scp bazel-bin/local-ai user@prod-server:/opt/lore-engine/
ssh user@prod-server "cd /opt/lore-engine && sudo systemctl restart lore-engine-production"
```

## Monitoring

### Health Checks
The pipeline includes automatic health checks:
- **Staging**: `http://staging-host:8081/health`
- **Production**: `http://prod-host:8080/health`

### Discord Notifications
You'll receive notifications for:
- ✅ Successful deployments
- ❌ Failed builds/deployments
- 🎉 New releases
- 📊 Performance test results

### Logs
View deployment logs:
```bash
# Production logs
ssh user@prod-server "journalctl -u lore-engine-production -f"

# Staging logs
ssh user@staging-server "journalctl -u lore-engine-staging -f"
```

## Troubleshooting

### Common Issues

1. **SSH Connection Failed**
   - Verify SSH keys are correctly configured in GitHub secrets
   - Ensure the user has proper permissions on the server
   - Check firewall settings

2. **Build Failures**
   - Check Go version compatibility
   - Verify Bazel configuration
   - Review build logs in GitHub Actions

3. **Health Check Failures**
   - Verify the application is running on the correct port
   - Check server logs for startup errors
   - Ensure environment variables are properly set

4. **Discord Notifications Not Working**
   - Verify webhook URL is correct
   - Check webhook permissions in Discord
   - Ensure webhook channel exists

### Debug Commands

```bash
# Check service status
sudo systemctl status lore-engine-production

# View recent logs
journalctl -u lore-engine-production -n 100

# Manual health check
curl -f http://localhost:8080/health

# Test Discord webhook
curl -H "Content-Type: application/json" \
  -d '{"content": "Test notification"}' \
  YOUR_WEBHOOK_URL
```

## Security Considerations

- SSH keys should be properly secured and rotated regularly
- Discord webhook URLs should be kept secret
- Production servers should have proper firewall rules
- Regular security scans are automated in the pipeline
- Use non-root users for service execution

## Performance

The pipeline includes performance testing with k6:
- **Load Testing**: Simulates 50 concurrent users
- **Response Time**: Monitors response times < 500ms
- **Health Checks**: Validates all endpoints
- **Reports**: Generates performance reports for each deployment

## Maintenance

### Regular Tasks
- Monitor server disk space and logs
- Review security scan results
- Update dependencies and base images
- Rotate SSH keys and webhook URLs
- Review performance metrics

### Scaling
To scale the deployment:
1. Add load balancer configuration
2. Update health check endpoints
3. Configure multiple server targets
4. Implement blue-green deployment strategies

## Next Steps

1. **Set up monitoring**: Consider adding Prometheus/Grafana
2. **Implement rollback**: Add automatic rollback on failure
3. **Add staging data**: Populate staging with test data
4. **Configure backups**: Set up automated backups
5. **Add integration tests**: More comprehensive testing

The Lore Engine deployment pipeline is now ready to evolve with your mystical codebase! 🔮✨
