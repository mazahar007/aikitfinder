# Phase 2 — Access and SEO Strategy (revised)

15 Nov 2026. Owner decision of this date. It **replaces** the earlier rule that every Directory
route requires login. This document records the decision, maps it onto the existing site, and
lists what must be settled before routes change. Nothing in it has been implemented: no route,
redirect, sitemap or homepage change has been made.

## 1. The decision

| Area                | Rule                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------ |
| Parent homepage     | Public                                                                               |
| Directory discovery | Public, indexable, same content for crawlers and visitors                            |
| Directory workspace | Login required; personal data never public                                           |
| AutoFlow AI         | All application and project routes require login, enforced on the server             |
| Account             | One shared Supabase account across the parent site, Directory workspace and AutoFlow |
| Cloaking            | None. No crawler-specific content                                                    |

This restores, and extends, decision F-01/F-03: public Directory browsing needs no account. The
approved FAQ answer and the hero status line stay true and need no rewording.

## 2. Route map

### Public and indexable

| Target route          | Today                                   | Change                                              |
| --------------------- | --------------------------------------- | --------------------------------------------------- |
| `/ai-tools`           | `/tools` (list); `/directory` (landing) | New address for the public discovery home and list  |
| `/ai-tools/[slug]`    | `/tools/[slug]`                         | New address                                         |
| `/categories/[slug]`  | Exists                                  | None                                                |
| `/best-ai-tools`      | Does not exist                          | New editorial page type                             |
| `/comparisons/[slug]` | Does not exist                          | New editorial page type: fixed, written comparisons |
| `/guides/[slug]`      | Exists                                  | None                                                |
| `/prompts`            | Exists                                  | None                                                |
| `/workflows`          | Exists                                  | None                                                |

### Private (login required)

| Target route             | Today                                     | Change                               |
| ------------------------ | ----------------------------------------- | ------------------------------------ |
| `/directory`             | Public Directory landing page             | Becomes the signed-in workspace home |
| `/directory/favorites`   | Does not exist                            | New                                  |
| `/directory/collections` | Does not exist                            | New                                  |
| `/directory/compare`     | `/compare` (public, interactive, up to 4) | Moves; saved comparisons live here   |
| `/directory/workspace`   | Does not exist                            | New                                  |
| `/directory/settings`    | Does not exist                            | New                                  |
| `/autoflow/app/*`        | Already login-only                        | None                                 |
| `/account/*`             | Prompts for login                         | None                                 |

### Existing routes the decision does not name

| Route                                  | Proposed handling                                                          |
| -------------------------------------- | -------------------------------------------------------------------------- |
| `/tools`, `/tools/[slug]`              | Permanent redirect (308) to `/ai-tools…`, so no existing link breaks       |
| `/compare`                             | Redirect to `/directory/compare` (which asks for login)                    |
| `/categories`, `/guides`               | Keep public: they are the index pages that link to the listed detail pages |
| `/prompts/[slug]`, `/workflows/[slug]` | Keep public: the listed index pages link to them                           |
| `/search`                              | Keep public, `noindex` (search result pages should not be indexed)         |
| `/autoflow` (landing)                  | Keep public: it is marketing, not application. To confirm                  |
| `/deals`, `/voicehub`                  | Unchanged: unlinked, `noindex`                                             |

Changing `/tools` to `/ai-tools` and repurposing `/directory` reverses part of decision F-01
("`/tools` and every existing URL are preserved"). Redirects keep old links working, but the
change needs the owner's explicit confirmation.

## 3. Protection design

| Layer      | Public routes                                   | Private routes                                                                       |
| ---------- | ----------------------------------------------- | ------------------------------------------------------------------------------------ |
| Proxy      | Pass through                                    | No session cookie → redirect to `/` with the sign-in dialog and the destination kept |
| Layout     | Static or cached render; no session read        | Session verified on the server before any page renders (the AutoFlow pattern)        |
| Data       | Published catalog rows only (existing policies) | Owner-only row level security                                                        |
| Python API | Read endpoints open, rate-limited               | Valid token required; ownership checked                                              |
| Response   | No per-user data in the HTML                    | `private, no-store`; `noindex`                                                       |

Two route groups replace today's single `(directory)` group: a public one with the discovery
header and a private one with the workspace shell. A public page may show a "Save" button, but
the saved state is loaded after the page, from the signed-in user's own request, so the cached
public HTML never contains anything personal.

## 4. SEO design

| Item             | Design                                                                                                                                                                                                                                   |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Rendering        | Static generation with revalidation for detail and list pages; no client-only content                                                                                                                                                    |
| Metadata         | Unique title and description per page from the record; Open Graph and Twitter cards                                                                                                                                                      |
| Canonical        | Every public page declares its own canonical URL; filtered list views point to the unfiltered page                                                                                                                                       |
| Sitemap          | Generated from published, real records only; public routes only; never a `/directory/*`, `/autoflow/app/*` or `/account/*` URL                                                                                                           |
| Robots           | Allow public routes; disallow private prefixes; private pages also send `noindex`                                                                                                                                                        |
| Structured data  | `BreadcrumbList` everywhere; `SoftwareApplication` on tool pages (price and rating only when sourced); `ItemList` on lists; `HowTo` on guides; `Article` on comparisons and best-of pages; `Organization` and `WebSite` on the home page |
| Breadcrumbs      | Already present visually; add the structured form                                                                                                                                                                                        |
| Internal linking | Tool ↔ category ↔ alternatives ↔ guides ↔ workflows ↔ comparisons; best-of pages link to tools                                                                                                                                           |
| No cloaking      | One response for everyone; no user-agent checks anywhere                                                                                                                                                                                 |
| Private content  | Never in metadata, structured data, sitemap or cached HTML                                                                                                                                                                               |

## 5. State today

| Fact                                                                   | Effect                                                  |
| ---------------------------------------------------------------------- | ------------------------------------------------------- |
| The live site sends `Disallow: /` and `noindex` on every page          | Nothing is indexable now, by design                     |
| The sitemap is empty                                                   | Same                                                    |
| The database has 0 tools; the Directory shows fictional sample records | There is no real, verified content to index             |
| The sitemap code already excludes sample records                       | Sample content cannot reach a search engine by accident |
| No admin panel exists                                                  | Real tools cannot be entered through the product yet    |
| Favorites, collections and saved comparisons do not exist              | The private routes have nothing to show yet             |

## 6. Blockers and order

**Real content is the blocker for SEO.** Indexing must stay off until real, sourced tools are
published. Turning it on over sample data would put invented tools into search results.

Proposed order:

1. Confirm the route map and redirects (section 2) and the homepage button placement (section 7).
2. Route restructure: public and private groups, redirects, workspace shell with sign-in gate.
   Sample data stays labeled; indexing stays off.
3. SEO plumbing: canonical URLs, structured data, sitemap and robots rules, tested against the
   acceptance criteria.
4. Library tables and the private pages (favorites, collections, saved comparisons).
5. Real content: admin entry (needs the role system) or an owner-approved first batch.
6. Switch indexing on (`NEXT_PUBLIC_SITE_INDEXABLE=true`) once real pages exist.

## 7. Homepage buttons

| Button              | Leads to                       | Login |
| ------------------- | ------------------------------ | ----- |
| Explore AI Tools    | `/ai-tools`                    | No    |
| Open My Directory   | `/directory`                   | Yes   |
| Explore AutoFlow AI | AutoFlow (see open question 2) | Yes   |

The approved hero has two buttons, and the fish's route was measured around them. A third button
changes that layout. Proposal that leaves the hero's shape intact: the hero keeps its two
buttons with the new destinations; "Open My Directory" is added to the Directory product card
and the final call-to-action, and appears in the header for signed-in visitors. Needs approval.

## 8. Acceptance criteria and how each will be tested

| Criterion                                | Test                                                                                                                      |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Google can crawl public Directory pages  | Fetch without cookies: 200, full content in the HTML, no `noindex`, allowed in robots                                     |
| Private workspace routes require login   | Fetch without cookies: redirect to sign-in; no workspace HTML                                                             |
| AutoFlow routes require login            | Existing checks                                                                                                           |
| Public browsing works without an account | Browser journey, signed out, across all public routes                                                                     |
| Favorites and collections require login  | API and page checks with no token and with another user's token                                                           |
| Sitemap contains only public URLs        | Parse the sitemap; fail on any private prefix or sample record                                                            |
| No private content in public responses   | Sign in as a test user with saved items, then fetch public pages without cookies and search the HTML for that user's data |
| No cloaking                              | Fetch each public page as a browser and as Googlebot; compare the content                                                 |

## 9. Open questions

1. Confirm the route changes in section 2, including redirecting `/tools` and repurposing
   `/directory`.
2. AutoFlow: keep the public `/autoflow` landing page, with "Explore AutoFlow AI" leading to the
   sign-in gate at `/autoflow/app`? Or should the landing page itself require login?
3. Homepage: approve the button placement in section 7, or ask for three hero buttons.
4. Real content: who supplies the first real tools, and how many? `/best-ai-tools` and
   `/comparisons/[slug]` are written editorial pages and need real content too.
