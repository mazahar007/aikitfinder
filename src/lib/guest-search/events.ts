import "server-only";

type SearchEvent =
  | "guest_search_allowed"
  | "guest_search_limit_reached"
  | "guest_search_rate_limited"
  | "authenticated_search"
  | "directory_search_executed"
  | "directory_search_unavailable";

/**
 * One structured log line per event, for aggregate counts in the hosting
 * provider's logs. Deliberately carries no identifier of any kind: no guest
 * hash, cookie, user ID, address or query text.
 */
export function recordSearchEvent(event: SearchEvent): void {
  console.info(JSON.stringify({ event, at: new Date().toISOString() }));
}
