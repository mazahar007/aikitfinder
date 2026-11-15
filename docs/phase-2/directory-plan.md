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

## 4. Access (revised 15 Nov 2026)

The login-for-everything rule was withdrawn. The Directory is hybrid: public, indexable
discovery pages and a private signed-in workspace. Routes, protection, SEO and open questions
are in `access-and-seo-strategy.md`.

## 5. Build order

1. Design pass for home, list, detail (approval).
2. Identity tokens; visual check at eleven widths.
3. Guides table; switch reads to the database behind `directory_source`.
4. Admin: categories, tools, pricing, sources, publish and verify.
5. Search and suggestions.
6. Favorites, collections, recently viewed.
7. Public and private route groups, redirects and SEO plumbing, per `access-and-seo-strategy.md`.
8. Indexing switched on only when real content exists.
