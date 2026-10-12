"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { pricingLabel, pricingModels, skillLevelLabel, skillLevels } from "@/lib/content/labels";
import type { ToolQuery, ToolQueryResult } from "@/lib/content/tool-query";
import type { Category } from "@/lib/content/types";
import { cn } from "@/lib/utils";

type FilterProps = {
  query: ToolQuery;
  facets: ToolQueryResult["facets"];
  categories: Category[];
};

function hrefFromForm(form: HTMLFormElement) {
  const params = new URLSearchParams();
  for (const [key, value] of new FormData(form)) {
    if (typeof value === "string" && value) params.append(key, value);
  }
  params.delete("page"); // any filter change starts again from page 1
  const qs = params.toString();
  return qs ? `/tools?${qs}` : "/tools";
}

function Option({
  name,
  value,
  label,
  count,
  checked,
}: {
  name: string;
  value: string;
  label: string;
  count: number;
  checked: boolean;
}) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={cn(
        "flex min-h-10 cursor-pointer items-center gap-3 rounded-md px-2 text-sm hover:bg-surface-subtle",
        disabled && "cursor-not-allowed opacity-60 hover:bg-transparent",
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        defaultChecked={checked}
        disabled={disabled}
        className="size-4 shrink-0 accent-primary"
      />
      <span className="flex-1 text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground tabular-nums">{count}</span>
    </label>
  );
}

function FilterGroup({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-b pb-4 last:border-b-0">
      <legend className="mb-1 px-2 text-sm font-semibold text-heading">{legend}</legend>
      <div className="space-y-0.5">{children}</div>
    </fieldset>
  );
}

/**
 * The filter form. On wide screens every change updates the results
 * immediately; inside the mobile sheet changes apply when the visitor taps
 * "Show results".
 */
function FilterForm({
  query,
  facets,
  categories,
  autoApply,
  onApplied,
  idPrefix,
}: FilterProps & { autoApply: boolean; onApplied?: () => void; idPrefix: string }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  function apply(form: HTMLFormElement) {
    startTransition(() => router.replace(hrefFromForm(form), { scroll: false }));
    onApplied?.();
  }

  return (
    <form
      action="/tools"
      method="get"
      aria-describedby={`${idPrefix}-status`}
      onChange={(e) => autoApply && apply(e.currentTarget)}
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      className="space-y-4"
    >
      {query.q ? <input type="hidden" name="q" value={query.q} /> : null}
      {query.sort !== "featured" ? <input type="hidden" name="sort" value={query.sort} /> : null}

      <FilterGroup legend="Skill level">
        {skillLevels.map((level) => (
          <Option
            key={level}
            name="level"
            value={level}
            label={skillLevelLabel[level]}
            count={facets.levels[level] ?? 0}
            checked={query.levels.includes(level)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Category">
        {categories.map((c) => (
          <Option
            key={c.slug}
            name="category"
            value={c.slug}
            label={c.name.replace(/^AI /, "")}
            count={facets.categories[c.slug] ?? 0}
            checked={query.categories.includes(c.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Pricing (verified only)">
        {pricingModels.map((p) => (
          <Option
            key={p}
            name="pricing"
            value={p}
            label={pricingLabel[p]}
            count={facets.pricing[p] ?? 0}
            checked={query.pricing.includes(p)}
          />
        ))}
      </FilterGroup>

      <FilterGroup legend="Integrations">
        <Option name="api" value="yes" label="Has an API" count={facets.api} checked={query.api} />
      </FilterGroup>

      <p
        id={`${idPrefix}-status`}
        className="px-2 text-xs text-muted-foreground"
        aria-live="polite"
      >
        {pending ? "Updating results…" : ""}
      </p>

      {!autoApply ? (
        <Button type="submit" className="w-full">
          Show results
        </Button>
      ) : (
        <noscript>
          <Button type="submit" className="w-full">
            Apply filters
          </Button>
        </noscript>
      )}
    </form>
  );
}

export function ToolFiltersSidebar(props: FilterProps & { formKey: string }) {
  return <FilterForm key={props.formKey} {...props} autoApply idPrefix="sidebar-filters" />;
}

export function ToolFiltersSheet(props: FilterProps & { formKey: string; activeCount: number }) {
  const [open, setOpen] = React.useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="secondary" className="lg:hidden">
          <SlidersHorizontalIcon aria-hidden="true" />
          Filters
          {props.activeCount > 0 ? (
            <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
              {props.activeCount}
            </span>
          ) : null}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" aria-describedby="filters-desc" className="overflow-y-auto">
        <SheetTitle>Filter tools</SheetTitle>
        <SheetDescription id="filters-desc">
          Numbers show how many tools match each option.
        </SheetDescription>
        <FilterForm
          key={props.formKey}
          {...props}
          autoApply={false}
          onApplied={() => setOpen(false)}
          idPrefix="sheet-filters"
        />
      </SheetContent>
    </Sheet>
  );
}
