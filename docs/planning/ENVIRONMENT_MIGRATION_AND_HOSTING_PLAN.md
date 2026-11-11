# Environment Variables, Database Migration Plan and Hosting Options

Preparation for Phase 1, requested with the Phase 0 approval. Planning only: no infrastructure was
created, no database was touched, and no secret values appear here. Date: 11 Nov 2026.

Unconfirmed by the owner, and therefore not assumed: whether a Supabase project exists, its
migration history, the production domain, and whether an ElevenLabs key is set anywhere.

## 1. Approved target architecture

| Layer         | Choice                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------- |
| Frontend      | Existing Next.js / React application, on Vercel                                               |
| Backend       | Python FastAPI: orchestration, AI operations, product APIs, job coordination                  |
| Data and auth | Supabase PostgreSQL, Supabase Auth, row level security, Realtime where needed                 |
| Workers       | Dedicated worker; Remotion and FFmpeg in a Node/container environment, orchestrated by Python |
| Media         | Supabase Storage first, or Cloudflare R2                                                      |
| Queue         | Supabase Queues or Redis                                                                      |

One database and one authentication system. Directory and AutoFlow data stay separated by schema
and policy.

## 2. Environment variables

Rules: placeholders only in `.env.example`; real values only in each host's secret store;
anything prefixed `NEXT_PUBLIC_` is visible to every visitor; only configure what the current
phase uses.

### In use today

| Variable                     | Where           | Secret  | Purpose                                            |
| ---------------------------- | --------------- | ------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`       | Frontend        | No      | Canonical URL                                      |
| `NEXT_PUBLIC_SITE_INDEXABLE` | Frontend        | No      | Allow search indexing; keep `false` until launch   |
| `ELEVENLABS_API_KEY`         | Frontend server | **Yes** | Legacy VoiceHub; moves to the backend on migration |
| `VOICEHUB_PUBLIC_GENERATION` | Frontend server | No      | Leave unset on public deployments                  |

### Phase 1 — foundation

| Variable                          | Where               | Secret                                                   | Purpose                                            |
| --------------------------------- | ------------------- | -------------------------------------------------------- | -------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`        | Frontend            | No                                                       | Supabase project URL                               |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`   | Frontend            | No (public by design; safe only with row level security) | Browser access                                     |
| `NEXT_PUBLIC_API_BASE_URL`        | Frontend            | No                                                       | Address of the FastAPI service                     |
| `SUPABASE_URL`                    | Backend, worker     | No                                                       | Same project                                       |
| `SUPABASE_SERVICE_ROLE_KEY`       | Backend, worker     | **Yes**                                                  | Bypasses row level security; never in the frontend |
| `SUPABASE_JWT_SECRET` or JWKS URL | Backend             | **Yes**                                                  | Verify user sessions                               |
| `DATABASE_URL`                    | Backend, migrations | **Yes**                                                  | Direct database connection                         |
| `ADMIN_EMAILS` or a roles table   | Backend             | No                                                       | Admin allow-list; a database role is preferable    |
| `ALLOWED_ORIGINS`                 | Backend             | No                                                       | CORS allow-list                                    |
| `APP_ENV`                         | All                 | No                                                       | `development`, `preview`, `production`             |

### Phase 3 — Directory

| Variable                   | Where   | Secret | Purpose               |
| -------------------------- | ------- | ------ | --------------------- |
| `STORAGE_BUCKET_DIRECTORY` | Backend | No     | Logos and screenshots |

### Phase 5 — AutoFlow

| Variable                                                                 | Where           | Secret            | Purpose                               |
| ------------------------------------------------------------------------ | --------------- | ----------------- | ------------------------------------- |
| `ANTHROPIC_API_KEY`                                                      | Backend, worker | **Yes**           | First LLM provider                    |
| `OPENAI_API_KEY`, `GEMINI_API_KEY`, `XAI_API_KEY`                        | Backend, worker | **Yes**           | Later adapters; add only when used    |
| `ELEVENLABS_API_KEY`                                                     | Backend, worker | **Yes**           | Voiceover                             |
| `TAVILY_API_KEY` or `SERPAPI_API_KEY`                                    | Backend, worker | **Yes**           | Research; choose one                  |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                               | Backend         | Secret is **Yes** | YouTube OAuth                         |
| `TOKEN_ENCRYPTION_KEY`                                                   | Backend, worker | **Yes**           | Encrypt OAuth tokens at rest          |
| `QUEUE_URL` or `REDIS_URL`                                               | Backend, worker | **Yes**           | Job queue, if Redis is chosen         |
| `STORAGE_BUCKET_MEDIA`                                                   | Backend, worker | No                | Video, audio, images, subtitles       |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | Backend, worker | Keys are **Yes**  | Only if R2 is chosen                  |
| `RENDER_WORKER_URL` or queue name                                        | Backend         | No                | Reach the render worker               |
| `META_APP_ID`, `META_APP_SECRET`                                         | Backend         | Secret is **Yes** | Facebook and Instagram (5E)           |
| `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET`                              | Backend         | Secret is **Yes** | TikTok (5E)                           |
| `UPLIKA_API_KEY`                                                         | Backend, worker | **Yes**           | Optional provider (5D), behind a flag |
| `FEATURE_UPLIKA_PUBLISHING`                                              | Backend         | No                | Off by default                        |
| Webhook signing secrets                                                  | Backend         | **Yes**           | Verify provider webhooks (5E, 5F)     |

Names are proposals to be fixed when each phase is built. Provider keys the owner enters through
the product belong in encrypted database storage, not in environment variables.

## 3. Database migration plan

### Current state

Five SQL drafts in `supabase/migrations/`, each marked "NOT applied anywhere yet": catalogue,
deals, pricing, prompts, workflows. 16 tables, row level security enabled, public read of
published rows only.

### Principles

- No production database is created or changed without the owner's approval.
- Every change is a numbered, forward-only migration file in the repository.
- Each migration is applied to a development project first, then tested, then proposed for
  production.
- Row level security is enabled in the same migration that creates a table.
- Policies are tested with anonymous, signed-in, other-owner and admin identities.
- No `drop`, `truncate` or destructive `alter` without a written rollback and explicit approval.
- Sample records carry `is_sample = true` and are never mixed into the published catalogue.
- A backup or point-in-time recovery is confirmed before any production migration.

### Steps

| Step | Action                                                                                              | Needs approval |
| ---- | --------------------------------------------------------------------------------------------------- | -------------- |
| 1    | Owner confirms whether a Supabase project exists and shares its migration history                   | —              |
| 2    | If a project exists: compare its schema with the five drafts before applying anything               | —              |
| 3    | Create or designate a **development** project                                                       | Yes            |
| 4    | Review the drafts against spec 11 (pricing values, verification values, canonical domain)           | —              |
| 5    | Apply `0001`–`0005` to development; `0002` (deals) may be deferred while Deals is hidden            | —              |
| 6    | Add identity: profiles, roles, product entitlements, linked to Supabase Auth                        | —              |
| 7    | Add audit events                                                                                    | —              |
| 8    | Directory Data Manager tables: submissions, change proposals, versions, field evidence, import jobs | —              |
| 9    | Policy tests; seed labelled sample data                                                             | —              |
| 10   | Switch `repository.ts` to the database in development; compare pages before and after               | —              |
| 11   | Production project and first production migration                                                   | **Yes**        |
| 12   | AutoFlow schema in its own namespace, owner-scoped (Phase 5)                                        | Yes            |
| 13   | Publishing and social tables from spec 24 (Phase 5D–5F)                                             | Yes            |

### Data boundaries

| Namespace              | Contents                                              | Read access               | Write access                            |
| ---------------------- | ----------------------------------------------------- | ------------------------- | --------------------------------------- |
| Directory              | Tools, categories, prompts, guides, workflows         | Public for published rows | Admin, through the backend              |
| Directory account data | Favourites, collections, submissions                  | The owning user           | The owning user                         |
| AutoFlow               | Projects, scripts, media, jobs, approvals, publishing | The owning account only   | The owning account, through the backend |
| Shared                 | Profiles, roles, entitlements, audit events           | Self; admin for audit     | Backend only                            |

## 4. Hosting options

No budget has been set. Cost is given as a category, not a quotation: prices change and were not
checked against current provider pricing for this document. Verify each before provisioning.

Cost categories: **Free** = a free tier may be enough · **Low** = a small fixed monthly fee ·
**Medium** = a fixed fee that grows with capacity · **Usage** = billed by consumption, can vary
widely.

### By component

| Component           | Options                                                                                                        | Cost category    | Notes                                                                    |
| ------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------- | ------------------------------------------------------------------------ |
| Next.js frontend    | Vercel                                                                                                         | Free → Low       | Check the plan's terms for commercial use (already a checklist item)     |
| FastAPI backend     | A small VPS; or a container platform                                                                           | Low              | Always-on; modest memory is enough at first                              |
| Render worker       | A larger VPS or container with several CPU cores and generous memory; or on-demand machines started per render | Medium, or Usage | The most demanding component. Free and serverless tiers are not suitable |
| General worker      | Same machine as the backend at first                                                                           | Included         | Separate later if load requires                                          |
| Database and auth   | Supabase                                                                                                       | Free → Low       | A paid tier adds backups, which production needs                         |
| Media storage       | Supabase Storage; or Cloudflare R2                                                                             | Low → Usage      | Video files dominate. Compare storage and download charges               |
| Queue               | Supabase Queues; or Redis                                                                                      | Included, or Low | Supabase Queues avoids another service                                   |
| Domain and DNS      | Any registrar                                                                                                  | Low (annual)     | `aikitfinder.com` is unconfirmed                                         |
| Monitoring and logs | Platform built-ins first                                                                                       | Free → Low       |                                                                          |

### Usage-based costs outside hosting

These are likely to exceed hosting once videos are produced regularly.

| Service                     | Cost category     | Driver                          |
| --------------------------- | ----------------- | ------------------------------- |
| LLM provider (Claude first) | Usage             | Scripts, reviews, metadata      |
| ElevenLabs                  | Low → Usage       | Characters of voiceover; plan   |
| Research API                | Free → Usage      | Queries                         |
| Image generation, if used   | Usage             | Thumbnails                      |
| Uplika, if used             | Unverified        | Plan and volume                 |
| YouTube Data API            | Free within quota | Upload quota is limited per day |

### Three practical configurations

| Configuration          | Shape                                                                                  | Suits                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| A. Minimal             | Vercel + Supabase + one VPS running the API, queue consumer and render worker together | Personal use, a few videos a week. Cheapest; renders compete with the API for the machine |
| B. Separated           | Vercel + Supabase + small VPS for the API + a second, larger VPS for rendering         | Regular production; renders never slow the API. Matches the owner's stated preference     |
| C. On-demand rendering | As B, but the render machine starts per job and stops afterwards                       | Irregular or bursty rendering; more setup                                                 |

**Recommendation:** start Phase 1 with Vercel and Supabase only (no VPS is needed until the
backend exists), add the API host when the FastAPI skeleton is built, and choose between A and B
when the first American Car Saga render is measured. Use Supabase Queues and Supabase Storage
first; revisit Redis and R2 only if a measured limit is reached.

### Before provisioning anything

1. Owner confirms a budget range.
2. Current prices are checked for each chosen service.
3. A test render establishes the CPU, memory and time a 16:9 documentary video really needs.
4. The owner approves the specific plan.
