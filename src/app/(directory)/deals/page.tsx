import { Suspense } from "react";
import type { Metadata } from "next";
import Form from "next/form";
import Link from "next/link";
import { InfoIcon } from "lucide-react";

import { DealCard } from "@/components/content/deal-card";
import { EmptyState } from "@/components/content/empty-state";
import { Pagination } from "@/components/content/pagination";
import { SampleNotice } from "@/components/content/sample-notice";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  dealQueryHref,
  dealStatusFilters,
  hasActiveDealFilters,
  parseDealQuery,
  runDealQuery,
} from "@/lib/content/deal-query";
import {
  dealEligibilities,
  dealTypeLabel,
  dealTypes,
  eligibilityLabel,
} from "@/lib/content/labels";
import { getDeals } from "@/lib/content/repository";
import { reveal } from "@/lib/motion";

export const metadata: Metadata = {
  title: "AI deals, credits and free trials",
  description:
    "Free credits, discounts, coupons and trials for AI tools, with who qualifies, when they end and when we last checked.",
  alternates: { canonical: "/deals" },
};

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground focus-visible:border-primary sm:text-sm";

function FilterField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-heading">
        {label}
      </label>
      {children}
    </div>
  );
}

async function DealsDirectory({
  searchParams,
}: {
  searchParams: PageProps<"/deals">["searchParams"];
}) {
  const [params, deals] = await Promise.all([searchParams, getDeals()]);
  const providers = [...new Set(deals.map((d) => d.provider))].sort();
  const query = parseDealQuery(params, providers);
  const result = runDealQuery(deals, query);
  const expiredCount = deals.filter((d) => d.state === "expired").length;

  return (
    <>
      <Form
        action="/deals"
        role="search"
        aria-label="Filter offers"
        className="mt-6 rounded-lg border bg-card p-4"
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-5">
            <label htmlFor="deals-q" className="mb-1 block text-sm font-medium text-heading">
              Search offers
            </label>
            <input
              id="deals-q"
              name="q"
              type="search"
              defaultValue={query.q}
              placeholder="Tool, provider or keyword"
              className="h-11 w-full rounded-md border border-input bg-card px-3 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary sm:text-sm"
            />
          </div>
          <FilterField id="deals-type" label="Offer type">
            <select
              id="deals-type"
              name="type"
              defaultValue={query.type ?? ""}
              className={selectClass}
            >
              <option value="">All types</option>
              {dealTypes.map((t) => (
                <option key={t} value={t}>
                  {dealTypeLabel[t]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField id="deals-for" label="Who it’s for">
            <select
              id="deals-for"
              name="for"
              defaultValue={query.eligibility ?? ""}
              className={selectClass}
            >
              <option value="">Anyone</option>
              {dealEligibilities.map((e) => (
                <option key={e} value={e}>
                  {eligibilityLabel[e]}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField id="deals-provider" label="Provider">
            <select
              id="deals-provider"
              name="provider"
              defaultValue={query.provider ?? ""}
              className={selectClass}
            >
              <option value="">All providers</option>
              {providers.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </FilterField>
          <FilterField id="deals-status" label="Status">
            <select
              id="deals-status"
              name="status"
              defaultValue={query.status}
              className={selectClass}
            >
              {Object.entries(dealStatusFilters).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FilterField>
          <div className="flex items-end gap-2">
            <Button type="submit" className="flex-1">
              Apply filters
            </Button>
            {hasActiveDealFilters(query) ? (
              <Button asChild variant="ghost">
                <Link href="/deals">Clear</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </Form>

      <h2 className="mt-6 text-sm text-muted-foreground" aria-live="polite">
        <span className="font-semibold text-foreground">{result.total}</span>{" "}
        {result.total === 1 ? "offer" : "offers"}
        {query.status === "current" && expiredCount > 0 ? (
          <>
            {" "}
            ·{" "}
            <Link
              href={dealQueryHref(query, { status: "expired", page: 1 })}
              className="text-primary hover:underline"
            >
              {expiredCount} expired {expiredCount === 1 ? "offer is" : "offers are"} hidden
            </Link>
          </>
        ) : null}
      </h2>

      {result.items.length ? (
        <>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((deal, i) => (
              <li key={deal.slug} {...reveal(i)}>
                <DealCard deal={deal} />
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Pagination
              page={result.page}
              pageCount={result.pageCount}
              hrefFor={(page) => dealQueryHref(query, { page })}
            />
          </div>
        </>
      ) : (
        <div className="mt-4">
          <EmptyState title="No offers match these filters">
            <p>Try removing a filter, or show expired and unverified offers too.</p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/deals">Clear all filters</Link>
            </Button>
          </EmptyState>
        </div>
      )}
    </>
  );
}

function DealsSkeleton() {
  return (
    <div className="mt-6" aria-hidden="true">
      <div className="h-48 animate-pulse rounded-lg bg-surface-subtle" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-60 animate-pulse rounded-md bg-surface-subtle" />
        ))}
      </div>
    </div>
  );
}

export default function DealsPage({ searchParams }: PageProps<"/deals">) {
  return (
    <Container className="py-8 sm:py-12">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Deals" }]} />
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-heading sm:text-h1">
        AI deals, credits and free trials
      </h1>
      <p className="mt-2 max-w-2xl text-lead text-muted-foreground">
        Offers from AI tool providers, with who can claim them, when they end and when we last
        checked.
      </p>
      <SampleNotice className="mt-6" />
      <p className="mt-3 flex items-start gap-2 rounded-md border bg-card px-4 py-3 text-sm text-muted-foreground">
        <InfoIcon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <span>
          Offers change and not everyone qualifies. Always read the provider’s own terms before you
          claim anything. If a claim link earns us a commission, the offer is labelled “Affiliate
          link”. We never mark an offer active unless we have checked it recently.
        </span>
      </p>
      <Suspense fallback={<DealsSkeleton />}>
        <DealsDirectory searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
