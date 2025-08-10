param(
    [string]$DiscordWebhook = $env:DISCORD_WEBHOOK_URL,
    [int[]]$Ports = @(3300,8081),
    [int]$TimeoutSeconds = 60
)

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here
$log = Join-Path $here 'DEPLOYMENT_LOG.txt'
"Deployment started by $env:USERNAME at $(Get-Date -Format o)" | Out-File $log -Encoding UTF8 -Append

function Send-Webhook([string]$Message){
    if($DiscordWebhook){
        try { $body = @{content=$Message}; Invoke-RestMethod -Uri $DiscordWebhook -Method Post -Body ($body|ConvertTo-Json) -ContentType 'application/json' -ErrorAction Stop | Out-Null }
        catch { Write-Warning "Webhook post failed: $_" }
    }
}

try {
    $launchPs1 = Join-Path $here 'launch.ps1'
    $launchBat = Join-Path $here 'launch.bat'
    $exit = 1
        if(Test-Path $launchPs1){
            Write-Host '[deploy] Invoking launch.ps1 directly (-SkipBash)'
            $params = @{ Ports = $Ports; TimeoutSeconds = $TimeoutSeconds; SkipBash = $true }
            & $launchPs1 @params
            $exit = $LASTEXITCODE
            Write-Host "[deploy] launch.ps1 exit code: $exit"
        } elseif (Test-Path $launchBat){
        Write-Host '[deploy] Spawning launch.bat child process'
        $proc = Start-Process $launchBat -WorkingDirectory $here -PassThru -Wait
        $exit = $proc.ExitCode
    } else {
        throw 'No launch script (launch.ps1 or launch.bat) found'
    }
    if($exit -ne 0){ throw "Launch process exited $exit" }
    'Deployment succeeded' | Out-File $log -Append -Encoding UTF8
    Send-Webhook "Deployment succeeded by $env:USERNAME"
    exit 0
} catch {
    "Deployment failed: $_" | Out-File $log -Append -Encoding UTF8
    Send-Webhook "Deployment failed by $env:USERNAME: $_"
    exit 1
}
