#!/bin/bash

# Health Check Script for LocalAI
# This script monitors the health of the LocalAI server

LOCALAI_URL=${LOCALAI_URL:-http://localhost:8080}
HEALTH_CHECK_INTERVAL=${HEALTH_CHECK_INTERVAL:-30}
MAX_RETRIES=${MAX_RETRIES:-3}
TIMEOUT=${TIMEOUT:-10}

check_health() {
    local retries=0
    local success=false
    
    while [ $retries -lt $MAX_RETRIES ]; do
        echo "$(date): Checking LocalAI health (attempt $((retries + 1))/$MAX_RETRIES)"
        
        # Check if the server is responding
        if curl -f -s --max-time $TIMEOUT "$LOCALAI_URL/health" > /dev/null 2>&1; then
            echo "$(date): LocalAI health check passed"
            success=true
            break
        else
            echo "$(date): LocalAI health check failed"
            retries=$((retries + 1))
            if [ $retries -lt $MAX_RETRIES ]; then
                sleep 5
            fi
        fi
    done
    
    if [ "$success" = false ]; then
        echo "$(date): LocalAI health check failed after $MAX_RETRIES attempts"
        return 1
    fi
    
    return 0
}

check_models() {
    echo "$(date): Checking model availability"
    
    # Check if models endpoint is accessible
    if curl -f -s --max-time $TIMEOUT "$LOCALAI_URL/models" > /dev/null 2>&1; then
        echo "$(date): Models endpoint is accessible"
        
        # Get list of available models
        models=$(curl -s --max-time $TIMEOUT "$LOCALAI_URL/models" | jq -r '.data[].id' 2>/dev/null)
        
        if [ -n "$models" ]; then
            echo "$(date): Available models:"
            echo "$models" | while read -r model; do
                echo "  - $model"
            done
        else
            echo "$(date): No models available or unable to parse response"
        fi
    else
        echo "$(date): Models endpoint is not accessible"
        return 1
    fi
    
    return 0
}

check_performance() {
    echo "$(date): Checking performance metrics"
    
    # Simple performance test
    start_time=$(date +%s%N)
    
    # Make a simple request
    response=$(curl -s --max-time $TIMEOUT \
        -X POST "$LOCALAI_URL/chat/completions" \
        -H "Content-Type: application/json" \
        -d '{
            "model": "haunted-model",
            "messages": [{"role": "user", "content": "Hello"}],
            "max_tokens": 10
        }' 2>/dev/null)
    
    end_time=$(date +%s%N)
    duration=$(( (end_time - start_time) / 1000000 ))
    
    if [ $? -eq 0 ] && [ -n "$response" ]; then
        echo "$(date): Performance test passed - Response time: ${duration}ms"
        return 0
    else
        echo "$(date): Performance test failed"
        return 1
    fi
}

main() {
    echo "$(date): Starting LocalAI health monitor"
    
    # Wait for server to start
    echo "$(date): Waiting for LocalAI server to start..."
    sleep 30
    
    while true; do
        if check_health; then
            check_models
            check_performance
            echo "$(date): All health checks passed"
        else
            echo "$(date): Health check failed - LocalAI may not be functioning properly"
        fi
        
        echo "$(date): Sleeping for ${HEALTH_CHECK_INTERVAL} seconds"
        sleep $HEALTH_CHECK_INTERVAL
    done
}

# Handle signals
trap 'echo "$(date): Health check monitor stopping"; exit 0' SIGTERM SIGINT

# Run main function
main
