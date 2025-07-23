# 🌐 Fix DNS Setup for haunted.phantomgear.it.com

## 🎯 The Issue
Your Netlify site deployed successfully, but DNS isn't configured yet. That's why you're getting a 404.

---

## 🚀 **Step 1: Find Your Netlify URL**

1. **Go to your Netlify dashboard** (netlify.com)
2. **Click on your site** (should be named something like "haunted-empire-website")
3. **Look for the site URL** - it will be something like:
   ```
   https://amazing-dragon-123456.netlify.app
   https://wonderful-cat-789012.netlify.app
   https://awesome-unicorn-345678.netlify.app
   ```
4. **Test this URL first** - make sure your Haunted Empire website loads

---

## 🔧 **Step 2: Set Up DNS in Namecheap**

### **Method A: CNAME Record (Recommended)**

1. **Login to Namecheap.com**
2. **Go to Domain List** → **Manage phantomgear.it.com**
3. **Click "Advanced DNS" tab**
4. **Add New Record:**
   - **Type:** `CNAME Record`
   - **Host:** `haunted`
   - **Value:** `your-netlify-url.netlify.app` (WITHOUT the https://)
   - **TTL:** `Automatic` or `300`
5. **Save All Changes**

**Example:**
```
Type: CNAME
Host: haunted
Value: amazing-dragon-123456.netlify.app
TTL: Automatic
```

### **Method B: Alternative - Use Netlify's Name Servers**

If CNAME doesn't work, in Netlify:
1. **Domain settings** → **Add custom domain**
2. **Enter:** `haunted.phantomgear.it.com`
3. **Netlify will give you specific DNS instructions**

---

## ⏰ **Step 3: Wait for DNS Propagation**

- **Propagation time:** 15 minutes to 24 hours
- **Check progress:** Use https://www.whatsmydns.net/
  - Enter: `haunted.phantomgear.it.com`
  - Should show your Netlify IP when ready

---

## 🧪 **Step 4: Test Everything**

### **Quick DNS Test:**
```cmd
nslookup haunted.phantomgear.it.com
```

### **Test URLs:**
1. **Netlify URL:** `https://your-netlify-url.netlify.app` (should work now)
2. **Custom domain:** `https://haunted.phantomgear.it.com` (after DNS propagates)

---

## 🚨 **Common Issues:**

**Problem:** Still getting 404 after setting DNS
- **Solution:** Wait longer (up to 24 hours) or clear DNS cache

**Problem:** Can't find Netlify URL
- **Solution:** In Netlify dashboard, look for "Site overview" - URL is at the top

**Problem:** DNS not updating
- **Solution:** Try deleting and re-adding the CNAME record

**Problem:** HTTPS not working
- **Solution:** Netlify auto-generates SSL - wait 1-2 hours after DNS works

---

## 📋 **What You Need:**

1. **Your Netlify URL** (from Netlify dashboard)
2. **Access to Namecheap DNS** (Advanced DNS tab)
3. **Patience** (DNS can take time to propagate)

---

## ✅ **Success Checklist:**

- [ ] Found your Netlify URL (something.netlify.app)
- [ ] Tested Netlify URL - Haunted Empire site loads
- [ ] Added CNAME record in Namecheap DNS
- [ ] Waited for DNS propagation (15min - 24hrs)
- [ ] Tested https://haunted.phantomgear.it.com - works!

---

## 🎯 **Next Step:**

**Can you find your Netlify URL and share it with me?** 

It should be in your Netlify dashboard and look like:
`https://something-123456.netlify.app`

Once I have that, I can give you the exact DNS settings to add in Namecheap! 🚀
