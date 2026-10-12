import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { getAllCategories, getGuides, getTools, getWorkflows } from "@/lib/content/repository";

const staticPaths = [
  "",
  "/tools",
  "/categories",
  "/guides",
  "/workflows",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/editorial-policy",
];

/**
 * Lists only pages worth indexing. Fictional sample records and empty
 * categories are left out so demo content never reaches a search engine, and the whole sitemap is
 * empty on preview hosts (see `siteConfig.indexable`).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!siteConfig.indexable) return [];

  const [categories, tools, guides, workflows] = await Promise.all([
    getAllCategories(),
    getTools(),
    getGuides(),
    getWorkflows(),
  ]);
  const real = <T extends { isSample: boolean }>(items: T[]) => items.filter((i) => !i.isSample);
  // Empty categories are thin pages: list a category only once it has a real tool.
  const populated = new Set(real(tools).flatMap((t) => t.categorySlugs));
  const url = (path: string) => `${siteConfig.url}${path}`;

  return [
    ...staticPaths.map((path) => ({
      url: url(path),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.6,
    })),
    ...categories
      .filter((c) => populated.has(c.slug))
      .map((c) => ({ url: url(`/categories/${c.slug}`), priority: 0.6 })),
    ...real(tools).map((t) => ({
      url: url(`/tools/${t.slug}`),
      lastModified: t.updatedAt,
      priority: 0.8,
    })),
    ...real(guides).map((g) => ({
      url: url(`/guides/${g.slug}`),
      lastModified: g.updatedAt,
      priority: 0.7,
    })),
    ...real(workflows).map((w) => ({
      url: url(`/workflows/${w.slug}`),
      lastModified: w.updatedAt,
      priority: 0.7,
    })),
  ];
}
