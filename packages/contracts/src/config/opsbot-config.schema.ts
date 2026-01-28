import { z } from "zod";
import { SafetyConfigSchema } from "../safety/approval-workflow.schema.js";

/**
 * Environment type for deployment
 */
export const EnvironmentTypeSchema = z.enum([
  "local", // Local development
  "ci-cd", // CI/CD pipeline
  "server", // Production server
  "kubernetes", // Running in K8s cluster
]);
export type EnvironmentType = z.infer<typeof EnvironmentTypeSchema>;

/**
 * Channel configuration
 */
export const ChannelConfigSchema = z.object({
  enabled: z.boolean().default(false),
  accounts: z
    .record(
      z.string(),
      z.object({
        token: z.string().optional(),
        appToken: z.string().optional(),
        appId: z.string().optional(),
        appPassword: z.string().optional(),
      })
    )
    .optional(),
});
export type ChannelConfig = z.infer<typeof ChannelConfigSchema>;

/**
 * Skill configuration entry
 */
export const SkillEntrySchema = z.object({
  enabled: z.boolean().default(true),
  config: z.record(z.string(), z.unknown()).optional(),
});
export type SkillEntry = z.infer<typeof SkillEntrySchema>;

/**
 * Exec security configuration
 */
export const ExecConfigSchema = z.object({
  // Security mode: allowlist, denylist, or open
  security: z.enum(["allowlist", "denylist", "open"]).default("allowlist"),

  // What to do when a command is not in the list
  onMiss: z.enum(["deny", "ask", "allow"]).default("ask"),

  // Safe binaries that don't need approval
  safeBins: z
    .array(z.string())
    .default(["jq", "yq", "grep", "awk", "sed", "curl", "cat", "head", "tail", "wc", "sort", "uniq"]),

  // Explicitly denied commands
  denyPatterns: z.array(z.string()).optional(),
});
export type ExecConfig = z.infer<typeof ExecConfigSchema>;

/**
 * AI provider configuration
 */
export const AIProviderConfigSchema = z.object({
  provider: z.enum(["anthropic", "openai", "openrouter"]).default("anthropic"),
  apiKey: z.string().optional(),
  model: z.string().optional(),
});
export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

/**
 * Main opsbot configuration schema
 */
export const OpsbotConfigSchema = z.object({
  // Schema version for migrations
  $schema: z.string().optional(),
  version: z.literal(1).default(1),

  // Environment type
  environment: EnvironmentTypeSchema.default("local"),

  // Safety configuration
  safety: SafetyConfigSchema.default({}),

  // AI provider
  ai: AIProviderConfigSchema.optional(),

  // Skills configuration
  skills: z
    .object({
      // Allow all bundled skills
      allowBundled: z.array(z.string()).default(["docker", "kubernetes", "terraform", "github"]),

      // Skill-specific config
      entries: z.record(z.string(), SkillEntrySchema).optional(),
    })
    .default({}),

  // Channel configuration
  channels: z
    .object({
      tui: ChannelConfigSchema.default({ enabled: true }),
      telegram: ChannelConfigSchema.default({ enabled: false }),
      slack: ChannelConfigSchema.default({ enabled: false }),
      teams: ChannelConfigSchema.default({ enabled: false }),
    })
    .default({}),

  // Execution security
  exec: ExecConfigSchema.default({}),

  // Workspace directory
  workspace: z.string().optional(),

  // Logging configuration
  logging: z
    .object({
      level: z.enum(["debug", "info", "warn", "error"]).default("info"),
      redactSecrets: z.boolean().default(true),
    })
    .default({}),
});
export type OpsbotConfig = z.infer<typeof OpsbotConfigSchema>;

/**
 * Validate and parse config with defaults
 */
export function parseConfig(input: unknown): OpsbotConfig {
  return OpsbotConfigSchema.parse(input);
}

/**
 * Get default configuration
 */
export function getDefaultConfig(): OpsbotConfig {
  return OpsbotConfigSchema.parse({});
}
