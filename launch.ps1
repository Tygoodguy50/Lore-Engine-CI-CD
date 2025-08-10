<#
  Unified PowerShell launch script for Lore Engine / Haunted Empire backend.
  Responsibilities:
    - Optionally launch Node backend (haunted-empire-backend-1/server.js)
    - Optionally invoke bash launch.sh (if present & bash available) for LocalAI stack
    - Poll health endpoints on candidate ports until healthy or timeout
    - Write status artifacts: DEPLOYMENT_LOG.txt, HEALTH_CHECK_RESULT.txt
  Usage:
    ./launch.ps1 -Ports 8081,3002 -TimeoutSeconds 60 -SkipBash
#>
param(
  [int[]]$Ports = @(8081,3002),
  [int]$TimeoutSeconds = 60,
  [switch]$SkipBash,
  [switch]$SkipNode
)

$ErrorActionPreference = 'Stop'
$startTime = Get-Date
Write-Host "[launch] Starting unified launch script..." -ForegroundColor Cyan

$pids = @{}

function Start-NodeBackend {
  # Backend is a sibling directory to this repo root
  $serverDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'haunted-empire-backend-1'
  $entryCandidates = @('index.js','server.js')
  $serverPath = $null
  foreach ($c in $entryCandidates) { $p = Join-Path $serverDir $c; if (Test-Path $p) { $serverPath = $p; break } }
  if (-not $serverPath) { Write-Host "[launch] Node backend entry not found (checked: $($entryCandidates -join ', '))" -ForegroundColor Yellow; return }
  Write-Host "[launch] Starting Node backend using $(Split-Path $serverPath -Leaf)..." -ForegroundColor Cyan
  $logDir = Join-Path $PSScriptRoot 'logs'; if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
  $stdoutLog = Join-Path $logDir 'backend.stdout.log'
  $stderrLog = Join-Path $logDir 'backend.stderr.log'
  if (Test-Path $stdoutLog) { Remove-Item $stdoutLog -Force }
  if (Test-Path $stderrLog) { Remove-Item $stderrLog -Force }
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = 'node'
  $psi.Arguments = '"' + $serverPath + '"'
  $psi.WorkingDirectory = (Split-Path $serverPath -Parent)
  $psi.RedirectStandardOutput = $true
  $psi.RedirectStandardError = $true
  $psi.UseShellExecute = $false
  $proc = New-Object System.Diagnostics.Process
  $proc.StartInfo = $psi
  $null = $proc.Start()
  $pids['node'] = $proc.Id
  Write-Host "[launch] Node backend PID: $($proc.Id)" -ForegroundColor Green
  Start-Job -ScriptBlock { param($pid,$out,$err)
      try { $p = Get-Process -Id $pid -ErrorAction Stop; while(-not $p.HasExited){ if($p.StandardOutput.Peek() -ge 0){ $p.StandardOutput.ReadToEnd() | Add-Content $out }; if($p.StandardError.Peek() -ge 0){ $p.StandardError.ReadToEnd() | Add-Content $err }; Start-Sleep -Milliseconds 300; $p.Refresh() } } catch {} } -ArgumentList $proc.Id,$stdoutLog,$stderrLog | Out-Null
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