# Phase 2 Step 1 — AutoFlow AI Plan

15 Nov 2026. A plan. No AI feature exists today, and none is simulated.

## 1. Existing

Landing page, sign-in gate, workspace shell with Overview and Projects, project detail showing
six stages, database tables `autoflow_projects` and `autoflow_project_stages` with owner-only row
level security. "New project" is disabled. Identity: near-black and violet tokens are in place.

## 2. Studios

| Studio            | Purpose                                                                                               | Runs on                       | Human step                             |
| ----------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------- | -------------------------------------- |
| Dashboard         | Projects, job activity, credit balance                                                                | Next.js + API reads           | —                                      |
| Project creation  | Title, language, format (16:9 first), template                                                        | API                           | —                                      |
| Research          | Topic brief with cited sources                                                                        | Worker, `ai` queue            | Confirm facts to use                   |
| Script Studio     | Scene-by-scene narration; edit and regenerate a scene                                                 | Worker, `ai` queue            | Edit and approve                       |
| Voice Studio      | Language-first voice choice, audio per scene, subtitles                                               | Worker, `ai` then `media`     | Approve audio                          |
| Scene Studio      | Map each scene to the owner's images; timing, motion, captions                                        | API + worker for image prep   | Supply or confirm visuals              |
| Video Assembly    | Timeline from scenes, audio and subtitles                                                             | Worker builds the render spec | Check the cut                          |
| Rendering         | Final video file                                                                                      | Node.js Remotion renderer     | —                                      |
| Thumbnail Studio  | Layout A first (dark navy, white text, gold accent, red underline, three lines, car right, text left) | Worker, `media`               | Choose and edit                        |
| YouTube Metadata  | Title, description, tags, chapters                                                                    | Worker, `ai` queue            | Edit                                   |
| Review            | Publish-ready package                                                                                 | API                           | **Final approval; cannot be disabled** |
| Export            | Download video, audio, subtitles, thumbnail, metadata                                                 | API signed URLs               | —                                      |
| YouTube upload    | Upload as Private by default through the owner's own Google sign-in                                   | Worker                        | Owner triggers it after approval       |
| Usage and credits | Balance, per-job cost, history                                                                        | API                           | —                                      |
| Project history   | Every job, edit and approval, in order                                                                | API                           | —                                      |

The first workflow is American Car Saga: 16:9, the owner's real car photos preserved, thumbnail
layout A.

## 3. Stage model

The database has six stage values today. The studio list is larger. Proposal, additive only:

| Database stage today | Studios it covers                       | Change                                             |
| -------------------- | --------------------------------------- | -------------------------------------------------- |
| `research`           | Research                                | —                                                  |
| `script`             | Script Studio                           | —                                                  |
| `voice`              | Voice Studio                            | —                                                  |
| `video_assembly`     | Scene Studio, Video Assembly, Rendering | Add stage value `scenes` before it (enum addition) |
| `thumbnail_metadata` | Thumbnail Studio, YouTube Metadata      | Keep as one stage with two parts                   |
| `review`             | Review, Export, upload                  | —                                                  |

Adding an enum value is non-destructive. Existing projects (none today) would simply have no row
for the new stage until back-filled by the migration.

## 4. Job lifecycle

```
user action ─► API: validate, check ownership, check credits, reserve credits
                    create job row (queued) ─► enqueue task
worker ─► job running ─► provider call or FFmpeg ─► store asset ─► job succeeded, settle credits
                              │
                              └─ failure ─► retry with backoff ─► job failed, refund reservation
frontend ─► polls job status (or server-sent events later) ─► shows result for approval
```

- A stage output is a **draft** until the owner approves it. Nothing moves to the next stage, and
  nothing is published, without approval.
- Regenerating creates a new version; earlier versions are kept for history.
- Every job records provider, model, units used, cost and duration.

## 5. Provider layer

One interface per capability, one adapter per provider, chosen through the admin panel:

| Capability                        | Interface                                          | First provider (to be confirmed) | Existing code                                   |
| --------------------------------- | -------------------------------------------------- | -------------------------------- | ----------------------------------------------- |
| Text (research, script, metadata) | `TextProvider`                                     | Not chosen                       | None                                            |
| Web research                      | `SearchProvider`                                   | Not chosen                       | None                                            |
| Voice                             | `VoiceProvider`                                    | ElevenLabs                       | Legacy Next.js proxy, generation off by default |
| Images                            | Not needed for the first workflow (owner's photos) | —                                | —                                               |
| Video render                      | Remotion (not an external API)                     | —                                | None                                            |
| Publishing                        | `PublishProvider`                                  | YouTube Data API                 | None                                            |

Keys are central, server-side and encrypted at rest (decision F-04); the architecture leaves room
for user-supplied keys later. A model, voice or language is offered only if the connected account
reports it. Uplika remains an optional provider only.

## 6. Voice Studio and VoiceHub

Follows `docs/planning/VOICEHUB_MIGRATION_PLAN.md`: keep the server-side key pattern, input
validation and "charge only on success"; replace the in-memory ledger, hard-coded model list and
request-time generation with the provider adapter, queue and durable usage. `/voicehub` and
`voicehubo.vercel.app` stay untouched until the Studio is approved.

## 7. Rendering

The worker produces a render specification (JSON: scenes, image references, timings, captions,
audio). The renderer reads it, renders with Remotion and headless Chromium, and uploads the
file. FFmpeg in the Python worker handles audio stitching, loudness, subtitle files and
thumbnails. One render per renderer slot; render time for a ten-minute 1080p video is roughly
real-time to a few times real-time on four CPU cores, to be measured before sizing.

## 8. Credits

| Rule                 | Detail                                                                |
| -------------------- | --------------------------------------------------------------------- |
| Unit                 | Credits; each capability has a price table set in the admin panel     |
| Reservation          | Estimated cost reserved when a job is accepted                        |
| Settlement           | Actual cost charged on success; reservation released on failure       |
| Ledger               | Append-only; a balance is always the sum of the ledger                |
| Limits               | Per-user daily caps and per-request size caps, independent of credits |
| Pricing to customers | Not announced; no purchase flow until a payment provider is chosen    |

## 9. Privacy

Scripts, voiceovers, images and videos are private to their owner. Admin views show job status,
cost and error codes by default; opening a user's content requires a specific permission and is
written to the audit log.

## 10. Build order

1. Project create, rename, archive (API + UI).
2. Usage ledger and provider registry.
3. Research, then Script, with approval and versions.
4. Voice Studio.
5. Scene Studio and uploads.
6. Assembly and rendering.
7. Thumbnail and metadata.
8. Review, export.
9. YouTube upload (after Google's approval of the OAuth scopes).
