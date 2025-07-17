# Docker-based Staging Server Setup Script
# This script creates a local staging server using Docker

Write-Host "🐳 Setting up Docker-based Staging Server..." -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check if Docker is running
Write-Host "Checking Docker status..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Stop and remove existing staging server if it exists
Write-Host "Cleaning up existing staging server..." -ForegroundColor Yellow
docker stop staging-server 2>$null
docker rm staging-server 2>$null

# Create staging server container
Write-Host "Creating staging server container..." -ForegroundColor Yellow
$dockerCommand = @"
docker run -d \
  --name staging-server \
  -p 2222:22 \
  -p 8080:8080 \
  ubuntu:22.04 \
  /bin/bash -c "
    apt-get update && \
    apt-get install -y openssh-server sudo curl wget git nano && \
    mkdir -p /var/run/sshd && \
    useradd -m -s /bin/bash ubuntu && \
    echo 'ubuntu:staging123' | chpasswd && \
    echo 'ubuntu ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers && \
    mkdir -p /home/ubuntu/.ssh && \
    chmod 700 /home/ubuntu/.ssh && \
    chown ubuntu:ubuntu /home/ubuntu/.ssh && \
    sed -i 's/#PasswordAuthentication yes/PasswordAuthentication yes/' /etc/ssh/sshd_config && \
    sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config && \
    service ssh start && \
    tail -f /dev/null
  "
"@

# Run the Docker command
Invoke-Expression $dockerCommand

# Wait for container to be ready
Write-Host "Waiting for container to be ready..." -ForegroundColor Yellow
Start-Sleep 10

# Copy SSH public key to container
Write-Host "Setting up SSH key authentication..." -ForegroundColor Yellow
$publicKey = Get-Content "$env:USERPROFILE\.ssh\id_rsa.pub" -Raw
docker exec staging-server bash -c "echo '$publicKey' >> /home/ubuntu/.ssh/authorized_keys"
docker exec staging-server bash -c "chmod 600 /home/ubuntu/.ssh/authorized_keys"
docker exec staging-server bash -c "chown ubuntu:ubuntu /home/ubuntu/.ssh/authorized_keys"

# Test SSH connection
Write-Host "Testing SSH connection..." -ForegroundColor Yellow
$testConnection = ssh -o StrictHostKeyChecking=no -p 2222 ubuntu@localhost "echo 'SSH connection successful'"
if ($testConnection -eq "SSH connection successful") {
    Write-Host "✅ SSH connection test passed" -ForegroundColor Green
} else {
    Write-Host "⚠️ SSH connection test failed, but container is running" -ForegroundColor Yellow
}

# Display results
Write-Host ""
Write-Host "🎉 Staging Server Setup Complete!" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Green
Write-Host ""
Write-Host "📝 Your staging server details:" -ForegroundColor Cyan
Write-Host "  STAGING_HOST: localhost" -ForegroundColor White
Write-Host "  STAGING_USER: ubuntu" -ForegroundColor White
Write-Host "  SSH Port: 2222" -ForegroundColor White
Write-Host "  App Port: 8080" -ForegroundColor White
Write-Host ""
Write-Host "🔧 GitHub Secrets to add:" -ForegroundColor Cyan
Write-Host "  STAGING_HOST = localhost" -ForegroundColor White
Write-Host "  STAGING_USER = ubuntu" -ForegroundColor White
Write-Host "  STAGING_SSH_KEY = (use the SSH private key we found earlier)" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test your connection:" -ForegroundColor Cyan
Write-Host "  ssh -p 2222 ubuntu@localhost" -ForegroundColor White
Write-Host ""
Write-Host "🛠️ Container management:" -ForegroundColor Cyan
Write-Host "  Stop:  docker stop staging-server" -ForegroundColor White
Write-Host "  Start: docker start staging-server" -ForegroundColor White
Write-Host "  Logs:  docker logs staging-server" -ForegroundColor White
Write-Host "  Shell: docker exec -it staging-server bash" -ForegroundColor White
