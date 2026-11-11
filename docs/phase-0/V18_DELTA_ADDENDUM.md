# Handoff v18 Delta — Addendum to the Phase 0 Audit

The Phase 0 audit compared the repository with Handoff v17. The owner has since named **Handoff
v18** the governing document. This addendum compares v18 with v17 and with the repository. It
does not replace the Phase 0 reports; it extends them.

**Date:** 11 Nov 2026 · **Repository:** commit `f43a278`

## 1. What changed between v17 and v18

Compared file by file. Everything not listed is byte-identical to v17.

| File                                                                       | Change                                                                                                      |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `specifications/24_UPLIKA_SOCIAL_PUBLISHING_AND_ENGAGEMENT_INTEGRATION.md` | **New.** The full social publishing and engagement specification                                            |
| `specifications/25_V18_UPLIKA_INTEGRATION_CHANGELOG_AND_VALIDATION.md`     | **New.** Changelog                                                                                          |
| `AutoFlow_Dashboard_Social_Publishing_Uplika_Prototype_v18.html`           | **New.** Static prototype; states it is not connected                                                       |
| `CLAUDE_PHASE_5D_5F_UPLIKA_INTEGRATION_PROMPT_v18.txt`                     | **New.** Prompt for future phases 5D–5F                                                                     |
| `CLAUDE_PHASE_0A_PROMPT_v18.txt`                                           | **New.** v17 prompt plus a note to read spec 24 as context                                                  |
| `specifications/07_AUTOFLOW_FINAL_DEVELOPER_SPECIFICATION.md`              | Adds §5.10A Social Inbox, §5.10B Social Automations, new navigation groups, 12 API routes, 12 data entities |
| `specifications/13_COMPLETE_WEBSITE_DESIGN_AND_IMPLEMENTATION_SPEC.md`     | Adds nine workspace routes and a v18 addendum                                                               |
| `specifications/08_FINAL_CLAUDE_GEMINI_BUILD_PROMPT.md`, `README.md`       | Add v18 sections                                                                                            |

v18 is purely additive. No v17 requirement was removed or altered.

## 2. New requirements in v18

| Area                    | Requirement                                                                                                                      | Priority in spec 24 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| Provider architecture   | A provider-neutral publishing interface. Uplika is one optional adapter; native YouTube (and later Meta, TikTok) adapters remain | P0                  |
| Channel Connections     | Real connection state, account identity, permissions, health; never a fake connected state                                       | P0                  |
| Capability discovery    | Platforms, limits, option schemas, privacy choices and quotas read at runtime; nothing hard-coded                                | P0                  |
| Publishing Center       | Multi-channel composer, per-channel copy and metadata, per-destination preview and validation                                    | P0                  |
| Drafts and scheduling   | Only where the destination supports them; timezone shown; who schedules (AutoFlow or provider) shown                             | P0                  |
| Media                   | Staged upload with provider media references                                                                                     | P0                  |
| Per-destination results | Independent status per channel; retry failed destinations only; idempotency; no duplicates                                       | P0                  |
| History                 | Permalink shown only after the platform confirms                                                                                 | P0                  |
| Quota visibility        | Provider and platform limits shown before publishing                                                                             | P1                  |
| Social Inbox            | DMs, mentions, comments where the provider exposes them; open/closed/unread; reply; moderation with confirmation                 | P1                  |
| Contacts                | Lightweight records and tags; no CRM, no enrichment                                                                              | P1                  |
| Social Automations      | Template-first comment-to-DM, comment-to-reply, keyword, mention, DM, story-reply triggers where supported                       | P2                  |
| Automation safety       | Every automation starts Draft/Disabled; explicit owner enable; pause/disable; run history; duplicate suppression; webhook health | P2                  |
| Analytics boundary      | Basic insights from the provider; deep YouTube metrics from the native YouTube Analytics API                                     | —                   |
| Approval gate           | Public publishing stays blocked without owner approval of the exact content version. Social automations cannot bypass it         | Binding             |
| Phasing                 | New sub-phases 5D (Publishing Center and pilot), 5E (multi-platform and inbox), 5F (automations)                                 | —                   |

## 3. v18 against the repository

| v18 feature                                   | Status in the repository    |
| --------------------------------------------- | --------------------------- |
| Provider-neutral publishing interface         | Planned but not implemented |
| Uplika REST adapter                           | Planned but not implemented |
| Native YouTube adapter                        | Planned but not implemented |
| Channel Connections screen                    | Planned but not implemented |
| Runtime capability discovery and snapshots    | Planned but not implemented |
| Publishing Center, composer, validation       | Planned but not implemented |
| Drafts, scheduling, calendar, queue           | Planned but not implemented |
| Media upload to providers                     | Planned but not implemented |
| Per-destination status, retry, idempotency    | Planned but not implemented |
| Post history and permalinks                   | Planned but not implemented |
| Quota and rate-limit visibility               | Planned but not implemented |
| Social Inbox and replies                      | Planned but not implemented |
| Contacts and tags                             | Planned but not implemented |
| Social Automations and run history            | Planned but not implemented |
| Webhook endpoints with signature verification | Planned but not implemented |
| The 12 new `social_*` / `publishing_*` tables | Planned but not implemented |
| The 12 new API routes                         | Planned but not implemented |
| The nine new workspace routes                 | Planned but not implemented |

No code, schema, route or dependency related to Uplika or social publishing exists in the
repository. The v18 HTML prototype is a static mock-up and is not counted as implementation.

Every v18 feature also depends on things that do not exist yet: the AutoFlow workspace, the
Python backend, authentication, the queue and worker, storage, and the approval gate.

## 4. Provider capability check

The owner asked that actual provider capabilities be verified before implementation. As a first
data point, one read-only capability listing was requested from Uplika on 11 Nov 2026 through the
Uplika connector available in this session. Nothing was published, connected or changed.

Only the fields below were extracted from the response; the rest of it was not reviewed.

| Observation                                                                                                                                                                             |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 15 channels were returned: 13 with status `live`, 2 with status `bridge` (browser-extension)                                                                                            |
| YouTube, Facebook, Instagram and TikTok were all reported `live`                                                                                                                        |
| YouTube options include `privacyStatus` with values `public`, `unlisted`, `private`, described as defaulting to private; also `publishAt`, `thumbnailMediaId`, `containsSyntheticMedia` |
| Facebook options include `scheduledPublishTime`; Instagram includes `contentType`, `isAiGenerated`; TikTok includes `privacyLevel`, `postMode`, `isAigc`                                |
| Each channel carries its own option schema and character limits, which supports spec 24's rule that these be read at runtime                                                            |

Limits of this check:

- It reflects one moment and one account. Spec 24 requires re-reading capabilities at runtime.
- It used the connector, not the REST API that spec 24 prefers for backend work. The REST API,
  its authentication and its rate limits were **not** verified.
- **Not checked:** which channels are connected on the owner's account, quota, pricing or plan,
  inbox and automation permissions, webhook behaviour, or terms of service.
- The default-Private decision for test uploads (owner decision 13) is consistent with what the
  YouTube option schema reports. That it behaves so in practice is untested.

Costs were not verified. They must be checked against current official pricing before Phase 5D.

## 5. New risks introduced by v18

| #   | Risk                                                                                          | Note                                                                             |
| --- | --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| V1  | Duplicate publishing if a video goes through both a third-party provider and a native adapter | One provider route per destination per operation; store provider on every result |
| V2  | A timeout after the provider accepted a post leads to a repeat post on retry                  | Check status before retry; idempotency keys                                      |
| V3  | Comment-to-DM and auto-reply can breach platform messaging rules                              | Draft/Disabled default; explicit enable; platform policy review per channel      |
| V4  | Inbound webhooks are a new attack surface                                                     | Signature verification, replay protection, rate limits                           |
| V5  | Inbox and contacts store other people's personal data                                         | Minimise; retention policy; privacy copy must cover it                           |
| V6  | Dependence on a third-party intermediary for publishing                                       | Adapter is optional and feature-flagged; native YouTube stays                    |
| V7  | Provider credentials add another secret class                                                 | Server-side encrypted storage; redacted logs                                     |
| V8  | Scope growth: v18 adds three sub-phases to an already large Phase 5                           | Keep 5D–5F after the core YouTube pipeline works                                 |
| V9  | Provider capabilities, pricing and terms change                                               | Runtime discovery; re-check documentation at implementation                      |
| V10 | The word "automation" now has two meanings in AutoFlow                                        | Separate "Production workflows" from "Social automations" in navigation and data |

## 6. Effect on the phase map

Phase 5 in `PHASE_DEPENDENCY_MAP.md` gains three sub-phases after YouTube publishing works:

```
5.11 Preview and approval gate
5.12 Native YouTube OAuth and publishing          (Private by default for tests)
5.15 Analytics feedback (native YouTube Analytics)
        │
        ▼
5D  Publishing Center + provider-neutral interface + optional Uplika adapter (feature flag)
5E  Facebook and Instagram, then TikTok; Social Inbox; Contacts
5F  Social Automations (templates first; visual canvas later)
```

The core pipeline must work with no publishing provider configured: the owner must be able to
produce and export a video without Uplika.

Owner decisions that also change the earlier map:

| Decision                                                        | Effect                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Minimum Directory Data Manager built during the Directory phase | The Directory admin subset moves from Phase 6 into Phase 3                                 |
| Claude is the first LLM provider                                | Step 5.3 is unblocked; an adapter interface is still required                              |
| VoiceHub becomes the Voiceover Studio foundation                | Step 5.6 starts from existing code; see `docs/planning/VOICEHUB_MIGRATION_PLAN.md`         |
| First production test is the American Car Saga workflow         | Steps 5.8 and 5.9 have a defined first template: 16:9, real photographs, subject preserved |
| Deals hidden                                                    | Removed from Phase 3 scope until real data exists                                          |

## 7. Issues in the v18 package

| #   | Issue                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| K1  | The ZIP's top-level folder is still named `AIKitFinder_AutoFlow_Final_v17`                                                                                   |
| K2  | `CLAUDE_PHASE_0A_PROMPT_v18.txt` is still headed "(v17)" and tells the reader to use the v17 ZIP                                                             |
| K3  | The v18 Phase 0A prompt says "no code edits, no dependency changes". The owner separately authorised a limited security remediation; the two were kept apart |
| K4  | Spec 24 keeps "Workflow Builder / My Automations"; spec 07 renames them "Content Workflow Builder / My Production Workflows". The spec 07 names are clearer  |
| K5  | Spec 24 sketches its provider interface in TypeScript, while the backend is Python. The spec allows changing the language                                    |
| K6  | All Phase 0 handoff issues H1–H15 remain (see `TECHNICAL_GAP_ANALYSIS.md` §6), except those the owner has now decided                                        |

## 8. Phase 0 findings now resolved by owner decisions

| Phase 0 item           | Resolution                                                             |
| ---------------------- | ---------------------------------------------------------------------- |
| C1 governing document  | Handoff v18 governs; older documents are historical                    |
| C4 backend             | FastAPI for orchestration and product APIs; Supabase for data and auth |
| C5 visual identity     | Three identities as specified                                          |
| C6 / H2 which homepage | The repository's Next.js homepage                                      |
| C9 Deals               | Hidden or postponed                                                    |
| C10 / C11 VoiceHub     | Foundation of AutoFlow's Voiceover Studio; legacy deployment kept      |
| H7 who may sign up     | Individual registration is allowed                                     |
| H8 product launcher    | Return to the requested destination; switch products freely            |
| S1 vulnerable Next.js  | Fixed — see `docs/security/SECURITY_REMEDIATION_REPORT.md`             |
| S2 open TTS endpoint   | Contained — same report                                                |

Still unconfirmed, by the owner's own statement: the Supabase project and migration history, the
production domain, and whether an ElevenLabs key is set in any deployment.
