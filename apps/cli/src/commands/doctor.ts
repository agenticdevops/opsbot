import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";

interface ToolInfo {
  name: string;
  binary: string;
  versionCmd: string[];
  installInstructions: {
    brew?: string;
    apt?: string;
    url: string;
  };
}

const TOOLS: ToolInfo[] = [
  {
    name: "Docker",
    binary: "docker",
    versionCmd: ["docker", "--version"],
    installInstructions: {
      brew: "brew install --cask docker",
      apt: "sudo apt install docker.io",
      url: "https://docs.docker.com/get-docker/",
    },
  },
  {
    name: "Kubernetes (kubectl)",
    binary: "kubectl",
    versionCmd: ["kubectl", "version", "--client", "--short"],
    installInstructions: {
      brew: "brew install kubectl",
      apt: "sudo apt install kubectl",
      url: "https://kubernetes.io/docs/tasks/tools/",
    },
  },
  {
    name: "Terraform",
    binary: "terraform",
    versionCmd: ["terraform", "--version"],
    installInstructions: {
      brew: "brew install terraform",
      url: "https://developer.hashicorp.com/terraform/install",
    },
  },
  {
    name: "GitHub CLI",
    binary: "gh",
    versionCmd: ["gh", "--version"],
    installInstructions: {
      brew: "brew install gh",
      apt: "sudo apt install gh",
      url: "https://cli.github.com/",
    },
  },
  {
    name: "AWS CLI",
    binary: "aws",
    versionCmd: ["aws", "--version"],
    installInstructions: {
      brew: "brew install awscli",
      url: "https://aws.amazon.com/cli/",
    },
  },
  {
    name: "Google Cloud CLI",
    binary: "gcloud",
    versionCmd: ["gcloud", "--version"],
    installInstructions: {
      brew: "brew install --cask google-cloud-sdk",
      url: "https://cloud.google.com/sdk/docs/install",
    },
  },
  {
    name: "Azure CLI",
    binary: "az",
    versionCmd: ["az", "--version"],
    installInstructions: {
      brew: "brew install azure-cli",
      apt: "curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash",
      url: "https://docs.microsoft.com/en-us/cli/azure/install-azure-cli",
    },
  },
  {
    name: "Helm",
    binary: "helm",
    versionCmd: ["helm", "version", "--short"],
    installInstructions: {
      brew: "brew install helm",
      url: "https://helm.sh/docs/intro/install/",
    },
  },
  {
    name: "ArgoCD CLI",
    binary: "argocd",
    versionCmd: ["argocd", "version", "--client"],
    installInstructions: {
      brew: "brew install argocd",
      url: "https://argo-cd.readthedocs.io/en/stable/cli_installation/",
    },
  },
];

export const doctorCommand = new Command("doctor")
  .description("Check tool availability and system health")
  .option("--install", "Show installation instructions for missing tools")
  .action(async (options) => {
    console.log(chalk.bold("\n  🩺 Opsbot Doctor\n"));
    console.log(chalk.dim("  Checking system health and tool availability\n"));

    const spinner = ora("Checking tools...").start();

    const results: { tool: ToolInfo; installed: boolean; version?: string }[] = [];

    for (const tool of TOOLS) {
      try {
        const proc = Bun.spawnSync(["which", tool.binary]);
        if (proc.exitCode === 0) {
          // Get version
          let version = "unknown";
          try {
            const versionProc = Bun.spawnSync(tool.versionCmd);
            if (versionProc.exitCode === 0) {
              version = versionProc.stdout.toString().trim().split("\n")[0];
            }
          } catch {
            // Ignore
          }
          results.push({ tool, installed: true, version });
        } else {
          results.push({ tool, installed: false });
        }
      } catch {
        results.push({ tool, installed: false });
      }
    }

    spinner.stop();

    // Print results
    const installed = results.filter((r) => r.installed);
    const missing = results.filter((r) => !r.installed);

    if (installed.length > 0) {
      console.log(chalk.green.bold("✓ Installed tools:"));
      for (const r of installed) {
        console.log(chalk.green(`  ✓ ${r.tool.name}`));
        if (r.version) {
          console.log(chalk.dim(`    ${r.version}`));
        }
      }
    }

    if (missing.length > 0) {
      console.log(chalk.yellow.bold("\n⚠ Missing tools:"));
      for (const r of missing) {
        console.log(chalk.yellow(`  ✗ ${r.tool.name}`));
        if (options.install) {
          const inst = r.tool.installInstructions;
          if (inst.brew) {
            console.log(chalk.dim(`    brew: ${inst.brew}`));
          }
          if (inst.apt) {
            console.log(chalk.dim(`    apt:  ${inst.apt}`));
          }
          console.log(chalk.dim(`    url:  ${inst.url}`));
        }
      }

      if (!options.install) {
        console.log(chalk.dim("\n  Run 'opsbot doctor --install' for installation instructions"));
      }
    }

    // Summary
    console.log(chalk.dim("\n─".repeat(40)));
    console.log(
      `${chalk.bold("Summary:")} ${installed.length}/${TOOLS.length} tools available`
    );

    if (missing.length === 0) {
      console.log(chalk.green("\n✓ All tools are installed!"));
    }
  });
