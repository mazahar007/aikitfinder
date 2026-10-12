import { skillLevels } from "@/lib/content/labels";
import { queryTerms, scoreDocument, type MatchMode } from "@/lib/content/text-match";
import type { SkillLevel, Tool, Workflow } from "@/lib/content/types";

export const WORKFLOWS_PAGE_SIZE = 9;

export type WorkflowQuery = { q: string; level?: SkillLevel; tool?: string; page: number };

type RawParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

/** Reads /workflows URL parameters, ignoring anything invalid. */
export function parseWorkflowQuery(params: RawParams, validTools: string[]): WorkflowQuery {
  const level = first(params.level);
  const tool = first(params.tool);
  const page = Number.parseInt(first(params.page) || "1", 10);
  return {
    q: first(params.q).trim().slice(0, 100),
    level: skillLevels.includes(level as SkillLevel) ? (level as SkillLevel) : undefined,
    tool: validTools.includes(tool) ? tool : undefined,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function workflowQueryHref(query: WorkflowQuery, overrides: Partial<WorkflowQuery> = {}) {
  const next = { ...query, ...overrides };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.level) params.set("level", next.level);
  if (next.tool) params.set("tool", next.tool);
  if (next.page > 1) params.set("page", String(next.page));
  const qs = params.toString();
  return qs ? `/workflows?${qs}` : "/workflows";
}

export function hasActiveWorkflowFilters(query: WorkflowQuery) {
  return !!(query.q || query.level || query.tool);
}

/** Slugs of every tool a workflow mentions, as a suggestion or as an alternative. */
export function workflowToolSlugs(workflow: Workflow): string[] {
  return [
    ...new Set(
      workflow.steps.flatMap((s) => [
        ...(s.toolSlug ? [s.toolSlug] : []),
        ...(s.alternativeToolSlugs ?? []),
      ]),
    ),
  ];
}

export function runWorkflowQuery(workflows: Workflow[], query: WorkflowQuery, tools: Tool[]) {
  const terms = queryTerms(query.q);
  const toolName = (slug: string) => tools.find((t) => t.slug === slug)?.name ?? "";

  const score = (w: Workflow, mode: MatchMode) =>
    scoreDocument(
      terms,
      [
        { text: w.title, weight: 10 },
        { text: w.summary, weight: 5 },
        { text: w.outcome, weight: 4 },
        { text: workflowToolSlugs(w).map(toolName), weight: 3 },
        { text: w.steps.map((s) => `${s.title} ${s.input} ${s.output}`), weight: 2 },
      ],
      mode,
    );
  const scoreAll = (mode: MatchMode) =>
    workflows
      .map((workflow) => ({ workflow, score: terms.length ? score(workflow, mode) : 1 }))
      .filter((s) => s.score > 0);
  const strict = scoreAll("strict");
  const scored = strict.length ? strict : scoreAll("relaxed");

  const filtered = scored.filter(({ workflow: w }) => {
    if (query.level && w.skillLevel !== query.level) return false;
    if (query.tool && !workflowToolSlugs(w).includes(query.tool)) return false;
    return true;
  });
  filtered.sort((a, b) => {
    if (terms.length && b.score !== a.score) return b.score - a.score;
    if (a.workflow.featured !== b.workflow.featured) return a.workflow.featured ? -1 : 1;
    return a.workflow.title.localeCompare(b.workflow.title);
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / WORKFLOWS_PAGE_SIZE));
  const page = Math.min(query.page, pageCount);
  return {
    items: filtered
      .slice((page - 1) * WORKFLOWS_PAGE_SIZE, page * WORKFLOWS_PAGE_SIZE)
      .map((s) => s.workflow),
    total,
    page,
    pageCount,
  };
}
