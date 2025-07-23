# Lore-LocalAI Integration Environment Setup Script (PowerShell)
# This script sets up the complete development environment on Windows

Write-Host "🚀 Starting Lore-LocalAI Integration E# Create database if it # Create database if it doesn't exist
if (Test-Command "psql") {
    Write-Host "Creating database..." -ForegroundColor Yellow
    $env:PGPASSWORD = "password"
    & psql -h localhost -U postgres -c "CREATE DATABASE lore_db;" 2>$null
    & psql -h localhost -U postgres -c "CREATE DATABASE lore_test;" 2>$null
    Write-Host "Database setup completed!" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL client not available. Please create databases manually." -ForegroundColor Yellow
} LocalAI is running
if (!(Test-Port 8080)) {
    Write-Host "Port 8080 is already in use. LocalAI may already be running." -ForegroundColor Yellow
} else {
    # Start LocalAI in background
    if (Test-Path "..\localai.exe") {
        Write-Host "Starting LocalAI server..." -ForegroundColor Yellow
        $localaiProcess = Start-Process -FilePath "..\localai.exe" -ArgumentList "--address", "0.0.0.0:8080", "--models-path", ".\models" -PassThru -WorkingDirectory ".."
        
        # Wait for LocalAI to be ready
        if (Wait-ForService "http://localhost:8080/health" "LocalAI") {
            Write-Host "LocalAI server started (PID: $($localaiProcess.Id))" -ForegroundColor Green
        }
    } else {
        Write-Host "LocalAI binary not found. Please build LocalAI first." -ForegroundColor Yellow
    }
} (Test-Command "psql") {
    Write-Host "Creating database..." -ForegroundColor Yellow
    $env:PGPASSWORD = "password"
    psql -h localhost -U postgres -c "CREATE DATABASE lore_db;" 2>$null
    psql -h localhost -U postgres -c "CREATE DATABASE lore_test;" 2>$null
    Write-Host "Database setup completed!" -ForegroundColor Green
} else {
    Write-Host "PostgreSQL client not available. Please create databases manually." -ForegroundColor Yellow
} Setup" -ForegroundColor Green
Write-Host "========================================================"

# Function to check if command exists
function Test-Command {
    param($Command)
    try {
        if (Get-Command $Command -ErrorAction SilentlyContinue) {
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

# Function to check if port is available
function Test-Port {
    param($Port)
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
        $listener.Start()
        $listener.Stop()
        return $true
    } catch {
        return $false
    }
}

# Function to wait for service to be ready
function Wait-ForService {
    param($Url, $ServiceName, $MaxAttempts = 30)
    
    Write-Host "⏳ Waiting for $ServiceName to be ready..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $MaxAttempts; $i++) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ $ServiceName is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            # Service not ready yet
        }
        
        Write-Host "   Attempt $i/$MaxAttempts - waiting..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
    
    Write-Host "❌ $ServiceName failed to start after $MaxAttempts attempts" -ForegroundColor Red
    return $false
}

# Check prerequisites
Write-Host ""
Write-Host "🔍 Checking Prerequisites..." -ForegroundColor Cyan

# Check Node.js
if (Test-Command "node") {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
if (Test-Command "npm") {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "❌ npm not found. Please install npm" -ForegroundColor Red
    exit 1
}

# Check Docker
if (Test-Command "docker") {
    $dockerVersion = docker --version
    Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not found. Some services may not be available." -ForegroundColor Yellow
}

# Check Docker Compose
if (Test-Command "docker-compose") {
    $dockerComposeVersion = docker-compose --version
    Write-Host "✅ Docker Compose: $dockerComposeVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker Compose not found. Some services may not be available." -ForegroundColor Yellow
}

# Check if .env file exists
if (!(Test-Path ".env")) {
    Write-Host "❌ .env file not found. Please create one based on .env.example" -ForegroundColor Red
    exit 1
}

Write-Host "✅ All prerequisites checked!" -ForegroundColor Green

# Setup directories
Write-Host ""
Write-Host "📁 Setting up directories..." -ForegroundColor Cyan

# Create necessary directories
$directories = @("logs", "data\postgres", "data\redis", "models", "uploads", "cache")
foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}

Write-Host "✅ Directories created!" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan

if (!(Test-Path "node_modules")) {
    Write-Host "Installing npm packages..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

# Build TypeScript
Write-Host ""
Write-Host "🔨 Building TypeScript..." -ForegroundColor Cyan

npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ TypeScript build completed!" -ForegroundColor Green
} else {
    Write-Host "❌ TypeScript build failed" -ForegroundColor Red
    exit 1
}

# Start services with Docker Compose
Write-Host ""
Write-Host "🐳 Starting services with Docker Compose..." -ForegroundColor Cyan

if (Test-Command "docker-compose") {
    # Start PostgreSQL and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    Write-Host "⏳ Waiting for database services..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Check if PostgreSQL is ready
    try {
        docker-compose exec postgres pg_isready -U postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  PostgreSQL may not be ready yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  PostgreSQL may not be ready yet" -ForegroundColor Yellow
    }
    
    # Check if Redis is ready
    try {
        $redisCheck = docker-compose exec redis redis-cli ping
        if ($redisCheck -like "*PONG*") {
            Write-Host "✅ Redis is ready!" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Redis may not be ready yet" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Redis may not be ready yet" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Docker Compose not available. Please start PostgreSQL and Redis manually." -ForegroundColor Yellow
}

# Setup database
Write-Host ""
Write-Host "🗄️  Setting up database..." -ForegroundColor Cyan

# Create database if it doesn't exist
if (Test-Command "psql") {
    Write-Host "Creating database..." -ForegroundColor Yellow
    $env:PGPASSWORD = "password"
    psql -h localhost -U postgres -c "CREATE DATABASE lore_db;" 2>$null
    psql -h localhost -U postgres -c "CREATE DATABASE lore_test;" 2>$null
    Write-Host "✅ Database setup completed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL client not available. Please create databases manually." -ForegroundColor Yellow
}

# Start LocalAI server
Write-Host ""
Write-Host "🤖 Starting LocalAI server..." -ForegroundColor Cyan

# Check if LocalAI is running
if (!(Test-Port 8080)) {
    Write-Host "⚠️  Port 8080 is already in use. LocalAI may already be running." -ForegroundColor Yellow
} else {
    # Start LocalAI in background
    if (Test-Path "..\localai.exe") {
        Write-Host "Starting LocalAI server..." -ForegroundColor Yellow
        $localaiProcess = Start-Process -FilePath "..\localai.exe" -ArgumentList "--address", "0.0.0.0:8080", "--models-path", ".\models" -PassThru -WorkingDirectory ".."
        
        # Wait for LocalAI to be ready
        if (Wait-ForService "http://localhost:8080/health" "LocalAI") {
            Write-Host "✅ LocalAI server started (PID: $($localaiProcess.Id))" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  LocalAI binary not found. Please build LocalAI first." -ForegroundColor Yellow
    }
}

# Start the application
Write-Host ""
Write-Host "🚀 Starting Lore-LocalAI Integration Application..." -ForegroundColor Cyan

# Export environment variables
$env:NODE_ENV = "development"
$env:PORT = "3000"

# Start the application
if (Test-Path "dist\index.js") {
    Write-Host "Starting application server..." -ForegroundColor Yellow
    $appProcess = Start-Process -FilePath "node" -ArgumentList "dist\index.js" -PassThru
    
    # Wait for application to be ready
    if (Wait-ForService "http://localhost:3000/health" "Application") {
        Write-Host "✅ Application started (PID: $($appProcess.Id))" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Application build not found. Please run 'npm run build' first." -ForegroundColor Red
    exit 1
}

# Run tests
Write-Host ""
Write-Host "🧪 Running integration tests..." -ForegroundColor Cyan

if (Test-Path "..\test\test_conflict_system.go") {
    Push-Location ".."
    go run test\test_conflict_system.go
    Pop-Location
    Write-Host "✅ Integration tests completed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Test file not found. Skipping tests." -ForegroundColor Yellow
}

# Display service status
Write-Host ""
Write-Host "📊 Service Status:" -ForegroundColor Cyan
Write-Host "=================="

# Check LocalAI
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LocalAI Server: Running (http://localhost:8080)" -ForegroundColor Green
    } else {
        Write-Host "❌ LocalAI Server: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ LocalAI Server: Not running" -ForegroundColor Red
}

# Check Application
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application: Running (http://localhost:3000)" -ForegroundColor Green
    } else {
        Write-Host "❌ Application: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Application: Not running" -ForegroundColor Red
}

# Check PostgreSQL
try {
    $postgresStatus = docker-compose ps postgres
    if ($postgresStatus -like "*Up*") {
        Write-Host "✅ PostgreSQL: Running (localhost:5432)" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ PostgreSQL: Not running" -ForegroundColor Red
}

# Check Redis
try {
    $redisStatus = docker-compose ps redis
    if ($redisStatus -like "*Up*") {
        Write-Host "✅ Redis: Running (localhost:6379)" -ForegroundColor Green
    } else {
        Write-Host "❌ Redis: Not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Redis: Not running" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Environment setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "=============="
Write-Host "1. Visit http://localhost:3000 to access the application"
Write-Host "2. Visit http://localhost:8080 to access LocalAI"
Write-Host "3. Check logs with: Get-Content logs\app.log -Wait"
Write-Host "4. Stop services with: docker-compose down"
Write-Host "5. Configure Discord/TikTok/LangChain integrations in .env"
Write-Host ""
Write-Host "🔧 Development Commands:" -ForegroundColor Cyan
Write-Host "======================="
Write-Host "npm run dev     - Start development server with hot reload"
Write-Host "npm run build   - Build TypeScript"
Write-Host "npm run test    - Run tests"
Write-Host "npm run lint    - Run linting"
Write-Host "npm run format  - Format code"
Write-Host ""
Write-Host "Happy coding! 🚀" -ForegroundColor Green
