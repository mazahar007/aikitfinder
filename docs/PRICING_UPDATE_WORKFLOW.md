# Updating pricing by hand

Phase 4 starts with a manual workflow on purpose. Automated price monitoring can
come later, once the data model and the admin screens are proven (and only where a
provider's terms allow it). Until the admin CMS exists, pricing lives in the tool
records (`pricing` field in `src/lib/content/sample/tools.ts` today, the
`tool_pricing` and `pricing_plans` tables later).

## For each tool

1. Open the provider's **own** pricing page in a normal browser. Do not use
   third-party price lists, and do not scrape or script access to pages that
   forbid it.
2. Record each plan exactly as shown: name, price, currency, billing interval
   (`month`, `year`, `one-time`, `usage` for pay-as-you-go), and any qualifier
   ("per user", "billed annually") in `priceNote`.
3. Record usage or credit limits **only** if the page states them. Otherwise
   leave `usageLimits` empty; the page then says "Not stated".
4. If a plan has no public price, set `contactSales: true` and leave `price` empty.
   Never estimate a price.
5. Put the pricing page in `pricingUrl` (and an API pricing page in
   `apiPricingUrl` if there is one). Set `checkedAt` to today's date.
6. Set `verification` to `verified` only if you did steps 1-5 yourself on that
   date. If the page was unreachable, behind a login, or unclear, use
   `needs-review` or `unverified`; visitors then see "not verified yet" and no
   prices.

## What visitors see

| State             | Condition                                          | Shown                                                                                                                                                    |
| ----------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No pricing record | `pricing` missing                                  | "We haven't verified plans and prices yet" + official site link                                                                                          |
| Unverified        | `verification` is not `verified`                   | Same message; figures hidden                                                                                                                             |
| Stale             | verified, but `checkedAt` is more than 60 days ago | Figures with a "may be out of date" warning and an amber "needs review" badge; **never** used by the price filters or the Compare "Plans and prices" row |
| Current           | verified and checked within 60 days                | Figures, official links, last-checked date                                                                                                               |

The 60-day limit is `PRICING_STALE_AFTER_DAYS` in `src/lib/content/pricing.ts`.
Nobody has to remember to expire prices: they age out by themselves.

## Filter rules

- "Has a free plan" and "Pay as you go" match only current plans.
- "Budget (USD per month)" uses the cheapest current plan. Yearly prices are
  divided by 12. Plans in other currencies, one-time or usage-based prices, and
  plans with no stated price are not compared (there are no exchange rates and no
  fair monthly figure), so a tool with only those never matches a budget.
- Unknown pricing never matches any price filter.

## Planned CSV columns (for the CSV import phase)

One row per plan: `tool_slug`, `plan_name`, `price`, `currency`, `interval`,
`price_note`, `usage_limits`, `contact_sales`, `pricing_url`, `api_pricing_url`,
`checked_at`, `verification`. Imports arrive as `draft`/`needs-review`, never as
`verified`.
