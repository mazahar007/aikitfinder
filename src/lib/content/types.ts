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

/** Where a tool can be used. Only set when verified from the official site. */
export type Platform = "web" | "desktop" | "ios" | "android" | "browser-extension" | "api";

/** How often a plan is billed. "usage" means pay as you go. */
export type BillingInterval = "month" | "year" | "one-time" | "usage";

export type PricingPlan = {
  name: string;
  /**
   * Price in the plan's currency. 0 means free. Undefined means the provider
   * does not state a price (for example "contact sales").
   */
  price?: number;
  /** ISO 4217 code such as "USD". Required whenever `price` is above 0. */
  currency?: string;
  interval?: BillingInterval;
  /** Qualifiers as the provider states them, e.g. "per user" or "billed annually". */
  priceNote?: string;
  /** Usage or credit limits, only if officially documented. */
  usageLimits?: string;
  contactSales?: boolean;
};

/**
 * Plan-level pricing for one tool. Shown to visitors only while it is
 * verified and recently checked (see lib/content/pricing.ts).
 */
export type ToolPricing = {
  plans: PricingPlan[];
  /** The provider's own pricing page: the source of every figure above. */
  pricingUrl: string;
  apiPricingUrl?: string;
  /** ISO date the pricing page was last checked. */
  checkedAt: string;
  verification: VerificationStatus;
};

export type Category = {
  slug: string;
  name: string;
  description: string;
  /** Key into the icon map in components/content/category-icon.tsx. */
  icon: string;
  /**
   * Set for a subcategory: the slug of its top-level parent. Subcategories are
   * one level deep. A tool in a subcategory lists both the parent and the
   * subcategory in `categorySlugs`, so parent pages and counts include it.
   */
  parentSlug?: string;
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
  /** Free trial details (length, card required) when the official site states them. */
  freeTrial?: string;
  /** Plan-by-plan pricing with its own source and check date. */
  pricing?: ToolPricing;
  /** Short pricing summary with its own source and check date. */
  pricingNote?: { text: string; sourceUrl?: string; checkedAt?: string };
  /** Platforms the tool runs on, when verified. Undefined means unknown. */
  platforms?: Platform[];
  /** Slugs of similar tools a visitor might choose instead. Only set from reliable knowledge. */
  alternativeSlugs?: string[];
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

/** What kind of offer it is. */
export type DealType = "credits" | "discount" | "coupon" | "free-trial";

/** Who an offer is aimed at. Never imply every visitor qualifies. */
export type DealEligibility =
  "anyone" | "students" | "educators" | "developers" | "startups" | "nonprofits";

/**
 * What the visitor sees. Derived from dates and verification, never typed in
 * by hand (see lib/content/deal-status.ts).
 */
export type DealStatus = "active" | "upcoming" | "expired" | "needs-verification";

export type Deal = {
  slug: string;
  title: string;
  /** Provider name as shown to visitors. */
  provider: string;
  /** Set when the provider has a page in the directory. */
  toolSlug?: string;
  type: DealType;
  summary: string;
  /** Credit amount or discount, only if the provider states it explicitly. */
  amount?: string;
  couponCode?: string;
  eligibility: DealEligibility[];
  eligibilityNotes: string;
  /** Region restrictions, if any. */
  regions?: string;
  /** ISO dates. Only set when an official source gives them. */
  startsOn?: string;
  endsOn?: string;
  termsUrl: string;
  claimUrl: string;
  claimSteps: string[];
  sources: Source[];
  /** True when the claim link earns us a commission. Must be disclosed. */
  affiliate: boolean;
  verification: VerificationStatus;
  /** Editorial publishing state (draft, published, ...). */
  status: ContentStatus;
  lastVerifiedAt?: string;
  updatedAt: string;
  isSample: boolean;
};

/** A blank in a prompt, written as [name] in the prompt text. */
export type PromptVariable = {
  name: string;
  description: string;
  /** An example value, shown as the input's placeholder. */
  example?: string;
};

/**
 * A prompt in the library. Prompts written for a specific tool page are also
 * listed here (see getPrompts), so there is one place to search them.
 */
export type Prompt = {
  slug: string;
  title: string;
  /** What the prompt helps you do, in one sentence. */
  useCase: string;
  categorySlugs: string[];
  /** Free tags for task, content type and role, e.g. "summary", "email", "student". */
  tags: string[];
  skillLevel: SkillLevel;
  text: string;
  variables: PromptVariable[];
  /** Steps for using it well. */
  instructions: string[];
  expectedOutput: string;
  /** Illustration only: shown with a label saying results vary. */
  exampleOutput?: string;
  caveats?: string;
  /** Tools it is known to suit. Only set when we have checked. */
  toolSlugs: string[];
  author: string;
  /** Where the text comes from, e.g. "Original text written for AIKitFinder". */
  originNote: string;
  /** True only if someone actually ran it and checked the result. */
  tested: boolean;
  status: ContentStatus;
  lastReviewedAt?: string;
  updatedAt: string;
  isSample: boolean;
};
