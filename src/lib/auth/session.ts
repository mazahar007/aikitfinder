import { authStatus, type SessionUser } from "@/lib/auth/config";

/**
 * The current signed-in user, or null.
 *
 * Every protected area asks this one function, so access rules live in one
 * place. Until accounts are connected it always resolves to null; it never
 * returns a made-up user. Protected data must additionally be guarded by row
 * level security in the database (supabase/migrations/0006).
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  if (!authStatus.enabled) return null;
  return null;
}

/** Only same-site paths may be used as a return destination after sign-in (prevents open redirects). */
export function safeReturnPath(value: string | null | undefined, fallback = "/"): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\"))
    return fallback;
  return value;
}
