#!/usr/bin/env bash

# Multi-Agent Lore Conflict Detection System
# Production Launch Script
# Generated: July 16, 2025

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ASCII Art Banner
print_banner() {
    echo -e "${PURPLE}"
    echo "╔═══════════════════════════════════════════════════════════════════════════╗"
    echo "║                        🔮 THE LORE ENGINE 🔮                              ║"
    echo "║                Multi-Agent Conflict Detection System                      ║"
    echo "║                    With Interactive Looping                              ║"
    echo "╠═══════════════════════════════════════════════════════════════════════════╣"
    echo "║  🌟 Live Metrics Dashboard    🔄 Interactive Lore Looping               ║"
    echo "║  ⚡ Real-time Conflict Detection   📊 Advanced Analytics                ║"
    echo "║  📝 Markdown Generation       🎭 Sentiment Analysis                      ║"
    echo "║  🌐 Multi-Platform Integration   🔐 Secure API Endpoints               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Usage information
usage() {
    echo -e "${CYAN}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo "Options:"
    echo "  --env=ENV           Environment to run (production, staging, development)"
    echo "  --port=PORT         Override port number"
    echo "  --host=HOST         Override host address"
    echo "  --debug             Enable debug mode"
    echo "  --build-only        Build without running"
    echo "  --health-check      Perform health check only"
    echo "  --version           Show version information"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --env=production                 # Run in production mode"
    echo "  $0 --env=staging --debug           # Run in staging with debug"
    echo "  $0 --env=production --port=9090    # Run on custom port"
    echo "  $0 --health-check                  # Check system health"
    echo ""
}

# Parse command line arguments
ENV="production"
PORT=""
HOST=""
DEBUG_MODE=false
BUILD_ONLY=false
HEALTH_CHECK_ONLY=false
SHOW_VERSION=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --env=*)
            ENV="${1#*=}"
            shift
            ;;
        --port=*)
            PORT="${1#*=}"
            shift
            ;;
        --host=*)
            HOST="${1#*=}"
            shift
            ;;
        --debug)
            DEBUG_MODE=true
            shift
            ;;
        --build-only)
            BUILD_ONLY=true
            shift
            ;;
        --health-check)
            HEALTH_CHECK_ONLY=true
            shift
            ;;
        --version)
            SHOW_VERSION=true
            shift
            ;;
        --help|-h)
            usage
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            usage
            exit 1
            ;;
    esac
done

# Version information
show_version() {
    echo -e "${GREEN}Multi-Agent Lore Conflict Detection System${NC}"
    echo -e "${BLUE}Version: 1.0.0${NC}"
    echo -e "${BLUE}Build Date: July 16, 2025${NC}"
    echo -e "${BLUE}Go Version: $(go version)${NC}"
    echo -e "${BLUE}Bazel Version: $(bazel version | head -1)${NC}"
    echo ""
    echo -e "${YELLOW}Components:${NC}"
    echo "  • LiveMetricsCollector (680+ lines)"
    echo "  • InteractiveLoreLooper (700+ lines)"
    echo "  • LoreConflictDetector with LangChain"
    echo "  • LoreMarkdownGenerator with Git integration"
    echo "  • Comprehensive API endpoints"
    echo "  • Real-time monitoring and analytics"
}

# Health check function
health_check() {
    echo -e "${CYAN}🔍 Performing system health check...${NC}"
    
    # Check if .env file exists
    if [[ ! -f ".env.${ENV}" ]]; then
        echo -e "${RED}❌ Environment file .env.${ENV} not found!${NC}"
        exit 1
    fi
    
    # Load environment variables
    source ".env.${ENV}"
    
    # Check Go installation
    if ! command -v go &> /dev/null; then
        echo -e "${RED}❌ Go is not installed or not in PATH${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Go installation: $(go version)${NC}"
    
    # Check Bazel installation
    if ! command -v bazel &> /dev/null; then
        echo -e "${RED}❌ Bazel is not installed or not in PATH${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Bazel installation: $(bazel version | head -1)${NC}"
    
    # Check required directories
    mkdir -p "./data/fragments" "./data/chains" "./data/metrics" "./docs/lore"
    echo -e "${GREEN}✅ Required directories created${NC}"
    
    # Check port availability
    if command -v netstat &> /dev/null; then
        if netstat -tuln | grep -q ":${PORT:-8080}"; then
            echo -e "${YELLOW}⚠️  Port ${PORT:-8080} is already in use${NC}"
        else
            echo -e "${GREEN}✅ Port ${PORT:-8080} is available${NC}"
        fi
    fi
    
    # Check Git repository
    if [[ -n "$MARKDOWN_GIT_REPO" ]]; then
        if git ls-remote "$MARKDOWN_GIT_REPO" &> /dev/null; then
            echo -e "${GREEN}✅ Git repository accessible${NC}"
        else
            echo -e "${YELLOW}⚠️  Git repository not accessible (optional)${NC}"
        fi
    fi
    
    echo -e "${GREEN}🎉 Health check completed successfully!${NC}"
}

# Environment validation
validate_environment() {
    case $ENV in
        production|staging|development)
            ;;
        *)
            echo -e "${RED}❌ Invalid environment: $ENV${NC}"
            echo -e "${YELLOW}Valid environments: production, staging, development${NC}"
            exit 1
            ;;
    esac
    
    if [[ ! -f ".env.${ENV}" ]]; then
        echo -e "${RED}❌ Environment file .env.${ENV} not found!${NC}"
        exit 1
    fi
}

# Auto-detect environment based on hostname
detect_environment() {
    local hostname=$(hostname)
    case $hostname in
        *prod*|*production*)
            ENV="production"
            ;;
        *staging*|*stage*)
            ENV="staging"
            ;;
        *dev*|*development*)
            ENV="development"
            ;;
    esac
}

# Build the application
build_application() {
    echo -e "${CYAN}🔨 Building Lore Engine...${NC}"
    
    # Clean previous builds
    bazel clean
    
    # Build the application
    if bazel build //:local-ai; then
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Launch the application
launch_application() {
    echo -e "${CYAN}🚀 Launching Lore Engine in ${ENV} mode...${NC}"
    
    # Load environment variables
    source ".env.${ENV}"
    
    # Override with command line arguments
    if [[ -n "$PORT" ]]; then
        export PORT="$PORT"
    fi
    if [[ -n "$HOST" ]]; then
        export HOST="$HOST"
    fi
    if [[ "$DEBUG_MODE" == "true" ]]; then
        export DEBUG_MODE="true"
        export LOG_LEVEL="debug"
    fi
    
    # Create necessary directories
    mkdir -p "./data/fragments" "./data/chains" "./data/metrics" "./docs/lore"
    
    # Display launch information
    echo -e "${PURPLE}╔═══════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${PURPLE}║                            LAUNCH CONFIGURATION                          ║${NC}"
    echo -e "${PURPLE}╠═══════════════════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${PURPLE}║${NC} Environment: ${GREEN}${ENV}${NC}"
    echo -e "${PURPLE}║${NC} Host: ${GREEN}${HOST}${NC}"
    echo -e "${PURPLE}║${NC} Port: ${GREEN}${PORT}${NC}"
    echo -e "${PURPLE}║${NC} Debug Mode: ${GREEN}${DEBUG_MODE}${NC}"
    echo -e "${PURPLE}║${NC} Log Level: ${GREEN}${LOG_LEVEL}${NC}"
    echo -e "${PURPLE}║${NC} Cursed Mode: ${GREEN}${CURSED_MODE}${NC}"
    echo -e "${PURPLE}║${NC} Max Concurrent Events: ${GREEN}${MAX_CONCURRENT_EVENTS}${NC}"
    echo -e "${PURPLE}║${NC} Interactive Looping: ${GREEN}${ENABLE_MUTATION_API}${NC}"
    echo -e "${PURPLE}║${NC} Live Metrics: ${GREEN}${METRICS_COLLECT_INTERVAL}${NC}"
    echo -e "${PURPLE}║${NC} Public API: ${GREEN}${ENABLE_PUBLIC_STATS_API}${NC}"
    echo -e "${PURPLE}╚═══════════════════════════════════════════════════════════════════════════╝${NC}"
    
    # Launch the application
    echo -e "${CYAN}🔮 The Lore Engine Has Awakened! 🔮${NC}"
    echo -e "${YELLOW}Access the system at: http://${HOST}:${PORT}${NC}"
    echo -e "${YELLOW}Health check: http://${HOST}:${PORT}/health${NC}"
    echo -e "${YELLOW}Live metrics: http://${HOST}:${PORT}/lore/stats${NC}"
    echo -e "${YELLOW}Interactive looping: http://${HOST}:${PORT}/lore/trigger${NC}"
    echo ""
    echo -e "${GREEN}Press Ctrl+C to stop the engine...${NC}"
    
    # Run the application
    exec ./bazel-bin/local-ai
}

# Main execution flow
main() {
    print_banner
    
    if [[ "$SHOW_VERSION" == "true" ]]; then
        show_version
        exit 0
    fi
    
    if [[ "$HEALTH_CHECK_ONLY" == "true" ]]; then
        health_check
        exit 0
    fi
    
    # Auto-detect environment if not specified
    if [[ "$ENV" == "production" && $# -eq 0 ]]; then
        detect_environment
        echo -e "${YELLOW}Auto-detected environment: ${ENV}${NC}"
    fi
    
    validate_environment
    health_check
    build_application
    
    if [[ "$BUILD_ONLY" == "true" ]]; then
        echo -e "${GREEN}🎉 Build completed. Exiting without launching.${NC}"
        exit 0
    fi
    
    launch_application
}

# Trap signals for graceful shutdown
trap 'echo -e "\n${YELLOW}🛑 Shutting down Lore Engine...${NC}"; exit 0' SIGINT SIGTERM

# Run main function
main "$@"
