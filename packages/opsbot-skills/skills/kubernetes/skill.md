---
name: kubernetes
description: "Manage Kubernetes clusters using kubectl. Supports pod management, logs, exec, deployments, services, and applying manifests. Always specify --context when managing multiple clusters."
metadata:
  opsbot:
    emoji: "☸️"
    tags: ["kubernetes", "k8s", "containers", "orchestration", "devops"]
    requires:
      bins: ["kubectl"]
    install:
      - id: brew
        kind: brew
        formula: kubectl
        bins: ["kubectl"]
      - id: apt
        kind: apt
        package: kubectl
        bins: ["kubectl"]
      - id: manual
        kind: manual
        url: https://kubernetes.io/docs/tasks/tools/
        instructions: "Install kubectl from the official Kubernetes documentation"
---

# Kubernetes Skill

Manage Kubernetes clusters using `kubectl`. Always specify `--context` when working with multiple clusters to avoid accidental operations on the wrong cluster.

## Cluster Context

### Check current context
```bash
kubectl config current-context
kubectl config get-contexts
```

### Switch context
```bash
kubectl config use-context <context-name>
```

## Read-Only Operations (Always Safe)

### List resources
```bash
kubectl get pods -n <namespace>
kubectl get pods -A                          # All namespaces
kubectl get deployments,services,ingress -n <namespace>
kubectl get all -n <namespace>
kubectl get nodes
```

### Describe resources
```bash
kubectl describe pod <pod-name> -n <namespace>
kubectl describe deployment <deployment> -n <namespace>
kubectl describe node <node-name>
```

### View logs
```bash
kubectl logs <pod> -n <namespace>
kubectl logs <pod> -n <namespace> --tail=100
kubectl logs <pod> -n <namespace> -f          # Follow logs
kubectl logs <pod> -n <namespace> --previous  # Previous instance
kubectl logs -l app=<label> -n <namespace>    # By label
```

### Get resource details
```bash
kubectl get pod <pod> -n <namespace> -o yaml
kubectl get deployment <deployment> -n <namespace> -o json
kubectl top pods -n <namespace>               # Resource usage
kubectl top nodes
```

### Check cluster health
```bash
kubectl cluster-info
kubectl get componentstatuses
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

## Mutating Operations (Require Approval in Plan Mode)

### Execute in pod
```bash
kubectl exec <pod> -n <namespace> -- <command>
kubectl exec -it <pod> -n <namespace> -- /bin/sh   # Interactive shell
```

### Scale deployments
```bash
kubectl scale deployment <deployment> --replicas=<n> -n <namespace>
```

### Restart deployments
```bash
kubectl rollout restart deployment <deployment> -n <namespace>
```

### Apply manifests (use dry-run first!)
```bash
# Always preview first
kubectl apply -f <file.yaml> --dry-run=client -o yaml

# Then apply
kubectl apply -f <file.yaml> -n <namespace>
```

### Edit resources
```bash
kubectl edit deployment <deployment> -n <namespace>
kubectl patch deployment <deployment> -n <namespace> -p '{"spec":...}'
```

### Port forward
```bash
kubectl port-forward pod/<pod> <local>:<remote> -n <namespace>
kubectl port-forward svc/<service> <local>:<remote> -n <namespace>
```

## Dangerous Operations (Always Require Approval)

### Delete resources
```bash
kubectl delete pod <pod> -n <namespace>
kubectl delete deployment <deployment> -n <namespace>
kubectl delete -f <file.yaml> -n <namespace>
```

### Delete all of a type
```bash
kubectl delete pods --all -n <namespace>
kubectl delete namespace <namespace>
```

### Drain node
```bash
kubectl drain <node> --ignore-daemonsets --delete-emptydir-data
kubectl cordon <node>
```

## Safety Notes

- **Always specify namespace** with `-n <namespace>` to avoid operating on wrong namespace
- **Use --context** when managing multiple clusters
- **Preview with --dry-run=client** before applying manifests
- **Check current context** before any operation
- Production contexts should have additional approval requirements
- Use `kubectl diff -f <file.yaml>` to see what would change
