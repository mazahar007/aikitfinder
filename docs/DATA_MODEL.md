# Data model (catalog)

The TypeScript types in `src/lib/content/types.ts` are the source of truth for
the UI. `supabase/migrations/0001_catalog_schema.sql` is the matching database
draft. It is **not applied anywhere yet**; it was run only against a throwaway
local PostgreSQL 16 to check that it loads and that its constraints and row
level security behave (see "Checks" below).

## Rules that apply to every record

- Unknown means unknown. Optional fields (`pricingModel`, `apiAvailable`,
  `platforms`, `freeTrial`, ...) stay empty until a reliable source confirms
  them, and the UI shows "Not verified yet".
- A record may only be `verified` if it has a `lastVerifiedAt` date (enforced
  by a database constraint).
- Sample records are fictional, carry `isSample: true`, show a "Sample" label
  and are left out of the sitemap.
- Imports and new records start as `draft`; only `published` rows are visible
  to visitors.

## Categories and subcategories

- One level of subcategories: `Category.parentSlug` (`parent_id` in SQL).
- A tool in a subcategory lists both the parent and the child slug in
  `categorySlugs`, parent first. The first slug is the primary category used
  for breadcrumbs, so parent pages and counts include the tool automatically.
- The homepage, category index and filters list top-level categories only
  (`getCategories`). `getAllCategories` returns everything for routes, names
  and the sitemap; `getSubcategories(parent)` feeds the chips on a parent page.

## Tool fields added in Phase 1a

| Field              | Meaning                                                                                                        |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `platforms`        | Where it runs (web, desktop, iOS, Android, browser extension, API); verified.                                  |
| `freeTrial`        | Trial length and whether a card is needed, as the official site states it.                                     |
| `pricingNote`      | Short summary with its own source URL and check date. Plan-level pricing arrives in the pricing tracker phase. |
| `alternativeSlugs` | Editorial alternatives. Directional, only set from reliable knowledge.                                         |

## "Beginner-friendly" rubric

The Beginner-friendly filter is `skillLevel === "beginner"`. A tool gets
`beginner` only when all of these hold, judged from its official site:

1. A new user can produce a first result without installing software or
   writing code.
2. There is a free plan, trial or demo, or the cost is clear before sign-up.
3. The official site offers a getting-started guide, template or tutorial.

Otherwise it is `intermediate` (some setup, or concepts the tool does not
explain) or `advanced` (code, APIs, self-hosting). The level is an editorial
judgement, not a score, and is never shown as a rating.

## Checks run for 1a

- `pnpm check` (lint, typecheck, format) passes.
- The SQL migration loaded cleanly into a temporary PostgreSQL 16 and was
  then deleted. Verified: a subcategory cannot have a subcategory; a
  `verified` tool without a date is rejected; invalid slugs are rejected; a
  read-only visitor role sees only `published` tools and cannot insert.
- Supabase-specific behaviour (its `anon` / `authenticated` roles, `auth`
  schema) is not tested yet; that happens in 1b with a real project.
