/**
 * Content model shared by the public site and (later) the admin CMS.
 *
 * These types mirror the planned database tables in the master brief
 * (tools, categories, guides, guide_steps, tool_settings, prompts,
 * workflows, workflow_steps, resources). In Phase 2 they are filled from
 * clearly labelled sample data; in Phase 3 the same shapes come from
 * Supabase, so pages and components do not need to change.
 *
 * Category model: a tool can belong to several categories (a join table in
 * the database). The first slug in `categorySlugs` is the primary category,
 * used for breadcrumbs.
 */

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type PricingModel = "free" | "freemium" | "paid" | "open-source";

/** How much of a page's factual content has been checked against sources. */
export type VerificationStatus = "verified" | "needs-review" | "unverified";

export type ContentStatus = "draft" | "in-review" | "published" | "needs-update" | "archived";

export type Source = {
  title: string;
  url: string;
  /** ISO date the source was last checked. */
  checkedAt?: string;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  /** Key into the icon map in components/content/category-icon.tsx. */
  icon: string;
};

export type ToolSetting = {
  /** Exact name as shown in the product. */
  name: string;
  explanation: string;
  options?: string;
  whenToAdjust?: string;
  tradeoffs?: string;
  verification: VerificationStatus;
  sourceUrl?: string;
};

export type PromptTemplate = {
  slug: string;
  title: string;
  task: string;
  text: string;
  /** Placeholder names that appear in `text` as [name]. */
  placeholders: string[];
  expectedOutput: string;
  caveats?: string;
  tested: boolean;
};

export type TroubleshootingEntry = {
  slug: string;
  problem: string;
  causes: string[];
  fixes: string[];
  whenToContactSupport?: string;
};

export type Tool = {
  slug: string;
  name: string;
  officialUrl: string;
  docsUrl?: string;
  shortDescription: string;
  overview: string;
  categorySlugs: string[];
  tags: string[];
  useCases: string[];
  audience: string[];
  skillLevel: SkillLevel;
  /** Only set when verified; undefined renders as "Not verified yet". */
  pricingModel?: PricingModel;
  freePlan?: string;
  /** true / false when verified; undefined when unknown. */
  apiAvailable?: boolean;
  apiNotes?: string;
  inputs: string[];
  outputs: string[];
  features: string[];
  limitations: string[];
  setupRequirements: string[];
  quickStart: string[];
  firstExample?: { prompt: string; expectedResult: string };
  settings: ToolSetting[];
  prompts: PromptTemplate[];
  troubleshooting: TroubleshootingEntry[];
  sources: Source[];
  verification: VerificationStatus;
  status: ContentStatus;
  featured: boolean;
  lastVerifiedAt?: string;
  updatedAt: string;
  /** Demo record. Always shown with a "Sample" label in the UI. */
  isSample: boolean;
};

export type GuideStep = {
  title: string;
  body: string;
  /** Optional prompt or configuration to copy for this step. */
  example?: string;
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  skillLevel: SkillLevel;
  estimatedMinutes: number;
  prerequisites: string[];
  toolSlugs: string[];
  steps: GuideStep[];
  expectedOutcome: string;
  commonMistakes: string[];
  troubleshooting: TroubleshootingEntry[];
  sources: Source[];
  verification: VerificationStatus;
  status: ContentStatus;
  featured: boolean;
  lastVerifiedAt?: string;
  updatedAt: string;
  isSample: boolean;
};

export type WorkflowStep = {
  title: string;
  instructions: string;
  input: string;
  output: string;
  toolSlug?: string;
  guideSlug?: string;
};

export type Workflow = {
  slug: string;
  title: string;
  summary: string;
  skillLevel: SkillLevel;
  estimatedMinutes: number;
  outcome: string;
  steps: WorkflowStep[];
  verification: VerificationStatus;
  status: ContentStatus;
  featured: boolean;
  lastVerifiedAt?: string;
  updatedAt: string;
  isSample: boolean;
};
