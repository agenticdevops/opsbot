---
name: terraform
description: "Manage infrastructure as code with Terraform. Supports plan, apply, state management, and workspace operations. Always run plan before apply."
metadata:
  opsbot:
    emoji: "🏗️"
    tags: ["terraform", "iac", "infrastructure", "devops", "cloud"]
    requires:
      bins: ["terraform"]
    install:
      - id: brew
        kind: brew
        formula: terraform
        bins: ["terraform"]
      - id: apt
        kind: manual
        url: https://developer.hashicorp.com/terraform/install
        instructions: "Add HashiCorp GPG key and repository, then install terraform"
      - id: manual
        kind: manual
        url: https://developer.hashicorp.com/terraform/install
        instructions: "Download from HashiCorp website or use tfenv for version management"
---

# Terraform Skill

Manage infrastructure as code with Terraform. **Always run `terraform plan` before `terraform apply`** to preview changes.

## Read-Only Operations (Always Safe)

### Check version and providers
```bash
terraform version
terraform providers
```

### Initialize (safe, downloads providers)
```bash
terraform init
terraform init -upgrade   # Upgrade providers
```

### Validate configuration
```bash
terraform validate
terraform fmt -check      # Check formatting
```

### Plan (preview changes)
```bash
terraform plan
terraform plan -out=tfplan              # Save plan to file
terraform plan -target=<resource>       # Plan specific resource
terraform plan -var="key=value"         # With variable
```

### Show state
```bash
terraform show
terraform show tfplan                   # Show saved plan
terraform state list                    # List resources in state
terraform state show <resource>         # Show specific resource
```

### Output values
```bash
terraform output
terraform output <name>
terraform output -json
```

### Workspace management (read)
```bash
terraform workspace list
terraform workspace show
```

### Graph (visualize)
```bash
terraform graph | dot -Tpng > graph.png
```

## Mutating Operations (Require Approval in Plan Mode)

### Format code
```bash
terraform fmt             # Format all files
terraform fmt -recursive  # Include subdirectories
```

### Apply changes (ALWAYS plan first!)
```bash
# Step 1: Create plan
terraform plan -out=tfplan

# Step 2: Review plan output

# Step 3: Apply the plan
terraform apply tfplan
```

### Apply with auto-approve (use with caution)
```bash
terraform apply -auto-approve   # Skip confirmation
```

### Targeted operations
```bash
terraform apply -target=<resource>
terraform plan -target=<resource>
```

### Workspace management (write)
```bash
terraform workspace new <name>
terraform workspace select <name>
terraform workspace delete <name>
```

### State manipulation
```bash
terraform state mv <source> <dest>      # Rename resource
terraform state rm <resource>           # Remove from state
terraform import <resource> <id>        # Import existing resource
```

### Refresh state
```bash
terraform refresh
```

## Dangerous Operations (Always Require Approval)

### Destroy infrastructure
```bash
# Preview destroy
terraform plan -destroy

# Destroy all
terraform destroy

# Destroy specific
terraform destroy -target=<resource>
```

### Force unlock
```bash
terraform force-unlock <lock-id>
```

### State push/pull
```bash
terraform state pull > state.json
terraform state push state.json
```

## Safety Notes

- **Always run `plan` before `apply`** - never apply without reviewing the plan
- **Use `-out=tfplan`** to save plans and apply exactly what was reviewed
- **Use workspaces** to separate environments (dev, staging, prod)
- **Lock state** when working in teams (S3 + DynamoDB, Terraform Cloud)
- **Review destroy plans carefully** - data loss is often irreversible
- **Use `-target` sparingly** - it can lead to state drift
- **Back up state** before state manipulation operations
- In GitOps mode, prefer creating PRs over direct `terraform apply`

## Common Patterns

### Safe apply workflow
```bash
# 1. Initialize
terraform init

# 2. Validate
terraform validate

# 3. Plan and save
terraform plan -out=tfplan

# 4. Review output, then apply
terraform apply tfplan
```

### Check for drift
```bash
terraform plan -detailed-exitcode
# Exit code 0: No changes
# Exit code 1: Error
# Exit code 2: Changes detected
```
