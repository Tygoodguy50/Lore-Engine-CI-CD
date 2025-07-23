# 📡 FTP/SFTP Upload Instructions

## Step-by-Step FTP Upload Process

### 1. **Get FTP Credentials**
You'll need from your hosting provider:
- **FTP Host:** ftp.phantomgear.it.com (or similar)
- **Username:** Your hosting username
- **Password:** Your hosting password
- **Port:** 21 (FTP) or 22 (SFTP)

### 2. **Choose FTP Client**
**Windows Options:**
- FileZilla (Free) - https://filezilla-project.org/
- WinSCP (Free) - https://winscp.net/
- Built-in Windows FTP (Command line)

### 3. **Connect to Server**
**Using FileZilla:**
- Open FileZilla
- Enter Host: `ftp.phantomgear.it.com`
- Username: Your FTP username
- Password: Your FTP password
- Port: 21 (or 22 for SFTP)
- Click "Quickconnect"

### 4. **Navigate to Subdomain Folder**
- Look for your subdomain folder, typically:
  - `/public_html/haunted/`
  - `/www/haunted/`  
  - `/domains/phantomgear.it.com/public_html/haunted/`

### 5. **Upload Your File**
- Drag `index.html` from local computer (left pane)
- Drop it into the subdomain folder (right pane)
- Wait for upload to complete (100%)

### 6. **Set Permissions** (if needed)
- Right-click on uploaded `index.html`
- Select "File permissions" or "Properties"
- Set to: 644 (or rw-r--r--)

---

## 🖥️ Command Line FTP (Windows)

```cmd
# Open command prompt and connect
ftp ftp.phantomgear.it.com

# Login with your credentials
# Navigate to subdomain folder
cd public_html/haunted

# Upload your file
put index.html

# Quit FTP
quit
```

---

## ✅ FTP Upload Checklist:
- [ ] FTP credentials obtained from hosting provider
- [ ] FTP client installed (FileZilla recommended)
- [ ] Connected to server successfully
- [ ] Navigated to correct subdomain folder
- [ ] Uploaded index.html file
- [ ] Set correct file permissions (644)
- [ ] Tested website URL
