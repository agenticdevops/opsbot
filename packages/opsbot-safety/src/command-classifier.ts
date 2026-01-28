import type { OperationType, ImpactLevel } from "@opsbot/contracts";

/**
 * Patterns for read-only operations
 */
const READ_PATTERNS: RegExp[] = [
  // Docker
  /^docker\s+(ps|images|logs|inspect|stats|top|volume\s+ls|network\s+ls)/,
  // Kubernetes
  /^kubectl\s+(get|describe|logs|top|cluster-info|config\s+(current-context|get-contexts)|api-resources)/,
  // Terraform
  /^terraform\s+(plan|show|state\s+(list|show)|output|validate|version|providers|workspace\s+(list|show)|graph)/,
  // GitHub
  /^gh\s+(pr\s+(list|view|diff|checks)|issue\s+(list|view)|release\s+(list|view)|run\s+(list|view)|repo\s+(view|list)|search|api\s+)/,
  // AWS (read)
  /^aws\s+\S+\s+(describe|list|get)/,
  // GCP (read)
  /^gcloud\s+\S+\s+(describe|list|get)/,
  // General safe commands
  /^(cat|head|tail|grep|awk|sed|jq|yq|curl\s+-s|curl\s+--silent|less|more|wc|sort|uniq)\s/,
];

/**
 * Patterns for mutating operations
 */
const MUTATE_PATTERNS: RegExp[] = [
  // Docker
  /^docker\s+(run|start|stop|restart|kill|rm|rmi|build|push|pull|exec|cp)/,
  // Kubernetes
  /^kubectl\s+(apply|create|delete|edit|patch|scale|rollout|exec|cp|port-forward|drain|cordon|uncordon)/,
  // Terraform
  /^terraform\s+(apply|destroy|import|state\s+(mv|rm|push)|taint|untaint|refresh)/,
  // GitHub
  /^gh\s+(pr\s+(create|merge|close|reopen|review|edit|ready)|issue\s+(create|close|reopen|edit)|release\s+(create|delete|upload)|run\s+(rerun|cancel)|workflow\s+run)/,
  // AWS (write)
  /^aws\s+\S+\s+(create|delete|update|terminate|start|stop|reboot|modify)/,
  // GCP (write)
  /^gcloud\s+\S+\s+(create|delete|update|start|stop|reset)/,
];

/**
 * Patterns for dangerous operations (always require approval)
 */
const DANGEROUS_PATTERNS: RegExp[] = [
  // Docker
  /^docker\s+(system\s+prune|container\s+prune|image\s+prune|volume\s+prune)/,
  /^docker\s+rm\s+-f/,
  // Kubernetes
  /^kubectl\s+delete\s+.*--all/,
  /^kubectl\s+delete\s+namespace/,
  /^kubectl\s+drain/,
  // Terraform
  /^terraform\s+destroy/,
  /^terraform\s+force-unlock/,
  /^terraform\s+state\s+push/,
  // GitHub
  /^gh\s+repo\s+delete/,
  /^gh\s+release\s+delete/,
  // Shell
  /rm\s+-rf/,
  /rm\s+-fr/,
  /rmdir/,
  // AWS
  /^aws\s+\S+\s+terminate/,
  /^aws\s+ec2\s+delete/,
  /^aws\s+s3\s+rm.*--recursive/,
  // General
  /drop\s+database/i,
  /drop\s+table/i,
  /truncate/i,
];

export interface ClassificationResult {
  operation: OperationType;
  impact: ImpactLevel;
  isDangerous: boolean;
  matchedPattern?: string;
}

/**
 * Classify a command to determine its operation type and impact
 */
export function classifyCommand(command: string): ClassificationResult {
  const trimmed = command.trim().toLowerCase();

  // Check dangerous patterns first
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        operation: inferOperationType(trimmed),
        impact: "critical",
        isDangerous: true,
        matchedPattern: pattern.source,
      };
    }
  }

  // Check mutating patterns
  for (const pattern of MUTATE_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        operation: inferOperationType(trimmed),
        impact: inferImpact(trimmed),
        isDangerous: false,
        matchedPattern: pattern.source,
      };
    }
  }

  // Check read patterns
  for (const pattern of READ_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        operation: "read",
        impact: "none",
        isDangerous: false,
        matchedPattern: pattern.source,
      };
    }
  }

  // Unknown command - treat as potentially mutating
  return {
    operation: "exec",
    impact: "medium",
    isDangerous: false,
  };
}

/**
 * Infer the operation type from the command
 */
function inferOperationType(command: string): OperationType {
  if (/delete|rm|remove|destroy|drop|prune|terminate/i.test(command)) {
    return "delete";
  }
  if (/create|new|init|run|launch|start/i.test(command)) {
    return "create";
  }
  if (/update|edit|patch|scale|modify|apply|restart/i.test(command)) {
    return "update";
  }
  if (/exec|shell|sh\s|bash\s/i.test(command)) {
    return "exec";
  }
  return "read";
}

/**
 * Infer the impact level from the command
 */
function inferImpact(command: string): ImpactLevel {
  // High impact indicators
  if (/prod|production|--all|--force|-f\s/i.test(command)) {
    return "high";
  }

  // Medium impact indicators
  if (/staging|delete|rm|stop|restart/i.test(command)) {
    return "medium";
  }

  // Low impact indicators
  if (/dev|local|test|--dry-run/i.test(command)) {
    return "low";
  }

  return "medium";
}

/**
 * Check if a command should always require approval
 */
export function requiresApproval(
  command: string,
  alwaysRequireApproval: string[]
): boolean {
  const trimmed = command.trim().toLowerCase();

  for (const pattern of alwaysRequireApproval) {
    if (trimmed.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  return false;
}
