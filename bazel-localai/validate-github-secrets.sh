#!/bin/bash

# 🔍 GitHub Secrets Validation Script
# This script validates that all required GitHub secrets are properly configured

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# Configuration
REPO_OWNER=${1:-""}
REPO_NAME=${2:-""}
GITHUB_TOKEN=${3:-""}

# Required secrets
REQUIRED_SECRETS=(
    "PROD_HOST"
    "PROD_USER"
    "PROD_SSH_KEY"
    "STAGING_HOST"
    "STAGING_USER"
    "STAGING_SSH_KEY"
    "DISCORD_WEBHOOK_URL"
)

# Optional secrets
OPTIONAL_SECRETS=(
    "DOCKER_REGISTRY_USER"
    "DOCKER_REGISTRY_PASSWORD"
)

# Functions
log() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Header
echo -e "${CYAN}🔍 GitHub Secrets Validation for Lore Engine${NC}"
echo "============================================="
echo

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    error "GitHub CLI (gh) is not installed. Please install it first:"
    echo "  https://cli.github.com/"
    exit 1
fi

# Check if user is authenticated
if ! gh auth status &> /dev/null; then
    error "Not authenticated with GitHub CLI. Please run:"
    echo "  gh auth login"
    exit 1
fi

# Get repository information if not provided
if [[ -z "$REPO_OWNER" || -z "$REPO_NAME" ]]; then
    if git remote get-url origin &> /dev/null; then
        REPO_URL=$(git remote get-url origin)
        if [[ $REPO_URL =~ github\.com[:/]([^/]+)/([^/]+)(\.git)?$ ]]; then
            REPO_OWNER="${BASH_REMATCH[1]}"
            REPO_NAME="${BASH_REMATCH[2]}"
            REPO_NAME="${REPO_NAME%.git}"
        fi
    fi
fi

if [[ -z "$REPO_OWNER" || -z "$REPO_NAME" ]]; then
    error "Could not determine repository. Please run from within the repository or specify:"
    echo "  $0 <owner> <repo>"
    exit 1
fi

REPOSITORY="$REPO_OWNER/$REPO_NAME"
log "Checking secrets for repository: $REPOSITORY"
echo

# Function to check if secret exists
check_secret() {
    local secret_name="$1"
    local is_required="$2"
    
    if gh secret list --repo "$REPOSITORY" | grep -q "^$secret_name"; then
        success "$secret_name is configured"
        return 0
    else
        if [[ "$is_required" == "true" ]]; then
            error "$secret_name is MISSING (required)"
        else
            warning "$secret_name is not configured (optional)"
        fi
        return 1
    fi
}

# Check required secrets
echo -e "${YELLOW}📋 Checking required secrets...${NC}"
MISSING_REQUIRED=0
for secret in "${REQUIRED_SECRETS[@]}"; do
    if ! check_secret "$secret" "true"; then
        ((MISSING_REQUIRED++))
    fi
done
echo

# Check optional secrets
echo -e "${YELLOW}📋 Checking optional secrets...${NC}"
MISSING_OPTIONAL=0
for secret in "${OPTIONAL_SECRETS[@]}"; do
    if ! check_secret "$secret" "false"; then
        ((MISSING_OPTIONAL++))
    fi
done
echo

# Environment-specific validation
echo -e "${YELLOW}🔍 Validating secret formats...${NC}"

# Check if we can access secret values (this requires repo admin access)
validate_secret_format() {
    local secret_name="$1"
    local expected_format="$2"
    
    # Note: GitHub doesn't allow reading secret values via API for security
    # We can only validate that they exist
    echo -e "${BLUE}ℹ️  $secret_name format validation skipped (values are encrypted)${NC}"
}

# Validate SSH key format (we can't read values, just note the expectation)
validate_secret_format "PROD_SSH_KEY" "SSH private key starting with -----BEGIN"
validate_secret_format "STAGING_SSH_KEY" "SSH private key starting with -----BEGIN"
validate_secret_format "DISCORD_WEBHOOK_URL" "Discord webhook URL starting with https://discord.com/api/webhooks/"

echo

# GitHub repository settings validation
echo -e "${YELLOW}🔧 Checking repository settings...${NC}"

# Check if Actions are enabled
if gh api "repos/$REPOSITORY" --jq '.has_actions' | grep -q "true"; then
    success "GitHub Actions are enabled"
else
    error "GitHub Actions are not enabled for this repository"
fi

# Check if there are workflow files
if [[ -f ".github/workflows/deploy.yml" ]]; then
    success "Deployment workflow file exists"
else
    error "Deployment workflow file (.github/workflows/deploy.yml) is missing"
fi

echo

# Generate setup commands for missing secrets
if [[ $MISSING_REQUIRED -gt 0 ]]; then
    echo -e "${YELLOW}🔧 Commands to set missing required secrets:${NC}"
    echo
    
    for secret in "${REQUIRED_SECRETS[@]}"; do
        if ! gh secret list --repo "$REPOSITORY" | grep -q "^$secret"; then
            case "$secret" in
                "PROD_HOST"|"STAGING_HOST")
                    echo "gh secret set $secret --body \"your-server-ip-or-hostname\" --repo $REPOSITORY"
                    ;;
                "PROD_USER"|"STAGING_USER")
                    echo "gh secret set $secret --body \"your-ssh-username\" --repo $REPOSITORY"
                    ;;
                "PROD_SSH_KEY"|"STAGING_SSH_KEY")
                    echo "gh secret set $secret --repo $REPOSITORY"
                    echo "# Then paste your SSH private key when prompted"
                    ;;
                "DISCORD_WEBHOOK_URL")
                    echo "gh secret set $secret --body \"https://discord.com/api/webhooks/...\" --repo $REPOSITORY"
                    ;;
            esac
        fi
    done
    echo
fi

# SSH key generation reminder
echo -e "${YELLOW}🔑 SSH Key Generation (if needed):${NC}"
echo "# Generate SSH keys for deployment:"
echo "ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-prod -C \"lore-engine-prod-deploy\""
echo "ssh-keygen -t ed25519 -f ~/.ssh/lore-engine-staging -C \"lore-engine-staging-deploy\""
echo
echo "# Display private keys (for GitHub secrets):"
echo "cat ~/.ssh/lore-engine-prod        # Copy this for PROD_SSH_KEY"
echo "cat ~/.ssh/lore-engine-staging     # Copy this for STAGING_SSH_KEY"
echo
echo "# Display public keys (add to servers):"
echo "cat ~/.ssh/lore-engine-prod.pub    # Add to production server"
echo "cat ~/.ssh/lore-engine-staging.pub # Add to staging server"
echo

# Discord webhook setup reminder
echo -e "${YELLOW}💬 Discord Webhook Setup:${NC}"
echo "1. Go to your Discord server"
echo "2. Server Settings → Integrations → Webhooks"
echo "3. Click 'New Webhook'"
echo "4. Name: 'Lore Engine CI/CD'"
echo "5. Choose channel (e.g., #deployments)"
echo "6. Copy webhook URL for DISCORD_WEBHOOK_URL secret"
echo

# Server setup reminder
echo -e "${YELLOW}🖥️  Server Setup Commands:${NC}"
echo "# Run on both production and staging servers:"
echo "sudo mkdir -p /opt/lore-engine"
echo "sudo useradd -r -s /bin/false lore-engine"
echo "sudo chown -R lore-engine:lore-engine /opt/lore-engine"
echo "sudo mkdir -p /opt/lore-engine/logs"
echo
echo "# Add public keys to servers:"
echo "echo \"ssh-ed25519 AAAA... lore-engine-prod-deploy\" >> ~/.ssh/authorized_keys"
echo "chmod 600 ~/.ssh/authorized_keys"
echo

# Summary
echo "============================================="
echo -e "${CYAN}📊 Validation Summary${NC}"
echo "============================================="
echo -e "Repository: ${BLUE}$REPOSITORY${NC}"
echo -e "Required secrets missing: ${RED}$MISSING_REQUIRED${NC}"
echo -e "Optional secrets missing: ${YELLOW}$MISSING_OPTIONAL${NC}"
echo

if [[ $MISSING_REQUIRED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All required secrets are configured!${NC}"
    echo -e "${BLUE}🚀 Your deployment pipeline is ready!${NC}"
    echo
    echo "Next steps:"
    echo "1. Test the deployment: git push origin develop"
    echo "2. Monitor in GitHub Actions tab"
    echo "3. Check Discord for notifications"
    echo "4. Verify health endpoints after deployment"
    exit 0
else
    echo -e "${RED}❌ $MISSING_REQUIRED required secrets are missing.${NC}"
    echo -e "${BLUE}🔧 Please configure the missing secrets using the commands above.${NC}"
    echo
    echo "Once configured, run this script again to validate."
    exit 1
fi
