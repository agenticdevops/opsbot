import type { Plan, CommandAnalysis, AffectedResource } from "@opsbot/contracts";
import { classifyCommand } from "./command-classifier.js";

/**
 * Generate a unique plan ID
 */
function generatePlanId(): string {
  return crypto.randomUUID();
}

/**
 * Parse resources from a kubectl command
 */
function parseKubernetesResources(command: string): AffectedResource[] {
  const resources: AffectedResource[] = [];

  // Extract namespace
  const nsMatch = command.match(/-n\s+(\S+)|--namespace[=\s]+(\S+)/);
  const namespace = nsMatch?.[1] || nsMatch?.[2] || "default";

  // Common patterns: kubectl <action> <type>/<name> or kubectl <action> <type> <name>
  const patterns = [
    /kubectl\s+\w+\s+(pod|deployment|service|configmap|secret|ingress|statefulset|daemonset|job|cronjob)\/(\S+)/i,
    /kubectl\s+\w+\s+(pod|deployment|service|configmap|secret|ingress|statefulset|daemonset|job|cronjob)\s+(\S+)/i,
  ];

  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match) {
      resources.push({
        type: match[1].toLowerCase(),
        name: match[2],
        namespace,
        provider: "kubernetes",
      });
      break;
    }
  }

  return resources;
}

/**
 * Parse resources from a docker command
 */
function parseDockerResources(command: string): AffectedResource[] {
  const resources: AffectedResource[] = [];

  // Container operations: docker <action> <container>
  const containerMatch = command.match(
    /docker\s+(stop|start|restart|kill|rm|exec|logs|inspect)\s+(\S+)/
  );
  if (containerMatch) {
    resources.push({
      type: "container",
      name: containerMatch[2],
      provider: "docker",
    });
  }

  // Image operations: docker <action> <image>
  const imageMatch = command.match(
    /docker\s+(rmi|push|pull|build\s+-t)\s+(\S+)/
  );
  if (imageMatch) {
    resources.push({
      type: "image",
      name: imageMatch[2],
      provider: "docker",
    });
  }

  return resources;
}

/**
 * Parse resources from a terraform command
 */
function parseTerraformResources(command: string): AffectedResource[] {
  const resources: AffectedResource[] = [];

  // Target resource: -target=<resource>
  const targetMatch = command.match(/-target[=\s]+(\S+)/g);
  if (targetMatch) {
    for (const match of targetMatch) {
      const resource = match.replace(/-target[=\s]+/, "");
      resources.push({
        type: "terraform_resource",
        name: resource,
        provider: "terraform",
      });
    }
  }

  return resources;
}

/**
 * Parse affected resources from a command
 */
function parseResources(command: string): AffectedResource[] {
  if (command.startsWith("kubectl")) {
    return parseKubernetesResources(command);
  }
  if (command.startsWith("docker")) {
    return parseDockerResources(command);
  }
  if (command.startsWith("terraform")) {
    return parseTerraformResources(command);
  }
  return [];
}

/**
 * Analyze a command and return its classification
 */
export function analyzeCommand(command: string): CommandAnalysis {
  const classification = classifyCommand(command);
  const resources = parseResources(command);

  const warnings: string[] = [];

  // Add warnings for dangerous patterns
  if (classification.isDangerous) {
    warnings.push("This command is classified as dangerous and always requires approval");
  }

  if (/--all|prune/i.test(command)) {
    warnings.push("This command affects multiple resources");
  }

  if (/prod|production/i.test(command)) {
    warnings.push("This command appears to target production");
  }

  if (!/--dry-run|plan\b/i.test(command) && /apply|delete|destroy/i.test(command)) {
    warnings.push("Consider using --dry-run or plan first");
  }

  return {
    operation: classification.operation,
    resources,
    estimatedImpact: classification.impact,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export interface CreatePlanOptions {
  command: string;
  originalRequest: string;
  channel?: string;
  requesterId?: string;
  timeoutSec?: number;
  dryRunOutput?: string;
}

/**
 * Create a new plan for approval
 */
export function createPlan(options: CreatePlanOptions): Plan {
  const { command, originalRequest, channel, requesterId, timeoutSec = 300, dryRunOutput } = options;

  const analysis = analyzeCommand(command);

  if (dryRunOutput) {
    analysis.dryRunOutput = dryRunOutput;
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + timeoutSec * 1000);

  return {
    id: generatePlanId(),
    command,
    originalRequest,
    analysis,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: "pending",
    channel,
    requesterId,
  };
}

/**
 * Format a plan for display
 */
export function formatPlan(plan: Plan): string {
  const lines: string[] = [
    `Plan #${plan.id.slice(0, 8)}`,
    "─".repeat(40),
    `Request: ${plan.originalRequest}`,
    `Command: ${plan.command}`,
    `Impact: ${plan.analysis.estimatedImpact.toUpperCase()}`,
    `Operation: ${plan.analysis.operation}`,
  ];

  if (plan.analysis.resources.length > 0) {
    lines.push(`Resources:`);
    for (const r of plan.analysis.resources) {
      lines.push(`  - ${r.type}/${r.name}${r.namespace ? ` (ns: ${r.namespace})` : ""}`);
    }
  }

  if (plan.analysis.warnings && plan.analysis.warnings.length > 0) {
    lines.push(`Warnings:`);
    for (const w of plan.analysis.warnings) {
      lines.push(`  ⚠ ${w}`);
    }
  }

  if (plan.analysis.dryRunOutput) {
    lines.push(`Dry-run output:`);
    lines.push(plan.analysis.dryRunOutput);
  }

  lines.push("");
  lines.push(`Reply: /approve ${plan.id.slice(0, 8)} or /reject ${plan.id.slice(0, 8)} [reason]`);
  lines.push(`Expires: ${new Date(plan.expiresAt).toLocaleTimeString()}`);

  return lines.join("\n");
}
