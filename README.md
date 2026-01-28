# opsbot

> DevOps/SRE assistant with safety-first design - built on clawdbot

**opsbot** is a specialized AI assistant for DevOps and SRE teams, featuring:

- **5-minute setup** - Interactive wizard with DevOps presets
- **Safety-first design** - Read-only, plan-mode, or GitOps workflows
- **DevOps skills** - Docker, Kubernetes, Terraform, cloud CLIs, and more
- **Multiple interfaces** - TUI, Telegram, Slack (Teams coming soon)

## Quick Start

```bash
# Install
npm install -g @opsbot/cli

# Setup (interactive wizard)
opsbot setup

# Or use a preset
opsbot setup --preset plan-mode

# Start
opsbot start
```

## Safety Modes

| Mode | Description |
|------|-------------|
| `read-only` | Only read operations (get, describe, logs) - no mutations allowed |
| `plan-mode` | Mutations require plan → review → approve workflow |
| `full-access` | All operations allowed (use with caution) |

## Skills

opsbot includes DevOps-specific skills:

- **docker** - Container lifecycle, logs, exec, build
- **kubernetes** - Pod management, logs, apply, scale
- **terraform** - Plan, apply, state management
- **github** - PRs, issues, actions, releases

Coming soon: AWS, GCP, Azure, Prometheus, Grafana, Helm, ArgoCD

## Architecture

```
opsbot/
├── packages/
│   ├── contracts/        # Zod schemas (contracts-first)
│   ├── opsbot-skills/    # DevOps skills (markdown-based)
│   ├── opsbot-safety/    # Plan/review/approve workflow
│   └── opsbot-presets/   # Preconfigured profiles
├── apps/
│   ├── cli/              # CLI (opsbot command)
│   └── server/           # Bun + Elysia server
└── deploy/
    ├── docker/           # Docker + docker-compose
    └── kubernetes/       # K8s manifests
```

## Development

```bash
# Clone
git clone https://github.com/agenticdevops/opsbot
cd opsbot

# Install dependencies
bun install

# Build
bun run build

# Run CLI in dev mode
bun run --filter @opsbot/cli dev
```

## Configuration

Config is stored in `~/.opsbot/config.json`:

```json
{
  "version": 1,
  "safety": {
    "mode": "plan-mode",
    "planTimeoutSec": 300
  },
  "skills": {
    "allowBundled": ["docker", "kubernetes", "terraform"]
  },
  "channels": {
    "tui": { "enabled": true },
    "slack": { "enabled": false }
  }
}
```

## License

MIT
