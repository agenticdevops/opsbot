---
name: aws-ops
description: "Manage AWS infrastructure including EC2, RDS, S3, and CloudWatch. Supports instance management, database operations, storage, and monitoring."
metadata:
  opsbot:
    emoji: "☁️"
    tags: ["aws", "cloud", "infrastructure", "devops"]
    requires:
      bins: ["aws"]
    install:
      - id: brew
        kind: brew
        formula: awscli
        bins: ["aws"]
      - id: manual
        kind: manual
        url: https://aws.amazon.com/cli/
        instructions: "Install AWS CLI v2 from aws.amazon.com/cli"
---

# AWS Operations Skill

Manage AWS infrastructure using the AWS CLI. Ensure credentials are configured via `aws configure` or environment variables.

## Authentication Check

```bash
# Verify credentials
aws sts get-caller-identity

# Check current region
aws configure get region
```

## EC2 Operations

### Read-Only (Safe)

```bash
# List instances
aws ec2 describe-instances --query 'Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,Tags[?Key==`Name`].Value|[0]]' --output table

# Get instance details
aws ec2 describe-instances --instance-ids <instance-id>

# Check instance status
aws ec2 describe-instance-status --instance-ids <instance-id>

# List security groups
aws ec2 describe-security-groups --query 'SecurityGroups[*].[GroupId,GroupName,Description]' --output table

# Get instance metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=<instance-id> \
  --start-time $(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%SZ) \
  --period 300 \
  --statistics Average
```

### Mutating (Require Approval)

```bash
# Start instance
aws ec2 start-instances --instance-ids <instance-id>

# Stop instance
aws ec2 stop-instances --instance-ids <instance-id>

# Reboot instance
aws ec2 reboot-instances --instance-ids <instance-id>

# Modify instance type (stopped instance only)
aws ec2 modify-instance-attribute --instance-id <instance-id> --instance-type <new-type>
```

### Dangerous (Always Require Approval)

```bash
# Terminate instance
aws ec2 terminate-instances --instance-ids <instance-id>
```

## RDS Operations

### Read-Only (Safe)

```bash
# List databases
aws rds describe-db-instances --query 'DBInstances[*].[DBInstanceIdentifier,DBInstanceStatus,Engine,DBInstanceClass]' --output table

# Get database details
aws rds describe-db-instances --db-instance-identifier <db-id>

# Check database events
aws rds describe-events --source-identifier <db-id> --source-type db-instance --duration 60
```

### Mutating (Require Approval)

```bash
# Start database
aws rds start-db-instance --db-instance-identifier <db-id>

# Stop database
aws rds stop-db-instance --db-instance-identifier <db-id>

# Create snapshot
aws rds create-db-snapshot --db-instance-identifier <db-id> --db-snapshot-identifier <snapshot-name>

# Reboot database
aws rds reboot-db-instance --db-instance-identifier <db-id>
```

### Dangerous (Always Require Approval)

```bash
# Delete database
aws rds delete-db-instance --db-instance-identifier <db-id> --skip-final-snapshot

# Delete snapshot
aws rds delete-db-snapshot --db-snapshot-identifier <snapshot-id>
```

## S3 Operations

### Read-Only (Safe)

```bash
# List buckets
aws s3 ls

# List bucket contents
aws s3 ls s3://<bucket-name>/ --recursive --human-readable

# Get bucket size
aws s3 ls s3://<bucket-name>/ --recursive --summarize | tail -2

# Check bucket policy
aws s3api get-bucket-policy --bucket <bucket-name>
```

### Mutating (Require Approval)

```bash
# Copy file
aws s3 cp <local-file> s3://<bucket>/<key>

# Sync directory
aws s3 sync <local-dir> s3://<bucket>/<prefix>

# Delete file
aws s3 rm s3://<bucket>/<key>
```

### Dangerous (Always Require Approval)

```bash
# Delete all objects in bucket
aws s3 rm s3://<bucket>/ --recursive

# Delete bucket
aws s3 rb s3://<bucket> --force
```

## CloudWatch Operations

### Read-Only (Safe)

```bash
# List alarms
aws cloudwatch describe-alarms --query 'MetricAlarms[*].[AlarmName,StateValue,MetricName]' --output table

# Get alarm history
aws cloudwatch describe-alarm-history --alarm-name <alarm-name>

# Query logs
aws logs filter-log-events \
  --log-group-name <log-group> \
  --start-time $(date -d '1 hour ago' +%s000) \
  --filter-pattern "ERROR"

# Get log groups
aws logs describe-log-groups --query 'logGroups[*].[logGroupName,storedBytes]' --output table
```

### Mutating (Require Approval)

```bash
# Set alarm state (for testing)
aws cloudwatch set-alarm-state --alarm-name <alarm-name> --state-value OK --state-reason "Manual reset"

# Put metric alarm
aws cloudwatch put-metric-alarm \
  --alarm-name <name> \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## Cost Analysis

```bash
# Get current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --query 'ResultsByTime[0].Total.BlendedCost'

# Get costs by service
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "$(date +%Y-%m-01)" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE
```

## Safety Notes

- Always verify the correct AWS account and region before operations
- Use `--dry-run` flag where available (EC2 operations)
- Create snapshots before modifying RDS instances
- Be cautious with S3 `--recursive` operations
- Terminate operations are irreversible
