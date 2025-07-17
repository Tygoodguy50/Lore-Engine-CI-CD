param(
    [switch]$Debug,
    [switch]$InjectArtifacts,
    [switch]$NoPreload,
    [switch]$Help
)

if ($Help) {
    Write-Host "🚀 LocalAI Launch Script for Windows" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "Usage: .\launch.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Debug              Enable debug mode"
    Write-Host "  -InjectArtifacts    Enable artifact injection"
    Write-Host "  -NoPreload          Disable model preloading"
    Write-Host "  -Help               Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\launch.ps1                    # Normal launch"
    Write-Host "  .\launch.ps1 -Debug             # Debug mode"
    Write-Host "  .\launch.ps1 -InjectArtifacts   # With artifact injection"
    Write-Host ""
    exit 0
}

# Configuration
$ScriptDir = $PSScriptRoot
$BinaryPath = "$ScriptDir\bazel-bin\local-ai_\local-ai.exe"
$LogDir = "$ScriptDir\logs"
$ModelsDir = "$ScriptDir\models"
$ConfigDir = "$ScriptDir\config"

# Environment Variables
$env:CGO_ENABLED = "0"
$env:GOOS = "windows"
$env:GOARCH = "amd64"
$env:LOCALAI_DEBUG = "true"
$env:LOCALAI_LOG_LEVEL = "debug"

# Banner
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                         🚀 LocalAI Launch Script                            ║" -ForegroundColor Magenta
Write-Host "║                      Bazel + Bzlmod + Auto Model Loading                    ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Pre-flight checks
Write-Host "🔍 Running pre-flight checks..." -ForegroundColor Green

if (-not (Test-Path $BinaryPath)) {
    Write-Host "ERROR: LocalAI binary not found at: $BinaryPath" -ForegroundColor Red
    Write-Host "INFO: Run: bazel build //:local-ai" -ForegroundColor Cyan
    exit 1
}

# Create directories
$LogDir, $ModelsDir, $ConfigDir | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

Write-Host "✅ Pre-flight checks passed" -ForegroundColor Green

# Model Management
Write-Host "📦 Setting up models..." -ForegroundColor Green

# Create configs
"name: phi-2`nbackend: llama`nparameters:`n  model: phi-2`n  context_size: 2048`n  threads: 4`n  f16: true" | Out-File -FilePath "$ConfigDir\phi2.yaml" -Encoding UTF8
"debug: true`nlog_level: debug`nthreads: 8`ncontext_size: 2048`naddress: 0.0.0.0`nport: 8080`ncors: true" | Out-File -FilePath "$ConfigDir\config.yaml" -Encoding UTF8

# Check for model
$phi2Model = "$ModelsDir\phi-2.gguf"
if (-not (Test-Path $phi2Model)) {
    Write-Host "WARNING: Phi-2 model not found, creating placeholder..." -ForegroundColor Yellow
    "# Phi-2 model placeholder" | Out-File -FilePath $phi2Model -Encoding UTF8
}

Write-Host "✅ Models configured" -ForegroundColor Green

# Launch
Write-Host "🚀 Starting LocalAI daemon..." -ForegroundColor Green

$env:LOCALAI_CONFIG_FILE = "$ConfigDir\config.yaml"
$env:LOCALAI_MODELS_PATH = $ModelsDir
$env:LOCALAI_LOG_FILE = "$LogDir\localai.log"

$launchArgs = @(
    "--debug"
    "--log-level=debug"
    "--threads=8"
    "--context-size=2048"
    "--address=0.0.0.0"
    "--port=8080"
)

if ($InjectArtifacts) {
    $launchArgs += "--inject-artifacts"
    Write-Host "🎯 Artifact injection enabled" -ForegroundColor Cyan
}

if (-not $NoPreload) {
    Write-Host "📦 Model preloading enabled" -ForegroundColor Cyan
}

Write-Host "🎛️ Launch configuration:" -ForegroundColor Cyan
$launchArgs | ForEach-Object { Write-Host "   $_" }
Write-Host ""

Write-Host "🚀 Launching LocalAI daemon..." -ForegroundColor Green

try {
    & $BinaryPath @launchArgs
}
catch {
    Write-Host "ERROR: Failed to start LocalAI daemon: $_" -ForegroundColor Red
    exit 1
}
