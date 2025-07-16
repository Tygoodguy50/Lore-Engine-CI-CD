# LocalAI Environment Loader Script (PowerShell)
# This script loads environment variables from config.env

param(
    [switch]$Start,
    [switch]$Help
)

$CONFIG_FILE = "config.env"
$SCRIPT_DIR = $PSScriptRoot
$CONFIG_PATH = Join-Path $SCRIPT_DIR $CONFIG_FILE

Write-Host "LocalAI Haunted Hooks Environment Loader" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Show help if requested
if ($Help) {
    Write-Host ""
    Write-Host "Usage: .\load-env.ps1 [OPTIONS]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "  -Start    Load environment and start LocalAI daemon"
    Write-Host "  -Help     Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\load-env.ps1           # Load environment variables"
    Write-Host "  .\load-env.ps1 -Start    # Load environment and start daemon"
    exit 0
}

# Check if config file exists
if (-not (Test-Path $CONFIG_PATH)) {
    Write-Host "ERROR: Configuration file not found: $CONFIG_PATH" -ForegroundColor Red
    Write-Host "HINT: Please copy config.env.example to config.env and configure your settings" -ForegroundColor Yellow
    exit 1
}

Write-Host "Loading configuration from: $CONFIG_PATH" -ForegroundColor Green

# Load environment variables
$LoadedCount = 0
$Lines = Get-Content $CONFIG_PATH

foreach ($Line in $Lines) {
    $Line = $Line.Trim()
    
    # Skip comments and empty lines
    if ($Line -match '^#' -or $Line -eq '') {
        continue
    }
    
    # Parse key=value pairs
    if ($Line -match '^([^=]+)=(.*)$') {
        $Key = $matches[1].Trim()
        $Value = $matches[2].Trim()
        
        # Remove trailing comments
        if ($Value -match '^([^#]*?)(?:#.*)?$') {
            $Value = $matches[1].Trim()
        }
        
        # Remove quotes if present
        $Value = $Value -replace '^["'']|["'']$', ''
        
        # Set environment variable
        [System.Environment]::SetEnvironmentVariable($Key, $Value, [System.EnvironmentVariableTarget]::Process)
        
        # Show loaded variable (mask sensitive values)
        if ($Key -match 'TOKEN|KEY|SECRET') {
            Write-Host "OK $Key=[MASKED]" -ForegroundColor Green
        } else {
            Write-Host "OK $Key=$Value" -ForegroundColor Green
        }
        
        $LoadedCount++
    }
}

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Environment variables loaded successfully!" -ForegroundColor Green
Write-Host "Loaded: $LoadedCount variables" -ForegroundColor Green

# Optional: Start the daemon if requested
if ($Start) {
    Write-Host "Starting LocalAI daemon..." -ForegroundColor Yellow
    
    if (Test-Path ".\local-ai.exe") {
        Write-Host "Executing: local-ai.exe" -ForegroundColor Green
        & ".\local-ai.exe"
    } elseif (Test-Path ".\local-ai") {
        Write-Host "Executing: local-ai" -ForegroundColor Green
        & ".\local-ai"
    } else {
        Write-Host "ERROR: LocalAI binary not found. Please build it first." -ForegroundColor Red
        Write-Host "HINT: Run: go build -o local-ai.exe ./cmd/local-ai" -ForegroundColor Yellow
        exit 1
    }
}
