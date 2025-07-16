# 🔐 GitHub Secrets Configuration Guide

## Overview
This guide will help you configure all the necessary GitHub secrets for the Lore Engine automated deployment pipeline.

## Required Secrets

### 🚀 Deployment Secrets

#### Production Environment
- **`PROD_HOST`**: Production server IP address or hostname
  - Example: `203.0.113.10` or `lore-engine.example.com`
  - Used for SSH connections to deploy to production

- **`PROD_USER`**: SSH username for production server
  - Example: `ubuntu`, `deploy`, or `lore-engine`
  - Must have sudo privileges for service management

- **`PROD_SSH_KEY`**: SSH private key for production server
  - Generate with: `ssh-keygen -t ed25519 -C "lore-engine-prod-deploy"`
  - Copy the entire private key including `-----BEGIN` and `-----END` lines

#### Staging Environment
- **`STAGING_HOST`**: Staging server IP address or hostname
  - Example: `203.0.113.11` or `staging.lore-engine.example.com`
  - Used for SSH connections to deploy to staging

- **`STAGING_USER`**: SSH username for staging server
  - Example: `ubuntu`, `deploy`, or `lore-engine-staging`
  - Must have sudo privileges for service management

- **`STAGING_SSH_KEY`**: SSH private key for staging server
  - Generate with: `ssh-keygen -t ed25519 -C "lore-engine-staging-deploy"`
  - Copy the entire private key including `-----BEGIN` and `-----END` lines

### 📢 Notification Secrets

- **`DISCORD_WEBHOOK_URL`**: Discord webhook URL for deployment notifications
  - Example: `https://discord.com/api/webhooks/123456789/abcdef...`
  - Create in Discord: Server Settings → Integrations → Webhooks

### 🐳 Container Registry Secrets (Optional)

- **`DOCKER_REGISTRY_USER`**: Docker registry username
  - For GitHub Container Registry: your GitHub username
  - For Docker Hub: your Docker Hub username

- **`DOCKER_REGISTRY_PASSWORD`**: Docker registry password/token
  - For GitHub Container Registry: GitHub Personal Access Token with `write:packages` scope
  - For Docker Hub: your Docker Hub password or access token

## Step-by-Step Setup

### 1. Generate SSH Keys

Run these commands on your local machine:

```bash
# Generate SSH key for production
ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-prod -C "lore-engine-prod-deploy"

# Generate SSH key for staging
ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-staging -C "lore-engine-staging-deploy"

# Display public keys (to add to servers)
echo "Production public key:"
cat ~/.ssh/lore-engine-prod.pub

echo "Staging public key:"
cat ~/.ssh/lore-engine-staging.pub

# Display private keys (to add to GitHub secrets)
echo "Production private key (for PROD_SSH_KEY secret):"
cat ~/.ssh/lore-engine-prod

echo "Staging private key (for STAGING_SSH_KEY secret):"
cat ~/.ssh/lore-engine-staging
```

### 2. Setup Server Access

Add the public keys to your servers:

```bash
# On production server
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAbc... lore-engine-prod-deploy" >> ~/.ssh/authorized_keys

# On staging server  
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAdef... lore-engine-staging-deploy" >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys
```

### 3. Create Discord Webhook

1. Go to your Discord server
2. Navigate to **Server Settings** → **Integrations** → **Webhooks**
3. Click **"New Webhook"**
4. Configure:
   - **Name**: `Lore Engine CI/CD`
   - **Channel**: `#deployments` (or your preferred channel)
   - **Avatar**: Upload a mystical/lore-themed image
5. Click **"Copy Webhook URL"**
6. Save the URL for the `DISCORD_WEBHOOK_URL` secret

### 4. Add Secrets to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret:

#### Production Secrets
```
Name: PROD_HOST
Value: your-production-server-ip-or-hostname

Name: PROD_USER  
Value: your-ssh-username

Name: PROD_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
... (entire private key content) ...
-----END OPENSSH PRIVATE KEY-----
```

#### Staging Secrets
```
Name: STAGING_HOST
Value: your-staging-server-ip-or-hostname

Name: STAGING_USER
Value: your-ssh-username

Name: STAGING_SSH_KEY
Value: -----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
... (entire private key content) ...
-----END OPENSSH PRIVATE KEY-----
```

#### Notification Secrets
```
Name: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/123456789/abcdef...
```

## Server Setup Requirements

### Production Server Setup

```bash
# Create application directory
sudo mkdir -p /opt/lore-engine
sudo chown $USER:$USER /opt/lore-engine

# Create lore-engine user
sudo useradd -r -s /bin/false lore-engine
sudo mkdir -p /opt/lore-engine/logs
sudo chown -R lore-engine:lore-engine /opt/lore-engine

# Install required packages
sudo apt update
sudo apt install -y curl systemctl

# Create systemd service directory
sudo mkdir -p /etc/systemd/system

# Enable firewall rules (adjust ports as needed)
sudo ufw allow 8080/tcp  # Production port
sudo ufw allow 22/tcp    # SSH
```

### Staging Server Setup

```bash
# Create application directory
sudo mkdir -p /opt/lore-engine
sudo chown $USER:$USER /opt/lore-engine

# Create lore-engine user
sudo useradd -r -s /bin/false lore-engine
sudo mkdir -p /opt/lore-engine/logs
sudo chown -R lore-engine:lore-engine /opt/lore-engine

# Install required packages
sudo apt update
sudo apt install -y curl systemctl

# Create systemd service directory
sudo mkdir -p /etc/systemd/system

# Enable firewall rules (adjust ports as needed)
sudo ufw allow 8081/tcp  # Staging port
sudo ufw allow 22/tcp    # SSH
```

## Testing the Configuration

### Test SSH Access

```bash
# Test production SSH access
ssh -i ~/.ssh/lore-engine-prod $PROD_USER@$PROD_HOST "echo 'Production SSH works!'"

# Test staging SSH access
ssh -i ~/.ssh/lore-engine-staging $STAGING_USER@$STAGING_HOST "echo 'Staging SSH works!'"
```

### Test Discord Webhook

```bash
# Test Discord webhook
curl -H "Content-Type: application/json" \
  -d '{"content": "🧪 Test notification from Lore Engine setup!"}' \
  $DISCORD_WEBHOOK_URL
```

## Security Best Practices

### SSH Security
- Use Ed25519 keys (stronger than RSA)
- Use unique keys for each environment
- Rotate keys regularly (every 90 days)
- Restrict SSH access to specific IP ranges if possible

### Webhook Security
- Use HTTPS webhooks only
- Rotate webhook URLs if compromised
- Monitor webhook usage in Discord

### GitHub Secrets Security
- Use environment-specific secrets
- Regularly audit secret access
- Use environment protection rules for production
- Enable secret scanning alerts

## Troubleshooting

### Common Issues

1. **SSH Connection Refused**
   - Check server firewall settings
   - Verify SSH service is running
   - Ensure correct IP address/hostname

2. **Permission Denied (SSH)**
   - Check SSH key format (include full key with headers)
   - Verify public key is in `authorized_keys`
   - Check file permissions (600 for authorized_keys)

3. **Discord Webhook Failed**
   - Verify webhook URL is correct
   - Check webhook permissions in Discord
   - Ensure webhook channel exists

4. **Deployment Fails**
   - Check server disk space
   - Verify user has sudo privileges
   - Check systemd service permissions

### Debug Commands

```bash
# Check SSH connection
ssh -vvv -i ~/.ssh/lore-engine-prod $PROD_USER@$PROD_HOST

# Test webhook
curl -I $DISCORD_WEBHOOK_URL

# Check GitHub Actions logs
# Go to: Repository → Actions → Latest workflow run → View logs
```

## Verification Checklist

Before proceeding with deployment, verify:

- [ ] SSH keys generated and added to servers
- [ ] GitHub secrets configured with correct values
- [ ] Discord webhook created and tested
- [ ] Server prerequisites installed
- [ ] Firewall rules configured
- [ ] User permissions set correctly
- [ ] SSH access tested successfully
- [ ] Discord notifications working

## Next Steps

Once all secrets are configured:

1. **Run the deployment setup**:
   ```powershell
   .\setup-deployment.ps1 -Environment production
   ```

2. **Test the pipeline**:
   ```bash
   git add -A
   git commit -m "feat: configure deployment secrets"
   git push origin develop  # Triggers staging deployment
   ```

3. **Monitor deployment**:
   - Check GitHub Actions tab
   - Monitor Discord for notifications
   - Verify health endpoints after deployment

---

🔮 **Your Lore Engine deployment secrets are now configured!** The mystical deployment pipeline awaits your command! ✨
