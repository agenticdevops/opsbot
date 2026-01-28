import { z } from "zod";
import { SafetyModeSchema, ImpactLevelSchema, OperationTypeSchema } from "./plan-review.schema.js";

/**
 * Configuration for approval forwarding to a channel
 */
export const ApprovalForwardingSchema = z.object({
  enabled: z.boolean().default(false),
  channel: z.enum(["slack", "telegram", "teams"]).optional(),
  target: z.string().optional(), // e.g., "#ops-approvals" or chat ID
  mentionOnCritical: z.array(z.string()).optional(), // User IDs to mention
});
export type ApprovalForwarding = z.infer<typeof ApprovalForwardingSchema>;

/**
 * Context-specific safety overrides (e.g., production vs staging)
 */
export const ContextOverrideSchema = z.object({
  requireApproval: z.boolean().default(true),
  allowedOperations: z.array(OperationTypeSchema).optional(),
  maxImpactLevel: ImpactLevelSchema.optional(),
});
export type ContextOverride = z.infer<typeof ContextOverrideSchema>;

/**
 * Safety configuration for opsbot
 */
export const SafetyConfigSchema = z.object({
  mode: SafetyModeSchema.default("plan-mode"),

  // Timeout for plans awaiting approval (seconds)
  planTimeoutSec: z.number().min(60).max(3600).default(300),

  // Operations that always require approval regardless of mode
  alwaysRequireApproval: z.array(z.string()).default([
    "delete",
    "destroy",
    "terminate",
    "drop",
    "rm -rf",
  ]),

  // Forward approval requests to a channel
  forwardApprovals: ApprovalForwardingSchema.optional(),

  // Auto-approve low-impact operations in plan-mode
  autoApproveLowImpact: z.boolean().default(false),

  // Context-specific overrides (e.g., by k8s context, AWS account)
  contextOverrides: z.record(z.string(), ContextOverrideSchema).optional(),
});
export type SafetyConfig = z.infer<typeof SafetyConfigSchema>;

/**
 * Workflow state for tracking active plans
 */
export const WorkflowStateSchema = z.object({
  activePlans: z.record(z.string(), z.any()), // planId -> Plan
  recentDecisions: z.array(z.any()), // Last N decisions
  stats: z.object({
    totalPlansCreated: z.number(),
    totalApproved: z.number(),
    totalRejected: z.number(),
    totalExpired: z.number(),
    totalExecuted: z.number(),
  }),
});
export type WorkflowState = z.infer<typeof WorkflowStateSchema>;
