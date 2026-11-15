/**
 * "3 Free Searches": a visitor without an account gets this many Directory
 * searches per UTC calendar day. The number is also fixed in the database
 * (supabase/migrations/0008); keep the two in step.
 */
export const GUEST_SEARCH_LIMIT = 3;

export const SEARCH_QUERY_MAX_LENGTH = 100;

/** Sent to open pages so the counter updates after each search. */
export const SEARCH_ACCESS_EVENT = "akf:search-access";

export type GuestAccess = {
  type: "guest";
  /** False when the limit is not configured on this deployment; no counter is shown. */
  enforced: boolean;
  limit: number;
  used: number;
  remaining: number;
  /** ISO time of the next reset (the next UTC midnight). */
  reset_at: string | null;
};

export type SearchAccess = GuestAccess | { type: "authenticated" };

export type SearchErrorCode =
  | "GUEST_SEARCH_LIMIT_REACHED"
  | "GUEST_SEARCH_RATE_LIMITED"
  | "INVALID_REQUEST"
  | "SEARCH_UNAVAILABLE";
