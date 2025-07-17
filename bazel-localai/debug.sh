#!/bin/bash
# 🐛 Debug Helper Script

echo "🔍 LocalAI Debug Information"
echo "=============================="
echo "Binary: $BINARY_PATH"
echo "Config: $CONFIG_DIR/config.yaml"
echo "Models: $MODELS_DIR"
echo "Logs: $LOG_DIR"
echo ""
echo "🎯 Environment Variables:"
env | grep -E "(LOCALAI|CGO|GO)" | sort
echo ""
echo "🚀 Recent Logs:"
tail -n 20 "$LOG_DIR/localai.log" 2>/dev/null || echo "No logs yet"
