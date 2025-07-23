# 🚨 TikTok Validation Failed - Router Configuration Issue

## Problem Diagnosis
TikTok **cannot reach your webhook** from the internet because router port forwarding is not working correctly.

## ✅ What's Working
- Webhook server is running (Process ID found)  
- Local server responding correctly
- SSL certificates loaded
- Domain DNS resolution working

## ❌ What's Not Working  
- External access to ports 80 and 443
- TikTok cannot validate the webhook URL

## 🔧 Router Configuration Fix

### Step 1: Verify Router Settings
1. Go to: `http://192.168.0.1`
2. Find Port Forwarding section
3. **Check these exact rules exist:**

```
Rule 1: TikTok HTTPS
- Device: 192.168.0.187 (your computer)
- External Port: 443  
- Internal Port: 443
- Protocol: TCP
- Status: ENABLED ✅

Rule 2: TikTok HTTP  
- Device: 192.168.0.187 (your computer)
- External Port: 80
- Internal Port: 80  
- Protocol: TCP
- Status: ENABLED ✅
```

### Step 2: Critical Checks
- [ ] Are both rules **ENABLED/ACTIVE**?
- [ ] Did you **REBOOT the router** after adding rules?
- [ ] Is the device IP exactly `192.168.0.187`?
- [ ] Are the protocols set to **TCP** (not UDP)?

### Step 3: Router Reboot Required
**Port forwarding only works after router reboot!**
1. Save port forwarding settings
2. Reboot router (power cycle)  
3. Wait 3-5 minutes for full restart

### Step 4: Test After Router Reboot
```powershell
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443
```
Should show: `TcpTestSucceeded : True`

### Step 5: TikTok Validation  
Once ports work, try these URLs in TikTok:
- `https://api.phantomgear.it.com/tiktok`
- `https://api.phantomgear.it.com/webhooks/tiktok`

## 🎯 Common Router Issues

### Issue 1: Rules Not Enabled
Some routers add rules but don't enable them automatically.

### Issue 2: Router Not Rebooted  
Port forwarding requires router restart to activate.

### Issue 3: Wrong Internal IP
Ensure forwarding goes to `192.168.0.187` (your computer's IP).

### Issue 4: Firewall Blocking
Windows Firewall might block incoming connections on ports 80/443.

## ⚡ Quick Firewall Fix
If needed, run as Administrator:
```powershell
New-NetFirewallRule -DisplayName "TikTok Webhook HTTP" -Direction Inbound -Port 80 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "TikTok Webhook HTTPS" -Direction Inbound -Port 443 -Protocol TCP -Action Allow
```

**The webhook server is 100% ready - only external access needs fixing!**
