# Kubernetes Secrets Configuration - Simple Commands

# Use these PowerShell commands to encode your secrets:

# 1. DISCORD_TOKEN (your Discord bot token)
# Example: MTIzNDU2Nzg5.abcdef
$DISCORD_TOKEN = "REPLACE_WITH_YOUR_DISCORD_TOKEN"
$DISCORD_TOKEN_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($DISCORD_TOKEN))
Write-Host "DISCORD_TOKEN: $DISCORD_TOKEN_B64"

# 2. DISCORD_CHANNEL_ID (your Discord channel ID)
# Example: 123456789012345678
$DISCORD_CHANNEL_ID = "REPLACE_WITH_YOUR_CHANNEL_ID"
$DISCORD_CHANNEL_ID_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($DISCORD_CHANNEL_ID))
Write-Host "DISCORD_CHANNEL_ID: $DISCORD_CHANNEL_ID_B64"

# 3. DISCORD_GUILD_ID (your Discord server/guild ID)
# Example: 123456789012345678
$DISCORD_GUILD_ID = "REPLACE_WITH_YOUR_GUILD_ID"
$DISCORD_GUILD_ID_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($DISCORD_GUILD_ID))
Write-Host "DISCORD_GUILD_ID: $DISCORD_GUILD_ID_B64"

# 4. GITHUB_TOKEN (your GitHub personal access token)
# Example: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
$GITHUB_TOKEN = "REPLACE_WITH_YOUR_GITHUB_TOKEN"
$GITHUB_TOKEN_B64 = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($GITHUB_TOKEN))
Write-Host "GITHUB_TOKEN: $GITHUB_TOKEN_B64"

# Copy these outputs and paste them into configmap.yaml
Write-Host ""
Write-Host "Copy the base64 values above into kubernetes/configmap.yaml"
Write-Host "Replace the empty quotes with your encoded values"
