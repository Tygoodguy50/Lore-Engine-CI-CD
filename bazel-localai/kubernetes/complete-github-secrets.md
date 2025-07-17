# Complete GitHub Secrets Configuration

## 🔐 All Repository Secrets to Add
Go to: https://github.com/Tygoodguy50/Lore-Engine-CI-CD/settings/secrets/actions

### 🏗️ Staging Environment Secrets

#### STAGING_HOST
**Name:** `STAGING_HOST`
**Value:** `192.168.0.187`
**Description:** Staging server IP address (working configuration)

#### STAGING_USER
**Name:** `STAGING_USER`
**Value:** `ubuntu`
**Description:** SSH username for staging server

#### STAGING_SSH_KEY
**Name:** `STAGING_SSH_KEY`
**Value:** [SSH Private Key - see below]
**Description:** Private SSH key for staging server authentication

### 🚀 Production Environment Secrets

#### PROD_HOST
**Name:** `PROD_HOST`
**Value:** `api.aitype.it.com`
**Description:** Production server domain name

#### PROD_USER
**Name:** `PROD_USER`
**Value:** `ubuntu` (or your production server username)
**Description:** SSH username for production server

#### PROD_SSH_KEY
**Name:** `PROD_SSH_KEY`
**Value:** [SSH Private Key - same as staging if using same key]
**Description:** Private SSH key for production server authentication

## 🔑 SSH Private Key Content

Copy this entire block for both STAGING_SSH_KEY and PROD_SSH_KEY:

```
-----BEGIN OPENSSH PRIVATE KEY-----
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        
xN1pcFLQAd6WVIE3amiHiF5CE=
-----END OPENSSH PRIVATE KEY-----
```

## 🧪 Test Your Configuration

### Test staging SSH connection:
```bash
ssh -p 2222 ubuntu@staging.hauntkit.shop
```

### Test production SSH connection (if configured):
```bash
ssh -p 22 ubuntu@api.aitype.it.com
```

### Test local staging server:
```bash
ssh -p 2222 ubuntu@192.168.0.187
```

## 🌐 Domain Configuration Summary

- **Staging:** staging.hauntkit.shop → 192.168.0.187:2222
- **Production:** api.aitype.it.com → (your production server IP:22)
- **Local Docker:** 192.168.0.187:2222 (Docker container)

## 📝 Priority Order for Adding Secrets

1. **Start with staging secrets** (STAGING_HOST, STAGING_USER, STAGING_SSH_KEY)
2. **Test staging deployment** to ensure it works
3. **Add production secrets** (PROD_HOST, PROD_USER, PROD_SSH_KEY)
4. **Test production deployment**

## ⚠️ Important Notes

1. **Staging server is ready** - Docker container running on port 2222
2. **Production server** - Make sure your production server is set up and accessible
3. **SSH keys** - Same SSH key can be used for both staging and production
4. **Domain DNS** - Ensure both domains are properly configured with A records
5. **Security** - Keep SSH keys secure and never commit them to your repository
