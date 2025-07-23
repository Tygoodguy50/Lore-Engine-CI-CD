# setup-env.ps1: Initialize environment for all services (Windows)
Copy-Item -Path ".env.example" -Destination ".env" -Force
if ($?) {
    Write-Host ".env created from .env.example."
} else {
    Write-Error "Failed to create .env file."
    exit 1
}
