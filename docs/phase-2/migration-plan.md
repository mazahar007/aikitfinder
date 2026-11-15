# Phase 2 Step 1 — Gradual Migration Plan

15 Nov 2026. Nothing here has been migrated. Existing Next.js functions keep working until their
Python replacement is tested and switched on.

## 1. Principles

1. **One writer per table.** No table is written by both Next.js and Python at any time.
2. **Read paths move last.** A page may keep reading through Supabase as the user after its
   writes move to Python.
3. **Switch by flag.** Each migrated function sits behind a server-side flag so it can be turned
   back in seconds.
4. **Additive database changes only** during migration. Old columns and tables are removed in a
   later, separately approved step.
5. **Auth stays where it is.**

## 2. Migration table

| Existing Function                                          | Target Python Module           | Priority | Risk   | Notes                                                                 |
| ---------------------------------------------------------- | ------------------------------ | -------- | ------ | --------------------------------------------------------------------- |
| Sign up, log in, log out, reset (Server Actions)           | None — stays in Next.js        | —        | —      | Python only verifies the token                                        |
| `/auth/confirm`, `/auth/session`, `proxy.ts`               | None — stays in Next.js        | —        | —      |                                                                       |
| Token verification (`lib/auth/session.ts`)                 | `core/security`                | P0       | Low    | Duplicated, not moved: both sides verify                              |
| Workspace access check (`lib/autoflow/access.ts`)          | `core/permissions`             | P0       | Low    | Frontend keeps its own check; the API checks independently            |
| Directory reads (`lib/content/repository.ts`, sample data) | `directory`                    | P1       | Medium | First to real database rows, then behind the API for search           |
| Directory search and filters (`tool-query.ts`)             | `directory`                    | P1       | Medium | Becomes full-text search in PostgreSQL                                |
| Search suggestions                                         | `directory` (new)              | P2       | Low    | Does not exist today                                                  |
| Comparison (`compare-store.ts`, session storage)           | Stays client-side              | —        | —      | Optional later sync to `library`                                      |
| Favorites and collections                                  | `library` (new)                | P1       | Low    | Does not exist today                                                  |
| Recently viewed                                            | `library` (new)                | P2       | Low    | Does not exist today                                                  |
| AutoFlow project reads (`lib/autoflow/projects.ts`)        | `projects`                     | P1       | Low    | Reads may stay on Supabase-as-user; all writes go to Python           |
| AutoFlow project create, rename, archive                   | `projects` (new)               | P0       | Low    | Does not exist today                                                  |
| Research                                                   | `research` (new)               | P1       | High   | First paid AI call; needs credits and limits first                    |
| Script generation                                          | `scripts` (new)                | P1       | High   |                                                                       |
| Voice generation (`/api/voicehub/tts`, ElevenLabs)         | `voice`                        | P1       | High   | The only existing AI integration; follows the VoiceHub migration plan |
| Voice list (`/api/voicehub/voices`)                        | `voice`                        | P1       | Low    |                                                                       |
| In-memory credit ledger (`lib/voicehub/ledger`)            | `usage`                        | P0       | Medium | Replaced, not migrated: it holds no durable data                      |
| Video generation and rendering                             | `video` + renderer (new)       | P2       | High   | Needs storage, queue and renderer                                     |
| Thumbnails, metadata                                       | `thumbnails`, `metadata` (new) | P2       | Medium |                                                                       |
| Admin operations                                           | `admin` (new)                  | P0       | High   | Authority must never live in the browser                              |
| Billing and usage                                          | `billing`, `usage` (new)       | P2       | High   | Blocked on a payment provider decision                                |
| Account page reads                                         | Stays in Next.js               | —        | —      |                                                                       |

Priority: P0 = needed before anything else can be built safely; P1 = first product features;
P2 = later.

## 3. Table ownership (writer)

| Tables                                         | Writer today        | Writer after migration                                         |
| ---------------------------------------------- | ------------------- | -------------------------------------------------------------- |
| `auth.*`                                       | Supabase Auth       | Supabase Auth                                                  |
| `profiles`, `workspaces`                       | Database trigger    | Trigger; `profiles.display_name` by the account page (Next.js) |
| `autoflow_projects`, `autoflow_project_stages` | None (read-only UI) | Python `projects`                                              |
| Catalog and content tables                     | None                | Python `admin`                                                 |
| Everything new in `database-design.md`         | —                   | Python                                                         |

Because the app has never written to the project or catalog tables, no dual-write window is
needed for them: Python becomes their first and only writer.

## 4. Order and dependencies

```
M0  Backend skeleton: health, config, logging, JWT verification, CI, Docker       ← hosting decision
M1  RBAC tables, admin bootstrap, audit log, admin API read endpoints             ← M0
M2  Projects write API; frontend "New project" calls it                           ← M0
M3  Catalog on real rows: admin create/edit, Directory reads from database        ← M1
M4  Library: favorites, collections, recently viewed                              ← M3
M5  Usage and credits ledger, provider registry with encrypted keys               ← M1, Redis
M6  Research and Script on the queue                                              ← M2, M5, AI provider
M7  Voice Studio (replaces VoiceHub routes)                                       ← M5, storage
M8  Scenes, assembly, renderer                                                    ← M7, storage, renderer host
M9  Thumbnails, metadata, export, YouTube                                         ← M8, Google approval
M10 Billing                                                                       ← M5, payment provider
```

## 5. Rollback

| Step  | Switch                                       | Rollback                                                                     |
| ----- | -------------------------------------------- | ---------------------------------------------------------------------------- |
| M0–M1 | Nothing user-facing depends on it            | Stop the service                                                             |
| M2    | Flag `projects_api`                          | Flag off: button disabled again; rows already created stay valid             |
| M3    | Flag `directory_source = sample \| database` | Flag to `sample`: the current in-code data is kept until removed by approval |
| M4    | Feature flag per feature                     | Hide the controls; data stays                                                |
| M5–M9 | Per-stage flag                               | Stage shows "not available"; reserved credits are refunded                   |
| M7    | Flag `voice_backend = legacy \| python`      | Legacy routes stay in place, disabled by default as they are now             |
| M10   | Flag `billing_enabled`                       | Off: no purchases; existing balances remain                                  |

Database rollback is never "drop": each migration is additive and each feature can be switched
off without removing its tables.

## 6. What must not happen

- Python writing `profiles` or `workspaces` rows that the trigger owns.
- The frontend writing project or catalog rows directly once Python owns them. The table grants
  for `authenticated` will be reduced to `select` at that step (a tightening, not a loosening).
- Two systems charging credits for the same action.
- A long-running job started from a Server Action.
