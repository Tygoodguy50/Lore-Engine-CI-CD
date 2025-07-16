# 🔐 GitHub Secrets Configuration Summary

## 📋 Quick Start Guide

### 1. **Prerequisites**
- GitHub CLI installed (`gh` command)
- GitHub repository created
- GitHub Personal Access Token with `repo` permissions
- Discord server for notifications

### 2. **Configure Secrets (Choose One Method)**

#### Method A: Interactive PowerShell Script
```powershell
# Windows users - run this for guided setup
.\configure-github-secrets.ps1 -Interactive
```

#### Method B: Batch File (Simplest)
```batch
# Windows users - double-click or run in cmd
configure-secrets.bat
```

#### Method C: Manual Setup
1. Go to `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Add each secret from the list below

### 3. **Required Secrets**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `PROD_HOST` | Production server IP/hostname | `203.0.113.10` |
| `PROD_USER` | SSH username for production | `ubuntu` |
| `PROD_SSH_KEY` | SSH private key for production | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `STAGING_HOST` | Staging server IP/hostname | `203.0.113.11` |
| `STAGING_USER` | SSH username for staging | `ubuntu` |
| `STAGING_SSH_KEY` | SSH private key for staging | `-----BEGIN OPENSSH PRIVATE KEY-----` |
| `DISCORD_WEBHOOK_URL` | Discord webhook for notifications | `https://discord.com/api/webhooks/...` |

### 4. **Generate SSH Keys**
```bash
# Generate keys for deployment
ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-prod -C "lore-engine-prod-deploy"
ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-staging -C "lore-engine-staging-deploy"

# Copy private keys to GitHub secrets
cat ~/.ssh/lore-engine-prod        # → PROD_SSH_KEY
cat ~/.ssh/lore-engine-staging     # → STAGING_SSH_KEY

# Copy public keys to servers
cat ~/.ssh/lore-engine-prod.pub    # → Add to production server
cat ~/.ssh/lore-engine-staging.pub # → Add to staging server
```

### 5. **Set Up Servers**
```bash
# Run on both production and staging servers
sudo mkdir -p /opt/lore-engine
sudo useradd -r -s /bin/false lore-engine
sudo chown -R lore-engine:lore-engine /opt/lore-engine

# Add public keys to servers
echo "ssh-ed25519 AAAA... lore-engine-prod-deploy" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 6. **Create Discord Webhook**
1. Discord Server → Server Settings → Integrations → Webhooks
2. Click "New Webhook"
3. Name: "Lore Engine CI/CD"
4. Channel: "#deployments"
5. Copy webhook URL → `DISCORD_WEBHOOK_URL` secret

### 7. **Validate Configuration**
```bash
# Check if all secrets are configured
bash validate-github-secrets.sh

# Test SSH access
ssh -i ~/.ssh/lore-engine-prod ubuntu@YOUR_PROD_HOST "echo 'SSH works!'"

# Test Discord webhook
curl -H "Content-Type: application/json" \
  -d '{"content": "🧪 Test notification"}' \
  YOUR_DISCORD_WEBHOOK_URL
```

### 8. **Trigger Deployment**
```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main

# Create release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

## 🎯 Quick Commands Reference

### GitHub CLI Commands
```bash
# Set all secrets at once
gh secret set PROD_HOST --body "your-prod-server" --repo YOUR_REPO
gh secret set PROD_USER --body "ubuntu" --repo YOUR_REPO
gh secret set PROD_SSH_KEY --repo YOUR_REPO  # Then paste private key
gh secret set STAGING_HOST --body "your-staging-server" --repo YOUR_REPO
gh secret set STAGING_USER --body "ubuntu" --repo YOUR_REPO
gh secret set STAGING_SSH_KEY --repo YOUR_REPO  # Then paste private key
gh secret set DISCORD_WEBHOOK_URL --body "https://discord.com/api/webhooks/..." --repo YOUR_REPO

# List configured secrets
gh secret list --repo YOUR_REPO
```

### Test Commands
```bash
# Test deployment pipeline
git add -A
git commit -m "feat: test deployment pipeline"
git push origin develop  # → Triggers staging deployment

# Check deployment status
gh run list --repo YOUR_REPO
gh run view --repo YOUR_REPO
```

## 📚 Additional Resources

- **Full Setup Guide**: `docs/deployment/GITHUB_SECRETS_SETUP.md`
- **Deployment Guide**: `docs/deployment/DEPLOYMENT_GUIDE.md`
- **Troubleshooting**: `docs/deployment/DEPLOYMENT_GUIDE.md#troubleshooting`

## 🚨 Security Notes

- Never commit secrets to your repository
- Use unique SSH keys for each environment
- Rotate secrets regularly (every 90 days)
- Use environment protection rules for production
- Monitor GitHub Actions logs for security issues

## ✅ Success Criteria

Your secrets are properly configured when:
- [ ] All required secrets show up in `gh secret list`
- [ ] SSH access works to both servers
- [ ] Discord webhook responds to test messages
- [ ] GitHub Actions workflow runs without errors
- [ ] Deployment completes successfully

## 🔮 Ready to Deploy!

Once all secrets are configured:
1. Run `.\setup-deployment.ps1 -Environment production`
2. Push code to trigger deployment
3. Monitor GitHub Actions and Discord for progress
4. Verify deployment at health endpoints

The Lore Engine deployment pipeline is now ready to awaken! ✨
