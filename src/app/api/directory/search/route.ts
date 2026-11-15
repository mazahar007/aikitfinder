import { NextResponse, type NextRequest } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { searchContent, searchGroupOrder, type SearchResult } from "@/lib/content/search";
import {
  SEARCH_QUERY_MAX_LENGTH,
  type SearchAccess,
  type SearchErrorCode,
} from "@/lib/guest-search/config";
import { recordSearchEvent } from "@/lib/guest-search/events";
import { consumeGuestSearch, getGuestAccess } from "@/lib/guest-search/quota";

/**
 * The Directory's main search.
 *
 *   POST /api/directory/search   { query, request_id }
 *     200  { query, results, access }
 *     400  { error: { code: "INVALID_REQUEST", message } }
 *     429  { error: { code: "GUEST_SEARCH_LIMIT_REACHED" | "GUEST_SEARCH_RATE_LIMITED", message }, access }
 *     503  { error: { code: "SEARCH_UNAVAILABLE", message } }
 *
 *   GET  /api/directory/search   → { access }   (for the counter; uses nothing)
 *
 * Signed-in users search without a limit. A visitor gets three searches per
 * UTC day; the fourth is refused here, before the search itself runs. Who is
 * signed in comes from the verified session cookie only: no user or guest
 * identifier is read from the request body, query string or headers.
 */

const MAX_BODY_BYTES = 2048;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "private, no-store" };

type PublicResult = Omit<SearchResult, "score">;

function fail(status: number, code: SearchErrorCode, message: string, access?: SearchAccess) {
  return NextResponse.json(
    { error: { code, message }, ...(access ? { access } : {}) },
    { status, headers: NO_STORE },
  );
}

/** Reads and validates the request. Returns a message describing the first problem found. */
async function parse(
  request: NextRequest,
): Promise<{ query: string; requestId: string } | { problem: string }> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
    return { problem: "Send the search as JSON." };
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) return { problem: "The request is too large." };

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { problem: "The request is not valid JSON." };
  }
  if (!body || typeof body !== "object" || Array.isArray(body))
    return { problem: "The request is not valid." };
  const { query, request_id: requestId } = body as Record<string, unknown>;

  if (typeof query !== "string") return { problem: "Enter something to search for." };
  // Collapse whitespace and drop control characters before measuring.
  const cleaned = query
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return { problem: "Enter something to search for." };
  if (cleaned.length > SEARCH_QUERY_MAX_LENGTH)
    return { problem: `Use ${SEARCH_QUERY_MAX_LENGTH} characters or fewer.` };
  if (typeof requestId !== "string" || !UUID.test(requestId))
    return { problem: "The request is missing a valid request_id." };

  return { query: cleaned, requestId: requestId.toLowerCase() };
}

export async function POST(request: NextRequest) {
  const input = await parse(request);
  // Rejected before anything runs, so it uses no search.
  if ("problem" in input) return fail(400, "INVALID_REQUEST", input.problem);

  let access: SearchAccess;
  try {
    const user = await getCurrentUser();
    if (user) {
      access = { type: "authenticated" };
      recordSearchEvent("authenticated_search");
    } else {
      const quota = await consumeGuestSearch(input.requestId);
      if (!quota.ok) {
        const limit = quota.code === "GUEST_SEARCH_LIMIT_REACHED";
        recordSearchEvent(limit ? "guest_search_limit_reached" : "guest_search_rate_limited");
        // The search itself is never run for a refused request.
        return fail(
          429,
          quota.code,
          limit
            ? "You've used all 3 free searches today."
            : "Too many searches from this network today. Create a free account to continue.",
          quota.access,
        );
      }
      access = quota.access;
      if (quota.access.enforced) recordSearchEvent("guest_search_allowed");
    }
  } catch {
    // The limit could not be checked. Refuse rather than let it be bypassed.
    recordSearchEvent("directory_search_unavailable");
    return fail(503, "SEARCH_UNAVAILABLE", "Search is temporarily unavailable. Try again shortly.");
  }

  const found = await searchContent(input.query);
  recordSearchEvent("directory_search_executed");
  const order = new Map(searchGroupOrder.map((g, i) => [g.type, i]));
  const results: PublicResult[] = found
    .map((r) => ({
      type: r.type,
      title: r.title,
      description: r.description,
      href: r.href,
      context: r.context,
      skillLevel: r.skillLevel,
      isSample: r.isSample,
    }))
    // Stable sort: keeps best-first order inside each type.
    .sort((a, b) => (order.get(a.type) ?? 0) - (order.get(b.type) ?? 0));

  return NextResponse.json({ query: input.query, results, access }, { headers: NO_STORE });
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    const access: SearchAccess = user ? { type: "authenticated" } : await getGuestAccess();
    return NextResponse.json({ access }, { headers: NO_STORE });
  } catch {
    return fail(503, "SEARCH_UNAVAILABLE", "Search is temporarily unavailable. Try again shortly.");
  }
}
