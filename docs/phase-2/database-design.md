# Phase 2 Step 1 — Database Design Proposal

15 Nov 2026. A proposal. No migration in this document has been written or applied. Existing
tables, policies and data are unchanged.

## 1. Existing (kept as is)

20 tables, all with row level security, 23 policies; see `architecture-audit.md`. `profiles` and
`workspaces` are the only account tables and stay the only ones: nothing below duplicates them.

## 2. Rules for every new table

1. Row level security on, with policies in the same migration.
2. No access for visitors. Signed-in users get only the operations and columns they need.
3. User data hangs off `workspaces.id` (or `profiles.id` for per-person preferences) with
   `on delete cascade`.
4. Trigger functions set their search path and are not callable directly.
5. Money and usage tables are append-only for everyone except the backend role.
6. Additive only. Nothing existing is dropped, renamed or loosened.

## 3. Proposed tables

### Directory catalog (extends existing)

| Table / change                                               | Purpose                                                                   | Reader             | Writer    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------ | --------- |
| `guides`, `guide_steps`, `guide_tools`, `guide_categories`   | Guides exist only as sample code today                                    | Public (published) | Admin API |
| `tool_features`                                              | Feature list per tool                                                     | Public (published) | Admin API |
| `tools.search_vector` (+ same on guides, prompts, workflows) | Full-text search column and index                                         | —                  | Trigger   |
| `tools.verified_by`, `tools.featured_rank`                   | Who verified; featured order                                              | Admin              | Admin API |
| Catalog policies                                             | Unchanged: public read of published rows (access strategy of 15 Nov 2026) | —                  | —         |

### Library

Private by definition: favorites, collections, saved comparisons and preferences are owner-only and
never appear in public pages, metadata, structured data or the sitemap.

| Table              | Columns (main)                                                        | Access |
| ------------------ | --------------------------------------------------------------------- | ------ |
| `favorites`        | `workspace_id`, `item_type`, `item_id`, `created_at`; unique per item | Owner  |
| `collections`      | `id`, `workspace_id`, `name`, `description`                           | Owner  |
| `collection_items` | `collection_id`, `item_type`, `item_id`, `position`, `note`           | Owner  |
| `recent_views`     | `workspace_id`, `item_type`, `item_id`, `viewed_at`; capped per user  | Owner  |

These hang off the user's **Directory** workspace, which already exists for every account.

### AutoFlow

| Table                          | Purpose                                                                       | Access                            |
| ------------------------------ | ----------------------------------------------------------------------------- | --------------------------------- |
| `autoflow_stage` enum          | Add value `scenes`                                                            | —                                 |
| `autoflow_projects`            | Add `language`, `template`, `archived_at` (nullable, additive)                | Owner read; backend write         |
| `research_briefs`              | Versioned brief per project; sources as rows in `research_sources`            | Owner read; backend write         |
| `scripts`, `script_scenes`     | Versioned script; one row per scene                                           | Owner read; backend write         |
| `voice_generations`            | Per scene: language, model, voice, settings, capability snapshot, asset       | Owner read; backend write         |
| `scenes`                       | Scene to asset mapping, timing, caption                                       | Owner read; backend write         |
| `video_jobs`                   | Render spec, status, progress, output asset                                   | Owner read; backend write         |
| `thumbnails`, `video_metadata` | Versioned outputs                                                             | Owner read; backend write         |
| `approvals`                    | Who approved which version of which stage, and when                           | Owner read; backend write         |
| `media_assets`                 | Storage key, type, size, duration, checksum, origin (upload or generated)     | Owner read; backend write         |
| `jobs`                         | One row per background job: type, status, attempts, error code, cost, timings | Owner read (own); backend write   |
| `job_errors`                   | Private diagnostic detail for a failed job                                    | Backend and permitted admins only |

The frontend's current write grants on `autoflow_projects` and `autoflow_project_stages` are
reduced to read when Python becomes the writer. That tightens access; nothing relies on those
grants today.

### Providers, usage, credits, billing

| Table                                | Purpose                                                    | Access                                                                              |
| ------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `ai_providers`                       | Name, capability, enabled, health, rate limits             | Backend; admins via API                                                             |
| `ai_provider_secrets`                | Encrypted key, last four characters, rotated date          | Backend role only; no policy for any user role                                      |
| `provider_usage`                     | Per job: provider, model, units, provider cost             | Backend; admins via API                                                             |
| `credit_ledger`                      | Append-only: workspace, amount, reason, job, balance after | Owner read; backend insert only                                                     |
| `credit_reservations`                | Open reservations for running jobs                         | Backend                                                                             |
| `price_table`                        | Credits per unit per capability                            | Signed-in read; admin write                                                         |
| `plans`, `subscriptions`, `payments` | Plan definitions, a workspace's plan, payment records      | Owner read (own); backend write. **Created only when a payment provider is chosen** |

### Admin, security, platform

| Table                | Purpose                                                                | Access                                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------------------ |
| `platform_role` enum | `super_admin`, `admin`, `editor`, `support`, `finance`                 | —                                          |
| `user_roles`         | `user_id`, `role`, `granted_by`, `granted_at`                          | No client access; read through a function  |
| `role_permissions`   | Role to permission; seeded by migration                                | No client access                           |
| `audit_log`          | Append-only: actor, action, target, before/after summary, IP, time     | Backend insert; permitted admins read      |
| `profiles.status`    | `active` or `suspended` (new column, default `active`)                 | Owner read; backend write                  |
| `notifications`      | Per user: type, title, body, read time                                 | Owner read and mark read; backend insert   |
| `email_events`       | Template, recipient hash, status, provider message id                  | Backend; permitted admins read             |
| `system_settings`    | Key, JSON value: maintenance mode, product availability, feature flags | Signed-in read of public keys; admin write |

## 4. Policies in outline

| Pattern           | Policy                                                                                                                                     |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Owner data        | `exists (select 1 from workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()))` — the pattern already used and tested |
| Published content | `status = 'published'` for signed-in users                                                                                                 |
| Staff read        | `has_permission('<permission>')`, a `security definer` function reading `user_roles`                                                       |
| Backend-only      | Row level security on, **no** policy for `anon` or `authenticated`                                                                         |
| Append-only       | Insert policy only; no update or delete grant                                                                                              |

## 5. Migration sequence (each additive, each validated locally first)

| No.   | Contents                                                   | Needed for             |
| ----- | ---------------------------------------------------------- | ---------------------- |
| 0008  | Roles, permissions, audit log, `profiles.status`, settings | Admin foundation       |
| 0009  | Guides, tool features, search columns and indexes          | Directory on real data |
| 0010  | Favorites, collections, recent views                       | Library                |
| 0011  | Jobs, job errors, media assets                             | Any background work    |
| 0012  | Providers, secrets, usage, credit ledger, price table      | First paid AI call     |
| 0013  | Research, scripts, approvals; project columns              | Research and Script    |
| 0014  | Voice generations                                          | Voice Studio           |
| 0015  | Scenes, video jobs; `scenes` enum value                    | Assembly and render    |
| 0016  | Thumbnails, metadata                                       | Thumbnail and metadata |
| 0017  | Notifications, email events                                | Messaging              |
| later | Plans, subscriptions, payments                             | Billing                |

## 6. Indexes

The performance advisor reports four foreign keys without an index in the existing catalog
tables. They are harmless while the tables are empty and will be added in 0009.

## 7. Test data

All automated tests currently run against the production database with throwaway accounts that
they delete. Before Phase 2 starts writing, a separate staging project (or a local Supabase
stack) is recommended so tests never share a database with real users. This needs a decision,
since the standing rule is not to create another Supabase project.
