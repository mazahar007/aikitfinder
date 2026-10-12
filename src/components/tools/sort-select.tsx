"use client";

import { useRouter } from "next/navigation";

import { toolQueryHref, toolSorts, type ToolQuery, type ToolSort } from "@/lib/content/tool-query";

export function SortSelect({ query }: { query: ToolQuery }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="sr-only whitespace-nowrap sm:not-sr-only">Sort by</span>
      <select
        defaultValue={query.sort}
        onChange={(e) =>
          router.replace(toolQueryHref(query, { sort: e.target.value as ToolSort, page: 1 }), {
            scroll: false,
          })
        }
        className="h-11 rounded-md border border-input bg-card px-3 text-sm text-foreground"
      >
        {Object.entries(toolSorts).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </label>
  );
}
