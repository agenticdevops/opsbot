# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-01-28

### Added

- Initial project structure with monorepo setup
- `@opsbot/contracts` - Zod schemas for safety, config, and skills
- `@opsbot/skills` - DevOps skills: docker, kubernetes, terraform, github
- `@opsbot/safety` - Command classifier and plan generator for safety layer
- `@opsbot/presets` - Preconfigured profiles: read-only, plan-mode, gitops
- `@opsbot/cli` - CLI with setup wizard and doctor commands
- Safety modes: read-only, plan-mode, full-access
- Plan → review → approve workflow for mutations
- Command classification for read vs mutating operations

### Skills

- **docker** - Container lifecycle, logs, exec, build, prune
- **kubernetes** - Pod management, logs, apply, scale, rollout
- **terraform** - Plan, apply, destroy, state management
- **github** - PRs, issues, releases, actions, workflows

[Unreleased]: https://github.com/agenticdevops/opsbot/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/agenticdevops/opsbot/releases/tag/v0.1.0
