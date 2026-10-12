import Link from "next/link";
import { ExternalLinkIcon, FlagIcon } from "lucide-react";

import { VerificationBadge } from "@/components/content/badges";
import { formatDate } from "@/lib/content/labels";
import type { Source, VerificationStatus } from "@/lib/content/types";

export function SourcesList({
  sources,
  verification,
  lastVerifiedAt,
  updatedAt,
}: {
  sources: Source[];
  verification: VerificationStatus;
  lastVerifiedAt?: string;
  updatedAt: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <VerificationBadge status={verification} date={lastVerifiedAt} />
        <span>Last updated {formatDate(updatedAt)}</span>
      </div>
      {sources.length ? (
        <ul className="space-y-2">
          {sources.map((s) => (
            <li key={s.url} className="text-sm">
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                {s.title}
                <ExternalLinkIcon className="size-3.5" aria-hidden="true" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              {s.checkedAt ? (
                <span className="text-muted-foreground"> · checked {formatDate(s.checkedAt)}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No sources have been added yet.</p>
      )}
      <Link
        href="/contact"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-md text-sm font-medium text-primary hover:underline"
      >
        <FlagIcon className="size-4" aria-hidden="true" />
        Report outdated or wrong information
      </Link>
    </div>
  );
}
