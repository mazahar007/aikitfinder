import type { DealView } from "@/lib/content/deal-status";
import { dealEligibilities, dealTypes } from "@/lib/content/labels";
import { queryTerms, scoreDocument } from "@/lib/content/text-match";
import type { DealEligibility, DealStatus, DealType } from "@/lib/content/types";

export const DEALS_PAGE_SIZE = 9;

/** "current" hides expired offers; everything else matches one status. */
export const dealStatusFilters = {
  current: "Current offers",
  active: "Active",
  upcoming: "Upcoming",
  "needs-verification": "Needs verification",
  expired: "Expired",
  all: "All offers",
} as const;

export type DealStatusFilter = keyof typeof dealStatusFilters;

export type DealQuery = {
  q: string;
  type?: DealType;
  eligibility?: DealEligibility;
  provider?: string;
  status: DealStatusFilter;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads /deals URL parameters, ignoring anything invalid. */
export function parseDealQuery(params: RawParams, providers: string[]): DealQuery {
  const type = first(params.type);
  const eligibility = first(params.for);
  const provider = first(params.provider);
  const status = first(params.status);
  const page = Number.parseInt(first(params.page) || "1", 10);
  return {
    q: first(params.q).trim().slice(0, 100),
    type: dealTypes.includes(type as DealType) ? (type as DealType) : undefined,
    eligibility: dealEligibilities.includes(eligibility as DealEligibility)
      ? (eligibility as DealEligibility)
      : undefined,
    provider: providers.includes(provider) ? provider : undefined,
    status: status in dealStatusFilters ? (status as DealStatusFilter) : "current",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function dealQueryHref(query: DealQuery, overrides: Partial<DealQuery> = {}) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.type) params.set("type", next.type);
  if (next.eligibility) params.set("for", next.eligibility);
  if (next.provider) params.set("provider", next.provider);
  if (next.status !== "current") params.set("status", next.status);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/deals?${qs}` : "/deals";
}

export function hasActiveDealFilters(query: DealQuery) {
  return !!(
    query.q ||
    query.type ||
    query.eligibility ||
    query.provider ||
    query.status !== "current"
  );
}

function statusMatches(state: DealStatus, filter: DealStatusFilter) {
  if (filter === "all") return true;
  if (filter === "current") return state !== "expired";
  return state === filter;
}

/** Sort: active first, then upcoming, needs verification, expired; then soonest end date. */
const stateOrder: Record<DealStatus, number> = {
  active: 0,
  upcoming: 1,
  "needs-verification": 2,
  expired: 3,
};

export function runDealQuery(deals: DealView[], query: DealQuery) {
  const terms = queryTerms(query.q);
  const matched = deals.filter((d) => {
    if (!statusMatches(d.state, query.status)) return false;
    if (query.type && d.type !== query.type) return false;
    if (query.eligibility && !d.eligibility.includes(query.eligibility)) return false;
    if (query.provider && d.provider !== query.provider) return false;
    if (terms.length) {
      const score = scoreDocument(
        terms,
        [
          { text: d.title, weight: 10 },
          { text: d.provider, weight: 8 },
          { text: d.summary, weight: 3 },
          { text: d.eligibilityNotes, weight: 1 },
        ],
        "strict",
      );
      if (score <= 0) return false;
    }
    return true;
  });
  matched.sort((a, b) => {
    if (stateOrder[a.state] !== stateOrder[b.state])
      return stateOrder[a.state] - stateOrder[b.state];
    // Offers ending soonest first; offers with no end date last.
    const ea = a.endsOn ?? "9999-12-31";
    const eb = b.endsOn ?? "9999-12-31";
    return ea.localeCompare(eb) || a.title.localeCompare(b.title);
  });

  const total = matched.length;
  const pageCount = Math.max(1, Math.ceil(total / DEALS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: matched.slice((page - 1) * DEALS_PAGE_SIZE, page * DEALS_PAGE_SIZE),
    total,
    page,
    pageCount,
  };
}
