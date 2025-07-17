#!/bin/bash

# 🕸️ LocalAI Environment Loader Script
# This script loads environment variables from config.env

set -e

CONFIG_FILE="config.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_PATH="$SCRIPT_DIR/$CONFIG_FILE"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🕸️ LocalAI Haunted Hooks Environment Loader${NC}"
echo "=================================================="

# Check if config file exists
if [ ! -f "$CONFIG_PATH" ]; then
    echo -e "${RED}❌ Configuration file not found: $CONFIG_PATH${NC}"
    echo -e "${YELLOW}💡 Please copy config.env.example to config.env and configure your settings${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Loading configuration from: $CONFIG_PATH${NC}"

# Load environment variables, filtering out comments and empty lines
while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ $key =~ ^[[:space:]]*# ]] && continue
    [[ -z "$key" ]] && continue
    
    # Remove any trailing comments from the value
    value=$(echo "$value" | sed 's/[[:space:]]*#.*$//')
    
    # Remove quotes if present
    value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
    
    # Export the variable
    export "$key"="$value"
    
    # Show loaded variable (mask sensitive values)
    if [[ $key == *"TOKEN"* ]] || [[ $key == *"KEY"* ]] || [[ $key == *"SECRET"* ]]; then
        echo -e "${GREEN}✅ $key=${YELLOW}[MASKED]${NC}"
    else
        echo -e "${GREEN}✅ $key=${YELLOW}$value${NC}"
    fi
done < <(grep -E '^[^#]*=' "$CONFIG_PATH")

echo "=================================================="
echo -e "${GREEN}🔮 Environment variables loaded successfully!${NC}"

# Optional: Start the daemon if requested
if [ "$1" == "--start" ]; then
    echo -e "${BLUE}🚀 Starting LocalAI daemon...${NC}"
    
    # Check if binary exists
    if [ -f "./local-ai" ]; then
        exec ./local-ai
    elif [ -f "./local-ai.exe" ]; then
        exec ./local-ai.exe
    else
        echo -e "${RED}❌ LocalAI binary not found. Please build it first.${NC}"
        exit 1
    fi
fi

# Optional: Show help
if [ "$1" == "--help" ] || [ "$1" == "-h" ]; then
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --start    Load environment and start LocalAI daemon"
    echo "  --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  source $0           # Load environment variables"
    echo "  $0 --start          # Load environment and start daemon"
    echo "  . $0 && ./local-ai  # Load environment then run manually"
fi
