# Phase 1 Architecture

Branch `feature/phase-1-platform-foundation`, started from `claude/main` at `0a2c613`.
This document describes what is actually in the repository. It is updated as Phase 1 proceeds.

## 1. Audit of the starting point (14 Nov 2026)

| Area              | Finding                                                                                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch and remote | `claude/main`, in sync with `origin` (`github.com/mazahar007/aikitfinder`). No `main` branch exists on the remote; the other remote branch is `claude/loving-fermat-xkuiqk` at the pre-audit commit |
| Approved design   | Commit `0a2c613` holds the refined hybrid proposal and its three specifications in `docs/phase-0a/hybrid-proposal/`                                                                                 |
| Frontend          | Next.js 16.4.6 (App Router, Cache Components, Turbopack), React 19.3, TypeScript strict                                                                                                             |
| Styling           | Tailwind CSS v4; design tokens as CSS variables in `src/app/globals.css`; light and dark themes                                                                                                     |
| UI primitives     | `button`, `badge`, `input`, `sheet` on Radix + `class-variance-authority`                                                                                                                           |
| Animation         | GSAP (Directory homepage scenes only); CSS view transitions                                                                                                                                         |
| Backend           | None. Three Next.js route handlers for the legacy VoiceHub page                                                                                                                                     |
| Database          | None connected. Five SQL drafts in `supabase/migrations/`, never applied                                                                                                                            |
| Authentication    | None. No auth library installed                                                                                                                                                                     |
| Tests and CI      | None                                                                                                                                                                                                |
| Routes            | One root layout with the Directory header and footer wrapped around every page                                                                                                                      |
| Data              | Fictional sample records behind `src/lib/content/repository.ts`                                                                                                                                     |
| Checks at start   | Typecheck and build pass; lint fails on one pre-existing VoiceHub error; 5 VoiceHub files unformatted                                                                                               |

### Reusable as is

The Directory pages and components (tool cards, filters, compare, prompt and guide pages), the
repository data seam, the UI primitives, the sheet-based mobile menu, the theme mechanism, the
skip link and focus styles, and the sitemap and robots rules.

### Conflicts and blockers identified

| Item                                                           | Handling in Phase 1                                                                                           |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| One layout and one identity for the whole site                 | Route groups with one layout per product                                                                      |
| The homepage at `/` is the Directory homepage                  | Moved, unchanged, to `/directory`; `/` becomes the parent gateway                                             |
| A single saved theme for the whole site                        | Theme preference stored per product (decision F-02)                                                           |
| No Supabase project exists or has been confirmed               | **Blocker for real sign-in.** The account schema and the auth abstraction are built; live sign-in is deferred |
| No Python backend exists                                       | Not started in Phase 1: nothing in this phase needs it yet. Documented in `remaining-work.md`                 |
| The approved proposal is a single HTML file with page-wide CSS | Converted to components plus one stylesheet scoped to the parent site                                         |

## 2. Target structure for Phase 1

```
src/app/
  layout.tsx                 html, fonts, per-product theme script — no product chrome
  (parent)/                  AIKitFinder gateway:  /  /about  /contact  /privacy  /terms  /editorial-policy
  (directory)/               AI Tools Directory:   /directory  /tools  /categories  /guides  /prompts
                                                   /workflows  /compare  /search  (/deals, unlinked)
  (autoflow)/autoflow/       AutoFlow AI:          /autoflow  (public landing)
                                                   /autoflow/app/…  (workspace shell)
                                                   (/voicehub, legacy, unlinked)
  api/voicehub/              legacy route handlers, unchanged
```

One root layout is kept so that moving between products is a client-side navigation, not a full
page reload. Each route group adds its own header, footer and identity.

## 3. What was built

### Products and theming

`src/config/products.ts` is the single registry of the three products: home path, status label,
default theme and the storage key of its theme preference. `productForPath()` decides which
product a URL belongs to.

The root layout's inline head script and the `<ProductScope>` component set `data-product` and
`data-theme` on `<html>`. Product identity is a set of token overrides in `src/app/globals.css`
keyed on `data-product`, so the shared primitives (`Button`, `Badge`, `Input`) restyle themselves
in each product without product-specific variants.

| Product   | Default theme                | Saved under      |
| --------- | ---------------------------- | ---------------- |
| Parent    | Dark                         | `theme-parent`   |
| Directory | Saved choice, then OS choice | `theme`          |
| AutoFlow  | Dark                         | `theme-autoflow` |

### Parent homepage

`src/app/(parent)/page.tsx` assembles `src/components/parent/*`. Styles live in
`src/styles/parent.css`, every rule nested under `.akf-parent` with `--p-*` variables, so nothing
leaks into the other products.

The fish is `src/components/parent/hero-life/engine.js`: the approved canvas engine, ported
without visual changes, wrapped by `hero-life.tsx`, which loads it on idle after first paint.
`motion-store.ts` connects the engine to the Pause control in the header (desktop and tablet) or
under the hero buttons (phone). State is mirrored on `<html data-motion>` and saved in
`localStorage` under `akf-motion`.

### Directory

All existing pages moved into `(directory)` with unchanged URLs. The former homepage is
`/directory`. The header logo leads to `/directory`; "All products" leads back to `/#products`.

### AutoFlow AI

| Path                                 | What it is                         |
| ------------------------------------ | ---------------------------------- |
| `/autoflow`                          | Public landing page                |
| `/autoflow/app`                      | Workspace overview                 |
| `/autoflow/app/projects`             | Project list                       |
| `/autoflow/app/projects/[projectId]` | Project detail with the six stages |

`src/lib/autoflow/stages.ts` defines the stages; `projects.ts` is the data seam (same idea as the
Directory's `repository.ts`); `access.ts` is the one access check used by the workspace layout.

### Accounts

```
auth.users (Supabase Auth)            one shared identity
   └─ profiles                        1:1, created by trigger
        └─ workspaces                 one per product: 'directory', 'autoflow', created by trigger
             └─ autoflow_projects     AutoFlow workspace only
                  └─ autoflow_project_stages   six rows per project, created by trigger
```

Defined in `supabase/migrations/0006_accounts_workspaces.sql` with owner-only row level security.

### Supabase integration

| Item             | Value                                                                     |
| ---------------- | ------------------------------------------------------------------------- |
| Project          | `aikitfinder`, reference `lethjnizehfshztmsiah`                           |
| Region           | **ap-southeast-2 (Sydney)**, read from the Supabase API, not assumed      |
| Database         | PostgreSQL 17.11                                                          |
| Keys used by app | Project URL and publishable key only. No secret or service-role key       |
| Token signing    | Asymmetric (ES256); tokens are verified against the project's public keys |
| Migrations       | 0001–0007 applied and recorded in `supabase_migrations.schema_migrations` |

How a request is authenticated:

```
Browser ── form post ──► Server Action (src/lib/auth/actions.ts)
                              │  signUp / signInWithPassword / signOut on Supabase Auth
                              ▼
                 session in HttpOnly, Secure, SameSite=Lax cookies
                              │
every request ─► src/proxy.ts renews an expired token
                              │
page render ──► getCurrentUser() (src/lib/auth/session.ts)
                   verifies the token signature, returns { id, email, displayName } or null
                              │
data ─────────► Supabase client acting as that user (src/lib/supabase/server.ts)
                   row level security returns only the user's own rows
```

- There is no Supabase client in the browser. Pages learn who is signed in from `/auth/session`,
  which returns the email and display name only.
- `/auth/confirm` is where the confirmation email link lands.
- Without `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` the site builds and
  runs with accounts switched off and the dialog disabled.
- Session reads call `connection()`, so they run only for real requests, never in a prerendered or
  prefetched shell.

### Access rule for the workspace

| State                            | What `/autoflow/app/*` shows                           |
| -------------------------------- | ------------------------------------------------------ |
| Signed out                       | Sign-in prompt only; workspace pages are not rendered  |
| Signed in                        | The user's own workspace and projects                  |
| Accounts not configured (no env) | Read-only layout preview, a notice, one labeled sample |

`/account` shows the signed-in user's email, display name and two workspaces.

## 4. Not part of this architecture yet

Python FastAPI backend, worker, queue, storage, AI provider integrations, publishing, email
delivery (SMTP). See
`remaining-work.md`.
