"use client";

import * as React from "react";

import { useAccount, useAuthDialog } from "@/components/auth/auth-provider";
import { formatReset } from "@/lib/guest-search/client";
import {
  SEARCH_ACCESS_EVENT,
  type GuestAccess,
  type SearchAccess,
} from "@/lib/guest-search/config";
import { cn } from "@/lib/utils";

/**
 * "Free searches remaining 3/3", shown next to the main search field to
 * visitors without an account. Hidden for signed-in users and where the limit
 * is not configured. The number always comes from the server; nothing here
 * decides whether a search is allowed.
 */
export function GuestSearchCounter({ className }: { className?: string }) {
  const { account } = useAccount();
  const openAuth = useAuthDialog();
  const [access, setAccess] = React.useState<GuestAccess | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    const apply = (value: SearchAccess | undefined) => {
      if (cancelled) return;
      setAccess(value?.type === "guest" && value.enforced ? value : null);
    };
    fetch("/api/directory/search", { credentials: "same-origin", cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((body: { access?: SearchAccess } | null) => apply(body?.access))
      .catch(() => apply(undefined));

    const onUpdate = (event: Event) => apply((event as CustomEvent<SearchAccess>).detail);
    window.addEventListener(SEARCH_ACCESS_EVENT, onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(SEARCH_ACCESS_EVENT, onUpdate);
    };
  }, []);

  // Signed in (or still finding out): no guest counter.
  if (account !== null || !access) return null;

  const { remaining, limit, reset_at: resetAt } = access;
  const last = remaining === 1;
  const none = remaining === 0;

  return (
    <p
      // Announced politely when the number changes.
      role="status"
      aria-live="polite"
      data-remaining={remaining}
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground",
        className,
      )}
    >
      <span>Free searches remaining</span>
      <span
        className={cn(
          "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-xs font-semibold tabular-nums",
          none
            ? "border-destructive/40 bg-destructive-tint text-destructive"
            : last
              ? "border-warning/40 bg-warning-tint text-warning"
              : "border-border bg-surface-subtle text-foreground",
        )}
      >
        <span aria-hidden="true">
          {remaining}/{limit}
        </span>
        <span className="sr-only">
          {remaining} of {limit}
        </span>
      </span>
      {last ? <span>Last free search today.</span> : null}
      {none ? (
        <span>
          Resets {formatReset(resetAt)}.{" "}
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="font-semibold text-primary underline-offset-2 hover:underline"
          >
            Create a free account
          </button>{" "}
          to keep searching.
        </span>
      ) : null}
    </p>
  );
}
