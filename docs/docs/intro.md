---
slug: /
sidebar_position: 0
---

# Welcome to Opsbot

**Opsbot** is a DevOps assistant with safety-first design. It helps you manage Kubernetes clusters, Docker containers, and cloud infrastructure through chat interfaces like Telegram and Slack.

## Key Features

- **Safety-First Design** - Three safety modes: read-only, plan-mode, and full-access
- **Plan → Review → Approve** - Mutations require explicit approval before execution
- **DevOps Skills** - Docker, Kubernetes, Terraform, AWS, and more
- **Multiple Channels** - Telegram, Slack, and API access
- **Audit Trail** - Complete logging of all operations

## Quick Start

Get up and running in 5 minutes:

```bash
# Start with Docker
docker run -d \
  --name opsbot \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-ant-... \
  -e TELEGRAM_BOT_TOKEN=123456:ABC... \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ghcr.io/agenticdevops/opsbot:latest
```

Then interact via Telegram:

```
You: kubectl get pods
Bot: 📋 Pods in default namespace...

You: docker ps
Bot: 📦 Running containers...
```

## Safety Modes

| Mode | Description |
|------|-------------|
| `read-only` | Only read operations allowed |
| `plan-mode` | Mutations require approval (default) |
| `full-access` | All operations allowed |

## Next Steps

- [5-Minute Telegram Setup](/docs/getting-started/telegram-quickstart) - Get a bot running fast
- [Installation Guide](/docs/getting-started/installation) - Detailed setup instructions
- [Safety Modes](/docs/users/safety-modes) - Understand the safety layer
- [API Reference](/docs/developers/api) - REST API documentation
