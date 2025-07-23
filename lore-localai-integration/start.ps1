# Start script for Lore-LocalAI Integration (PowerShell)

Write-Host "🚀 Starting Lore-LocalAI Integration Platform" -ForegroundColor Green
Write-Host "=============================================="

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18 or higher." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm." -ForegroundColor Red
    exit 1
}

# Check if packages are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing packages..." -ForegroundColor Yellow
    npm install
}

# Build the project
Write-Host "🔨 Building the project..." -ForegroundColor Yellow
npm run build

# Start the server
Write-Host "🚀 Starting the server..." -ForegroundColor Green
node dist/index.js
