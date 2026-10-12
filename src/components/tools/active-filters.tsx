import Link from "next/link";
import { XIcon } from "lucide-react";

import { pricingLabel, skillLevelLabel } from "@/lib/content/labels";
import { toolQueryHref, type ToolQuery } from "@/lib/content/tool-query";
import type { Category } from "@/lib/content/types";

/** Chips for each active filter; each removes itself, plus "Clear all". */
export function ActiveFilters({ query, categories }: { query: ToolQuery; categories: Category[] }) {
  const chips: { label: string; href: string }[] = [];
  if (query.q)
    chips.push({ label: `“${query.q}”`, href: toolQueryHref(query, { q: "", page: 1 }) });
  for (const c of query.categories) {
    chips.push({
      label: categories.find((x) => x.slug === c)?.name.replace(/^AI /, "") ?? c,
      href: toolQueryHref(query, { categories: query.categories.filter((x) => x !== c), page: 1 }),
    });
  }
  for (const l of query.levels) {
    chips.push({
      label: skillLevelLabel[l],
      href: toolQueryHref(query, { levels: query.levels.filter((x) => x !== l), page: 1 }),
    });
  }
  for (const p of query.pricing) {
    chips.push({
      label: pricingLabel[p],
      href: toolQueryHref(query, { pricing: query.pricing.filter((x) => x !== p), page: 1 }),
    });
  }
  if (query.api)
    chips.push({ label: "Has an API", href: toolQueryHref(query, { api: false, page: 1 }) });

  if (query.freePlan)
    chips.push({ label: "Free plan", href: toolQueryHref(query, { freePlan: false, page: 1 }) });
  if (query.payg)
    chips.push({ label: "Pay as you go", href: toolQueryHref(query, { payg: false, page: 1 }) });
  if (query.budget !== undefined)
    chips.push({
      label: `Up to $${query.budget} a month`,
      href: toolQueryHref(query, { budget: undefined, page: 1 }),
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <Link
          key={chip.href + chip.label}
          href={chip.href}
          scroll={false}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-primary-tint px-3 text-sm font-medium text-primary-hover hover:bg-primary hover:text-primary-foreground"
        >
          {chip.label}
          <XIcon className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Remove filter</span>
        </Link>
      ))}
      <Link
        href={query.sort !== "featured" ? `/tools?sort=${query.sort}` : "/tools"}
        scroll={false}
        className="inline-flex min-h-9 items-center px-2 text-sm font-semibold text-primary hover:underline"
      >
        Clear all
      </Link>
    </div>
  );
}
