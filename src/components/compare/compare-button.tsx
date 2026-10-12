"use client";

import { CheckIcon, PlusIcon } from "lucide-react";

import { toggleCompareItem, useCompareItems } from "@/components/compare/compare-store";
import { COMPARE_MAX } from "@/lib/content/compare";
import { cn } from "@/lib/utils";

/** Adds or removes a tool from the comparison tray. Sits above a card's stretched link. */
export function CompareButton({
  slug,
  name,
  className,
}: {
  slug: string;
  name: string;
  className?: string;
}) {
  const items = useCompareItems();
  const selected = items.some((i) => i.slug === slug);
  const full = !selected && items.length >= COMPARE_MAX;

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={full}
      title={full ? `You can compare up to ${COMPARE_MAX} tools` : undefined}
      onClick={() => toggleCompareItem({ slug, name })}
      className={cn(
        "relative z-10 inline-flex min-h-11 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-primary bg-primary-tint text-primary-hover"
          : "border-input bg-card text-foreground hover:border-primary hover:text-primary",
        className,
      )}
    >
      {selected ? (
        <CheckIcon className="size-4" aria-hidden="true" />
      ) : (
        <PlusIcon className="size-4" aria-hidden="true" />
      )}
      Compare
      <span className="sr-only"> {name}</span>
    </button>
  );
}
