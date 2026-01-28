import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { homedir } from "os";
import { join } from "path";

interface SetupAnswers {
  environment: "local" | "ci-cd" | "server" | "kubernetes";
  safetyMode: "read-only" | "plan-mode" | "full-access";
  tools: string[];
  channel: "tui" | "telegram" | "slack";
  aiProvider: "anthropic" | "openai" | "openrouter";
  apiKey?: string;
}

const OPSBOT_DIR = join(homedir(), ".opsbot");
const CONFIG_PATH = join(OPSBOT_DIR, "config.json");

export const setupCommand = new Command("setup")
  .description("Interactive setup wizard for opsbot")
  .option("--preset <preset>", "Use a preset configuration (read-only, plan-mode, gitops)")
  .option("--non-interactive", "Skip interactive prompts, use defaults")
  .action(async (options) => {
    console.log(chalk.bold("\n  🤖 Opsbot Setup Wizard\n"));
    console.log(chalk.dim("  DevOps assistant with safety-first design\n"));

    if (options.preset) {
      await applyPreset(options.preset);
      return;
    }

    if (options.nonInteractive) {
      await applyDefaults();
      return;
    }

    const answers = await inquirer.prompt<SetupAnswers>([
      {
        type: "list",
        name: "environment",
        message: "Select your environment:",
        choices: [
          { name: "Local development", value: "local" },
          { name: "CI/CD pipeline", value: "ci-cd" },
          { name: "Production server", value: "server" },
          { name: "Kubernetes cluster", value: "kubernetes" },
        ],
      },
      {
        type: "list",
        name: "safetyMode",
        message: "Select safety mode:",
        choices: [
          {
            name: "Read-only (safest - no changes allowed)",
            value: "read-only",
          },
          {
            name: "Plan mode (review before execute)",
            value: "plan-mode",
          },
          {
            name: "Full access (dangerous - all operations)",
            value: "full-access",
          },
        ],
        default: "plan-mode",
      },
      {
        type: "checkbox",
        name: "tools",
        message: "Which tools do you use? (space to select)",
        choices: [
          { name: "Docker", value: "docker", checked: true },
          { name: "Kubernetes", value: "kubernetes", checked: true },
          { name: "Terraform", value: "terraform", checked: true },
          { name: "AWS", value: "aws" },
          { name: "GCP", value: "gcp" },
          { name: "Azure", value: "azure" },
        ],
      },
      {
        type: "list",
        name: "channel",
        message: "Select chat interface:",
        choices: [
          { name: "Terminal (TUI)", value: "tui" },
          { name: "Telegram", value: "telegram" },
          { name: "Slack", value: "slack" },
        ],
        default: "tui",
      },
      {
        type: "list",
        name: "aiProvider",
        message: "AI Provider:",
        choices: [
          { name: "Anthropic Claude (recommended)", value: "anthropic" },
          { name: "OpenAI", value: "openai" },
          { name: "OpenRouter", value: "openrouter" },
        ],
        default: "anthropic",
      },
      {
        type: "password",
        name: "apiKey",
        message: (answers) => `Enter your ${answers.aiProvider} API key (or press enter to skip):`,
        mask: "*",
      },
    ]);

    await saveConfig(answers);
    await detectTools(answers.tools);
    printSummary(answers);
  });

async function applyPreset(preset: string) {
  const spinner = ora(`Applying ${preset} preset...`).start();

  const presets: Record<string, Partial<SetupAnswers>> = {
    "read-only": {
      safetyMode: "read-only",
      tools: ["docker", "kubernetes", "terraform"],
      channel: "tui",
    },
    "plan-mode": {
      safetyMode: "plan-mode",
      tools: ["docker", "kubernetes", "terraform"],
      channel: "tui",
    },
    gitops: {
      safetyMode: "plan-mode",
      tools: ["docker", "kubernetes", "terraform", "github"],
      channel: "slack",
    },
  };

  const presetConfig = presets[preset];
  if (!presetConfig) {
    spinner.fail(`Unknown preset: ${preset}`);
    console.log(chalk.dim("Available presets: read-only, plan-mode, gitops"));
    return;
  }

  spinner.succeed(`Applied ${preset} preset`);

  const answers: SetupAnswers = {
    environment: "local",
    aiProvider: "anthropic",
    ...presetConfig,
  } as SetupAnswers;

  await saveConfig(answers);
  printSummary(answers);
}

async function applyDefaults() {
  const spinner = ora("Applying default configuration...").start();

  const answers: SetupAnswers = {
    environment: "local",
    safetyMode: "plan-mode",
    tools: ["docker", "kubernetes", "terraform"],
    channel: "tui",
    aiProvider: "anthropic",
  };

  await saveConfig(answers);
  spinner.succeed("Applied default configuration");
  printSummary(answers);
}

async function saveConfig(answers: SetupAnswers) {
  const spinner = ora("Saving configuration...").start();

  // Ensure config directory exists
  if (!existsSync(OPSBOT_DIR)) {
    mkdirSync(OPSBOT_DIR, { recursive: true, mode: 0o700 });
  }

  const config = {
    version: 1,
    environment: answers.environment,
    safety: {
      mode: answers.safetyMode,
      planTimeoutSec: 300,
    },
    ai: {
      provider: answers.aiProvider,
      ...(answers.apiKey && { apiKey: answers.apiKey }),
    },
    skills: {
      allowBundled: answers.tools,
    },
    channels: {
      tui: { enabled: answers.channel === "tui" },
      telegram: { enabled: answers.channel === "telegram" },
      slack: { enabled: answers.channel === "slack" },
      teams: { enabled: false },
    },
    exec: {
      security: "allowlist",
      onMiss: answers.safetyMode === "read-only" ? "deny" : "ask",
    },
  };

  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), { mode: 0o600 });
  spinner.succeed(`Configuration saved to ${CONFIG_PATH}`);
}

async function detectTools(selectedTools: string[]) {
  const spinner = ora("Detecting installed tools...").start();

  const toolBinaries: Record<string, string> = {
    docker: "docker",
    kubernetes: "kubectl",
    terraform: "terraform",
    aws: "aws",
    gcp: "gcloud",
    azure: "az",
    github: "gh",
  };

  const detected: string[] = [];
  const missing: string[] = [];

  for (const tool of selectedTools) {
    const binary = toolBinaries[tool];
    if (binary) {
      try {
        const proc = Bun.spawnSync(["which", binary]);
        if (proc.exitCode === 0) {
          // Get version
          let version = "unknown";
          try {
            const versionProc = Bun.spawnSync([binary, "--version"]);
            if (versionProc.exitCode === 0) {
              const output = versionProc.stdout.toString().trim();
              // Extract first line and clean up
              version = output.split("\n")[0].slice(0, 50);
            }
          } catch {
            // Ignore version detection errors
          }
          detected.push(`${tool} (${version})`);
        } else {
          missing.push(tool);
        }
      } catch {
        missing.push(tool);
      }
    }
  }

  spinner.succeed("Tool detection complete");

  if (detected.length > 0) {
    console.log(chalk.green(`\n✓ Detected tools:`));
    detected.forEach((t) => console.log(chalk.dim(`  - ${t}`)));
  }

  if (missing.length > 0) {
    console.log(chalk.yellow(`\n⚠ Missing tools:`));
    missing.forEach((t) => console.log(chalk.dim(`  - ${t}`)));
    console.log(chalk.dim("\n  Run 'opsbot doctor' for installation instructions"));
  }
}

function printSummary(answers: SetupAnswers) {
  console.log("\n" + chalk.bold("Setup complete!"));
  console.log(chalk.dim("─".repeat(40)));
  console.log(`Environment:  ${chalk.cyan(answers.environment)}`);
  console.log(`Safety mode:  ${chalk.cyan(answers.safetyMode)}`);
  console.log(`AI Provider:  ${chalk.cyan(answers.aiProvider)}`);
  console.log(`Channel:      ${chalk.cyan(answers.channel)}`);
  console.log(`Config:       ${chalk.dim(CONFIG_PATH)}`);
  console.log(chalk.dim("─".repeat(40)));
  console.log(`\nStart opsbot: ${chalk.bold("opsbot start")}`);
  console.log(`Open TUI:     ${chalk.bold("opsbot chat")}`);
}
