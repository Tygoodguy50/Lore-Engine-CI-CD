# 🌐 Manual ngrok Setup for TikTok Webhook

Since automatic download failed, let's set up ngrok manually.

## Step 1: Download ngrok
1. **Go to**: https://ngrok.com/download
2. **Download**: "Windows (AMD64)" version
3. **Extract** `ngrok.exe` to this folder: `C:\Users\tyler\~\LocalAI\lore-localai-integration\tiktok-webhook\`

## Step 2: Verify Webhook Server
Your webhook server is running (PID 14416). Let's confirm:
```powershell
Get-Process -Name "tiktok-webhook-v3"
```

## Step 3: Start ngrok Tunnel
After downloading ngrok.exe to this folder:
```powershell
.\ngrok.exe http 8443
```

## Step 4: Copy Tunnel URL
1. **ngrok will show**: `https://XXXXX.ngrok-free.app`
2. **Your TikTok webhook URL**: `https://XXXXX.ngrok-free.app/tiktok`
3. **Copy this URL** for TikTok integration

## Alternative: Use Different Tunnel Service

### Option A: Cloudflare Tunnel (Free)
Download: https://github.com/cloudflare/cloudflared/releases
```powershell
.\cloudflared.exe tunnel --url localhost:8443
```

### Option B: LocalTunnel (Node.js)
If you have Node.js:
```powershell
npm install -g localtunnel
lt --port 8443 --subdomain phantomgear-tiktok
```

## Why This Works Better Than Cox Router

- **Bypasses Cox completely**: Tunnel goes directly to cloud service
- **No port forwarding needed**: Works through any firewall/router
- **Stable connection**: Doesn't get reset like Cox port forwarding
- **HTTPS included**: ngrok provides SSL certificates automatically

## Once Tunnel is Running

Your TikTok webhook URL will be something like:
- `https://abc123.ngrok-free.app/tiktok`
- `https://def456.cloudflared.com/tiktok`
- `https://phantomgear-tiktok.loca.lt/tiktok`

**This completely solves the Cox router problem!**
