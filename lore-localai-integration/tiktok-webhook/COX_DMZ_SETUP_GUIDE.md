# 🎯 Cox DMZ Setup - IMMEDIATE FIX for TikTok Webhook

## Current Status
- ✅ **Webhook Server Running**: PID 14416 on ports 8443/8080
- ✅ **Local Access Working**: HTTP 200 responses
- ✅ **Public IP Available**: 70.189.130.198
- ❌ **External Access Blocked**: DMZ not configured

## 🚀 DMZ Setup Steps (Cox Panoramic WiFi App)

### Step 1: Open Cox App
1. **Download** "Cox Panoramic WiFi" app if not installed
2. **Open app** and **sign in** with Cox account
3. **Select your network** (should auto-detect)

### Step 2: Navigate to DMZ Settings
DMZ location varies by app version. Try these paths:

**Option A: Advanced Menu**
- Tap **"Advanced"** or **"Advanced Settings"**
- Look for **"DMZ Host"** or **"Exposed Host"**

**Option B: Security Menu**
- Tap **"Security"** or **"Firewall"**
- Look for **"DMZ"** or **"DMZ Host"**

**Option C: Port Management**
- Tap **"Port Forwarding"** 
- Look for **"DMZ"** option at bottom

### Step 3: Configure DMZ
1. **Find DMZ/Exposed Host setting**
2. **Enable DMZ** (toggle switch)
3. **Set DMZ Host IP to**: `192.168.0.187`
4. **Save/Apply changes**

### Step 4: Verify & Test
1. **Wait 2-3 minutes** for changes to apply
2. **Restart router** if needed (power cycle 30 seconds)
3. **Run test**: `powershell -ExecutionPolicy Bypass -File .\test-dmz-simple.ps1`

## 🔍 Troubleshooting DMZ Setup

### Can't Find DMZ Option?
- **Update Cox app** to latest version
- **Try different menu paths** (Advanced/Security/Port Forwarding)
- **Look for "Exposed Host"** instead of "DMZ"
- **Check if router model supports DMZ** (most Cox routers do)

### DMZ Option Grayed Out?
- **Restart Cox app**
- **Sign out and sign back in**
- **Check if you're admin** on the account
- **Try accessing during different times** (Cox sometimes restricts changes)

### DMZ Not Working After Setup?
- **Double-check IP address**: Must be exactly `192.168.0.187`
- **Power cycle router**: Unplug 30 seconds, plug back in
- **Wait 5-10 minutes** for full propagation
- **Check Windows Firewall**: Should allow ports 8443/8080

## 🎬 Expected Results After DMZ

Once DMZ is configured correctly:
- ✅ **External port 8443 accessible**
- ✅ **TikTok webhook URL working**: `https://api.phantomgear.it.com:8443/tiktok`
- ✅ **All ports forwarded** to your computer (192.168.0.187)

## 🚨 DMZ Security Notes

**DMZ forwards ALL ports** to your computer:
- **Temporary solution**: Only enable for TikTok integration testing
- **Windows Firewall active**: Provides protection
- **Disable when not needed**: Remove DMZ after TikTok webhook validates

## 📱 Cox App Variations by Router Model

### Panoramic WiFi Gateway (CGM4140COM)
- **Advanced → DMZ Host**
- IP field accepts `192.168.0.187`

### Panoramic WiFi Gateway 2 (CGM4331COM)  
- **Security → Exposed Host**
- May be called "Exposed Host" instead of DMZ

### Contour Stream Player Gateway
- **Port Forwarding → DMZ**
- DMZ option at bottom of port forwarding page

## 🎯 Quick Test Command

After setting up DMZ, run this immediately:
```powershell
Test-NetConnection -ComputerName api.phantomgear.it.com -Port 8443
```

If it shows **TcpTestSucceeded: True**, your TikTok webhook is ready!

## 📞 Cox Support Backup

If DMZ option is missing or not working:
- **Call**: 1-844-556-8453 (Cox Technical Support)
- **Say**: "Need to enable DMZ/Exposed Host for business webhook server"
- **Request**: "Escalate to technical specialist"
- **Explain**: "DMZ option missing from Panoramic WiFi app"

## 🏆 SUCCESS INDICATORS

When DMZ is working correctly:
1. **Test shows**: "HTTPS port 8443 accessible from external"
2. **TikTok webhook URL responds**: `https://api.phantomgear.it.com:8443/tiktok`
3. **External connectivity confirmed**

**DMZ solves Cox's port forwarding reliability issues immediately!**
