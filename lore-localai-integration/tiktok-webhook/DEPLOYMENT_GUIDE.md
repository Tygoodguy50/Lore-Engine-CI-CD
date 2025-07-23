# TikTok Webhook Server Deployment Guide

## 🎯 Overview
Complete setup for TikTok webhook server with HTTPS support for `phantomgear.it.com` domain.

## 📋 Prerequisites Complete
- ✅ Domain: `phantomgear.it.com` (owned on Namecheap)
- ✅ DNS TXT Record: `tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62`
- ✅ Public IP: `70.189.130.198`
- ✅ Local IP: `192.168.0.187`
- ✅ SSL Certificates: Generated locally

## 🔧 Server Files
- ✅ `main.go` - TikTok webhook server with HTTPS
- ✅ `server.crt` - SSL certificate for HTTPS
- ✅ `server.key` - SSL private key
- ✅ `start-webhook.ps1` - Server startup script
- ✅ `test-webhook.ps1` - Testing script
- ✅ `tiktok-webhook.exe` - Compiled server binary

## 🌐 Network Configuration Required

### Router Port Forwarding
Configure these rules on your router:
- **TCP Port 443** → `192.168.0.187:443` (HTTPS)
- **TCP Port 80** → `192.168.0.187:80` (HTTP)

### Verification
1. Check router admin panel (usually 192.168.1.1 or 192.168.0.1)
2. Find "Port Forwarding" or "Virtual Server" section
3. Add these entries:
   ```
   Name: TikTok HTTPS
   Protocol: TCP
   External Port: 443
   Internal IP: 192.168.0.187
   Internal Port: 443
   
   Name: TikTok HTTP
   Protocol: TCP  
   External Port: 80
   Internal IP: 192.168.0.187
   Internal Port: 80
   ```

## 🚀 Deployment Steps

### 1. Start the Webhook Server
```powershell
# Navigate to webhook directory
cd "c:\Users\tyler\~\LocalAI\lore-localai-integration\tiktok-webhook"

# Run as Administrator (required for ports 80/443)
# Right-click PowerShell → "Run as Administrator"
.\start-webhook.ps1
```

### 2. Test Local Connectivity
```powershell
# In another PowerShell window
.\test-webhook.ps1
```

### 3. Verify External Access
Test from external network or use online tools:
- `https://api.phantomgear.it.com/health`
- `https://phantomgear.it.com/api/webhooks/tiktok`

## 📡 TikTok Developer Console Configuration

### Webhook Settings
- **Webhook URL**: `https://api.phantomgear.it.com/api/webhooks/tiktok`
- **Backup URL**: `https://phantomgear.it.com/api/webhooks/tiktok`
- **Events to Subscribe**:
  - Video upload events
  - Video analytics updates  
  - User follow events
  - Video share events

### Domain Verification
- **Domain**: `phantomgear.it.com`
- **Verification Method**: DNS TXT Record
- **Record**: `tiktok-developers-site-verification=H2ZI9TEEsYMZx3AnzhuZMaOnNsm07t62`
- **Status**: ✅ Verified

## 🔍 Monitoring & Debugging

### Server Logs
The server provides detailed logging:
```
🚀 Starting TikTok Webhook Server...
🔒 Domain: api.phantomgear.it.com
📡 Webhook URL: https://api.phantomgear.it.com/api/webhooks/tiktok
🎯 Starting HTTPS server on :443...
```

### Webhook Request Logs
Incoming requests are logged with details:
```
📨 Received TikTok webhook request:
   🔍 Method: POST
   🔗 URL: /api/webhooks/tiktok
   📝 Body length: 256 bytes
🎬 TikTok webhook processed:
   📅 Event: video.upload
   👤 User ID: user123
   🎥 Video ID: video456
```

### Health Check Endpoints
- `https://api.phantomgear.it.com/health` - Basic health check
- `https://api.phantomgear.it.com/api/webhooks/tiktok/status` - Detailed status

## 🛠️ Troubleshooting

### Common Issues

#### 1. "Connection Refused" Error
- ✅ **Check**: Port forwarding configured correctly
- ✅ **Check**: Server running on correct ports (80/443)
- ✅ **Check**: Windows Firewall allows ports 80/443
- ✅ **Check**: Router firewall not blocking external access

#### 2. SSL Certificate Errors
- ✅ **Solution**: Self-signed certificate expected for local testing
- ✅ **Note**: TikTok may accept self-signed for webhook testing
- ✅ **Future**: Consider Let's Encrypt for production

#### 3. TikTok "Failed to Connect" Error
- ✅ **Check**: Domain resolves to your public IP (70.189.130.198)
- ✅ **Check**: Port 443 accessible externally
- ✅ **Test**: Use online SSL checker tools

### Testing Commands
```powershell
# Test local server
curl -k https://localhost/health

# Test domain resolution  
nslookup phantomgear.it.com

# Test port accessibility (from external network)
telnet phantomgear.it.com 443
```

## 🎬 Webhook Event Handling

The server handles these TikTok events:
- **video.upload** - New video uploaded
- **video.analytics** - View/engagement updates
- **user.follow** - New follower events  
- **video.share** - Video sharing events

### Viral Score Calculation
Content is analyzed for viral potential:
- Views > 10,000: +2.0 points
- Likes > 1,000: +1.5 points  
- Comments > 100: +1.0 points
- Shares > 50: +0.5 points
- Score > 7.0 triggers amplification

### Integration with Lore Dispatcher
High-scoring content triggers viral amplification:
- Sends data to `http://localhost:8084/lore/viral-amplification`
- JSON payload includes viral score and content metadata
- Enables automated response and content optimization

## 📈 Next Steps

1. **Test Webhook Connection**: Use TikTok Developer Console to test webhook URL
2. **Monitor Performance**: Watch server logs for incoming requests
3. **Optimize Scoring**: Adjust viral score thresholds based on results
4. **Scale Infrastructure**: Consider cloud deployment for production
5. **Enhanced Security**: Implement additional security measures for production

## 🔗 Key URLs
- **Primary Webhook**: `https://api.phantomgear.it.com/api/webhooks/tiktok`
- **Health Check**: `https://api.phantomgear.it.com/health`
- **Status Page**: `https://api.phantomgear.it.com/api/webhooks/tiktok/status`
- **Domain**: `phantomgear.it.com`
- **Public IP**: `70.189.130.198`

---
*Generated for Phantom Gear TikTok Integration - July 2025*
