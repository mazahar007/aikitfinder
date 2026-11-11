# Technical Gap Analysis — Phase 0

Compares the code at commit `fad9055` with Developer Handoff v17. Gaps are grouped by kind:
conflicts that need a decision, missing building blocks, defects in what exists, and problems in
the handoff itself.

## 1. Conflicts between the repository and the handoff

These cannot be resolved by a developer alone.

| #   | Topic           | Repository                                                                                                                                | Handoff v17                                                                                  |
| --- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| C1  | Source of truth | `docs/MASTER_BRIEF.md` calls itself the single source of truth; the checklist follows a second roadmap file that is not in the repository | Handoff v17 is described as the master reference                                             |
| C2  | Product scope   | One free directory and knowledge hub                                                                                                      | Parent brand + AI Tools Directory + AutoFlow AI                                              |
| C3  | Accounts        | "No accounts" in the first release; hero badge "Free to use · No sign-up"                                                                 | Shared login, sign-up modal, protected actions; no "free" claims                             |
| C4  | Backend         | Plan: Next.js server code + Supabase with the service-role key                                                                            | Python FastAPI backend for API and business logic (spec 09 §A)                               |
| C5  | Visual identity | Approved navy / blue / teal, light default, one identity                                                                                  | Dark-first violet parent; cyan/teal Directory; violet/pink AutoFlow                          |
| C6  | Homepage        | Directory-first hero search with GSAP story                                                                                               | Gateway that routes visitors to two products                                                 |
| C7  | Routes          | `/tools/[slug]`, `/categories/[slug]`, `/search`                                                                                          | `/tool/:slug`, `/tools/category/:slug`, `/tools/search` (adaptable)                          |
| C8  | Phase numbering | Roadmap phases 0–9 (currently "Phase 6: workflow library")                                                                                | Phases 0, 0A, 1–7 in spec 13; different phases 0–6 in spec 07; phases 1–3 in specs 10 and 11 |
| C9  | Deals           | Deals section built on sample data                                                                                                        | Deals "only if deals are real and maintained"                                                |
| C10 | VoiceHub        | Shipped, in the main navigation, links to an external SaaS                                                                                | Not mentioned anywhere                                                                       |
| C11 | Voice backend   | TypeScript route handlers call ElevenLabs                                                                                                 | Voice generation belongs to the Python backend and worker                                    |

Recommended handling of C7: keep the existing URLs. Spec 13 §4.3 allows adapting route names to
existing code, and changing them gains nothing.

## 2. Missing building blocks

Ordered by how much depends on them.

### 2.1 Backend service

Nothing exists. Required: FastAPI application, versioned API contracts, schema validation,
centralised authorisation, structured errors, sanitised logging, configuration and secret
handling, local development and deployment instructions.

### 2.2 Database

| Needed                                                                                                                                                                                 | Present                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| A connected PostgreSQL / Supabase project                                                                                                                                              | No                         |
| Applied migrations and a migration runner                                                                                                                                              | No (five unapplied drafts) |
| Users, profiles, roles, product entitlements                                                                                                                                           | No                         |
| Directory: submissions, field evidence, change proposals, versions, import jobs, discovery jobs and candidates, reports, favourites, collections, reviews, search and analytics events | No                         |
| Prompts: sources, demo assets, model compatibility, versions, submissions, reports, events                                                                                             | No                         |
| AutoFlow: all 20 entities in spec 07 §7 (`projects`, `scripts`, `script_versions`, `media_assets`, `voice_jobs`, `render_jobs`, `approvals`, `publish_jobs`, …)                        | No                         |
| Multilingual fields in spec 22 §7                                                                                                                                                      | No                         |
| Help Center articles, categories, revisions                                                                                                                                            | No                         |
| Audit events                                                                                                                                                                           | No                         |
| Full-text search index                                                                                                                                                                 | No                         |
| Seed strategy                                                                                                                                                                          | No                         |

Differences between the existing drafts and spec 11:

| Draft today                                                                 | Spec 11 expects                                             |
| --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `pricing_model`: free, freemium, paid, open-source; null means not verified | Adds Enterprise and Contact Sales; explicit Unknown         |
| `verification_status`: verified, needs-review, unverified                   | Adds Partially Verified and Information Not Disclosed       |
| Features, use cases, tags, platforms as arrays on `tools`                   | Normalised tables with links (admin-managed taxonomy)       |
| One `tool_sources` list per tool                                            | Field-level evidence (source, observed, verified, reviewer) |
| No canonical domain column                                                  | Unique canonical URL/domain for duplicate detection         |
| Read-only public policies, no write policies                                | Owner-scoped and admin write paths, enforced server-side    |

The drafts are a sound starting point for the Directory read model and can be extended rather
than replaced.

### 2.3 Authentication and authorisation

Nothing exists: no provider, session, sign-up, login, password reset, route protection, role
model, entitlement model, return-URL validation, CSRF handling or rate limiting. No shared modal
component exists either (the UI kit has `sheet` but no dialog).

### 2.4 Background processing

No queue, worker, scheduler or job table. Required for research, LLM generation, voice, rendering,
publishing, analytics, discovery, link checks and pricing checks. Spec 13 forbids long work in
serverless request handlers; the only long-running call today (VoiceHub TTS) does exactly that.

### 2.5 Storage and media

No object storage, upload endpoint, file validation, signed URLs or media records. No FFmpeg,
Remotion, Whisper or font handling.

### 2.6 AI and platform integrations

| Integration                                           | State                                          |
| ----------------------------------------------------- | ---------------------------------------------- |
| LLM providers (Claude, OpenAI, Gemini, Grok)          | None; no provider interface                    |
| ElevenLabs                                            | Direct call from one route handler; no adapter |
| Edge-TTS                                              | None                                           |
| Research (YouTube Data API, Trends, Tavily/SerpAPI)   | None                                           |
| Image generation                                      | None                                           |
| YouTube, Meta, Instagram, TikTok OAuth and publishing | None                                           |
| Platform analytics                                    | None                                           |

### 2.7 Product surfaces

Parent homepage, AutoFlow landing, AutoFlow workspace, Admin Panel, Help Center, product
launcher, product switcher and all account features are absent. See `FEATURE_STATUS.md`.

### 2.8 Quality infrastructure

No unit, integration or end-to-end tests; no CI; no error monitoring; no performance measurement;
no accessibility audit record.

## 3. VoiceHub against spec 22

VoiceHub is the only code touching a handoff requirement area, so it is compared in detail.

| Spec 22 requirement                                                 | VoiceHub today                              |
| ------------------------------------------------------------------- | ------------------------------------------- |
| Discover models from `GET /v1/models`; no static list               | Three hard-coded model IDs                  |
| Use each model's `languages` and `maximum_text_length_per_request`  | Fixed 5,000-character limit for every model |
| Voices from `GET /v2/voices` with language and `verified_languages` | `GET /v1/voices`; keeps only ID and name    |
| Output-language selector; filter models and voices by language      | No language control                         |
| Text-to-Dialogue path for models that need it                       | Standard text-to-speech endpoint only       |
| Chunk long narration and stitch audio                               | Single request                              |
| Server-side capability cache with timestamp and stale marker        | None; voice list frozen at build time       |
| Store model, voice, language, endpoint and limits per asset         | Stores nothing durable                      |
| English-only UI messages                                            | One Bengali error string                    |
| API key server-side only                                            | Met                                         |
| Never fake a successful voiceover                                   | Met (checked without a key)                 |

Conclusion: VoiceHub proves the ElevenLabs key handling pattern but should be treated as a
prototype. Its logic would need to be rebuilt behind a provider adapter to satisfy spec 22.

## 4. Defects in existing code

| #   | Defect                                                                                | Location                                                            |
| --- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| D1  | Lint error (`react-hooks/set-state-in-effect`)                                        | `src/app/voicehub/page.tsx:58`                                      |
| D2  | Five files fail Prettier                                                              | VoiceHub files                                                      |
| D3  | VoiceHub unreadable in dark theme (raw `slate-*` / `white` classes instead of tokens) | `src/app/voicehub/page.tsx`                                         |
| D4  | Two `<main>` landmarks on `/voicehub`                                                 | Page renders `<main>` inside the layout's `<main>`                  |
| D5  | Bengali text in an API error                                                          | `src/app/api/voicehub/tts/route.ts:30`                              |
| D6  | `/api/voicehub/voices` is prerendered, so the "live" list never refreshes after build | Build output marks it static                                        |
| D7  | Sample records display a green Verified badge                                         | 8 tools, 6 deals, 3 guides, 2 workflows in `src/lib/content/sample` |
| D8  | "Free to use · No sign-up" hero badge                                                 | `src/app/page.tsx:87`                                               |
| D9  | Unknown slugs return HTTP 200 instead of 404                                          | Dynamic routes (already in the checklist)                           |
| D10 | `ELEVENLABS_API_KEY` missing from `.env.example` and README                           |                                                                     |
| D11 | Public page copy names the hosting project and environment variable                   | `src/app/voicehub/page.tsx` demo notice                             |
| D12 | README and checklist are stale (no VoiceHub; "Phase 2 complete")                      | `README.md`, `docs/PROJECT_CHECKLIST.md`                            |

Security defects are listed separately in `SECURITY_REVIEW.md`.

## 5. Missing dependencies

Nothing should be installed in this phase. These will be needed later and each is a decision
point; none should be added before the relevant phase is approved.

| Need                     | Candidates named in the handoff            | Notes                                       |
| ------------------------ | ------------------------------------------ | ------------------------------------------- |
| Patched framework        | `next` ≥ 16.4.1                            | Security fix; see `SECURITY_REVIEW.md`      |
| Python API               | FastAPI                                    | Entire Python toolchain is new              |
| Database and auth client | Supabase                                   | Choice of auth provider is open             |
| Queue                    | Celery, RQ, Arq or a managed queue         | Needs Redis or equivalent                   |
| Rendering                | Remotion (Node), FFmpeg                    | Needs a host with enough CPU and memory     |
| Subtitles                | Whisper                                    | Hosted API or local model                   |
| Voice                    | ElevenLabs, Edge-TTS                       | Edge-TTS terms of use must be checked first |
| LLM SDKs                 | Anthropic, OpenAI, Google, xAI             | One first, others later                     |
| Research                 | YouTube Data API, Tavily or SerpAPI        |                                             |
| UI primitives            | Dialog, select, tabs, toast, tooltip, etc. | Radix is already the base                   |
| Testing                  | Unit and end-to-end runners                | Playwright is available in this environment |
| Import                   | CSV/XLSX parser                            |                                             |

## 6. Problems inside the handoff

| #   | Issue                                                                                                                                                                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | Specs 10 and 11 refer to an "existing" Python backend, PostgreSQL database, Admin Panel, queue and storage. None exist.                                                                      |
| H2  | The "current homepage" reviewed in specs 15–19 is `nectarline-delivery/index.html`, a single-file prototype that is not this repository.                                                     |
| H3  | README names `AikitFinder-complete-source-UX-improved-v15.zip`; the file shipped is `…-v17.zip`.                                                                                             |
| H4  | Duplicate files: `homepage-ux-improved/index.html` equals `AIKitFinder_Homepage_English_Only_v17.html`; the dashboard HTML exists twice; `CLAUDE_PHASE_0A_PROMPT.txt` equals the v17 prompt. |
| H5  | Design-reference PNGs are thumbnails (about 300 px wide); spec 04 says the PDFs are raster screenshots without recoverable text.                                                             |
| H6  | Spec 14 requires reviewing a "Kolibrie Studio design brief" that is not in the ZIP.                                                                                                          |
| H7  | Spec 07 §3 puts public registration out of scope; spec 09 §10 requires a public Sign Up modal.                                                                                               |
| H8  | Spec 08 and spec 09 §F require a product launcher after login; spec 09 §10.3 says do not force a product choice.                                                                             |
| H9  | Spec 09 has two sections labelled "F".                                                                                                                                                       |
| H10 | Spec 01 lists "public SaaS customers" and "Usage & Billing"; later specs defer both.                                                                                                         |
| H11 | Spec 13 Phase 1 includes shared authentication, which needs the backend that spec 09 §G places in a later step.                                                                              |
| H12 | Spec 07 §7 says "Node.js or FastAPI; choose one"; spec 09 fixes Python. Spec 09 is later and should win.                                                                                     |
| H13 | Three workspace navigation structures differ (spec 07 §6, spec 09 §E, spec 13 §7.2).                                                                                                         |
| H14 | ElevenLabs model families and limits in spec 22 are a dated snapshot and must be re-verified at implementation.                                                                              |
| H15 | Edge-TTS is listed as a voice option without noting that its usage terms need checking for this use.                                                                                         |

## 7. Effort signal

No estimate is given here. As an order of magnitude only: the repository covers a prototype of
roughly one of the seven implementation phases in spec 13 (Phase 3, public Directory UI, without
its database, admin or account features). Phases 1, 2, 4, 5, 6 and 7 have no code.
