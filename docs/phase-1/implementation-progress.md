# Phase 1 Implementation Progress

Branch `feature/phase-1-platform-foundation`, from `claude/main` at `0a2c613`. Status on
15 Nov 2026 (final). "Foundation" means structure that works but has no real data or service behind it.

## Commits

| Commit    | Summary                                                                     |
| --------- | --------------------------------------------------------------------------- |
| `251ffdf` | Phase 1 repository audit and target architecture                            |
| `cea2e63` | Lint and format checks brought to green (pre-existing VoiceHub issues)      |
| `f17dae7` | Product registry and per-product theming                                    |
| `2ea21ce` | Shared account dialog and session foundation                                |
| `5206fb8` | Parent homepage components and hero animation engine                        |
| `7edd12c` | Routes split into parent and Directory groups                               |
| `f11faa6` | VoiceHub kept in the Directory shell; header overflow fix                   |
| `5f6189e` | AutoFlow AI foundation: landing, workspace, projects, stages                |
| `853647b` | Accounts, workspaces and AutoFlow projects migration with validation script |
| `4879384` | Phone header overflow and short menu target fixed                           |
| `49e9579` | Browser check script                                                        |

| `22fca15` | Phase 1 documents (first report) |
| `a87afad` | Accounts migration hardened for Supabase and applied |
| `a861b5c` | Supabase Auth: sign-up, log-in, log-out and sessions |
| `906f350` | Account dialog, headers and account page connected to real accounts |
| `c99cec0` | AutoFlow workspace protected; real projects loaded |
| `d02f269` | Migration 0007: search path of catalog trigger functions |
| `2961cfb` | Authentication and data-isolation checks |
| `d6b75e9` | American English in Directory and sample copy |
| `e9cc541` | Tap targets and header fit across all widths |
| `cd1069b` | Directory nav labels on one line |

The final documentation commit follows these.

## A. Homepage (`/`)

| Item                                                             | State       | Notes                                                                  |
| ---------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------- |
| Hero, product cards, how it works, trust, FAQ, final CTA, footer | Implemented | Content as approved, including the exact FAQ wording (F-03)            |
| Code-drawn crystal betta (Option A)                              | Implemented | Engine ported unchanged; same route, particles, glow and pointer light |
| Pause / Resume                                                   | Implemented | Remembered across visits                                               |
| Reduced motion                                                   | Implemented | Still frame; looping CSS animation off                                 |
| Stops off screen and in hidden tabs                              | Implemented |                                                                        |
| Header, Products menu, mobile menu                               | Implemented |                                                                        |
| Theme switch                                                     | Implemented | The **light** parent theme works but its look has not been approved    |
| Sign up / Log in                                                 | Foundation  | Dialog opens; form disabled because accounts are not connected         |

## B. AI Tools Directory

| Item                                                                             | State       | Notes                                            |
| -------------------------------------------------------------------------------- | ----------- | ------------------------------------------------ |
| `/directory` `/tools` `/categories` `/guides` `/prompts` `/workflows` `/compare` | Implemented | Existing pages, own layout, URLs unchanged       |
| Navigation between sections                                                      | Implemented |                                                  |
| Tool card, listing and detail pages, search and filters                          | Implemented | Pre-existing, kept working                       |
| Data                                                                             | Sample only | Fictional records, labeled "Sample"; no database |
| `/deals`, `/voicehub`                                                            | Kept        | Reachable by URL, not linked from navigation     |

## C. AutoFlow AI

| Item                         | State       | Notes                                                               |
| ---------------------------- | ----------- | ------------------------------------------------------------------- |
| `/autoflow` landing          | Implemented | States clearly that no stage can be run yet                         |
| Workspace access             | Implemented | Sign-in required; verified with real accounts                       |
| Workspace layout, navigation | Implemented |                                                                     |
| Project list and detail      | Foundation  | Read real projects of the signed-in user; "New project" is disabled |
| Six-stage structure          | Foundation  | In code and in the database; no stage does anything                 |
| AI integrations              | Not started | None connected, none simulated                                      |

## D. Accounts

| Item                                          | State                                | Notes                                                                                                                   |
| --------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Log in, log out, session persistence          | Implemented                          | Verified against the real project                                                                                       |
| Sign-up                                       | Implemented, not verified end to end | Creates the account and sends a confirmation email through Supabase; needs SMTP and site URL settings before public use |
| Shared identity across products               | Implemented                          | One session on the parent site, Directory and AutoFlow                                                                  |
| Profile and workspaces                        | Implemented                          | Created automatically; shown on `/account` (read-only)                                                                  |
| Row level security                            | Implemented                          | 20 tables, all with RLS; cross-user isolation verified                                                                  |
| Password reset, email change, profile editing | Not started                          |                                                                                                                         |

## E. UI system

Shared primitives (`Button`, `Badge`, `Input`, `Sheet`), `Container`, tokens per product, the
account dialog, the theme control. The parent homepage uses its own scoped stylesheet rather than
the primitives, to match the approved design exactly.

## F. Database and backend

Migrations 0001–0007 are applied to the Supabase project (Sydney). The catalog tables (0001–0005)
are empty; the Directory still reads sample data. No backend service.

## Files

About 100 files changed against `0a2c613`. New areas: `src/app/(parent)`, `src/app/(directory)`
(moved), `src/app/(autoflow)`, `src/components/{parent,autoflow,auth,product}`, `src/lib/{auth,autoflow}`,
`src/config/products.ts`, `src/styles/parent.css`, `supabase/migrations/0006_*`, `scripts/qa/`,
`docs/phase-1/`.
