import { Suspense } from "react";
import type { Metadata } from "next";

import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { SearchExperience } from "@/components/search/search-experience";

export const metadata: Metadata = {
  title: "Search",
  description: "Search AI tools, guides, prompts, settings, troubleshooting and workflows.",
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return (
    <Container className="max-w-3xl py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">Search</h1>
      <SampleNotice className="mt-4" />
      {/* The query and its request ID come from the address. The search itself
          runs through POST /api/directory/search, which applies the guest
          search limit, so this page never runs a search just by being loaded. */}
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
        <SearchExperience />
      </Suspense>
    </Container>
  );
}
