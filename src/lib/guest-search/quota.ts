import "server-only";

import { GUEST_SEARCH_LIMIT, type GuestAccess } from "@/lib/guest-search/config";
import {
  ensureGuestHash,
  guestIdentityConfigured,
  readGuestHash,
  requestAddressHash,
} from "@/lib/guest-search/identity";
import { getServiceClient, serviceClientConfigured } from "@/lib/supabase/service";

/**
 * The limit runs only when both the cookie-signing secret and the server-only
 * database key are configured. Without them the Directory behaves as it did
 * before this feature (no limit), so a deployment that is missing them keeps
 * working. Once configured, any failure refuses the search rather than
 * letting the limit be bypassed.
 */
export const guestSearchLimitEnabled = guestIdentityConfigured && serviceClientConfigured;

type QuotaRow = {
  allowed?: boolean;
  code?: "GUEST_SEARCH_LIMIT_REACHED" | "GUEST_SEARCH_RATE_LIMITED" | null;
  limit: number;
  used: number;
  remaining: number;
  reset_at: string;
  replayed?: boolean;
};

export type ConsumeResult =
  | { ok: true; access: GuestAccess; replayed: boolean }
  | {
      ok: false;
      code: "GUEST_SEARCH_LIMIT_REACHED" | "GUEST_SEARCH_RATE_LIMITED";
      access: GuestAccess;
    };

const UNLIMITED: GuestAccess = {
  type: "guest",
  enforced: false,
  limit: GUEST_SEARCH_LIMIT,
  used: 0,
  remaining: GUEST_SEARCH_LIMIT,
  reset_at: null,
};

function toAccess(row: QuotaRow): GuestAccess {
  return {
    type: "guest",
    enforced: true,
    limit: row.limit,
    used: row.used,
    remaining: row.remaining,
    reset_at: new Date(row.reset_at).toISOString(),
  };
}

function isQuotaRow(value: unknown): value is QuotaRow {
  const row = value as QuotaRow | null;
  return (
    !!row &&
    typeof row.limit === "number" &&
    typeof row.used === "number" &&
    typeof row.remaining === "number" &&
    typeof row.reset_at === "string"
  );
}

/**
 * Uses one of the guest's searches for today, atomically in the database, or
 * reports that none are left. Throws if the quota service cannot be reached;
 * the caller must then refuse the search.
 */
export async function consumeGuestSearch(requestId: string): Promise<ConsumeResult> {
  if (!guestSearchLimitEnabled) return { ok: true, access: UNLIMITED, replayed: false };

  const [guestHash, addressHash] = await Promise.all([ensureGuestHash(), requestAddressHash()]);
  const { data, error } = await getServiceClient().rpc("consume_guest_search", {
    p_guest_hash: guestHash,
    p_request_id: requestId,
    p_ip_hash: addressHash,
  });
  if (error || !isQuotaRow(data) || typeof data.allowed !== "boolean")
    throw new Error("Guest quota is unavailable");

  const access = toAccess(data);
  if (data.allowed) return { ok: true, access, replayed: Boolean(data.replayed) };
  return {
    ok: false,
    code: data.code === "GUEST_SEARCH_RATE_LIMITED" ? data.code : "GUEST_SEARCH_LIMIT_REACHED",
    access,
  };
}

/** Today's usage for the counter. Uses nothing and creates no identity. */
export async function getGuestAccess(): Promise<GuestAccess> {
  if (!guestSearchLimitEnabled) return UNLIMITED;
  const guestHash = await readGuestHash();
  const { data, error } = await getServiceClient().rpc("guest_search_status", {
    // A visitor without a cookie has used nothing; the function handles null.
    p_guest_hash: guestHash,
  });
  if (error || !isQuotaRow(data)) throw new Error("Guest quota is unavailable");
  return toAccess(data);
}
