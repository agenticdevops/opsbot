---
name: log-analysis
description: "Analyze application and system logs to diagnose issues. Supports Kubernetes, Docker, and cloud provider logs."
metadata:
  opsbot:
    emoji: "📋"
    tags: ["logging", "debugging", "observability", "devops"]
    requires:
      anyBins: ["kubectl", "docker", "aws"]
---

# Log Analysis Skill

Analyze logs to diagnose application and infrastructure issues.

## Kubernetes Logs

### Basic Log Commands

```bash
# View pod logs
kubectl logs <pod> -n <namespace>

# Follow logs (stream)
kubectl logs <pod> -n <namespace> -f

# Last N lines
kubectl logs <pod> -n <namespace> --tail=100

# Logs since time
kubectl logs <pod> -n <namespace> --since=1h
kubectl logs <pod> -n <namespace> --since-time="2024-01-28T10:00:00Z"

# Previous container (after crash/restart)
kubectl logs <pod> -n <namespace> --previous

# Multi-container pod
kubectl logs <pod> -n <namespace> -c <container>

# All containers in pod
kubectl logs <pod> -n <namespace> --all-containers=true
```

### Logs by Label

```bash
# All pods with label
kubectl logs -l app=myapp -n <namespace>

# With timestamps
kubectl logs -l app=myapp -n <namespace> --timestamps

# Combined with tail
kubectl logs -l app=myapp -n <namespace> --tail=50 --timestamps
```

### Log Analysis Patterns

```bash
# Find errors
kubectl logs <pod> -n <namespace> | grep -i error

# Find exceptions
kubectl logs <pod> -n <namespace> | grep -i "exception\|error\|fatal\|panic"

# Count errors
kubectl logs <pod> -n <namespace> | grep -c -i error

# Find specific patterns
kubectl logs <pod> -n <namespace> | grep "HTTP 5.."

# Extract timestamps and errors
kubectl logs <pod> -n <namespace> --timestamps | grep -i error | head -20

# JSON logs - extract specific fields
kubectl logs <pod> -n <namespace> | jq 'select(.level == "error")'
```

## Docker Logs

```bash
# View container logs
docker logs <container>

# Follow
docker logs <container> -f

# With timestamps
docker logs <container> -t

# Last N lines
docker logs <container> --tail 100

# Since time
docker logs <container> --since 1h

# Filter errors
docker logs <container> 2>&1 | grep -i error
```

## AWS CloudWatch Logs

```bash
# List log groups
aws logs describe-log-groups --query 'logGroups[*].logGroupName'

# List log streams
aws logs describe-log-streams --log-group-name <group> --order-by LastEventTime --descending --limit 5

# Get recent logs
aws logs get-log-events \
  --log-group-name <group> \
  --log-stream-name <stream> \
  --limit 100

# Filter logs
aws logs filter-log-events \
  --log-group-name <group> \
  --start-time $(date -d '1 hour ago' +%s000) \
  --filter-pattern "ERROR"

# Filter across all streams
aws logs filter-log-events \
  --log-group-name <group> \
  --filter-pattern "{ $.level = \"error\" }"
```

## Log Analysis Techniques

### Error Patterns

```bash
# Common error indicators
grep -E "(ERROR|FATAL|CRITICAL|Exception|Traceback|panic:|FAIL)" <logfile>

# HTTP errors
grep -E "HTTP/[0-9.]+ [45][0-9]{2}" <logfile>

# Stack traces (Java)
grep -A 10 "at .*\.java:" <logfile>

# Stack traces (Python)
grep -A 10 "Traceback" <logfile>

# Stack traces (Go)
grep -A 10 "panic:" <logfile>
```

### Time-Based Analysis

```bash
# Errors per minute (assumes timestamp format)
kubectl logs <pod> -n <namespace> --timestamps | grep -i error | cut -d'T' -f2 | cut -d':' -f1-2 | sort | uniq -c

# Peak error times
kubectl logs <pod> -n <namespace> --timestamps | grep -i error | awk '{print $1}' | cut -d':' -f1-2 | sort | uniq -c | sort -rn | head -10
```

### JSON Log Analysis

```bash
# Parse JSON logs with jq
kubectl logs <pod> -n <namespace> | jq '.'

# Filter by level
kubectl logs <pod> -n <namespace> | jq 'select(.level == "error")'

# Extract specific fields
kubectl logs <pod> -n <namespace> | jq '{time: .timestamp, msg: .message, err: .error}'

# Count by level
kubectl logs <pod> -n <namespace> | jq -r '.level' | sort | uniq -c

# Find slow requests (>1s)
kubectl logs <pod> -n <namespace> | jq 'select(.duration_ms > 1000)'
```

### Log Aggregation

```bash
# Combine logs from multiple pods
for pod in $(kubectl get pods -n <namespace> -l app=myapp -o name); do
  echo "=== $pod ==="
  kubectl logs $pod -n <namespace> --tail=10
done

# Search across all pods
kubectl logs -l app=myapp -n <namespace> --all-containers | grep -i "error\|exception"
```

## Common Issues and Patterns

### Connection Errors
```bash
grep -E "connection refused|timeout|ECONNREFUSED|dial tcp" <logs>
```

### Memory Issues
```bash
grep -E "out of memory|OOM|heap|memory" <logs>
```

### Database Errors
```bash
grep -E "deadlock|lock wait|connection pool|too many connections" <logs>
```

### Authentication Errors
```bash
grep -E "unauthorized|forbidden|401|403|auth|token" <logs>
```

## Log Management

```bash
# Compress old logs
gzip <logfile>

# Rotate logs (logrotate or manual)
mv app.log app.log.1
touch app.log

# Clean up old logs
find /var/log -name "*.log" -mtime +7 -delete
```

## Safety Notes

- Log analysis is read-only
- Be careful with log volume in production
- Use `--tail` to limit output
- JSON parsing with jq is memory-efficient
- Consider log aggregation services for large scale
