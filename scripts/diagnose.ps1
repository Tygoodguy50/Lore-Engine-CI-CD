# Quick error diagnosis for Bazel + pkg/errors issue

Write-Host "🔍 Bazel Error Diagnosis" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green

# Check current directory
Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Cyan

# Check if key files exist
Write-Host "📄 Checking key files..." -ForegroundColor Cyan
$files = @("MODULE.bazel", "BUILD.bazel", "go.mod", "go.sum")
foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file missing" -ForegroundColor Red
    }
}

# Check MODULE.bazel content
Write-Host "📄 MODULE.bazel content:" -ForegroundColor Cyan
if (Test-Path "MODULE.bazel") {
    $moduleContent = Get-Content "MODULE.bazel" -Raw
    if ($moduleContent.Length -gt 0) {
        Write-Host "✅ MODULE.bazel has content" -ForegroundColor Green
        if ($moduleContent -match "com_github_pkg_errors") {
            Write-Host "✅ pkg/errors is referenced in MODULE.bazel" -ForegroundColor Green
        } else {
            Write-Host "❌ pkg/errors NOT found in MODULE.bazel" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ MODULE.bazel is empty!" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MODULE.bazel not found" -ForegroundColor Red
}

# Check if Bazel is installed
Write-Host "🔧 Checking Bazel installation..." -ForegroundColor Cyan
try {
    $bazelVersion = bazel version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Bazel is installed" -ForegroundColor Green
        Write-Host "Version: $($bazelVersion | Select-String 'Build label')" -ForegroundColor Gray
    } else {
        Write-Host "❌ Bazel command failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Bazel not found in PATH" -ForegroundColor Red
    Write-Host "Please install Bazel from https://bazel.build/install/windows" -ForegroundColor Yellow
}

# Check Go installation
Write-Host "🔧 Checking Go installation..." -ForegroundColor Cyan
try {
    $goVersion = go version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Go is installed: $goVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Go command failed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Go not found in PATH" -ForegroundColor Red
    Write-Host "Please install Go from https://golang.org/dl/" -ForegroundColor Yellow
}

# Check go.mod for pkg/errors
Write-Host "📄 Checking go.mod for pkg/errors..." -ForegroundColor Cyan
if (Test-Path "go.mod") {
    $goModContent = Get-Content "go.mod" -Raw
    if ($goModContent -match "github.com/pkg/errors") {
        Write-Host "✅ pkg/errors found in go.mod" -ForegroundColor Green
        $pkgErrorsLine = Select-String -Pattern "github.com/pkg/errors" -Path "go.mod"
        Write-Host "Line: $pkgErrorsLine" -ForegroundColor Gray
    } else {
        Write-Host "❌ pkg/errors NOT found in go.mod" -ForegroundColor Red
        Write-Host "This might be why it's not being recognized!" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ go.mod not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
Write-Host "==============" -ForegroundColor Cyan

if (!(Test-Path "MODULE.bazel") -or (Get-Content "MODULE.bazel" -Raw).Length -eq 0) {
    Write-Host "1. Fix MODULE.bazel - it's missing or empty" -ForegroundColor Yellow
}

$null = Get-Command "bazel" -ErrorAction SilentlyContinue
if (!$?) {
    Write-Host "2. Install Bazel first" -ForegroundColor Yellow
}

if (Test-Path "go.mod") {
    $goModContent = Get-Content "go.mod" -Raw
    if ($goModContent -notmatch "github.com/pkg/errors") {
        Write-Host "3. Add pkg/errors to go.mod: go get github.com/pkg/errors" -ForegroundColor Yellow
    }
}

Write-Host "4. Run: bazel run //:gazelle" -ForegroundColor Yellow
Write-Host "5. Run: bazel build //cmd/local-ai:local-ai" -ForegroundColor Yellow
