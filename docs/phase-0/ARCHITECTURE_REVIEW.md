# Architecture Review — Phase 0

## 1. Current architecture

One deployable unit: a Next.js 16 application. Almost everything is prerendered from in-memory
sample data at build time.

```
Browser
  │
  ▼
Next.js 16 app (single deployment)
  ├── Server components ──► repository.ts ──► sample/*.ts (in-memory, fictional)
  ├── Client components ──► sessionStorage (compare tray), localStorage (theme, VoiceHub history)
  └── Route handlers /api/voicehub/*
         ├── credits.ts (in-memory ledger on globalThis)
         └── fetch ──► api.elevenlabs.io   (only external call in the codebase)

supabase/migrations/*.sql   drafts, connected to nothing
```

There is no database connection, session, background process, file storage or second service.

### Build output

89 static pages. Listing pages use partial prerendering with a one-hour revalidation.
`/api/voicehub/health` and `/api/voicehub/tts` are dynamic; `/api/voicehub/voices` is static.

## 2. Target architecture in the handoff

```
Browser
  │
  ▼
React frontend (Next.js is acceptable — spec 07 §7)
  ├── Parent site            /
  ├── AI Tools Directory     /tools, /prompts, /compare, …
  ├── AutoFlow AI            /autoflow, /autoflow/app/*
  └── Admin                  /autoflow/admin (and Directory management)
        │  shared session
        ▼
Python FastAPI backend (auth checks, business logic, provider adapters)
  ├── PostgreSQL (Supabase) with row level security
  ├── Object storage (media, audio, images, subtitles)
  ├── Queue ──► Python worker(s): research, LLM, voice, publishing, discovery, checks
  │        └──► Node render worker: Remotion + FFmpeg
  └── Adapters: LLM · voice · research · image · publishing · analytics
```

Spec 07 §7 asks for a modular monolith plus a separate worker, not microservices.

## 3. What is sound and should be kept

| Strength                                      | Why it matters                                                                                                        |
| --------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Repository seam (`lib/content/repository.ts`) | Pages are already isolated from the data source; swapping in an API or database touches one file                      |
| Types mirror the SQL drafts                   | The content model was designed once, in both places                                                                   |
| Honesty mechanics                             | `isSample` flag, Sample badges, sample notice, sitemap exclusion, noindex on previews, derived deal/pricing freshness |
| Design tokens as CSS variables                | Per-product themes can be added by scoping token overrides                                                            |
| Accessibility baseline                        | Skip link, focus rings, 44px targets, reduced-motion handling                                                         |
| Server-side key handling in VoiceHub          | The key never reaches the browser and is not logged                                                                   |
| URL-driven filter state                       | Shareable, cache-friendly, works without JavaScript state stores                                                      |
| Strict TypeScript, ESLint, Prettier           | Typecheck passes on the whole codebase                                                                                |

## 4. Structural problems

### 4.1 No product boundaries

All routes share one root layout, one header, one footer and one token set. The handoff requires
three experiences with separate navigation, layouts and themes. Next.js route groups can provide
this without changing URLs, but it is a restructuring of `src/app` and of `layout.tsx`.

### 4.2 The root layout assumes the Directory

`layout.tsx` mounts the Directory header, footer, compare tray and pointer spotlight for every
route, including `/voicehub`. An AutoFlow workspace with a sidebar cannot live under it unchanged.

### 4.3 No backend tier

The planned backend in the repository's own documents is "server code with the Supabase
service-role key". The handoff requires a Python API. These are different architectures, and the
choice affects authentication, deployment, hosting cost and every later phase.

### 4.4 VoiceHub does not follow the codebase's conventions

- Bypasses design tokens (breaks in dark theme) and the shared container.
- Not behind an adapter; ElevenLabs calls are written inline in a route handler.
- State kept on `globalThis` — on serverless hosting each instance has its own copy and loses it
  on cold start, so the "credit" limit is not a limit.
- Fails the repository's own lint and format gates.
- Sits in the Directory's main navigation although it is a third, unspecified product.

### 4.5 Static generation assumptions

The site is built around build-time prerendering of a small fixed dataset. A catalogue of 500 to
1,000+ database records that change after admin approval needs a deliberate caching and
revalidation strategy (on-demand revalidation, tags, or dynamic rendering for search).
`generateStaticParams` over the full catalogue also lengthens builds.

### 4.6 Search

Search is an in-memory keyword matcher. It will not scale to the target catalogue and has no
ranking, synonyms or typo tolerance. Spec 11 §12 asks for PostgreSQL full-text search first.

### 4.7 Homepage animation weight

The homepage loads GSAP and several scroll-driven scenes. The handoff asks for restrained motion
and measured performance. No performance measurement exists. This is a Phase 0A topic.

## 5. Duplicate or conflicting components

| Item                                                  | Conflict                                                                                                                             |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Three governing documents                             | `docs/MASTER_BRIEF.md`, the missing feature roadmap, Handoff v17                                                                     |
| Two phase-numbering schemes (four counting sub-specs) | Repository roadmap phases 0–9 vs handoff phases 0, 0A, 1–7                                                                           |
| Two homepages                                         | Repository Next.js homepage vs handoff `nectarline-delivery/index.html`                                                              |
| Two animation approaches                              | GSAP (repository) vs Three.js/WebGL (handoff prototype)                                                                              |
| Two "workflow" concepts                               | Directory workflow library (descriptive articles) vs AutoFlow Workflow Builder (executes automations) — same word, same parent brand |
| Two "prompt" concepts                                 | Directory Prompt Library (public content) vs AutoFlow prompt templates (internal, versioned)                                         |
| Two voice products                                    | VoiceHub in this repository vs external `voicehubo.vercel.app`; plus AutoFlow's planned Voiceover Studio                             |
| Two prompt sources                                    | Tool-page prompts (`PromptTemplate`) and library prompts (`Prompt`) — merged at read time in `repository.ts`                         |
| Duplicated files in the handoff                       | Homepage HTML ×3, dashboard HTML ×2, Phase 0A prompt ×2                                                                              |
| Three AutoFlow sidebar structures                     | Spec 07 §6, spec 09 §E, spec 13 §7.2                                                                                                 |

No duplicated UI components were found inside `src/components`.

## 6. Technical risks

| #   | Risk                                                                                                                                                          | Likelihood       | Impact   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | -------- |
| R1  | Unpatched Next.js with critical advisories is deployed                                                                                                        | High if deployed | Critical |
| R2  | Open TTS endpoint drains ElevenLabs credits once a key is set                                                                                                 | High             | High     |
| R3  | Work starts while three documents disagree, producing rework                                                                                                  | High             | High     |
| R4  | Scope: the handoff describes a far larger system than the repository; one phase at a time is essential                                                        | High             | High     |
| R5  | Two runtimes (Node frontend + Python API + Node render worker) raise hosting and operational cost for a personal-use release                                  | Medium           | Medium   |
| R6  | Video rendering needs sustained CPU and memory that free or serverless tiers do not provide (spec 07 §8 warns of this)                                        | High             | High     |
| R7  | Shared authentication across a Next.js frontend and a FastAPI backend needs a deliberate token/session design; getting it wrong weakens every protected route | Medium           | High     |
| R8  | Platform access: YouTube upload quota and verification, Meta app review, TikTok audit can each block publishing regardless of code quality                    | High             | High     |
| R9  | 500+ verified tools is an editorial workload, not a coding task; it can stall launch                                                                          | High             | Medium   |
| R10 | Discovery from third-party sources may breach their terms if not checked source by source                                                                     | Medium           | High     |
| R11 | Provider facts in the handoff (models, endpoints, limits, prices) go out of date                                                                              | High             | Medium   |
| R12 | No tests: every restructuring step risks silently breaking the working Directory prototype                                                                    | High             | Medium   |
| R13 | Re-theming to the handoff's identities discards the approved navy/blue/teal design system                                                                     | Medium           | Medium   |
| R14 | Next.js 16 has breaking changes relative to common knowledge (`AGENTS.md` warns of this); careless edits can break the build                                  | Medium           | Medium   |
| R15 | Edge-TTS relies on a service whose terms may not permit this use                                                                                              | Medium           | Medium   |

## 7. Architectural options that need an owner decision

### Backend

| Option                                                                                                | For                                                       | Against                                                                           |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | --------------------------------------------------------------------------------- |
| A. FastAPI for everything (handoff as written)                                                        | Matches the confirmed decision; one place for all rules   | Directory pages need an extra network hop; more to host for a small first release |
| B. FastAPI for AutoFlow and Admin; Directory reads go straight to Supabase through row level security | Keeps public pages fast and simple; reuses the SQL drafts | Two data-access paths to keep consistent                                          |
| C. Next.js server code only, no Python                                                                | Simplest to host                                          | Contradicts spec 09 §A; needs explicit owner approval                             |

Option B is the closest fit to both the existing code and the handoff. It is a recommendation,
not a decision.

### Authentication provider

Supabase Auth is the natural candidate because Supabase is already the planned database and its
tokens can be verified by both Next.js and FastAPI. The handoff does not name a provider.

### Product boundaries

Route groups — for example `(parent)`, `(directory)`, `(autoflow)`, `(admin)` — each with its own
layout and token scope, keep one deployment and existing URLs.

### VoiceHub

Keep as a separate product, fold into AutoFlow's Voiceover Studio, or remove. See the owner
questions in `PHASE_0_SUMMARY.md`.

## 8. Recommended target shape

Subject to the decisions above:

1. One Next.js application with route groups per product and per-product token scopes.
2. Supabase for PostgreSQL, authentication and storage.
3. One FastAPI service for AutoFlow, Admin writes and provider adapters.
4. One queue with a Python worker; a separate Node worker for Remotion rendering.
5. Public Directory reads served through row level security; every write through the API.
6. Existing Directory URLs, the repository seam, sample-data flags and SEO behaviour preserved.
