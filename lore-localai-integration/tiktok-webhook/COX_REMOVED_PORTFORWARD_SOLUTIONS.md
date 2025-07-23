# 🚨 Cox Removed Port Forwarding - Alternative Solutions

## Problem
Cox routers frequently **reset or remove port forwarding rules** after:
- Router restarts/updates
- Firmware updates  
- Network configuration changes
- ISP maintenance

This is a **known Cox issue** - not your configuration problem.

## 🎯 Solution 1: DMZ Host (Recommended - Quick Fix)

**DMZ forwards ALL ports** to your computer, bypassing Cox port forwarding bugs.

### Cox App DMZ Setup:
1. **Open Cox Panoramic WiFi app**
2. **Find "DMZ" or "Exposed Host" setting** (usually in Advanced)
3. **Set DMZ Host to: 192.168.0.187** (your computer)
4. **Enable DMZ**
5. **Save and wait 2-3 minutes**

### Security Note:
- DMZ is less secure but **bypasses all Cox port forwarding issues**
- Only enable temporarily for TikTok integration
- Can disable after confirming webhook works

## 🎯 Solution 2: UPnP Auto-Configuration

Enable UPnP to let applications auto-configure ports:

### Cox App UPnP Setup:
1. **Cox app → Advanced Settings**
2. **Find "UPnP" or "Universal Plug and Play"**
3. **Enable UPnP**
4. **Restart webhook server** (it will try to auto-configure ports)

## 🎯 Solution 3: Cloud Tunnel Service

Use a cloud tunnel to bypass Cox router entirely:

### Option A: ngrok (Free)
```powershell
# Download ngrok.exe to your webhook folder
# Run tunnel to local server
ngrok http 8443

# Get public URL like: https://abc123.ngrok.io
# Use that URL for TikTok webhook
```

### Option B: Cloudflare Tunnel (Free)
```powershell
# Download cloudflared.exe
# Create tunnel to local server  
cloudflared tunnel --url localhost:8443

# Get public URL for TikTok
```

## 🎯 Solution 4: Different Router/Modem

Cox Panoramic gateways are **notorious for port forwarding issues**.

### Alternative Options:
- **Bridge Mode**: Put Cox in bridge mode + use your own router
- **Different ISP**: Switch to ISP with better port forwarding support
- **Business Account**: Cox business accounts have better port forwarding

## 🚀 Immediate Recommendation: Try DMZ First

**DMZ is the fastest solution** to bypass Cox port forwarding problems:

1. **Cox app → DMZ/Exposed Host → 192.168.0.187**
2. **Test immediately**: `Test-NetConnection api.phantomgear.it.com -Port 8443`
3. **Add TikTok webhook**: `https://api.phantomgear.it.com:8443/tiktok`

## 📞 Cox Support Strategy

If you call Cox support:
- **Issue**: "Port forwarding keeps getting reset/removed"
- **Request**: "Escalate to technical specialist"  
- **Ask for**: "Static port forwarding configuration"
- **Mention**: "Business requirement for webhook server"

## 🎬 TikTok Integration Status

Your **webhook server is ready** - only external access blocked by Cox.

### Current URLs to try (once external access works):
- `https://api.phantomgear.it.com:8443/tiktok`
- `http://api.phantomgear.it.com:8080/tiktok`

**DMZ method will immediately solve the TikTok integration!**

The webhook server has all TikTok compatibility features ready - Cox router is the only blocker.
