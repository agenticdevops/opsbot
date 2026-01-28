---
name: github
description: "Interact with GitHub using the gh CLI. Manage repositories, pull requests, issues, actions, and releases."
metadata:
  opsbot:
    emoji: "🐙"
    tags: ["github", "git", "vcs", "ci-cd", "devops"]
    requires:
      bins: ["gh"]
    install:
      - id: brew
        kind: brew
        formula: gh
        bins: ["gh"]
      - id: apt
        kind: apt
        package: gh
        bins: ["gh"]
      - id: manual
        kind: manual
        url: https://cli.github.com/
        instructions: "Install GitHub CLI from cli.github.com"
---

# GitHub Skill

Interact with GitHub using the `gh` CLI. Authenticate with `gh auth login` before use.

## Authentication

```bash
gh auth status            # Check auth status
gh auth login             # Interactive login
gh auth login --with-token < token.txt
```

## Read-Only Operations (Always Safe)

### Repository info
```bash
gh repo view
gh repo view <owner/repo>
gh repo list <owner>
```

### Pull requests
```bash
gh pr list
gh pr list --state all
gh pr view <number>
gh pr view <number> --comments
gh pr diff <number>
gh pr checks <number>
```

### Issues
```bash
gh issue list
gh issue list --state all
gh issue view <number>
gh issue view <number> --comments
```

### Releases
```bash
gh release list
gh release view <tag>
```

### Actions / Workflows
```bash
gh run list
gh run view <run-id>
gh run view <run-id> --log
gh workflow list
gh workflow view <workflow>
```

### Search
```bash
gh search repos <query>
gh search issues <query>
gh search prs <query>
gh search code <query>
```

### API (read)
```bash
gh api repos/<owner>/<repo>
gh api repos/<owner>/<repo>/pulls
gh api repos/<owner>/<repo>/issues
```

## Mutating Operations (Require Approval in Plan Mode)

### Create PR
```bash
gh pr create --title "<title>" --body "<body>"
gh pr create --fill                    # Use commit info
gh pr create --draft                   # Create as draft
gh pr create --base <branch>           # Target branch
```

### PR actions
```bash
gh pr merge <number>
gh pr merge <number> --squash
gh pr merge <number> --rebase
gh pr close <number>
gh pr reopen <number>
gh pr ready <number>                   # Mark ready for review
```

### Review PR
```bash
gh pr review <number> --approve
gh pr review <number> --request-changes --body "<comment>"
gh pr review <number> --comment --body "<comment>"
```

### Issues
```bash
gh issue create --title "<title>" --body "<body>"
gh issue close <number>
gh issue reopen <number>
gh issue edit <number> --title "<new-title>"
```

### Labels and assignees
```bash
gh pr edit <number> --add-label "<label>"
gh pr edit <number> --add-assignee "<user>"
gh issue edit <number> --add-label "<label>"
```

### Releases
```bash
gh release create <tag> --title "<title>" --notes "<notes>"
gh release create <tag> --generate-notes
gh release upload <tag> <files>
```

### Workflow dispatch
```bash
gh workflow run <workflow> --ref <branch>
gh run rerun <run-id>
gh run cancel <run-id>
```

### Clone and fork
```bash
gh repo clone <owner/repo>
gh repo fork <owner/repo>
```

## Dangerous Operations (Always Require Approval)

### Delete
```bash
gh release delete <tag>
gh repo delete <owner/repo>           # Very dangerous!
```

### Force operations
```bash
gh pr merge <number> --admin          # Bypass protections
```

## Safety Notes

- Always check `gh auth status` to verify you're using the correct account
- Use `--dry-run` where available
- Review PR diffs with `gh pr diff` before merging
- Check workflow runs with `gh pr checks` before merging
- Use draft PRs for work in progress
- Prefer squash merges to keep history clean
