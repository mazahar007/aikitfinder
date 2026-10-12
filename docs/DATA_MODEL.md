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

## Deals (Phase 2)

Types: `Deal`, `DealType`, `DealEligibility`, `DealStatus` in
`src/lib/content/types.ts`. SQL draft: `supabase/migrations/0002_deals_schema.sql`
(not applied anywhere).

- **Offer types:** free credits, discount, coupon, free trial.
- **Eligibility:** anyone, students, educators, developers, startups,
  nonprofits. Notes and region limits are free text from the provider's terms.
  The UI always says that being listed does not mean a visitor qualifies.
- **Amounts and dates** are optional and set only when the provider states them.
  Missing means "Not stated", never a guess.
- **Status is derived, not stored** (`src/lib/content/deal-status.ts`):
  1. an end date in the past is **Expired**;
  2. not verified, or not re-checked in the last 60 days, is **Needs
     verification** (even if the dates look fine);
  3. a verified offer before its start date is **Upcoming**;
  4. otherwise **Active**.
     So an offer cannot stay "active" after it ends or after we stop checking it.
     The sample offers will drift to "Needs verification" over time for this reason.
- **Visibility:** `/deals` hides expired offers by default (a link shows them).
  Expired and unconfirmed offer pages are `noindex` and left out of the sitemap.
  Sample offers are never in the sitemap.
- **Affiliate links** are labelled on the card and disclosed on the offer page,
  and get `rel="sponsored"`.
- **Admin-only notes** (`admin_notes`) are hidden from visitors with
  column-level privileges in the SQL draft, so public queries must list columns
  instead of using `select *`.
- The deals list is cached for an hour (`"use cache"`) because status depends on
  today's date.

## Checks run for Phase 2

- `pnpm check` and `pnpm build` pass.
- The status rules were run against 11 cases (boundaries such as "ends today",
  60 vs 61 days since the last check, unverified offers with future start dates)
  using a throwaway script; this repo has no test runner yet, so the script is
  not committed.
- Playwright (desktop 1280px and mobile 375px): default list, each filter, the
  expired view, empty state, coupon copy button, all warning banners, tool page
  offers, no horizontal overflow, no console errors.
- Both SQL migrations loaded into a temporary PostgreSQL 16, then were deleted.
  Verified: bad date order, "verified" without a date, empty eligibility and a
  non-http claim link are rejected; a public role sees only published offers and
  cannot read `admin_notes`, use `select *`, or write.

## Comparison (Phase 3)

`/compare?tools=a,b,c,d` shows two to four tools side by side. The URL is the
source of truth, so a comparison can be shared and works without JavaScript.

- **Rows** (`src/components/compare/compare-table.tsx`): category, skill level,
  best for, audience; pricing model, free plan, free trial, pricing note;
  platforms, public API, official docs; inputs, outputs, features, limitations;
  verification status and date, official site, sources. Every value comes from
  existing tool fields. A missing value shows "Not verified yet", never a guess.
- **No scores, ratings, stars or winner.** The page says so. Differences are
  shown by a "Show differences only" toggle that hides rows where every tool has
  the same value (an all-unknown row counts as the same).
- **Picking tools:** the "Compare" button on tool cards (tools list, categories,
  alternatives and similar tools) and tool pages adds to a tray at the bottom of
  the screen. The tray is kept in the browser tab's sessionStorage (up to four
  tools; nothing is sent to a server) and is hidden on `/compare`, where the URL
  replaces it. The picker form on `/compare` adds tools too.
- **Limits:** more than four slugs are cut to four with a notice; unknown or
  repeated slugs are ignored.
- **SEO:** every comparison is `noindex, follow` with canonical `/compare`, and
  `/compare` is not in the sitemap (each selection would be a thin page).
- **Accessibility:** a real table with caption, column and row headers; the
  scroll area is keyboard-focusable; the button uses `aria-pressed`; the tray
  announces counts politely; remove links name the tool.
- **Mobile:** the table scrolls sideways inside its own region with the row
  labels pinned on the left. Screen-reader-only text is contained in that region
  (`relative`), because otherwise it widened the whole page.

Not built on purpose: star ratings and 5-level "Basic/Good/Excellent" scores from
the reference screenshots (they would be unverified opinions), PDF export (needs a
new dependency), and plan-level prices (that is the pricing tracker phase).

## Checks run for Phase 3

- `pnpm check` and `pnpm build` pass.
- Playwright on desktop (1280px) and mobile (375px): picking tools from cards,
  the 4-tool limit, persistence across pages, the tray's "Compare now" state,
  opening `/compare`, 23 table rows (18 data rows), differences-only toggle,
  removing and adding tools, 5 slugs cut to 4, one-tool prompt, example pairs,
  the tool-page link, `noindex`, keyboard toggle with Space, dark mode, no
  console errors, no horizontal page overflow. Two bugs found and fixed during
  testing: the mobile page overflow above, and tray chips whose names collapsed
  on narrow screens.
- Not tested: screen readers, and browsers other than Chromium.

## Pricing tracker (Phase 4)

Types: `ToolPricing`, `PricingPlan`, `BillingInterval` in
`src/lib/content/types.ts`; rules in `src/lib/content/pricing.ts`; SQL draft in
`supabase/migrations/0003_pricing_schema.sql` (not applied anywhere). The manual
update steps are in `docs/PRICING_UPDATE_WORKFLOW.md`.

- Each tool can have `pricing`: plans (name, price, currency, interval, notes,
  usage limits, contact-sales), the official pricing URL, an optional API pricing
  URL, `checkedAt` and a verification status. Prices are never guessed: a missing
  price is "Price not stated" or "Contact sales".
- **Freshness is derived from today's date**, not stored: unverified pricing is
  hidden, verified pricing older than 60 days shows with an out-of-date warning,
  and only current pricing feeds the filters and the Compare row. Reading the
  clock goes through a cached `getToday()` (one-hour cache) because static
  prerendering cannot read it directly.
- **Tool page:** new "Pricing" section (plan cards, limits, last-checked badge,
  official links, a "prices can change" note).
- **Directory filters:** "Has a free plan", "Pay as you go", and a budget radio
  (up to $10 / $25 / $50 a month, USD). Counts follow the existing facet logic;
  active-filter chips and the mobile sheet include them. An invalid `budget`
  value in the URL is ignored.
- **Compare:** a "Plans and prices" row shows current plans, or says the figures
  are not current because they were last checked on a given date.
- The older `pricingModel`, `freePlan` and `pricingNote` fields stay as short
  summaries; plan-level data is the detailed source.
- Not built (by design): scraping or automated monitoring, price-change history
  (left for later), currency conversion, and a "cheapest tool" ranking.

## Checks run for Phase 4

- `pnpm check` and `pnpm build` pass.
- 29 pricing-rule cases passed in a throwaway script (freshness at 60 vs 61 days,
  yearly price divided by 12, usage/one-time/other-currency/contact-sales
  excluded from budget, stale and unverified pricing never matching a filter,
  price formatting). This repo has no test runner yet, so the script is not
  committed.
- Playwright (desktop 1280px and mobile 375px): tool pages for fresh, stale,
  unverified, missing, contact-sales and pay-as-you-go pricing; every new filter
  by URL and through the sidebar / mobile sheet; filter chips and their count;
  the Compare row; an invalid budget; no console errors, no horizontal overflow.
- A visual check found a contradiction (a green "Verified" badge beside the
  out-of-date warning); stale pricing now shows an amber badge. Two filter group
  titles were also renamed because they read almost identically.
- The three SQL migrations loaded into a temporary PostgreSQL 16 and were then
  deleted. Rejected: paid plan without currency or interval, negative price,
  lowercase currency code. A public role sees plans only for verified pricing of
  published tools and cannot read `admin_notes`. The foreign key that forces a plan
  to belong to a pricing record is declared but was not separately exercised.

## Prompt library (Phase 5)

Types: `Prompt`, `PromptVariable` in `src/lib/content/types.ts`; helpers in
`src/lib/content/prompt-utils.ts` and `prompt-query.ts`; SQL draft in
`supabase/migrations/0004_prompts_schema.sql` (not applied anywhere).

- **Pages:** `/prompts` (search, category, skill level and "works with" filters,
  pagination) and `/prompts/[slug]`.
- **One library:** original sample prompts (`sample/prompts.ts`) plus the prompts
  written on tool pages, turned into library entries by `getPrompts()`. A tool
  page links each of its prompts to the library page with the same slug, and
  site search now sends prompt hits to the library page.
- **Fill in the blanks:** every `[name]` in a prompt becomes an input
  (`PromptPlayground`). The preview shows filled values and highlights blanks
  still empty; "Copy prompt" copies the finished text, leaving empty blanks as
  `[name]`. Values stay in the page (nothing is sent anywhere), and replacement
  is literal, so values containing `$&` or `[brackets]` are copied as typed.
- **Each prompt page shows:** the prompt, instructions, expected result, an
  example output (always labelled "Illustrative example, not a guaranteed
  result"), cautions, the tools it is known to suit, related guides and
  prompts, author, origin, last-reviewed date and tested status.
- **Honesty rules:** "Tested" is true only if someone ran the prompt and checked
  the result (the database refuses `tested` without a review date). All sample
  prompts are untested. Tool compatibility is listed only for checked tools; an
  empty list says it is not confirmed. Prompts are original, not copied from
  other collections; the page says so.
- **Not built yet (later in the roadmap):** accounts, saved prompts, private
  collections, user submissions, prompt version comparison.

### Header change that came with it

The sixth top-nav link (Prompts) made the header 163px wider than a 768px
screen. The full navigation now starts at 1024px; below that the menu button is
used. Verified at 360, 600, 768, 900, 1023, 1024, 1100, 1280 and 1440px: no
overflow, same header height.

### Sample data correction

Sample prompts on the fictional tools were marked "Tested". A fictional tool
cannot have been tested, so they are now "Untested", matching the library rule.

## Checks run for Phase 5

- `pnpm check` and `pnpm build` pass.
- 11 cases for the placeholder and fill logic passed in a throwaway script
  (repeated blanks, empty values, trimming, values containing blanks or `$&`,
  mismatched variable lists). This repo has no test runner yet, so it is not
  committed.
- Playwright at 1280, 768 and 375px: list, page 2, search, each filter, invalid
  parameters ignored, empty state, the fill-in form (labels, counter, copy with
  filled and unfilled blanks, reset, special characters, keyboard typing), the
  example-output label, tool-derived prompts, the tool-page link, site search, no
  console errors, no overflow (after the header fix).
- The four SQL migrations loaded into a temporary PostgreSQL 16, then were
  deleted. Rejected: `tested` without a review date, a bad slug, a variable name
  containing brackets. A public role sees only published prompts, only links to
  published tools, and cannot read `admin_notes`.
- Not tested: screen readers, and browsers other than Chromium.
