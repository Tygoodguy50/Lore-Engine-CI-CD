# LocalAI Bazel Setup Script for Windows

Write-Host "🔧 LocalAI Bazel Setup and Installation" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Function to check if a command exists
function Test-Command {
    param([string]$Command)
    $null = Get-Command $Command -ErrorAction SilentlyContinue
    return $?
}

# Function to run command with error handling
function Invoke-SafeCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "📦 $Description..." -ForegroundColor Yellow
    Write-Host "Running: $Command" -ForegroundColor Gray
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
        Write-Host "✅ Success: $Description" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
        return $false
    }
}

# Step 1: Check prerequisites
Write-Host "🔍 Step 1: Checking prerequisites..." -ForegroundColor Cyan

# Check for Go
if (Test-Command "go") {
    $goVersion = go version
    Write-Host "✅ Go found: $goVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Go not found. Please install Go from https://golang.org/dl/" -ForegroundColor Red
    exit 1
}

# Check for Bazel
if (Test-Command "bazel") {
    $bazelVersion = bazel version
    Write-Host "✅ Bazel found: $bazelVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Bazel not found. Installing Bazel..." -ForegroundColor Yellow
    
    # Check for Chocolatey
    if (Test-Command "choco") {
        Write-Host "Installing Bazel via Chocolatey..." -ForegroundColor Yellow
        if (Invoke-SafeCommand "choco install bazel" "Install Bazel via Chocolatey") {
            Write-Host "✅ Bazel installed successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install Bazel via Chocolatey" -ForegroundColor Red
            Write-Host "Please install Bazel manually from https://bazel.build/install/windows" -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "❌ Chocolatey not found. Please install Bazel manually from https://bazel.build/install/windows" -ForegroundColor Red
        Write-Host "Or install Chocolatey first: https://chocolatey.org/install" -ForegroundColor Yellow
        exit 1
    }
}

# Step 2: Verify project structure
Write-Host "🔍 Step 2: Verifying project structure..." -ForegroundColor Cyan

$requiredFiles = @("MODULE.bazel", "BUILD.bazel", "go.mod")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        exit 1
    }
}

# Step 3: Initialize Go module
Write-Host "🔍 Step 3: Initializing Go module..." -ForegroundColor Cyan
if (Invoke-SafeCommand "go mod tidy" "Update Go dependencies") {
    Write-Host "✅ Go module initialized" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to initialize Go module" -ForegroundColor Red
    exit 1
}

# Step 4: Test Bazel configuration
Write-Host "🔍 Step 4: Testing Bazel configuration..." -ForegroundColor Cyan

# Test basic Bazel query
if (Invoke-SafeCommand "bazel query //..." "Query all targets") {
    Write-Host "✅ Basic Bazel configuration working" -ForegroundColor Green
} else {
    Write-Host "❌ Bazel configuration has issues" -ForegroundColor Red
    Write-Host "Let's try to see what's wrong..." -ForegroundColor Yellow
    
    # Try to run gazelle to generate BUILD files
    if (Invoke-SafeCommand "bazel run //:gazelle" "Generate BUILD files") {
        Write-Host "✅ Gazelle run successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Gazelle failed - this might be the issue!" -ForegroundColor Red
    }
}

# Step 5: Check for pkg/errors specifically
Write-Host "🔍 Step 5: Checking pkg/errors resolution..." -ForegroundColor Cyan

if (Invoke-SafeCommand "bazel query '@com_github_pkg_errors//...'" "Query pkg/errors repository") {
    Write-Host "✅ pkg/errors repository found and accessible" -ForegroundColor Green
} else {
    Write-Host "❌ pkg/errors repository not found" -ForegroundColor Red
    Write-Host "This is the core issue we need to fix!" -ForegroundColor Yellow
    
    # Try to force repository update
    Write-Host "Attempting to force repository update..." -ForegroundColor Yellow
    if (Invoke-SafeCommand "bazel sync --configure" "Force repository sync") {
        Write-Host "✅ Repository sync completed" -ForegroundColor Green
    } else {
        Write-Host "❌ Repository sync failed" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎯 Setup Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "If all steps passed, you should be able to build with:" -ForegroundColor Gray
Write-Host "  bazel build //cmd/local-ai:local-ai" -ForegroundColor White
Write-Host ""
Write-Host "If pkg/errors is still not found, the issue is in MODULE.bazel" -ForegroundColor Gray
Write-Host "Check that 'com_github_pkg_errors' is in the use_repo(...) list" -ForegroundColor Gray
