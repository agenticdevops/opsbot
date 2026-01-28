---
name: system-health
description: "Monitor and assess infrastructure health including Kubernetes clusters, nodes, databases, and application metrics."
metadata:
  opsbot:
    emoji: "💚"
    tags: ["monitoring", "health", "observability", "devops"]
    requires:
      anyBins: ["kubectl", "docker"]
---

# System Health Skill

Monitor and assess the health of your infrastructure.

## Kubernetes Cluster Health

### Cluster Overview

```bash
# Cluster info
kubectl cluster-info

# Node status
kubectl get nodes -o wide

# Node conditions
kubectl describe nodes | grep -A 5 "Conditions:"

# Component status (deprecated but useful)
kubectl get componentstatuses 2>/dev/null || echo "Component status deprecated"

# API server health
kubectl get --raw='/healthz'

# Cluster events (last hour)
kubectl get events -A --sort-by='.lastTimestamp' | tail -30
```

### Node Health

```bash
# Node resource usage
kubectl top nodes

# Node capacity vs allocated
kubectl describe nodes | grep -A 10 "Allocated resources:"

# Check for node conditions (pressure, ready, etc.)
kubectl get nodes -o custom-columns=NAME:.metadata.name,STATUS:.status.conditions[-1].type,REASON:.status.conditions[-1].reason

# Find nodes with issues
kubectl get nodes -o json | jq '.items[] | select(.status.conditions[] | select(.type!="Ready" and .status=="True")) | .metadata.name'

# Node disk pressure
kubectl describe nodes | grep -B 2 "DiskPressure"
```

### Pod Health

```bash
# Pods not running
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded

# Pods with high restarts
kubectl get pods -A -o custom-columns=NAMESPACE:.metadata.namespace,NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount --sort-by=.status.containerStatuses[0].restartCount | tail -20

# Pending pods
kubectl get pods -A --field-selector=status.phase=Pending

# Failed pods
kubectl get pods -A --field-selector=status.phase=Failed

# Resource usage by pod
kubectl top pods -A --sort-by=cpu | head -20
kubectl top pods -A --sort-by=memory | head -20
```

### Service Health

```bash
# Check endpoints
kubectl get endpoints -A | grep -v "none"

# Services without endpoints
kubectl get endpoints -A -o json | jq '.items[] | select(.subsets == null or .subsets == []) | .metadata.name'

# Ingress status
kubectl get ingress -A

# Check service connectivity
kubectl run -it --rm debug --image=busybox --restart=Never -- wget -qO- http://<service>.<namespace>:port/health
```

## Docker Health

```bash
# Container status
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Resource usage
docker stats --no-stream

# Disk usage
docker system df

# Check container logs for errors
docker logs <container> --tail 100 2>&1 | grep -i error

# Container health check status
docker inspect --format='{{.State.Health.Status}}' <container>
```

## Quick Health Dashboard

```bash
# Generate quick health report
echo "=== CLUSTER HEALTH REPORT ==="
echo ""
echo "Nodes:"
kubectl get nodes -o wide
echo ""
echo "Node Resources:"
kubectl top nodes
echo ""
echo "Problem Pods:"
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded
echo ""
echo "High Restart Pods:"
kubectl get pods -A -o custom-columns=NS:.metadata.namespace,NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount --sort-by=.status.containerStatuses[0].restartCount | tail -10
echo ""
echo "Recent Events:"
kubectl get events -A --sort-by='.lastTimestamp' | tail -10
echo ""
echo "=== END REPORT ==="
```

## Metrics Queries (Prometheus)

If you have Prometheus, use these PromQL queries:

```promql
# CPU usage by node
100 - (avg by (instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)

# Memory usage by node
(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100

# Pod restart rate
sum(increase(kube_pod_container_status_restarts_total[1h])) by (namespace, pod)

# Request latency p99
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, service))

# Error rate
sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
```

## Health Check Automation

### Kubernetes Readiness/Liveness

Ensure your deployments have proper probes:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

### Common Health Endpoints

```bash
# Standard health endpoints to check
curl -s http://service/health | jq .
curl -s http://service/ready | jq .
curl -s http://service/metrics | head -20
```

## Safety Notes

- Health checks are read-only operations
- High resource usage may indicate scaling needs
- Multiple restart pods warrant investigation
- Missing endpoints indicate service issues
- Regular health monitoring prevents incidents
