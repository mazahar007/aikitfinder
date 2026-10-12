import { pricingModels, skillLevels } from "@/lib/content/labels";
import { BUDGET_OPTIONS, fitsBudget, hasFreePlan, hasPayAsYouGo } from "@/lib/content/pricing";
import { queryTerms, scoreDocument, type MatchMode } from "@/lib/content/text-match";
import type { Category, PricingModel, SkillLevel, Tool } from "@/lib/content/types";

export const TOOLS_PAGE_SIZE = 9;

export const toolSorts = {
  featured: "Featured first",
  updated: "Recently updated",
  name: "Name (A–Z)",
} as const;

export type ToolSort = keyof typeof toolSorts;

export type ToolQuery = {
  q: string;
  categories: string[];
  levels: SkillLevel[];
  pricing: PricingModel[];
  api: boolean;
  /** Has a verified, recently checked free plan. */
  freePlan: boolean;
  /** Has a verified, recently checked pay-as-you-go plan. */
  payg: boolean;
  /** Highest monthly price in USD, from BUDGET_OPTIONS. */
  budget?: number;
  sort: ToolSort;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .filter(Boolean);

/** Reads /tools URL parameters, ignoring anything invalid. */
export function parseToolQuery(params: RawParams, validCategories: string[]): ToolQuery {
  const sortParam = list(params.sort)[0];
  const page = Number.parseInt(list(params.page)[0] ?? "1", 10);
  return {
    q: (list(params.q)[0] ?? "").trim().slice(0, 100),
    categories: list(params.category).filter((c) => validCategories.includes(c)),
    levels: list(params.level).filter((l): l is SkillLevel =>
      skillLevels.includes(l as SkillLevel),
    ),
    pricing: list(params.pricing).filter((p): p is PricingModel =>
      pricingModels.includes(p as PricingModel),
    ),
    api: list(params.api)[0] === "yes",
    freePlan: list(params.freeplan)[0] === "yes",
    payg: list(params.payg)[0] === "yes",
    budget: BUDGET_OPTIONS.find((b) => String(b) === list(params.budget)[0]),
    sort: sortParam && sortParam in toolSorts ? (sortParam as ToolSort) : "featured",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Builds a /tools URL from a query, dropping defaults so links stay short. */
export function toolQueryHref(query: ToolQuery, overrides: Partial<ToolQuery> = {}) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  next.categories.forEach((c) => params.append("category", c));
  next.levels.forEach((l) => params.append("level", l));
  next.pricing.forEach((p) => params.append("pricing", p));
  if (next.api) params.set("api", "yes");
  if (next.freePlan) params.set("freeplan", "yes");
  if (next.payg) params.set("payg", "yes");
  if (next.budget) params.set("budget", String(next.budget));
  if (next.sort !== "featured") params.set("sort", next.sort);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/tools?${qs}` : "/tools";
}

export function hasActiveFilters(query: ToolQuery) {
  return (
    !!query.q ||
    query.categories.length > 0 ||
    query.levels.length > 0 ||
    query.pricing.length > 0 ||
    query.api ||
    query.freePlan ||
    query.payg ||
    query.budget !== undefined
  );
}

function toolTextScore(tool: Tool, terms: string[], categories: Category[], mode: MatchMode) {
  const categoryNames = tool.categorySlugs.map(
    (s) => categories.find((c) => c.slug === s)?.name ?? "",
  );
  return scoreDocument(
    terms,
    [
      { text: tool.name, weight: 10 },
      { text: tool.tags, weight: 6 },
      { text: tool.shortDescription, weight: 4 },
      { text: tool.useCases, weight: 4 },
      { text: categoryNames, weight: 3 },
      { text: tool.features, weight: 2 },
      { text: tool.overview, weight: 1.5 },
    ],
    mode,
  );
}

type Facet = "categories" | "levels" | "pricing" | "api" | "freePlan" | "payg" | "budget";

function matches(tool: Tool, query: ToolQuery, today: string, skip?: Facet) {
  if (skip !== "categories" && query.categories.length > 0) {
    if (!tool.categorySlugs.some((c) => query.categories.includes(c))) return false;
  }
  if (skip !== "levels" && query.levels.length > 0 && !query.levels.includes(tool.skillLevel)) {
    return false;
  }
  if (skip !== "pricing" && query.pricing.length > 0) {
    // Unverified pricing never matches a pricing filter.
    if (!tool.pricingModel || !query.pricing.includes(tool.pricingModel)) return false;
  }
  if (skip !== "api" && query.api && tool.apiAvailable !== true) return false;
  // Price filters only trust verified, recently checked plans.
  if (skip !== "freePlan" && query.freePlan && !hasFreePlan(tool, today)) return false;
  if (skip !== "payg" && query.payg && !hasPayAsYouGo(tool, today)) return false;
  if (skip !== "budget" && query.budget !== undefined && !fitsBudget(tool, today, query.budget)) {
    return false;
  }
  return true;
}

export type ToolQueryResult = {
  items: Tool[];
  total: number;
  page: number;
  pageCount: number;
  /** For each filter option, how many results it would give with the other filters applied. */
  facets: {
    categories: Record<string, number>;
    levels: Record<string, number>;
    pricing: Record<string, number>;
    api: number;
    freePlan: number;
    payg: number;
    budgets: Record<string, number>;
  };
};

export function runToolQuery(
  allTools: Tool[],
  query: ToolQuery,
  categories: Category[],
  /** Today's ISO date, used to decide whether pricing is recent enough to filter on. */
  today: string,
): ToolQueryResult {
  const terms = queryTerms(query.q);
  const scoreAll = (mode: MatchMode) =>
    allTools
      .map((tool) => ({
        tool,
        score: terms.length ? toolTextScore(tool, terms, categories, mode) : 1,
      }))
      .filter((s) => s.score > 0);
  // Strict text matching first; relax it only if nothing matches at all.
  const strict = scoreAll("strict");
  const scored = strict.length ? strict : scoreAll("relaxed");
  const textMatched = scored.map((s) => s.tool);

  const count = (skip: Facet, test: (t: Tool) => boolean) =>
    textMatched.filter((t) => matches(t, query, today, skip) && test(t)).length;

  const facets: ToolQueryResult["facets"] = {
    categories: Object.fromEntries(
      categories.map((c) => [c.slug, count("categories", (t) => t.categorySlugs.includes(c.slug))]),
    ),
    levels: Object.fromEntries(
      skillLevels.map((l) => [l, count("levels", (t) => t.skillLevel === l)]),
    ),
    pricing: Object.fromEntries(
      pricingModels.map((p) => [p, count("pricing", (t) => t.pricingModel === p)]),
    ),
    api: count("api", (t) => t.apiAvailable === true),
    freePlan: count("freePlan", (t) => hasFreePlan(t, today)),
    payg: count("payg", (t) => hasPayAsYouGo(t, today)),
    budgets: Object.fromEntries(
      BUDGET_OPTIONS.map((b) => [String(b), count("budget", (t) => fitsBudget(t, today, b))]),
    ),
  };

  const filtered = scored.filter((s) => matches(s.tool, query, today));
  filtered.sort((a, b) => {
    if (query.sort === "name") return a.tool.name.localeCompare(b.tool.name);
    if (query.sort === "updated") return b.tool.updatedAt.localeCompare(a.tool.updatedAt);
    // "featured": best text match first when searching, then featured, then name.
    if (terms.length && b.score !== a.score) return b.score - a.score;
    if (a.tool.featured !== b.tool.featured) return a.tool.featured ? -1 : 1;
    return a.tool.name.localeCompare(b.tool.name);
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / TOOLS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  const items = filtered
    .slice((page - 1) * TOOLS_PAGE_SIZE, page * TOOLS_PAGE_SIZE)
    .map((s) => s.tool);

  return { items, total, page, pageCount, facets };
}
