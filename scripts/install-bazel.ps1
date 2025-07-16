# Install Bazel on Windows

Write-Host "🔧 Installing Bazel on Windows" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check if Chocolatey is available
try {
    $chocoVersion = choco --version
    Write-Host "✅ Chocolatey found: $chocoVersion" -ForegroundColor Green
    
    Write-Host "📦 Installing Bazel via Chocolatey..." -ForegroundColor Yellow
    choco install bazel -y
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bazel installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Bazel via Chocolatey" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Chocolatey not found" -ForegroundColor Red
    Write-Host "🔧 Alternative installation methods:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option 1: Install Chocolatey first, then Bazel" -ForegroundColor Cyan
    Write-Host "Run this in an Admin PowerShell:" -ForegroundColor Gray
    Write-Host "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor White
    Write-Host "Then run: choco install bazel -y" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Download Bazel directly" -ForegroundColor Cyan
    Write-Host "1. Download from: https://github.com/bazelbuild/bazel/releases" -ForegroundColor Gray
    Write-Host "2. Add bazel.exe to your PATH" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Option 3: Use Bazelisk (recommended)" -ForegroundColor Cyan
    Write-Host "1. Download bazelisk from: https://github.com/bazelbuild/bazelisk/releases" -ForegroundColor Gray
    Write-Host "2. Rename to bazel.exe and add to PATH" -ForegroundColor Gray
}

# Test if Bazel is now available
Write-Host ""
Write-Host "🔍 Testing Bazel installation..." -ForegroundColor Cyan
try {
    $bazelVersion = bazel version
    Write-Host "✅ Bazel is now available!" -ForegroundColor Green
    Write-Host $bazelVersion -ForegroundColor Gray
} catch {
    Write-Host "❌ Bazel still not available" -ForegroundColor Red
    Write-Host "You may need to restart your terminal or add Bazel to PATH manually" -ForegroundColor Yellow
}
