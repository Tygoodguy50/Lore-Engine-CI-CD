# 🔧 EXACT Router Port Forwarding Setup

## Your Router Interface
Based on your description, here's the EXACT setup:

### Access Router
1. Open browser: `http://192.168.0.1`
2. Login with admin credentials

### Port Forwarding Setup

#### Rule 1: TikTok HTTPS (Port 443)
```
Device: [Select your computer from dropdown]
        - Look for: Computer name or 192.168.0.187
        - Your device may show as "DESKTOP-xxx" or similar
Port Number: 443
Protocol: TCP
```
Click "Add" or "Save"

#### Rule 2: TikTok HTTP (Port 80) 
```  
Device: [Same device as above - your computer]
Port Number: 80
Protocol: TCP
```
Click "Add" or "Save"

### Important Steps
1. **Save Configuration** - Apply/Save settings
2. **Reboot Router** - Power cycle for changes to take effect
3. **Wait 3 minutes** - Full router restart

### Verification
After router reboot, run:
```powershell
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80
```

Success shows: `TcpTestSucceeded : True`

### TikTok Webhook URL
Once ports work, add to TikTok:
```
https://api.phantomgear.it.com/tiktok
```

## ⚡ Current Status
- ❌ Port 443: BLOCKED (needs forwarding)
- ❌ Port 80: BLOCKED (needs forwarding) 
- ✅ Webhook server: RUNNING
- ✅ SSL certificates: READY
- ✅ Domain verification: WORKING

**Router configuration is the ONLY remaining step!**
