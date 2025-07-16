# Environment Configuration

The LocalAI Haunted Hooks system uses environment variables for configuration. This document explains how to set up and manage your environment configuration.

## Configuration Files

### `config.env`
The main configuration file containing all environment variables. This file includes:

- **Discord Integration**: Bot tokens, channel IDs, webhook URLs
- **TikTok Integration**: Webhook URLs, API keys, video processing settings
- **Markdown Generation**: Output paths, template settings, file organization
- **n8n/LangChain Integration**: Workflow URLs, API endpoints, automation settings
- **Security Settings**: API keys, tokens, secret keys
- **Performance Settings**: Rate limits, timeouts, concurrent processing

### Configuration Structure
```bash
# Discord Integration
DISCORD_BOT_TOKEN=your_bot_token_here
DISCORD_GUILD_ID=your_guild_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# TikTok Integration
TIKTOK_WEBHOOK_URL=https://your-domain.com/webhook/tiktok
TIKTOK_API_KEY=your_tiktok_api_key
TIKTOK_VIDEO_DURATION=60

# Markdown Generation
MARKDOWN_OUTPUT_PATH=./docs/haunted
MARKDOWN_TEMPLATE_PATH=./templates/haunted.md
MARKDOWN_AUTO_GENERATE=true

# n8n/LangChain Integration
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/haunted
LANGCHAIN_API_URL=https://your-langchain-api.com
LANGCHAIN_API_KEY=your_langchain_api_key

# Security
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Performance
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60
HTTP_TIMEOUT=30
MAX_CONCURRENT_REQUESTS=10
```

## Loading Environment Variables

### Method 1: Using Load Scripts (Recommended)

The repository includes platform-specific scripts to load environment variables:

#### Windows PowerShell
```powershell
# Load environment variables only
.\load-env.ps1

# Load environment variables and start daemon
.\load-env.ps1 -Start
```

#### Windows Command Prompt
```cmd
REM Load environment variables only
load-env.bat

REM Load environment variables and start daemon
load-env.bat --start
```

#### Linux/macOS Bash
```bash
# Load environment variables only
source ./load-env.sh

# Load environment variables and start daemon
./load-env.sh --start
```

### Method 2: Manual Export (Linux/macOS)
```bash
# Export variables manually
export DISCORD_BOT_TOKEN="your_bot_token_here"
export DISCORD_GUILD_ID="your_guild_id"
# ... continue for all variables

# Start daemon
./local-ai
```

### Method 3: Windows SET Commands
```cmd
REM Set variables manually
set DISCORD_BOT_TOKEN=your_bot_token_here
set DISCORD_GUILD_ID=your_guild_id
REM ... continue for all variables

REM Start daemon
local-ai.exe
```

## Environment Setup Process

### 1. Create Configuration File
```bash
# Copy the example configuration
cp config.env.example config.env

# Edit with your actual values
nano config.env  # or your preferred editor
```

### 2. Configure Integration Settings

#### Discord Integration
1. Create a Discord bot at https://discord.com/developers/applications
2. Get your bot token and add it to `DISCORD_BOT_TOKEN`
3. Get your guild ID and add it to `DISCORD_GUILD_ID`
4. Create a webhook URL and add it to `DISCORD_WEBHOOK_URL`

#### TikTok Integration
1. Set up TikTok developer account
2. Configure webhook endpoint in `TIKTOK_WEBHOOK_URL`
3. Add API key to `TIKTOK_API_KEY`

#### Markdown Generation
1. Set output directory in `MARKDOWN_OUTPUT_PATH`
2. Configure template path in `MARKDOWN_TEMPLATE_PATH`
3. Enable auto-generation with `MARKDOWN_AUTO_GENERATE=true`

#### n8n/LangChain Integration
1. Set up n8n instance
2. Configure webhook URL in `N8N_WEBHOOK_URL`
3. Add LangChain API details

### 3. Load Environment and Start
```bash
# Choose your platform's script
./load-env.sh --start        # Linux/macOS
.\load-env.ps1 -Start        # Windows PowerShell
load-env.bat --start         # Windows CMD
```

## Security Considerations

### Environment File Security
- **Never commit `config.env` to version control**
- Use `.gitignore` to exclude configuration files
- Store sensitive values in secure environment variable services
- Use different configurations for development/staging/production

### Token Management
- Rotate API keys regularly
- Use environment-specific tokens
- Implement token expiration where possible
- Monitor token usage for unusual activity

### File Permissions
```bash
# Secure the configuration file (Linux/macOS)
chmod 600 config.env

# Ensure scripts are executable
chmod +x load-env.sh
```

## Troubleshooting

### Common Issues

#### Configuration File Not Found
```
❌ Configuration file not found: config.env
💡 Please copy config.env.example to config.env and configure your settings
```
**Solution**: Create `config.env` from the example template

#### Permission Denied (PowerShell)
```
execution of scripts is disabled on this system
```
**Solution**: Run PowerShell as Administrator and execute:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Environment Variables Not Loading
**Solution**: Verify file format and check for:
- Proper `KEY=VALUE` format
- No spaces around `=`
- No shell-specific syntax in values
- Proper line endings for your platform

### Validation Commands

#### Check Environment Variables
```bash
# Linux/macOS
env | grep -E "(DISCORD|TIKTOK|MARKDOWN|N8N|LANGCHAIN)"

# Windows PowerShell
Get-ChildItem Env: | Where-Object {$_.Name -match "(DISCORD|TIKTOK|MARKDOWN|N8N|LANGCHAIN)"}

# Windows CMD
set | findstr /i "DISCORD TIKTOK MARKDOWN N8N LANGCHAIN"
```

#### Test Configuration
```bash
# Test Discord integration
curl -X POST http://localhost:8081/webhook/haunted \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","message":"Environment test"}'

# Check daemon status
curl http://localhost:8081/status
```

## Production Deployment

### Environment Variable Services
- **AWS**: Use AWS Systems Manager Parameter Store
- **Azure**: Use Azure Key Vault
- **GCP**: Use Google Secret Manager
- **Kubernetes**: Use ConfigMaps and Secrets

### Docker Configuration
```dockerfile
# Copy configuration file
COPY config.env /app/config.env

# Load environment variables
RUN source /app/load-env.sh

# Start daemon
CMD ["./local-ai"]
```

### Kubernetes Deployment
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: localai-config
data:
  config.env: |
    DISCORD_BOT_TOKEN=your_bot_token_here
    DISCORD_GUILD_ID=your_guild_id
    # ... other configuration
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: localai-daemon
spec:
  replicas: 1
  selector:
    matchLabels:
      app: localai
  template:
    metadata:
      labels:
        app: localai
    spec:
      containers:
      - name: localai
        image: your-registry/localai:latest
        envFrom:
        - configMapRef:
            name: localai-config
```

## Best Practices

1. **Use environment-specific configurations**
2. **Implement configuration validation**
3. **Use secure secret management**
4. **Monitor environment variable changes**
5. **Document all configuration options**
6. **Test configuration loading in CI/CD**
7. **Implement configuration hot-reloading when possible**

## Configuration Reference

For a complete list of all available environment variables and their descriptions, see the `config.env` file in the repository root.
