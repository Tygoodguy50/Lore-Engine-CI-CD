#!/bin/bash

# Lore-LocalAI Integration Environment Setup Script
# This script sets up the complete development environment

echo "🚀 Starting Lore-LocalAI Integration Environment Setup"
echo "========================================================"

# Check if running on Windows (Git Bash or WSL)
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    echo "📋 Detected Windows environment"
    IS_WINDOWS=true
else
    echo "📋 Detected Unix-like environment"
    IS_WINDOWS=false
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is available
port_available() {
    if $IS_WINDOWS; then
        netstat -an | grep ":$1" | grep LISTEN >/dev/null 2>&1
        return $?
    else
        lsof -i :$1 >/dev/null 2>&1
        return $?
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1
    
    echo "⏳ Waiting for $service_name to be ready..."
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            echo "✅ $service_name is ready!"
            return 0
        fi
        echo "   Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo "❌ $service_name failed to start after $max_attempts attempts"
    return 1
}

# Check prerequisites
echo ""
echo "🔍 Checking Prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm: $NPM_VERSION"
else
    echo "❌ npm not found. Please install npm"
    exit 1
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    echo "✅ Docker: $DOCKER_VERSION"
else
    echo "⚠️  Docker not found. Some services may not be available."
fi

# Check Docker Compose
if command_exists docker-compose; then
    DOCKER_COMPOSE_VERSION=$(docker-compose --version)
    echo "✅ Docker Compose: $DOCKER_COMPOSE_VERSION"
else
    echo "⚠️  Docker Compose not found. Some services may not be available."
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create one based on .env.example"
    exit 1
fi

echo "✅ All prerequisites checked!"

# Setup directories
echo ""
echo "📁 Setting up directories..."

# Create necessary directories
mkdir -p logs
mkdir -p data/postgres
mkdir -p data/redis
mkdir -p models
mkdir -p uploads
mkdir -p cache

echo "✅ Directories created!"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install
    if [ $? -eq 0 ]; then
        echo "✅ Dependencies installed!"
    else
        echo "❌ Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

# Build TypeScript
echo ""
echo "🔨 Building TypeScript..."

npm run build
if [ $? -eq 0 ]; then
    echo "✅ TypeScript build completed!"
else
    echo "❌ TypeScript build failed"
    exit 1
fi

# Start services with Docker Compose
echo ""
echo "🐳 Starting services with Docker Compose..."

if command_exists docker-compose; then
    # Start PostgreSQL and Redis
    docker-compose up -d postgres redis
    
    # Wait for services to be ready
    echo "⏳ Waiting for database services..."
    sleep 5
    
    # Check if PostgreSQL is ready
    if docker-compose exec postgres pg_isready -U postgres >/dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
    else
        echo "⚠️  PostgreSQL may not be ready yet"
    fi
    
    # Check if Redis is ready
    if docker-compose exec redis redis-cli ping | grep PONG >/dev/null 2>&1; then
        echo "✅ Redis is ready!"
    else
        echo "⚠️  Redis may not be ready yet"
    fi
else
    echo "⚠️  Docker Compose not available. Please start PostgreSQL and Redis manually."
fi

# Setup database
echo ""
echo "🗄️  Setting up database..."

# Create database if it doesn't exist
if command_exists psql; then
    echo "Creating database..."
    export PGPASSWORD=password
    psql -h localhost -U postgres -c "CREATE DATABASE lore_db;" 2>/dev/null || echo "Database may already exist"
    psql -h localhost -U postgres -c "CREATE DATABASE lore_test;" 2>/dev/null || echo "Test database may already exist"
    echo "✅ Database setup completed!"
else
    echo "⚠️  PostgreSQL client not available. Please create databases manually."
fi

# Start LocalAI server
echo ""
echo "🤖 Starting LocalAI server..."

# Check if LocalAI is running
if port_available 8080; then
    echo "⚠️  Port 8080 is already in use. LocalAI may already be running."
else
    # Start LocalAI in background
    if [ -f "../localai" ]; then
        echo "Starting LocalAI server..."
        cd ..
        ./localai --address 0.0.0.0:8080 --models-path ./lore-localai-integration/models &
        LOCALAI_PID=$!
        cd lore-localai-integration
        
        # Wait for LocalAI to be ready
        wait_for_service "http://localhost:8080/health" "LocalAI"
        
        echo "✅ LocalAI server started (PID: $LOCALAI_PID)"
    else
        echo "⚠️  LocalAI binary not found. Please build LocalAI first."
    fi
fi

# Start the application
echo ""
echo "🚀 Starting Lore-LocalAI Integration Application..."

# Export environment variables
export NODE_ENV=development
export PORT=3000

# Start the application
if [ -f "dist/index.js" ]; then
    echo "Starting application server..."
    node dist/index.js &
    APP_PID=$!
    
    # Wait for application to be ready
    wait_for_service "http://localhost:3000/health" "Application"
    
    echo "✅ Application started (PID: $APP_PID)"
else
    echo "❌ Application build not found. Please run 'npm run build' first."
    exit 1
fi

# Run tests
echo ""
echo "🧪 Running integration tests..."

if [ -f "../test/test_conflict_system.go" ]; then
    cd ..
    go run test/test_conflict_system.go
    cd lore-localai-integration
    echo "✅ Integration tests completed!"
else
    echo "⚠️  Test file not found. Skipping tests."
fi

# Display service status
echo ""
echo "📊 Service Status:"
echo "=================="

# Check LocalAI
if curl -f -s "http://localhost:8080/health" >/dev/null 2>&1; then
    echo "✅ LocalAI Server: Running (http://localhost:8080)"
else
    echo "❌ LocalAI Server: Not running"
fi

# Check Application
if curl -f -s "http://localhost:3000/health" >/dev/null 2>&1; then
    echo "✅ Application: Running (http://localhost:3000)"
else
    echo "❌ Application: Not running"
fi

# Check PostgreSQL
if command_exists docker-compose && docker-compose ps postgres | grep "Up" >/dev/null 2>&1; then
    echo "✅ PostgreSQL: Running (localhost:5432)"
else
    echo "❌ PostgreSQL: Not running"
fi

# Check Redis
if command_exists docker-compose && docker-compose ps redis | grep "Up" >/dev/null 2>&1; then
    echo "✅ Redis: Running (localhost:6379)"
else
    echo "❌ Redis: Not running"
fi

echo ""
echo "🎉 Environment setup completed!"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Visit http://localhost:3000 to access the application"
echo "2. Visit http://localhost:8080 to access LocalAI"
echo "3. Check logs with: tail -f logs/app.log"
echo "4. Stop services with: docker-compose down"
echo "5. Configure Discord/TikTok/LangChain integrations in .env"
echo ""
echo "🔧 Development Commands:"
echo "======================="
echo "npm run dev     - Start development server with hot reload"
echo "npm run build   - Build TypeScript"
echo "npm run test    - Run tests"
echo "npm run lint    - Run linting"
echo "npm run format  - Format code"
echo ""
echo "Happy coding! 🚀"
