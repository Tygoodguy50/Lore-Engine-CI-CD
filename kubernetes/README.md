# Lore Engine Kubernetes Deployment

This directory contains Kubernetes deployment files for the Lore Engine application.

## Prerequisites

1. **Kubernetes cluster** - One of the following:
   - Docker Desktop with Kubernetes enabled
   - Minikube
   - Cloud Kubernetes service (AKS, EKS, GKE)
   - On-premises Kubernetes cluster

2. **kubectl** - Kubernetes command-line tool
   ```bash
   # Install kubectl on Windows
   winget install Kubernetes.kubectl
   
   # Install kubectl on macOS
   brew install kubectl
   
   # Install kubectl on Linux
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

3. **Valid kubeconfig** - Located at `~/.kube/config`

## Files Overview

| File | Description |
|------|-------------|
| `configmap.yaml` | Configuration and secrets for the Lore Engine |
| `deployment.yaml` | Main deployment, service, and namespace definitions |
| `ingress.yaml` | Ingress configuration for external access |
| `hpa.yaml` | Horizontal Pod Autoscaler and persistent volume claims |
| `deploy.sh` | Bash deployment script (Linux/macOS) |
| `deploy.ps1` | PowerShell deployment script (Windows) |

## Quick Start

### 1. Configure Secrets

Edit `kubernetes/configmap.yaml` and update the base64 encoded secrets:

```bash
# Encode your secrets
echo -n "your-discord-token" | base64
echo -n "your-webhook-url" | base64
```

### 2. Deploy to Kubernetes

**Using PowerShell (Windows):**
```powershell
cd kubernetes
.\deploy.ps1
```

**Using Bash (Linux/macOS):**
```bash
cd kubernetes
chmod +x deploy.sh
./deploy.sh
```

**Manual deployment:**
```bash
# Create namespace
kubectl create namespace lore-engine

# Apply configurations
kubectl apply -f configmap.yaml
kubectl apply -f deployment.yaml
kubectl apply -f ingress.yaml
kubectl apply -f hpa.yaml

# Check deployment status
kubectl get pods -n lore-engine
```

### 3. Access the Application

After deployment, you can access the Lore Engine at:

- **NodePort**: `http://localhost:30080`
- **Port Forward**: `kubectl port-forward service/lore-engine-service 8080:80 -n lore-engine`
- **Health Check**: `http://localhost:30080/health`
- **Lore Stats**: `http://localhost:30080/lore/stats`

## Configuration

### Environment Variables

The application uses the following configuration from `configmap.yaml`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Application port | `8080` |
| `ENVIRONMENT` | Deployment environment | `production` |
| `LORE_LEVEL` | Lore system level | `5` |
| `CURSED_LEVEL` | Cursed system level | `3` |
| `CONFLICT_DETECTION_ENABLED` | Enable conflict detection | `true` |
| `LIVE_METRICS_ENABLED` | Enable live metrics | `true` |
| `INTERACTIVE_LOOPING_ENABLED` | Enable interactive looping | `true` |

### Secrets

Update these secrets in `configmap.yaml`:

| Secret | Description |
|--------|-------------|
| `DISCORD_TOKEN` | Discord bot token |
| `DISCORD_CHANNEL_ID` | Discord channel ID |
| `TIKTOK_WEBHOOK_URL` | TikTok webhook URL |
| `N8N_WEBHOOK_URL` | N8N webhook URL |
| `GITHUB_TOKEN` | GitHub API token |

## Scaling

The deployment includes horizontal pod autoscaling:

- **Min replicas**: 2
- **Max replicas**: 10
- **CPU threshold**: 70%
- **Memory threshold**: 80%

Monitor scaling with:
```bash
kubectl get hpa -n lore-engine
```

## Monitoring

### Health Checks

The application includes:
- **Liveness probe**: `/health` endpoint
- **Readiness probe**: `/health` endpoint

### Logs

View application logs:
```bash
# All pods
kubectl logs -l app=lore-engine -n lore-engine

# Specific pod
kubectl logs <pod-name> -n lore-engine

# Follow logs
kubectl logs -f -l app=lore-engine -n lore-engine
```

### Metrics

Access metrics at:
- `/lore/stats` - Lore system statistics
- `/lore/conflicts/stats` - Conflict detection stats
- `/lore/sessions/stats` - Session statistics

## Troubleshooting

### Common Issues

1. **Pod not starting**
   ```bash
   kubectl describe pod <pod-name> -n lore-engine
   kubectl logs <pod-name> -n lore-engine
   ```

2. **Service not accessible**
   ```bash
   kubectl get svc -n lore-engine
   kubectl describe svc lore-engine-service -n lore-engine
   ```

3. **Ingress not working**
   ```bash
   kubectl get ingress -n lore-engine
   kubectl describe ingress lore-engine-ingress -n lore-engine
   ```

### Debug Commands

```bash
# Check all resources
kubectl get all -n lore-engine

# Check events
kubectl get events -n lore-engine --sort-by=.metadata.creationTimestamp

# Check resource usage
kubectl top pods -n lore-engine
kubectl top nodes
```

## Cleanup

To remove the deployment:

```bash
kubectl delete namespace lore-engine
```

## Development

For development deployments:

1. Build and push your image:
   ```bash
   docker build -t ghcr.io/tygoodguy50/lore-engine-ci-cd:dev .
   docker push ghcr.io/tygoodguy50/lore-engine-ci-cd:dev
   ```

2. Deploy with custom image:
   ```bash
   ./deploy.sh dev
   # or
   .\deploy.ps1 -ImageTag dev
   ```

## Security Considerations

1. **Secrets**: Store sensitive data in Kubernetes secrets, not in ConfigMaps
2. **RBAC**: The deployment uses the default service account
3. **Network Policies**: Consider implementing network policies for production
4. **Resource Limits**: Configured to prevent resource exhaustion
5. **Health Checks**: Configured for proper container lifecycle management

## Support

For issues with the Kubernetes deployment, check:

1. Application logs: `kubectl logs -l app=lore-engine -n lore-engine`
2. Kubernetes events: `kubectl get events -n lore-engine`
3. Resource status: `kubectl get all -n lore-engine`
4. Configuration: `kubectl get configmap lore-engine-config -n lore-engine -o yaml`
