#!/bin/bash

# LocalAI Entrypoint Script
# This script initializes the LocalAI server with custom configurations

set -e

echo "Starting LocalAI with Lore Engine configurations..."

# Set default values
MODELS_PATH=${MODELS_PATH:-/models}
CONFIG_PATH=${CONFIG_PATH:-/config}
THREADS=${THREADS:-4}
CONTEXT_SIZE=${CONTEXT_SIZE:-4096}
PORT=${PORT:-8080}

# Check if models directory exists and has content
if [ ! -d "$MODELS_PATH" ]; then
    echo "Error: Models directory not found at $MODELS_PATH"
    exit 1
fi

if [ -z "$(ls -A $MODELS_PATH)" ]; then
    echo "Warning: Models directory is empty"
fi

# Check if config directory exists
if [ ! -d "$CONFIG_PATH" ]; then
    echo "Creating config directory at $CONFIG_PATH"
    mkdir -p $CONFIG_PATH
fi

# Download models if they don't exist
echo "Checking for model files..."

# Check for haunted-model.gguf
if [ ! -f "$MODELS_PATH/haunted-model.gguf" ]; then
    echo "Haunted model not found. You need to download or mount the model file."
    echo "Expected location: $MODELS_PATH/haunted-model.gguf"
    
    # Create a placeholder for now
    echo "Creating placeholder for haunted-model.gguf"
    touch "$MODELS_PATH/haunted-model.gguf"
fi

# Check for fantasy-model.gguf
if [ ! -f "$MODELS_PATH/fantasy-model.gguf" ]; then
    echo "Fantasy model not found. You need to download or mount the model file."
    echo "Expected location: $MODELS_PATH/fantasy-model.gguf"
    
    # Create a placeholder for now
    echo "Creating placeholder for fantasy-model.gguf"
    touch "$MODELS_PATH/fantasy-model.gguf"
fi

# Set permissions
echo "Setting permissions..."
chmod 755 $MODELS_PATH
chmod 644 $MODELS_PATH/*
chmod 755 $CONFIG_PATH
chmod 644 $CONFIG_PATH/* 2>/dev/null || true

# Create LocalAI configuration
echo "Creating LocalAI configuration..."
cat > $CONFIG_PATH/localai.yaml << EOF
name: lore-localai-server
description: LocalAI server with Lore Engine models
version: 1.0.0

# Server configuration
server:
  host: 0.0.0.0
  port: $PORT
  cors: true
  cors_allow_origins: ["*"]
  
# Model configuration
models:
  - name: haunted-model
    backend: llama-cpp
    model: haunted-model.gguf
    context_size: $CONTEXT_SIZE
    threads: $THREADS
    f16: true
    temperature: 0.7
    top_k: 40
    top_p: 0.95
    
  - name: fantasy-model
    backend: llama-cpp
    model: fantasy-model.gguf
    context_size: $CONTEXT_SIZE
    threads: $THREADS
    f16: true
    temperature: 0.8
    top_k: 50
    top_p: 0.9

# Logging configuration
logging:
  level: info
  format: json
  
# Security configuration
security:
  api_keys: []
  
# Performance configuration
performance:
  preload_models: true
  gpu_layers: 35
  use_mlock: true
  use_mmap: true
EOF

# Print configuration info
echo "=== LocalAI Configuration ==="
echo "Models path: $MODELS_PATH"
echo "Config path: $CONFIG_PATH"
echo "Threads: $THREADS"
echo "Context size: $CONTEXT_SIZE"
echo "Port: $PORT"
echo "=========================="

# List available models
echo "Available models:"
ls -la $MODELS_PATH/ | grep -E '\.(gguf|bin)$' || echo "No model files found"

# Start health check in background
echo "Starting health check monitor..."
/scripts/health-check.sh &

# Start LocalAI server
echo "Starting LocalAI server..."
exec /usr/bin/local-ai \
    --models-path=$MODELS_PATH \
    --config-file=$CONFIG_PATH/localai.yaml \
    --threads=$THREADS \
    --context-size=$CONTEXT_SIZE \
    --address=0.0.0.0:$PORT \
    --cors \
    --cors-allow-origins="*" \
    --preload-models \
    --log-level=info
