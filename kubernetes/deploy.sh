#!/bin/bash

# Lore Engine Kubernetes Deployment Script
# This script deploys the Lore Engine to a Kubernetes cluster

set -e

echo "🔮 Lore Engine Kubernetes Deployment Script 🔮"
echo "=================================================="

# Configuration
NAMESPACE="lore-engine"
DEPLOYMENT_NAME="lore-engine"
IMAGE_TAG="${1:-latest}"
KUBECONFIG_PATH="${HOME}/.kube/config"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

# Check if kubeconfig exists
if [[ ! -f "$KUBECONFIG_PATH" ]]; then
    print_error "Kubeconfig not found at $KUBECONFIG_PATH"
    print_warning "Please configure your kubeconfig file first."
    exit 1
fi

# Check cluster connectivity
print_status "Checking cluster connectivity..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi

print_status "Connected to cluster: $(kubectl config current-context)"

# Create namespace if it doesn't exist
print_status "Creating namespace: $NAMESPACE"
kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap and Secrets
print_status "Applying configuration..."
kubectl apply -f kubernetes/configmap.yaml

# Check if secrets exist, if not create empty ones
if ! kubectl get secret lore-engine-secrets -n "$NAMESPACE" &> /dev/null; then
    print_warning "Secrets not found. Creating empty secrets template."
    print_warning "Please update the secrets with your actual values!"
    kubectl apply -f kubernetes/configmap.yaml
fi

# Apply Persistent Volume Claims
print_status "Applying persistent volume claims..."
kubectl apply -f kubernetes/hpa.yaml

# Deploy the application
print_status "Deploying Lore Engine..."
# Update image tag if specified
if [[ "$IMAGE_TAG" != "latest" ]]; then
    print_status "Using image tag: $IMAGE_TAG"
    sed "s|:latest|:$IMAGE_TAG|g" kubernetes/deployment.yaml | kubectl apply -f -
else
    kubectl apply -f kubernetes/deployment.yaml
fi

# Apply ingress
print_status "Applying ingress configuration..."
kubectl apply -f kubernetes/ingress.yaml

# Wait for deployment to be ready
print_status "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/$DEPLOYMENT_NAME -n "$NAMESPACE"

# Get deployment status
print_status "Deployment status:"
kubectl get deployments -n "$NAMESPACE"
kubectl get pods -n "$NAMESPACE"
kubectl get services -n "$NAMESPACE"

# Get service URLs
print_status "Service endpoints:"
NODEPORT=$(kubectl get service lore-engine-nodeport -n "$NAMESPACE" -o jsonpath='{.spec.ports[0].nodePort}')
CLUSTER_IP=$(kubectl get service lore-engine-service -n "$NAMESPACE" -o jsonpath='{.spec.clusterIP}')

echo -e "${BLUE}NodePort Service:${NC} http://localhost:$NODEPORT"
echo -e "${BLUE}Cluster IP:${NC} http://$CLUSTER_IP"
echo -e "${BLUE}Health Check:${NC} http://localhost:$NODEPORT/health"
echo -e "${BLUE}Lore Stats:${NC} http://localhost:$NODEPORT/lore/stats"

# Show logs
print_status "Recent logs:"
kubectl logs -l app=lore-engine -n "$NAMESPACE" --tail=20

print_status "Deployment completed successfully! 🎉"
print_warning "Don't forget to update your secrets in kubernetes/configmap.yaml"

# Port forward for local access
read -p "Would you like to set up port forwarding for local access? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Setting up port forwarding on port 8080..."
    print_status "Access the application at: http://localhost:8080"
    print_status "Press Ctrl+C to stop port forwarding"
    kubectl port-forward service/lore-engine-service 8080:80 -n "$NAMESPACE"
fi
