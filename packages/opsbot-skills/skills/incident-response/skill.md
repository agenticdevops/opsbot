---
name: incident-response
description: "Structured incident response workflow for production emergencies. Provides 7-step process from detection to post-mortem."
metadata:
  opsbot:
    emoji: "🚨"
    tags: ["incident", "emergency", "sre", "oncall", "devops"]
    requires:
      anyBins: ["kubectl", "docker", "aws", "gcloud"]
---

# Incident Response Skill

Structured 7-step incident response workflow for handling production emergencies.

## Incident Response Framework

### Step 1: Detection & Triage

**Gather initial information:**
```bash
# Check monitoring alerts
# - PagerDuty, OpsGenie, or alerting system

# Quick health check
kubectl get pods -A --field-selector=status.phase!=Running,status.phase!=Succeeded
kubectl top nodes
kubectl top pods -A --sort-by=cpu | head -20
```

**Severity Classification:**
- **SEV1 (Critical)**: Complete outage, data loss risk, security breach
- **SEV2 (High)**: Major feature unavailable, significant performance degradation
- **SEV3 (Medium)**: Partial outage, workaround available
- **SEV4 (Low)**: Minor issue, no immediate impact

**Initial Actions:**
1. Acknowledge alert
2. Classify severity
3. Start incident channel (Slack #incident-YYYYMMDD)
4. Assign Incident Commander

### Step 2: Containment

**Immediate mitigation to stop the bleeding:**

```bash
# Option A: Scale up healthy instances
kubectl scale deployment <deployment> -n <namespace> --replicas=<n>

# Option B: Rollback to last known good version
kubectl rollout undo deployment <deployment> -n <namespace>

# Option C: Enable maintenance mode / feature flag
# (application-specific)

# Option D: Block problematic traffic
kubectl apply -f - <<EOF
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: emergency-block
  namespace: <namespace>
spec:
  podSelector:
    matchLabels:
      app: <app>
  policyTypes:
  - Ingress
EOF
```

### Step 3: Diagnosis

**Systematic investigation:**

```bash
# Timeline: When did it start?
kubectl get events -A --sort-by='.lastTimestamp' | tail -50

# What changed recently?
kubectl rollout history deployment <deployment> -n <namespace>
git log --oneline -20

# Resource exhaustion?
kubectl top pods -n <namespace> --sort-by=memory
kubectl describe nodes | grep -A 10 "Allocated resources"

# Application errors?
kubectl logs -l app=<app> -n <namespace> --tail=100 --since=30m

# Database issues?
# Check connection pool, slow queries, locks

# External dependencies?
# Check API status pages, network connectivity
```

**Common Root Causes:**
1. Recent deployment (code change, config change)
2. Traffic spike (DDoS, viral content)
3. Resource exhaustion (memory leak, disk full)
4. Dependency failure (database, external API)
5. Infrastructure issue (node failure, network)

### Step 4: Resolution

**Fix the root cause:**

```bash
# If bad deployment: Rollback
kubectl rollout undo deployment <deployment> -n <namespace>

# If resource issue: Scale or increase limits
kubectl patch deployment <deployment> -n <namespace> -p '{"spec":{"replicas":5}}'

# If config issue: Apply fix
kubectl apply -f <fixed-config.yaml>

# If database issue: Restart connections
kubectl delete pod -l app=<app> -n <namespace>

# If external: Enable fallback/circuit breaker
# (application-specific)
```

### Step 5: Verification

**Confirm the fix:**

```bash
# Check pods are healthy
kubectl get pods -n <namespace> -l app=<app>

# Check endpoints are responding
kubectl run -it --rm debug --image=curlimages/curl -- curl -s http://<service>.<namespace>/health

# Check metrics normalized
# - Error rate back to baseline
# - Latency back to normal
# - CPU/memory stable

# Check logs for errors
kubectl logs -l app=<app> -n <namespace> --tail=50 --since=5m | grep -i error
```

### Step 6: Communication

**Keep stakeholders informed:**

**During Incident:**
- Update status page
- Post to incident channel every 15-30 minutes
- Escalate if needed

**Template:**
```
[INCIDENT UPDATE - <timestamp>]
Status: Investigating / Mitigating / Resolved
Impact: <who/what is affected>
Current actions: <what we're doing>
Next update: <when>
```

**Resolution:**
```
[INCIDENT RESOLVED - <timestamp>]
Duration: <start> to <end> (<X hours>)
Impact: <summary>
Root cause: <brief explanation>
Post-mortem: <link> (within 48 hours)
```

### Step 7: Post-Mortem

**Blameless retrospective (within 48 hours):**

**Document:**
1. Timeline of events
2. Root cause analysis (5 Whys)
3. Impact assessment
4. What went well
5. What could be improved
6. Action items with owners

**Action Items:**
- [ ] Improve monitoring/alerting
- [ ] Add runbook for this scenario
- [ ] Implement safeguards
- [ ] Update documentation
- [ ] Share learnings with team

## Quick Reference Commands

```bash
# Emergency pod restart
kubectl delete pod -l app=<app> -n <namespace>

# Emergency scale
kubectl scale deployment <deployment> -n <namespace> --replicas=10

# Emergency rollback
kubectl rollout undo deployment <deployment> -n <namespace>

# Get all events
kubectl get events -A --sort-by='.lastTimestamp'

# Check node health
kubectl get nodes -o wide
kubectl describe nodes | grep -A 5 Conditions
```

## Safety Notes

- Document all actions taken during incident
- Get approval before making production changes
- Prefer reversible actions
- Don't rush - methodical debugging is faster
- Escalate early rather than late
