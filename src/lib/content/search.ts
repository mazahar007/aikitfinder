import {
  getCategories,
  getGuides,
  getPrompts,
  getTools,
  getWorkflows,
} from "@/lib/content/repository";
import {
  queryTerms,
  scoreDocument,
  type MatchMode,
  type WeightedField,
} from "@/lib/content/text-match";
import type { SkillLevel } from "@/lib/content/types";

export type SearchResultType =
  "tool" | "guide" | "workflow" | "prompt" | "setting" | "troubleshooting";

export type SearchResult = {
  type: SearchResultType;
  title: string;
  description: string;
  href: string;
  /** Extra context, e.g. which tool a setting belongs to. */
  context?: string;
  skillLevel?: SkillLevel;
  isSample: boolean;
  score: number;
};

export const searchGroupOrder: { type: SearchResultType; label: string }[] = [
  { type: "tool", label: "Tools" },
  { type: "guide", label: "Guides" },
  { type: "workflow", label: "Workflows" },
  { type: "prompt", label: "Prompts" },
  { type: "setting", label: "Settings explained" },
  { type: "troubleshooting", label: "Troubleshooting" },
];

/** Searches every public content type. Results are sorted best-first within each type. */
export async function searchContent(query: string): Promise<SearchResult[]> {
  const terms = queryTerms(query);
  if (terms.length === 0) return [];

  const [tools, guides, workflows, categories, prompts] = await Promise.all([
    getTools(),
    getGuides(),
    getWorkflows(),
    getCategories(),
    getPrompts(),
  ]);
  // Strict matching first; if nothing matches, retry with relaxed matching.
  const strict = collect("strict");
  const results = strict.length ? strict : collect("relaxed");
  return results.sort((a, b) => b.score - a.score);

  function collect(mode: MatchMode): SearchResult[] {
    const results: SearchResult[] = [];
    const score = (fields: WeightedField[]) => scoreDocument(terms, fields, mode);
    const push = (r: Omit<SearchResult, "score">, value: number) => {
      if (value > 0) results.push({ ...r, score: value });
    };

    for (const tool of tools) {
      const categoryNames = tool.categorySlugs.map(
        (s) => categories.find((c) => c.slug === s)?.name ?? "",
      );
      push(
        {
          type: "tool",
          title: tool.name,
          description: tool.shortDescription,
          href: `/tools/${tool.slug}`,
          context: categoryNames[0],
          skillLevel: tool.skillLevel,
          isSample: tool.isSample,
        },
        score([
          { text: tool.name, weight: 10 },
          { text: tool.tags, weight: 6 },
          { text: tool.shortDescription, weight: 4 },
          { text: tool.useCases, weight: 4 },
          { text: categoryNames, weight: 3 },
          { text: tool.features, weight: 2 },
          { text: tool.overview, weight: 1.5 },
        ]),
      );

      for (const setting of tool.settings) {
        push(
          {
            type: "setting",
            title: setting.name,
            description: setting.explanation,
            href: `/tools/${tool.slug}#settings`,
            context: tool.name,
            isSample: tool.isSample,
          },
          score([
            { text: setting.name, weight: 8 },
            { text: setting.explanation, weight: 4 },
            { text: setting.whenToAdjust, weight: 2 },
            { text: tool.name, weight: 3 },
          ]),
        );
      }

      for (const entry of tool.troubleshooting) {
        push(
          {
            type: "troubleshooting",
            title: entry.problem,
            description: entry.fixes[0] ?? "",
            href: `/tools/${tool.slug}#fix-${entry.slug}`,
            context: tool.name,
            isSample: tool.isSample,
          },
          score([
            { text: entry.problem, weight: 8 },
            { text: entry.causes, weight: 3 },
            { text: entry.fixes, weight: 2 },
            { text: tool.name, weight: 3 },
          ]),
        );
      }
    }

    // Prompts from the library (this includes the ones written on tool pages).
    for (const prompt of prompts) {
      const toolNames = prompt.toolSlugs
        .map((slug) => tools.find((t) => t.slug === slug)?.name)
        .filter((n): n is string => !!n);
      push(
        {
          type: "prompt",
          title: prompt.title,
          description: prompt.useCase,
          href: `/prompts/${prompt.slug}`,
          context: toolNames[0],
          skillLevel: prompt.skillLevel,
          isSample: prompt.isSample,
        },
        score([
          { text: prompt.title, weight: 8 },
          { text: prompt.tags, weight: 6 },
          { text: prompt.useCase, weight: 5 },
          { text: toolNames, weight: 3 },
          { text: prompt.text, weight: 2 },
        ]),
      );
    }

    for (const guide of guides) {
      const guideTools = tools.filter((t) => guide.toolSlugs.includes(t.slug)).map((t) => t.name);
      push(
        {
          type: "guide",
          title: guide.title,
          description: guide.summary,
          href: `/guides/${guide.slug}`,
          context: guideTools.join(", "),
          skillLevel: guide.skillLevel,
          isSample: guide.isSample,
        },
        score([
          { text: guide.title, weight: 10 },
          { text: guide.summary, weight: 5 },
          { text: guideTools, weight: 3 },
          { text: guide.steps.map((s) => s.title), weight: 2 },
        ]),
      );
    }

    for (const workflow of workflows) {
      push(
        {
          type: "workflow",
          title: workflow.title,
          description: workflow.summary,
          href: `/workflows/${workflow.slug}`,
          skillLevel: workflow.skillLevel,
          isSample: workflow.isSample,
        },
        score([
          { text: workflow.title, weight: 10 },
          { text: workflow.summary, weight: 5 },
          { text: workflow.outcome, weight: 3 },
          { text: workflow.steps.map((s) => `${s.title} ${s.input} ${s.output}`), weight: 2 },
        ]),
      );
    }

    return results;
  }
}
