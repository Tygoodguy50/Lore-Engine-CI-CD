# LocalAI Bazel Build Script for Windows PowerShell

Write-Host "🚀 LocalAI Bazel + Bzlmod Build Script" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Function to run command and check exit code
function Run-Command {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "📦 $Description..." -ForegroundColor Yellow
    Write-Host "Running: $Command" -ForegroundColor Gray
    
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed: $Description" -ForegroundColor Red
        exit $LASTEXITCODE
    }
    Write-Host "✅ Success: $Description" -ForegroundColor Green
    Write-Host ""
}

# Step 1: Update Go dependencies
Write-Host "🔄 Step 1: Updating Go dependencies..." -ForegroundColor Cyan
Run-Command "go mod tidy" "Go mod tidy"

# Step 2: Generate/update Bazel build files
Write-Host "🔄 Step 2: Generating Bazel build files..." -ForegroundColor Cyan
Run-Command "bazel run //:gazelle-update-repos" "Update external repositories"
Run-Command "bazel run //:gazelle" "Generate BUILD files"

# Step 3: Build the project
Write-Host "🔄 Step 3: Building LocalAI..." -ForegroundColor Cyan
Run-Command "bazel build //cmd/local-ai:local-ai" "Build LocalAI binary"

# Step 4: Test the build
Write-Host "🔄 Step 4: Testing the build..." -ForegroundColor Cyan
Run-Command "bazel test //pkg/oci:oci_test" "Run OCI package tests"

# Step 5: Show build outputs
Write-Host "🔄 Step 5: Build outputs..." -ForegroundColor Cyan
$binary_path = "bazel-bin/cmd/local-ai/local-ai.exe"
if (Test-Path $binary_path) {
    Write-Host "✅ Binary built successfully: $binary_path" -ForegroundColor Green
    Write-Host "📏 Binary size: $((Get-Item $binary_path).Length / 1MB) MB" -ForegroundColor Gray
} else {
    Write-Host "❌ Binary not found at expected location" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Build completed successfully!" -ForegroundColor Green
Write-Host "To run the binary: .\bazel-bin\cmd\local-ai\local-ai.exe" -ForegroundColor Yellow
Write-Host ""
Write-Host "📝 Useful commands:" -ForegroundColor Cyan
Write-Host "  bazel run //cmd/local-ai:local-ai       # Run directly with Bazel" -ForegroundColor Gray
Write-Host "  bazel build //...                       # Build all targets" -ForegroundColor Gray
Write-Host "  bazel test //...                        # Run all tests" -ForegroundColor Gray
Write-Host "  bazel query //...                       # List all targets" -ForegroundColor Gray
Write-Host "  bazel clean                             # Clean build artifacts" -ForegroundColor Gray
