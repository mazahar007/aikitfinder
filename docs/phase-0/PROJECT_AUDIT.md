# Project Audit — Phase 0

**Project:** AIKitFinder 2.0 + AutoFlow AI
**Reference:** Developer Handoff v17 (`AIKitFinder_AutoFlow_Final_v17`)
**Repository:** `mazahar007/aikitfinder`, branch `claude/main`, commit `fad9055` (2 Nov 2026)
**Audit date:** 11 Nov 2026
**Scope:** Inspection only. No application source, dependency or database was changed.

## 1. Verdict

The repository is a well-built **public AI tools directory prototype** running entirely on
fictional sample data, plus one small unplanned add-on (**VoiceHub**, an ElevenLabs
text-to-speech page). It is **not** the two-product platform the handoff describes.

Roughly: the Directory's public browsing UI exists as a prototype; everything else in the
handoff — the parent gateway homepage, AutoFlow AI, shared authentication, the Python backend,
the database connection, the admin panel, the queue/worker, storage, LLM providers, publishing
and analytics — does not exist in code.

| Area                                        | Status                                                           |
| ------------------------------------------- | ---------------------------------------------------------------- |
| Directory public UI (browse/search/compare) | Demo/simulated — works, but on fictional sample data             |
| Parent gateway homepage                     | Planned but not implemented (current home is the Directory home) |
| AutoFlow AI (landing, workspace, pipeline)  | Planned but not implemented (`/autoflow` returns 404)            |
| Shared authentication                       | Planned but not implemented                                      |
| Python / FastAPI backend                    | Planned but not implemented (no Python in the repository)        |
| Database                                    | Planned — five SQL drafts, marked "NOT applied anywhere"         |
| Admin panel, Help Center                    | Planned but not implemented                                      |
| Queue, worker, storage, rendering           | Planned but not implemented                                      |
| AI providers                                | ElevenLabs only, through VoiceHub; no LLM provider               |
| Automated tests, CI                         | None                                                             |

## 2. How the audit was done

| Step              | What was done                                                                                                                                                                                      |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Handoff review    | Read `README.md` and specifications 02–04, 06, 07, 09–13, 15–17 and 19–23; skimmed 01, 05 (headings only), 08, 14 and 18; checked the HTML prototypes for identity and structure, not line by line |
| Repository review | Read configuration, all routes, API handlers, data layer, sample data, migrations and docs                                                                                                         |
| Static checks     | `pnpm lint`, `pnpm typecheck`, `pnpm format:check`, `pnpm build`, `pnpm audit --prod`                                                                                                              |
| Runtime checks    | Started the production build locally; requested 31 routes and the three API endpoints                                                                                                              |
| Browser checks    | Headless Chromium at 1440px and 360px on six key pages (overflow, landmarks, console errors)                                                                                                       |

Dependencies were installed from the existing lockfile (`pnpm install --frozen-lockfile`) only to
run these checks. Nothing new was added; `git status` was clean before the audit documents were
written.

## 3. Check results

| Check               | Result                      | Detail                                                                                                                                       |
| ------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm typecheck`    | Pass                        |                                                                                                                                              |
| `pnpm lint`         | **Fail**                    | 1 error: `src/app/voicehub/page.tsx:58` (`react-hooks/set-state-in-effect`)                                                                  |
| `pnpm format:check` | **Fail**                    | 5 files, all VoiceHub                                                                                                                        |
| `pnpm build`        | Pass with a blocker warning | First run stops with a Next.js security advisory; the second run completes (89 static pages)                                                 |
| `pnpm audit --prod` | **Fail**                    | `next@16.4.0`: 2 critical + 1 high advisory, all patched in 16.4.1 (see `SECURITY_REVIEW.md`)                                                |
| Route probe         | Pass                        | All 20 existing routes return 200; `/autoflow`, `/directory`, `/admin`, `/sign-in`, `/auth/sign-in`, `/submit-tool`, `/favorites` return 404 |
| Browser probe       | Pass                        | No horizontal overflow and no console errors at 1440px or 360px                                                                              |
| Automated tests     | None                        | No test files, no test runner, no CI workflow                                                                                                |

The README's rule "run `pnpm check && pnpm build` before every commit" was not followed for the
two VoiceHub commits: `pnpm check` fails on the current head.

## 4. What exists and works

All of this was exercised in the running build, on sample data:

- Tool directory: search, filters with counts, sorting, pagination, active-filter chips, mobile
  filter sheet (`/tools`).
- Tool detail pages with pricing, settings, prompts, troubleshooting, alternatives, sources.
- Category index and category pages, with one level of subcategories.
- Comparison of 2–4 tools with a differences-only toggle (`/compare`).
- Prompt library with fill-in-the-blank variables and copy (`/prompts`).
- Guides, workflows and deals libraries.
- Site search across tools, guides, workflows, prompts, settings and troubleshooting.
- Light/dark theme, skip link, focus rings, reduced-motion handling, mobile menu.
- `robots.txt` and `sitemap.xml` that keep preview hosts and sample records out of search engines.
- VoiceHub: ElevenLabs text-to-speech proxy. Without an API key it returns a clear 503 and no
  fake audio (verified). **Real generation with a key was not tested** — no key is available here.

## 5. Most important findings

1. **Three governing documents disagree.** `docs/MASTER_BRIEF.md` (in the repository, calls itself
   the single source of truth), a feature roadmap file that the checklist references but that is
   not in the repository, and Handoff v17. They differ on product scope, accounts, design
   direction and backend. The owner must name which one governs.
2. **`next@16.4.0` has two critical advisories** (unauthenticated remote code execution). Patched
   in 16.4.1. This should be fixed before any other work.
3. **VoiceHub's TTS endpoint is open to the public.** Once an ElevenLabs key is set, anyone can
   spend the owner's credits; the only limit is an in-memory counter that does not hold on
   serverless hosting.
4. **The handoff's "current homepage" is a different codebase.** The handoff reviews a single-file
   HTML prototype (`nectarline-delivery/index.html`, with Three.js). The repository homepage is a
   Next.js Directory page with GSAP scenes. Phase 0A needs to know which one it is auditing.
5. **The handoff assumes infrastructure that does not exist.** Specs 10 and 11 say "existing
   Python backend", "existing PostgreSQL database", "existing protected Admin Panel". None exist.
6. **19 fictional sample records display a green "Verified" badge.** Handoff spec 17 §5 forbids
   any sample record from carrying one.
7. **The design direction conflicts.** The repository's approved identity is navy/blue/teal,
   light by default. The handoff wants a dark-first violet parent brand, a cyan/teal Directory
   and a violet/pink AutoFlow.
8. **VoiceHub is not in the handoff at all**, breaks in dark theme, hard-codes its model list,
   and its "live" voice list is frozen at build time.

## 6. Uncertainties

These could not be verified from the repository:

- Whether a live deployment exists and at what URL. VoiceHub copy mentions "the aikitfinder
  Vercel project (Production)", which suggests one, but nothing in the repository confirms it.
- Whether `ELEVENLABS_API_KEY` is set in any deployed environment.
- Whether any migration has been applied to a Supabase project. The files say no.
- What `voicehubo.vercel.app` is. VoiceHub links to it as "the standalone full voice SaaS"; its
  code is not in this repository.
- The content of `AIKitFinder_Feature_Roadmap_for_Claude.md`, which the checklist follows.
- The Kolibrie Studio design brief that spec 14 requires reviewing. It is not in the handoff ZIP.
- The handoff's design-reference PNGs are thumbnails (about 300×330 px and smaller). Layout is
  visible; copy and detail are not. The PDFs are described in the handoff as raster screenshots.
- Provider facts quoted in the handoff (ElevenLabs model families, API endpoints, platform
  publishing rules) were not re-verified against official documentation in this phase.

## 7. Related documents

| Document                    | Contents                                       |
| --------------------------- | ---------------------------------------------- |
| `CODEBASE_STRUCTURE.md`     | Directory tree, routes, components, data layer |
| `FEATURE_STATUS.md`         | Every handoff feature, classified              |
| `TECHNICAL_GAP_ANALYSIS.md` | Requirement-by-requirement gaps and conflicts  |
| `ARCHITECTURE_REVIEW.md`    | Current vs target architecture, risks, options |
| `SECURITY_REVIEW.md`        | Vulnerabilities, exposure, missing controls    |
| `PHASE_DEPENDENCY_MAP.md`   | Phase order, dependencies, blockers            |
| `PHASE_0_SUMMARY.md`        | Short summary, owner decisions, approval gate  |
