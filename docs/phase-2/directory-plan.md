# Phase 2 Step 1 — AI Tools Directory Plan

15 Nov 2026. A plan. The "Existing" column is what the repository does today.

## 1. Identity to apply

The approved Directory identity (identity board, `docs/phase-0a/visual-proposal/`) has not been
applied yet; the Directory still uses its earlier light blue theme.

| Element  | Approved                                                   |
| -------- | ---------------------------------------------------------- |
| Base     | Deep teal-navy `#0B2533` → `#091629`                       |
| Accents  | Cyan `#5FE3EF`, teal `#2DD4BF`, sky `#38BDF8`              |
| Type     | Inter Tight (400 for headings; denser text, more metadata) |
| Motif    | Editorial ruled grid; the search field is the hero         |
| Density  | High: many cards, filters, tables                          |
| Not used | AutoFlow's violet; the parent site's mist and glow         |

How: a new token block for `data-product="directory"` in `src/app/globals.css`, the same
mechanism the parent and AutoFlow already use, so the existing components restyle without being
rewritten. The light theme stays available (decision F-02: Directory follows the saved or system
preference) and needs its own token set in the same hues.

Open point: there is no screen-level Directory design, only the identity board. A short design
pass for the home, list and detail screens should be approved before implementation.

## 2. Features

| Feature                      | Existing                                                                          | Planned                                                                                            | Depends on          |
| ---------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------- |
| Directory homepage           | Built on sample data, old theme, GSAP scenes                                      | Search-first hero, categories, recently verified, featured; new identity                           | Design pass         |
| Search                       | In-memory match over sample data; tabs by type                                    | PostgreSQL full-text search with ranking across tools, guides, prompts, workflows                  | Catalog in database |
| Search suggestions           | None                                                                              | As-you-type suggestions (tools, categories, recent searches); keyboard support                     | Search API          |
| Advanced filters             | Category, level, pricing model, API, free plan, pay-as-you-go, budget; URL-driven | Add platform, verified-only, last-verified range, features; saved filter sets                      | —                   |
| Categories, subcategories    | One level of subcategories; counts                                                | Same structure; admin-managed order and visibility                                                 | Admin               |
| Tool details                 | Overview, pricing, sources, alternatives, related guides and workflows            | Add features list, changelog of verification, "report an error"                                    | —                   |
| Pricing information          | Plans, intervals, verified fields; column-limited in the database                 | Admin entry with source link and verified date per plan                                            | Admin               |
| Comparison, up to 4          | Built (`COMPARE_MAX = 4`), session storage                                        | Keep; optionally save a comparison to a collection                                                 | Library             |
| Favorites                    | None                                                                              | One click on any card or detail page                                                               | Library tables      |
| Collections                  | None                                                                              | Named private lists of tools, guides, prompts, workflows                                           | Library tables      |
| Recently viewed              | None                                                                              | Last 50 per user, shown on the home page                                                           | Library tables      |
| Guides                       | Built on sample data; **no database table**                                       | Table and admin editor                                                                             | Migration           |
| Prompts                      | Built, with variable playground                                                   | Real data; admin editor                                                                            | Admin               |
| Workflows                    | Built, with steps and alternatives                                                | Real data; admin editor                                                                            | Admin               |
| Admin tool management        | None                                                                              | Create, edit, archive, publish; see `admin-panel-specification.md`                                 | RBAC, admin API     |
| Official source verification | `tool_sources` table; "Sources" list; verification badge                          | A tool cannot be published as "verified" without at least one official source URL and a check date | Admin               |
| Last verified dates          | `checked_at` fields exist in the schema                                           | Shown on cards and detail pages; "needs review" after a set age                                    | Admin               |
| Deals                        | Built, unlinked                                                                   | Stays unlinked; no work planned                                                                    | Owner decision      |

## 3. Truthfulness rules (unchanged)

- Sample records stay labeled "Sample" and are never shown as verified.
- When the database source is switched on, sample data is not copied into it. The database
  starts empty and is filled only with real tools entered through the admin panel.
- A tool shows "Verified" only when an editor has recorded an official source and a date.
- No tool counts in marketing copy until they are real.
- AI providers set their own prices; the Directory shows the price, its source and the date.

## 4. Login requirement

Under the new requirement every Directory route needs a signed-in account. Design:

| Layer     | Mechanism                                                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Routing   | `proxy.ts` redirects a visitor without a session cookie from Directory paths to `/` with the sign-in dialog and the destination preserved  |
| Rendering | The Directory layout verifies the session on the server, the same way the AutoFlow workspace does today; pages render only after it passes |
| Data      | Catalog policies change from public read to signed-in read                                                                                 |
| API       | Every Directory endpoint requires a valid token                                                                                            |

Consequences to confirm before this is built:

1. It reverses the earlier decision that the Directory is browsable without an account.
2. The approved FAQ answer ("…is free and does not require an account") and the hero status line
   "Browsing the directory needs no account" become false and must be reworded.
3. Search engines cannot index a login-only Directory.
4. Directory pages stop being prerendered; each view becomes a server render.

Not implemented in this step.

## 5. Build order

1. Design pass for home, list, detail (approval).
2. Identity tokens; visual check at eleven widths.
3. Guides table; switch reads to the database behind `directory_source`.
4. Admin: categories, tools, pricing, sources, publish and verify.
5. Search and suggestions.
6. Favorites, collections, recently viewed.
7. Login requirement (once confirmed), FAQ and status-line wording.
