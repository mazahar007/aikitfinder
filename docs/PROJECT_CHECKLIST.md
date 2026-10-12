# Project checklist

Updated after each milestone. Mirrors section 18 of the master brief.

## Planning

- [x] Product brief reviewed
- [x] Existing repository inspected (empty; new project)
- [x] Working brand selected: AIKitFinder; preferred domain aikitfinder.com (registration not yet confirmed)
- [ ] Hosting and commercial-use terms checked
- [x] Initial sitemap proposed (approval pending with Phase 2 review)
- [x] Design direction approved (navy / blue / teal, Inter + JetBrains Mono, light and dark themes)

## Foundation (Phase 1)

- [x] Project setup documented (README)
- [x] Shared layout and design tokens created
- [x] Responsive shell completed (header, mobile menu, footer)
- [x] Light and dark themes (follows device setting, no flash, remembered choice)
- [x] Preview deployments kept out of search engines (`NEXT_PUBLIC_SITE_INDEXABLE`)
- [x] Environment variable template created (`.env.example`)
- [x] Lint / typecheck / format / build commands documented

## Core website (Phase 2: prototype on sample data)

- [x] Homepage (hero search, categories, featured tools, quick starts, workflows, recently updated)
- [x] Tool directory (search, filters with counts, sorting, pagination, active filter chips, mobile filter sheet)
- [x] Category pages (index and per category)
- [x] Tool detail page (at a glance, quick start, features, settings, prompts, limitations, troubleshooting, related, sources)
- [x] Guide pages (index grouped by level, numbered steps, expected result, mistakes, troubleshooting, sources)
- [x] Workflow pages (index and step-by-step detail with input/output per step)
- [x] Search results (tools, guides, workflows, prompts, settings, troubleshooting; type tabs; empty state)
- [x] Related content (guides, workflows and similar tools on tool pages)
- [x] Loading skeletons, empty states and a friendly error page
- [x] Motion system (page transitions, logo morph, scroll reveal, hero effects; reduced-motion safe)
- [x] Homepage showcase, step 1 (GSAP ribbons, story chapters with colour shifts, line-art drawing, outline marquee)
- [x] Homepage showcase, step 2 (cloud wipes, pinned featured rail, zoom card, closing CTA)
- [ ] Homepage showcase, step 3 (logo mascot, current-section chip)
- [ ] Owner review of the prototype

## Backend and admin (Phases 3–4)

- [ ] Database schema/migrations
- [ ] Seed/demo data
- [ ] Admin protection
- [ ] Tool CRUD
- [ ] Category CRUD
- [ ] Guide CRUD
- [ ] Publishing workflow
- [ ] Source and verification fields

## Import and search (Phases 5–6)

- [ ] CSV templates
- [ ] CSV preview and validation
- [ ] Duplicate detection
- [ ] Import confirmation
- [ ] Row-level error report
- [ ] Import logs
- [ ] Full-text search
- [ ] Filters and sorting

## Launch readiness (Phase 7)

- [ ] Initial content reviewed
- [ ] Official sources verified
- [ ] Mobile testing
- [ ] Accessibility basics checked
- [ ] Security review
- [ ] Backup/export tested
- [ ] SEO metadata and sitemap
- [ ] Domain and production deployment
- [ ] Privacy/terms/contact pages
- [ ] No demo placeholders presented as verified content

## Future phases (only on evidence)

- [ ] Analytics
- [ ] User accounts/bookmarks
- [ ] AI Guide Assistant
- [ ] Prompt Generator
- [ ] Workflow Builder
- [ ] Subscription and billing
- [ ] API integrations
- [ ] Team/B2B features

## Known limitations

- All tools, guides and workflows are fictional samples (`src/lib/content/sample/`) and are labelled
  "Sample" everywhere. Links use the reserved example.com domain.
- Unknown URLs such as `/tools/does-not-exist` show the not-found page but return HTTP 200 (with a
  `noindex` tag), because Next.js has already started streaming the page. Revisit in Phase 6 with a
  request-time check in Proxy.
- Search is a simple keyword matcher for the prototype; Phase 6 replaces it with PostgreSQL
  full-text search.

- The shadcn/ui CLI could not reach its registry from the development container. Components were
  written by hand in the same structure using the same libraries (Radix, cva). The CLI can add more
  components later from a normal machine.
- Placeholder pages are clearly labelled "In progress". Privacy and Terms must be written before
  public launch.

## Feature roadmap (AIKitFinder_Feature_Roadmap_for_Claude.md)

Followed in the file's own order. The roadmap file is not stored in the repo.

- [x] Phase 0: repository inspection and plan
- [ ] Phase 1: reliable AI tools directory
  - [x] 1a: data model fields, subcategories, alternatives, sitemap, SQL draft (docs/DATA_MODEL.md)
  - [ ] 1b: Supabase connection, typed data access, seed data, RLS (needs the owner's Supabase project)
  - [ ] 1c: database-backed search and filters
  - [ ] 1d: admin CMS
  - [ ] 1e: CSV import
  - [ ] 1f: real tool data, mobile and accessibility checks
- [ ] Phase 2: deals, credits, coupons, free trials
  - [x] Deals directory `/deals` and offer pages `/deals/[slug]` on labelled sample data (types, filters, derived status, claim guide, sources, disclosure)
  - [x] Offers shown on related tool pages; nav and sitemap updated
  - [x] SQL draft `0002_deals_schema.sql`
  - [ ] Admin tools to update, expire and review offers (needs the database and admin CMS, Phase 1b-1d)
  - [ ] Real, officially sourced offers (needs the real tool data step, Phase 1f)
- [ ] Phase 3: tool comparison
- [ ] Phase 4: pricing tracker
- [ ] Phase 5: prompt library
- [ ] Phase 6: workflow library
- [ ] Phase 7: accounts and personal workspace
- [ ] Phase 8: AI assistant, automation, integrations
- [ ] Phase 9: newsletter, partnerships, growth
