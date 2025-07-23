# 📱 Cox Panoramic WiFi App - TikTok Port Forwarding Setup

## 🎯 Cox Router Port Forwarding via Mobile App

Your Cox router requires the **Cox Panoramic WiFi app** to configure port forwarding.

### Step 1: Download the App
- **App Store (iOS)**: Search "Cox Panoramic WiFi"
- **Google Play (Android)**: Search "Cox Panoramic WiFi"
- **Alternative**: Use Cox website portal

### Step 2: App Login & Setup
1. Open Cox Panoramic WiFi app
2. Sign in with your Cox account credentials
3. Verify your router is connected to the app

### Step 3: Navigate to Port Forwarding
In the Cox app, look for:
- **Advanced Settings**
- **Network Settings** 
- **Port Forwarding**
- **Gaming/Applications**
- **Firewall Settings**

### Step 4: Add TikTok Port Forwarding Rules

**Rule 1: TikTok HTTPS (443)**
```
Name/Description: TikTok-HTTPS
Device: Select your computer (192.168.0.187)
External Port: 443
Internal Port: 443  
Protocol: TCP
Status: Enable
```

**Rule 2: TikTok HTTP (80)**
```
Name/Description: TikTok-HTTP
Device: Select your computer (192.168.0.187)  
External Port: 80
Internal Port: 80
Protocol: TCP
Status: Enable
```

### Step 5: Device Selection
- App should show list of connected devices
- Look for your computer name or IP `192.168.0.187`
- Select your Windows PC

### Step 6: Save & Apply
1. Save both port forwarding rules
2. Apply settings in the app
3. **Router will automatically restart/apply changes**

### Step 7: Verification
After setup completes (2-3 minutes), test connectivity:
```powershell
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443
```

## 🎯 Alternative: Cox Web Portal
If app doesn't work, try Cox web portal:
1. Go to: https://www.cox.com/residential/support/internet/modem-setup.html
2. Sign in to your Cox account
3. Manage your Panoramic WiFi gateway
4. Find port forwarding in advanced settings

## ⚡ After Port Forwarding is Active

### TikTok Webhook URLs to Try:
- Primary: `https://api.phantomgear.it.com/tiktok`
- Alternative: `https://api.phantomgear.it.com/webhooks/tiktok`
- HTTP Fallback: `http://api.phantomgear.it.com/tiktok`

### Verification Commands:
```powershell
# Test HTTPS
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443

# Test HTTP  
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80
```

Both should show: `TcpTestSucceeded : True`

**Once port forwarding is configured via the Cox app, TikTok webhook validation should work immediately!** 🚀
