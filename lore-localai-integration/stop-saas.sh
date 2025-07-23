#!/bin/bash

# 🛑 Stop Lore Engine SaaS Services

echo "🛑 Stopping Lore Engine SaaS services..."

# Read process IDs if available
if [ -f .pids ]; then
    source .pids
    
    if [ ! -z "$SAAS_PID" ]; then
        echo "Stopping SaaS Server (PID: $SAAS_PID)..."
        kill $SAAS_PID 2>/dev/null || echo "SaaS Server already stopped"
    fi
    
    if [ ! -z "$DISPATCHER_PID" ]; then
        echo "Stopping Lore Dispatcher (PID: $DISPATCHER_PID)..."
        kill $DISPATCHER_PID 2>/dev/null || echo "Lore Dispatcher already stopped"
    fi
    
    if [ ! -z "$CONFLICT_PID" ]; then
        echo "Stopping Conflict Detection (PID: $CONFLICT_PID)..."
        kill $CONFLICT_PID 2>/dev/null || echo "Conflict Detection already stopped"
    fi
    
    rm .pids
fi

# Stop Docker services if running
if [ -f docker-compose.yml ]; then
    echo "Stopping Docker services..."
    docker-compose down
fi

# Kill any remaining processes on the ports
echo "Cleaning up any remaining processes..."
pkill -f "lore-saas-server" 2>/dev/null || true
pkill -f "node.*8083" 2>/dev/null || true
pkill -f "node.*8084" 2>/dev/null || true

echo "✅ All Lore Engine SaaS services stopped"
