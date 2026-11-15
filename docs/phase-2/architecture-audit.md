# Phase 2 Step 1 — Architecture Audit

15 Nov 2026. Branch `feature/phase-1-platform-foundation` at `962f93a`, in sync with GitHub, clean
working tree. Everything here was read from the repository, the Supabase project and the live
site on that date. This step changes no application code, no database object and no routing.

## 1. Snapshot

| Area              | State                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Live site         | `https://aikitfinder.vercel.app`, HTTP 200, runs this branch's code                           |
| Accounts on live  | **On.** `/account` now shows the log-in prompt, so the Supabase variables are set in Vercel   |
| Supabase          | Project `aikitfinder`, Sydney (ap-southeast-2), PostgreSQL 17, migrations 0001–0007           |
| Users             | 1 confirmed account with 1 profile and 2 workspaces. Not touched by any test                  |
| Catalog data      | 0 tools, 0 categories in the database. The Directory shows fictional sample records from code |
| AutoFlow data     | 0 projects                                                                                    |
| Python backend    | Does not exist                                                                                |
| Admin panel       | Does not exist. No role or permission tables                                                  |
| Workers, queue    | Do not exist                                                                                  |
| Email (SMTP)      | Not configured                                                                                |
| CI, unit tests    | None. Three QA scripts in `scripts/qa/`                                                       |
| Deployment config | No `vercel.json`, no Dockerfile, no GitHub Actions. Vercel builds from Git with defaults      |

## 2. Frontend (existing)

Next.js 16.4.6 (App Router, Cache Components, partial prefetching, Turbopack), React 19.3,
TypeScript strict, Tailwind CSS v4, Radix Dialog, lucide-react, GSAP (Directory home only), pnpm.

| Route group   | Routes                                                                                                                                                                                                                                     | Chrome                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| `(parent)`    | `/`, `/about`, `/contact`, `/privacy`, `/terms`, `/editorial-policy`, `/account`, `/account/reset-password`                                                                                                                                | Parent header and footer               |
| `(directory)` | `/directory`, `/tools`, `/tools/[slug]`, `/categories`, `/categories/[slug]`, `/guides`, `/guides/[slug]`, `/prompts`, `/prompts/[slug]`, `/workflows`, `/workflows/[slug]`, `/compare`, `/search`, `/deals`, `/deals/[slug]`, `/voicehub` | Directory header, footer, compare tray |
| `(autoflow)`  | `/autoflow`, `/autoflow/app`, `/autoflow/app/projects`, `/autoflow/app/projects/[projectId]`                                                                                                                                               | AutoFlow header or workspace shell     |
| root          | `/auth/confirm`, `/auth/session`, `/api/voicehub/{health,tts,voices}`, `sitemap.xml`, `robots.txt`                                                                                                                                         | —                                      |

One root layout; product identity comes from token overrides on `<html data-product>`. Themes are
stored per product.

| Component area        | Files | Notes                                                          |
| --------------------- | ----- | -------------------------------------------------------------- |
| `components/ui`       | 4     | Button, Badge, Input, Sheet                                    |
| `components/parent`   | 19    | Approved homepage, hero animation engine                       |
| `components/content`  | 16    | Cards, badges, pricing, prompts, sources                       |
| `components/compare`  | 5     | Compare store (session storage), tray, table                   |
| `components/tools`    | 3     | Filters, active filters, sort                                  |
| `components/autoflow` | 9     | Landing pieces, workspace shell, stage rail, project card      |
| `components/auth`     | 6     | Dialog, provider, account controls, password field, reset form |

## 3. Backend inside Next.js (existing)

| Function                       | Where                           | What it does                                                                      |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------------------- |
| Sign up, log in, log out       | `src/lib/auth/actions.ts`       | Server Actions on Supabase Auth                                                   |
| Request reset, update password | `src/lib/auth/actions.ts`       | Server Actions                                                                    |
| Email link callback            | `src/app/auth/confirm/route.ts` | Verifies one-time token, starts session                                           |
| Session summary                | `src/app/auth/session/route.ts` | Email and display name for headers                                                |
| Session renewal                | `src/proxy.ts`                  | Refreshes expired tokens                                                          |
| Current user                   | `src/lib/auth/session.ts`       | Verifies the token signature (ES256, project JWKS)                                |
| Workspace access               | `src/lib/autoflow/access.ts`    | Signed out → sign-in prompt                                                       |
| Projects (read only)           | `src/lib/autoflow/projects.ts`  | Supabase as the user; row level security                                          |
| Account page data              | `(parent)/account/page.tsx`     | Reads own workspaces                                                              |
| Directory data                 | `src/lib/content/repository.ts` | 30 read functions over in-code sample data (1,839 lines)                          |
| VoiceHub TTS (legacy)          | `src/app/api/voicehub/*`        | ElevenLabs proxy; generation off unless an env flag is set; in-memory demo ledger |

The app holds no secret key. It uses the Supabase URL and publishable key only.

## 4. Authentication and protection (existing)

| Item               | State                                                               |
| ------------------ | ------------------------------------------------------------------- |
| Sessions           | HttpOnly, Secure, SameSite=Lax cookies; no token in browser storage |
| Protected today    | `/autoflow/app/*` only                                              |
| Public today       | Homepage, the whole Directory, `/autoflow` landing, company pages   |
| `/account`         | Shows a log-in prompt when signed out                               |
| Password reset     | Built; 15-minute reset window                                       |
| Email confirmation | Required; callback built                                            |
| Roles              | None. Every account is an ordinary user                             |

## 5. Database (existing)

20 tables, all with row level security, 23 policies, 13 enums.

| Group    | Tables                                                                                                                          | Access                                           |
| -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Catalog  | `categories`, `tools`, `tool_categories`, `tool_alternatives`, `tool_sources`, `tool_pricing`, `pricing_plans`                  | Public read of published rows; no writes         |
| Content  | `prompts`, `prompt_categories`, `prompt_tools`, `prompt_variables`, `workflows`, `workflow_steps`, `workflow_step_alternatives` | Public read of published rows; no writes         |
| Deals    | `deals`, `deal_sources`                                                                                                         | Public read (column-limited); unlinked in the UI |
| Accounts | `profiles`, `workspaces`                                                                                                        | Owner only; created by trigger                   |
| AutoFlow | `autoflow_projects`, `autoflow_project_stages`                                                                                  | Owner only                                       |

Not in the database: guides, favorites, collections, roles, permissions, audit logs, jobs,
assets, usage, credits, subscriptions, notifications, provider settings.

## 6. Directory (existing)

Working on sample data: home, tool list with filters (category, level, pricing model, API, free
plan, pay-as-you-go, budget) and sorting, tool detail, categories with one level of
subcategories, guides, prompts with a variable playground, workflows, comparison of up to 4 tools
(kept in session storage), search with tabs, sources list, sample and verification badges.

Missing: real data, search suggestions, favorites, collections, recently viewed, admin editing.
The visual style is the pre-Phase 0A light theme (blue `#2563eb`, teal `#0f766e`), not the
approved deep teal-navy identity. There is no separate Directory design specification document;
the approved identity is the board in `docs/phase-0a/visual-proposal/`.

## 7. AutoFlow (existing)

Landing page, sign-in gate, workspace shell, overview, project list, project detail, six-stage
structure in code and database. "New project" is disabled. No stage runs. No AI provider is
connected. The database stages are Research, Script, Voice, Video Assembly, Thumbnail/Metadata,
Review.

## 8. Tests and scripts (existing)

| Script                                     | Scope                                                            | Result today         |
| ------------------------------------------ | ---------------------------------------------------------------- | -------------------- |
| `pnpm lint` / `typecheck` / `format:check` | Code quality                                                     | Pass                 |
| `pnpm build`                               | Production build                                                 | Pass, 99 pages       |
| `scripts/qa/site-check.cjs`                | 25 routes × 11 widths, hero animation, navigation                | 364 passed, 0 failed |
| `scripts/qa/auth-check.cjs`                | Auth, sessions, reset, isolation (real project, throwaway users) | 83 passed, 0 failed  |
| `scripts/qa/validate-migrations.sh`        | Migrations on a throwaway PostgreSQL, security checks            | Pass                 |

## 9. Findings that affect Phase 2

| #   | Finding                                                                                                                                                        | Consequence                                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | The login-for-everything requirement reverses an earlier owner decision (public Directory browsing) and the approved FAQ wording "does not require an account" | Needs explicit confirmation; homepage FAQ and status line must change with it                                                                                 |
| 2   | A login-only Directory cannot be indexed by search engines                                                                                                     | Discovery traffic would come only from the homepage                                                                                                           |
| 3   | Tests run against the production database                                                                                                                      | A separate staging Supabase project is advisable before Phase 2 writes begin (the rule against a second project applies to production; this needs a decision) |
| 4   | No SMTP                                                                                                                                                        | Sign-up and reset emails are unreliable                                                                                                                       |
| 5   | Catalog tables assume public read                                                                                                                              | Policies must change if the Directory becomes login-only                                                                                                      |
| 6   | The six database stages do not match the larger studio list requested for AutoFlow                                                                             | Additive enum values and new tables; no destructive change                                                                                                    |
| 7   | Legacy VoiceHub page still documents an in-memory demo ledger                                                                                                  | Replace through the Voice Studio migration, not patch                                                                                                         |
| 8   | README and older checklists describe the pre-Phase 1 structure                                                                                                 | Refresh when convenient                                                                                                                                       |
