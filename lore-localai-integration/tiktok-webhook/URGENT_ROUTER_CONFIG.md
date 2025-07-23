# 🚨 URGENT: Router Port Forwarding Required

## Current Status
- ✅ Webhook server running on ports 80/443
- ✅ SSL certificates configured 
- ✅ Domain phantomgear.it.com verified
- ❌ **BLOCKED**: External access via router

## Root Cause
TikTok cannot reach your webhook because router at `192.168.0.1` is NOT forwarding ports 80/443 to your computer (`192.168.0.187`).

## Quick Fix Steps

### 1. Access Router Admin
```
http://192.168.0.1
```
Login with admin credentials (usually on router sticker)

### 2. Find Port Forwarding
Look for these menu names:
- "Port Forwarding" 
- "Virtual Servers"
- "Gaming" 
- "Applications & Gaming"
- "NAT/Gaming"
- "Advanced" → "Port Forwarding"

### 3. Add These Rules

**Rule 1 - HTTPS (443)**
- Service Name: `TikTok-HTTPS`
- External Port: `443`
- Internal Port: `443` 
- Internal IP: `192.168.0.187`
- Protocol: `TCP`
- Status: `Enabled`

**Rule 2 - HTTP (80)**
- Service Name: `TikTok-HTTP`
- External Port: `80`
- Internal Port: `80`
- Internal IP: `192.168.0.187` 
- Protocol: `TCP`
- Status: `Enabled`

### 4. Save & Reboot Router
Apply changes and reboot router to activate forwarding.

### 5. Test External Access
After router reboot, test:
```powershell
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 80
```

## TikTok URL Configuration
Once ports work, use:
```
https://api.phantomgear.it.com/tiktok
```

## Common Router Models

### Netgear
Advanced → Dynamic DNS/DDNS → Port Forwarding/Port Triggering

### Linksys  
Smart Wi-Fi → External Storage → Port Range Forwarding

### TP-Link
Advanced → NAT Forwarding → Virtual Servers

### ASUS
Adaptive QoS → Traditional QoS → Port Forwarding

### D-Link
Advanced → Port Forwarding

## Verification
Router working when both tests show:
```
TcpTestSucceeded : True
```

⚡ **This is the ONLY issue blocking TikTok integration!**
