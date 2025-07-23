# 🐙 GitHub/Netlify Upload Instructions

## Step-by-Step Git-Based Deployment

### 1. **Create GitHub Repository**
```bash
# Create a new directory for your website
mkdir haunted-empire-website
cd haunted-empire-website

# Copy your website file
# (copy index.html to this folder)

# Initialize git repository
git init
git add index.html
git commit -m "Initial Haunted Empire website"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/haunted-empire-website.git
git push -u origin main
```

### 2. **Deploy to Netlify**
**Option A: Drag & Drop**
- Go to: https://netlify.com
- Drag your `index.html` file directly to Netlify dashboard
- Netlify will assign a random URL like: `https://random-name-123.netlify.app`

**Option B: Connect GitHub**
- Connect your GitHub repository to Netlify
- Auto-deploy on every commit

### 3. **Set Custom Domain**
- In Netlify dashboard: Site settings → Domain management
- Add custom domain: `haunted.phantomgear.it.com`
- Netlify will provide DNS instructions
- Update your DNS with the CNAME record pointing to Netlify

### 4. **Deploy to Vercel** (Alternative)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy your site
vercel --prod

# Set custom domain in Vercel dashboard
```

---

## ✅ Git Deployment Checklist:
- [ ] Repository created with index.html
- [ ] Deployed to Netlify/Vercel  
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] HTTPS working automatically
