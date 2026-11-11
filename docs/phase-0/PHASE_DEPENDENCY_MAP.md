# Phase Dependency Map — Phase 0

Uses the phase numbering of handoff spec 13 §15 (as corrected by spec 17), which is the
controlling sequence. Other numbering schemes are mapped onto it in section 5.

## 1. Sequence and gates

```
Phase 0   Repository and reference audit            ◄── this document; no code changes
   │
   ▼  owner approval
Phase 0A  Homepage UX audit and wireframes          no code changes
   │
   ▼  owner approval (explicit, written)
Phase 1   Core foundation
   │
   ├──► Phase 2   Parent AIKitFinder homepage
   ├──► Phase 3   AI Tools Directory
   └──► Phase 4   AutoFlow public website
                     │
                     ▼
                  Phase 5   AutoFlow workspace
                     │
Phase 3 + Phase 5 ───┴──► Phase 6   Admin and Help Center
                              │
                              ▼
                           Phase 7   QA, security, launch readiness
```

Phases 2, 3 and 4 can run in any order once Phase 1 is done. Spec 17 fixes Phase 2 first.

## 2. Work that should precede Phase 1

These are not phases in the handoff, but the audit shows they block or endanger later work.

| ID  | Item                                                  | Why first                                     | Needs                         |
| --- | ----------------------------------------------------- | --------------------------------------------- | ----------------------------- |
| P-1 | Upgrade Next.js to a patched release                  | Critical advisories (`SECURITY_REVIEW.md` S1) | Owner approval                |
| P-2 | Contain the VoiceHub TTS endpoint                     | Open cost exposure (S2)                       | Owner decision on VoiceHub    |
| P-3 | Name the governing document                           | Three documents disagree                      | Owner decision                |
| P-4 | Decide backend shape, auth provider, design direction | Phase 1 cannot be scoped without them         | Owner decisions               |
| P-5 | Restore a green `pnpm check`                          | Baseline for detecting regressions            | Follows the VoiceHub decision |

P-1 and P-2 change code or dependencies, so they were **not** done in Phase 0.

## 3. Phase detail

### Phase 0A — Homepage UX audit and wireframes

| Depends on                                                              | Produces                             |
| ----------------------------------------------------------------------- | ------------------------------------ |
| Phase 0 approval                                                        | Seven documents listed in spec 17 §6 |
| Decision: which homepage is "current" (repository vs handoff prototype) | Approved wireframes for Phase 2      |
| Decision: design direction (navy/teal vs violet)                        |                                      |
| Decision: what happens to VoiceHub in the navigation                    |                                      |

Open inputs: the Kolibrie brief (spec 14) is missing; the design-reference images are thumbnails.

### Phase 1 — Core foundation

| Work                                                   | Depends on                                    |
| ------------------------------------------------------ | --------------------------------------------- |
| Route groups and per-product layouts                   | Phase 0A approval                             |
| Parent, Directory and AutoFlow theme tokens            | Design decision                               |
| Missing UI primitives (dialog, select, tabs, toast, …) | —                                             |
| Supabase project; apply and test Directory migrations  | Owner supplies the project and credentials    |
| Users, roles, entitlements schema                      | Auth provider decision                        |
| Shared authentication and sign-up modal                | Backend decision; decision on who may sign up |
| Backend service skeleton                               | Backend decision; hosting decision            |
| Route guards and return-URL validation                 | Authentication                                |
| Test runner and CI                                     | —                                             |

Note: spec 13 places shared authentication in Phase 1, while spec 09 §G places the Python
foundation after the homepage. Authentication needs a backend or an auth service, so the backend
skeleton belongs in Phase 1.

### Phase 2 — Parent homepage

| Depends on                                  | Notes                                                                     |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| Phase 0A approved wireframes                | Do not copy the HTML preview (spec 17 §1)                                 |
| Phase 1 layouts, tokens, auth modal         |                                                                           |
| Placeholder or real `/autoflow` destination | The AutoFlow CTA needs somewhere to go; a labelled landing stub is enough |
| Real Privacy, Terms, Contact copy           | Currently placeholders; owner supplies or approves copy                   |

### Phase 3 — AI Tools Directory

| Work                                                    | Depends on                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------- |
| Directory layout, header, identity                      | Phase 1                                                    |
| Switch `repository.ts` from sample data to the database | Phase 1 database                                           |
| Database-backed search and filters                      | Applied schema, full-text index                            |
| Favourites, collections, saved comparisons              | Authentication                                             |
| Submissions, reports                                    | Authentication, abuse controls, moderation queue (Phase 6) |
| Real tool data                                          | Admin entry and import (Phase 6); editorial effort         |
| Prompt Library on real data                             | Prompt schema extensions                                   |

The public Directory UI already exists as a prototype, so Phase 3 is mostly data, accounts and
re-theming. **Real data depends on admin tooling**, which spec 13 places in Phase 6. Either the
Directory admin subset moves forward, or Phase 3 ships on labelled sample data.

### Phase 4 — AutoFlow public website

Depends on Phase 1 only. Content must label every integration as planned until Phase 5 delivers
it. The Instructions pages depend on the Help Center CMS (Phase 6) or start as static pages.

### Phase 5 — AutoFlow workspace

Internal order, following spec 07 §10 and spec 09 §G:

```
5.1 Workspace shell, projects, media records      ◄─ auth, storage, AutoFlow schema
5.2 Queue and worker skeleton, job tracking       ◄─ hosting for workers
5.3 Provider settings and first LLM adapter       ◄─ owner picks the first provider and supplies a key
5.4 Research and topic selection                  ◄─ 5.3, research API keys
5.5 Instruction review → script → content package ◄─ 5.3
5.6 Voiceover (dynamic ElevenLabs discovery)      ◄─ 5.2, ElevenLabs key
5.7 Subtitles                                     ◄─ 5.6
5.8 Render pipeline (Remotion + FFmpeg)           ◄─ 5.2, 5.6, 5.7, render host, first template
5.9 Thumbnail studio                              ◄─ 5.5, branding preset from the owner
5.10 Metadata and estimated SEO score             ◄─ 5.5
5.11 Preview and approval gate                    ◄─ 5.8, 5.9, 5.10
5.12 YouTube OAuth and publishing                 ◄─ 5.11, Google Cloud project, API quota
5.13 Facebook, Instagram                          ◄─ 5.12, Meta app review
5.14 TikTok                                       ◄─ 5.12, TikTok developer approval
5.15 Analytics feedback                           ◄─ 5.12
```

5.11 must exist before 5.12: publishing without a recorded approval must be impossible.

### Phase 6 — Admin and Help Center

| Work                                           | Depends on                                  |
| ---------------------------------------------- | ------------------------------------------- |
| Admin role and protected routes                | Phase 1 authentication                      |
| Directory management, import, moderation       | Phase 3 schema                              |
| Discovery, link and pricing checks             | Queue and worker (5.2); source terms review |
| Provider, prompt-template, job, log management | Phase 5                                     |
| Instructions CMS and articles                  | Storage; features exist to document         |

### Phase 7 — QA, security, launch

Depends on everything. Includes removing sample data and dead controls, authorisation and row
level security tests, accessibility and performance measurement, and deployment documentation.

## 4. External dependencies

Items only the owner or a third party can provide.

| Dependency                                                     | Blocks           |
| -------------------------------------------------------------- | ---------------- |
| Governing-document decision                                    | Everything       |
| Supabase project and credentials                               | Phase 1          |
| Hosting for the Python API and workers                         | Phase 1, 5       |
| Domain registration and DNS (`aikitfinder.com` is unconfirmed) | Launch           |
| Privacy, Terms, Contact copy                                   | Phase 2, launch  |
| Kolibrie design brief; full-resolution design references       | Phase 0A         |
| First LLM provider choice and API key                          | 5.3              |
| ElevenLabs account and key; decision on Edge-TTS               | 5.6              |
| Research provider key (Tavily or SerpAPI)                      | 5.4              |
| Google Cloud project, OAuth consent, YouTube API quota         | 5.12             |
| Meta app and review; Instagram professional account            | 5.13             |
| TikTok developer approval                                      | 5.14             |
| Thumbnail Version A branding preset                            | 5.9              |
| First video template and source-asset rules                    | 5.8              |
| Verified tool records (500+ target)                            | Directory launch |

## 5. Mapping of the other numbering schemes

| This map (spec 13) | Spec 07 (AutoFlow)        | Spec 11 (Directory)           | Repository checklist roadmap                  |
| ------------------ | ------------------------- | ----------------------------- | --------------------------------------------- |
| Phase 0            | Phase 0                   | —                             | Phase 0 (done earlier, for the old brief)     |
| Phase 1            | Phase 1 (foundation part) | —                             | 1b (Supabase), part of 7 (accounts)           |
| Phase 2            | —                         | —                             | — (homepage already built for the old brief)  |
| Phase 3            | —                         | Phase 1, part of 3            | 1a done; 1c; 2–6 built on sample data         |
| Phase 4            | —                         | —                             | —                                             |
| Phase 5            | Phases 1–5                | —                             | Phase 8 (assistant, automation, integrations) |
| Phase 6            | —                         | Phases 1–2 (admin, discovery) | 1d (admin CMS), 1e (CSV import)               |
| Phase 7            | Acceptance criteria       | Acceptance criteria           | 1f, launch readiness                          |
| Not in scope       | Phase 6 (SaaS expansion)  | —                             | Phase 9 (growth); billing                     |

## 6. Recommended implementation order

1. Owner decisions (`PHASE_0_SUMMARY.md`, section 6).
2. P-1 security upgrade and P-2 VoiceHub containment.
3. Phase 0A.
4. Phase 1, starting with authentication design and a test baseline.
5. Phase 2.
6. Phase 3, with the Directory admin subset of Phase 6 brought forward so real data can enter.
7. Phase 4.
8. Phase 5 in the order 5.1 → 5.15.
9. Remainder of Phase 6.
10. Phase 7.
