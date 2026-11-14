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
  voicehub/, api/voicehub/   legacy, unchanged, unlinked
```

One root layout is kept so that moving between products is a client-side navigation, not a full
page reload. Each route group adds its own header, footer and identity.

Sections 3 onward are filled in as the work lands.
