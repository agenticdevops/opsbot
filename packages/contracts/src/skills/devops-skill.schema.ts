import { z } from "zod";

/**
 * Binary requirement for a skill
 */
export const BinaryRequirementSchema = z.object({
  name: z.string(),
  versionCmd: z.string().optional(), // Command to check version
  minVersion: z.string().optional(),
});
export type BinaryRequirement = z.infer<typeof BinaryRequirementSchema>;

/**
 * Installation method for a skill dependency
 */
export const InstallMethodSchema = z.object({
  id: z.string(),
  kind: z.enum(["brew", "apt", "npm", "pip", "go", "curl", "manual"]),
  formula: z.string().optional(), // For brew
  package: z.string().optional(), // For apt/npm/pip
  url: z.string().optional(), // For curl/manual
  instructions: z.string().optional(), // Human-readable instructions
  bins: z.array(z.string()).optional(), // Binaries provided
});
export type InstallMethod = z.infer<typeof InstallMethodSchema>;

/**
 * Skill requirements
 */
export const SkillRequirementsSchema = z.object({
  bins: z.array(z.string()).optional(), // Required binaries
  anyBins: z.array(z.string()).optional(), // At least one required
  env: z.array(z.string()).optional(), // Required env vars
  config: z.array(z.string()).optional(), // Required config paths
});
export type SkillRequirements = z.infer<typeof SkillRequirementsSchema>;

/**
 * Skill metadata (from YAML frontmatter)
 */
export const SkillMetadataSchema = z.object({
  emoji: z.string().optional(),
  os: z.array(z.enum(["darwin", "linux", "win32"])).optional(),
  requires: SkillRequirementsSchema.optional(),
  install: z.array(InstallMethodSchema).optional(),
  tags: z.array(z.string()).optional(),
});
export type SkillMetadata = z.infer<typeof SkillMetadataSchema>;

/**
 * Full skill definition (parsed from skill.md)
 */
export const SkillDefinitionSchema = z.object({
  name: z.string().regex(/^[a-z0-9-]+$/, "Skill name must be lowercase with hyphens"),
  description: z.string(),
  metadata: SkillMetadataSchema.optional(),
  content: z.string(), // Markdown body
  path: z.string(), // File path
});
export type SkillDefinition = z.infer<typeof SkillDefinitionSchema>;

/**
 * Skill eligibility check result
 */
export const SkillEligibilitySchema = z.object({
  skillName: z.string(),
  eligible: z.boolean(),
  missingBins: z.array(z.string()).optional(),
  missingEnv: z.array(z.string()).optional(),
  installInstructions: z.array(InstallMethodSchema).optional(),
});
export type SkillEligibility = z.infer<typeof SkillEligibilitySchema>;
