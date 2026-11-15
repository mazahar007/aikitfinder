import "server-only";

import { cache } from "react";

import { authStatus, type SessionUser } from "@/lib/auth/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The current signed-in user, or null.
 *
 * Every protected area asks this one function, so access rules live in one
 * place. The session token's signature is verified (not just read) before the
 * user is trusted. Data is additionally guarded by row level security in the
 * database, so a mistake here cannot expose another user's rows.
 *
 * Reads the request's cookies, so callers must sit inside a <Suspense>
 * boundary. Cached for the duration of one request.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!authStatus.enabled) return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub || claims.is_anonymous) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", claims.sub)
    .maybeSingle();

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : "",
    displayName: profile?.display_name ?? null,
  };
});
