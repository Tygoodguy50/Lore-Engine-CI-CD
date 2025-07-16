# Lore Engine Kubernetes Deployment Script (PowerShell)
# This script deploys the Lore Engine to a Kubernetes cluster

param(
    [string]$ImageTag = "latest",
    [string]$Namespace = "lore-engine",
    [switch]$PortForward = $false
)

# Configuration
$DeploymentName = "lore-engine"
$KubeconfigPath = "$env:USERPROFILE\.kube\config"

Write-Host "🔮 Lore Engine Kubernetes Deployment Script 🔮" -ForegroundColor Magenta
Write-Host "==================================================" -ForegroundColor Magenta

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if kubectl is installed
if (!(Get-Command kubectl -ErrorAction SilentlyContinue)) {
    Write-Error "kubectl is not installed. Please install kubectl first."
    Write-Host "You can install kubectl using: winget install Kubernetes.kubectl"
    exit 1
}

# Check if kubeconfig exists
if (!(Test-Path $KubeconfigPath)) {
    Write-Error "Kubeconfig not found at $KubeconfigPath"
    Write-Warning "Please configure your kubeconfig file first."
    exit 1
}

# Check cluster connectivity
Write-Status "Checking cluster connectivity..."
$clusterInfo = kubectl cluster-info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    Write-Host "Make sure Docker Desktop is running and Kubernetes is enabled."
    exit 1
}

$currentContext = kubectl config current-context
Write-Status "Connected to cluster: $currentContext"

# Create namespace if it doesn't exist
Write-Status "Creating namespace: $Namespace"
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Apply ConfigMap and Secrets
Write-Status "Applying configuration..."
kubectl apply -f kubernetes/configmap.yaml

# Check if secrets exist, if not create empty ones
$secretExists = kubectl get secret lore-engine-secrets -n $Namespace 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Secrets not found. Creating empty secrets template."
    Write-Warning "Please update the secrets with your actual values!"
    kubectl apply -f kubernetes/configmap.yaml
}

# Apply Persistent Volume Claims
Write-Status "Applying persistent volume claims..."
kubectl apply -f kubernetes/hpa.yaml

# Deploy the application
Write-Status "Deploying Lore Engine..."
if ($ImageTag -ne "latest") {
    Write-Status "Using image tag: $ImageTag"
    # Update image tag in deployment file
    $deploymentContent = Get-Content kubernetes/deployment.yaml -Raw
    $deploymentContent = $deploymentContent -replace ":latest", ":$ImageTag"
    $deploymentContent | kubectl apply -f -
} else {
    kubectl apply -f kubernetes/deployment.yaml
}

# Apply ingress
Write-Status "Applying ingress configuration..."
kubectl apply -f kubernetes/ingress.yaml

# Wait for deployment to be ready
Write-Status "Waiting for deployment to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/$DeploymentName -n $Namespace

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed or timed out."
    Write-Host "Check the logs with: kubectl logs -l app=lore-engine -n $Namespace"
    exit 1
}

# Get deployment status
Write-Status "Deployment status:"
kubectl get deployments -n $Namespace
kubectl get pods -n $Namespace
kubectl get services -n $Namespace

# Get service URLs
Write-Status "Service endpoints:"
$nodePort = kubectl get service lore-engine-nodeport -n $Namespace -o jsonpath='{.spec.ports[0].nodePort}'
$clusterIP = kubectl get service lore-engine-service -n $Namespace -o jsonpath='{.spec.clusterIP}'

Write-Host "NodePort Service: http://localhost:$nodePort" -ForegroundColor Cyan
Write-Host "Cluster IP: http://$clusterIP" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:$nodePort/health" -ForegroundColor Cyan
Write-Host "Lore Stats: http://localhost:$nodePort/lore/stats" -ForegroundColor Cyan

# Show recent logs
Write-Status "Recent logs:"
kubectl logs -l app=lore-engine -n $Namespace --tail=20

Write-Status "Deployment completed successfully! 🎉"
Write-Warning "Don't forget to update your secrets in kubernetes/configmap.yaml"

# Port forward for local access
if ($PortForward) {
    Write-Status "Setting up port forwarding on port 8080..."
    Write-Status "Access the application at: http://localhost:8080"
    Write-Status "Press Ctrl+C to stop port forwarding"
    kubectl port-forward service/lore-engine-service 8080:80 -n $Namespace
} else {
    $portForwardChoice = Read-Host "Would you like to set up port forwarding for local access? (y/N)"
    if ($portForwardChoice -eq 'y' -or $portForwardChoice -eq 'Y') {
        Write-Status "Setting up port forwarding on port 8080..."
        Write-Status "Access the application at: http://localhost:8080"
        Write-Status "Press Ctrl+C to stop port forwarding"
        kubectl port-forward service/lore-engine-service 8080:80 -n $Namespace
    }
}
