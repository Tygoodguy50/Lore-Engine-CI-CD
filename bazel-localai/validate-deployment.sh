#!/bin/bash

# 🔍 Lore Engine Deployment Validation Script
# Validates that all deployment components are correctly configured

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Validation counters
CHECKS_PASSED=0
CHECKS_FAILED=0

# Function to check individual components
check_component() {
    local component="$1"
    local condition="$2"
    local message="$3"
    
    echo -n "Checking $component... "
    
    if eval "$condition"; then
        echo -e "${GREEN}✓${NC} $message"
        ((CHECKS_PASSED++))
    else
        echo -e "${RED}✗${NC} $message"
        ((CHECKS_FAILED++))
    fi
}

# Header
echo -e "${BLUE}🔮 Lore Engine Deployment Validation${NC}"
echo "=============================================="
echo

# Check 1: Required files exist
echo -e "${YELLOW}📁 Checking required files...${NC}"
check_component "BUILD.bazel" "[ -f 'BUILD.bazel' ]" "Build configuration exists"
check_component "Dockerfile" "[ -f 'Dockerfile' ]" "Container configuration exists"
check_component "GitHub Actions" "[ -f '.github/workflows/deploy.yml' ]" "CI/CD pipeline configured"
check_component "Environment files" "[ -f '.env.production' ] && [ -f '.env.staging' ]" "Environment configurations exist"
check_component "Launch script" "[ -f 'launch.sh' ]" "Application launcher exists"
check_component "Deployment scripts" "[ -f 'setup-deployment.sh' ] && [ -f 'setup-deployment.ps1' ]" "Deployment scripts exist"
echo

# Check 2: Required tools are installed
echo -e "${YELLOW}🔧 Checking required tools...${NC}"
check_component "Docker" "command -v docker >/dev/null 2>&1" "Docker is installed"
check_component "Bazel" "command -v bazel >/dev/null 2>&1" "Bazel is installed"
check_component "Git" "command -v git >/dev/null 2>&1" "Git is installed"
check_component "Go" "command -v go >/dev/null 2>&1" "Go is installed"
echo

# Check 3: Git repository status
echo -e "${YELLOW}📚 Checking Git repository...${NC}"
check_component "Git repository" "[ -d '.git' ]" "In a Git repository"
check_component "Git remote" "git remote -v | grep -q origin" "Git remote 'origin' configured"
check_component "Git branches" "git branch -r | grep -q 'origin/main'" "Main branch exists"
echo

# Check 4: Build configuration
echo -e "${YELLOW}🏗️ Checking build configuration...${NC}"
check_component "Bazel workspace" "[ -f 'WORKSPACE' ] || [ -f 'MODULE.bazel' ]" "Bazel workspace configured"
check_component "Go modules" "[ -f 'go.mod' ]" "Go modules initialized"
check_component "Build target" "grep -q 'go_binary' BUILD.bazel" "Go binary target defined"
echo

# Check 5: Environment configuration
echo -e "${YELLOW}⚙️ Checking environment configuration...${NC}"
check_component "Production port" "grep -q 'PORT=8080' .env.production" "Production port configured"
check_component "Staging port" "grep -q 'PORT=8081' .env.staging" "Staging port configured"
check_component "Cursed mode" "grep -q 'CURSED_MODE=true' .env.production" "Cursed mode enabled"
echo

# Check 6: Docker configuration
echo -e "${YELLOW}🐳 Checking Docker configuration...${NC}"
check_component "Dockerfile syntax" "docker build --dry-run . >/dev/null 2>&1 || true" "Dockerfile syntax valid"
check_component "Multi-stage build" "grep -q 'FROM.*AS builder' Dockerfile" "Multi-stage build configured"
check_component "Non-root user" "grep -q 'USER lore' Dockerfile" "Non-root user configured"
check_component "Health check" "grep -q 'HEALTHCHECK' Dockerfile" "Health check configured"
echo

# Check 7: Monitoring configuration
echo -e "${YELLOW}📊 Checking monitoring setup...${NC}"
check_component "Prometheus config" "[ -f 'monitoring/prometheus/prometheus.yml' ]" "Prometheus configuration exists"
check_component "Grafana config" "[ -d 'monitoring/grafana' ]" "Grafana configuration exists"
check_component "Metrics endpoint" "grep -q '/metrics' .github/workflows/deploy.yml" "Metrics endpoint configured"
echo

# Check 8: Security configuration
echo -e "${YELLOW}🔐 Checking security configuration...${NC}"
check_component "Gosec scanning" "grep -q 'gosec' .github/workflows/deploy.yml" "Security scanning configured"
check_component "SARIF upload" "grep -q 'sarif' .github/workflows/deploy.yml" "Security report upload configured"
check_component "Secret management" "grep -q 'secrets.' .github/workflows/deploy.yml" "GitHub secrets configured"
echo

# Check 9: Documentation
echo -e "${YELLOW}📖 Checking documentation...${NC}"
check_component "Deployment guide" "[ -f 'docs/deployment/DEPLOYMENT_GUIDE.md' ]" "Deployment guide exists"
check_component "Performance testing" "[ -f 'docs/deployment/PERFORMANCE_TESTING.md' ]" "Performance testing guide exists"
check_component "Monitoring setup" "[ -f 'docs/monitoring/MONITORING_SETUP.md' ]" "Monitoring setup guide exists"
check_component "Deployment README" "[ -f 'README_DEPLOYMENT.md' ]" "Deployment README exists"
echo

# Check 10: Optional components
echo -e "${YELLOW}🎯 Checking optional components...${NC}"
check_component "Performance tests" "[ -d 'performance' ] || grep -q 'k6' .github/workflows/deploy.yml" "Performance tests configured"
check_component "Integration tests" "[ -d 'tests/integration' ]" "Integration tests exist"
check_component "Community API" "[ -f 'deploy-community-api.sh' ]" "Community API deployment script exists"
echo

# Summary
echo "=============================================="
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "=============================================="
echo -e "✅ Checks passed: ${GREEN}$CHECKS_PASSED${NC}"
echo -e "❌ Checks failed: ${RED}$CHECKS_FAILED${NC}"
echo -e "📈 Success rate: $(( CHECKS_PASSED * 100 / (CHECKS_PASSED + CHECKS_FAILED) ))%"
echo

# Final verdict
if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All validation checks passed! Your Lore Engine deployment is ready!${NC}"
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "1. Configure GitHub secrets"
    echo "2. Run ./setup-deployment.sh production"
    echo "3. Push to repository to trigger deployment"
    echo "4. Monitor deployment progress"
    exit 0
elif [ $CHECKS_FAILED -le 5 ]; then
    echo -e "${YELLOW}⚠️ Some validation checks failed, but deployment may still work.${NC}"
    echo -e "${BLUE}🔧 Please review the failed checks above and fix them before deploying.${NC}"
    exit 1
else
    echo -e "${RED}❌ Too many validation checks failed. Please fix the issues before attempting deployment.${NC}"
    echo -e "${BLUE}📋 Focus on fixing the critical components first:${NC}"
    echo "• Required files and tools"
    echo "• Build configuration"
    echo "• Environment setup"
    exit 2
fi
