"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { XIcon } from "lucide-react";

import {
  clearCompareItems,
  removeCompareItem,
  useCompareItems,
} from "@/components/compare/compare-store";
import { Button } from "@/components/ui/button";
import { COMPARE_MIN, compareHref } from "@/lib/content/compare";

/** A bar at the bottom of the screen listing the picked tools. Hidden on /compare itself. */
export function CompareTray() {
  const items = useCompareItems();
  const pathname = usePathname();
  if (!items.length || pathname.startsWith("/compare")) return null;

  const ready = items.length >= COMPARE_MIN;
  return (
    <div
      role="region"
      aria-label="Tool comparison"
      className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3"
    >
      <div className="pointer-events-auto mx-auto flex max-w-3xl flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border bg-card p-3 shadow-card-hover">
        <p className="text-sm font-medium text-heading" aria-live="polite">
          {items.length} {items.length === 1 ? "tool" : "tools"} selected
          {ready ? "" : ". Pick one more to compare"}
        </p>
        <ul className="order-last flex basis-full flex-wrap gap-1.5 sm:order-none sm:flex-1 sm:basis-0">
          {items.map((item) => (
            <li
              key={item.slug}
              className="inline-flex max-w-full items-center gap-1 rounded-sm border bg-surface-subtle py-0.5 pr-0.5 pl-2 text-xs font-semibold"
            >
              <span className="truncate">{item.name}</span>
              <button
                type="button"
                onClick={() => removeCompareItem(item.slug)}
                className="inline-flex size-6 items-center justify-center rounded-sm text-muted-foreground hover:bg-card hover:text-foreground"
              >
                <XIcon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">Remove {item.name}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          <Button type="button" variant="ghost" size="sm" onClick={clearCompareItems}>
            Clear
          </Button>
          {ready ? (
            <Button asChild size="sm">
              <Link href={compareHref(items.map((i) => i.slug))}>Compare now</Link>
            </Button>
          ) : (
            <Button size="sm" disabled>
              Compare now
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
