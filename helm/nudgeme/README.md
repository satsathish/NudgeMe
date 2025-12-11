# NudgeMe Helm Chart

Helm chart for deploying NudgeMe application (Angular frontend + .NET API with SQLite) to Kubernetes.

## Prerequisites

- Kubernetes 1.19+
- Helm 3.0+
- PersistentVolume support in the cluster (for SQLite storage)

## Installation

### Quick Start

```bash
# From repository root
helm install nudgeme ./helm/nudgeme
```

### Custom Values

```bash
helm install nudgeme ./helm/nudgeme \
  --set image.repository=myregistry/nudgeme \
  --set image.tag=v1.0.0 \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=nudgeme.example.com
```

### Using Custom values.yaml

```bash
helm install nudgeme ./helm/nudgeme -f my-values.yaml
```

## Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `replicaCount` | Number of replicas | `1` |
| `image.repository` | Image repository | `nudgeme` |
| `image.tag` | Image tag | `latest` |
| `image.pullPolicy` | Image pull policy | `IfNotPresent` |
| `service.type` | Kubernetes service type | `ClusterIP` |
| `service.port` | Service port | `80` |
| `ingress.enabled` | Enable ingress | `false` |
| `ingress.hosts` | Ingress hosts | `[nudgeme.local]` |
| `persistence.enabled` | Enable persistence for SQLite | `true` |
| `persistence.size` | PVC size | `1Gi` |
| `persistence.storageClass` | Storage class | `""` (default) |
| `env.dbPath` | SQLite database path | `/data/reminder.db` |
| `env.aspnetcoreEnvironment` | .NET environment | `Production` |
| `env.allowedOrigins` | CORS allowed origins | `""` (uses defaults) |
| `resources.limits.cpu` | CPU limit | `500m` |
| `resources.limits.memory` | Memory limit | `512Mi` |

## Upgrade

```bash
helm upgrade nudgeme ./helm/nudgeme -f my-values.yaml
```

## Uninstall

```bash
helm uninstall nudgeme
```

**Note:** PVC is not deleted automatically. Delete manually if needed:
```bash
kubectl delete pvc nudgeme-data
```

## Examples

### Enable Ingress with TLS

```yaml
# values-prod.yaml
ingress:
  enabled: true
  className: nginx
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
  hosts:
    - host: nudgeme.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: nudgeme-tls
      hosts:
        - nudgeme.example.com
```

### Custom CORS Origins

```yaml
env:
  allowedOrigins: "https://app1.example.com,https://app2.example.com"
```

### Use Different Storage Class

```yaml
persistence:
  storageClass: fast-ssd
  size: 5Gi
```

## Access Application

### Via Service (ClusterIP)
```bash
kubectl port-forward svc/nudgeme 8080:80
# Open http://localhost:8080
```

### Via Ingress
Configure ingress and access via configured hostname.

## Troubleshooting

### Check Pod Status
```bash
kubectl get pods -l app.kubernetes.io/name=nudgeme
kubectl logs -l app.kubernetes.io/name=nudgeme
```

### Check PVC
```bash
kubectl get pvc
kubectl describe pvc nudgeme-data
```

### Verify Configuration
```bash
helm get values nudgeme
helm get manifest nudgeme
```
