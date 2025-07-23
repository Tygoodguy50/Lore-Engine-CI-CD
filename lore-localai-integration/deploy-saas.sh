#!/bin/bash

# 🔮 Lore Engine SaaS Deployment Script
# Automated revenue system deployment

echo "🚀 Starting Lore Engine SaaS Deployment..."

# Check prerequisites
if ! command -v go &> /dev/null; then
    echo "❌ Go is required but not installed. Please install Go 1.21+"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v docker &> /dev/null; then
    echo "❌ Docker is required but not installed. Please install Docker"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup environment variables
echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOL
# Stripe Configuration (REQUIRED for SaaS)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# SaaS Server Configuration
SAAS_PORT=8085
SAAS_HOST=localhost

# Existing Lore Engine Configuration
LORE_ENGINE_PORT=8084
CONFLICT_DETECTION_PORT=8083

# LocalAI Configuration
LOCALAI_PORT=8080
LOCALAI_API_KEY=your-api-key

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/lore_saas

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:8085,http://localhost:3000
EOL
    echo "📝 Created .env file - Please update with your Stripe keys!"
fi

# Initialize Go modules for SaaS server
echo "📦 Initializing Go modules..."
if [ ! -f go.mod ]; then
    go mod init lore-saas-server
fi

# Install Go dependencies
echo "⬇️  Installing Go dependencies..."
go get github.com/gin-gonic/gin@v1.9.1
go get github.com/stripe/stripe-go/v74
go get github.com/gin-contrib/cors
go get github.com/golang-jwt/jwt/v4

# Create necessary directories
echo "📁 Creating directory structure..."
mkdir -p cmd/saas-server
mkdir -p internal/{auth,billing,customer,usage}
mkdir -p web/{static,templates}
mkdir -p docs

# Move SaaS files to proper locations
echo "🔄 Organizing SaaS files..."
if [ -f main.go ]; then
    mv main.go cmd/saas-server/
fi

if [ -f pricing.html ]; then
    mv pricing.html web/templates/
fi

if [ -f success.html ]; then
    mv success.html web/templates/
fi

if [ -f cancel.html ]; then
    mv cancel.html web/templates/
fi

if [ -f dashboard.html ]; then
    mv dashboard.html web/templates/
fi

# Start existing Lore Engine services
echo "🔍 Starting Lore Engine services..."
if [ -f docker-compose.yml ]; then
    docker-compose up -d
else
    echo "⚠️  No docker-compose.yml found - starting services manually"
    
    # Start conflict detection server
    if [ -f conflict-detection-server.js ]; then
        echo "Starting conflict detection server on port 8083..."
        node conflict-detection-server.js &
        CONFLICT_PID=$!
    fi
    
    # Start Lore Dispatcher
    if [ -f lore-dispatcher.js ]; then
        echo "Starting Lore Dispatcher on port 8084..."
        node lore-dispatcher.js &
        DISPATCHER_PID=$!
    fi
fi

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 10

# Health check for existing services
echo "🔍 Checking existing services..."
if curl -s http://localhost:8083/health > /dev/null; then
    echo "✅ Conflict Detection Server is running"
else
    echo "⚠️  Conflict Detection Server may not be running"
fi

if curl -s http://localhost:8084/stats > /dev/null; then
    echo "✅ Lore Dispatcher is running"
else
    echo "⚠️  Lore Dispatcher may not be running"
fi

# Build and start SaaS server
echo "🔮 Starting SaaS Server..."
cd cmd/saas-server
go build -o lore-saas-server
./lore-saas-server &
SAAS_PID=$!
cd ../..

# Wait for SaaS server to start
echo "⏳ Waiting for SaaS server to start..."
sleep 5

# Health check for SaaS server
if curl -s http://localhost:8085/health > /dev/null; then
    echo "✅ SaaS Server is running"
else
    echo "⚠️  SaaS Server may not be running - check logs"
fi

# Display success message
echo ""
echo "🎉 Lore Engine SaaS Deployment Complete!"
echo ""
echo "🌐 Access Points:"
echo "  📊 Pricing Page:      http://localhost:8085"
echo "  🎛️  Customer Dashboard: http://localhost:8085/dashboard.html"
echo "  🔧 SaaS API:          http://localhost:8085/api"
echo "  📈 Lore Engine Stats: http://localhost:8084/stats"
echo "  🔍 Conflict Detection: http://localhost:8083/health"
echo ""
echo "💳 Next Steps:"
echo "  1. Update .env file with your Stripe keys"
echo "  2. Configure your Stripe webhook endpoints"
echo "  3. Test the subscription flow"
echo "  4. Set up your bank account in Stripe for automatic deposits"
echo ""
echo "💰 Revenue Automation:"
echo "  • Customer subscriptions: Automated via Stripe"
echo "  • API key provisioning: Automatic on subscription"
echo "  • Usage tracking: Real-time monitoring"
echo "  • Bank deposits: Automatic via Stripe (2-7 business days)"
echo ""
echo "🔮 Your automated revenue system is now running!"
echo "   Plug in your Stripe account and watch it grow! 💸"

# Save process IDs for cleanup
echo "CONFLICT_PID=$CONFLICT_PID" > .pids
echo "DISPATCHER_PID=$DISPATCHER_PID" >> .pids
echo "SAAS_PID=$SAAS_PID" >> .pids

echo ""
echo "📝 Process IDs saved to .pids file for cleanup"
echo "   Run 'bash stop-saas.sh' to stop all services"
