# Feature Status — Phase 0

Every major feature in Developer Handoff v17, classified against the code at commit `fad9055`.

## Classification rules used

| Status                      | Meaning                                                                  |
| --------------------------- | ------------------------------------------------------------------------ |
| Implemented and tested      | Real data, real behaviour, covered by automated tests                    |
| Implemented but not tested  | Real behaviour exists in code; no automated tests                        |
| Partially implemented       | Some of the requirement is real; the rest is missing                     |
| Demo/simulated              | The UI works but runs on fictional sample data or a non-durable stand-in |
| Planned but not implemented | Described in documents or SQL drafts; no working code                    |
| Broken                      | Exists but fails a check or misbehaves                                   |
| Not applicable              | Explicitly out of scope for this release                                 |

**No feature qualifies as "Implemented and tested": the repository has no automated tests.**
"Checked" below means it was exercised by hand in the production build during this audit.

Summary: 0 implemented and tested · 8 implemented but not tested · 12 partially implemented ·
18 demo/simulated · 99 planned but not implemented · 3 broken · 6 not applicable.

## 1. Parent website (spec 13 §5, spec 15)

| Feature                                            | Status                      | Evidence                                                                                    |
| -------------------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------- |
| Parent gateway homepage introducing two products   | Planned but not implemented | `/` is the Directory homepage; AutoFlow is not mentioned                                    |
| Two distinct product CTAs and preview cards        | Planned but not implemented |                                                                                             |
| Parent header (Directory, AutoFlow, Help, Sign In) | Planned but not implemented | Header is the Directory nav plus VoiceHub                                                   |
| Sign In / Sign Up entry                            | Planned but not implemented | No auth UI anywhere                                                                         |
| Trust and transparency section, FAQ                | Planned but not implemented |                                                                                             |
| Dark-first violet parent identity                  | Planned but not implemented | Site is navy/blue/teal, light by default                                                    |
| Theme toggle with persistence                      | Implemented but not tested  | `theme-toggle.tsx`; checked                                                                 |
| Accessible mobile menu                             | Implemented but not tested  | `mobile-nav.tsx` on Radix dialog                                                            |
| About, Contact, Privacy, Terms pages               | Partially implemented       | Routes exist as labelled "In progress" placeholders                                         |
| No fabricated metrics or testimonials              | Partially implemented       | None found, but hero badge says "Free to use · No sign-up" (spec 17 §5 forbids free claims) |
| SEO metadata, robots, sitemap                      | Implemented but not tested  | Per-route metadata; preview hosts blocked; checked                                          |

## 2. AI Tools Directory — public (spec 11 §3, spec 13 §6)

| Feature                                            | Status                      | Evidence                                                                                |
| -------------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------- |
| Directory listing with search                      | Demo/simulated              | `/tools`; keyword matcher over 23 sample tools                                          |
| Filters (pricing, platform, API, level, free plan) | Demo/simulated              | `tool-filters.tsx`, `tool-query.ts`                                                     |
| Sort and pagination                                | Demo/simulated              |                                                                                         |
| Category and subcategory browsing                  | Demo/simulated              | `/categories`, `/categories/[slug]`                                                     |
| Use-case browsing pages                            | Planned but not implemented | `use_cases` is a text array; no route                                                   |
| Tool profile page                                  | Demo/simulated              | `/tools/[slug]`, 597 lines; no screenshots, integrations or pros/cons sections          |
| Pricing plans with source and date                 | Demo/simulated              | `pricing-section.tsx`; hides stale or unverified figures                                |
| Verification status and last-verified date         | Demo/simulated              | Shown from sample fields                                                                |
| Sample records never shown as Verified             | **Broken**                  | 19 sample records carry `verification: "verified"` and render a green Verified badge    |
| Compare 2–4 tools                                  | Demo/simulated              | `/compare`; shareable URL; unknown values shown as such                                 |
| Alternatives on a profile                          | Demo/simulated              | `alternativeSlugs`; no `/alternatives/:slug` page                                       |
| New / Trending / Popular / Editor's Picks views    | Planned but not implemented | "Recently updated" list only                                                            |
| Sponsored-placement labelling                      | Planned but not implemented |                                                                                         |
| Favorites, collections, recently viewed            | Planned but not implemented | Needs accounts                                                                          |
| Saved comparisons                                  | Planned but not implemented | Compare tray lives in `sessionStorage` only                                             |
| Submit a tool, suggest an edit, report a problem   | Planned but not implemented |                                                                                         |
| Reviews and ratings                                | Planned but not implemented |                                                                                         |
| Natural-language tool finder and AI summaries      | Planned but not implemented |                                                                                         |
| Guides library                                     | Demo/simulated              | `/guides`                                                                               |
| Deals library                                      | Demo/simulated              | `/deals`; spec 13 allows deals "only if real and maintained"                            |
| Workflow library (descriptive, nothing executes)   | Demo/simulated              | `/workflows`                                                                            |
| Separate Directory visual identity and header      | Partially implemented       | A coherent identity exists but it is the whole site's, not distinct from a parent brand |
| 500+ verified real tools                           | Planned but not implemented | 0 real records                                                                          |
| Live count from published, verified records        | Partially implemented       | Counts are computed, not hard-coded, but from sample data                               |
| Full-text / typo-tolerant database search          | Planned but not implemented |                                                                                         |

## 3. Prompt Library (spec 10)

| Feature                                    | Status                      | Evidence                                                     |
| ------------------------------------------ | --------------------------- | ------------------------------------------------------------ |
| Prompt listing, search, filters            | Demo/simulated              | `/prompts`; 10 sample prompts, all marked untested           |
| Prompt detail with copy                    | Demo/simulated              | `/prompts/[slug]`                                            |
| Editable variables form                    | Demo/simulated              | `prompt-playground.tsx`; fills blanks locally, sends nothing |
| Static example output, labelled            | Demo/simulated              | Labelled example text                                        |
| Live Playground (runs a provider)          | Planned but not implemented |                                                              |
| External demo mode                         | Planned but not implemented |                                                              |
| Source/creator attribution and reuse basis | Planned but not implemented | No `prompt_sources` model                                    |
| Save, report, suggest improvement          | Planned but not implemented |                                                              |
| Trending / Popular / Editor's Picks tabs   | Planned but not implemented |                                                              |
| Social and community discovery pipeline    | Planned but not implemented |                                                              |
| Prompt versions, moderation, admin         | Planned but not implemented |                                                              |

## 4. Directory data management and admin (spec 11 §4–§11)

| Feature                                              | Status                                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Manual admin entry and editing                       | Planned but not implemented                                                                     |
| CSV/XLSX import with validation and duplicate report | Planned but not implemented                                                                     |
| User submissions queue                               | Planned but not implemented                                                                     |
| Automated discovery, source registry                 | Planned but not implemented                                                                     |
| AI enrichment and classification                     | Planned but not implemented                                                                     |
| Admin approval gate enforced server-side             | Planned but not implemented                                                                     |
| Field-level provenance                               | Partially implemented (per-tool `sources` list and pricing source only; SQL draft, not applied) |
| Pricing-change monitoring and proposals              | Planned but not implemented (a manual workflow is documented)                                   |
| Internal data quality score                          | Planned but not implemented                                                                     |
| Duplicate review, broken-link queue                  | Planned but not implemented                                                                     |
| Reports and takedowns                                | Planned but not implemented                                                                     |
| Audit trail and record versions                      | Planned but not implemented                                                                     |
| Directory analytics                                  | Planned but not implemented                                                                     |

## 5. Shared authentication (spec 09 §F and §10, spec 13 §8)

| Feature                                      | Status                      |
| -------------------------------------------- | --------------------------- |
| One shared identity and session              | Planned but not implemented |
| Homepage-only Login entry                    | Planned but not implemented |
| Sign Up modal with Log In switch             | Planned but not implemented |
| Return to intended destination, validated    | Planned but not implemented |
| Product launcher and product switcher        | Planned but not implemented |
| Product entitlements                         | Planned but not implemented |
| Admin role enforced in the backend           | Planned but not implemented |
| Protected routes                             | Planned but not implemented |
| Password reset, rate limiting, audit logging | Planned but not implemented |

## 6. AutoFlow AI — public site (spec 13 §7.1)

| Feature                                | Status                      |
| -------------------------------------- | --------------------------- |
| AutoFlow landing page                  | Planned but not implemented |
| Features, How It Works, Security pages | Planned but not implemented |
| Instructions / Help Center with search | Planned but not implemented |
| Status-labelled integrations section   | Planned but not implemented |

## 7. AutoFlow AI — workspace and pipeline (spec 07, 12, 13 §7, 22)

No code exists for any item in this section. `/autoflow` returns 404.

| Feature                                            | Status                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Workspace shell (sidebar, top bar, drawer)         | Planned but not implemented                                      |
| Dashboard with live project and job data           | Planned but not implemented                                      |
| Projects and media library                         | Planned but not implemented                                      |
| Niche research and topic selection                 | Planned but not implemented                                      |
| Instruction review before script generation        | Planned but not implemented                                      |
| Script generation, editing, version history        | Planned but not implemented                                      |
| Fact-check flags ("Not verified")                  | Planned but not implemented                                      |
| LLM provider layer (Claude, OpenAI, Gemini, Grok)  | Planned but not implemented                                      |
| YouTube content package (title, description, tags) | Planned but not implemented                                      |
| Thumbnail text, exactly three lines                | Planned but not implemented                                      |
| Thumbnail prompts Version A (fixed) and B (story)  | Planned but not implemented                                      |
| Real-photo subject preservation                    | Planned but not implemented                                      |
| Voiceover: ElevenLabs                              | Partially implemented (see §8; VoiceHub is not part of AutoFlow) |
| Voiceover: Edge-TTS                                | Planned but not implemented                                      |
| Voiceover: uploaded recording                      | Planned but not implemented                                      |
| Script output-language control                     | Planned but not implemented                                      |
| Dynamic ElevenLabs language/model/voice discovery  | Planned but not implemented                                      |
| Long-form chunking and audio stitching             | Planned but not implemented                                      |
| Subtitles (Whisper), Unicode and RTL rendering     | Planned but not implemented                                      |
| Storyboard                                         | Planned but not implemented                                      |
| Video rendering (Remotion + FFmpeg) in a worker    | Planned but not implemented                                      |
| Video editor                                       | Planned but not implemented                                      |
| Metadata per platform                              | Planned but not implemented                                      |
| Estimated AutoFlow SEO Score                       | Planned but not implemented                                      |
| Preview and mandatory approval gate                | Planned but not implemented                                      |
| YouTube OAuth and upload                           | Planned but not implemented                                      |
| Facebook, Instagram publishing                     | Planned but not implemented                                      |
| TikTok publishing                                  | Planned but not implemented                                      |
| Analytics feedback loop                            | Planned but not implemented                                      |
| Content calendar                                   | Planned but not implemented                                      |
| Workflow Builder, automations, execution history   | Planned but not implemented                                      |
| Provider and integration settings                  | Planned but not implemented                                      |

## 8. VoiceHub (not in the handoff)

| Feature                                                     | Status                      | Evidence                                                                                                               |
| ----------------------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Server-side ElevenLabs TTS proxy, key never sent to browser | Implemented but not tested  | `api/voicehub/tts/route.ts`. No-key path checked (503, no fake audio); generation with a real key **not verified**     |
| Input validation (length, model, numeric ranges)            | Implemented but not tested  | Empty text returns 400; checked                                                                                        |
| Live voice list                                             | Partially implemented       | Calls `GET /v1/voices`, but the route is prerendered at build time, so the list does not refresh; no language metadata |
| Model selection                                             | Partially implemented       | Three hard-coded model IDs (spec 22 forbids a static list)                                                             |
| Demo credit ledger                                          | Demo/simulated              | In-memory; resets on restart; per server instance                                                                      |
| Generation history                                          | Demo/simulated              | Browser `localStorage` only                                                                                            |
| Dark theme                                                  | **Broken**                  | Labels and controls are close to invisible; raw colour classes                                                         |
| Code quality gate                                           | **Broken**                  | Fails `pnpm lint` (1 error) and `pnpm format:check` (5 files)                                                          |
| English-only interface                                      | Partially implemented       | Page copy is English; the 503 error message is Bengali                                                                 |
| Voice cloning                                               | Planned but not implemented | Labelled "coming soon"                                                                                                 |

## 9. Admin panel and Help Center (spec 09 §B–§C)

| Feature                                           | Status                      |
| ------------------------------------------------- | --------------------------- |
| Protected admin routes                            | Planned but not implemented |
| Admin overview, projects, jobs, logs              | Planned but not implemented |
| AI provider management with masked keys           | Planned but not implemented |
| Integration status and disconnect                 | Planned but not implemented |
| Instructions CMS (draft, publish, archive, media) | Planned but not implemented |
| Prompt template management with versions          | Planned but not implemented |
| Workflow settings                                 | Planned but not implemented |
| Usage and storage                                 | Planned but not implemented |
| Instruction articles (eight content groups)       | Planned but not implemented |
| Contextual "How to do this?" links                | Planned but not implemented |

## 10. Platform and infrastructure

| Feature                                  | Status                      | Evidence                                                      |
| ---------------------------------------- | --------------------------- | ------------------------------------------------------------- |
| React frontend                           | Implemented but not tested  | Next.js 16 / React 19                                         |
| Python FastAPI backend                   | Planned but not implemented | No Python files                                               |
| PostgreSQL schema                        | Planned but not implemented | Directory drafts only; not applied                            |
| Row level security                       | Planned but not implemented | Written in drafts; untested because unapplied                 |
| Queue and worker                         | Planned but not implemented |                                                               |
| Object storage and upload validation     | Planned but not implemented |                                                               |
| OAuth token encryption                   | Planned but not implemented |                                                               |
| Rate limiting                            | Planned but not implemented |                                                               |
| Security headers                         | Planned but not implemented | None sent; `X-Powered-By` exposed                             |
| Automated tests and CI                   | Planned but not implemented |                                                               |
| Design tokens                            | Partially implemented       | One token set; no per-product themes                          |
| Responsive layouts                       | Implemented but not tested  | No overflow at 1440px or 360px on six pages                   |
| Reduced-motion support                   | Implemented but not tested  | `motion.css`, `scroll-scenes.tsx`                             |
| English-only UI, `lang="en"`             | Partially implemented       | True except the Bengali VoiceHub API error                    |
| Deployment and environment documentation | Partially implemented       | README covers the frontend; `ELEVENLABS_API_KEY` undocumented |

## 11. Not applicable in this release

The handoff explicitly defers these; none exist in the repository, which is correct.

| Feature                                  | Source       |
| ---------------------------------------- | ------------ |
| Subscription billing, invoices, coupons  | Spec 07 §3   |
| Multi-tenant administration              | Spec 07 §3   |
| Team seats and roles                     | Spec 07 §3   |
| Public API / developer platform          | Spec 07 §3   |
| Bengali UI localisation, language toggle | Spec 20      |
| Official vidIQ score integration         | Spec 07 §5.8 |
