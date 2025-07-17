# Staging Server Secrets Setup Guide

## Required Secrets for Staging Server

You need to add these three secrets to your GitHub repository:

1. **STAGING_HOST** - The hostname/IP address of your staging server
2. **STAGING_USER** - The username for SSH access to your staging server  
3. **STAGING_SSH_KEY** - The private SSH key for authentication

## Setup Steps

### Option 1: Using GitHub Web Interface (Recommended)

1. Go to your GitHub repository: https://github.com/Tygoodguy50/Lore-Engine-CI-CD
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret** for each secret:

   **STAGING_HOST**
   - Name: `STAGING_HOST`
   - Value: Your staging server IP or hostname (e.g., `192.168.1.100` or `staging.example.com`)

   **STAGING_USER**
   - Name: `STAGING_USER` 
   - Value: Your SSH username (e.g., `ubuntu`, `admin`, or your username)

   **STAGING_SSH_KEY**
   - Name: `STAGING_SSH_KEY`
   - Value: Your private SSH key content (the entire contents of your private key file)

### Option 2: Using GitHub CLI (Alternative)

If you want to use the command line instead, run these commands:

```powershell
# Set the staging host
gh secret set STAGING_HOST --body "your.staging.server.com"

# Set the staging user
gh secret set STAGING_USER --body "your-ssh-username"

# Set the staging SSH key (from file)
gh secret set STAGING_SSH_KEY --body-file "path\to\your\private\key"
```

## SSH Key Generation (if needed)

If you don't have an SSH key pair for your staging server, generate one:

```powershell
# Generate a new SSH key pair for staging
ssh-keygen -t rsa -b 4096 -C "staging-deployment-key" -f staging_key

# Copy the public key to your staging server
ssh-copy-id -i staging_key.pub your-username@your-staging-server

# Use the private key (staging_key) as the STAGING_SSH_KEY secret
```

## Verification

After setting up the secrets, you can verify they exist by checking the Actions secrets page in your GitHub repository settings.

## Usage in GitHub Actions

These secrets will be used in your GitHub Actions workflows like this:

```yaml
- name: Deploy to staging
  uses: appleboy/ssh-action@v0.1.5
  with:
    host: ${{ secrets.STAGING_HOST }}
    username: ${{ secrets.STAGING_USER }}
    key: ${{ secrets.STAGING_SSH_KEY }}
    script: |
      # Your deployment commands here
```

## Security Notes

- Never commit private keys to your repository
- Use dedicated SSH keys for deployments (not your personal keys)
- Ensure your staging server has proper firewall rules
- Consider using SSH key passphrases for additional security
