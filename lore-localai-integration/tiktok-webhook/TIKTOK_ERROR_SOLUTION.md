# 🔧 TikTok "Internal Error - Cannot Determine if URL is Internal" - SOLUTION GUIDE

## 🚨 **ISSUE IDENTIFIED**

You're getting the TikTok error: **"0 Internal error - cannot determine if url is internal"**

This is a common TikTok webhook validation issue. Here's the complete solution:

## ✅ **UPDATED SERVER STATUS**

Your webhook server has been updated with enhanced TikTok validation:
- ✅ **Multiple webhook paths** for better compatibility
- ✅ **Enhanced CORS headers** for TikTok validation  
- ✅ **Improved request logging** to debug TikTok requests
- ✅ **Dedicated validation endpoints** for TikTok testing

## 🌐 **TRY THESE WEBHOOK URLS IN ORDER**

### **1. Primary URL (Original)**
`https://api.phantomgear.it.com/api/webhooks/tiktok`

### **2. Simple Path (Recommended for TikTok)**
`https://api.phantomgear.it.com/tiktok`

### **3. Alternative Path**  
`https://phantomgear.it.com/webhooks/tiktok`

### **4. HTTP Fallback (if HTTPS fails)**
`http://api.phantomgear.it.com/tiktok`

## 🔍 **DIAGNOSTIC STEPS**

### **Step 1: Test URL Accessibility**
Before configuring in TikTok, test these URLs in your browser:

1. **Validation Test**: `https://api.phantomgear.it.com/tiktok/validate`
   - Should return: `{"valid": true, "external": true, ...}`

2. **Health Check**: `https://api.phantomgear.it.com/health`
   - Should return: `{"status": "ok", ...}`

3. **Challenge Test**: `https://api.phantomgear.it.com/tiktok?challenge=TEST123`
   - Should return: `TEST123`

### **Step 2: Verify Port Forwarding**

**CRITICAL**: Ensure your router has these rules configured:

```
Router Configuration:
- TCP Port 443 → 192.168.0.187:443 (HTTPS)
- TCP Port 80 → 192.168.0.187:80 (HTTP)
```

**Test External Access**:
1. Use your phone's mobile data (not WiFi)
2. Visit: `https://api.phantomgear.it.com/tiktok/validate`
3. Should see the validation response

### **Step 3: TikTok Developer Console Configuration**

1. **Go to TikTok Developer Console**
2. **Navigate to Webhooks section**
3. **Try URLs in this order**:
   - First: `https://api.phantomgear.it.com/tiktok`
   - If failed: `https://phantomgear.it.com/tiktok`
   - If still failed: `http://api.phantomgear.it.com/tiktok`

## 🛠️ **COMMON SOLUTIONS**

### **Solution 1: Use Simple Path**
TikTok sometimes has issues with complex paths. Try:
- ❌ Complex: `/api/webhooks/tiktok`  
- ✅ Simple: `/tiktok`

### **Solution 2: Check DNS Propagation**
```powershell
nslookup api.phantomgear.it.com
nslookup phantomgear.it.com
```
Both should resolve to: `70.189.130.198`

### **Solution 3: Test HTTP First**
If HTTPS validation fails, try HTTP temporarily:
- `http://api.phantomgear.it.com/tiktok`

### **Solution 4: Router/Firewall Check**
- Ensure router port forwarding is active
- Check Windows Firewall allows ports 80/443
- Verify ISP isn't blocking incoming connections

## 📋 **DEBUGGING CHECKLIST**

### ✅ **Server Status**
- [ ] Webhook server running on ports 80/443
- [ ] SSL certificates loaded successfully
- [ ] No port binding errors in logs

### ✅ **Network Configuration**  
- [ ] Router port forwarding configured
- [ ] Public IP: `70.189.130.198` accessible
- [ ] Local IP: `192.168.0.187` receiving traffic

### ✅ **DNS Configuration**
- [ ] Domain resolves correctly
- [ ] TXT record for verification present
- [ ] No DNS caching issues

### ✅ **URL Testing**
- [ ] Validation endpoint responds correctly
- [ ] Challenge parameter works
- [ ] External access confirmed

## 🎯 **WHAT TO DO NOW**

### **1. Confirm External Access**
Test from your phone (mobile data):
```
https://api.phantomgear.it.com/tiktok/validate
```

### **2. Configure TikTok Webhook**
Use the simple path in TikTok Developer Console:
```
https://api.phantomgear.it.com/tiktok
```

### **3. Monitor Server Logs**
Watch for TikTok validation attempts:
```
🌐 Request from: [TikTok IP]
🔍 User-Agent: [TikTok User Agent]
🎯 TikTok verification challenge received: [challenge]
```

### **4. If Still Failing**
Try the HTTP version temporarily:
```
http://api.phantomgear.it.com/tiktok
```

## 🔗 **UPDATED ENDPOINTS AVAILABLE**

Your server now responds to:
- `/api/webhooks/tiktok` - Original complex path
- `/webhooks/tiktok` - Alternative path  
- `/tiktok` - Simple path (recommended)
- `/tiktok/validate` - Validation diagnostic
- `/health` - Health check

## 📞 **SUPPORT URLS FOR TESTING**

1. **Validation**: `https://api.phantomgear.it.com/tiktok/validate`
2. **Health**: `https://api.phantomgear.it.com/health`
3. **Challenge**: `https://api.phantomgear.it.com/tiktok?challenge=TEST`
4. **Status**: `https://api.phantomgear.it.com/api/webhooks/tiktok/status`

---

## 🎯 **RECOMMENDED NEXT ACTION**

**Use the simple webhook URL in TikTok**:
```
https://api.phantomgear.it.com/tiktok
```

This should resolve the "cannot determine if url is internal" error!

*Updated: July 18, 2025 - Enhanced TikTok Validation*
