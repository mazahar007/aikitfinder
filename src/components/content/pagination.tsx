import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function Pagination({
  page,
  pageCount,
  hrefFor,
}: {
  page: number;
  pageCount: number;
  hrefFor: (page: number) => string;
}) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const linkClass =
    "inline-flex size-11 items-center justify-center rounded-md border bg-card text-sm font-medium text-foreground hover:border-input hover:bg-surface-subtle";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={linkClass} aria-label="Previous page">
          <ChevronLeftIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
      {pages.map((p) => (
        <Link
          key={p}
          href={hrefFor(p)}
          aria-label={`Page ${p}`}
          aria-current={p === page ? "page" : undefined}
          className={cn(
            linkClass,
            p === page &&
              "border-primary bg-primary text-primary-foreground hover:bg-primary-hover",
          )}
        >
          {p}
        </Link>
      ))}
      {page < pageCount ? (
        <Link href={hrefFor(page + 1)} className={linkClass} aria-label="Next page">
          <ChevronRightIcon className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </nav>
  );
}
