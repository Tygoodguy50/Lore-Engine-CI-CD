<#
Reusable health check script for backend (port 3300) and optional LocalAI/dispatcher (port 8081).
Features:
  * Optional launch step via launch.ps1 (-LaunchFirst)
  * Multi-port probe (first 200 response wins)
  * Optional Windows Service precondition (-RequireServiceName)
  * Writes HEALTH_CHECK_RESULT.txt
  * Optional Discord webhook notification
Usage examples:
  pwsh ./scripts/health-check.ps1
  pwsh ./scripts/health-check.ps1 -Ports 3300,8081 -TimeoutSeconds 75 -LaunchFirst
  pwsh ./scripts/health-check.ps1 -RequireServiceName HauntedEmpireBackend
#>
param(
  [int[]]$Ports = @(3300,8081),
  [int]$TimeoutSeconds = 60,
  [switch]$LaunchFirst,
  [string]$DiscordWebhook = $env:DISCORD_WEBHOOK_URL,
  [switch]$SkipBash,
  [string]$RequireServiceName
)

# Env-based override (only if -Ports not explicitly provided)
if(-not $PSBoundParameters.ContainsKey('Ports')){
  try {
    $rawList = $env:HEALTH_PORTS
    if(-not [string]::IsNullOrWhiteSpace($rawList)){
      $parsed = @(); foreach($tok in ($rawList -split '[,;\s]')){ if($tok -match '^\d+$'){ $parsed += [int]$tok } }
      if($parsed.Count -gt 0){ $Ports = $parsed }
    } elseif($env:BACKEND_PORT -or $env:LOCALAI_PORT){
      $list = @(); if($env:BACKEND_PORT -match '^\d+$'){ $list += [int]$env:BACKEND_PORT }; if($env:LOCALAI_PORT -match '^\d+$'){ $list += [int]$env:LOCALAI_PORT }
      if($list.Count -gt 0){ $Ports = @(); foreach($p in $list){ if(-not ($Ports -contains $p)){ $Ports += $p } } }
    }
  } catch { Write-Host "[health] Env port override parse error: $($_.Exception.Message)" -ForegroundColor Yellow }
}

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$root = Split-Path $here -Parent
$outFile = Join-Path $root 'HEALTH_CHECK_RESULT.txt'

function Write-Result($msg){ $msg | Out-File $outFile -Encoding UTF8 }
function Notify($msg){ if($DiscordWebhook){ try { Invoke-RestMethod -Uri $DiscordWebhook -Method Post -Body (@{content=$msg}|ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop | Out-Null } catch { Write-Warning "Webhook failed: $_" } } }

if($RequireServiceName){
  $svc = Get-Service -Name $RequireServiceName -ErrorAction SilentlyContinue
  if(-not $svc -or $svc.Status -ne 'Running'){
    $m = "Service '$RequireServiceName' not running"
    Write-Host "[health] $m" -ForegroundColor Red
    Write-Result $m
    Notify "Health check failed: $m"
    exit 1
  }
}

if($LaunchFirst){
  $launch = Join-Path $root 'launch.ps1'
  if(Test-Path $launch){
    Write-Host "[health] Launching backend before health probe (-SkipBash=$($SkipBash.IsPresent))" -ForegroundColor Cyan
    $params = @{ Ports = $Ports; TimeoutSeconds = $TimeoutSeconds; SkipBash = $SkipBash.IsPresent }
    & $launch @params
    $code = $LASTEXITCODE
    if($code -ne 0){
      $m = "Launch script reported failure (exit $code)"
      Write-Host "[health] $m" -ForegroundColor Red
      Write-Result $m
      Notify "Health check failed: $m"
      exit 1
    }
  } else {
    Write-Host "[health] launch.ps1 not found; continuing with existing processes" -ForegroundColor Yellow
  }
}

Write-Host "[health] Probing ports: $($Ports -join ', ') (timeout ${TimeoutSeconds}s)" -ForegroundColor Cyan
$start = Get-Date
$healthy = $false
$content = $null
while(-not $healthy -and ((Get-Date)-$start).TotalSeconds -lt $TimeoutSeconds){
  foreach($p in $Ports){
    try {
      $resp = Invoke-WebRequest -Uri "http://localhost:$p/health" -UseBasicParsing -TimeoutSec 6
      if($resp.StatusCode -eq 200){
        $healthy = $true; $content = $resp.Content; $healthyPort = $p; break
      }
    } catch { Start-Sleep -Milliseconds 250 }
  }
  if(-not $healthy){ Start-Sleep -Seconds 1 }
}

if($healthy){
  Write-Host "[health] ✅ Healthy on port $healthyPort" -ForegroundColor Green
  Write-Result $content
  Notify "Health check passed (port $healthyPort)"
  exit 0
} else {
  $m = "No healthy endpoints after $TimeoutSeconds seconds (ports: $($Ports -join ', '))"
  Write-Host "[health] ❌ $m" -ForegroundColor Red
  Write-Result $m
  Notify "Health check failed: $m"
  exit 1
}
