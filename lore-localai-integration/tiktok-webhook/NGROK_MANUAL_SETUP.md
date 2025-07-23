# 🚀 Manual ngrok Setup for TikTok Webhook

## Your Auth Token
```
304iicb7pToMM2vJFtBG8NZk2JB_6bWMMHaQe3NY4FBJMvbFP
```

## Step 1: Download ngrok Manually

Since automatic download is blocked by antivirus, please download manually:

1. **Open browser** and go to: https://ngrok.com/download
2. **Click "Windows (AMD64)"** to download
3. **Extract the ZIP file** 
4. **Copy `ngrok.exe`** to this folder: 
   ```
   C:\Users\tyler\~\LocalAI\lore-localai-integration\tiktok-webhook\
   ```

## Step 2: Run Setup Script

After downloading ngrok.exe to this folder:
```powershell
powershell -ExecutionPolicy Bypass -File .\setup-ngrok-auth.ps1
```

This script will:
- ✅ Configure your auth token automatically
- ✅ Start your webhook server if needed
- ✅ Create the tunnel to bypass Cox router
- ✅ Show your TikTok webhook URL

## Step 3: Get Your Webhook URL

Once running, ngrok will show something like:
```
https://abc123.ngrok-free.app
```

**Your TikTok webhook URL will be:**
```
https://abc123.ngrok-free.app/tiktok
```

## Step 4: Test the Webhook

After tunnel is running, test it:
```powershell
# Replace XXXXX with your actual ngrok domain
Invoke-WebRequest -Uri "https://XXXXX.ngrok-free.app/tiktok" -Method GET
```

## Alternative: Use ngrok Web Dashboard

1. Go to: https://dashboard.ngrok.com/tunnels/agents
2. Sign in with your ngrok account
3. Follow their web interface instructions
4. Start tunnel pointing to: `localhost:8443`

## Why This Solves Everything

✅ **Bypasses Cox router completely**
✅ **No port forwarding needed**  
✅ **Stable HTTPS connection**
✅ **Works through any firewall**
✅ **Professional tunnel service**

## Current Status

- ✅ **Webhook Server**: Running (PID 14416)
- ✅ **Auth Token**: Ready (304iicb7pToMM2vJFtBG8NZk2JB...)  
- ⏳ **ngrok**: Need manual download
- ⏳ **Tunnel**: Ready to start

**Once ngrok is downloaded, your TikTok integration will work immediately!** 🎬
