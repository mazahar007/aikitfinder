/**
 * Content access layer.
 *
 * Pages and components read content only through these functions. In Phase 2
 * they return the fictional sample data; in Phase 3 their bodies switch to
 * Supabase queries with the same signatures, so the UI does not change.
 * Functions are async for that reason.
 */
import { sampleCategories } from "@/lib/content/sample/categories";
import { sampleGuides } from "@/lib/content/sample/guides";
import { sampleTools } from "@/lib/content/sample/tools";
import { sampleWorkflows } from "@/lib/content/sample/workflows";
import type { Category, Guide, Tool, Workflow } from "@/lib/content/types";

const published = <T extends { status: string }>(items: T[]) =>
  items.filter((item) => item.status === "published");

const byUpdatedDesc = <T extends { updatedAt: string }>(a: T, b: T) =>
  b.updatedAt.localeCompare(a.updatedAt);

// Categories ----------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  return sampleCategories;
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  return sampleCategories.find((c) => c.slug === slug);
}

/** Number of published tools per category slug. */
export async function getCategoryToolCounts(): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const tool of published(sampleTools)) {
    for (const slug of tool.categorySlugs) counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

// Tools -----------------------------------------------------------------------

export async function getTools(): Promise<Tool[]> {
  return published(sampleTools);
}

export async function getTool(slug: string): Promise<Tool | undefined> {
  return published(sampleTools).find((t) => t.slug === slug);
}

export async function getToolsBySlugs(slugs: string[]): Promise<Tool[]> {
  const tools = published(sampleTools);
  return slugs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is Tool => !!t);
}

export async function getFeaturedTools(limit = 6): Promise<Tool[]> {
  return published(sampleTools)
    .filter((t) => t.featured)
    .slice(0, limit);
}

export async function getToolsInCategory(categorySlug: string): Promise<Tool[]> {
  return published(sampleTools).filter((t) => t.categorySlugs.includes(categorySlug));
}

/** Other tools sharing the primary category, for "Similar tools". */
export async function getSimilarTools(tool: Tool, limit = 3): Promise<Tool[]> {
  return published(sampleTools)
    .filter(
      (t) => t.slug !== tool.slug && t.categorySlugs.some((c) => tool.categorySlugs.includes(c)),
    )
    .slice(0, limit);
}

// Guides ----------------------------------------------------------------------

export async function getGuides(): Promise<Guide[]> {
  return published(sampleGuides);
}

export async function getGuide(slug: string): Promise<Guide | undefined> {
  return published(sampleGuides).find((g) => g.slug === slug);
}

export async function getFeaturedGuides(limit = 4): Promise<Guide[]> {
  return published(sampleGuides)
    .filter((g) => g.featured)
    .slice(0, limit);
}

export async function getGuidesForTool(toolSlug: string): Promise<Guide[]> {
  return published(sampleGuides).filter((g) => g.toolSlugs.includes(toolSlug));
}

export async function getGuidesInCategory(categorySlug: string): Promise<Guide[]> {
  const toolSlugs = new Set(
    published(sampleTools)
      .filter((t) => t.categorySlugs.includes(categorySlug))
      .map((t) => t.slug),
  );
  return published(sampleGuides).filter((g) => g.toolSlugs.some((s) => toolSlugs.has(s)));
}

// Workflows -------------------------------------------------------------------

export async function getWorkflows(): Promise<Workflow[]> {
  return published(sampleWorkflows);
}

export async function getWorkflow(slug: string): Promise<Workflow | undefined> {
  return published(sampleWorkflows).find((w) => w.slug === slug);
}

export async function getFeaturedWorkflows(limit = 3): Promise<Workflow[]> {
  return published(sampleWorkflows)
    .filter((w) => w.featured)
    .slice(0, limit);
}

export async function getWorkflowsForTool(toolSlug: string): Promise<Workflow[]> {
  return published(sampleWorkflows).filter((w) => w.steps.some((s) => s.toolSlug === toolSlug));
}

// Mixed -----------------------------------------------------------------------

export type RecentItem =
  | { type: "tool"; item: Tool }
  | { type: "guide"; item: Guide }
  | { type: "workflow"; item: Workflow };

/** Most recently updated tools, guides and workflows together. */
export async function getRecentlyUpdated(limit = 6): Promise<RecentItem[]> {
  const items: RecentItem[] = [
    ...published(sampleTools).map((item) => ({ type: "tool" as const, item })),
    ...published(sampleGuides).map((item) => ({ type: "guide" as const, item })),
    ...published(sampleWorkflows).map((item) => ({ type: "workflow" as const, item })),
  ];
  return items.sort((a, b) => byUpdatedDesc(a.item, b.item)).slice(0, limit);
}
