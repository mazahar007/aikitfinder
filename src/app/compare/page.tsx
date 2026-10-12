import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { InfoIcon } from "lucide-react";

import { CompareTable } from "@/components/compare/compare-table";
import { SyncCompare } from "@/components/compare/sync-compare";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { COMPARE_MAX, COMPARE_MIN, compareHref, parseCompareParams } from "@/lib/content/compare";
import { getAllCategories, getTools } from "@/lib/content/repository";

export const metadata: Metadata = {
  title: "Compare AI tools",
  description: "Put two to four AI tools side by side: pricing, platforms, API access and limits.",
  alternates: { canonical: "/compare" },
  // Every selection is a different thin page, so none of them should be indexed.
  robots: { index: false, follow: true },
};

async function Comparison({
  searchParams,
}: {
  searchParams: PageProps<"/compare">["searchParams"];
}) {
  const [params, tools, categories] = await Promise.all([
    searchParams,
    getTools(),
    getAllCategories(),
  ]);
  const { slugs, truncated, differencesOnly } = parseCompareParams(
    params,
    tools.map((t) => t.slug),
  );
  const selected = slugs.map((s) => tools.find((t) => t.slug === s)!);
  const available = tools
    .filter((t) => !slugs.includes(t.slug))
    .sort((a, b) => a.name.localeCompare(b.name));
  const full = selected.length >= COMPARE_MAX;
  const ready = selected.length >= COMPARE_MIN;

  // A few ready-made pairs, taken from the editorial "alternatives" data.
  const examples = tools
    .flatMap((t) => (t.alternativeSlugs ?? []).map((alt) => [t.slug, alt] as const))
    .filter(
      ([a, b], i, all) =>
        all.findIndex(([x, y]) => (x === b && y === a) || (x === a && y === b)) === i,
    )
    .slice(0, 3)
    .map(([a, b]) => ({
      href: compareHref([a, b]),
      label: `${tools.find((t) => t.slug === a)?.name} vs ${tools.find((t) => t.slug === b)?.name}`,
    }))
    .filter((e) => !e.label.includes("undefined"));

  return (
    <>
      <SyncCompare items={selected.map((t) => ({ slug: t.slug, name: t.name }))} />

      <Form
        action="/compare"
        aria-label="Add a tool to compare"
        className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4"
      >
        {slugs.length ? <input type="hidden" name="tools" value={slugs.join(",")} /> : null}
        {differencesOnly ? <input type="hidden" name="diff" value="1" /> : null}
        <div className="min-w-0 flex-1 basis-60">
          <label htmlFor="compare-add" className="mb-1 block text-sm font-medium text-heading">
            Add a tool ({selected.length} of {COMPARE_MAX})
          </label>
          <select
            id="compare-add"
            name="add"
            defaultValue=""
            disabled={full || !available.length}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary disabled:opacity-60 sm:text-sm"
          >
            <option value="">{full ? "Remove a tool to add another" : "Choose a tool…"}</option>
            {available.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" disabled={full || !available.length}>
          Add to comparison
        </Button>
        {ready ? (
          <Button asChild variant="secondary">
            <Link href={compareHref(slugs, { differencesOnly: !differencesOnly })}>
              {differencesOnly ? "Show all rows" : "Show differences only"}
            </Link>
          </Button>
        ) : null}
        {slugs.length ? (
          <Button asChild variant="ghost">
            <Link href="/compare">Clear all</Link>
          </Button>
        ) : null}
      </Form>

      {truncated ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          You can compare up to {COMPARE_MAX} tools at a time, so only the first {COMPARE_MAX} are
          shown.
        </p>
      ) : null}

      <div className="mt-6">
        {ready ? (
          <CompareTable
            tools={selected}
            categories={categories}
            differencesOnly={differencesOnly}
          />
        ) : (
          <div
            className="rounded-md border border-dashed bg-card px-6 py-10 text-center"
            role="status"
          >
            <h2 className="text-lg font-semibold text-heading">
              {selected.length === 0
                ? "Choose two to four tools to compare"
                : `Add at least one more tool to compare with ${selected[0].name}`}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Use the “Compare” button on any tool card, or pick tools above.
            </p>
            {examples.length ? (
              <ul className="mt-5 flex flex-wrap justify-center gap-2">
                {examples.map((e) => (
                  <li key={e.href}>
                    <Button asChild variant="secondary" size="sm">
                      <Link href={e.href}>{e.label}</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </div>
      {selected.some((t) => t.isSample) ? <SampleNotice className="mt-6" /> : null}
    </>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="h-24 animate-pulse rounded-lg bg-surface-subtle" />
      <div className="mt-6 h-96 animate-pulse rounded-lg bg-surface-subtle" />
    </div>
  );
}

export default function ComparePage({ searchParams }: PageProps<"/compare">) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare tools" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        Compare AI tools
      </h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Put {COMPARE_MIN} to {COMPARE_MAX} tools side by side. We show facts, not scores or
        rankings, so you decide what matters for your task.
      </p>
      <p className="mt-3 flex max-w-3xl items-start gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          “Not verified yet” means we have not confirmed that detail from an official source. It
          does not mean the tool lacks it. Check each tool’s official site before you decide.
        </span>
      </p>
      {/* The selection lives in the URL, so it is read per request inside Suspense. */}
      <Suspense fallback={<ComparisonSkeleton />}>
        <Comparison searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
