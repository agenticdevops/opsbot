---
name: k8s-debug
description: "Debug Kubernetes pod issues including CrashLoopBackOff, OOMKilled, ImagePullBackOff, and pending states. Provides diagnostic workflows and remediation steps."
metadata:
  opsbot:
    emoji: "🔍"
    tags: ["kubernetes", "debugging", "troubleshooting", "devops"]
    requires:
      bins: ["kubectl"]
    install:
      - id: brew
        kind: brew
        formula: kubectl
        bins: ["kubectl"]
---

# Kubernetes Debug Skill

Debug and troubleshoot Kubernetes pod issues with structured diagnostic workflows.

## Common Pod States and Diagnostics

### CrashLoopBackOff

**Symptoms:** Pod repeatedly crashes and restarts.

**Diagnostic Steps:**
```bash
# 1. Get pod status and restart count
kubectl get pod <pod> -n <namespace> -o wide

# 2. Check pod events
kubectl describe pod <pod> -n <namespace> | grep -A 20 "Events:"

# 3. View logs from current container
kubectl logs <pod> -n <namespace>

# 4. View logs from previous crashed container
kubectl logs <pod> -n <namespace> --previous

# 5. Check container exit code
kubectl get pod <pod> -n <namespace> -o jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'
```

**Common Causes:**
- Exit code 1: Application error
- Exit code 137: OOMKilled (memory limit exceeded)
- Exit code 143: SIGTERM (graceful shutdown failed)

### OOMKilled (Exit Code 137)

**Diagnostic Steps:**
```bash
# 1. Check memory limits
kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.containers[0].resources}'

# 2. Check actual memory usage before crash
kubectl top pod <pod> -n <namespace>

# 3. Check node memory pressure
kubectl describe node <node> | grep -A 5 "Conditions:"
```

**Remediation:**
- Increase memory limits in deployment
- Optimize application memory usage
- Add memory requests to ensure QoS

### ImagePullBackOff

**Diagnostic Steps:**
```bash
# 1. Check image name and tag
kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.containers[0].image}'

# 2. Check events for pull errors
kubectl describe pod <pod> -n <namespace> | grep -A 5 "Events:"

# 3. Verify image exists
docker pull <image> 2>&1 || echo "Image not found"

# 4. Check imagePullSecrets
kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.imagePullSecrets}'
```

**Common Causes:**
- Image doesn't exist
- Wrong tag
- Private registry authentication failed
- Network issues

### Pending State

**Diagnostic Steps:**
```bash
# 1. Check why pod is pending
kubectl describe pod <pod> -n <namespace> | grep -A 10 "Events:"

# 2. Check node resources
kubectl describe nodes | grep -A 5 "Allocated resources:"

# 3. Check for node selectors/affinity
kubectl get pod <pod> -n <namespace> -o jsonpath='{.spec.nodeSelector}'

# 4. Check for taints preventing scheduling
kubectl describe nodes | grep Taints
```

**Common Causes:**
- Insufficient CPU/memory on nodes
- Node selector doesn't match any nodes
- PersistentVolumeClaim not bound
- Node taints without tolerations

## Quick Debug Commands

```bash
# Get all pods with issues
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded

# Get pod restart counts
kubectl get pods -n <namespace> -o custom-columns=NAME:.metadata.name,RESTARTS:.status.containerStatuses[0].restartCount

# Get recent events
kubectl get events -n <namespace> --sort-by='.lastTimestamp' | tail -20

# Check resource usage across namespace
kubectl top pods -n <namespace> --sort-by=memory
```

## Remediation Actions (Require Approval)

```bash
# Delete and recreate pod
kubectl delete pod <pod> -n <namespace>

# Force delete stuck pod
kubectl delete pod <pod> -n <namespace> --grace-period=0 --force

# Patch deployment to increase resources
kubectl patch deployment <deployment> -n <namespace> -p '{"spec":{"template":{"spec":{"containers":[{"name":"<container>","resources":{"limits":{"memory":"512Mi"}}}]}}}}'

# Scale down and up to restart
kubectl scale deployment <deployment> -n <namespace> --replicas=0
kubectl scale deployment <deployment> -n <namespace> --replicas=1
```

## Safety Notes

- Always check logs and events before taking action
- Use `--previous` flag to see logs from crashed containers
- Increasing resources may require node capacity
- Force delete should only be used for truly stuck pods
