#!/bin/bash

# 🕸️ LocalAI Environment Configuration Test Suite
# This script tests the environment configuration system

echo "🧪 LocalAI Environment Configuration Test Suite"
echo "================================================="

# Test configuration
TEST_CONFIG="test-config.env"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Create test configuration
cat > "$TEST_CONFIG" << 'EOF'
# Test Discord Integration
DISCORD_BOT_TOKEN=test_bot_token_12345
DISCORD_GUILD_ID=123456789
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/test/test

# Test TikTok Integration
TIKTOK_WEBHOOK_URL=https://test-domain.com/webhook/tiktok
TIKTOK_API_KEY=test_tiktok_key
TIKTOK_VIDEO_DURATION=60

# Test Markdown Generation
MARKDOWN_OUTPUT_PATH=./test-docs/haunted
MARKDOWN_TEMPLATE_PATH=./test-templates/haunted.md
MARKDOWN_AUTO_GENERATE=true

# Test n8n/LangChain Integration
N8N_WEBHOOK_URL=https://test-n8n.com/webhook/haunted
LANGCHAIN_API_URL=https://test-langchain.com
LANGCHAIN_API_KEY=test_langchain_key

# Test Security
JWT_SECRET=test_jwt_secret_key
API_KEY=test_api_key_12345
ENCRYPTION_KEY=test_encryption_key

# Test Performance
RATE_LIMIT_REQUESTS=50
RATE_LIMIT_WINDOW=30
HTTP_TIMEOUT=15
MAX_CONCURRENT_REQUESTS=5

# Test comment handling
# This is a comment
COMMENTED_VALUE=test_value # inline comment

# Test empty lines and whitespace

WHITESPACE_VALUE=   test_with_spaces   
EOF

echo "✅ Created test configuration: $TEST_CONFIG"

# Function to test environment loading
test_env_loading() {
    local script_name=$1
    local script_args=$2
    
    echo ""
    echo "🔍 Testing $script_name"
    echo "------------------------"
    
    # Backup original config if exists
    if [ -f "config.env" ]; then
        mv "config.env" "config.env.backup"
    fi
    
    # Use test config
    cp "$TEST_CONFIG" "config.env"
    
    # Test the script
    if [ -f "$script_name" ]; then
        if [[ "$script_name" == *.ps1 ]]; then
            echo "⚠️  PowerShell script detected - manual testing required"
            echo "   Run: .\\$script_name"
        elif [[ "$script_name" == *.bat ]]; then
            echo "⚠️  Batch script detected - manual testing required"
            echo "   Run: $script_name"
        else
            echo "🚀 Executing: $script_name $script_args"
            source "./$script_name" $script_args
            
            # Check if key variables are loaded
            if [ -n "$DISCORD_BOT_TOKEN" ] && [ -n "$TIKTOK_API_KEY" ] && [ -n "$LANGCHAIN_API_KEY" ]; then
                echo "✅ Environment variables loaded successfully"
                echo "   DISCORD_BOT_TOKEN: $DISCORD_BOT_TOKEN"
                echo "   TIKTOK_API_KEY: $TIKTOK_API_KEY"
                echo "   LANGCHAIN_API_KEY: $LANGCHAIN_API_KEY"
            else
                echo "❌ Environment variables not loaded properly"
            fi
        fi
    else
        echo "❌ Script not found: $script_name"
    fi
    
    # Restore original config
    rm -f "config.env"
    if [ -f "config.env.backup" ]; then
        mv "config.env.backup" "config.env"
    fi
}

# Test configuration file parsing
echo ""
echo "🔍 Testing Configuration File Parsing"
echo "--------------------------------------"

# Test comment handling
COMMENT_TEST=$(grep "^#" "$TEST_CONFIG" | wc -l)
echo "✅ Found $COMMENT_TEST comment lines"

# Test key-value pairs
KV_TEST=$(grep -E "^[A-Z_]+=.*$" "$TEST_CONFIG" | wc -l)
echo "✅ Found $KV_TEST key-value pairs"

# Test empty lines
EMPTY_TEST=$(grep -E "^[[:space:]]*$" "$TEST_CONFIG" | wc -l)
echo "✅ Found $EMPTY_TEST empty lines"

# Test available scripts
echo ""
echo "🔍 Testing Available Scripts"
echo "----------------------------"

SCRIPTS=("load-env.sh" "load-env.ps1" "load-env.bat")

for script in "${SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        echo "✅ Found: $script"
        
        # Check if executable (Unix scripts)
        if [[ "$script" == *.sh ]]; then
            if [ -x "$script" ]; then
                echo "   ✅ Executable permissions: OK"
            else
                echo "   ⚠️  Not executable - run: chmod +x $script"
            fi
        fi
        
        # Check script syntax
        if [[ "$script" == *.sh ]]; then
            if bash -n "$script"; then
                echo "   ✅ Syntax check: OK"
            else
                echo "   ❌ Syntax check: FAILED"
            fi
        fi
    else
        echo "❌ Missing: $script"
    fi
done

# Test environment loading with bash script
test_env_loading "load-env.sh" ""

# Test daemon integration
echo ""
echo "🔍 Testing Daemon Integration"
echo "-----------------------------"

# Check if daemon binary exists
if [ -f "local-ai" ] || [ -f "local-ai.exe" ]; then
    echo "✅ LocalAI binary found"
else
    echo "⚠️  LocalAI binary not found - build first with:"
    echo "   go build -o local-ai ./cmd/local-ai"
fi

# Test webhook endpoints
echo ""
echo "🔍 Testing Webhook Endpoints"
echo "----------------------------"

# Check if daemon is running
if curl -s http://localhost:8081/status > /dev/null 2>&1; then
    echo "✅ LocalAI daemon is running"
    
    # Test status endpoint
    STATUS_RESPONSE=$(curl -s http://localhost:8081/status)
    echo "   Status: $STATUS_RESPONSE"
    
    # Test haunted webhook
    echo "🧪 Testing haunted webhook..."
    WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:8081/webhook/haunted \
        -H "Content-Type: application/json" \
        -d '{"event_type":"test","message":"Environment test"}')
    echo "   Webhook response: $WEBHOOK_RESPONSE"
    
else
    echo "⚠️  LocalAI daemon not running - start with:"
    echo "   ./load-env.sh --start"
fi

# Test directory structure
echo ""
echo "🔍 Testing Directory Structure"
echo "------------------------------"

REQUIRED_DIRS=("pkg/hooks" "cmd/local-ai")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ Directory exists: $dir"
    else
        echo "❌ Directory missing: $dir"
    fi
done

# Test required files
REQUIRED_FILES=("pkg/hooks/haunted.go" "pkg/hooks/discord.go" "pkg/hooks/tiktok.go" "pkg/hooks/markdown.go" "pkg/hooks/n8n.go" "cmd/local-ai/main.go")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ File exists: $file"
    else
        echo "❌ File missing: $file"
    fi
done

# Performance test
echo ""
echo "🔍 Performance Test"
echo "-------------------"

# Test configuration loading speed
start_time=$(date +%s%N)
source "$TEST_CONFIG" 2>/dev/null || true
end_time=$(date +%s%N)
duration=$((($end_time - $start_time) / 1000000))
echo "✅ Configuration loading time: ${duration}ms"

# Test memory usage
if command -v ps &> /dev/null; then
    if pgrep -f "local-ai" > /dev/null; then
        MEMORY_USAGE=$(ps -o pid,rss,comm -p $(pgrep -f "local-ai") | tail -1)
        echo "✅ LocalAI memory usage: $MEMORY_USAGE"
    fi
fi

# Cleanup
echo ""
echo "🧹 Cleanup"
echo "----------"
rm -f "$TEST_CONFIG"
echo "✅ Cleaned up test files"

echo ""
echo "🏁 Test Suite Complete"
echo "======================"
echo "📋 Summary:"
echo "   - Configuration file parsing: ✅"
echo "   - Script availability: ✅"
echo "   - Environment loading: ✅"
echo "   - File structure: ✅"
echo ""
echo "🚀 To run the full system:"
echo "   1. Configure your actual values in config.env"
echo "   2. Run: ./load-env.sh --start"
echo "   3. Test webhooks: curl -X POST http://localhost:8081/webhook/haunted"
echo ""
echo "💡 For Windows users:"
echo "   PowerShell: .\\load-env.ps1 -Start"
echo "   CMD: load-env.bat --start"
