import { skillLevels } from "@/lib/content/labels";
import { queryTerms, scoreDocument, type MatchMode } from "@/lib/content/text-match";
import type { Category, Prompt, SkillLevel, Tool } from "@/lib/content/types";

export const PROMPTS_PAGE_SIZE = 9;

export type PromptQuery = {
  q: string;
  category?: string;
  level?: SkillLevel;
  tool?: string;
  page: number;
};

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads /prompts URL parameters, ignoring anything invalid. */
export function parsePromptQuery(
  params: RawParams,
  valid: { categories: string[]; tools: string[] },
): PromptQuery {
  const category = first(params.category);
  const level = first(params.level);
  const tool = first(params.tool);
  const page = Number.parseInt(first(params.page) || "1", 10);
  return {
    q: first(params.q).trim().slice(0, 100),
    category: valid.categories.includes(category) ? category : undefined,
    level: skillLevels.includes(level as SkillLevel) ? (level as SkillLevel) : undefined,
    tool: valid.tools.includes(tool) ? tool : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function promptQueryHref(query: PromptQuery, overrides: Partial<PromptQuery> = {}) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.category) params.set("category", next.category);
  if (next.level) params.set("level", next.level);
  if (next.tool) params.set("tool", next.tool);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/prompts?${qs}` : "/prompts";
}

export function hasActivePromptFilters(query: PromptQuery) {
  return !!(query.q || query.category || query.level || query.tool);
}

export function runPromptQuery(
  prompts: Prompt[],
  query: PromptQuery,
  categories: Category[],
  tools: Tool[],
) {
  const terms = queryTerms(query.q);
  const toolName = (slug: string) => tools.find((t) => t.slug === slug)?.name ?? "";
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? "";

  const score = (p: Prompt, mode: MatchMode) =>
    scoreDocument(
      terms,
      [
        { text: p.title, weight: 10 },
        { text: p.tags, weight: 6 },
        { text: p.useCase, weight: 5 },
        { text: p.toolSlugs.map(toolName), weight: 4 },
        { text: p.categorySlugs.map(categoryName), weight: 3 },
        { text: p.text, weight: 1.5 },
      ],
      mode,
    );

  const scoreAll = (mode: MatchMode) =>
    prompts
      .map((prompt) => ({ prompt, score: terms.length ? score(prompt, mode) : 1 }))
      .filter((s) => s.score > 0);
  // Strict text matching first; relax it only if nothing matches at all.
  const strict = scoreAll("strict");
  const scored = strict.length ? strict : scoreAll("relaxed");

  const filtered = scored.filter(({ prompt: p }) => {
    if (query.category && !p.categorySlugs.includes(query.category)) return false;
    if (query.level && p.skillLevel !== query.level) return false;
    if (query.tool && !p.toolSlugs.includes(query.tool)) return false;
    return true;
  });
  filtered.sort((a, b) => {
    if (terms.length && b.score !== a.score) return b.score - a.score;
    return (
      b.prompt.updatedAt.localeCompare(a.prompt.updatedAt) ||
      a.prompt.title.localeCompare(b.prompt.title)
    );
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PROMPTS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: filtered
      .slice((page - 1) * PROMPTS_PAGE_SIZE, page * PROMPTS_PAGE_SIZE)
      .map((s) => s.prompt),
    total,
    page,
    pageCount,
  };
}
