# 🔧 CRITICAL: Port Forwarding Configuration Required

## 🚨 **ISSUE IDENTIFIED**

**Your TikTok webhook server is NOT externally accessible!**

**Test Results:**
- ✅ Domain resolves: `api.phantomgear.it.com` → `70.189.130.198`
- ✅ Server running: Local ports 80/443 active
- ❌ External TCP 443: **FAILED**
- ❌ External TCP 80: **FAILED**

**Root Cause**: Router port forwarding is not configured correctly.

## 🎯 **IMMEDIATE FIX: Configure Router Port Forwarding**

### **Step 1: Access Your Router**

**Try these router admin URLs in your browser:**
- `http://192.168.1.1` (most common)
- `http://192.168.0.1` (alternative)
- `http://10.0.0.1` (some routers)

**Default Login (try these combinations):**
- Username: `admin` Password: `admin`
- Username: `admin` Password: `password`
- Username: `admin` Password: (blank)
- Check router label for default credentials

### **Step 2: Find Port Forwarding Section**

Look for sections named:
- **"Port Forwarding"**
- **"Virtual Server"** 
- **"NAT Forwarding"**
- **"Applications & Gaming"**
- **"Advanced" → "Port Forwarding"**

### **Step 3: Add These Exact Rules**

**Rule 1: HTTPS (Port 443)**
```
Service Name: TikTok HTTPS
Protocol: TCP
External/WAN Port: 443
Internal/LAN IP: 192.168.0.187
Internal/LAN Port: 443
Status: Enabled
```

**Rule 2: HTTP (Port 80)**  
```
Service Name: TikTok HTTP
Protocol: TCP
External/WAN Port: 80
Internal/LAN IP: 192.168.0.187
Internal/LAN Port: 80
Status: Enabled
```

### **Step 4: Save and Reboot Router**
- **Save/Apply** the settings
- **Reboot your router** (important!)
- **Wait 2-3 minutes** for restart

## 🔍 **VERIFICATION STEPS**

### **After Router Configuration:**

**Test 1: External Port Check**
Use an online port checker:
- Visit: `https://www.yougetsignal.com/tools/open-ports/`
- Enter IP: `70.189.130.198`
- Test Port: `443`
- Should show: **"Port 443 is open"**

**Test 2: PowerShell Test** (from your PC)
```powershell
Test-NetConnection -ComputerName "api.phantomgear.it.com" -Port 443
# Should show: TcpTestSucceeded: True
```

**Test 3: Mobile Data Test**
- Use your phone's mobile data (not WiFi)
- Visit: `http://api.phantomgear.it.com/health`
- Should return: `{"status": "ok", ...}`

## 📱 **Common Router Models & Instructions**

### **Netgear Routers**
1. Go to `http://192.168.1.1`
2. Login with admin credentials
3. **Advanced** → **Dynamic DNS/Port Forwarding**
4. **Port Forwarding**
5. Add the rules above

### **Linksys Routers**
1. Go to `http://192.168.1.1`
2. **Smart Wi-Fi Tools** → **Port Forwarding**
3. Add **Single Port Forwarding** rules

### **TP-Link Routers**
1. Go to `http://192.168.0.1` or `http://192.168.1.1`
2. **Advanced** → **NAT Forwarding** → **Port Forwarding**
3. Add the TCP rules

### **ASUS Routers**
1. Go to `http://192.168.1.1`
2. **Adaptive QoS** → **Port Forwarding**
3. Add **Port Range Forward** entries

### **Generic Router Steps**
1. Access router web interface
2. Find **Port Forwarding** or **Virtual Server**
3. **Add New Rule**:
   - **Protocol**: TCP
   - **External Port**: 443
   - **Internal IP**: 192.168.0.187
   - **Internal Port**: 443
4. **Repeat for port 80**
5. **Save & Reboot**

## ⚠️ **Troubleshooting**

### **If Port Forwarding Menu Not Found:**
- Look under **"Advanced Settings"**
- Check **"NAT"** or **"Firewall"** sections
- Try **"Gaming"** or **"Applications"** menus

### **If Internal IP Changes:**
**Your current internal IP**: `192.168.0.187`

To make it static:
1. Router settings → **DHCP Reservation**
2. Reserve IP `192.168.0.187` for your PC's MAC address
3. Or set static IP in Windows network settings

### **If Router Blocks Configuration:**
- Check if **UPnP** is enabled (disable it)
- Look for **SPI Firewall** (may need to disable)
- Check **DMZ** option as last resort

## 🎯 **Once Port Forwarding Works:**

### **Test TikTok Webhook URLs:**
1. `https://api.phantomgear.it.com/tiktok`
2. `http://api.phantomgear.it.com/tiktok` (if HTTPS fails)
3. `https://phantomgear.it.com/tiktok`

### **Expected Results:**
- External port test: **PASS**
- TikTok webhook validation: **SUCCESS**
- No more "internal error" from TikTok

## 📞 **Current Status**

- ✅ **Webhook Server**: Running and ready
- ✅ **Domain & DNS**: Working correctly
- ✅ **SSL Certificates**: Generated and loaded
- ❌ **Port Forwarding**: **NEEDS CONFIGURATION**
- ❌ **External Access**: **BLOCKED**

## 🚀 **Next Actions**

1. **Configure router port forwarding** (critical!)
2. **Test external accessibility**
3. **Configure TikTok webhook** with working URL
4. **Monitor server logs** for TikTok requests

**Without port forwarding, TikTok cannot reach your webhook server, which is why all webhook URLs are failing!**

---
*Critical Issue: Port forwarding required for external access - July 18, 2025*
