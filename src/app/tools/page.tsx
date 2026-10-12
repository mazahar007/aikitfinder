import { Suspense, ViewTransition } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { SearchIcon } from "lucide-react";

import { ToolCard } from "@/components/content/cards";
import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { ActiveFilters } from "@/components/tools/active-filters";
import { SortSelect } from "@/components/tools/sort-select";
import { ToolFiltersSheet, ToolFiltersSidebar } from "@/components/tools/tool-filters";
import { Button } from "@/components/ui/button";
import { getCategories, getToday, getTools } from "@/lib/content/repository";
import {
  hasActiveFilters,
  parseToolQuery,
  runToolQuery,
  toolQueryHref,
} from "@/lib/content/tool-query";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "Explore AI tools",
  description: "Search and filter AI tools by task, category, skill level, pricing and API access.",
  alternates: { canonical: "/tools" },
};

async function ToolsDirectory({
  searchParams,
}: {
  searchParams: PageProps<"/tools">["searchParams"];
}) {
  const [params, tools, categories, today] = await Promise.all([
    searchParams,
    getTools(),
    getCategories(),
    getToday(),
  ]);
  const query = parseToolQuery(
    params,
    categories.map((c) => c.slug),
  );
  const result = runToolQuery(tools, query, categories, today);
  const formKey = toolQueryHref(query, { page: 1 });
  const activeCount =
    query.categories.length +
    query.levels.length +
    query.pricing.length +
    (query.api ? 1 : 0) +
    (query.freePlan ? 1 : 0) +
    (query.payg ? 1 : 0) +
    (query.budget !== undefined ? 1 : 0);
  const categoryName = (slug: string) =>
    categories.find((c) => c.slug === slug)?.name.replace(/^AI /, "");

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]">
      <aside aria-label="Filters" className="hidden lg:block">
        <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-md border bg-card p-3">
          <ToolFiltersSidebar
            query={query}
            facets={result.facets}
            categories={categories}
            formKey={formKey}
          />
        </div>
      </aside>

      <section aria-labelledby="results-heading" className="min-w-0">
        <Form action="/tools" role="search" className="flex gap-2">
          <label htmlFor="tools-q" className="sr-only">
            Search tools
          </label>
          <div className="relative flex-1">
            <SearchIcon
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="tools-q"
              name="q"
              type="search"
              defaultValue={query.q}
              key={query.q}
              placeholder="Search by name, task or feature"
              className="h-11 w-full rounded-md border border-input bg-card pr-3 pl-9 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
            />
          </div>
          {query.categories.map((c) => (
            <input key={c} type="hidden" name="category" value={c} />
          ))}
          {query.levels.map((l) => (
            <input key={l} type="hidden" name="level" value={l} />
          ))}
          {query.pricing.map((p) => (
            <input key={p} type="hidden" name="pricing" value={p} />
          ))}
          {query.api ? <input type="hidden" name="api" value="yes" /> : null}
          {query.freePlan ? <input type="hidden" name="freeplan" value="yes" /> : null}
          {query.payg ? <input type="hidden" name="payg" value="yes" /> : null}
          {query.budget !== undefined ? (
            <input type="hidden" name="budget" value={query.budget} />
          ) : null}
          <Button type="submit">Search</Button>
        </Form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="results-heading" className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold text-foreground">{result.total}</span>{" "}
            {result.total === 1 ? "tool" : "tools"}
            {hasActiveFilters(query)
              ? result.total === 1
                ? " matches your filters"
                : " match your filters"
              : ""}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ToolFiltersSheet
              query={query}
              facets={result.facets}
              categories={categories}
              formKey={formKey}
              activeCount={activeCount}
            />
            <SortSelect key={query.sort} query={query} />
          </div>
        </div>

        <div className="mt-3">
          <ActiveFilters query={query} categories={categories} />
        </div>

        {result.items.length > 0 ? (
          <>
            {/* Crossfades in place whenever the filters change. */}
            <ViewTransition key={formKey} enter="results" exit="results" default="none">
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {result.items.map((tool, i) => (
                  <li key={tool.slug} {...reveal(i)}>
                    <ToolCard
                      tool={tool}
                      categoryName={categoryName(tool.categorySlugs[0])}
                      compare
                    />
                  </li>
                ))}
              </ul>
            </ViewTransition>
            <div className="mt-10">
              <Pagination
                page={result.page}
                pageCount={result.pageCount}
                hrefFor={(page) => toolQueryHref(query, { page })}
              />
            </div>
          </>
        ) : (
          <div className="mt-6">
            <EmptyState title="No tools match these filters">
              <p>Try fewer words, remove a filter, or browse a category instead.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href="/tools">Clear all filters</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href="/categories">Browse categories</Link>
                </Button>
              </div>
            </EmptyState>
          </div>
        )}
      </section>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[16rem_1fr]" aria-hidden="true">
      <div className="hidden h-96 animate-pulse rounded-md bg-surface-subtle lg:block" />
      <div>
        <div className="h-11 animate-pulse rounded-md bg-surface-subtle" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-md bg-surface-subtle" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ToolsPage({ searchParams }: PageProps<"/tools">) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Explore Tools" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        Explore AI tools
      </h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Filter by what you want to do, your skill level and budget. Pricing and API filters only
        include details we have verified.
      </p>
      <SampleNotice className="mt-6" />
      {/* Filters live in the URL, so results render per request inside Suspense. */}
      <Suspense fallback={<DirectorySkeleton />}>
        <ToolsDirectory searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
