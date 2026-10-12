import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { LevelBadge, SampleBadge } from "@/components/content/badges";
import { EmptyState } from "@/components/content/empty-state";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";
import { Button } from "@/components/ui/button";
import {
  searchContent,
  searchGroupOrder,
  type SearchResult,
  type SearchResultType,
} from "@/lib/content/search";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI tools, guides, prompts, settings, troubleshooting and workflows.",
  robots: { index: false, follow: true },
};

const suggestions = ["make a video", "summarise", "code", "thumbnail", "automation"];

function ResultItem({ result }: { result: SearchResult }) {
  return (
    <li>
      <article className="relative rounded-md border bg-card p-4 transition-[box-shadow,border-color] hover:border-input hover:shadow-card-hover">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-foreground">
            <Link
              href={result.href}
              className="after:absolute after:inset-0 after:rounded-md after:content-[''] focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ring"
            >
              {result.title}
            </Link>
          </h3>
          {result.isSample ? <SampleBadge /> : null}
          {result.skillLevel ? <LevelBadge level={result.skillLevel} /> : null}
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{result.description}</p>
        {result.context ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {result.type === "tool" ? result.context : `In ${result.context}`}
          </p>
        ) : null}
      </article>
    </li>
  );
}

async function SearchResults({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const params = await searchParams;
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const query = (first(params.q) ?? "").trim().slice(0, 100);
  const typeParam = first(params.type);
  const activeType = searchGroupOrder.some((g) => g.type === typeParam)
    ? (typeParam as SearchResultType)
    : undefined;

  const results = query ? await searchContent(query) : [];
  const groups = searchGroupOrder
    .map((g) => ({ ...g, items: results.filter((r) => r.type === g.type) }))
    .filter((g) => g.items.length > 0);
  const visible = activeType ? groups.filter((g) => g.type === activeType) : groups;
  const href = (type?: SearchResultType) =>
    `/search?q=${encodeURIComponent(query)}${type ? `&type=${type}` : ""}`;

  return (
    <>
      <SearchForm variant="hero" id="page-search" defaultValue={query} className="mt-6" />

      {!query ? (
        <div className="mt-8">
          <p className="text-muted-foreground">
            Search for a task (“make a video”), a tool, a setting or an error message.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="inline-flex min-h-9 items-center rounded-full border bg-card px-3.5 text-sm hover:border-primary hover:bg-primary-tint hover:text-primary-hover"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8">
          <EmptyState title={`No results for “${query}”`}>
            <p>Try a shorter or more general phrase, check the spelling, or browse instead.</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button asChild variant="secondary" size="sm">
                <Link href="/tools">Explore all tools</Link>
              </Button>
              <Button asChild variant="ghost" size="sm">
                <Link href="/categories">Browse categories</Link>
              </Button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted-foreground" role="status">
            <span className="font-semibold text-foreground">{results.length}</span>{" "}
            {results.length === 1 ? "result" : "results"} for “{query}”
          </p>
          <nav aria-label="Result types" className="mt-3 flex flex-wrap gap-2">
            {[
              { type: undefined, label: "All", count: results.length },
              ...groups.map((g) => ({ type: g.type, label: g.label, count: g.items.length })),
            ].map((tab) => {
              const active = tab.type === activeType;
              return (
                <Link
                  key={tab.label}
                  href={href(tab.type)}
                  scroll={false}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-card text-foreground hover:border-primary hover:bg-primary-tint",
                  )}
                >
                  {tab.label}
                  <span className={active ? "" : "text-muted-foreground"}>{tab.count}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 space-y-10">
            {visible.map((group) => (
              <section key={group.type} aria-labelledby={`group-${group.type}`}>
                <h2 id={`group-${group.type}`} className="text-lg font-bold text-heading">
                  {group.label}
                </h2>
                <ul className="mt-3 space-y-3">
                  {group.items.map((r) => (
                    <ResultItem key={`${r.type}-${r.href}-${r.title}`} result={r} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">Search</h1>
      <SampleNotice className="mt-4" />
      {/* The query comes from the URL, so results render per request. */}
      <Suspense
        fallback={
          <div aria-hidden="true">
            <div className="mt-6 h-16 animate-pulse rounded-lg bg-surface-subtle" />
            <div className="mt-8 space-y-3">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-md bg-surface-subtle" />
              ))}
            </div>
          </div>
        }
      >
        <SearchResults searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
