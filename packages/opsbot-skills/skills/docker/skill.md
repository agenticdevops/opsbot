---
name: docker
description: "Manage Docker containers, images, and volumes. Use for container lifecycle operations, viewing logs, executing commands in containers, and building images."
metadata:
  opsbot:
    emoji: "🐳"
    tags: ["containers", "devops", "infrastructure"]
    requires:
      bins: ["docker"]
    install:
      - id: brew
        kind: brew
        formula: docker
        bins: ["docker"]
      - id: apt
        kind: apt
        package: docker.io
        bins: ["docker"]
      - id: manual
        kind: manual
        url: https://docs.docker.com/get-docker/
        instructions: "Install Docker Desktop or Docker Engine from the official documentation"
---

# Docker Skill

Manage Docker containers, images, volumes, and networks using the `docker` CLI.

## Read-Only Operations (Always Safe)

### List containers
```bash
docker ps                    # Running containers
docker ps -a                 # All containers
docker ps -a --format "table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Image}}"
```

### View logs
```bash
docker logs <container>              # Full logs
docker logs <container> --tail 100   # Last 100 lines
docker logs <container> -f           # Follow logs (streaming)
docker logs <container> --since 1h   # Last hour
```

### Inspect resources
```bash
docker inspect <container|image>
docker stats                         # Live resource usage
docker top <container>               # Running processes
```

### List images
```bash
docker images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

### List volumes and networks
```bash
docker volume ls
docker network ls
```

## Mutating Operations (Require Approval in Plan Mode)

### Container lifecycle
```bash
docker stop <container>      # Stop container (graceful)
docker start <container>     # Start stopped container
docker restart <container>   # Restart container
docker kill <container>      # Force stop container
```

### Execute commands in container
```bash
docker exec <container> <command>
docker exec -it <container> /bin/sh   # Interactive shell
```

### Remove containers/images
```bash
docker rm <container>        # Remove stopped container
docker rm -f <container>     # Force remove running container
docker rmi <image>           # Remove image
```

### Build and run
```bash
docker build -t <tag> .                    # Build image
docker run -d --name <name> <image>        # Run detached
docker run -it --rm <image> /bin/sh        # Interactive, remove after exit
```

## Dangerous Operations (Always Require Approval)

```bash
docker system prune -a       # Remove all unused data
docker container prune       # Remove all stopped containers
docker image prune -a        # Remove all unused images
docker volume prune          # Remove all unused volumes
```

## Safety Notes

- Always use `--dry-run` with `docker compose` commands when available
- Prefer named containers over IDs for clarity
- Use `docker logs --tail` to avoid overwhelming output
- Be cautious with `prune` commands in production
