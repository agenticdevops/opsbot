import { z } from "zod";

/**
 * Safety modes for opsbot operations
 */
export const SafetyModeSchema = z.enum([
  "read-only", // Only read operations allowed, no mutations
  "plan-mode", // Mutations require plan -> review -> approve
  "full-access", // All operations allowed (dangerous)
]);
export type SafetyMode = z.infer<typeof SafetyModeSchema>;

/**
 * Operation types for command classification
 */
export const OperationTypeSchema = z.enum([
  "read", // Non-mutating: get, describe, logs, list
  "create", // Creating new resources
  "update", // Modifying existing resources
  "delete", // Removing resources
  "exec", // Executing commands in containers/VMs
]);
export type OperationType = z.infer<typeof OperationTypeSchema>;

/**
 * Impact levels for plan analysis
 */
export const ImpactLevelSchema = z.enum([
  "none", // No impact (read operations)
  "low", // Minor changes (single non-critical resource)
  "medium", // Moderate changes (multiple resources, staging)
  "high", // Significant changes (production resources)
  "critical", // Dangerous operations (delete all, destroy, etc.)
]);
export type ImpactLevel = z.infer<typeof ImpactLevelSchema>;

/**
 * Resource affected by an operation
 */
export const AffectedResourceSchema = z.object({
  type: z.string(), // e.g., "deployment", "pod", "instance"
  name: z.string(),
  namespace: z.string().optional(),
  provider: z.string().optional(), // e.g., "kubernetes", "aws", "docker"
});
export type AffectedResource = z.infer<typeof AffectedResourceSchema>;

/**
 * Analysis of a command's impact
 */
export const CommandAnalysisSchema = z.object({
  operation: OperationTypeSchema,
  resources: z.array(AffectedResourceSchema),
  dryRunOutput: z.string().optional(),
  estimatedImpact: ImpactLevelSchema,
  warnings: z.array(z.string()).optional(),
});
export type CommandAnalysis = z.infer<typeof CommandAnalysisSchema>;

/**
 * A plan for executing a potentially dangerous operation
 */
export const PlanSchema = z.object({
  id: z.string().uuid(),
  command: z.string(),
  originalRequest: z.string(), // User's original request
  analysis: CommandAnalysisSchema,
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  status: z.enum(["pending", "approved", "rejected", "expired", "executed"]),
  channel: z.string().optional(), // Where the request came from
  requesterId: z.string().optional(), // Who made the request
});
export type Plan = z.infer<typeof PlanSchema>;

/**
 * Decision on a plan
 */
export const ApprovalDecisionSchema = z.object({
  planId: z.string().uuid(),
  decision: z.enum(["approve", "reject", "modify"]),
  approver: z.string(),
  approverId: z.string().optional(),
  comment: z.string().optional(),
  timestamp: z.string().datetime(),
  modifiedCommand: z.string().optional(), // If decision is "modify"
});
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;

/**
 * Execution result after approval
 */
export const ExecutionResultSchema = z.object({
  planId: z.string().uuid(),
  success: z.boolean(),
  output: z.string().optional(),
  error: z.string().optional(),
  executedAt: z.string().datetime(),
  durationMs: z.number().optional(),
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;
