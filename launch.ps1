<#
  Unified PowerShell launch script for Lore Engine / Haunted Empire backend.
  Responsibilities:
    - Optionally launch Node backend (haunted-empire-backend-1/server.js)
    - Optionally invoke bash launch.sh (if present & bash available) for LocalAI stack
    - Poll health endpoints on candidate ports until healthy or timeout
    - Write status artifacts: DEPLOYMENT_LOG.txt, HEALTH_CHECK_RESULT.txt
  Usage:
  ./launch.ps1 -Ports 8081,3300 -TimeoutSeconds 60 -SkipBash
#>
param(
  # Order ports with backend first for faster success detection (can be overridden by env vars)
  [int[]]$Ports = @(3300,8081),
  [int]$TimeoutSeconds = 60,
  [switch]$SkipBash,
  [switch]$SkipNode
)

# Env-based override precedence (only when -Ports NOT explicitly passed):
# 1) HEALTH_PORTS (comma/space/semicolon separated list) e.g. "3300,8081"
# 2) BACKEND_PORT [+ LOCALAI_PORT]
# 3) Built-in default @(3300,8081)
if(-not $PSBoundParameters.ContainsKey('Ports')){
  try {
    $rawList = $env:HEALTH_PORTS
    if(-not [string]::IsNullOrWhiteSpace($rawList)){
      $parsed = @();
      foreach($tok in ($rawList -split '[,;\s]')){ if($tok -match '^\d+$'){ $parsed += [int]$tok } }
      if($parsed.Count -gt 0){ $Ports = $parsed }
    } elseif($env:BACKEND_PORT -or $env:LOCALAI_PORT){
      $list = @();
      if($env:BACKEND_PORT -match '^\d+$'){ $list += [int]$env:BACKEND_PORT }
      if($env:LOCALAI_PORT -match '^\d+$'){ $list += [int]$env:LOCALAI_PORT }
      if($list.Count -gt 0){
        # Remove duplicates preserving order
        $Ports = @(); foreach($p in $list){ if(-not ($Ports -contains $p)){ $Ports += $p } }
      }
    }
  } catch { Write-Host "[launch] Env port override parse error: $($_.Exception.Message)" -ForegroundColor Yellow }
}

$ErrorActionPreference = 'Stop'
$startTime = Get-Date
Write-Host "[launch] Starting unified launch script..." -ForegroundColor Cyan

$pids = @{}

# Handle accidental concatenation of ports (e.g., 33008081) if PowerShell parsed a single int
if($Ports.Count -eq 1 -and $Ports[0] -gt 65535){
  $digits = ($Ports[0]).ToString()
  $groups = [regex]::Matches($digits,'\d{4}')
  if($groups.Count -gt 1){
    $Ports = @(); foreach($g in $groups){ $Ports += [int]$g.Value }
    Write-Host "[launch] Corrected concatenated port argument -> $($Ports -join ', ')" -ForegroundColor Yellow
  }
}

function Start-NodeBackend {
  # Backend is a sibling directory to this repo root
  $serverDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'haunted-empire-backend-1'
  $entryCandidates = @('index.js','server.js')
  $serverPath = $null
  foreach ($c in $entryCandidates) { $p = Join-Path $serverDir $c; if (Test-Path $p) { $serverPath = $p; break } }
  if (-not $serverPath) { Write-Host "[launch] Node backend entry not found (checked: $($entryCandidates -join ', '))" -ForegroundColor Yellow; return }
  $which = Split-Path $serverPath -Leaf
  Write-Host "[launch] Starting Node backend using $which..." -ForegroundColor Cyan
  $logDir = Join-Path $PSScriptRoot 'logs'; if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
  $stdoutLog = Join-Path $logDir 'backend.stdout.log'
  $stderrLog = Join-Path $logDir 'backend.stderr.log'
  # Use unique per-session log files to avoid sharing violations
  $sessionTag = Get-Date -Format 'yyyyMMdd_HHmmss_fff'
  $sessionStdout = Join-Path $logDir "backend.$sessionTag.stdout.log"
  $sessionStderr = Join-Path $logDir "backend.$sessionTag.stderr.log"
  "[launch] Session $sessionTag starting $(Get-Date -Format o)" | Out-File $sessionStdout
  "[launch] Session $sessionTag starting $(Get-Date -Format o)" | Out-File $sessionStderr
  # Point canonical log names to newest session (copy header)
  try { Copy-Item $sessionStdout $stdoutLog -Force } catch {}
  try { Copy-Item $sessionStderr $stderrLog -Force } catch {}
  # Attempt to free target backend port (assumes first provided port or default 3300 after migration from 3002)
  $backendPort = 3300
  if($Ports -and $Ports.Length -gt 0){ $backendPort = $Ports[0] }
  try {
    $conns = Get-NetTCPConnection -LocalPort $backendPort -ErrorAction SilentlyContinue | Where-Object { $_.State -eq 'Listen' }
    foreach($c in $conns){
      try {
        $ownPid = $c.OwningProcess
        if($ownPid){
          $p = Get-Process -Id $ownPid -ErrorAction SilentlyContinue
          if($p -and $p.ProcessName -match 'node'){
            Write-Host "[launch] Terminating existing node on port $backendPort (PID $ownPid)" -ForegroundColor Yellow
            Stop-Process -Id $ownPid -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 300
          }
        }
      } catch {}
    }
  } catch { Write-Host "[launch] Port free attempt skipped: $($_.Exception.Message)" -ForegroundColor DarkGray }
  # Kill any stale node process still pointing at backend dir to avoid serving old code
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like "*haunted-empire-backend-1*" } | ForEach-Object { try { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue } catch {} }
  # Export PORT env var for this process so index.js respects alternate port
  $prevPortEnv = $env:PORT
  $env:PORT = $backendPort
  $proc = Start-Process -FilePath node -ArgumentList $serverPath -WorkingDirectory $serverDir -RedirectStandardOutput $sessionStdout -RedirectStandardError $sessionStderr -PassThru -WindowStyle Hidden
  # Restore environment to avoid leaking to later steps
  $env:PORT = $prevPortEnv
  $pids['node'] = $proc.Id
  Write-Host "[launch] Node backend PID: $($proc.Id) (logs: $sessionStdout / $sessionStderr)" -ForegroundColor Green
  # Best effort marker (ignore sharing violation)
  try { "[launch] Started $which at $(Get-Date -Format o) PID=$($proc.Id)" | Add-Content $sessionStdout } catch {}
}

function Start-BashLaunch {
  $bashLaunch = Join-Path $PSScriptRoot 'launch.sh'
  if (-not (Test-Path $bashLaunch)) { Write-Host "[launch] launch.sh not found, skipping" -ForegroundColor Yellow; return }
  if (-not (Get-Command bash -ErrorAction SilentlyContinue)) { Write-Host "[launch] bash not available, skipping launch.sh" -ForegroundColor Yellow; return }
  Write-Host "[launch] Starting bash launch.sh (background)" -ForegroundColor Cyan
  $proc = Start-Process bash -ArgumentList @('launch.sh','--env=production','--build-only') -PassThru -WindowStyle Hidden
  $pids['bash'] = $proc.Id
  Write-Host "[launch] bash launch PID: $($proc.Id)" -ForegroundColor Green
}

if (-not $SkipNode) { Start-NodeBackend }
if (-not $SkipBash) { Start-BashLaunch }

function Test-Health {
  param([int]$Port)
  try {
    $resp = Invoke-WebRequest -Uri "http://localhost:$Port/health" -UseBasicParsing -TimeoutSec 5
    if ($resp.StatusCode -eq 200) { return $true }
  } catch { return $false }
  return $false
}

Write-Host "[launch] Polling health endpoints: $($Ports -join ', ') (timeout ${TimeoutSeconds}s)" -ForegroundColor Cyan
$healthy = $false
$healthyPort = $null
while (-not $healthy -and ((Get-Date) - $startTime).TotalSeconds -lt $TimeoutSeconds) {
  foreach ($p in $Ports) {
    if (Test-Health -Port $p) { $healthy = $true; $healthyPort = $p; break }
  }
  if (-not $healthy) { Start-Sleep -Seconds 2 }
}

if ($healthy) {
  Write-Host "[launch] ✅ Healthy on port $healthyPort" -ForegroundColor Green
  "Healthy on port $healthyPort at $(Get-Date -Format o)" | Out-File HEALTH_CHECK_RESULT.txt
  "Deployment succeeded $(Get-Date -Format o)" | Out-File DEPLOYMENT_LOG.txt -Append
  exit 0
} else {
  Write-Host "[launch] ❌ Health check failed after $TimeoutSeconds seconds" -ForegroundColor Red
  "Health check failed after $TimeoutSeconds seconds at $(Get-Date -Format o)" | Out-File HEALTH_CHECK_RESULT.txt
  "Deployment failed $(Get-Date -Format o)" | Out-File DEPLOYMENT_LOG.txt -Append
  exit 1
}