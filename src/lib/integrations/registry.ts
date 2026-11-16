/**
 * The platform's dependencies and integrations: what each one is, which
 * fields it has, and which providers can fill it. The records themselves
 * (values, status) live in the database (supabase/migrations/0010); this file
 * is the shape the admin panel and future adapters share.
 *
 * Adding a provider later means: add it to `providers` here, write an adapter
 * (see adapter.ts) and register it. Nothing else changes.
 */

export type IntegrationStatus = "not_configured" | "demo" | "configured" | "connected" | "error";

export const statusLabel: Record<IntegrationStatus, string> = {
  not_configured: "Not Configured",
  demo: "Demo",
  configured: "Configured",
  connected: "Connected",
  error: "Error",
};

export const statusMeaning: Record<IntegrationStatus, string> = {
  not_configured: "Nothing has been set up.",
  demo: "Demo values only. No real provider connection has been established.",
  configured: "Real settings are saved but the connection has not been tested.",
  connected: "A real connection test passed.",
  error: "The last real connection test failed.",
};

export type FieldType = "text" | "url" | "number" | "select" | "boolean";

export type ConfigField = {
  key: string;
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
  help?: string;
  min?: number;
  max?: number;
  /** URL schemes accepted for `url` fields; http(s) by default. */
  schemes?: string[];
};

/** A credential. Stored encrypted and write-only; the panel shows only its last characters. */
export type SecretField = { key: string; label: string; help?: string };

export type IntegrationCategory =
  | "research"
  | "script"
  | "voice"
  | "video"
  | "rendering"
  | "storage"
  | "jobs"
  | "publishing"
  | "payments";

export type IntegrationDefinition = {
  key: string;
  name: string;
  category: IntegrationCategory;
  kind: "module" | "provider" | "infrastructure";
  /** The provider or infrastructure this module needs. */
  dependsOn?: string;
  summary: string;
  providers?: { value: string; label: string }[];
  fields: ConfigField[];
  secrets: SecretField[];
};

export const categoryLabel: Record<IntegrationCategory, string> = {
  research: "Research",
  script: "Script",
  voice: "Voice",
  video: "Video",
  rendering: "Rendering",
  storage: "Storage",
  jobs: "Background jobs",
  publishing: "Publishing",
  payments: "Payments",
};

const text = (key: string, label: string, help?: string): ConfigField => ({
  key,
  label,
  type: "text",
  help,
});
const url = (key: string, label: string, help?: string, schemes?: string[]): ConfigField => ({
  key,
  label,
  type: "url",
  help,
  schemes,
});
const num = (key: string, label: string, min: number, max: number, help?: string): ConfigField => ({
  key,
  label,
  type: "number",
  min,
  max,
  help,
});
const bool = (key: string, label: string, help?: string): ConfigField => ({
  key,
  label,
  type: "boolean",
  help,
});
const pick = (
  key: string,
  label: string,
  values: [string, string][],
  help?: string,
): ConfigField => ({
  key,
  label,
  type: "select",
  help,
  options: values.map(([value, l]) => ({ value, label: l })),
});
const opts = (...values: [string, string][]) => values.map(([value, label]) => ({ value, label }));
const apiKey: SecretField = { key: "api_key", label: "API key" };

export const integrations: IntegrationDefinition[] = [
  {
    key: "ai_research",
    name: "AI Research",
    category: "research",
    kind: "module",
    dependsOn: "research_provider",
    summary: "Topic briefs with cited sources for the Research stage.",
    fields: [
      pick("default_depth", "Default depth", [
        ["quick", "Quick"],
        ["standard", "Standard"],
        ["deep", "Deep"],
      ]),
      bool("require_sources", "Require a source for every claim"),
      num("max_brief_words", "Maximum brief length (words)", 100, 5000),
    ],
    secrets: [],
  },
  {
    key: "research_provider",
    name: "Research Provider API",
    category: "research",
    kind: "provider",
    summary: "The search and research service that AI Research calls.",
    providers: opts(
      ["demo_research", "Demo provider (not real)"],
      ["tavily", "Tavily"],
      ["perplexity", "Perplexity"],
      ["exa", "Exa"],
      ["custom", "Custom"],
    ),
    fields: [
      url("endpoint", "Endpoint"),
      num("max_sources", "Maximum sources per brief", 1, 50),
      text("region", "Region"),
    ],
    secrets: [apiKey],
  },
  {
    key: "script_generation",
    name: "Script Generation",
    category: "script",
    kind: "module",
    dependsOn: "llm_api",
    summary: "Scene-by-scene narration scripts for the Script stage.",
    fields: [
      text("model", "Model"),
      text("default_language", "Default language (code)"),
      num("target_minutes", "Target length (minutes)", 1, 60),
      num("scenes_per_minute", "Scenes per minute", 1, 20),
    ],
    secrets: [],
  },
  {
    key: "llm_api",
    name: "LLM API",
    category: "script",
    kind: "provider",
    summary: "The language model service behind scripts, research summaries and metadata.",
    providers: opts(
      ["demo_llm", "Demo provider (not real)"],
      ["anthropic", "Anthropic Claude"],
      ["openai", "OpenAI"],
      ["google", "Google Gemini"],
      ["custom", "Custom"],
    ),
    fields: [
      url("endpoint", "Endpoint"),
      text("model", "Model"),
      num("max_output_tokens", "Maximum output tokens", 100, 200000),
    ],
    secrets: [apiKey],
  },
  {
    key: "voice_generation",
    name: "Voice Generation",
    category: "voice",
    kind: "module",
    dependsOn: "voice_provider",
    summary: "Voiceover audio and subtitles for the Voice stage.",
    fields: [
      text("default_voice", "Default voice"),
      text("default_language", "Default language (code)"),
      num("stability", "Stability", 0, 1),
      bool("subtitles", "Generate subtitles"),
    ],
    secrets: [],
  },
  {
    key: "voice_provider",
    name: "Voice Provider API",
    category: "voice",
    kind: "provider",
    summary: "The text-to-speech service that Voice Generation calls.",
    providers: opts(
      ["demo_voice", "Demo provider (not real)"],
      ["elevenlabs", "ElevenLabs"],
      ["custom", "Custom"],
    ),
    fields: [
      url("endpoint", "Endpoint"),
      text("model", "Model"),
      text("output_format", "Output format"),
    ],
    secrets: [apiKey],
  },
  {
    key: "video_generation",
    name: "Video Generation",
    category: "video",
    kind: "module",
    dependsOn: "video_provider",
    summary: "Scene visuals and motion for the Scene stage.",
    fields: [
      pick("aspect_ratio", "Aspect ratio", [["16:9", "16:9"]]),
      pick("resolution", "Resolution", [
        ["720p", "720p"],
        ["1080p", "1080p"],
      ]),
      bool("use_owner_images", "Use the owner's own images first"),
    ],
    secrets: [],
  },
  {
    key: "video_provider",
    name: "Video Provider API",
    category: "video",
    kind: "provider",
    summary: "The video or image-motion service that Video Generation calls.",
    providers: opts(
      ["demo_video", "Demo provider (not real)"],
      ["runway", "Runway"],
      ["luma", "Luma"],
      ["custom", "Custom"],
    ),
    fields: [
      url("endpoint", "Endpoint"),
      text("model", "Model"),
      num("max_seconds", "Maximum clip length (seconds)", 1, 120),
    ],
    secrets: [apiKey],
  },
  {
    key: "rendering",
    name: "Rendering",
    category: "rendering",
    kind: "module",
    dependsOn: "remotion_worker",
    summary: "Final video assembly and export.",
    fields: [
      pick("engine", "Rendering engine", [["remotion", "Remotion"]]),
      pick("codec", "Codec", [
        ["h264", "H.264"],
        ["h265", "H.265"],
      ]),
      num("fps", "Frames per second", 12, 60),
      pick("resolution", "Resolution", [
        ["1280x720", "1280 × 720"],
        ["1920x1080", "1920 × 1080"],
      ]),
    ],
    secrets: [],
  },
  {
    key: "remotion_worker",
    name: "Remotion Worker Hosting",
    category: "rendering",
    kind: "infrastructure",
    summary: "The Node.js worker that renders video with Remotion.",
    providers: opts(["self_hosted", "Self-hosted worker"], ["remotion_lambda", "Remotion Lambda"]),
    fields: [
      url("worker_url", "Worker URL"),
      num("concurrency", "Renders at once", 1, 16),
      num("timeout_seconds", "Render timeout (seconds)", 60, 7200),
    ],
    secrets: [{ key: "worker_token", label: "Worker access token" }],
  },
  {
    key: "file_storage",
    name: "File Storage",
    category: "storage",
    kind: "module",
    dependsOn: "object_storage",
    summary: "Upload rules and retention for media files.",
    fields: [
      num("max_upload_mb", "Maximum upload size (MB)", 1, 5000),
      num("retention_days", "Keep intermediate files for (days)", 1, 3650),
      text("allowed_types", "Allowed file types", "Comma-separated media types."),
    ],
    secrets: [],
  },
  {
    key: "object_storage",
    name: "Object Storage",
    category: "storage",
    kind: "infrastructure",
    summary: "The bucket that holds images, audio and video.",
    providers: opts(
      ["s3_compatible", "S3-compatible"],
      ["cloudflare_r2", "Cloudflare R2"],
      ["supabase_storage", "Supabase Storage"],
      ["aws_s3", "Amazon S3"],
    ),
    fields: [
      text("bucket", "Bucket"),
      text("region", "Region"),
      url("endpoint", "Endpoint"),
      url("public_base_url", "Public base URL", "Leave empty for private buckets."),
    ],
    secrets: [
      { key: "access_key_id", label: "Access key ID" },
      { key: "secret_access_key", label: "Secret access key" },
    ],
  },
  {
    key: "background_jobs",
    name: "Background Jobs",
    category: "jobs",
    kind: "module",
    dependsOn: "redis_celery",
    summary: "Retry and timeout rules for long-running work.",
    fields: [
      num("max_retries", "Maximum retries", 0, 10),
      num("retry_backoff_seconds", "Wait between retries (seconds)", 1, 3600),
      num("job_timeout_seconds", "Job timeout (seconds)", 10, 7200),
    ],
    secrets: [],
  },
  {
    key: "redis_celery",
    name: "Redis / Celery",
    category: "jobs",
    kind: "infrastructure",
    summary: "The queue and workers that run background jobs.",
    providers: opts(["redis", "Redis"], ["upstash", "Upstash Redis"]),
    fields: [
      url("redis_url", "Redis URL", "Without the password; the password is a credential below.", [
        "redis:",
        "rediss:",
      ]),
      text("default_queue", "Default queue"),
      num("worker_concurrency", "Worker concurrency", 1, 64),
    ],
    secrets: [{ key: "redis_password", label: "Redis password" }],
  },
  {
    key: "youtube_publishing",
    name: "YouTube Publishing",
    category: "publishing",
    kind: "module",
    dependsOn: "google_oauth",
    summary: "Uploading approved videos to the owner's channel.",
    fields: [
      pick("default_privacy", "Default privacy", [
        ["private", "Private"],
        ["unlisted", "Unlisted"],
      ]),
      bool(
        "require_owner_approval",
        "Require the owner's approval before upload",
        "Always on; shown for clarity.",
      ),
      text("category_id", "YouTube category ID"),
    ],
    secrets: [],
  },
  {
    key: "google_oauth",
    name: "Google OAuth",
    category: "publishing",
    kind: "provider",
    summary: "The Google sign-in that lets an owner connect their own YouTube channel.",
    providers: opts(["google", "Google"]),
    fields: [
      text("client_id", "Client ID"),
      url("redirect_uri", "Redirect URI"),
      text("scopes", "Scopes"),
    ],
    secrets: [{ key: "client_secret", label: "Client secret" }],
  },
  {
    key: "payments",
    name: "Payments",
    category: "payments",
    kind: "module",
    dependsOn: "payment_provider",
    summary: "Currency and billing rules.",
    fields: [
      text("currency", "Currency (ISO code)"),
      pick("billing_interval", "Billing interval", [
        ["monthly", "Monthly"],
        ["yearly", "Yearly"],
      ]),
      bool("tax_inclusive", "Prices include tax"),
    ],
    secrets: [],
  },
  {
    key: "payment_provider",
    name: "Payment Provider",
    category: "payments",
    kind: "provider",
    summary: "The payment service for subscriptions and credits.",
    providers: opts(
      ["demo_payments", "Demo provider (not real)"],
      ["stripe", "Stripe"],
      ["paddle", "Paddle"],
      ["lemonsqueezy", "Lemon Squeezy"],
      ["sslcommerz", "SSLCommerz"],
    ),
    fields: [
      url("endpoint", "Endpoint"),
      url("webhook_url", "Webhook URL"),
      pick("mode", "Mode", [
        ["test", "Test"],
        ["live", "Live"],
      ]),
    ],
    secrets: [
      { key: "secret_key", label: "Secret API key" },
      { key: "webhook_secret", label: "Webhook signing secret" },
    ],
  },
];

export const integrationByKey = new Map(integrations.map((i) => [i.key, i]));

/** How each AutoFlow stage depends on these integrations. */
export const pipelineDependencies: { stage: string; needs: string[] }[] = [
  { stage: "Research", needs: ["ai_research", "research_provider"] },
  { stage: "Script", needs: ["script_generation", "llm_api"] },
  { stage: "Voice", needs: ["voice_generation", "voice_provider"] },
  { stage: "Scene / Video Generation", needs: ["video_generation", "video_provider"] },
  { stage: "Video Assembly", needs: ["remotion_worker"] },
  { stage: "Rendering", needs: ["rendering", "remotion_worker"] },
  { stage: "Storage", needs: ["file_storage", "object_storage"] },
  { stage: "Background Processing", needs: ["background_jobs", "redis_celery"] },
  { stage: "YouTube Publishing", needs: ["youtube_publishing", "google_oauth"] },
  { stage: "Payment / Subscription", needs: ["payments", "payment_provider"] },
];

/**
 * What the pipeline can honestly claim for a stage.
 *   planned      nothing known about its dependencies
 *   demo         demo values only
 *   configured   real settings saved, untested
 *   connected    every dependency passed a real connection test
 *   operational  connected AND the stage itself is built and tested
 */
export type PipelineState = "planned" | "demo" | "configured" | "connected" | "operational";

export const pipelineStateLabel: Record<PipelineState, string> = {
  planned: "Planned",
  demo: "Demo",
  configured: "Configured",
  connected: "Connected",
  operational: "Operational",
};

/** No AutoFlow stage is built yet. A stage is added here only after it works end to end. */
export const operationalStages = new Set<string>();

export function pipelineState(
  stage: string,
  needs: string[],
  statuses: Map<string, IntegrationStatus> | null,
): PipelineState {
  if (!statuses) return "planned";
  const found = needs.map((k) => statuses.get(k));
  if (found.some((s) => !s || s === "not_configured" || s === "error")) return "planned";
  if (found.some((s) => s === "demo")) return "demo";
  if (found.some((s) => s === "configured")) return "configured";
  return operationalStages.has(stage) ? "operational" : "connected";
}
