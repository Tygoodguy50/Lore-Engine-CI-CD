# Debug script for pkg/errors issue with Bazel + Bzlmod

Write-Host "🐛 Debugging pkg/errors issue with Bazel + Bzlmod" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green

# Function to run command and show output
function Run-Debug-Command {
    param(
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "🔍 $Description..." -ForegroundColor Yellow
    Write-Host "Running: $Command" -ForegroundColor Gray
    
    $output = Invoke-Expression $Command 2>&1
    Write-Host $output -ForegroundColor White
    Write-Host ""
}

# Step 1: Check if pkg/errors is in go.mod
Write-Host "🔄 Step 1: Checking go.mod for pkg/errors..." -ForegroundColor Cyan
if (Test-Path "go.mod") {
    $gomod_content = Get-Content "go.mod"
    $pkg_errors_line = $gomod_content | Select-String "github.com/pkg/errors"
    if ($pkg_errors_line) {
        Write-Host "✅ Found pkg/errors in go.mod:" -ForegroundColor Green
        Write-Host $pkg_errors_line -ForegroundColor White
    } else {
        Write-Host "❌ pkg/errors not found in go.mod" -ForegroundColor Red
        Write-Host "Adding pkg/errors as direct dependency..." -ForegroundColor Yellow
        go get github.com/pkg/errors
    }
} else {
    Write-Host "❌ go.mod not found" -ForegroundColor Red
}

# Step 2: Check Bazel external repositories
Write-Host "🔄 Step 2: Checking Bazel external repositories..." -ForegroundColor Cyan
Run-Debug-Command "bazel query @com_github_pkg_errors//..." "Query pkg/errors repository"

# Step 3: Check if the repository is being generated
Write-Host "🔄 Step 3: Checking external repositories..." -ForegroundColor Cyan
Run-Debug-Command "bazel query 'kind(.*_repository, @...)" "List all external repositories"

# Step 4: Check use_repo declarations
Write-Host "🔄 Step 4: Checking MODULE.bazel use_repo declarations..." -ForegroundColor Cyan
if (Test-Path "MODULE.bazel") {
    $module_content = Get-Content "MODULE.bazel"
    $use_repo_lines = $module_content | Select-String "use_repo"
    if ($use_repo_lines) {
        Write-Host "✅ Found use_repo declarations:" -ForegroundColor Green
        foreach ($line in $use_repo_lines) {
            Write-Host $line -ForegroundColor White
        }
    } else {
        Write-Host "❌ No use_repo declarations found" -ForegroundColor Red
    }
} else {
    Write-Host "❌ MODULE.bazel not found" -ForegroundColor Red
}

# Step 5: Try to build a target that uses pkg/errors
Write-Host "🔄 Step 5: Testing build with pkg/errors..." -ForegroundColor Cyan
Run-Debug-Command "bazel build //pkg/oci:oci --verbose_failures" "Build OCI package with verbose output"

# Step 6: Show detailed dependency information
Write-Host "🔄 Step 6: Detailed dependency analysis..." -ForegroundColor Cyan
Run-Debug-Command "bazel query 'deps(//pkg/oci:oci)'" "Show dependencies of OCI package"

Write-Host ""
Write-Host "🔧 Troubleshooting tips:" -ForegroundColor Cyan
Write-Host "1. Make sure pkg/errors is in go.mod (not just indirect)" -ForegroundColor Gray
Write-Host "2. Check that com_github_pkg_errors is in use_repo(...)" -ForegroundColor Gray
Write-Host "3. Run 'bazel run //:gazelle-update-repos' to regenerate" -ForegroundColor Gray
Write-Host "4. Check bazel-external/ directory for the repository" -ForegroundColor Gray
