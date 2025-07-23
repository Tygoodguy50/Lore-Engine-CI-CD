#!/bin/bash
# Start script for Lore-LocalAI Integration

echo "🚀 Starting Lore-LocalAI Integration Platform"
echo "=============================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Check if packages are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing packages..."
    npm install
fi

# Build the project
echo "🔨 Building the project..."
npm run build

# Start the server
echo "🚀 Starting the server..."
node dist/index.js
