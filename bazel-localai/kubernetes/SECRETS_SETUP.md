# Manual Kubernetes Secrets Configuration Guide

## Quick Setup

### Step 1: Encode your secrets using PowerShell

```powershell
# Function to encode secrets
function ConvertTo-Base64 {
    param([string]$text)
    [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($text))
}

# Example usage:
ConvertTo-Base64 "your-discord-token-here"
ConvertTo-Base64 "your-webhook-url-here"
```

### Step 2: Update kubernetes/configmap.yaml

Replace the empty values in the `data:` section with your base64 encoded secrets:

```yaml
data:
  DISCORD_TOKEN: "eW91ci1kaXNjb3JkLXRva2VuLWhlcmU="
  DISCORD_CHANNEL_ID: "MTIzNDU2Nzg5MA=="
  DISCORD_GUILD_ID: "MTIzNDU2Nzg5MA=="
  TIKTOK_WEBHOOK_URL: "aHR0cHM6Ly9hcGkudGlrdG9rLmNvbS93ZWJob29r"
  TIKTOK_ACCESS_TOKEN: "dGlrdG9rLWFjY2Vzcy10b2tlbg=="
  N8N_WEBHOOK_URL: "aHR0cHM6Ly9uOG4uZXhhbXBsZS5jb20vd2ViaG9vaw=="
  N8N_API_KEY: "bjhuLWFwaS1rZXk="
  LANGCHAIN_URL: "aHR0cHM6Ly9sYW5nY2hhaW4uZXhhbXBsZS5jb20="
  GITHUB_TOKEN: "Z2l0aHViLXRva2Vu"
  OPENAI_API_KEY: "c2stb3BlbmFpLWFwaS1rZXk="
  ANTHROPIC_API_KEY: "YW50aHJvcGljLWFwaS1rZXk="
  DATABASE_URL: "cG9zdGdyZXNxbDovL3VzZXI6cGFzc0Bsb2NhbGhvc3Q6NTQzMi9kYg=="
```

### Step 3: Deploy to Kubernetes

```powershell
cd kubernetes
.\deploy.ps1
```

## Common Discord Bot Setup

If you need to create a Discord bot:

1. Go to https://discord.com/developers/applications
2. Create a new application
3. Go to "Bot" section
4. Create a bot and copy the token
5. Get your server ID (right-click server → Copy ID)
6. Get your channel ID (right-click channel → Copy ID)

## Verification

After deployment, verify secrets are loaded:

```powershell
kubectl get secret lore-engine-secrets -n lore-engine -o yaml
kubectl describe pod -l app=lore-engine -n lore-engine
```

## Security Notes

- Never commit actual secrets to your repository
- Use environment variables or external secret management in production
- Consider using sealed-secrets or external-secrets operator for production deployments
