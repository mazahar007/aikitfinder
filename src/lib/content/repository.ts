/**
 * Content access layer.
 *
 * Pages and components read content only through these functions. In Phase 2
 * they return the fictional sample data; in Phase 3 their bodies switch to
 * Supabase queries with the same signatures, so the UI does not change.
 * Functions are async for that reason.
 */
import { cacheLife } from "next/cache";

import { dealStatus, type DealView } from "@/lib/content/deal-status";
import { sampleCategories } from "@/lib/content/sample/categories";
import { sampleDeals } from "@/lib/content/sample/deals";
import { sampleGuides } from "@/lib/content/sample/guides";
import { sampleTools } from "@/lib/content/sample/tools";
import { sampleWorkflows } from "@/lib/content/sample/workflows";
import type { Category, Guide, Tool, Workflow } from "@/lib/content/types";

const published = <T extends { status: string }>(items: T[]) =>
  items.filter((item) => item.status === "published");

const byUpdatedDesc = <T extends { updatedAt: string }>(a: T, b: T) =>
  b.updatedAt.localeCompare(a.updatedAt);

// Categories ----------------------------------------------------------------

/** Top-level categories only (what the homepage, category index and filters list). */
export async function getCategories(): Promise<Category[]> {
  return sampleCategories.filter((c) => !c.parentSlug);
}

/** Every category including subcategories (for routes, names and validation). */
export async function getAllCategories(): Promise<Category[]> {
  return sampleCategories;
}

export async function getSubcategories(parentSlug: string): Promise<Category[]> {
  return sampleCategories.filter((c) => c.parentSlug === parentSlug);
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

/** Tools the record names as alternatives (only published ones; order preserved). */
export async function getAlternatives(tool: Tool): Promise<Tool[]> {
  return getToolsBySlugs(tool.alternativeSlugs ?? []);
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

// Deals -----------------------------------------------------------------------

/**
 * Published offers with their current status. Status depends on today's date,
 * so this is cached for an hour (and recomputed after) rather than frozen at
 * build time.
 */
export async function getDeals(): Promise<DealView[]> {
  "use cache";
  cacheLife("hours");
  const today = new Date().toISOString().slice(0, 10);
  return published(sampleDeals).map((deal) => ({ ...deal, state: dealStatus(deal, today) }));
}

export async function getDeal(slug: string): Promise<DealView | undefined> {
  return (await getDeals()).find((d) => d.slug === slug);
}

export async function getDealsForTool(toolSlug: string): Promise<DealView[]> {
  return (await getDeals()).filter((d) => d.toolSlug === toolSlug);
}

// Time ------------------------------------------------------------------------

/**
 * Today's date (UTC, YYYY-MM-DD) for freshness rules such as "pricing checked
 * within 60 days". Cached for an hour, like the deals list, because reading the
 * clock is not allowed during static prerendering.
 */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Date().toISOString().slice(0, 10);
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
