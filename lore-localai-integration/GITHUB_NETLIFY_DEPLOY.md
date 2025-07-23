# 🚀 GitHub + Netlify Deployment Guide

## ✅ Repository Ready! 
Your `haunted-empire-website` folder is ready with your business website.

---

## **Step 1: Push to GitHub**

### **Create GitHub Repository:**
1. **Go to GitHub.com** and sign in
2. **Click "New Repository"** (+ icon, top right)
3. **Repository name:** `haunted-empire-website`
4. **Description:** `Business website for PhantomGear Technologies - Stripe verification`
5. **Set to Public** (required for free Netlify)
6. **Don't check** "Add README" (we already have files)
7. **Click "Create repository"**

### **Push Your Code:**
```powershell
# From your project directory, run:
cd haunted-empire-website

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/haunted-empire-website.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## **Step 2: Deploy to Netlify**

### **Connect GitHub to Netlify:**
1. **Go to Netlify.com** and sign up/sign in
2. **Click "Add new site"** → **"Import an existing project"**
3. **Choose "GitHub"** as your Git provider
4. **Authorize Netlify** to access your GitHub
5. **Select your repository:** `haunted-empire-website`
6. **Deploy settings:**
   - **Branch:** `main`
   - **Build command:** (leave empty)
   - **Publish directory:** (leave empty, defaults to root)
7. **Click "Deploy site"**

### **Your Site is Live!**
- Netlify will give you a URL like: `https://amazing-unicorn-123456.netlify.app`
- Your website is now live and automatically deployed! 🎉

---

## **Step 3: Set Custom Domain**

### **Configure Custom Domain in Netlify:**
1. **In Netlify dashboard:** Go to your site
2. **Click "Domain settings"** 
3. **Click "Add custom domain"**
4. **Enter:** `haunted.phantomgear.it.com`
5. **Click "Verify"** → **"Yes, add domain"**

### **Update DNS in Namecheap:**
1. **Go to Namecheap.com** → **Domain List** → **Manage phantomgear.it.com**
2. **Advanced DNS** tab
3. **Add new record:**
   - **Type:** `CNAME`
   - **Host:** `haunted`
   - **Value:** `amazing-unicorn-123456.netlify.app` (your Netlify URL without https://)
   - **TTL:** `Automatic`
4. **Save changes**

### **Wait for DNS + SSL:**
- **DNS Propagation:** 1-24 hours
- **SSL Certificate:** Netlify auto-generates (free HTTPS!)
- **Final URL:** `https://haunted.phantomgear.it.com`

---

## **🎯 Advantages of This Method:**

✅ **Automatic HTTPS** - Free SSL certificate  
✅ **Global CDN** - Fast loading worldwide  
✅ **Easy Updates** - Push to GitHub = auto-deploy  
✅ **Professional Setup** - Enterprise-grade hosting  
✅ **Free Hosting** - No monthly costs  

---

## **Step 4: Test & Update**

### **Test Your Website:**
```powershell
# Test your local setup first
cd haunted-empire-website
# Open index.html in browser to verify it looks correct
```

### **Make Future Updates:**
```powershell
# Edit index.html
# Then push changes:
git add .
git commit -m "Updated business information"
git push

# Netlify automatically deploys in ~1 minute!
```

---

## **Step 5: Update Stripe Account**

Once `https://haunted.phantomgear.it.com` is live:

1. **Go to Stripe Dashboard:** https://dashboard.stripe.com/account/details
2. **Update Website:** `https://haunted.phantomgear.it.com`
3. **Business Name:** `PhantomGear Technologies`
4. **Complete verification process**

---

## **🚨 Troubleshooting:**

**Problem: GitHub asks for authentication**
```powershell
# Use GitHub CLI or Personal Access Token
# Or use GitHub Desktop app (easier)
```

**Problem: DNS not working**
- Wait 24 hours for propagation
- Check DNS with: nslookup haunted.phantomgear.it.com
- Verify CNAME points to your Netlify URL

**Problem: SSL certificate pending**
- Wait 1-2 hours for Netlify to generate
- Ensure DNS is working first

---

## **✅ Success Checklist:**
- [ ] Repository created on GitHub
- [ ] Code pushed to GitHub successfully
- [ ] Site deployed to Netlify
- [ ] Custom domain added in Netlify
- [ ] DNS CNAME record added in Namecheap
- [ ] HTTPS working at haunted.phantomgear.it.com
- [ ] Stripe account updated with website URL

**This method gives you a professional, scalable deployment that's perfect for business verification!** 🚀
