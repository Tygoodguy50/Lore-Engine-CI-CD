# Lore-LocalAI Integration Environment Setup Script (Simplified)

Write-Host "Starting Lore-LocalAI Integration Environment Setup" -ForegroundColor Green
Write-Host "========================================================"

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "Environment file found!" -ForegroundColor Green
} else {
    Write-Host "Error: .env file not found. Please create one first." -ForegroundColor Red
    exit 1
}

# Check if dependencies are installed
if (Test-Path "node_modules") {
    Write-Host "Dependencies already installed" -ForegroundColor Green
} else {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    } else {
        Write-Host "Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "TypeScript build completed!" -ForegroundColor Green
} else {
    Write-Host "TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Create necessary directories
Write-Host "Creating directories..." -ForegroundColor Yellow
$directories = @("logs", "data", "models", "uploads", "cache")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "Directories created!" -ForegroundColor Green

# Check if Docker is running
Write-Host "Checking Docker..." -ForegroundColor Yellow
try {
    docker ps | Out-Null
    Write-Host "Docker is running!" -ForegroundColor Green
    
    # Start services if docker-compose.yml exists
    if (Test-Path "docker-compose.yml") {
        Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow
        docker-compose up -d
        Write-Host "Services started!" -ForegroundColor Green
    }
} catch {
    Write-Host "Docker not available. Some services may not work." -ForegroundColor Yellow
}

# Start the application
Write-Host "Starting application..." -ForegroundColor Yellow
$env:NODE_ENV = "development"
$env:PORT = "3000"

if (Test-Path "dist\index.js") {
    Write-Host "Application is ready to start!" -ForegroundColor Green
    Write-Host ""
    Write-Host "To start the application, run:" -ForegroundColor Cyan
    Write-Host "node dist/index.js" -ForegroundColor White
    Write-Host ""
    Write-Host "Or use the start script:" -ForegroundColor Cyan
    Write-Host "npm start" -ForegroundColor White
} else {
    Write-Host "Error: Application build not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "Environment setup completed!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure your .env file with API keys and database settings"
Write-Host "2. Start PostgreSQL and Redis if not using Docker"
Write-Host "3. Run 'node dist/index.js' to start the application"
Write-Host "4. Visit http://localhost:3000 to access the application"
Write-Host ""
