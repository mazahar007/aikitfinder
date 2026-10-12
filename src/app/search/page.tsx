import { Suspense } from "react";
import type { Metadata } from "next";

import { Container } from "@/components/layout/container";
import { SearchForm } from "@/components/search/search-form";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI tools, guides, prompts and workflows.",
  robots: { index: false, follow: true },
};

async function SearchStatus({
  searchParams,
}: {
  searchParams: PageProps<"/search">["searchParams"];
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";

  return (
    <>
      <SearchForm variant="hero" id="page-search" defaultValue={query} className="mt-6" />
      <p className="mt-6 text-muted-foreground" role="status">
        {query
          ? `Search results for “${query}” will appear here once the tool directory is ready.`
          : "Type what you want to do, or the name of a tool, setting or error message."}
      </p>
    </>
  );
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Container className="max-w-3xl py-12 sm:py-16">
      <h1 className="text-3xl font-bold tracking-tight text-heading sm:text-h1">Search</h1>
      {/* The query comes from the URL, so this part renders per request. */}
      <Suspense fallback={<div className="mt-6 h-16 animate-pulse rounded-lg bg-surface-subtle" />}>
        <SearchStatus searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
