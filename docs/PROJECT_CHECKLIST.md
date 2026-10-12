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

## Core website (Phase 2)

- [ ] Homepage (shell and hero done; categories, featured tools and guides pending)
- [ ] Tool directory
- [ ] Category pages
- [ ] Tool detail page
- [ ] Guide page
- [ ] Search results
- [ ] Related content

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

- The shadcn/ui CLI could not reach its registry from the development container. Components were
  written by hand in the same structure using the same libraries (Radix, cva). The CLI can add more
  components later from a normal machine.
- Placeholder pages are clearly labelled "In progress". Privacy and Terms must be written before
  public launch.
