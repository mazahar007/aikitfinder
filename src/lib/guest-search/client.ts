import {
  SEARCH_ACCESS_EVENT,
  SEARCH_QUERY_MAX_LENGTH,
  type SearchAccess,
} from "@/lib/guest-search/config";

/**
 * The address of one intentional search. Each submission gets its own request
 * ID, so reloading the results or going back to them repeats the same request
 * and does not count again.
 */
export function searchHref(query: string): string | null {
  const q = query.replace(/\s+/g, " ").trim().slice(0, SEARCH_QUERY_MAX_LENGTH);
  if (!q) return null;
  return `/search?q=${encodeURIComponent(q)}&rid=${crypto.randomUUID()}`;
}

/** Tells every counter on the page what the server just reported. */
export function publishSearchAccess(access: SearchAccess): void {
  window.dispatchEvent(new CustomEvent<SearchAccess>(SEARCH_ACCESS_EVENT, { detail: access }));
}

/** "tomorrow at 6:00 AM" style text for the reset time, in the visitor's own time zone. */
export function formatReset(resetAt: string | null): string {
  if (!resetAt) return "tomorrow";
  const date = new Date(resetAt);
  if (Number.isNaN(date.getTime())) return "tomorrow";
  const time = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(
    date,
  );
  const sameDay = new Date().toDateString() === date.toDateString();
  return `${sameDay ? "today" : "tomorrow"} at ${time}`;
}
