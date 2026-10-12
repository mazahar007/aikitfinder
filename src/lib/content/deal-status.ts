import type { Deal, DealStatus } from "@/lib/content/types";

/** An offer not re-checked for this many days is shown as "Needs verification". */
export const DEAL_STALE_AFTER_DAYS = 60;

export type DealView = Deal & { state: DealStatus };

function daysBetween(fromIso: string, toIso: string) {
  const ms = Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso.slice(0, 10)}T00:00:00Z`);
  return Math.floor(ms / 86_400_000);
}

/**
 * The status a visitor sees. Order matters:
 * 1. A known end date in the past always means "expired".
 * 2. Anything not verified, or not re-checked recently, is "needs verification",
 *    even if its dates look fine. We never call an unchecked offer active.
 * 3. Verified offers are "upcoming" before their start date, otherwise "active".
 *
 * `today` is an ISO date (YYYY-MM-DD) so the function stays pure and testable.
 */
export function dealStatus(deal: Deal, today: string): DealStatus {
  if (deal.endsOn && deal.endsOn < today) return "expired";
  const stale =
    !deal.lastVerifiedAt || daysBetween(deal.lastVerifiedAt, today) > DEAL_STALE_AFTER_DAYS;
  if (deal.verification !== "verified" || stale) return "needs-verification";
  if (deal.startsOn && deal.startsOn > today) return "upcoming";
  return "active";
}
